import React from 'react';
import AttendanceNew from '../../Components/attendance';

const AttendancePage = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* The premium AttendanceNew component handles its own layout and containers */}
      <AttendanceNew />
    </div>
  );
};

export default AttendancePage;
