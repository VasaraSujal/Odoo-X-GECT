import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../Redux/Slice';
import {
  Users,
  DollarSign,
  Calendar,
  Settings,
  User,
  Menu,
  X,
  LayoutDashboard,
  NotepadText,
  Phone,
} from "lucide-react";
import { useNavigate, useLocation } from 'react-router-dom';


const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);


  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/");
  };

  return (
    <div className="flex">
      {/* Toggle button for mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-full shadow"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white w-64 text-gray-800 shadow-sm z-40 transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:block`}
      >
        {/* Profile Section */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <img
              src="https://i.pravatar.cc/100"
              alt="Profile"
              className="w-14 h-14 rounded-full border"
            />
            <div>
              <h2 className="text-sm font-semibold">{user?.username}</h2>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-3">
            {[
              { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/emhome' },
              { label: 'Attendance', icon: <Users size={18} />, path: '/emattendance' },
              { label: 'Salary', icon: <DollarSign size={18} />, path: '/emsalary' },
              { label: 'Calendar', icon: <Calendar size={18} />, path: '/emcalendar' },
              { label: 'Profile', icon: <User size={18} />, path: `/emprofile/${user?.id}` },
              { label: 'Leave', icon: <NotepadText size={18} />, path: '/emleave' },
              // { label: 'Settings', icon: <Settings size={18} />, path: '/settings' },
              { label: 'Contect With HR', icon: <Phone size={18} />, path: '/emcontect' },
            ].map(({ label, icon, path }) => (
              <button
                key={path}
                onClick={() => {
                  navigate(path);
                  setIsOpen(false); // Close sidebar on mobile after click
                }}
                className={`flex items-center gap-3 p-2 rounded-lg w-full text-left transition ${isActive(path)
                    ? 'bg-indigo-100 text-indigo-600 font-semibold'
                    : 'hover:bg-gray-100'
                  }`}
              >
                {icon} <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="p-6">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg"
          >
            Log out
          </button>
        </div>
      </div>

      {/* Dummy content space to push real content to the right on desktop */}
      {/* <div className="hidden md:block w-64"></div> */}
    </div>
  );
};

export default Sidebar;
