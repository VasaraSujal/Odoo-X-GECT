import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { cacheUser } from '../../Redux/Slice';
import {
  User, Mail, Phone, MapPin, Building2,
  Briefcase, CreditCard, Calendar, DollarSign,
  Clock, Globe, Lock, Edit2, Camera, Save, X,
  AlertCircle, CheckCircle
} from 'lucide-react';
import "chart.js/auto";

const Emprofile = () => {
  const [tab, setTab] = useState("Personal Info");

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-500 mt-1">Manage your personal information and security</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Profile Card */}
          <Profile />

          {/* Right Content - Tabs */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-gray-100">
              <nav className="flex gap-6 px-6 pt-4">
                {["Personal Info", "Salary Info", "Change Password"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`pb-4 px-2 text-sm font-medium transition-all relative ${tab === t
                        ? "text-purple-600 border-b-2 border-purple-600"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50/50 rounded-t-lg"
                      }`}
                  >
                    {t}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6 md:p-8 flex-1 overflow-y-auto">
              {tab === "Personal Info" && <InfoTab />}
              {tab === "Salary Info" && <SalaryInfoTab />}
              {tab === "Change Password" && <ChangePasswordTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// Left Sidebar Component: Profile Summary
// ------------------------------------------------------------------
const Profile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const usersdata = useSelector((state) => state.auth.usersdata);
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    if (usersdata[id]) {
      setEmployee(usersdata[id]);
    } else {
      const FetchEmployee = async () => {
        try {
          const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5500/api";
          const response = await fetch(`${apiBase}/users/${id}`);
          if (!response.ok) throw new Error("Failed to fetch employees");
          const data = await response.json();
          setEmployee(data.user);
          dispatch(cacheUser({ id, userData: data.user }));
        } catch (error) {
          console.error("Error fetching employees:", error);
        }
      }
      FetchEmployee();
    };
  }, [id, dispatch, usersdata]); // Removed cacheUser from deps (it's an action creator)

  if (!employee) return (
    <div className="w-full lg:w-80 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit animate-pulse">
      <div className="h-24 w-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
      <div className="h-4 w-32 bg-gray-200 mx-auto mb-2"></div>
    </div>
  );

  return (
    <div className="w-full lg:w-80 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit space-y-8">

      {/* Avatar & Name */}
      <div className="text-center">
        <div className="relative w-28 h-28 mx-auto mb-4 group">
          <img
            src={employee.profilePic || "https://i.pravatar.cc/150?img=12"}
            alt="Employee"
            className="w-full h-full rounded-full object-cover border-4 border-purple-50 shadow-md"
          />
          <button className="absolute bottom-1 right-1 bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-700 transition opacity-0 group-hover:opacity-100">
            <Camera size={14} />
          </button>
        </div>
        <h3 className="text-xl font-bold text-gray-900">{employee.username}</h3>
        <p className="text-sm text-gray-500 font-medium">{employee.designation || "Employee"}</p>
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Active
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3 border-t border-b border-gray-100 py-6">
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <DollarSign size={18} className="mx-auto text-purple-600 mb-1" />
          <p className="text-xs text-gray-500">Salary</p>
          <p className="font-bold text-gray-800 text-sm">₹{employee.salary || '0'}</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <Briefcase size={18} className="mx-auto text-purple-600 mb-1" />
          <p className="text-xs text-gray-500">Type</p>
          <p className="font-bold text-gray-800 text-sm">{employee.employmentType || '-'}</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <Clock size={18} className="mx-auto text-purple-600 mb-1" />
          <p className="text-xs text-gray-500">Shift</p>
          <p className="font-bold text-gray-800 text-sm">{employee.attendanceType || '-'}</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <Calendar size={18} className="mx-auto text-purple-600 mb-1" />
          <p className="text-xs text-gray-500">Joined</p>
          <p className="font-bold text-gray-800 text-sm">{employee.joigningDate || '-'}</p>
        </div>
      </div>

      {/* Contact List */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Details</h4>

        <div className="flex items-center gap-3 text-sm group">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition">
            <Mail size={16} />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs text-gray-500">Email Address</p>
            <p className="font-medium text-gray-900 truncate" title={employee.email}>{employee.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm group">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition">
            <Phone size={16} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Phone Number</p>
            <p className="font-medium text-gray-900">{employee.mobile || 'N/A'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm group">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition">
            <MapPin size={16} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Location</p>
            <p className="font-medium text-gray-900 truncate w-48" title={employee.address}>{employee.address || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// Tab 1: Personal Info
// ------------------------------------------------------------------
const InfoTab = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [message, setMessage] = useState("Loading...");
  const [showModal, setShowModal] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const userFromStore = useSelector((state) => state.auth.usersdata[id]);

  useEffect(() => {
    if (userFromStore) {
      setEmployee(userFromStore);
    } else {
      setMessage("User data is not found. Please contact HR.");
    }
  }, [userFromStore]);

  const openModal = (mode) => {
    setFormMode(mode);
    setShowModal(true);
  };

  if (!employee) return (
    <div className="flex items-center justify-center h-48 text-gray-500 gap-2">
      <AlertCircle size={20} />
      <p>{message}</p>
    </div>
  );

  const Section = ({ title, icon: Icon, children }) => (
    <div className="mb-8 last:mb-0">
      <h4 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
        <Icon size={20} className="text-purple-600" />
        {title}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
        {children}
      </div>
    </div>
  );

  const GridItem = ({ label, value }) => (
    <div className="space-y-1">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-sm md:text-base font-semibold text-gray-800 break-words">{value || 'N/A'}</p>
    </div>
  );

  return (
    <>
      <div className="space-y-2">

        {/* Personal Details */}
        <Section title="Personal Information" icon={User}>
          <GridItem label="Full Name" value={employee.username} />
          <GridItem label="Employee ID" value={employee.user_id} />
          <GridItem label="Joining Date" value={employee.joigningDate} />
          <GridItem label="Gender" value={employee.gender || 'N/A'} />
        </Section>

        {/* Professional Details */}
        <Section title="Professional Details" icon={Briefcase}>
          <GridItem label="Designation" value={employee.designation} />
          <GridItem label="Role" value={employee.role} />
          <GridItem label="Employment Type" value={employee.employmentType} />
          <GridItem label="Base Pay" value={`₹${employee.salary}`} />
        </Section>

        {/* Emergency Contact */}
        <Section title="Emergency Contact" icon={AlertCircle}>
          <GridItem label="Contact Name" value={employee.emergencyContactname} />
          <GridItem label="Contact Number" value={employee.emergencyContact} />
        </Section>

        {/* Financial Info */}
        <Section title="Financial Details" icon={CreditCard}>
          <GridItem label="Bank Account" value={employee.bankAccount} />
          <GridItem label="IFSC Code" value={employee.IFSC} />
        </Section>

        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <button
            onClick={() => openModal("update")}
            className="px-6 py-2.5 bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-200 hover:bg-purple-700 transition flex items-center gap-2 font-medium"
          >
            <Edit2 size={16} /> Update Profile
          </button>
        </div>
      </div>

      {showModal && (
        <ProfileModal
          mode={formMode}
          employeeId={id}
          defaultData={employee}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

// ------------------------------------------------------------------
// Tab 2: Salary Info
// ------------------------------------------------------------------
function SalaryInfoTab() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [message, setMessage] = useState("Loading salary data...");

  useEffect(() => {
    if (!id) return;
    const fetchSalaryInfo = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5500/api";
        const response = await fetch(`${apiBase}/usersalaryinfo/${id}`);
        if (!response.ok) {
          setMessage("No salary information available.");
          return;
        }
        const data = await response.json();
        setEmployee(data);
      } catch (error) {
        console.error("Error fetching salary info:", error);
        setMessage("Error loading data.");
      }
    };
    fetchSalaryInfo();
  }, [id]);

  if (!employee) return (
    <div className="flex flex-col items-center justify-center h-48 text-gray-500 gap-3">
      <div className="p-3 bg-gray-50 rounded-full">
        <DollarSign size={24} className="text-gray-400" />
      </div>
      <p>{message}</p>
    </div>
  );

  const StatCard = ({ label, value, colorClass }) => (
    <div className={`p-4 rounded-xl border ${colorClass} bg-opacity-50`}>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">{label}</p>
      <p className="text-xl font-bold">{value !== undefined ? `₹${value}` : '-'}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          label="Gross Salary"
          value={employee.gross_salary}
          colorClass="bg-blue-50 border-blue-100 text-blue-700"
        />
        <StatCard
          label="Net Salary (In Hand)"
          value={employee.net_salary}
          colorClass="bg-green-50 border-green-100 text-green-700"
        />
      </div>

      {/* Detailed Breakdown */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Allowances */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="bg-green-50/50 px-5 py-3 border-b border-green-100 flex items-center justify-between">
            <h4 className="font-bold text-green-800 flex items-center gap-2">
              <CheckCircle size={16} /> Allowances
            </h4>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex justify-between text-sm"><span className="text-gray-600">Basic</span> <span className="font-semibold text-gray-900">₹{employee.basic}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-600">HRA</span> <span className="font-semibold text-gray-900">₹{employee.hra}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-600">DA</span> <span className="font-semibold text-gray-900">₹{employee.da}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-600">Performance Bonus</span> <span className="font-semibold text-gray-900">₹{employee.pb}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-600">LTA</span> <span className="font-semibold text-gray-900">₹{employee.lta}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-600">Fixed</span> <span className="font-semibold text-gray-900">₹{employee.fixed}</span></div>
          </div>
        </div>

        {/* Deductions */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="bg-red-50/50 px-5 py-3 border-b border-red-100 flex items-center justify-between">
            <h4 className="font-bold text-red-800 flex items-center gap-2">
              <AlertCircle size={16} /> Deductions
            </h4>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex justify-between text-sm"><span className="text-gray-600">Provident Fund (PF)</span> <span className="font-semibold text-red-600">-₹{employee.pf}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-600">Professional Tax</span> <span className="font-semibold text-red-600">-₹{employee.professionaltax}</span></div>
            <div className="border-t border-dashed border-gray-200 mt-2 pt-2 flex justify-between text-sm font-bold">
              <span className="text-gray-800">Total Deductions</span>
              <span className="text-red-700">₹{employee.total_deductions}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-400 text-center pt-4">
        Last updated on {new Date(employee.last_update).toLocaleDateString()} by {employee.updated_by}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Tab 3: Change Password
// ------------------------------------------------------------------
function ChangePasswordTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("⚠️ Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("❌ New passwords do not match!");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      const token = localStorage.getItem("token");
      const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5500/api";

      const res = await fetch(`${apiBase}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error changing password.");
      setMessage("✅ Password updated successfully!");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-4">
      <div className="text-center mb-8">
        <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-3">
          <Lock size={24} className="text-purple-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Change Password</h3>
        <p className="text-sm text-gray-500">Ensure your account uses a strong, unique password</p>
      </div>

      <form onSubmit={handlePasswordChange} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-200 transition flex justify-center items-center gap-2 mt-4"
          disabled={loading}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : "Update Password"}
        </button>
      </form>

      {message && (
        <div className={`mt-6 p-3 rounded-lg text-sm font-medium text-center ${message.includes("✅") ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
          }`}>
          {message}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Modal for Updating Profile
// ------------------------------------------------------------------
const ProfileModal = ({ mode = "update", employeeId, defaultData = {}, onClose }) => {
  const user = useSelector((state) => state.auth.user);
  const [formData, setFormData] = useState({
    user_id: "", username: "", email: "", mobile: "", address: "",
    bankAccount: "", gender: "", IFSC: "", emergencyContact: "", emergencyContactname: "",
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode === "update" && defaultData) {
      setFormData({ ...defaultData });
    }
  }, [defaultData, mode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5500/api";
    const url = `${apiBase}/update/${user.id}`;

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      setMessage("✅ Profile updated successfully!");
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const Input = ({ label, name, type = "text" }) => (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-500 uppercase">{label}</label>
      <input
        type={type}
        name={name}
        value={formData[name] || ""}
        onChange={handleChange}
        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition text-sm text-gray-800"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 flex flex-col max-h-[90vh]">

        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Edit2 size={20} className="text-purple-600" /> Update Profile
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" name="username" />
            <Input label="Email Address" name="email" type="email" />
            <Input label="Mobile Number" name="mobile" />
            <Input label="Address" name="address" />
            <Input label="Bank Account" name="bankAccount" />
            <Input label="IFSC Code" name="IFSC" />
            <Input label="Emergency Contact Name" name="emergencyContactname" />
            <Input label="Emergency Contact Number" name="emergencyContact" />

            <div className="col-span-1 md:col-span-2 mt-4 flex gap-3 justify-end">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium shadow-lg shadow-purple-200 hover:bg-purple-700 transition">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
          {message && <p className="text-center mt-4 font-medium text-green-600 animate-in fade-in slide-in-from-bottom-2">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default Emprofile;