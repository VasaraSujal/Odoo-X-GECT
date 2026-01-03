import React from 'react';
import { Bell, Search } from 'lucide-react';

const Header = () => {
  return (
    <header className="w-full bg-surface border-b border-border shadow-sm px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 sticky top-0 z-30 transition-all duration-300">
      {/* Branding */}
      <div className="flex items-center space-x-3">
        <img
          src="https://res.cloudinary.com/doqzxuxb1/image/upload/v1748249798/Attendance%20And%20Payroll%20Managment/eanj5h57izb4wsvgkzhc.png"
          alt="logo"
          className="h-9 w-auto hover:opacity-90 transition-opacity"
        />
        <span className="text-xl font-bold text-primary tracking-tight hidden md:block">
          OdooX
        </span>
      </div>

      {/* Search Bar - hidden on small screens */}
      <div className="hidden sm:flex w-full sm:w-1/2 md:w-1/3 items-center bg-gray-50/50 border border-border rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all duration-300">
        <Search className="w-4 h-4 text-gray-400 mr-3" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent w-full focus:outline-none text-sm text-text-main placeholder-gray-400"
        />
      </div>

      {/* Notification Bell - hidden on small screens */}
      <div className="hidden sm:flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-accent/50 text-gray-500 hover:text-primary transition-colors duration-200 group">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full border border-white group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </header>
  );
};

export default Header;
