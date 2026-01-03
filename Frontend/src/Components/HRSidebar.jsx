import React, { useState } from 'react';
import {
  Users,
  LayoutDashboard,
  UserPlus,
  Wallet,
  Calendar,
  Settings,
  User,
  Menu,
  X,
  UserRoundPen,
  NotepadText,
} from "lucide-react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };
  const user = useSelector((state) => state.auth.user);
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
              { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/hrhome' },
              { label: 'Employees', icon: <Users size={18} />, path: '/hremployees' },
              { label: 'Add Employee', icon: <UserPlus size={18} />, path: '/hraddemployee' },
              { label: 'Payroll System', icon: <Wallet size={18} />, path: '/hrpayrollsystem' },
              { label: 'Calendar', icon: <Calendar size={18} />, path: '/hrcalendar' },
              { label: 'Profile', icon: <User size={18} />, path: `/hrprofile/${user?.id}` },
              { label: 'Leave Requests', icon: <NotepadText size={18} />, path: '/hrleaverequests' },
              // { label: 'Settings', icon: <Settings size={18} />, path: '/settings' },
              { label: 'Employee Queries', icon: <UserRoundPen size={18} />, path: '/hrquery' },
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
    </div>
  );
};

export default Sidebar;
