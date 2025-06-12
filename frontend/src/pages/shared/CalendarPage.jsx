import React from 'react';
import Calendar from '../../components/calendar/Calendar';
import UpcomingEvents from '../../components/calendar/UpcomingEvents';

const CalendarPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-semibold text-primary-800 mb-6">Academic Calendar</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Calendar />
        </div>
        <div>
          <UpcomingEvents limit={8} />
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
