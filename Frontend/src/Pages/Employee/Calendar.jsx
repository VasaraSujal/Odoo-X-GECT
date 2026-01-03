import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import dayjs from 'dayjs';
import Sidebar from '../../Components/Sidebar';
import Header from '../../Components/Header';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [holidays, setHolidays] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetch("https://attendance-and-payroll-management.onrender.com/api/holidays")
      .then(res => res.json())
      .then(data => {
        const map = {};
        data.forEach(h => {
          map[h.date] = h.reason;
        });
        setHolidays(map);
      })
      .catch(err => console.error("Error loading holidays:", err));
  }, []);

  const startOfMonth = currentDate.startOf('month');
  const startDay = startOfMonth.day(); // Sunday = 0
  const daysInMonth = currentDate.daysInMonth();

  const prevMonth = () => setCurrentDate(currentDate.subtract(1, 'month'));
  const nextMonth = () => setCurrentDate(currentDate.add(1, 'month'));

  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const handleDayClick = (day) => {
    const fullDate = currentDate.date(day).format('YYYY-MM-DD');
    if (holidays[fullDate]) {
      setSelectedDate({ date: fullDate, reason: holidays[fullDate] });
    } else {
      setSelectedDate(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f4f7fc] to-[#e9eff8]">
        <div className="flex-1 h-[calc(100vh-64px)] overflow-y-auto p-6 space-y-6 bg-gray-50">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Company Holiday Calendar</h2>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-400"></div>
              <span className="text-gray-600">Company Holiday</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <span className="text-gray-600">Sunday (Holiday)</span>
            </div>
          </div>

          {/* Calendar Box */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {/* Month Header */}
            <div className="flex justify-between items-center mb-6">
              <button onClick={prevMonth}>
                <ChevronLeft className="w-6 h-6 text-gray-600 hover:text-black" />
              </button>
              <h3 className="text-xl font-semibold text-gray-800">
                {currentDate.format('MMMM YYYY')}
              </h3>
              <button onClick={nextMonth}>
                <ChevronRight className="w-6 h-6 text-gray-600 hover:text-black" />
              </button>
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-500 mb-3">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-3 text-center text-sm">
              {days.map((day, idx) => {
                if (!day) return <div key={idx}></div>;

                const fullDate = currentDate.date(day).format('YYYY-MM-DD');
                const weekDay = currentDate.date(day).day();
                const isToday =
                  day === dayjs().date() &&
                  currentDate.month() === dayjs().month() &&
                  currentDate.year() === dayjs().year();

                const isHoliday = holidays[fullDate];
                const isSunday = weekDay === 0;

                return (
                  <div
                    key={idx}
                    onClick={() => handleDayClick(day)}
                    className={`cursor-pointer rounded-lg p-2 h-20 flex flex-col items-center justify-center transition 
                      ${isToday ? 'ring-2 ring-blue-500' : ''}
                      ${
                        isHoliday
                          ? 'bg-purple-100 text-purple-700 font-semibold border border-purple-300 shadow-sm'
                          : isSunday
                          ? 'text-red-500 font-medium'
                          : 'text-gray-700 hover:bg-blue-50'
                      }`}
                    title={isHoliday ? holidays[fullDate] : isSunday ? 'Sunday' : ''}
                  >
                    <div className="text-base">{day}</div>
                    {isHoliday && (
                      <div className="text-xs mt-1">{holidays[fullDate]}</div>
                    )}
                    {isSunday && !isHoliday && (
                      <div className="text-xs mt-1">Holiday</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Holiday Info Below Calendar */}
          {selectedDate && (
            <div className="mt-6 bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
              <h4 className="text-lg font-semibold text-purple-700 mb-2">Holiday Information</h4>
              <p className="text-sm"><strong>Date:</strong> {selectedDate.date}</p>
              <p className="text-sm"><strong>Reason:</strong> {selectedDate.reason}</p>
            </div>
          )}
        </div>
    </div>
  );
};

export default Calendar;
