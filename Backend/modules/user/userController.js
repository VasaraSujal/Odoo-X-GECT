const { getDB } = require('../../config/db');
const { ObjectId } = require('mongodb');
const jwt = require("jsonwebtoken");
const transporter = require("../mail/mailtransporter");

const getProfile = async (req, res) => {
  const db = getDB();

  if (!req.user || !req.user.userId)
    return res.status(400).json({ message: 'Invalid user' });

  const user = await db.collection('users').findOne(
    { _id: new ObjectId(req.user.user_id) },
    { projection: { password: 0 } }
  );

  if (!user) return res.status(404).json({ message: 'User not found' });

  res.json({ user });
};

const updateProfile = async (req, res) => {
  const db = getDB();
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: 'Invalid user' });

  const {
    username,
    email,
    mobile,
    address,
    bankAccount,
    gender,
    IFSC,
    emergencyContact,
    emergencyContactname,
    // ✅ NEW FIELDS - Salary information
    wage,
    salary_components,
    updated_by
  } = req.body;
  
  // Dynamically construct update fields
  const updateFields = {};

  if (username !== undefined) updateFields.username = username;
  if (email !== undefined) updateFields.email = email;
  if (mobile !== undefined) updateFields.mobile = mobile;
  if (address !== undefined) updateFields.address = address;
  if (bankAccount !== undefined) updateFields.bankAccount = bankAccount;
  if (gender !== undefined) updateFields.gender = gender;
  if (IFSC !== undefined) updateFields.IFSC = IFSC;
  if (emergencyContact !== undefined) updateFields.emergencyContact = emergencyContact;
  if (emergencyContactname !== undefined) updateFields.emergencyContactname = emergencyContactname;
  // ✅ Add salary fields
  if (wage !== undefined && wage > 0) updateFields.wage = parseFloat(wage);
  if (salary_components !== undefined) updateFields.salary_components = salary_components;

  try {
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    // Update user document
    const userResult = await db.collection('users').updateOne(
      { user_id: userId },
      { $set: updateFields }
    );
    
    if (userResult.modifiedCount === 0) {
      return res.status(404).json({ message: 'User not found or no changes made' });
    }

    // ✅ Auto-update SalaryInfo collection if salary components are provided
    if (wage && parseFloat(wage) > 0 && salary_components && Object.keys(salary_components).length > 0) {
      const nowIST = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000);
      
      const salaryUpdateFields = {
        base_salary: parseFloat(wage),
        basic: salary_components.basic || 0,
        hra: salary_components.hra || 0,
        da: salary_components.da || 0,
        pb: salary_components.pb || 0,
        lta: salary_components.lta || 0,
        fixed: salary_components.fixed || 0,
        pf: Math.abs(salary_components.pf || 0),
        professionaltax: Math.abs(salary_components.professionaltax || 0),
        gross_salary: salary_components.totalGross || 0,
        net_salary: salary_components.netSalary || 0,
        total_deductions: salary_components.totalDeductions || 0,
        last_update: nowIST,
        updated_by: updated_by || "User Update"
      };

      await db.collection('SalaryInfo').updateOne(
        { employee_id: userId },
        { $set: salaryUpdateFields },
        { upsert: true } // Create if doesn't exist
      );
      
      console.log(`✅ SalaryInfo updated/created for employee: ${userId}`);
    }

    res.json({ 
      message: 'Profile and salary information updated successfully',
      updated: Object.keys(updateFields)
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const addUser = async (req, res) => {
  try {
    const db = getDB();
    const {
      name,
      gender,
      id,
      joigningDate,
      designation,
      address,
      bankAccount,
      mobile,
      email,
      role,
      salary,
      wage,
      salary_components,
      employmentType,
      attendanceType,
      emergencyContact,
      emergencyContactname,
      IFSC,
    } = req.body;

    // ✅ Required Fields Check
    if (!name || !id || !email || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ NEW: Wage and salary components validation
    // Only require salary_components if wage is provided
    if (wage && parseFloat(wage) > 0) {
      if (!salary_components || typeof salary_components !== 'object' || Object.keys(salary_components).length === 0) {
        console.error("Validation Error: Wage provided but salary_components missing or invalid", { wage, salary_components });
        return res.status(400).json({ 
          message: "Salary components not calculated. Please ensure wage is entered and preview appears." 
        });
      }
    }
    
    // Ensure salary_components is always an object
    const finalSalaryComponents = salary_components && typeof salary_components === 'object' ? salary_components : {};

    // ✅ Check for duplicate email or ID
    const existingUser = await db.collection("users").findOne({
      $or: [{ email }, { user_id: id }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ Generate token for setting password (valid for 1 hour)
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // ✅ Insert user with null password initially
    const result = await db.collection("users").insertOne({
      username: name,
      user_id: id,
      gender,
      joigningDate,
      designation,
      address,
      bankAccount,
      mobile,
      email,
      role,
      salary: salary || null,
      wage: wage ? parseFloat(wage) : null,
      salary_components: finalSalaryComponents,
      employmentType,
      attendanceType,
      emergencyContact,
      emergencyContactname,
      IFSC,
      password: null,
      passwordSetToken: token,
      tokenExpiry: new Date(new Date().getTime() + 6.5 * 60 * 60 * 1000), // 6.5 hours
    });

    // ✅ Send welcome mail
    const setPasswordLink = `${process.env.FRONTEND_URL}/${id}/set-password?token=${token}`;

    let salaryBreakdownHTML = '';
    if (salary_components && Object.keys(salary_components).length > 0) {
      salaryBreakdownHTML = `
        <h3 style="color: #2c3e50; margin-top: 20px;">💰 SALARY BREAKDOWN:</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
          <tr style="background-color: #e8f4f8;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Component</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>Amount (₹)</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">Monthly Wage</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>${salary_components.totalGross || wage || 0}</strong></td>
          </tr>
          <tr style="background-color: #f0f0f0;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>ALLOWANCES:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;"></td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">• Basic Salary</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${salary_components.basic || 0}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">• HRA</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${salary_components.hra || 0}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">• DA</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${salary_components.da || 0}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">• PB</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${salary_components.pb || 0}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">• LTA</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${salary_components.lta || 0}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">• Fixed</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${salary_components.fixed || 0}</td>
          </tr>
          <tr style="background-color: #f0f0f0;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Gross Salary</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>₹${salary_components.totalGross || 0}</strong></td>
          </tr>
          <tr style="background-color: #ffe8e8;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>DEDUCTIONS:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;"></td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">• PF (12%)</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">-₹${Math.abs(salary_components.pf || 0)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">• Professional Tax</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">-₹${Math.abs(salary_components.professionaltax || 0)}</td>
          </tr>
          <tr style="background-color: #ffe8e8;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Total Deductions</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>-₹${salary_components.totalDeductions || 0}</strong></td>
          </tr>
          <tr style="background-color: #e8f8e8;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>NET SALARY</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong style="color: green; font-size: 16px;">₹${salary_components.netSalary || 0}</strong></td>
          </tr>
        </table>
      `;
    }

    await transporter.sendMail({
      from: `"Payroll App" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Welcome to the Team – Set Your Password",
      html: `
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your HR has created an account for you in the Payroll system.</p>
        <p>Click the link below to set your password (valid for 1 hour):</p>
        <a href="${setPasswordLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Set Password</a>
        <br><br>
        <h3 style="color: #2c3e50;">📋 YOUR PERSONAL DETAILS:</h3>
        <ul style="line-height: 1.8;">
          <li><strong>User ID:</strong> ${id}</li>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Phone:</strong> ${mobile}</li>
          <li><strong>Designation:</strong> ${designation}</li>
          <li><strong>Employment Type:</strong> ${employmentType}</li>
          <li><strong>Joining Date:</strong> ${joigningDate}</li>
          <li><strong>Bank Account:</strong> ${bankAccount}</li>
          <li><strong>IFSC:</strong> ${IFSC}</li>
          <li><strong>Emergency Contact:</strong> ${emergencyContact}</li>
          <li><strong>Emergency Contact Name:</strong> ${emergencyContactname}</li>
        </ul>
        ${salaryBreakdownHTML}
        <br><br>
        <p style="color: #666;">If any of these details are incorrect, please contact the HR team at ${process.env.HR_EMAIL}</p>
        <p style="color: #666;">Thank you for joining us!</p>
        <p style="color: #666;">Best regards,<br>HR Team</p>
      `,
    });

    // ✅ AUTO-CREATE SALARY INFO IF WAGE PROVIDED
    if (wage && parseFloat(wage) > 0 && finalSalaryComponents && Object.keys(finalSalaryComponents).length > 0) {
      try {
        const nowIST = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000);
        
        await db.collection('SalaryInfo').insertOne({
          employee_id: id,
          employee_name: name,
          base_salary: parseFloat(wage),
          basic: finalSalaryComponents.basic || 0,
          hra: finalSalaryComponents.hra || 0,
          da: finalSalaryComponents.da || 0,
          pb: finalSalaryComponents.pb || 0,
          lta: finalSalaryComponents.lta || 0,
          fixed: finalSalaryComponents.fixed || 0,
          pf: Math.abs(finalSalaryComponents.pf || 0),
          professionaltax: Math.abs(finalSalaryComponents.professionaltax || 0),
          gross_salary: finalSalaryComponents.totalGross || 0,
          net_salary: finalSalaryComponents.netSalary || 0,
          total_deductions: finalSalaryComponents.totalDeductions || 0,
          joining_date: joigningDate || new Date().toISOString().split('T')[0],
          last_update: nowIST,
          updated_by: "System - Employee Onboarding",
          status: "Active",
          created_at: nowIST
        });
        
        console.log(`✅ Salary info auto-created for employee: ${id}`);
      } catch (salaryError) {
        console.error("⚠️ Warning: Could not auto-create salary info:", salaryError);
        // Don't fail the user creation if salary info creation fails
      }
    }

    // ✅ Final Response
    res.status(201).json({
      message: "User created & welcome email sent. Salary structure auto-configured.",
      userId: result.insertedId,
    });
  } catch (error) {
  console.error("❌ Error adding user:", error); // <- This will log the exact problem
  res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const alluser = async (req,res)=>{
  const db = getDB();
  try{
    const users = await db.collection('users').find().project({ password: 0 }).toArray();
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }
    res.status(200).json({message:"User fetched sucessfully", users});
    

  }catch(error){
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

const userByitsId = async (req,res)=>{
  const db=getDB();

  const {userid}=req.params;
  console.log("id recieved is",req.params);
  try{
    const user=await db.collection('users').findOne(
      {user_id:userid},
      {projection: { password: 0 } }
    )
    if(!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User fetched successfully', user });
  }
  catch(error){
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}


module.exports = { getProfile, addUser, alluser,userByitsId,updateProfile};