// import React, { useState } from "react";
// import Header from "../../Components/Header";
// import Sidebar from "../../Components/Sidebar";

// const Salary = () => {
//   const [month, setmonth] = useState("May 2025");

//   const salaryData = [
//     {
//       month: "May 2025",
//       basePay: "₹40,000",
//       bonus: "₹5,000",
//       deductions: "₹2,000",
//       netPay: "₹43,000",
//       status: "Paid",
//     },
//     {
//       month: "April 2025",
//       basePay: "₹40,000",
//       bonus: "₹3,000",
//       deductions: "₹1,000",
//       netPay: "₹42,000",
//       status: "Paid",
//     },
//   ];

//   return (
//     <div className="min-h-screen flex flex-col">
//       <Header />
//       <div className="flex flex-1 overflow-hidden">
//         <Sidebar />
//         <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
//           {/* Title */}
//           <div className="flex justify-between items-center">
//             <h1 className="text-xl font-semibold">Salary Overview</h1>
//             <select
//               className="border border-gray-300 px-3 py-2 rounded-md text-sm"
//               value={month}
//               onChange={(e) => setmonth(e.target.value)}
//             >
//               {salaryData.map((data, idx) => (
//                 <option key={idx} value={data.month}>
//                   {data.month}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Summary Cards */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//             {salaryData
//               .find((data) => data.month === month) &&
//               (() => {
//                 const current = salaryData.find((data) => data.month === month);
//                 return (
//                   <>
//                     <div className="bg-white p-4 rounded shadow">
//                       <h4 className="text-sm text-gray-500">Base Pay</h4>
//                       <p className="text-xl font-bold">{current.basePay}</p>
//                     </div>
//                     <div className="bg-white p-4 rounded shadow">
//                       <h4 className="text-sm text-gray-500">Bonus</h4>
//                       <p className="text-xl font-bold text-green-600">{current.bonus}</p>
//                     </div>
//                     <div className="bg-white p-4 rounded shadow">
//                       <h4 className="text-sm text-gray-500">Deductions</h4>
//                       <p className="text-xl font-bold text-red-600">{current.deductions}</p>
//                     </div>
//                     <div className="bg-white p-4 rounded shadow">
//                       <h4 className="text-sm text-gray-500">Net Pay</h4>
//                       <p className="text-xl font-bold text-indigo-600">{current.netPay}</p>
//                     </div>
//                   </>
//                 );
//               })()}
//           </div>

//           {/* Salary History Table */}
//           <div className="bg-white p-4 rounded shadow">
//             <h3 className="font-semibold text-lg mb-4 text-gray-800">Salary History</h3>
//             <div className="overflow-x-auto">
//               <table className="min-w-full text-sm text-left text-gray-600">
//                 <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
//                   <tr>
//                     <th className="px-4 py-3">month</th>
//                     <th className="px-4 py-3">Base Pay</th>
//                     <th className="px-4 py-3">Bonus</th>
//                     <th className="px-4 py-3">Deductions</th>
//                     <th className="px-4 py-3">Net Pay</th>
//                     <th className="px-4 py-3">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {salaryData.map((item, idx) => (
//                     <tr
//                       key={idx}
//                       className="border-b hover:bg-gray-50 transition duration-200"
//                     >
//                       <td className="px-4 py-3 font-medium text-gray-800">{item.month}</td>
//                       <td className="px-4 py-3">{item.basePay}</td>
//                       <td className="px-4 py-3">{item.bonus}</td>
//                       <td className="px-4 py-3">{item.deductions}</td>
//                       <td className="px-4 py-3 font-semibold text-indigo-600">
//                         {item.netPay}
//                       </td>
//                       <td className="px-4 py-3">
//                         <span
//                           className={`px-2 py-1 rounded text-xs font-medium ${
//                             item.status === "Paid"
//                               ? "bg-green-100 text-green-700"
//                               : "bg-yellow-100 text-yellow-700"
//                           }`}
//                         >
//                           {item.status}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default Salary;




import React, { useState,useEffect } from "react";
import { useSelector } from 'react-redux';
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

const Salary = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(""); 
  const [data,setData]=useState([])

  const user = useSelector((state) => state.auth.user);

const user_id=user?.id
console.log(user_id)

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
console.log("recieve data is",data)

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
  doc.rect(10, y, 190, lineHeight * 1.1); // table header background
  doc.setFillColor("#e6e6e6");
  doc.setDrawColor(200);
  doc.setLineWidth(0.1);
  doc.text("Earnings", 12, y + 6);
  doc.text(`Amount (${rupee})`, 60, y + 6);
  doc.text("Deductions", 112, y + 6);
  doc.text(`Amount (${rupee})`, 160, y + 6);

  y += lineHeight * 1.2;

  const drawRow = (labelLeft, valLeft, labelRight, valRight) => {
    doc.rect(10, y - 1, 95, lineHeight);  // Earnings column
    doc.rect(105, y - 1, 95, lineHeight); // Deductions column

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
  doc.line(10, y, 200, y); // horizontal line
  y += lineHeight;
  doc.text("Prepared By", 20, y);
  doc.text("Checked By", 90, y);
  doc.text("Authorized By", 160, y);

    y += lineHeight-1;  
doc.setFontSize(10);
// Prepared By
doc.text("Rajeev Sharma", 20, y);
doc.text("(HR Executive)", 20, y + 4);


// Checked By
doc.text("Meenal Kapoor", 90, y);
doc.text("(Payroll Manager)", 90, y + 4);

// Authorized By
doc.text("Anil Deshmukh", 160, y);
doc.text("(Head - Finance)", 160, y + 4);

  // Save PDF
  doc.save(`SalarySlip-${item.month}.pdf`);
};


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f5f7fa] to-[#e4ecf7]">
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Salary</h1>

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

export default Salary;