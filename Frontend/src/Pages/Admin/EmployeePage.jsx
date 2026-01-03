import React, { useState,useEffect } from "react";
import { FaDownload, FaEnvelope, FaPhone, FaGlobe, FaCalendarAlt,FaRupeeSign,FaRegClock } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import "chart.js/auto";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import {cacheUser} from '../../Redux/Slice'
import jsPDF from 'jspdf'
import { registerNotoSans } from '../NotoSansVariable.react'
import {
  ChevronDown,
  ChevronUp,
  Download,
  IndianRupee,
  Banknote,
  Gift,
  Minus,
} from "lucide-react";
import { Transition } from "@headlessui/react";
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

const months = ["April 2025", "May 2025"];

const rawAttendance = {
  "April 2025": [
    ["2025-04-01", "Present", "09:00", "18:00"],
    ["2025-04-02", "Present", "09:05", "18:05"],
    ["2025-04-03", "Leave", "-", "-"],
    ["2025-04-04", "Present", "09:10", "18:10"],
  ],
  "May 2025": [
    ["2025-05-01", "Present", "09:00", "18:00"],
    ["2025-05-02", "Absent", "-", "-"],
    ["2025-05-03", "Present", "09:15", "18:15"],
  ],
};

const EmployeeDashboard = () => {
  const [tab, setTab] = useState("userinfo");
  const [attMonth, setAttMonth] = useState(months[0]);
  const [salMonth, setSalMonth] = useState(months[0]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-64px)]">
            <Profile />
            <div className="flex-1 bg-white p-6 rounded-2xl shadow-md flex flex-col">
              <nav className="flex gap-4 border-b pb-3 mb-4 text-sm font-medium">
                {["userinfo", "attendance", "salary"].map((t) => (
                  <button
                    key={t}
                    className={`capitalize px-4 py-2 rounded-lg transition ${
                      tab === t ? "bg-indigo-100 text-indigo-600" : "hover:bg-gray-100"
                    }`}
                    onClick={() => setTab(t)}
                  >
                    {t.replace("info", " Info")}
                  </button>
                ))}
              </nav>

              <div className="flex-1 overflow-y-auto">
                {tab === "userinfo" && <InfoTab />}
                {tab === "attendance" && (
                  <Attendance/>
                )}
                {tab === "salary" && <Salary/>}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

const Profile = () =>{
  const {id}=useParams();      
  console.log(id)
  const dispatch = useDispatch();
  const usersdata = useSelector((state) => state.auth.usersdata);
  console.log(usersdata)
  const [employee,setEmployee]=useState(null)
console.log("1. Profile rendered");
useEffect(()=>{
if (usersdata[id]){
  console.log("Loaded from cache",usersdata)
    console.log("2. Profile useEffect triggered");
  setEmployee(usersdata[id])
}else{
const FetchEmployee= async()=>{
  try{
  
    
    const response= await fetch(`http://localhost:5500/api/users/${id}`);
    
      if(!response.ok){
            throw new Error("Failed to fetch employees");
      }
       const data=await response.json()
       setEmployee(data.user)
       dispatch(cacheUser({ id, userData: data.user }));
       console.log('Fetching the data from api')
         
  }catch(error){
  console.error("Error fetching employees:", error);
  }
}
FetchEmployee();
};
},[id,dispatch,cacheUser])

 if (!employee) return <p>Loading...</p>;
console.log(employee)

  return (
 <div className="bg-white w-full lg:w-1/5 rounded-2xl shadow-md p-6 text-sm text-gray-700 space-y-6">
  {/* Profile Header */}
  <div className="flex flex-col items-center text-center">
      <img src="https://i.pravatar.cc/100?img=56" alt="Employee" className="w-24 h-24 rounded-full mb-4 shadow" />
      <h3 className="text-lg font-semibold">{employee.username}</h3>
      <p className="text-sm text-gray-500">{employee.designation}</p>
    </div>

  {/* Info Section */}
  <div>
    <h4 className="text-xs font-semibold text-gray-500 mb-3">Info</h4>
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-gray-100 rounded-md">
        <FaEnvelope className="text-gray-500 mt-1" />
        </div>
        <div>
          <p className="text-sm font-medium">{employee.role}</p>
          <p className="text-xs text-gray-400">Department</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="p-2 bg-gray-100 rounded-md">
        <FaRupeeSign className="text-gray-500 mt-1" />
        </div>
        <div>
          <p className="text-sm font-medium text-green-600">{employee.salary}</p>
          <p className="text-xs text-gray-400">Salary</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="p-2 bg-gray-100 rounded-md">
        <FaRegClock  className="text-gray-500 mt-1" />
        </div>
        <div>
          <p className="text-sm font-medium">{employee.employmentType}</p>
          <p className="text-xs text-gray-400">Work Shift</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="p-2 bg-gray-100 rounded-md">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2"
               viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round"
               d="M8 7V3m8 4V3m-9 8h10m-10 4h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </div>
        <div>
          <p className="text-sm font-medium">{employee.joigningDate}</p>
          <p className="text-xs text-gray-400">Joining Date</p>
        </div>
      </div>
    </div>
  </div>

  {/* Contact Section */}
  <div>
    <h4 className="text-xs font-semibold text-gray-500 mb-3">Contact</h4>
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <FaEnvelope className="text-gray-500 mt-1" />
        <div>
          <p className="text-xs text-gray-500">Email</p>
          <p className="text-sm">{employee.email}</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <FaPhone className="text-gray-500 mt-1" />
        <div>
          <p className="text-xs text-gray-500">Phone</p>
          <p className="text-sm">{employee.mobile}</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <FaGlobe className="text-gray-500 mt-1" />
        <div>
          <p className="text-xs text-gray-500">Website</p>
          <a href="https://bit.ly/3uOJF79" className="text-sm text-blue-600 underline">
            https://bit.ly/3uOJF79
          </a>
        </div>
      </div>
    </div>
  </div>
</div>

)};

function InfoTab() {
  const { id } = useParams();
  const userFromStore = useSelector((state) => state.auth.usersdata[id]);
  const [employee, setEmployee] = useState(null);
console.log("3. InfoTab rendered");
  useEffect(() => {
    if (userFromStore) {
      setEmployee(userFromStore);
      console.log("Fatching data from cach in info tab")
        console.log("4. InfoTab useEffect triggered (cache check)");
    }
  }, [userFromStore]);

  if (!employee) return <p>Loading...</p>;

  return (
    <div className="space-y-6 text-gray-700">
      <h3 className="text-xl font-semibold border-b pb-2">Personal & Official Information</h3>

          {/* Personal Info */}
          <div>
            <h4 className="text-md font-semibold mb-2 text-indigo-600">👤 Personal Details</h4>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <p><span className="font-medium">Full Name:</span> {employee.username}</p>
              <p><span className="font-medium">Employee ID:</span> {employee.user_id}</p>
              <p><span className="font-medium">Base Salary:</span> ₹{employee.salary}</p>
              <p><span className="font-medium">Joining Date:</span> {employee.joigningDate}</p>
            </div>
          </div>

       {/* Contact Info */}
      <div>
        <h4 className="text-md font-semibold mb-2 text-indigo-600">📞 Contact Information</h4>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <p><span className="font-medium">Phone:</span> {employee.mobile || 'N/A'}</p>
          <p><span className="font-medium">Email:</span> {employee.email || 'N/A'}</p>
          <p className="col-span-2"><span className="font-medium">Address:</span> {employee.address || 'N/A'}</p>
        </div>
      </div>

      {/* Job Info */}
      <div>
        <h4 className="text-md font-semibold mb-2 text-indigo-600">💼 Job Details</h4>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <p><span className="font-medium">Employee ID:</span> {employee.user_id}</p>
          <p><span className="font-medium">Designation:</span> {employee.designation}</p>
          <p><span className="font-medium">Attendance Type:</span> {employee.attendanceType}</p>
          <p><span className="font-medium">Joining Date:</span> {employee.joigningDate}</p>
        </div>
      </div>

      {/* Emergency Info */}
      <div>
        <h4 className="text-md font-semibold mb-2 text-indigo-600">🚨 Emergency Contact</h4>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <p><span className="font-medium">Name:</span> {employee.emergencyContactname}</p>
          <p><span className="font-medium">Contact:</span> {employee.emergencyContact}</p>
        </div>
      </div>

            {/* Emergency Info */}
      <div>
        <h4 className="text-md font-semibold mb-2 text-indigo-600">Bank Info</h4>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <p><span className="font-medium">BankAccount No:</span> {employee.bankAccount}</p>
          <p><span className="font-medium">IFSC:</span> {employee.IFSC}</p>
        </div>
      </div>
    </div>
  );
}



const Salary = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(""); 
  const [data,setData]=useState([])

  const user = useSelector((state) => state.auth.user);

const {id}=useParams()
const user_id=id

useEffect(() => {
  const fetchSalary = async () => {
    if (!selectedMonth || !selectedYear || !user_id) {
      console.warn("Missing month/year/user_id");
      return;
    }

    try {
      const res = await fetch("http://localhost:5500/api/Generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          month: `${selectedYear}-${selectedMonth}`,
          user_id,
        }),
      });

      const result = await res.json();
      if (result) {
        setData([result]); // ✅ wrap as array
      } else {
        setData([]);
      }
    } catch (err) {
      console.error("Error fetching salary data:", err);
    }
  };

  fetchSalary();
}, [selectedMonth, selectedYear, user_id]);
console.log("recieve data is, in data variable",data)

  const toggleOpen = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const months = [
    "01", "02", "03", "04", "05", "06",
    "07", "08", "09", "10", "11", "12",
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const downloadPDF = (item) => {
  const doc = new jsPDF();
  registerNotoSans(doc);
  doc.setFont("NotoSansVariable");

  const lineHeight = 8;
  const rupee = String.fromCharCode(8377);
  let y = 15;

  // ===== Colors =====
  const blue = "#0096FF";
  const lightGray = "#f2f2f2";
  const green = "#007F00";

  // ===== Header Bar =====
  doc.setFillColor(blue);
  doc.setTextColor(255, 255, 255);
  doc.rect(0, 0, 210, 15, "F");
  doc.setFontSize(24);
  doc.text("DayFlow", 105, 10, { align: "center" });

  y = 24;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.text(`Pay Slip - ${item.month}`, 105, y, { align: 'center' });

  y += lineHeight;
  doc.setFontSize(14);

  y += 2 * lineHeight;

  // ===== Employee Info =====
  doc.setFillColor(lightGray);
  doc.rect(10, y - 6, 190, 8, "F");
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("Employee Details:", 12, y);

  y += lineHeight;
  doc.text(`Employee ID: ${item.employee_id}`, 10, y);
  doc.text(`Generated On: ${item.generated_on}`, 130, y);

  y += lineHeight;
  doc.text(`Name: ${item.employee_name}`, 10, y);
  doc.text(`Month: ${item.month}`, 130, y);

  y += 2 * lineHeight;

  // ===== Attendance Summary =====
  doc.setFillColor(lightGray);
  doc.rect(10, y - 6, 190, 8, "F");
  doc.text("Attendance Summary:", 12, y);
  y += lineHeight;
  doc.text(`• Total Working Days: ${item.attendance_summary.total_working_days}`, 10, y);
  y += lineHeight;
  doc.text(`• Present Days: ${item.attendance_summary.present_days}`, 10, y);
  y += lineHeight;
  doc.text(`• Absent Days: ${item.attendance_summary.absent_days}`, 10, y);
  y += lineHeight;
  doc.text(`• Paid Leaves: ${item.attendance_summary.paid_leave_allowance}`, 10, y);
  y += lineHeight;
  doc.text(`• Unpaid Leaves: ${item.attendance_summary.unpaid_leave_days}`, 10, y);

  y += 2 * lineHeight;

  // ===== Salary Breakdown Header =====
  doc.setFillColor(lightGray);
  doc.rect(10, y - 6, 190, 8, "F");
  doc.text("Salary Breakdown:", 12, y);

  y += lineHeight;

  // ===== Table Headers =====
  doc.rect(10, y, 190, lineHeight * 1.1);
  doc.setFillColor("#e6e6e6");
  doc.setDrawColor(200);
  doc.setLineWidth(0.1);
  doc.text("Earnings", 12, y + 6);
  doc.text(`Amount (${rupee})`, 60, y + 6);
  doc.text("Deductions", 112, y + 6);
  doc.text(`Amount (${rupee})`, 160, y + 6);

  y += lineHeight * 1.2;

  const drawRow = (labelLeft, valLeft, labelRight, valRight) => {
    doc.rect(10, y - 1, 95, lineHeight);
    doc.rect(105, y - 1, 95, lineHeight);

    doc.text(labelLeft || "", 12, y + 5);
    doc.text(valLeft || "", 60, y + 5);
    doc.text(labelRight || "", 112, y + 5);
    doc.text(valRight || "", 160, y + 5);
    y += lineHeight;
  };

  drawRow("Basic Salary", `${rupee}${item.basic || item.basic_salary || 0}`, "PF", `${rupee}${item.pf || item.deductions?.pf_amount || 0}`);
  drawRow("HRA", `${rupee}${item.hra || 0}`, "Professional Tax", `${rupee}${item.professionaltax || item.deductions?.tax_amount || 0}`);
  drawRow("DA", `${rupee}${item.da || 0}`, "Leave Deduction", `${rupee}${Number(item.deductions?.leave_deduction || 0).toFixed(2)}`);
  drawRow("PB", `${rupee}${item.pb || 0}`, "Total Deduction", `${rupee}${Number(item.total_deductions || item.deductions?.total_deduction || 0).toFixed(2)}`);
  drawRow("LTA", `${rupee}${item.lta || 0}`, "", "");
  drawRow("Fixed", `${rupee}${item.fixed || 0}`, "", "");
  drawRow("Gross Salary", `${rupee}${item.gross_salary || item.salary_breakdown?.gross_salary || 0}`, "", "");

  // ===== Net Salary Highlight =====
  y += lineHeight;
  doc.setFillColor("#d9fdd3");
  doc.rect(10, y, 190, lineHeight + 2, "F");
  doc.setTextColor(0, 102, 0);
  doc.text(`Net Salary: ${rupee}${Number(item.net_salary || item.salary_breakdown?.net_salary || 0).toFixed(2)}`, 12, y + 7);
 
  doc.setTextColor(0, 0, 0);

  y += 3 * lineHeight;

  // ===== Footer Section =====
  doc.setDrawColor(180);
  doc.line(10, y, 200, y);
  y += lineHeight;
  doc.text("Prepared By", 20, y);
  doc.text("Checked By", 90, y);
  doc.text("Authorized By", 160, y);

  y += lineHeight-1;  
  doc.setFontSize(10);
  doc.text("Rajeev Sharma", 20, y);
  doc.text("(HR Executive)", 20, y + 4);

  doc.text("Meenal Kapoor", 90, y);
  doc.text("(Payroll Manager)", 90, y + 4);

  doc.text("Anil Deshmukh", 160, y);
  doc.text("(Head - Finance)", 160, y + 4);

  doc.save(`SalarySlip-${item.month}.pdf`);
};

  return (
    <div className="min-h-screen flex flex-col ">
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Salary Info Of User {id}</h1>

        {/* Filter Section */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-violet-500"
          >
            <option value="">Select Month</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-violet-500"
          >
            <option value="">Select Year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        {console.log('Selected month and year is',selectedMonth,selectedYear)}

        {/* Salary Slips */}
        <div className="space-y-6">
          {data.length > 0 ? (
            data.map((item, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl transition hover:shadow-2xl border border-gray-200"
              >
                <div
                  className="flex justify-between items-center px-6 py-5 cursor-pointer"
                  onClick={() => toggleOpen(index)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-violet-100 p-3 rounded-xl shadow-sm">
                      <Banknote className="w-6 h-6 text-violet-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-semibold text-gray-900">
                        {item.month}
                      </span>
                      <span className="text-sm text-gray-500">
                        Salary Statement
                      </span>
                    </div>
                  </div>
              
                  <div className="flex items-center space-x-4">
                    <span className="text-xl font-bold text-gray-800">
                      {(Number(item.salary_breakdown?.net_salary) || 0).toFixed(2)}
                    </span>
                 <button
  onClick={() => downloadPDF(item)}
  className="bg-violet-600 text-white text-sm px-4 py-2 rounded-full shadow-md hover:bg-violet-700 transition flex items-center gap-2"
>
  <Download className="w-4 h-4" />
  Download
</button>
                    {openIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                </div>

                <Transition
                  show={openIndex === index}
                  enter="transition-all duration-300 ease-out"
                  enterFrom="max-h-0 opacity-0"
                  enterTo="max-h-screen opacity-100"
                  leave="transition-all duration-200 ease-in"
                  leaveFrom="max-h-screen opacity-100"
                  leaveTo="max-h-0 opacity-0"
                >
                  <div className="bg-gray-50 px-6 pb-6 pt-2 rounded-b-3xl">
                    <div className="space-y-4 text-gray-700 text-sm">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 font-medium">
                          <Banknote className="text-green-600 w-4 h-4" />
                          Gross Salary
                        </div>
                        <div className="text-right font-medium">₹{item.basic_salary}</div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <IndianRupee className="text-purple-600 w-4 h-4" />
                          PF (5%)
                        </div>
                        <div>{item.deductions.pf_amount}</div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Minus className="text-red-500 w-4 h-4" />
                          Tax Slab (10%)
                        </div>
                        <div>{item.deductions.tax_amount}</div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Gift className="text-blue-500 w-4 h-4" />
                          Leave Deductions
                        </div>
                        <div>{(Number(item.deductions?.leave_deduction) || 0).toFixed(2)}</div>
                      </div>

                      <hr className="border-dashed border-gray-400 my-2" />

                      <div className="flex justify-between items-center font-bold text-gray-900 text-base">
                        <div>Total Salary</div>
                        <div>{(Number(item.salary_breakdown?.net_salary) || 0).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 text-sm">
              No salary slip found for the selected period.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Attendance=()=>{
  const [selectedMonth, setSelectedMonth] = useState('2025-06');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const {id}=useParams()
  const user_id=id
    useEffect(() => {
    const fetchAttendanceData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5500/api/getAllAttendanceByMonthofuser/${user_id}/${selectedMonth}`);
        const attendanceRecords = await res.json();

        const presentDates = new Set(attendanceRecords.map(att => att.date));
        console.log("Present Dates:", presentDates);
        const [year, month] = selectedMonth.split("-");
        const daysInMonth = new Date(Number(year), Number(month), 0).getDate();

        const data = Array.from({ length: daysInMonth }, (_, i) => {
          const day = String(i + 1).padStart(2, '0');
          const dateKey = `${selectedMonth}-${day}`;
          return {
            name: `Day ${i + 1}`,
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

    if (user_id) fetchAttendanceData();
  }, [selectedMonth, user_id]);

  return(
  <>
            {/* Attendance Statistics */}
  <div className=" p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-md sm:text-lg font-semibold text-gray-800">
              Attendance Statistics
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-purple-600 font-semibold">Month</span>
              <select
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="2025-06">June 2025</option>
                <option value="2025-05">May 2025</option>
                <option value="2025-04">April 2025</option>
              </select>
            </div>
          </div>
  
          {loading ? (
            <p className="text-center text-gray-500">Loading chart...</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  interval={0}
                  angle={0}
                  height={70}
                  tick={{ fontSize: 10 }}
                />
                <YAxis ticks={[0, 1]} domain={[0, 1]} />
                <Tooltip
                  formatter={(value) => (value === 1 ? "Present" : "Absent")}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend
                  payload={[
                    { value: "Present", type: "square", color: "#10b981", id: "present" },
                    { value: "Absent", type: "square", color: "#ef4444", id: "absent" },
                  ]}
                />
                <Bar dataKey="Attendance" radius={[8, 8, 0, 0]} barSize={20}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.Attendance === 1 ? "#10b981" : "#ef4444"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
  
  </>

  )
}

export default EmployeeDashboard;