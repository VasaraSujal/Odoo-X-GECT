import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  DollarSign,
  Calendar,
  Clock,
  Briefcase,
  AlertCircle
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAttendanceStatus } from "../../Redux/Slice.jsx";

const Dashboard = () => {
  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedRange, setSelectedRange] = useState("This Year");

  const handleBuddyPunching = () => navigate('/emattendance');
  const handleManagerPOV = () => navigate('/emprofile/:id');

  const user = useSelector((state) => state.auth.user);
  const attendanceStatus = useSelector((state) => state.auth.status);

  useEffect(() => {
    if (user?.id) setUserId(user.id);
  }, [user]);

  useEffect(() => {
    if (!userId) return;
    const fetchTodayStatus = async () => {
      try {
        const res = await axios.get(`https://attendance-and-payroll-management.onrender.com/api/attendance/${userId}`);
        setStatus(res.data.status);
        dispatch(setAttendanceStatus(res.data.status));
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

  const getStatusBadge = () => {
    const s = attendanceStatus || "Absent";
    if (s === "Present" || s === "Late") return "bg-green-100 text-green-700 ring-green-600/20";
    return "bg-red-100 text-red-700 ring-red-600/20";
  }

  const StatCard = ({ title, value, note, colorClass, icon: Icon }) => (
    <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border flex flex-col hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorClass.replace('text-', 'bg-').replace('600', '100')} bg-opacity-20`}>
          <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
        <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">View</span>
      </div>
      <div>
        <h4 className="text-sm font-medium text-text-sub mb-1">{title}</h4>
        <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
        <p className="text-xs text-gray-400 mt-2">{note}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-text-main mb-1">Dashboard</h1>
          <p className="text-text-sub">Good to see you, <span className="font-semibold text-primary">{user?.username}</span> 👋</p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <button onClick={handleBuddyPunching} className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-primary/20 transition-all active:scale-95">
            + Quick Action
          </button>
          <button onClick={handleManagerPOV} className="border border-border bg-white hover:bg-gray-50 text-text-main px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
            View Profile
          </button>

          <div className={`px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm ring-1 ${getStatusBadge()}`}>
            {attendanceStatus || "Absent"}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Leave Allowance" value="34" note="Paid 11 | Unpaid 4" colorClass="text-primary" icon={Briefcase} />
        <StatCard title="Leave Taken" value="20" note="Paid 62 | Unpaid 76" colorClass="text-red-600" icon={AlertCircle} />
        <StatCard title="Leave Available" value="87" note="Paid 50 | Unpaid 51" colorClass="text-green-600" icon={Calendar} />
        <StatCard title="Pending Requests" value="122" note="Paid 60 | Unpaid 53" colorClass="text-purple-600" icon={Clock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance Chart */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-2xl shadow-sm border border-border">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-lg text-text-main">Attendance Trends</h3>
            <select
              className="text-sm border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
            >
              <option>This Year</option>
              <option>This Month</option>
            </select>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={selectedRange === "This Year" ? yearData : monthData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: '#F3E8FF' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Bar dataKey="Attendance" fill="#6D28D9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Announcements */}
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border">
          <h3 className="font-bold text-lg text-text-main mb-6">Announcements</h3>
          <div className="space-y-4">
            {[
              { title: "Scrum Master", date: "Dec 4", desc: "Corrected item alignment", tag: "Tech" },
              { title: "Team Meeting", date: "Dec 30", desc: "Quarterly review session", tag: "General" },
              { title: "Holiday Party", date: "Dec 25", desc: "Annual celebration", tag: "Social" },
            ].map((item, idx) => (
              <div key={idx} className="group p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-text-main group-hover:text-primary transition-colors">{item.title}</h4>
                  <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{item.tag}</span>
                </div>
                <p className="text-sm text-gray-500 mb-2 line-clamp-1">{item.desc}</p>
                <div className="flex items-center text-xs text-gray-400 gap-1">
                  <Calendar size={12} />
                  <span>{item.date}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2.5 text-sm font-medium text-primary hover:bg-accent/50 rounded-xl transition-colors">
            View All Announcements
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
