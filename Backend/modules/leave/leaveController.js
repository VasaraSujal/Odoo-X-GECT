const { getDB } = require("../../config/db");
const { ObjectId } = require("mongodb");
const transporter = require("../mail/mailtransporter");

// POST /apply-leave
const applyLeave = async (req, res) => {
  try {
    const db = getDB();
    // Support both req.body (from guide) and req.user (from token)
    let { user_id, user_name, leaveType, startDate, endDate, reason } = req.body;

    // Fallback to token data if not in body
    if (!user_id && req.user) user_id = req.user.user_id;
    if (!user_name && req.user) user_name = req.user.username;

    if (!user_id || !leaveType || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Date Validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start < today) {
      return res.status(400).json({ message: "Cannot apply for leave in the past." });
    }

    if (end < start) {
      return res.status(400).json({ message: "End date cannot be before start date." });
    }

    const leaveRequest = {
      user_id,
      user_name: user_name || "Employee",
      leaveType, // 'Paid', 'Sick', 'Unpaid'
      startDate: start,
      endDate: end,
      reason,
      status: "Pending", // Pending, Approved, Rejected
      appliedAt: new Date(),
    };

    const result = await db.collection("LeaveRequests").insertOne(leaveRequest);
    console.log("✅ Leave Applied:", result.insertedId);
    res.status(201).json({ message: "Leave application submitted successfully", id: result.insertedId });
  } catch (error) {
    console.error("❌ Error applying for leave:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET /my-leaves/:userId
const getLeaveHistory = async (req, res) => {
  try {
    const db = getDB();
    const { userId } = req.params;
    const leaves = await db.collection("LeaveRequests")
      .find({ user_id: userId })
      .sort({ appliedAt: -1 })
      .toArray();
    res.status(200).json(leaves);
  } catch (error) {
    console.error("❌ Error fetching history:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET /all-leaves (Admin)
const getAllLeaves = async (req, res) => {
  try {
    const db = getDB();
    const leaves = await db.collection("LeaveRequests").find({}).sort({ appliedAt: -1 }).toArray();
    res.status(200).json(leaves);
  } catch (error) {
    console.error("❌ Error fetching all leaves:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// PUT /update-leave-status (Admin)
const updateLeaveStatus = async (req, res) => {
  try {
    const db = getDB();
    const { id, status, adminComment } = req.body;

    if (!id || !["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid Request" });
    }

    const result = await db.collection("LeaveRequests").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, adminComment, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) return res.status(404).json({ message: "Not found" });

    // Email Notification
    const leave = await db.collection("LeaveRequests").findOne({ _id: new ObjectId(id) });
    if (leave) {
      // Find user email if possible (by user_id)
      const user = await db.collection("users").findOne({ user_id: leave.user_id });
      if (user && user.email) {
        const color = status === "Approved" ? "#28a745" : "#dc3545";
        await transporter.sendMail({
          from: `"HR System" <${process.env.SMTP_EMAIL}>`,
          to: user.email,
          subject: `Leave Request ${status}`,
          html: `<h2 style="color:${color}">Your leave has been ${status}</h2><p>Reason: ${leave.reason}</p>`
        });
      }
    }

    res.status(200).json({ message: `Leave request ${status}` });
  } catch (error) {
    console.error("❌ Error updating status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Route (Extra, kept for convenience)
const deleteLeave = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    await db.collection("LeaveRequests").deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};

const updateLeave = async (req, res) => {
  // Basic update logic matching new structure
  try {
    const db = getDB();
    const { id } = req.params;
    const { startDate, endDate, reason, leaveType } = req.body;
    await db.collection("LeaveRequests").updateOne(
      { _id: new ObjectId(id) },
      { $set: { startDate: new Date(startDate), endDate: new Date(endDate), reason, leaveType } }
    );
    res.status(200).json({ message: "Updated" });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
}


module.exports = {
  applyLeave,
  getLeaveHistory,
  getAllLeaves,
  updateLeaveStatus,
  deleteLeave,
  updateLeave
};
