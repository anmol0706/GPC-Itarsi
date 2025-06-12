import React from 'react';
import PropTypes from 'prop-types';

const CalendarHeader = ({ currentMonth, currentYear, onPrevMonth, onNextMonth }) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={onPrevMonth}
        className="p-2 rounded-full hover:bg-primary-100 focus:outline-none"
        aria-label="Previous month"
      >
        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>

      <h2 className="text-xl font-semibold text-primary-800">
        {months[currentMonth]} {currentYear}
      </h2>

      <button
        onClick={onNextMonth}
        className="p-2 rounded-full hover:bg-primary-100 focus:outline-none"
        aria-label="Next month"
      >
        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
    </div>
  );
};

CalendarHeader.propTypes = {
  currentMonth: PropTypes.number.isRequired,
  currentYear: PropTypes.number.isRequired,
  onPrevMonth: PropTypes.func.isRequired,
  onNextMonth: PropTypes.func.isRequired
};

export default CalendarHeader;
