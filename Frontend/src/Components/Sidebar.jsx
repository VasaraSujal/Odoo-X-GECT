import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../Redux/Slice';
import {
  Users,
  DollarSign,
  Calendar,
  User,
  Menu,
  X,
  LayoutDashboard,
  NotepadText,
  Phone,
  LogOut
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
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden glass"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2.5 rounded-full shadow-lg text-text-sub hover:text-primary transition-all border border-border"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-surface text-text-main border-r border-border shadow-2xl md:shadow-none z-50 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Profile Card */}
        <div className="p-6 shrink-0">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-border/60 shadow-sm">
            <div className="relative shrink-0">
              <img
                src="https://i.pravatar.cc/100"
                alt="Profile"
                className="w-12 h-12 rounded-full ring-2 ring-white shadow-md object-cover"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <div className="overflow-hidden">
              <h2 className="text-sm font-bold text-text-main truncate">{user?.username || "Employee"}</h2>
              <p className="text-xs text-primary font-bold uppercase tracking-wider">{user?.role || "Team Member"}</p>
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable Area */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-1.5 custom-scrollbar pb-4">
          <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 mt-2">Menu</p>
          {[
            { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/emhome' },
            { label: 'Attendance', icon: <Users size={20} />, path: '/emattendance' },
            { label: 'Salary', icon: <DollarSign size={20} />, path: '/emsalary' },
            { label: 'Leave', icon: <NotepadText size={20} />, path: '/emleave' },
            { label: 'Calendar', icon: <Calendar size={20} />, path: '/emcalendar' },
            { label: 'Profile', icon: <User size={20} />, path: `/emprofile/${user?.id}` },
            // { label: 'Contact HR', icon: <Phone size={20} />, path: '/emcontect' },
          ].map(({ label, icon, path }) => {
            const active = isActive(path);
            return (
              <button
                key={path}
                onClick={() => {
                  navigate(path);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 p-2 rounded-lg w-full text-left transition ${isActive(path)
                    ? 'bg-indigo-100 text-indigo-600 font-semibold'
                    : 'hover:bg-gray-100'
                  }`}
              >
                {/* Icon Wrapper */}
                <span className={`transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {icon}
                </span>

                <span className="truncate">{label}</span>

                {/* Active Indicator */}
                {active && (
                  <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer / Logout - Fixed at Bottom */}
        <div className="p-4 border-t border-border shrink-0 bg-surface">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2.5 p-3.5 rounded-xl border border-border text-text-sub font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all duration-200 group"
          >
            <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
