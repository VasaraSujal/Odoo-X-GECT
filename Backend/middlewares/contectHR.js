const mongoose = require("mongoose");

const hrRequestSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true },
    employeeName: { type: String, required: true },
    subject: { type: String, required: true },
    category: { type: String, enum: ["General Inquiry", "Payroll", "Leave", "Other"], default: "General Inquiry" },
    priority: { type: String, enum: ["Low", "Normal", "High"], default: "Normal" },
    message: { type: String, required: true },
    attachment: { type: String }, // Cloudinary/File URL later
    status: { type: String, enum: ["Pending", "In Progress", "Resolved"], default: "Pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HRRequest", hrRequestSchema);
