import React, { useState, useEffect } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { useAuth } from '../../context/AuthContext';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import EventModal from './EventModal';
import DashboardCard from '../dashboard/DashboardCard';

const Calendar = () => {
  const {
    loading,
    error,
    selectedDate,
    setSelectedDate,
    selectedEvent,
    setSelectedEvent,
    fetchEvents
  } = useCalendar();

  const { user, isAdmin, isTeacher } = useAuth();

  // Check if user can create events (admin or teacher)
  const canCreateEvents = isAdmin || isTeacher;

  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'add', 'edit'

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    // Update month and year when selected date changes
    setCurrentMonth(selectedDate.getMonth());
    setCurrentYear(selectedDate.getFullYear());
  }, [selectedDate]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);

    // Only allow adding events for teachers and admins
    if (canCreateEvents) {
      setModalMode('add');
      setIsModalOpen(true);
    }
    // For students, just select the date but don't open the add modal
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditEvent = () => {
    setModalMode('edit');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className="calendar-container">
      <DashboardCard
        title="Academic Calendar"
        className="mb-6"
        headerClassName="bg-primary-50 text-primary-800"
        actions={
          canCreateEvents ? (
            <button
              onClick={handleAddEvent}
              className="inline-flex items-center px-3 py-1.5 border border-primary-500/30 text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
            >
              Add Event
            </button>
          ) : null
        }
        isLoading={loading}
      >
        {error ? (
          <div className="p-4 text-center text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <div className="p-2">
            <CalendarHeader
              currentMonth={currentMonth}
              currentYear={currentYear}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
            />
            <CalendarGrid
              currentMonth={currentMonth}
              currentYear={currentYear}
              onDateClick={handleDateClick}
              onEventClick={handleEventClick}
            />
          </div>
        )}
      </DashboardCard>

      {isModalOpen && (
        <EventModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          mode={modalMode}
          onEdit={handleEditEvent}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
};

export default Calendar;
