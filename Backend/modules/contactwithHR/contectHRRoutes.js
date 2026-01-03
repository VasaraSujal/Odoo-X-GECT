const express = require("express");
const router = express.Router();
const { createRequest, getRequests, getRequestById } = require("./contectHRController");

// Employee submits request
router.post("/", createRequest);

// HR gets all requests
router.get("/", getRequests);

// HR gets single request
router.get("/:id", getRequestById);

module.exports = router;
