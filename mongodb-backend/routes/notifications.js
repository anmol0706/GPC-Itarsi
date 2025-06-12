const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const MockNotification = require('../models/MockNotification');
const { authenticateToken } = require('../middleware/auth');

// Determine which model to use based on environment
const NotificationModel = process.env.NODE_ENV === 'mock' || (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('localhost'))
  ? MockNotification
  : Notification;

// Get all notifications for the current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await NotificationModel.find({ userId: req.user.id });
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await NotificationModel.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Check if notification belongs to the current user
    if (notification.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this notification' });
    }
    
    const updatedNotification = await NotificationModel.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    
    res.json(updatedNotification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    const notifications = await NotificationModel.find({ userId: req.user.id, isRead: false });
    
    for (const notification of notifications) {
      await NotificationModel.findByIdAndUpdate(
        notification._id,
        { isRead: true }
      );
    }
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Failed to mark all notifications as read' });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const notification = await NotificationModel.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Check if notification belongs to the current user
    if (notification.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this notification' });
    }
    
    await NotificationModel.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
});

// Create a new notification (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { userId, title, message, type, link } = req.body;
    
    if (!userId || !title || !message) {
      return res.status(400).json({ message: 'User ID, title, and message are required' });
    }
    
    // Create new notification
    const notification = new Notification({
      userId,
      title,
      message,
      type: type || 'general',
      link: link || '',
      isRead: false
    });
    
    await notification.save();
    
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Failed to create notification' });
  }
});

module.exports = router;
