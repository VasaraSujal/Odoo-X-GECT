import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  DollarSign,
  Calendar,
  Settings,
  User,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAttendanceStatus } from "../../Redux/Slice.jsx";
import Header from "../../Components/Header";
import Sidebar from "../../Components/Sidebar";



const Dashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedRange, setSelectedRange] = useState("This Year");

  const handleBuddyPunching = () => {
    navigate('/emattendance'); // your route path
  };
  const handleManagerPOV = () => {
    navigate('/emprofile/:id'); // your route path
  };

  const user = useSelector((state) => state.auth.user);
  const attendanceStatus = useSelector((state) => state.auth.status);
  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
    }
  }, [user]);

  // ✅ Fetch status when `id` is set
  useEffect(() => {
    if (!userId) return;

    const fetchTodayStatus = async () => {
      try {
        const res = await axios.get(`https://attendance-and-payroll-management.onrender.com/api/attendance/${userId}`);
        console.log("id sent to api is ", userId);
        setStatus(res.data.status);
        dispatch(setAttendanceStatus(res.data.status));
        console.log("Attendance status updated in Redux:", res.data.status);
        console.log("Today's attendance status:", res.data.status);
      } catch (err) {
        console.error("Error fetching today's attendance", err);
      }
    };

    fetchTodayStatus();
  }, [userId]);



  const yearData = [
    { name: "Jan", Attendance: 24 },
    { name: "Feb", Attendance: 22 },
    { name: "Mar", Attendance: 18 },
    { name: "Apr", Attendance: 27 },
    { name: "May", Attendance: 30 },
    { name: "Jun", Attendance: 25 },
    { name: "Jul", Attendance: 29 },
    { name: "Aug", Attendance: 24 },
    { name: "Sep", Attendance: 26 },
    { name: "Oct", Attendance: 28 },
    { name: "Nov", Attendance: 23 },
    { name: "Dec", Attendance: 21 },
  ];

  const monthData = Array.from({ length: 31 }, (_, i) => ({
    name: `${i + 1}`,
    Attendance: Math.random() > 0.15 ? 1 : 0,
  }));


  const statusmanager = () => {
    if (attendanceStatus === "Present") {
      return "Present";
    } else if (attendanceStatus === "Late") {
      return "Late";
    } else if (attendanceStatus === "Late Absent") {
      return "Late Absent";
    } else {
      return "Absent";
    }
  }




  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex-1 h-[calc(100vh-64px)] overflow-y-auto p-6 space-y-6 bg-gray-50">
        {/* Page Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-xl font-semibold">Dashboard</h1>

          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={handleBuddyPunching}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm shadow hover:bg-indigo-700 transition"
            >
              + Buddy Punching
            </button>
            <button
              onClick={handleManagerPOV}
              className="border px-4 py-2 rounded-md text-sm shadow hover:bg-gray-50 transition"
            >
              Manager POV
            </button>

            {/* Today's Attendance Status */}
            <div
              className={`px-4 py-2 rounded-md text-sm font-medium shadow transition ${(attendanceStatus === 'Present' || attendanceStatus === 'Late')
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
                }`}
            >
              {statusmanager()}
            </div>
          </div>
        </div>


        {/* Welcome Message */}
        <div className="text-sm text-gray-700 bg-white p-4 rounded-md shadow">
          <span className="font-medium text-base">Good to see you, {user?.username}👋</span>
          <p className="mt-1 text-sm">You came 15 minutes early today.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Total leave allowance",
              value: "34",
              note: "Paid 11 | Unpaid 4",
            },
            {
              title: "Total leave taken",
              value: "20",
              valueColor: "text-red-600",
              note: "Paid 62 | Unpaid 76",
            },
            {
              title: "Total leave available",
              value: "87",
              valueColor: "text-green-600",
              note: "Paid 50 | Unpaid 51",
            },
            {
              title: "Leave request pending",
              value: "122",
              valueColor: "text-indigo-600",
              note: "Paid 60 | Unpaid 53",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-lg shadow flex flex-col gap-1"
            >
              <h4 className="text-xs text-gray-500">{item.title}</h4>
              <p className={`text-xl font-bold ${item.valueColor || ""}`}>
                {item.value}
              </p>
              <p className="text-xs text-gray-400">{item.note}</p>
            </div>
          ))}
        </div>

        {/* Announcements Table */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <h3 className="font-semibold text-lg mb-4 text-gray-800">Announcements</h3>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm rounded text-left text-gray-600">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Start Date</th>
                  <th className="px-4 py-3">End Date</th>
                  <th className="px-4 py-3">Description</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    title: "Scrum Master",
                    start: "Dec 4, 2019 21:42",
                    end: "Dec 7, 2019 23:26",
                    description: "Corrected item alignment",
                  },
                  {
                    title: "Software Tester",
                    start: "Dec 30, 2019 05:18",
                    end: "Feb 2, 2020 19:28",
                    description: "Embedded analytic scripts",
                  },
                  {
                    title: "Software Developer",
                    start: "Dec 30, 2019 07:52",
                    end: "Dec 4, 2019 21:42",
                    description: "High resolution imagery option",
                  },
                ].map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-b hover:bg-gray-50 transition duration-200"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">{item.title}</td>
                    <td className="px-4 py-3">{item.start}</td>
                    <td className="px-4 py-3">{item.end}</td>
                    <td className="px-4 py-3">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attendance Chart */}
        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Attendance Statistics</h3>
            <select
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
            >
              <option>This Year</option>
              <option>This Month</option>
            </select>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={selectedRange === "This Year" ? yearData : monthData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Attendance" fill="#7c3aed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
