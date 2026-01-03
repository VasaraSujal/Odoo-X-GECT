import React, { useEffect, useState } from "react";
import axios from "axios";

const EmployeeProfile = () => {
  const [profile, setProfile] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    profileImage: "",
  });

  const fetchProfile = async () => {
    try {
      const res = await axios.get("/api/profile", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setProfile(res.data);
      setFormData(res.data);
    } catch (error) {
      console.error("Failed to fetch profile", error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      await axios.put("/api/profile", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setEditMode(false);
      fetchProfile();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">My Profile</h2>
      <div className="space-y-4">
        {["name", "email", "phone", "department"].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium capitalize">{field}</label>
            <input
              type="text"
              name={field}
              value={formData[field]}
              onChange={handleChange}
              disabled={!editMode}
              className="border px-4 py-2 w-full rounded-md"
            />
          </div>
        ))}
        {editMode ? (
          <button onClick={handleUpdate} className="bg-green-600 text-white px-4 py-2 rounded-md">
            Save Changes
          </button>
        ) : (
          <button onClick={() => setEditMode(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md">
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default EmployeeProfile;
