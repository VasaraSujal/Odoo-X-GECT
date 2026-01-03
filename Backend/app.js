const express = require('express');
// Trigger restart for new routes (Plan B)
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./modules/auth/authRoutes');
const userRoutes = require('./modules/user/userRoutes');
const attendanceRoutes = require("./modules/attendanceCopy/attendance.routes");
const payrollroutes = require('./modules/payroll/payrollroutes');
const calendar = require('./modules/calendar/holidayRoutes');
const mailroutes = require('./modules/mail/mailroutes');
const cloudinaryroutes = require('./modules/cloudinary/cloudinaryroutes');
const leaveRoutes = require('./modules/leave/leaveRoutes');
const app = express();

// ✅ Configure CORS for React frontend
app.use(cors());

//  Body parser & cookies
app.use(express.json());
app.use(cookieParser());

// ✅ Request logger (good for debugging)
app.use((req, res, next) => {
  console.log(`[📥 ${new Date().toLocaleString()}] ${req.method} ${req.url}`);
  next();
});

// ✅ Mount API routes
// ✅ Mount API routes
app.use('/api', leaveRoutes);
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', attendanceRoutes);
app.use('/api', payrollroutes);
app.use('/api', calendar);
app.use('/api', mailroutes);
app.use('/api', cloudinaryroutes);

module.exports = app;
