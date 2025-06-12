import React, { useEffect, useState } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import DashboardCard from '../dashboard/DashboardCard';
import { Link } from 'react-router-dom';

const UpcomingEvents = ({ limit = 5 }) => {
  const { upcomingEvents, fetchUpcomingEvents, loading } = useCalendar();
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchUpcomingEvents(limit);
  }, [fetchUpcomingEvents, limit]);

  // Get event type icon
  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'class':
        return (
          <div className="p-2 rounded-full bg-success/10 text-success">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        );
      case 'exam':
        return (
          <div className="p-2 rounded-full bg-error/10 text-error">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      case 'lab':
        return (
          <div className="p-2 rounded-full bg-primary-100 text-primary-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
        );
      case 'event':
        return (
          <div className="p-2 rounded-full bg-accent-100 text-accent-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        );
      case 'deadline':
        return (
          <div className="p-2 rounded-full bg-warning/10 text-warning">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'holiday':
        return (
          <div className="p-2 rounded-full bg-primary-50 text-primary-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="p-2 rounded-full bg-primary-50 text-primary-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
    }
  };

  // Format date for display
  const formatEventDate = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const isSameDay = start.toDateString() === end.toDateString();

    if (isSameDay) {
      return (
        <>
          <span className="font-medium">{start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          <span className="text-gray-500 ml-2">
            {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </>
      );
    } else {
      return (
        <>
          <span className="font-medium">
            {start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} - {end.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </>
      );
    }
  };

  // Calculate days remaining
  const getDaysRemaining = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventDate = new Date(date);
    eventDate.setHours(0, 0, 0, 0);

    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    return `In ${diffDays} days`;
  };

  return (
    <DashboardCard
      title="Upcoming Events"
      className="mb-6"
      headerClassName="bg-primary-100 text-primary-800"
      noHoverEffect={true}
      actions={
        <Link
          to="/calendar"
          className="text-sm font-medium text-accent-600"
        >
          View Calendar
        </Link>
      }
      isLoading={loading}
    >
      {upcomingEvents.length === 0 ? (
        <div className="p-6 text-center text-primary-500 bg-primary-50 rounded-md">
          <svg className="mx-auto h-12 w-12 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-2">No upcoming events</p>
          <p className="mt-1 text-sm">Your schedule is clear for now.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {upcomingEvents.map((event) => (
            <div
              key={event._id}
              className="p-4 cursor-pointer"
              onClick={() => setSelectedEvent(event)}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  {getEventTypeIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-medium" style={{ color: event.color }}>
                        {event.title}
                      </h3>
                      <p className="mt-1 text-sm text-primary-600">
                        {formatEventDate(event.startDate, event.endDate)}
                      </p>
                      {event.location && (
                        <p className="mt-1 text-xs text-primary-500 flex items-center">
                          <svg className="mr-1 h-3 w-3 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {event.location}
                        </p>
                      )}
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${event.color}20`, color: event.color }}>
                      {getDaysRemaining(event.startDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center" style={{ backgroundColor: `${selectedEvent.color}10` }}>
              <h3 className="text-lg font-medium" style={{ color: selectedEvent.color }}>
                Event Details
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-3">
              <h4 className="text-xl font-semibold text-gray-900">
                {selectedEvent.title}
              </h4>

              <div className="flex items-center text-sm text-gray-600">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>
                  {new Date(selectedEvent.startDate).toLocaleDateString()} {new Date(selectedEvent.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {' '} - {' '}
                  {new Date(selectedEvent.endDate).toLocaleDateString()} {new Date(selectedEvent.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {selectedEvent.location && (
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{selectedEvent.location}</span>
                </div>
              )}

              {selectedEvent.description && (
                <div className="mt-2">
                  <p className="text-sm text-gray-700 whitespace-pre-line">{selectedEvent.description}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${selectedEvent.color}20`, color: selectedEvent.color }}>
                  {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
                </span>

                {selectedEvent.forClass && selectedEvent.forClass !== 'all' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {selectedEvent.forClass}
                  </span>
                )}

                {selectedEvent.forSubject && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {selectedEvent.forSubject}
                  </span>
                )}

                {selectedEvent.isRecurring && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Recurring
                  </span>
                )}
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
              <Link
                to="/calendar"
                className="w-full inline-flex justify-center rounded-md border border-primary-500/30 shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
              >
                View in Calendar
              </Link>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => setSelectedEvent(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardCard>
  );
};

export default UpcomingEvents;
