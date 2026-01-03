const express = require("express");
const {
  getTodayAttendance,
  markAttendance,
  getAllAttendance,
  getAllAttendanceByMonthofuser,
  registerFace
} = require("./attendance.controller");

const router = express.Router();

router.get("/attendance/:userId", getTodayAttendance);
router.post("/mark-attendance", markAttendance);
router.post("/register-face", registerFace);
router.get("/all-attendance", getAllAttendance);
router.get("/getAllAttendanceByMonthofuser/:userId/:month", getAllAttendanceByMonthofuser);

module.exports = router;
