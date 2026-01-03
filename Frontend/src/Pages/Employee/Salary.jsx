import React, { useState, useEffect } from "react";
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
  FileText,
  Calendar
} from "lucide-react";
import { Transition } from "@headlessui/react";

const Salary = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [data, setData] = useState([])

  const user = useSelector((state) => state.auth.user);
  const user_id = user?.id

  useEffect(() => {
    const fetchSalary = async () => {
      if (!selectedMonth || !selectedYear || !user_id) {
        return;
      }

      try {
        const res = await fetch("https://attendance-and-payroll-management.onrender.com/api/Generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            month: `${selectedYear}-${selectedMonth}`,
            user_id,
          }),
        });

        const result = await res.json();
        if (result && !result.message) {
          // API might return error message in object
          setData([result]);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error("Error fetching salary data:", err);
        setData([]);
      }
    };

    fetchSalary();
  }, [selectedMonth, selectedYear, user_id]);

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
    const blue = "#665dcd"; // Primary color
    const lightGray = "#f2f2f2";

    // ===== Header Bar =====
    doc.setFillColor(blue);
    doc.setTextColor(255, 255, 255);
    doc.rect(0, 0, 210, 15, "F");
    doc.setFontSize(24);
    doc.text("Circle Soft", 105, 10, { align: "center" });

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

    drawRow("Basic Salary", `${rupee}${item.basic_salary}`, "Tax", `${rupee}${item.deductions.tax_amount}`);
    drawRow("Gross Salary", `${rupee}${item.salary_breakdown.gross_salary}`, "PF", `${rupee}${item.deductions.pf_amount}`);
    drawRow("", "", "Leave Deduction", `${rupee}${Number(item.deductions.leave_deduction).toFixed(2)}`);
    drawRow("", "", "Total Deduction", `${rupee}${Number(item.deductions.total_deduction).toFixed(2)}`);

    // ===== Net Salary Highlight =====
    y += lineHeight;
    doc.setFillColor("#d9fdd3");
    doc.rect(10, y, 190, lineHeight + 2, "F");
    doc.setTextColor(0, 102, 0);
    doc.text(`Net Salary: ${rupee}${Number(item.salary_breakdown.net_salary).toFixed(2)}`, 12, y + 7);

    doc.setTextColor(0, 0, 0);

    y += 3 * lineHeight;

    // ===== Footer Section =====
    doc.setDrawColor(180);
    doc.line(10, y, 200, y); // horizontal line
    y += lineHeight;
    doc.text("Prepared By", 20, y);
    doc.text("Checked By", 90, y);
    doc.text("Authorized By", 160, y);

    y += lineHeight - 1;
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-main">My Salary</h1>
        <p className="text-sm text-text-sub">View and download your salary slips.</p>
      </div>

      {/* Filter Section */}
      <div className="flex flex-wrap gap-4 bg-surface p-4 rounded-xl border border-border shadow-sm items-center">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-primary" />
          <span className="text-sm font-semibold text-text-main">Select Period:</span>
        </div>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 rounded-lg border border-border bg-gray-50 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer hover:bg-white"
        >
          <option value="">Month</option>
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-4 py-2 rounded-lg border border-border bg-gray-50 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer hover:bg-white"
        >
          <option value="">Year</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Salary Slips */}
      <div className="space-y-4">
        {data.length > 0 ? (
          data.map((item, index) => (
            <div
              key={index}
              className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden transition-all duration-300 hover:shadow-md"
            >
              <div
                className="flex flex-col sm:flex-row justify-between items-center px-6 py-5 cursor-pointer gap-4"
                onClick={() => toggleOpen(index)}
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-main">
                      {item.month}
                    </h3>
                    <p className="text-xs text-text-sub font-medium uppercase tracking-wide">
                      Salary Slip
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <p className="text-xs text-text-sub font-medium uppercase">Net Pay</p>
                    <p className="text-xl font-bold text-green-600">
                      ₹{(Number(item.salary_breakdown?.net_salary) || 0).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); downloadPDF(item); }}
                      className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors flex items-center gap-2"
                      title="Download PDF"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <div className={`transform transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                      <ChevronDown className="w-5 h-5 text-text-sub" />
                    </div>
                  </div>
                </div>
              </div>

              <Transition
                show={openIndex === index}
                enter="transition-all duration-300 ease-out"
                enterFrom="max-h-0 opacity-0"
                enterTo="max-h-[500px] opacity-100" // approximated max height
                leave="transition-all duration-200 ease-in"
                leaveFrom="max-h-[500px] opacity-100"
                leaveTo="max-h-0 opacity-0"
              >
                <div className="bg-gray-50/50 border-t border-border px-6 py-6 text-sm">
                  <div className="grid sm:grid-cols-2 gap-x-12 gap-y-4 max-w-4xl mx-auto">

                    <div className="space-y-4">
                      <h4 className="font-bold text-primary border-b border-primary/20 pb-2 mb-3">Earnings</h4>
                      <div className="flex justify-between items-center text-text-main">
                        <span className="flex items-center gap-2"><Banknote size={16} className="text-text-sub" /> Gross Salary</span>
                        <span className="font-medium">₹{item.basic_salary}</span>
                      </div>
                      {/* Additional earnings can go here */}
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-red-500 border-b border-red-500/20 pb-2 mb-3">Deductions</h4>

                      <div className="flex justify-between items-center text-text-main">
                        <span className="flex items-center gap-2"><Minus size={16} className="text-text-sub" /> Tax (10%)</span>
                        <span className="font-medium text-red-500">- ₹{item.deductions.tax_amount}</span>
                      </div>

                      <div className="flex justify-between items-center text-text-main">
                        <span className="flex items-center gap-2"><Minus size={16} className="text-text-sub" /> PF (5%)</span>
                        <span className="font-medium text-red-500">- ₹{item.deductions.pf_amount}</span>
                      </div>

                      <div className="flex justify-between items-center text-text-main">
                        <span className="flex items-center gap-2"><Minus size={16} className="text-text-sub" /> Leave Deductions</span>
                        <span className="font-medium text-red-500">- ₹{(Number(item.deductions?.leave_deduction) || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="sm:col-span-2 pt-4 mt-2 border-t border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-bold text-text-main">Total Net Pay</span>
                        <span className="text-xl font-bold text-primary">₹{(Number(item.salary_breakdown?.net_salary) || 0).toFixed(2)}</span>
                      </div>
                    </div>

                  </div>
                </div>
              </Transition>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-surface rounded-2xl border border-border border-dashed">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="text-text-sub" size={32} />
            </div>
            <p className="text-text-main font-medium">No salary slips found</p>
            <p className="text-sm text-text-sub mt-1">Select a month and year to view your payslips.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Salary;
