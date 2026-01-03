import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
} from 'recharts';
import { CalendarDays, Check, Fingerprint, MapPin, X } from 'lucide-react';

const Attendance = () => {
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState('');
  const [id, setId] = useState('');
  const [toast, setToast] = useState({ message: '', type: '' });
  const [selectedMonth, setSelectedMonth] = useState('2025-06');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = useSelector((state) => state.auth.user);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 4000);
  };

  const handleAttendance = () => {
    if (!username.trim()) return showToast("❗ Please enter your username.", "error");
    if (!id.trim()) return showToast("❗ Please enter your id.", "error");
    if (username !== user.username || id !== user.id) {
      return showToast("❗ User ID or Username does not match the logged in user.", "error");
    }

    showToast("📍 Getting your location...", "loading");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        try {
          const res = await fetch("https://attendance-and-payroll-management.onrender.com/api/mark-attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, location, id }),
          });

          const data = await res.json();

          if (res.ok) {
            showToast(data.message || "✅ Attendance marked successfully.", "success");
            setUsername("");
            setShowModal(false);
          } else {
            showToast(data.message || "❌ Failed to mark attendance.", "error");
          }
        } catch (err) {
          console.error(err);
          showToast("❌ Server error. Please try again later.", "error");
        }
      },
      () => showToast("❌ Location access denied.", "error")
    );
  };

  useEffect(() => {
    const fetchAttendanceData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://attendance-and-payroll-management.onrender.com/api/getAllAttendanceByMonthofuser/${user.id}/${selectedMonth}`);
        const attendanceRecords = await res.json();

        const presentDates = new Set(attendanceRecords.map(att => att.date));
        const [year, month] = selectedMonth.split("-");
        const daysInMonth = new Date(Number(year), Number(month), 0).getDate();

        const data = Array.from({ length: daysInMonth }, (_, i) => {
          const day = String(i + 1).padStart(2, '0');
          const dateKey = `${selectedMonth}-${day}`;
          return {
            name: `${i + 1}`,
            Attendance: presentDates.has(dateKey) ? 1 : 0,
          };
        });

        setChartData(data);
      } catch (error) {
        console.error("Error loading chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchAttendanceData();
  }, [selectedMonth, user?.id]);

  return (
    <div className="space-y-6">
      <div className='flex justify-between items-center'>
        <div>
          <h1 className="text-2xl font-bold text-text-main">Attendance</h1>
          <p className="text-text-sub text-sm">Manage and view your attendance records.</p>
        </div>
      </div>

      {/* Biometric Card */}
      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
        <div className="p-8 flex flex-col items-center justify-center text-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-150 animate-pulse"></div>
            <Fingerprint size={100} className="text-primary relative z-10" strokeWidth={1} />
          </div>

          <div className="max-w-md space-y-2">
            <h2 className="text-xl font-bold text-text-main">Mark Today's Attendance</h2>
            <p className="text-text-sub">Please utilize the biometric authentication system below to securely log your attendance for the day.</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/25 hover:bg-primary-hover hover:shadow-primary/40 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
          >
            <Fingerprint size={20} />
            Authenticate Record
          </button>
        </div>
      </div>

      {/* Attendance Statistics */}
      <div className="bg-surface rounded-2xl shadow-sm border border-border p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
            <CalendarDays size={20} className='text-gray-400' />
            Attendance History
          </h2>
          <div className="relative">
            <select
              className="appearance-none bg-gray-50 border border-border text-text-main text-sm rounded-xl px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-gray-300 transition-colors cursor-pointer"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="2025-06">June 2025</option>
              <option value="2025-05">May 2025</option>
              <option value="2025-04">April 2025</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {loading ? (
          <div className='h-[300px] flex items-center justify-center text-gray-400'>Loading chart data...</div>
        ) : (
          <div className='h-[300px] w-full'>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={0} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  dy={10}
                />
                <YAxis
                  hide
                  ticks={[0, 1, 2]}
                  domain={[0, 1.2]}
                />
                <Tooltip
                  cursor={{ fill: '#F9FAFB' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value) => [value === 1 ? <span className='text-green-600 font-bold'>Present</span> : <span className='text-red-500 font-bold'>Absent</span>, "Status"]}
                />
                <Legend
                  verticalAlign='top'
                  align='right'
                  iconType='circle'
                  wrapperStyle={{ paddingBottom: '20px', fontSize: '12px' }}
                />
                <Bar dataKey="Attendance" radius={[4, 4, 4, 4]} name="Attendance Record">
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.Attendance === 1 ? "#10b981" : "#F3F4F6"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-surface w-full max-w-md rounded-3xl shadow-2xl p-6 relative scale-100 transition-transform">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center mb-6">
              <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary'>
                <MapPin size={32} />
              </div>
              <h2 className="text-2xl font-bold text-text-main text-center">Verify Identity</h2>
              <p className='text-text-sub text-center text-sm px-4'>Enter your credentials to confirm your identity and capture your current location.</p>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block text-xs font-bold text-text-sub uppercase mb-1 ml-1'>Employee ID</label>
                <input
                  type="text"
                  placeholder="e.g. EMP-1234"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                />
              </div>
              <div>
                <label className='block text-xs font-bold text-text-sub uppercase mb-1 ml-1'>Username</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                />
              </div>
            </div>

            <button
              onClick={handleAttendance}
              className="w-full mt-8 py-3.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Confirm & Mark Attendance
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.message && (
        <div className={`fixed top-6 right-6 px-6 py-4 rounded-xl shadow-xl text-white font-medium z-50 flex items-center gap-3 animate-slideIn
          ${toast.type === 'success' ? 'bg-green-600' :
            toast.type === 'error' ? 'bg-red-500' : 'bg-primary'}`}
        >
          {toast.type === 'loading' && <div className='w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin'></div>}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Attendance;
