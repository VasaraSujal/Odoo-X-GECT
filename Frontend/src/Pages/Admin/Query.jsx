import React, { useState } from "react";
import { FaPaperclip, FaExclamationCircle } from "react-icons/fa";

const HRRequests = () => {

  const [requests] = useState([
    {
      id: 1,
      employeeName: "Arya Patel",
      employeeId: "EMP001",
      subject: "Salary clarification",
      category: "Payroll",
      priority: "High",
      message: "I noticed a discrepancy in my February salary slip. Could you check?",
      attachment: "https://example.com/salary-slip.pdf",
      date: "2025-07-31",
    },
    {
      id: 2,
      employeeName: "Ravi Sharma",
      employeeId: "EMP002",
      subject: "Leave approval request",
      category: "Leave",
      priority: "Normal",
      message: "I would like to request leave for 2 days in August.",
      attachment: null,
      date: "2025-07-30",
    },
  ]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">📩 Employee HR Requests</h1>

      <div className="bg-white shadow-md rounded-xl p-4">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3">Employee</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Category</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Date</th>
              <th className="p-3">Attachment</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-t border-gray-200 hover:bg-gray-50">
                {/* Employee Name */}
                <td className="px-6 py-4">
                  <p className="font-semibold">{req.employeeName}</p>
                  <p className="text-xs text-gray-500">{req.employeeId}</p>
                </td>

                {/* Subject */}
                <td className="px-6 py-4">{req.subject}</td>

                {/* Category */}
                <td className="px-6 py-4">{req.category}</td>

                {/* Priority Badge */}
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      req.priority === "High"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {req.priority}
                  </span>
                </td>

                {/* Date */}
                <td className="px-6 py-4">{req.date}</td>

                {/* Attachment */}
                <td className="px-6 py-4">
                  {req.attachment ? (
                    <a
                      href={req.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <FaPaperclip /> View
                    </a>
                  ) : (
                    <span className="text-gray-400">No File</span>
                  )}
                </td>

                {/* Action Button */}
                <td className="px-6 py-4">
                  <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HRRequests;
