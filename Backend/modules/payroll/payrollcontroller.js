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

  console.log("🔍 GenerateSlip called with:", { user_id, month });

  const user = await db.collection('SalaryInfo').findOne({ 
   employee_id :user_id });

  console.log("📊 SalaryInfo found:", user);

try {
  if (!user || !user.employee_name) {
    return res.status(400).json({ error: "Invalid user data - SalaryInfo not found for employee: " + user_id });
  }

  // ✅ Fetch REAL-TIME attendance for the specified month (including today)
  const attendance = await db.collection('Attendance').find({
    user_id,
    date: { $regex: `^${month}` }
  }).toArray();

  console.log("📅 Attendance records found:", attendance.length);

  const presentDays = attendance.filter(a => a.status === 'Present').length;
  const workingDays = 26;
  
  // ✅ Validate paid leaves - default to 2 if not set or invalid
  let paidLeaves = Number(user.paid_leaves_allowed);
  console.log("🎯 Raw paid_leaves_allowed:", user.paid_leaves_allowed, "→ Converted to:", paidLeaves);
  
  if (!Number.isFinite(paidLeaves) || paidLeaves < 0) {
    console.log("⚠️ Invalid paidLeaves, using default: 2");
    paidLeaves = 2;
  }
  
  const absentDays = Math.max(0, workingDays - presentDays);
  const unpaidLeaves = Math.max(0, absentDays - paidLeaves);

  console.log("📋 Attendance calc:", { presentDays, absentDays, paidLeaves, unpaidLeaves });

  // ✅ EARNINGS - Read from BOTH new (basic, hra, da...) and old (basic_salary) field names
  // Backward compatibility: if new fields don't exist, use basic_salary
  const basic = Number(user.basic) || Number(user.basic_salary) || 0;
  const hra = Number(user.hra) || 0;
  const da = Number(user.da) || 0;
  const pb = Number(user.pb) || 0;
  const lta = Number(user.lta) || 0;
  const fixed = Number(user.fixed) || 0;

  console.log("💰 Salary components:", { basic, hra, da, pb, lta, fixed });

  // ✅ GROSS SALARY = Sum of all allowances (GUARANTEED)
  const grossSalary = basic + hra + da + pb + lta + fixed;
  
  // ✅ DEDUCTIONS:
  
  // 1. PF - 12% of BASIC ONLY (standard in India)
  const pf = Math.round((basic * 12) / 100);
  
  // 2. Professional Tax - FIXED AMOUNT (not percentage)
  // Standard in India: ₹200/month for most states
  const professionaltax = (user.professionaltax && user.professionaltax > 0) ? Number(user.professionaltax) : 200;
  
  // 3. Leave Deduction - ONLY for unpaid leaves beyond entitlement
  // Formula: (Total Gross / 26 working days) × Unpaid Leave Days
  const dailyRate = grossSalary / workingDays;
  const leaveDeduction = Math.round(unpaidLeaves * dailyRate);
  
  console.log("💸 Deductions calc:", { pf, professionaltax, dailyRate, leaveDeduction });
  
  // ✅ TOTAL DEDUCTIONS
  const totalDeductions = pf + professionaltax + leaveDeduction;
  
  // ✅ NET SALARY = GROSS - ALL DEDUCTIONS
  const netSalary = Math.round(grossSalary - totalDeductions);
  
  console.log("✅ Final calculation:", { grossSalary, totalDeductions, netSalary });

  const payrollDoc = {
    employee_id: user_id,
    employee_name: user.employee_name,
    month,
    
    // ✅ NEW salary components (all earnings)
    basic,
    hra,
    da,
    pb,
    lta,
    fixed,
    gross_salary: Math.round(grossSalary),
    
    // ✅ Deductions breakdown
    pf,
    professionaltax,
    total_deductions: totalDeductions,
    
    // ✅ Net salary after all deductions
    net_salary: netSalary,
    
    // Legacy fields for backward compatibility
    basic_salary: basic,
    salary_breakdown: {
      gross_salary: Math.round(grossSalary),
      net_salary: netSalary
    },

    // ✅ REAL-TIME attendance summary (includes today)
    attendance_summary: {
      total_working_days: workingDays,
      present_days: presentDays,
      absent_days: absentDays,
      paid_leave_allowance: paidLeaves,
      unpaid_leave_days: unpaidLeaves
    },

    deductions: {
      pf_amount: pf,
      tax_amount: professionaltax,
      leave_deduction: leaveDeduction,
      total_deduction: totalDeductions
    },

    status: "Processed",
    generated_on: new Date().toISOString().slice(0, 10)
  };

  // ✅ Always generate fresh slip (don't use cached version) to include today's attendance
  // IMPORTANT: Delete old records first, then insert new ones
  const deleteResult = await db.collection('Payrolls').deleteMany({ 
    employee_id: user_id, 
    month: month 
  });
  console.log(`🗑️ Deleted ${deleteResult.deletedCount} old payroll records`);
  
  const insertResult = await db.collection('Payrolls').insertOne(payrollDoc);
  console.log('✅ Salary slip generated (Real-world industry standard):', payrollDoc);
  console.log('📝 Insert result:', insertResult);
  
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
    updated_by,
    // ✅ NEW FIELDS - Salary Components
    basic,
    da,
    pb,
    lta,
    fixed,
    pf,
    professionaltax,
    gross_salary,
    net_salary,
    total_deductions,
    status
  } = req.body;

  if (!employee_id) {
    return res.status(400).json({ message: "Employee ID is required." });
  }

  try {
    // Convert current time to IST
    const nowIST = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000);

    const updateFields = {
      // Old fields
      ...(employee_name && { employee_name }),
      ...(base_salary && { base_salary }),
      ...(hra !== undefined && { hra }),
      ...(bonus !== undefined && { bonus }),
      ...(tax_percent !== undefined && { tax_percent }),
      ...(pf_percent !== undefined && { pf_percent }),
      ...(joining_date && { joining_date }),
      // ✅ NEW fields
      ...(basic !== undefined && { basic }),
      ...(da !== undefined && { da }),
      ...(pb !== undefined && { pb }),
      ...(lta !== undefined && { lta }),
      ...(fixed !== undefined && { fixed }),
      ...(pf !== undefined && { pf }),
      ...(professionaltax !== undefined && { professionaltax }),
      ...(gross_salary !== undefined && { gross_salary }),
      ...(net_salary !== undefined && { net_salary }),
      ...(total_deductions !== undefined && { total_deductions }),
      ...(status && { status }),
      last_update: nowIST,
      ...(updated_by && { updated_by })
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