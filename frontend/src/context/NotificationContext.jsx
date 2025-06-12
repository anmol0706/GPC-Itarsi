import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import config from '../config';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications when user is authenticated
  useEffect(() => {
    const fetchData = async () => {
      if (isAuthenticated && user) {
        setLoading(true);
        setError(null);

        try {
          const response = await axios.get(`${config.apiUrl}/api/notifications`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });

          setNotifications(response.data);
        } catch (err) {
          console.error('Error fetching notifications:', err);
          setError('Failed to fetch notifications');
        } finally {
          setLoading(false);
        }
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    fetchData();
  }, [isAuthenticated, user]);

  // Calculate unread count whenever notifications change
  useEffect(() => {
    const count = notifications.filter(notification => !notification.isRead).length;
    setUnreadCount(count);
  }, [notifications]);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${config.apiUrl}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setNotifications(response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch notifications');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    if (!isAuthenticated) return;

    try {
      const response = await axios.put(
        `${config.apiUrl}/api/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Update the notification in the state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      return response.data;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  };

  const markAllAsRead = async () => {
    if (!isAuthenticated) return;

    try {
      await axios.put(
        `${config.apiUrl}/api/notifications/read-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Update all notifications in the state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!isAuthenticated) return;

    try {
      await axios.delete(`${config.apiUrl}/api/notifications/${notificationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Remove the notification from the state
      setNotifications(prevNotifications =>
        prevNotifications.filter(notification => notification._id !== notificationId)
      );
    } catch (err) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  };

  const addNotification = async (notification) => {
    if (!isAuthenticated) return;

    try {
      const response = await axios.post(
        `${config.apiUrl}/api/notifications`,
        notification,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Add the new notification to the state
      setNotifications(prevNotifications => [response.data, ...prevNotifications]);

      return response.data;
    } catch (err) {
      console.error('Error adding notification:', err);
      throw err;
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
