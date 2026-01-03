import React, { useEffect, useState } from "react";
import { Users, UserCheck, UserX, Clock } from "lucide-react";

const Dashboard = () => {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await fetch("https://attendance-and-payroll-management.onrender.com/api/all-attendance");
        const data = await response.json();
        setEmployees(data.attendance || []);
      } catch (error) {
        console.error("❌ Error fetching attendance data:", error);
      }
    };

    fetchAttendance();
  }, []);

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-600";
    const s = status.toLowerCase();
    if (s.includes("present")) return "bg-green-50 text-green-700 ring-1 ring-green-600/20";
    if (s.includes("late")) return "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20";
    if (s.includes("absent")) return "bg-red-50 text-red-700 ring-1 ring-red-600/20";
    return "bg-gray-50 text-gray-700 ring-1 ring-gray-600/20";
  };

  const StatCard = ({ title, value, colorClass, icon: Icon }) => (
    <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border flex items-center justify-between hover:shadow-md transition-shadow duration-200">
      <div>
        <h3 className="text-sm font-medium text-text-sub mb-1">{title}</h3>
        <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${colorClass.replace('text-', 'bg-').replace('700', '100')} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${colorClass}`} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-text-main">Dashboard Overview</h1>
        <p className="text-sm text-text-sub">Welcome back, Admin</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Entries"
          value={employees.length}
          colorClass="text-primary"
          icon={Users}
        />
        <StatCard
          title="Present Today"
          value={employees.filter((e) => e.status?.toLowerCase().includes("present")).length}
          colorClass="text-green-600"
          icon={UserCheck}
        />
        <StatCard
          title="Late / Absent"
          value={employees.filter((e) => e.status?.toLowerCase().includes("late") || e.status?.toLowerCase().includes("absent")).length}
          colorClass="text-red-500"
          icon={UserX}
        />
      </div>

      {/* Attendance Table */}
      <div className="bg-surface shadow-sm border border-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-bold text-text-main">Recent Attendance</h2>
          <button className="text-sm text-primary font-medium hover:text-primary-hover transition-colors">View All</button>
        </div>

        {employees.length === 0 ? (
          <div className="p-8 text-center text-text-sub">No attendance records found today.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs uppercase font-semibold text-text-sub">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">User ID</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employees.map((emp, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-text-main">{emp.username}</td>
                    <td className="px-6 py-4 text-text-sub">{emp.user_id}</td>
                    <td className="px-6 py-4 text-text-sub">
                      <div className="flex flex-col">
                        <span className="font-medium">{new Date(emp.date).toLocaleDateString()}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(emp.time).toLocaleTimeString("en-US", {
                            timeZone: "UTC",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(emp.status)}`}>
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
