import {React,useState,useEffect} from "react";
import { useNavigate } from "react-router-dom";

const PayrollSystem = () => {
const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
 const navigate =useNavigate();

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
    <div className="min-h-screen flex flex-col">
        <div className="flex-1 p-6 bg-gray-50">
          <h2 className="text-2xl font-semibold mb-4">Employees List</h2>

          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search The Employee By id or Name"
              value={searchTerm}
              onChange={(e)=>setSearchTerm(e.target.value)}
              className="w-full md:w-1/2 border border-gray-300 rounded px-4 py-2 focus:outline-none"
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="text-left px-6 py-3">Sr.no</th>
                  <th className="text-left px-6 py-3">Employee Id</th>
                  <th className="text-left px-6 py-3">Employee Name</th>
                  <th className="text-left px-6 py-3">Job Title</th>
                  <th className="text-left px-6 py-3">Employment Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length > 0 ? (
             filteredEmployees.map((emp, index) => (
                  <tr
                    key={index}
                    className="border-t border-gray-200 hover:bg-gray-50"
                    onClick={()=>navigate(`/payrollsystem/profile/${emp.user_id}`)}
                  >
                    <td className="px-6 py-4">{String(index + 1).padStart(2, "0")}</td>
                    <td className="px-6 py-4">{emp.user_id}</td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      {/* Avatar Circle with Icon */}
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5 text-red-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5.121 17.804A7.975 7.975 0 0112 15c2.21 0 4.21.896 5.879 2.345M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <span>{emp.username}</span>
                    </td>
                    <td className="px-6 py-4">{emp.employee_role}</td>
                    <td className="px-6 py-4">{emp.employmentType}</td>
                  </tr>
                ))
        ) : (
            <tr>
        <td colSpan="5" className="text-center text-gray-500 h-16">
          No users found.
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

export default PayrollSystem;
