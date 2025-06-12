import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

const AttendanceCalendar = ({ attendanceData }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get days in month
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return new Date(year, month + 1, 0).getDate();
  }, [currentMonth]);

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return new Date(year, month, 1).getDay();
  }, [currentMonth]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    if (!attendanceData || !attendanceData.attendance) {
      return [];
    }

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Create array for all days in the month
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month, i + 1);
      const dateString = date.toISOString().split('T')[0];

      // Find attendance records for this date
      const dayRecords = attendanceData.attendance.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getFullYear() === year &&
               recordDate.getMonth() === month &&
               recordDate.getDate() === i + 1;
      });

      return {
        date,
        dateString,
        day: i + 1,
        records: dayRecords,
        hasRecords: dayRecords.length > 0,
        allPresent: dayRecords.length > 0 && dayRecords.every(record => record.present),
        allAbsent: dayRecords.length > 0 && dayRecords.every(record => !record.present),
        partialPresent: dayRecords.length > 0 && dayRecords.some(record => record.present) && dayRecords.some(record => !record.present)
      };
    });

    // Add empty slots for days before the first day of the month
    const emptyDaysBefore = Array.from({ length: firstDayOfMonth }, (_, i) => ({
      isEmpty: true,
      id: `empty-before-${i}`
    }));

    return [...emptyDaysBefore, ...days];
  }, [currentMonth, daysInMonth, firstDayOfMonth, attendanceData]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      const prevMonth = new Date(prev);
      prevMonth.setMonth(prev.getMonth() - 1);
      return prevMonth;
    });
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      const nextMonth = new Date(prev);
      nextMonth.setMonth(prev.getMonth() + 1);
      return nextMonth;
    });
  };

  // Format month and year
  const monthYearString = useMemo(() => {
    const options = { month: 'long', year: 'numeric' };
    return currentMonth.toLocaleDateString(undefined, options);
  }, [currentMonth]);

  // Get day cell class based on attendance
  const getDayCellClass = (day) => {
    if (!day.hasRecords) return 'bg-gray-50';
    if (day.allPresent) return 'bg-green-50 border-green-200';
    if (day.allAbsent) return 'bg-red-50 border-red-200';
    if (day.partialPresent) return 'bg-yellow-50 border-yellow-200';
    return 'bg-gray-50';
  };

  // Get day number class based on attendance
  const getDayNumberClass = (day) => {
    if (!day.hasRecords) return 'text-gray-500';
    if (day.allPresent) return 'text-green-700 font-medium';
    if (day.allAbsent) return 'text-red-700 font-medium';
    if (day.partialPresent) return 'text-yellow-700 font-medium';
    return 'text-gray-500';
  };

  // Check if a day is today
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-primary-800">Attendance Calendar</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Previous month"
          >
            <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-700">{monthYearString}</span>
          <button
            onClick={goToNextMonth}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Next month"
          >
            <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, index) => (
          <div
            key={day.isEmpty ? day.id : day.dateString}
            className={`relative h-12 border rounded-md ${
              day.isEmpty ? 'border-transparent' : isToday(day.date) ? 'border-accent-500' : `border-gray-200 ${getDayCellClass(day)}`
            }`}
          >
            {!day.isEmpty && (
              <>
                <div className={`absolute top-1 left-1 text-xs ${getDayNumberClass(day)}`}>
                  {day.day}
                </div>

                {day.hasRecords && (
                  <div className="absolute bottom-1 right-1 flex space-x-0.5">
                    {day.records.map((record, recordIndex) => (
                      <div
                        key={recordIndex}
                        className={`w-1.5 h-1.5 rounded-full ${record.present ? 'bg-green-500' : 'bg-red-500'}`}
                        title={`${record.subject}: ${record.present ? 'Present' : 'Absent'}`}
                      ></div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-center items-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
            <span>Present</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
            <span>Absent</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
            <span>Partial</span>
          </div>
        </div>
      </div>
    </div>
  );
};

AttendanceCalendar.propTypes = {
  attendanceData: PropTypes.object
};

export default AttendanceCalendar;
