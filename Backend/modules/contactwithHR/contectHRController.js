const HRRequest = require("../../middlewares/contectHR");

// 📌 Create new HR request
exports.createRequest = async (req, res) => {
  try {
    const { employeeId, employeeName, subject, category, priority, message, attachment } = req.body;

    const newRequest = new HRRequest({
      employeeId,
      employeeName,
      subject,
      category,
      priority,
      message,
      attachment,
    });

    await newRequest.save();
    res.status(201).json({ success: true, message: "HR request submitted successfully", request: newRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating request", error: error.message });
  }
};

// 📌 Get all HR requests
exports.getRequests = async (req, res) => {
  try {
    const requests = await HRRequest.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching requests", error: error.message });
  }
};

// 📌 Get single HR request by ID
exports.getRequestById = async (req, res) => {
  try {
    const request = await HRRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });
    res.status(200).json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching request", error: error.message });
  }
};
