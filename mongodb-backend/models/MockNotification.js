const bcrypt = require('bcryptjs');

// Mock notifications for development when MongoDB is not available
const mockNotifications = [
  {
    _id: '60d0fe4f5311236168a109e1',
    userId: '60d0fe4f5311236168a109cd', // student user
    title: 'Welcome to GPC Itarsi',
    message: 'Welcome to the new academic session. Please complete your profile.',
    type: 'general',
    isRead: false,
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    link: '/student/profile'
  },
  {
    _id: '60d0fe4f5311236168a109e2',
    userId: '60d0fe4f5311236168a109cd', // student user
    title: 'Assignment Due',
    message: 'Your programming assignment is due tomorrow.',
    type: 'academic',
    isRead: true,
    createdAt: new Date(Date.now() - 172800000), // 2 days ago
    link: '/student/assignments'
  },
  {
    _id: '60d0fe4f5311236168a109e3',
    userId: '60d0fe4f5311236168a109cc', // teacher user
    title: 'Faculty Meeting',
    message: 'There will be a faculty meeting tomorrow at 3 PM.',
    type: 'event',
    isRead: false,
    createdAt: new Date(Date.now() - 259200000), // 3 days ago
    link: '/teacher/calendar'
  },
  {
    _id: '60d0fe4f5311236168a109e4',
    userId: '60d0fe4f5311236168a109cb', // admin user
    title: 'System Update',
    message: 'The system will be updated this weekend. Please save your work.',
    type: 'system',
    isRead: false,
    createdAt: new Date(Date.now() - 345600000), // 4 days ago
    link: '/admin/dashboard'
  }
];

// Mock Notification model
class MockNotification {
  static async find(query = {}) {
    if (query.userId) {
      return mockNotifications.filter(notification => notification.userId === query.userId);
    }
    return [...mockNotifications];
  }

  static async findById(id) {
    return mockNotifications.find(notification => notification._id === id);
  }

  static async findByIdAndUpdate(id, update) {
    const notification = mockNotifications.find(notification => notification._id === id);
    if (!notification) return null;

    Object.assign(notification, update);
    return notification;
  }

  static async findByIdAndDelete(id) {
    const index = mockNotifications.findIndex(notification => notification._id === id);
    if (index === -1) return null;

    const deleted = mockNotifications.splice(index, 1)[0];
    return deleted;
  }
}

module.exports = MockNotification;
