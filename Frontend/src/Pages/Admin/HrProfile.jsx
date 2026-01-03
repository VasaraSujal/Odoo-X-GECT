import React, { useState,useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import {cacheUser} from '../../Redux/Slice'
import { FaDownload, FaEnvelope, FaPhone, FaGlobe, FaCalendarAlt,FaRupeeSign,FaRegClock } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";

const Hrprofile = () => {
  const [tab, setTab] = useState("Personal Info");

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-64px)]">
            <Profile/>
            <div className="flex-1 bg-white p-6 rounded-2xl shadow-md flex flex-col">
              <nav className="flex gap-4 border-b pb-3 mb-4 text-sm font-medium">
                {["Personal Info", "Salary Info"].map((t) => (
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
                           {tab === "Personal Info" && <InfoTab />}
                           {tab === "Salary Info" && <SalaryInfoTab />}
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
  
    
    const response= await fetch(`https://attendance-and-payroll-management.onrender.com/api/users/${id}`);
    
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
      <p className="text-sm text-gray-500">UX Designer</p>
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
          <p className="text-sm font-medium text-green-600">₹{employee.salary}</p>
          <p className="text-xs text-gray-400">Salary</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="p-2 bg-gray-100 rounded-md">
        <FaRegClock  className="text-gray-500 mt-1" />
        </div>
        <div>
          <p className="text-sm font-medium">Regular</p>
          <p className="text-xs text-gray-400">{employee.employmentType}</p>
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
  const [employee, setEmployee] = useState(null);
  const [message, setMessage] = useState("Loading...");
  const [showModal, setShowModal] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);
   
  const userFromStore = useSelector((state) => state.auth.usersdata[id]);
  console.log("3. InfoTab rendered");

  useEffect(() => {
    if (userFromStore) {
      setEmployee(userFromStore);
      console.log("Fatching data from cach in info tab")
        console.log("4. InfoTab useEffect triggered (cache check)");
    }else{
    setMessage("User data is not found for this user. Please add the user info.");
    return;
    }
  }, [userFromStore]);

    const openModal = (mode, data = null) => {
    setFormMode(mode);
    setSelectedEmployeeData(data);
    setShowModal(true);
  };  
  
  if (!employee) return <p>Loading...</p>;

  return (
    <>
    <div className="space-y-5 text-gray-700">
      {employee ? (
        <>
          <h3 className="text-xl font-semibold border-b pb-2">
            User {employee.user_id} Profile Info
          </h3>

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

          {/* Buttons */}
          <div className="pt-2">
            <button
              onClick={() => openModal("update", employee)}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              ✏️ Update Your Profile
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-red-600 font-medium">{message}</p>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <ProfileModal
          mode={formMode}
          employeeId={id}
          defaultData={formMode === "update" ? selectedEmployeeData : {}}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
    </>
  );
}

function SalaryInfoTab() {
  const { id } = useParams();

  const [employee, setEmployee] = useState(null);
  const [message, setMessage] = useState("Loading...");



  useEffect(() => {
    if (!id) return;

    const fetchSalaryInfo = async () => {
      try {
        const response = await fetch(`https://attendance-and-payroll-management.onrender.com/api/usersalaryinfo/${id}`);

        if (!response.ok) {
          setMessage("Salary data is not found for this user. Please add the user info.");
          return;
        }

        const data = await response.json();
        setEmployee(data);
      } catch (error) {
        console.error("Error fetching salary info:", error);
        setMessage("Something went wrong while fetching salary info.");
      }
    };

    fetchSalaryInfo();
  }, [id]);

  return (
    <div className="space-y-6 text-gray-700">
      {employee ? (
        <>
          <h3 className="text-xl font-semibold border-b pb-2">
            User {employee.user_id} Salary Info
          </h3>

          {/* Personal Info */}
          <div>
            <h4 className="text-md font-semibold mb-2 text-indigo-600">👤 Personal Details</h4>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <p><span className="font-medium">Full Name:</span> {employee.employee_name}</p>
              <p><span className="font-medium">Employee ID:</span> {employee.employee_id}</p>
              <p><span className="font-medium">Base Salary:</span> ₹{employee.base_salary}</p>
              <p><span className="font-medium">Joining Date:</span> {employee.joining_date}</p>
            </div>
          </div>

          {/* Bonus Info */}
          <div>
            <h4 className="text-md font-semibold mb-2 text-indigo-600">💰 Bonus</h4>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <p><span className="font-medium">Bonus:</span> ₹{employee.bonus}</p>
              <p><span className="font-medium">HRA:</span> ₹{employee.hra}</p>
            </div>
          </div>

          {/* Deductions Info */}
          <div>
            <h4 className="text-md font-semibold mb-2 text-indigo-600">➖ Deductions</h4>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <p><span className="font-medium">Tax Percent:</span> {employee.tax_percent}%</p>
              <p><span className="font-medium">PF Percent:</span> {employee.pf_percent}%</p>
            </div>
          </div>

          {/* Updates */}
          <div>
            <h4 className="text-md font-semibold mb-2 text-indigo-600">🔄 Updates</h4>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <p><span className="font-medium">Updated By:</span> {employee.updated_by}</p>
               <p><span className="font-medium">Last Update:</span> {(employee.last_update).split("T")[0]}</p>
            </div>
          </div>
        </>
      ) : (
        <>
          <p className="text-red-600 font-medium">{message}</p>
        </>
      )}
    </div>
  );
}

const ProfileModal = ({ mode = "update", employeeId, defaultData = {}, onClose }) => {
    const user = useSelector((state) => state.auth.user);
    console.log("Hr data is",user)
    const [formData, setFormData] = useState({
    user_id:"",
    username:"",
    email:"",
    mobile:"",  
    address:"",
    bankAccount:"",
    gender:"",
    IFSC:"",
    emergencyContact:"",
    emergencyContactname:"",
   });

  const [message, setMessage] = useState("");
  

  // Pre-fill form for update
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

    const url =`https://attendance-and-payroll-management.onrender.com/api/update/${user.id}`;

    const method = "PUT";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        
      });

      const result = await response.json();
      console.log("result send is",result)
      if (!response.ok) throw new Error(result.message);

      setMessage(result.message);
      setTimeout(() => {
        onClose(); // Close modal after success
      }, 1000);
    } catch (err) {
      setMessage(err.message);
    }
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white max-w-2xl w-full rounded-xl shadow-xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 right-4 text-lg text-gray-500 hover:text-red-600">✖</button>

        <h2 className="text-xl font-semibold mb-4 text-center">
          {mode === "add" ? "Add Salary Info" : "Update Salary Info"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <input type="text" name="employee_id" value={formData.user_id} onChange={handleChange} placeholder="Employee ID" disabled={mode === "update"} className="border p-2 rounded" />
            <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Employee Name" className="border p-2 rounded" />
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="border p-2 rounded" />
            <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Mobile" className="border p-2 rounded" />
            <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="border p-2 rounded" />
            <input type="text" name="bankAccount" value={formData.bankAccount} onChange={handleChange} placeholder="Bank Account" className="border p-2 rounded" />
            <input type="text" name="IFSC" value={formData.IFSC} onChange={handleChange} placeholder="IFSC Code" className="border p-2 rounded" />
            <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} placeholder="emergencyContact" className="border p-2 rounded" />
            <input type="text" name="emergencyContactname" value={formData.emergencyContactname} onChange={handleChange} placeholder="emergencyContactname" className="border p-2 rounded" />
          </div>

          <button type="submit" className="w-full mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            {mode === "add" ? "Add Info" : "Update Info"}
          </button>
        </form>

        {message && <p className="text-center text-sm mt-3 text-green-600">{message}</p>}
      </div>
    </div>
  );
};

export default Hrprofile;