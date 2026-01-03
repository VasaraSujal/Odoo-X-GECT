import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Check, X, Search, Filter, Calendar } from "lucide-react";

const LeaveRequests = () => {
    const [leaves, setLeaves] = useState([]);
    const [filter, setFilter] = useState("Pending");
    const [searchTerm, setSearchTerm] = useState("");
    const token = useSelector((state) => state.auth.token);

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const response = await axios.get("http://localhost:5500/api/all-leaves", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLeaves(response.data);
        } catch (error) {
            console.error("Error fetching leaves", error);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        if (!window.confirm(`Are you sure you want to ${status} this request?`)) return;

        try {
            await axios.put(
                `http://localhost:5500/api/update-leave-status`,
                { id, status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchLeaves();
        } catch (error) {
            console.error("Error updating status", error);
            alert("Failed to update status");
        }
    };

    const filteredLeaves = leaves.filter(
        (leave) =>
            (filter === "All" || leave.status === filter) &&
            (leave.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                leave.leaveType?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Leave Management</h1>
                <p className="text-gray-500 mb-8">Review and manage employee leave requests.</p>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                        {["All","Pending", "Approved", "Rejected", ].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${filter === status
                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search employee or leave type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs tracking-wider font-semibold">
                                    <th className="p-4">Employee</th>
                                    <th className="p-4">Leave Type</th>
                                    <th className="p-4">Duration</th>
                                    <th className="p-4">Reason</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredLeaves.map((leave) => (
                                    <tr key={leave._id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 font-medium text-gray-900">{leave.user_name || leave.employeeName || "Unknown"}</td>
                                        <td className="p-4 text-gray-600">{leave.leaveType}</td>
                                        <td className="p-4 text-gray-600 space-y-1">
                                            <div className="flex items-center gap-1 text-sm bg-gray-100 px-2 py-1 rounded w-fit">
                                                <Calendar size={12} /> {new Date(leave.startDate).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-1 text-sm bg-gray-100 px-2 py-1 rounded w-fit">
                                                to {new Date(leave.endDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600 max-w-xs truncate">{leave.reason}</td>
                                        <td className="p-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${leave.status === "Approved"
                                                        ? "bg-green-100 text-green-700 border-green-200"
                                                        : leave.status === "Rejected"
                                                            ? "bg-red-100 text-red-700 border-red-200"
                                                            : "bg-yellow-100 text-yellow-700 border-yellow-200"
                                                    }`}
                                            >
                                                {leave.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                {leave.status === "Pending" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(leave._id, "Approved")}
                                                            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                                                            title="Approve"
                                                        >
                                                            <Check size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(leave._id, "Rejected")}
                                                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                                                            title="Reject"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </>
                                                )}
                                                {leave.status !== "Pending" && <span className="text-gray-400 text-sm">-</span>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredLeaves.length === 0 && (
                            <div className="p-8 text-center text-gray-400">
                                No leave requests found.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaveRequests;
