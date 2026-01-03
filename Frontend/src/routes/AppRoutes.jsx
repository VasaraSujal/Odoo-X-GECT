import React from "react";
import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";

// Layouts
import HrLayoutDashboard from "../Components/Layout/HRLayout";
import EmployeeLayoutDashboard from "../Components/Layout/EmployeLayout";

// Auth Pages
import Login from "../Pages/Login/Login";

// HR Pages
import HRDashboard from "../Pages/Admin/HrDashboard";
import Employees from "../Pages/Admin/Employees";
import AddEmployee from "../Pages/Admin/AddEmployee";
import PayrollSystem from "../Pages/Admin/Payrollsystem";
import HRCalendar from "../Pages/Admin/HRCalendar";
import EmployeeDashboard from '../Pages/Admin/EmployeePage'
import PayrollPage from "../Pages/Admin/PayrollPage";
import Hrprofile from "../Pages/Admin/HrProfile";
import Query from "../Pages/Admin/Query";

// Employee Pages
import Dashboard from "../Pages/Employee/EmployeeHome";
import Attendance from "../Pages/Employee/Attendance";
import Salary from "../Pages/Employee/Salary";
import Calendar from "../Pages/Employee/Calendar";
import AttendanceNew from "../Components/attendance";
import Emprofile from "../Pages/Employee/Emprofile";
import SetPassword from "../Pages/Employee/Email";
import Chatbot from "../Pages/Employee/Chat";
// Common / Temp
import Add from "../Pages/Add";

//Not Found Page
import NotFound from '../Components/NotFound'
// import SettingsPage from "../Pages/Employee/SettingsPage";
import Contect from "../Pages/Employee/Contect";
import Leave from "../Pages/Employee/Leave";
import LeaveRequests from "../Pages/Admin/LeaveRequests";

const AppRoutes = () => {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const role = user?.role?.toLowerCase();
  const isAuthenticated = !!token;

  return (
    <Routes>
      <Route path="/" element={<Login />} />

      {/* Employee Routes */}
      {isAuthenticated && role === "employee" && (
        <Route path="/" element={<EmployeeLayoutDashboard />}>
          <Route path="emhome" element={<Dashboard />} />
          <Route path="emattendance" element={<Attendance />} />
          <Route path="emsalary" element={<Salary />} />
          <Route path="emcalendar" element={<Calendar />} />
          <Route path="attendance" element={<AttendanceNew />} />
          <Route path="emprofile/:id" element={<Emprofile />} />
          <Route path="emchat" element={<Chatbot />} />
          <Route path="emcontect" element={<Contect />} />
          <Route path="emleave" element={<Leave />} />
        </Route>
      )}

      {/* HR Routes */}
      {isAuthenticated && role === "hr" && (
        <Route path="/" element={<HrLayoutDashboard />}>
          <Route path="hrhome" element={<HRDashboard />} />
          <Route path="hremployees" element={<Employees />} />
          <Route path="hraddemployee" element={<AddEmployee />} />
          <Route path="hrpayrollsystem" element={<PayrollSystem />} />
          <Route path="hrcalendar" element={<HRCalendar />} />
          <Route path="hremployees/profile/:id" element={<EmployeeDashboard />} />
          <Route path="payrollsystem/profile/:id" element={<PayrollPage />} />
          <Route path="hrprofile/:id" element={<Hrprofile />} />
          <Route path="hrquery" element={<Query />} />
          <Route path="hrleaverequests" element={<LeaveRequests />} />
        </Route>
      )}
      <Route path="/:id/set-password" element={<SetPassword />} />
      {/* Common/Fallback Route */}
      <Route path="/add" element={<Add />} />
      {/* Optional 404 Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;