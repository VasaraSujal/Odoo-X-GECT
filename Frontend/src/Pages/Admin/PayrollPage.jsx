import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { cacheUser } from '../../Redux/Slice';
import {
  Mail, Phone, Globe, Calendar, DollarSign, Clock,
  Briefcase, User, Building, Edit3, X, Check, ArrowLeft
} from "lucide-react";

const PayrollPage = () => {
  const [tab, setTab] = useState("usersalaryinfo");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Payroll Management</h1>
          <p className="text-sm text-text-sub">Manage salary details for this employee.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <Profile />
        <div className="flex-1 bg-surface rounded-2xl shadow-sm border border-border flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-border px-6 pt-4">
            <nav className="flex gap-6 text-sm font-medium">
              {["usersalaryinfo"].map((t) => (
                <button
                  key={t}
                  className={`pb-3 border-b-2 transition-colors duration-200 ${tab === t
                      ? "border-primary text-primary"
                      : "border-transparent text-text-sub hover:text-text-main"
                    }`}
                  onClick={() => setTab(t)}
                >
                  {t.replace("usersalaryinfo", "Salary Info")}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {tab === "usersalaryinfo" && <InfoTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

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
          const response = await fetch(`https://attendance-and-payroll-management.onrender.com/api/users/${id}`);
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
  }, [id, dispatch, usersdata]);

  if (!employee) return (
    <div className="bg-surface w-full lg:w-1/4 rounded-2xl shadow-sm border border-border p-6 flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="bg-surface w-full lg:w-1/4 rounded-2xl shadow-sm border border-border p-6 h-fit space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center pb-6 border-b border-border">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-sm">
          <User size={40} />
        </div>
        <h3 className="text-xl font-bold text-text-main mb-1">{employee.username}</h3>
        <p className="text-sm text-text-sub font-medium">{employee.role || "Employee"}</p>
      </div>

      {/* Info Section */}
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
          <div className="p-2 bg-white rounded-lg border border-border shadow-sm text-primary">
            <Briefcase size={16} />
          </div>
          <div>
            <p className="text-sm font-medium text-text-main">Admin & HRM</p>
            <p className="text-xs text-text-sub">Department</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
          <div className="p-2 bg-white rounded-lg border border-border shadow-sm text-green-600">
            <DollarSign size={16} />
          </div>
          <div>
            <p className="text-sm font-medium text-green-600">₹{employee.salary}</p>
            <p className="text-xs text-text-sub">Salary</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
          <div className="p-2 bg-white rounded-lg border border-border shadow-sm text-orange-500">
            <Clock size={16} />
          </div>
          <div>
            <p className="text-sm font-medium text-text-main">Regular</p>
            <p className="text-xs text-text-sub">Work Shift</p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="pt-4 border-t border-border">
        <h4 className="text-xs font-bold uppercase text-text-sub mb-4 tracking-wider">Contact Details</h4>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-text-sub" />
            <div>
              <p className="text-xs text-text-sub">Email</p>
              <p className="text-sm text-text-main">{employee.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={16} className="text-text-sub" />
            <div>
              <p className="text-xs text-text-sub">Phone</p>
              <p className="text-sm text-text-main">{employee.mobile}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoSection = ({ title, icon: Icon, children }) => (
  <div className="bg-gray-50 rounded-xl p-5 border border-border">
    <div className="flex items-center gap-2 mb-4 border-b border-border/50 pb-2">
      <Icon size={18} className="text-primary" />
      <h4 className="font-bold text-text-main text-sm uppercase tracking-wide">{title}</h4>
    </div>
    <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
      {children}
    </div>
  </div>
);

const InfoItem = ({ label, value, fullWidth = false }) => (
  <div className={fullWidth ? "col-span-2" : ""}>
    <p className="text-xs text-text-sub uppercase font-bold mb-1">{label}</p>
    <p className="text-text-main font-medium">{value || 'N/A'}</p>
  </div>
);


function InfoTab() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [message, setMessage] = useState("Loading...");
  const [showAddButton, setShowAddButton] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchSalaryInfo = async () => {
      try {
        const response = await fetch(`https://attendance-and-payroll-management.onrender.com/api/usersalaryinfo/${id}`);

        if (!response.ok) {
          setMessage("Salary data is not found for this user. Please add the user info.");
          setShowAddButton(true);
          return;
        }

        const data = await response.json();
        setEmployee(data);
        setShowAddButton(false);
      } catch (error) {
        console.error("Error fetching salary info:", error);
        setMessage("Something went wrong while fetching salary info.");
      }
    };

    fetchSalaryInfo();
  }, [id]);

  const openModal = (mode, data = null) => {
    setFormMode(mode);
    setSelectedEmployeeData(data);
    setShowModal(true);
  };

  if (!employee) return (
    <div className="text-center py-10 text-text-sub">
      <p className="mb-4">{message}</p>
      {showAddButton && (
        <button
          onClick={() => openModal("add")}
          className="px-6 py-2 bg-primary text-white rounded-xl shadow-lg hover:bg-primary-hover transition-colors"
        >
          ➕ Add Salary Info
        </button>
      )}
      {showModal && (
        <SalaryModal
          mode={formMode}
          employeeId={id}
          defaultData={formMode === "update" ? selectedEmployeeData : {}}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );

  return (
    <div className="space-y-6 text-gray-700">

      <div className="flex justify-between items-center pb-2">
        <div>
          <h3 className="text-lg font-bold text-text-main">
            User {employee.user_id} Salary Info
          </h3>
          <p className="text-sm text-text-sub">Detailed compensation breakdown.</p>
        </div>
        <button
          onClick={() => openModal("update", employee)}
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center gap-2 active:scale-95"
        >
          <Edit3 size={16} />
          Update Salary Info
        </button>
      </div>


      <div className="grid gap-6">
        <InfoSection title="Personal Details" icon={User}>
          <InfoItem label="Full Name" value={employee.employee_name} />
          <InfoItem label="Employee ID" value={employee.employee_id} />
          <InfoItem label="Base Salary" value={`₹${employee.base_salary}`} />
          <InfoItem label="Joining Date" value={employee.joining_date} />
        </InfoSection>

        <InfoSection title="Bonus & HRA" icon={DollarSign}>
          <InfoItem label="Bonus" value={`₹${employee.bonus}`} />
          <InfoItem label="HRA" value={`₹${employee.hra}`} />
        </InfoSection>

        <InfoSection title="Deductions" icon={Building}>
          <InfoItem label="Tax Percentage" value={`${employee.tax_percent}%`} />
          <InfoItem label="Provident Fund" value={`${employee.pf_percent}%`} />
        </InfoSection>

        <div className="bg-primary/5 rounded-xl p-4 border border-primary/20 flex justify-between items-center text-xs text-primary font-medium">
          <span>Last Updated: {(employee.last_update || "").split("T")[0]}</span>
          <span>Updated By: {employee.updated_by}</span>
        </div>
      </div>

      {showModal && (
        <SalaryModal
          mode={formMode}
          employeeId={id}
          defaultData={formMode === "update" ? selectedEmployeeData : {}}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

const SalaryModal = ({ mode = "add", employeeId, defaultData = {}, onClose }) => {
  const user = useSelector((state) => state.auth.user);
  const [formData, setFormData] = useState({
    employee_id: "",
    employee_name: "",
    base_salary: "",
    hra: "",
    bonus: "",
    tax_percent: "",
    pf_percent: "",
    joining_date: "",
    updated_by: user.username,
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "update" && defaultData) {
      setFormData({ ...defaultData });
    } else {
      setFormData((prev) => ({ ...prev, employee_id: employeeId }));
    }
  }, [defaultData, mode, employeeId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const url =
      mode === "add"
        ? "https://attendance-and-payroll-management.onrender.com/api/usersalaryinfo/add"
        : "https://attendance-and-payroll-management.onrender.com/api/usersalaryinfo/update";

    const method = mode === "add" ? "POST" : "PUT";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      setMessage("✅ Success! " + result.message);
      setTimeout(onClose, 1000);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const ModalInput = ({ label, name, type = "text", ...props }) => (
    <div className="space-y-1">
      <label className="text-xs font-bold text-text-sub uppercase">{label}</label>
      <input
        type={type}
        name={name}
        className="w-full px-4 py-2 bg-gray-50 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-colors outline-none text-sm font-medium"
        value={formData[name]}
        onChange={handleChange}
        {...props}
      />
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-surface max-w-2xl w-full rounded-2xl shadow-2xl p-8 relative flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-text-sub transition-colors"><X size={20} /></button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-text-main">
            {mode === "add" ? "Add Salary Info" : "Update Salary Info"}
          </h2>
          <p className="text-sm text-text-sub">Manage salary details.</p>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid md:grid-cols-2 gap-5 mb-6">
            <ModalInput label="Employee ID" name="employee_id" disabled={mode === "update" || mode === "add"} />
            <ModalInput label="Employee Name" name="employee_name" />
            <ModalInput label="Base Salary" name="base_salary" type="number" />
            <ModalInput label="HRA" name="hra" type="number" />
            <ModalInput label="Bonus" name="bonus" type="number" />
            <ModalInput label="Tax %" name="tax_percent" type="number" />
            <ModalInput label="PF %" name="pf_percent" type="number" />
            <ModalInput label="Joining Date" name="joining_date" type="date" />
            <div className="md:col-span-2">
              <ModalInput label="Updated By" name="updated_by" disabled />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (mode === "add" ? "Save Information" : "Update Information")}
          </button>
        </form>

        {message && <p className="text-center text-sm mt-4 font-medium animate-pulse">{message}</p>}
      </div>
    </div>
  );
};

export default PayrollPage;
