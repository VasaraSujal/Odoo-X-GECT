const express = require('express');
const router = express.Router();
console.log("🛠️ Loading Leave Routes...");
const verifyToken = require('../../middlewares/authMiddleware');
const {
    applyLeave,
    getLeaveHistory,
    getAllLeaves,
    updateLeaveStatus,
    deleteLeave,
    updateLeave
} = require('./leaveController');

// Using verifyToken to protect routes, but adhering to user's URL structure
router.post('/apply-leave', verifyToken, applyLeave);
router.get('/my-leaves/:userId', verifyToken, getLeaveHistory);
router.get('/all-leaves', verifyToken, getAllLeaves); // Admin check can be added inside or middleware
router.put('/update-leave-status', verifyToken, updateLeaveStatus);
router.delete('/:id', verifyToken, deleteLeave); // Extra
router.put('/:id', verifyToken, updateLeave); // Extra

// Test Route
router.get('/leave-test', (req, res) => res.send("Leave Module Working"));

module.exports = router;
