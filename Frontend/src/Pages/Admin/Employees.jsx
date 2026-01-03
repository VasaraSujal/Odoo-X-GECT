import { React, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Filter, Download } from 'lucide-react';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("https://attendance-and-payroll-management.onrender.com/api/all");
        if (!response.ok) {
          throw new Error("Failed to fetch employees");
        }
        const data = await response.json();
        setEmployees(data.users);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(emp =>
    emp.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-main">Employees</h2>
          <p className="text-text-sub text-sm">Manage your team members and their details.</p>
        </div>
        <button
          onClick={() => navigate('/hraddemployee')}
          className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/30">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by ID, Name or Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button className="p-2.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary transition-colors border border-border bg-white">
              <Filter size={18} />
            </button>
            <button className="p-2.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary transition-colors border border-border bg-white">
              <Download size={18} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-text-sub border-b border-border">
              <tr>
                <th className="px-6 py-4 w-16">No.</th>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Role & Designation</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp, index) => (
                  <tr
                    key={index}
                    onClick={() => navigate(`/hremployees/profile/${emp.user_id}`)}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 text-text-sub font-mono text-xs">{String(index + 1).padStart(2, "0")}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-primary font-bold text-lg border border-primary/10">
                          {emp.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-text-main group-hover:text-primary transition-colors">{emp.username}</p>
                          <p className="text-xs text-text-sub">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-sub font-mono text-xs bg-gray-50/50 rounded-md w-fit px-2 py-1">{emp.user_id}</td>
                    <td className="px-6 py-4">
                      <p className="text-text-main font-medium">{emp.designation}</p>
                      <p className="text-xs text-text-sub">{emp.role}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${emp.employmentType === 'Full Time' ? 'bg-green-100 text-green-700 ring-1 ring-green-600/20' :
                          emp.employmentType === 'Part Time' ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-600/20' :
                            'bg-gray-100 text-gray-700 ring-1 ring-gray-600/20'
                        }`}>
                        {emp.employmentType || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary hover:text-primary-hover font-medium text-xs">View Profile</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="p-3 bg-gray-50 rounded-full">
                        <Filter size={24} className="text-gray-300" />
                      </div>
                      <p>No employees found matching your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Employees;