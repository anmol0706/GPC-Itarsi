import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import DashboardCard from '../../components/dashboard/DashboardCard';
import { useAuth } from '../../context/AuthContext';

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general',
    link: '',
    userId: '',
    userType: 'student'
  });
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterUserType, setFilterUserType] = useState('all');

  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch all notifications
  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${config.apiUrl}/api/notifications?all=true`, {
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
  };

  // Fetch users for dropdown
  const fetchUsers = async () => {
    setUserLoading(true);
    try {
      // Fetch students
      const studentsResponse = await axios.get(`${config.apiUrl}/api/students`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Fetch teachers
      const teachersResponse = await axios.get(`${config.apiUrl}/api/teachers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Fetch HODs
      const hodResponse = await axios.get(`${config.apiUrl}/api/hod`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }).catch(() => ({ data: [] }));

      // Get principal (assuming there's only one principal)
      const principalResponse = await axios.get(`${config.apiUrl}/api/users?role=principal`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }).catch(() => ({ data: [] }));

      // Combine users
      const allUsers = [
        ...studentsResponse.data.map(student => ({
          id: student._id,
          name: student.name,
          type: 'student'
        })),
        ...teachersResponse.data.map(teacher => ({
          id: teacher._id,
          name: teacher.name,
          type: 'teacher'
        })),
        ...(hodResponse.data ? hodResponse.data.map(hod => ({
          id: hod._id,
          name: hod.name,
          type: 'hod'
        })) : []),
        ...(principalResponse.data ? principalResponse.data.map(principal => ({
          id: principal._id,
          name: principal.name,
          type: 'principal'
        })) : [])
      ];

      setUsers(allUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditing && selectedNotification) {
        // Update existing notification
        const response = await axios.put(
          `${config.apiUrl}/api/notifications/${selectedNotification._id}`,
          {
            title: formData.title,
            message: formData.message,
            type: formData.type,
            link: formData.link
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        // Update notifications list
        setNotifications(prev =>
          prev.map(notification =>
            notification._id === selectedNotification._id ? response.data : notification
          )
        );

        // Reset form
        resetForm();
      } else {
        // Create new notification
        const response = await axios.post(
          `${config.apiUrl}/api/notifications`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        // Add new notification to list
        setNotifications(prev => [response.data, ...prev]);

        // Reset form
        resetForm();
      }
    } catch (err) {
      console.error('Error saving notification:', err);
      setError('Failed to save notification');
    }
  };

  const handleEdit = (notification) => {
    setSelectedNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type || 'general',
      link: notification.link || '',
      userId: notification.userId,
      userType: notification.userType
    });
    setIsEditing(true);
  };

  const handleDelete = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      await axios.delete(`${config.apiUrl}/api/notifications/${notificationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Remove notification from list
      setNotifications(prev => prev.filter(notification => notification._id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError('Failed to delete notification');
    }
  };

  const handleMarkAsRead = async (notificationId) => {
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

      // Update notification in list
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === notificationId ? response.data : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to mark notification as read');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'general',
      link: '',
      userId: '',
      userType: 'student'
    });
    setSelectedNotification(null);
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Filter notifications based on search term and filters
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || notification.type === filterType;

    const matchesUserType = filterUserType === 'all' || notification.userType === filterUserType;

    return matchesSearch && matchesType && matchesUserType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-primary-800">Notification Management</h1>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Back
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-error/10 text-error rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notification Form */}
        <div className="lg:col-span-1">
          <DashboardCard
            title={isEditing ? "Edit Notification" : "Create Notification"}
            headerClassName="bg-primary-50 text-primary-800"
          >
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="general">General</option>
                  <option value="academic">Academic</option>
                  <option value="attendance">Attendance</option>
                  <option value="schedule">Schedule</option>
                </select>
              </div>

              <div>
                <label htmlFor="link" className="block text-sm font-medium text-gray-700">
                  Link (Optional)
                </label>
                <input
                  type="text"
                  id="link"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  placeholder="/student/dashboard"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>

              {!isEditing && (
                <>
                  <div>
                    <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
                      User Type
                    </label>
                    <select
                      id="userType"
                      name="userType"
                      value={formData.userType}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="hod">HOD</option>
                      <option value="principal">Principal</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                      User
                    </label>
                    <select
                      id="userId"
                      name="userId"
                      value={formData.userId}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="">Select a user</option>
                      {users
                        .filter(u => u.type === formData.userType)
                        .map(user => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3">
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-primary-500/30 text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {isEditing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </DashboardCard>
        </div>

        {/* Notifications List */}
        <div className="lg:col-span-2">
          <DashboardCard
            title={`All Notifications (${filteredNotifications.length})`}
            headerClassName="bg-primary-50 text-primary-800"
            isLoading={loading}
          >
            <div className="p-4 space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="general">General</option>
                    <option value="academic">Academic</option>
                    <option value="attendance">Attendance</option>
                    <option value="schedule">Schedule</option>
                  </select>
                  <select
                    value={filterUserType}
                    onChange={(e) => setFilterUserType(e.target.value)}
                    className="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="all">All Users</option>
                    <option value="student">Students</option>
                    <option value="teacher">Teachers</option>
                    <option value="hod">HODs</option>
                    <option value="principal">Principal</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
              </div>

              {/* Notifications List */}
              {filteredNotifications.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <p className="text-lg">No notifications found</p>
                  <p className="mt-1">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-4 hover:bg-gray-50 transition-colors duration-150 ${
                        !notification.isRead ? 'bg-primary-50' : ''
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className={`text-base font-medium ${!notification.isRead ? 'text-accent-600' : 'text-gray-900'}`}>
                                {notification.title}
                              </h3>
                              <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                              <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                                <span className="bg-gray-100 px-2 py-1 rounded">
                                  Type: {notification.type || 'general'}
                                </span>
                                <span className="bg-gray-100 px-2 py-1 rounded">
                                  User: {notification.userType}
                                </span>
                                <span className="bg-gray-100 px-2 py-1 rounded">
                                  ID: {notification.userId}
                                </span>
                                <span className="bg-gray-100 px-2 py-1 rounded">
                                  Created: {formatDate(notification.createdAt)}
                                </span>
                                {notification.link && (
                                  <span className="bg-gray-100 px-2 py-1 rounded">
                                    Link: {notification.link}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              {!notification.isRead && (
                                <button
                                  onClick={() => handleMarkAsRead(notification._id)}
                                  className="text-primary-600 hover:text-primary-800 focus:outline-none"
                                  title="Mark as read"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                  </svg>
                                </button>
                              )}
                              <button
                                onClick={() => handleEdit(notification)}
                                className="text-accent-600 hover:text-accent-800 focus:outline-none"
                                title="Edit notification"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(notification._id)}
                                className="text-error hover:text-error/80 focus:outline-none"
                                title="Delete notification"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default NotificationManagement;
