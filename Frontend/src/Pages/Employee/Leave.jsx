import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import {
    Edit2, Trash2, Plus, X, Search,
    Calendar, CheckCircle, XCircle, Clock,
    Filter, AlertCircle
} from "lucide-react";

const Leave = () => {
    const [leaves, setLeaves] = useState([]);
    const [filter, setFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        startDate: "",
        endDate: "",
        leaveType: "Sick Leave",
        reason: "",
    });
    const [editingId, setEditingId] = useState(null);
    const { token, user } = useSelector((state) => state.auth);

    const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5500/api";

    useEffect(() => {
        if (user) fetchLeaves();
    }, [user]);

    const fetchLeaves = async () => {
        try {
            const userId = user?.user_id || user?.id;
            // Use the apiBase for the request
            const response = await axios.get(`${apiBase}/my-leaves/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLeaves(response.data);
        } catch (error) {
            console.error("Error fetching leaves", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`https://attendance-and-payroll-management.onrender.com/api/${editingId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await axios.post("https://attendance-and-payroll-management.onrender.com/api/apply-leave", {
                    ...formData,
                    user_id: user?.user_id || user?.id,
                    user_name: user?.username || user?.name
                }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            setIsModalOpen(false);
            setEditingId(null);
            setFormData({ startDate: "", endDate: "", leaveType: "Sick Leave", reason: "" });
            fetchLeaves();
        } catch (error) {
            console.error("Error saving leave", error);
            alert("Failed to save leave request");
        }
    };

    const handleEdit = (leave) => {
        setEditingId(leave._id);
        setFormData({
            startDate: leave.startDate.split("T")[0],
            endDate: leave.endDate.split("T")[0],
            leaveType: leave.leaveType,
            reason: leave.reason,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this request?")) {
            try {
                await axios.delete(`https://attendance-and-payroll-management.onrender.com/api/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                fetchLeaves();
            } catch (error) {
                console.error("Error deleting leave", error);
            }
        }
    };

    const filteredLeaves = leaves.filter((leave) => {
        const matchesFilter = filter === "All" || leave.status === filter;
        const matchesSearch =
            leave.leaveType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            leave.reason.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case "Approved": return "bg-green-100 text-green-700 border-green-200";
            case "Rejected": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-yellow-100 text-yellow-700 border-yellow-200";
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Leave Requests</h1>
                        <p className="text-gray-500 mt-1">Track and manage your leave applications</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingId(null);
                            setFormData({ startDate: "", endDate: "", leaveType: "Sick Leave", reason: "" });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl hover:bg-purple-700 transition shadow-lg shadow-purple-200 font-medium"
                    >
                        <Plus size={20} /> Apply Leave
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        {["All", "Pending", "Approved", "Rejected"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${filter === status
                                    ? "bg-purple-600 text-white shadow-md shadow-purple-200"
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
                            placeholder="Search leave type or reason..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                        />
                    </div>
                </div>

                {/* Table Layout */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 uppercase text-xs tracking-wider font-semibold">
                                    <th className="p-4 pl-6">Leave Type</th>
                                    <th className="p-4">Duration</th>
                                    <th className="p-4">Reason</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredLeaves.map((leave) => (
                                    <tr key={leave._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 pl-6 font-medium text-gray-900">
                                            {leave.leaveType}
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            <div className="flex flex-col text-sm">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar size={14} className="text-purple-500" />
                                                    {new Date(leave.startDate).toLocaleDateString()}
                                                </span>
                                                <span className="text-xs text-gray-400 ml-5">to</span>
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar size={14} className="text-purple-500" />
                                                    {new Date(leave.endDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600 max-w-xs truncate" title={leave.reason}>
                                            {leave.reason}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 w-fit ${getStatusStyle(leave.status)}`}>
                                                {leave.status === 'Approved' && <CheckCircle size={14} />}
                                                {leave.status === 'Rejected' && <XCircle size={14} />}
                                                {leave.status === 'Pending' && <Clock size={14} />}
                                                {leave.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {leave.status === "Pending" ? (
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(leave)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit Request"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(leave._id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Request"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-gray-300 text-sm">Locked</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredLeaves.length === 0 && (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                    <AlertCircle size={32} />
                                </div>
                                <h3 className="text-gray-900 font-medium text-lg">No leave requests found</h3>
                                <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl transform transition-all scale-100 opacity-100">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                            <h2 className="text-xl font-bold text-gray-800">{editingId ? "Edit Leave Request" : "New Leave Request"}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Leave Type</label>
                                <select
                                    name="leaveType"
                                    value={formData.leaveType}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition bg-gray-50 focus:bg-white"
                                >
                                    <option>Sick Leave</option>
                                    <option>Casual Leave</option>
                                    <option>Earned Leave</option>
                                    <option>Maternity/Paternity Leave</option>
                                    <option>Unpaid Leave</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition bg-gray-50 focus:bg-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                                        className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition bg-gray-50 focus:bg-white"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason</label>
                                <textarea
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition bg-gray-50 focus:bg-white resize-none"
                                    placeholder="Please provide a valid reason..."
                                    required
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition shadow-lg shadow-purple-200 mt-2 flex justify-center items-center gap-2"
                            >
                                {editingId ? "Update Request" : "Submit Request"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leave;
