const { getDB } = require("../../config/db");
const transporter = require("../mail/mailtransporter");
const usersalarybyitsid = async(req,res) =>{
  const db=getDB();

  const {id}=req.params;
  console.log("id recieved is",id);
  try{
    const user=await db.collection('SalaryInfo').findOne(
      {employee_id:id}
    )
    if(!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  }
  catch(error){
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
const GenerateSlip = async (req, res) => {
  const db = getDB();
  const { user_id, month } = req.body;

  const user = await db.collection('SalaryInfo').findOne({ 
   employee_id :user_id });

try {
  if (!user || !user.employee_name) {
    return res.status(400).json({ error: "Invalid user data" });
  }

  const salaryslip = await db.collection('Payrolls').findOne({
    employee_id: user_id,
    month
  });

  if (salaryslip) {
    console.log('Saved salary slip fetched:', salaryslip);
    return res.json(salaryslip);
  }

  const attendance = await db.collection('Attendance').find({
    user_id,
    date: { $regex: `^${month}` }
  }).toArray();

  const presentDays = attendance.filter(a => a.status === 'Present').length;
  const basicSalary = user.base_salary;
  const workingDays = 26;
  const paidLeaves = user.paid_leaves_allowed;
  const absentDays = workingDays - presentDays;

  const tax = basicSalary * (user.tax_percent/100);
  const pf = basicSalary * (user.pf_percent/100);
  const unpaidLeaves = Math.max(0, absentDays - paidLeaves);
  const leaveDeduction = unpaidLeaves * (basicSalary / workingDays);
  const totalDeduction = tax + pf + leaveDeduction;
  const netSalary = basicSalary - totalDeduction;

  const payrollDoc = {
    employee_id: user_id,
    employee_name: user.employee_name,
    month,
    basic_salary: basicSalary,

    attendance_summary: {
      total_working_days: workingDays,
      present_days: presentDays,
      absent_days: absentDays,
      paid_leave_allowance: paidLeaves,
      unpaid_leave_days: unpaidLeaves
    },

    deductions: {
      tax_amount: tax,
      pf_amount: pf,
      leave_deduction: leaveDeduction,
      total_deduction: totalDeduction
    },

    salary_breakdown: {
      gross_salary: basicSalary,
      net_salary: netSalary
    },

    status: "Processed",
    generated_on: new Date().toISOString().slice(0, 10)
  };

  await db.collection('Payrolls').insertOne(payrollDoc);
  console.log('New salary slip generated:', payrollDoc);
  return res.json(payrollDoc);

} catch (error) {
  console.error("Salary generation error:", error);
  return res.status(500).json({ error: error.message });
}

};

const Addsalaryinfo = async (req, res) => {
  const db = getDB();
  const {
    employee_id,
    employee_name,
    base_salary,
    hra,
    bonus,
    tax_percent,
    pf_percent,
    joining_date,
    updated_by
  } = req.body;

  // 1. Basic validation
  if (!employee_id || !employee_name || !base_salary || !joining_date || !updated_by) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    // 2. Check if salary info already exists
    const existing = await db.collection('SalaryInfo').findOne({ employee_id });
    if (existing) {
      return res.status(409).json({ message: "Salary info already exists for this employee." });
    }

    // 3. Current IST timestamp
    const nowIST = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000);

    // 4. Insert new record
    const result = await db.collection('SalaryInfo').insertOne({
      employee_id,
      employee_name,
      base_salary,
      hra,
      bonus,
      tax_percent,
      pf_percent,
      joining_date,
      last_update: nowIST,
      updated_by
    });

    return res.status(201).json({
      message: "Salary info added successfully.",
      insertedId: result.insertedId
    });

  } catch (error) {
    console.error("Error adding salary info:", error);
    return res.status(500).json({ message: "Server error while adding salary info." });
  }
};


const Updatesalaryinfo = async (req, res) => {
  const db = getDB();

  const {
    employee_id,
    employee_name,
    base_salary,
    hra,
    bonus,
    tax_percent,
    pf_percent,
    joining_date,
    updated_by
  } = req.body;

  if (!employee_id) {
    return res.status(400).json({ message: "Employee ID is required." });
  }

  try {
    // Convert current time to IST
    const nowIST = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000);

    const updateFields = {
      employee_name,
      base_salary,
      hra,
      bonus,
      tax_percent,
      pf_percent,
      joining_date,
      last_update: nowIST,
      updated_by
    };
    
    const olddata= await db.collection('SalaryInfo').findOne({ employee_id });
    const user= await db.collection('users').findOne({ user_id: employee_id });
    console.log("Old data:", olddata);

    const compareFields = Object.keys(updateFields).reduce((acc, key) => {
      if (updateFields[key] !== olddata[key]) {
        acc[key] = { old: olddata[key], new: updateFields[key] };
      }
      return acc;
    }, {});
    if (Object.keys(compareFields).length === 0) {
      return res.status(400).json({ message: "No fields to update or no changes made." });
    }

    console.log("Updated fields:", compareFields);

    const result = await db.collection('SalaryInfo').updateOne(
      { employee_id },
      { $set: updateFields }
    );

    const changedFieldsList = Object.keys(compareFields)
    .map(key => key.replace(/_/g, ' ').toUpperCase())
    .join(', '); 

    const changesTable = Object.entries(compareFields).map(([key, value]) => {
     return `
     <tr>
      <td><strong>${key.replace(/_/g, ' ').toUpperCase()}</strong></td>
      <td>${value.old ?? "N/A"}</td>
      <td>${value.new ?? "N/A"}</td>
    </tr>
     `;
     }).join('');

  await transporter.sendMail({
  from: `"Payroll App" <${process.env.SMTP_EMAILL}>`,
  to: user.email,
  subject: "Salary Update Notification",
  html: `
    <p>Dear <strong>${olddata.employee_name}</strong>,</p>

    <p>This is to inform you that the following fields were updated in your salary record on ${new Date().toLocaleDateString()}:</p>
    <p><strong>${changedFieldsList}</strong></p>

    <p>Please find the detailed breakdown below:</p>

    <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse;">
      <tr style="background-color: #f0f0f0;">
        <th>Field</th>
        <th>Old Value</th>
        <th>New Value</th>
      </tr>
      ${changesTable}
    </table>

    <p>If you believe any of the above information is incorrect, please contact the HR team at <a href="mailto:${process.env.SMTP_EMAIL}">${process.env.SMTP_EMAIL}</a>.</p>

    <p>Thank you!</p>
    <p>Best regards,<br>The HR Team</p>
  `,
});



    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Employee not found." });
    }

    res.status(200).json({
      message: "Salary info updated successfully",
      updatedFields: updateFields,
      result
    });

  } catch (error) {
    console.error("Error updating salary info:", error);
    res.status(500).json({ message: "Server error while updating salary info." });
  }
};


module.exports= {GenerateSlip,Addsalaryinfo,Updatesalaryinfo,usersalarybyitsid};