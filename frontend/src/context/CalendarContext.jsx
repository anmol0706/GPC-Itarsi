import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import config from '../config';

const CalendarContext = createContext();

export const useCalendar = () => useContext(CalendarContext);

export const CalendarProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Define fetchEvents and fetchUpcomingEvents before using them in useEffect
  const fetchEvents = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${config.apiUrl}/api/calendar-events`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setEvents(response.data);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      setError('Failed to fetch calendar events');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, config.apiUrl]);

  const fetchUpcomingEvents = useCallback(async (limit = 5) => {
    if (!isAuthenticated) return;

    try {
      const response = await axios.get(`${config.apiUrl}/api/calendar-events/upcoming?limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setUpcomingEvents(response.data);
    } catch (err) {
      console.error('Error fetching upcoming events:', err);
      // Don't set error state here to avoid affecting the main calendar view
    }
  }, [isAuthenticated, config.apiUrl]);

  // Fetch events when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchEvents();
      fetchUpcomingEvents();
    } else {
      setEvents([]);
      setUpcomingEvents([]);
    }
  }, [isAuthenticated, user, fetchEvents, fetchUpcomingEvents]);

  const getEventById = useCallback(async (eventId) => {
    if (!isAuthenticated) return null;

    try {
      const response = await axios.get(`${config.apiUrl}/api/calendar-events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      return response.data;
    } catch (err) {
      console.error('Error fetching event details:', err);
      throw err;
    }
  }, [isAuthenticated, config.apiUrl]);

  const addEvent = useCallback(async (eventData) => {
    if (!isAuthenticated) return null;

    try {
      const response = await axios.post(
        `${config.apiUrl}/api/calendar-events`,
        eventData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Update events state
      setEvents(prevEvents => [...prevEvents, response.data]);

      // Refresh upcoming events
      fetchUpcomingEvents();

      return response.data;
    } catch (err) {
      console.error('Error adding event:', err);
      throw err;
    }
  }, [isAuthenticated, config.apiUrl, fetchUpcomingEvents]);

  const updateEvent = useCallback(async (eventId, eventData) => {
    if (!isAuthenticated) return null;

    try {
      const response = await axios.put(
        `${config.apiUrl}/api/calendar-events/${eventId}`,
        eventData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Update events state
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event._id === eventId ? response.data : event
        )
      );

      // Refresh upcoming events
      fetchUpcomingEvents();

      return response.data;
    } catch (err) {
      console.error('Error updating event:', err);
      throw err;
    }
  }, [isAuthenticated, config.apiUrl, fetchUpcomingEvents]);

  const deleteEvent = useCallback(async (eventId) => {
    if (!isAuthenticated) return false;

    try {
      await axios.delete(`${config.apiUrl}/api/calendar-events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Update events state
      setEvents(prevEvents =>
        prevEvents.filter(event => event._id !== eventId)
      );

      // Refresh upcoming events
      fetchUpcomingEvents();

      return true;
    } catch (err) {
      console.error('Error deleting event:', err);
      throw err;
    }
  }, [isAuthenticated, config.apiUrl, fetchUpcomingEvents]);

  // Helper function to get events for a specific date
  const getEventsForDate = useCallback((date) => {
    const dateString = date.toISOString().split('T')[0];

    return events.filter(event => {
      const eventStartDate = new Date(event.startDate).toISOString().split('T')[0];
      const eventEndDate = new Date(event.endDate).toISOString().split('T')[0];

      // Check if the date falls within the event's date range
      return dateString >= eventStartDate && dateString <= eventEndDate;
    });
  }, [events]);

  // Helper function to get events for a specific month
  const getEventsForMonth = useCallback((year, month) => {
    return events.filter(event => {
      const eventStartDate = new Date(event.startDate);
      const eventEndDate = new Date(event.endDate);

      // Check if the event overlaps with the specified month
      return (
        (eventStartDate.getFullYear() === year && eventStartDate.getMonth() === month) ||
        (eventEndDate.getFullYear() === year && eventEndDate.getMonth() === month) ||
        (eventStartDate < new Date(year, month, 1) && eventEndDate > new Date(year, month + 1, 0))
      );
    });
  }, [events]);

  const value = {
    events,
    upcomingEvents,
    loading,
    error,
    selectedDate,
    selectedEvent,
    setSelectedDate,
    setSelectedEvent,
    fetchEvents,
    fetchUpcomingEvents,
    getEventById,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
    getEventsForMonth
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

export default CalendarContext;
