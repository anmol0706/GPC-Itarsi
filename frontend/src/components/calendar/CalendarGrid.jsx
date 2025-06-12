import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useCalendar } from '../../context/CalendarContext';

const CalendarGrid = ({ currentMonth, currentYear, onDateClick, onEventClick }) => {
  const { getEventsForMonth } = useCalendar();

  // Generate calendar days for the current month
  const calendarDays = useMemo(() => {
    const days = [];
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();

    // Add days from previous month to fill the first row
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevMonthDay = prevMonthLastDay - i;
      const date = new Date(currentYear, currentMonth - 1, prevMonthDay);
      days.push({
        date,
        day: prevMonthDay,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date())
      });
    }

    // Add days for current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      days.push({
        date,
        day,
        isCurrentMonth: true,
        isToday: isSameDay(date, new Date())
      });
    }

    // Add days from next month to fill the last row
    const remainingDays = 42 - days.length; // 6 rows x 7 days = 42
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(currentYear, currentMonth + 1, day);
      days.push({
        date,
        day,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date())
      });
    }

    return days;
  }, [currentMonth, currentYear]);

  // Get events for the current month
  const monthEvents = useMemo(() => {
    return getEventsForMonth(currentYear, currentMonth);
  }, [getEventsForMonth, currentYear, currentMonth]);

  // Helper function to check if two dates are the same day
  function isSameDay(date1, date2) {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  // Get events for a specific day
  const getEventsForDay = (date) => {
    return monthEvents.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);

      // Check if the date falls within the event's date range
      return date >= new Date(eventStart.setHours(0, 0, 0, 0)) &&
             date <= new Date(eventEnd.setHours(23, 59, 59, 999));
    });
  };

  // Weekday labels
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="calendar-grid">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-primary-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDay(day.date);

          return (
            <div
              key={index}
              className={`min-h-[100px] p-1 border rounded-md ${
                day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
              } ${day.isToday ? 'border-accent-500' : 'border-gray-200'}`}
              onClick={() => onDateClick(day.date)}
            >
              <div className={`text-right text-sm font-medium ${
                day.isCurrentMonth
                  ? day.isToday
                    ? 'text-accent-600'
                    : 'text-gray-900'
                  : 'text-gray-400'
              }`}>
                {day.day}
              </div>

              <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px]">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event._id}
                    className="text-xs p-1 rounded truncate cursor-pointer"
                    style={{ backgroundColor: `${event.color}20`, color: event.color }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                  >
                    {event.title}
                  </div>
                ))}

                {dayEvents.length > 3 && (
                  <div className="text-xs text-primary-500 text-center">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

CalendarGrid.propTypes = {
  currentMonth: PropTypes.number.isRequired,
  currentYear: PropTypes.number.isRequired,
  onDateClick: PropTypes.func.isRequired,
  onEventClick: PropTypes.func.isRequired
};

export default CalendarGrid;
