import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  User, Mail, Phone, MapPin, Building2,
  Briefcase, CreditCard, Calendar, DollarSign,
  Users, UserPlus, Save
} from 'lucide-react';

const AddEmployee = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    id: "",
    joigningDate: "",
    designation: "",
    address: "",
    bankAccount: "",
    mobile: "",
    email: "",
    role: "",
    wage: "",
    salary: "",
    salary_components: {},
    employmentType: "",
    attendanceType: "",
    emergencyContact: "",
    emergencyContactname: "",
    IFSC: ""
  });

  const [loading, setLoading] = useState(false);
  const [salaryPreview, setSalaryPreview] = useState(null);
  const [calculating, setCalculating] = useState(false);

  const token = localStorage.getItem("token");
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5500/api";

  const handleWageChange = async (wage) => {
    if (!wage || wage <= 0) {
      setSalaryPreview(null);
      return;
    }

    try {
      setCalculating(true);
      const response = await axios.post(
        `${apiBase}/salary-structure/preview`,
        { wage: parseFloat(wage) },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSalaryPreview(response.data.data);
      setFormData((prev) => ({
        ...prev,
        salary: response.data.data.totalGross || wage,
        salary_components: response.data.data,
      }));
    } catch (error) {
      console.error("Error calculating salary:", error);
      toast.error("Failed to calculate salary components");
      setSalaryPreview(null);
    } finally {
      setCalculating(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "wage" && value) {
      handleWageChange(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.id || !formData.email || !formData.role) {
      toast.error("❌ Please fill all required fields");
      return;
    }

    if (formData.wage && formData.wage > 0) {
      if (!salaryPreview) {
        toast.error("❌ Please wait for salary preview to calculate");
        return;
      }
      if (!formData.salary_components || Object.keys(formData.salary_components).length === 0) {
        toast.error("❌ Salary components not calculated. Please ensure wage is entered.");
        return;
      }
    }

    try {
      setLoading(true);
      const response = await axios.post(`${apiBase}/add`, formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        toast.success("✅ Employee added successfully!");

        setFormData({
          name: "", gender: "", id: "", joigningDate: "", designation: "",
          address: "", bankAccount: "", mobile: "", email: "", role: "",
          wage: "", salary: "", salary_components: {}, employmentType: "",
          attendanceType: "", emergencyContact: "", emergencyContactname: "", IFSC: "",
        });
        setSalaryPreview(null);
      }
    } catch (error) {
      console.error("Full Error Object:", error);
      const errorMsg = error.response?.data?.message || "Failed to add employee";
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, name, type = "text", icon: Icon, placeholder, required = true }) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        {Icon && <Icon size={16} className="text-purple-600" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 outline-none text-gray-800 placeholder-gray-400"
        />
      </div>
    </div>
  );

  const SelectField = ({ label, name, options, icon: Icon, required = true }) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        {Icon && <Icon size={16} className="text-purple-600" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          name={name}
          value={formData[name]}
          onChange={handleChange}
          required={required}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 outline-none text-gray-800 appearance-none"
        >
          <option value="">Select {label}</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <UserPlus size={24} />
              </div>
              New Employee
            </h1>
            <p className="text-gray-500 mt-1 ml-12">Create a new employee profile and generate credentials</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Section 1: Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30 flex items-center gap-2">
              <User className="text-purple-600" size={20} />
              <h3 className="font-semibold text-gray-800">Personal Information</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InputField label="Full Name" name="name" icon={User} placeholder="John Doe" />
              <InputField label="Employee ID" name="id" icon={Briefcase} placeholder="EMP-001" />
              <SelectField label="Gender" name="gender" icon={Users} options={["Male", "Female", "Other"]} />
              <InputField label="Email Address" name="email" type="email" icon={Mail} placeholder="john@company.com" />
              <InputField label="Mobile Number" name="mobile" icon={Phone} placeholder="+91 9876543210" />
              <InputField label="Address" name="address" icon={MapPin} placeholder="Full residential address" />
            </div>
          </div>

          {/* Section 2: Professional Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30 flex items-center gap-2">
              <Briefcase className="text-purple-600" size={20} />
              <h3 className="font-semibold text-gray-800">Professional Details</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InputField label="Designation" name="designation" icon={Briefcase} placeholder="Software Engineer" />
              <SelectField label="Role" name="role" icon={User} options={["HR", "employee"]} />
              <SelectField label="Employment Type" name="employmentType" icon={Building2} options={["Full Time", "Part Time", "Contract"]} />
              <SelectField label="Attendance Type" name="attendanceType" icon={Calendar} options={["Daily", "Hourly"]} />
              <InputField label="Joining Date" name="joigningDate" type="date" icon={Calendar} placeholder="" />
            </div>
          </div>

          {/* Section 3: Financial Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30 flex items-center gap-2">
              <DollarSign className="text-purple-600" size={20} />
              <h3 className="font-semibold text-gray-800">Financial Information</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InputField label="Wage / CTC" name="wage" type="number" icon={DollarSign} placeholder="0.00" required={false} />
              <InputField label="Bank Account No" name="bankAccount" icon={CreditCard} placeholder="XXXXXXXXXXXX" />
              <InputField label="IFSC Code" name="IFSC" icon={Building2} placeholder="SBIN000XXXX" />
            </div>
            {/* Salary Preview */}
            {calculating && (
              <div className="px-6 pb-6 text-sm text-purple-600 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                Calculating salary structure...
              </div>
            )}
            {salaryPreview && (
              <div className="px-6 pb-6 pt-0">
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                  <h4 className="text-sm font-semibold text-purple-900 mb-2">Salary Structure Preview</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs md:text-sm">
                    <div><span className="text-purple-500 block">Basic</span> ₹{salaryPreview.basic}</div>
                    <div><span className="text-purple-500 block">HRA</span> ₹{salaryPreview.hra}</div>
                    <div><span className="text-purple-500 block">DA</span> ₹{salaryPreview.da}</div>
                    <div className="font-bold text-purple-700"><span className="text-purple-500 block font-normal">Net Salary</span> ₹{salaryPreview.netSalary}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Emergency Contact */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30 flex items-center gap-2">
              <Phone className="text-purple-600" size={20} />
              <h3 className="font-semibold text-gray-800">Emergency Contact</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Contact Name" name="emergencyContactname" icon={User} placeholder="Relative Name" />
              <InputField label="Contact Number" name="emergencyContact" icon={Phone} placeholder="Emergency Phone" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2.5 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Add Employee
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
