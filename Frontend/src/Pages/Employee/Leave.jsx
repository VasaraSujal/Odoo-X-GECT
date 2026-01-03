import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Edit2, Trash2, Plus, X, CheckCircle, Clock, XCircle } from "lucide-react";

const Leave = () => {
    const [leaves, setLeaves] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        startDate: "",
        endDate: "",
        leaveType: "Sick Leave",
        reason: "",
    });
    const [editingId, setEditingId] = useState(null);
    const { token, user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (user) fetchLeaves();
    }, [user]);

    const fetchLeaves = async () => {
        try {
            // Updated User ID format support (fallback)
            const userId = user?.user_id || user?.id;
            const response = await axios.get(`http://localhost:5500/api/my-leaves/${userId}`, {
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
                await axios.put(`http://localhost:5500/api/${editingId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await axios.post("http://localhost:5500/api/apply-leave", {
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
            alert("Failed to save leave request: " + (error.response?.data?.message || error.message));
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
                await axios.delete(`http://localhost:5500/api/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                fetchLeaves();
            } catch (error) {
                console.error("Error deleting leave", error);
            }
        }
    };

    const getStatusIcon = (status) => {
        if (status === "Approved") return <CheckCircle className="text-green-500" size={20} />;
        if (status === "Rejected") return <XCircle className="text-red-500" size={20} />;
        return <Clock className="text-yellow-500" size={20} />;
    };

    const getStatusClass = (status) => {
        if (status === "Approved") return "bg-green-100 text-green-700 border-green-200";
        if (status === "Rejected") return "bg-red-100 text-red-700 border-red-200";
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">My Leave Requests</h1>
                        <p className="text-gray-500 mt-1">Manage your leave applications and check status</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingId(null);
                            setFormData({ startDate: "", endDate: "", leaveType: "Sick Leave", reason: "" });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition shadow-sm"
                    >
                        <Plus size={20} /> Apply Leave
                    </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {leaves.map((leave) => (
                        <div key={leave._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${getStatusClass(leave.status)}`}>
                                    {getStatusIcon(leave.status)}
                                    {leave.status}
                                </span>
                                {leave.status === "Pending" && (
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(leave)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(leave._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-lg transition">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <h3 className="text-lg font-semibold text-gray-800 mb-1">{leave.leaveType}</h3>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{leave.reason}</p>

                            <div className="flex items-center justify-between text-sm border-t pt-4 text-gray-600">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-semibold">From</p>
                                    <p className="font-medium">{new Date(leave.startDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-semibold text-right">To</p>
                                    <p className="font-medium text-right">{new Date(leave.endDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {leaves.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                            <Clock size={48} className="mx-auto mb-3 opacity-50" />
                            <p>No leave requests found. Apply for one!</p>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl transform transition-all scale-100 opacity-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">{editingId ? "Edit Leave" : "Apply for Leave"}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                                <select
                                    name="leaveType"
                                    value={formData.leaveType}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                                        className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                                <textarea
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                    placeholder="Why are you taking leave?"
                                    required
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 mt-2"
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
