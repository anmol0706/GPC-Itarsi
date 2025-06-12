const express = require('express');
const router = express.Router();
const CalendarEvent = require('../models/CalendarEvent');
const MockCalendarEvent = require('../models/MockCalendarEvent');
const { authenticateToken, authorize } = require('../middleware/auth');

// Determine which model to use based on environment
const CalendarEventModel = process.env.NODE_ENV === 'mock' || (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('localhost'))
  ? MockCalendarEvent
  : CalendarEvent;

// Get all calendar events
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = {};
    
    // If student, only show events for their class or 'all'
    if (req.user.role === 'student' && req.user.class) {
      query.forClass = req.user.class;
    }
    
    // Filter by date range if provided
    if (req.query.startDate && req.query.endDate) {
      query.startDate = { $gte: new Date(req.query.startDate) };
      query.endDate = { $lte: new Date(req.query.endDate) };
    }
    
    const events = await CalendarEventModel.find(query);
    res.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ message: 'Failed to fetch calendar events' });
  }
});

// Get upcoming events (limited number)
router.get('/upcoming', authenticateToken, async (req, res) => {
  try {
    let query = {
      startDate: { $gte: new Date() }
    };
    
    // If student, only show events for their class or 'all'
    if (req.user.role === 'student' && req.user.class) {
      query.forClass = req.user.class;
    }
    
    const limit = parseInt(req.query.limit) || 5;
    
    const events = await CalendarEventModel.find(query);
    
    // Sort by start date and limit
    const sortedEvents = events.sort((a, b) => new Date(a.startDate) - new Date(b.startDate)).slice(0, limit);
    
    res.json(sortedEvents);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ message: 'Failed to fetch upcoming events' });
  }
});

// Get event by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const event = await CalendarEventModel.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if student has access to this event
    if (req.user.role === 'student' && req.user.class && 
        event.forClass !== 'all' && event.forClass !== req.user.class) {
      return res.status(403).json({ message: 'Not authorized to view this event' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Failed to fetch event' });
  }
});

// Create new event (admin and teacher only)
router.post('/', authenticateToken, authorize(['admin', 'teacher']), async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      location,
      type,
      forClass,
      forSubject,
      color,
      isRecurring,
      recurrencePattern
    } = req.body;
    
    if (!title || !startDate || !endDate) {
      return res.status(400).json({ message: 'Title, start date, and end date are required' });
    }
    
    // Create new event
    const event = new CalendarEvent({
      title,
      description: description || '',
      startDate,
      endDate,
      location: location || '',
      type: type || 'event',
      forClass: forClass || 'all',
      forSubject: forSubject || '',
      color: color || '#4CAF50',
      isRecurring: isRecurring || false,
      recurrencePattern: isRecurring ? recurrencePattern : null,
      createdBy: req.user.id
    });
    
    await event.save();
    
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Failed to create event' });
  }
});

// Update event (admin and creator only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const event = await CalendarEventModel.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is admin or the creator
    if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }
    
    const {
      title,
      description,
      startDate,
      endDate,
      location,
      type,
      forClass,
      forSubject,
      color,
      isRecurring,
      recurrencePattern
    } = req.body;
    
    // Update fields
    const fieldsToUpdate = {
      title,
      description,
      startDate,
      endDate,
      location,
      type,
      forClass,
      forSubject,
      color,
      isRecurring,
      recurrencePattern: isRecurring ? recurrencePattern : null,
      updatedAt: new Date()
    };
    
    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );
    
    const updatedEvent = await CalendarEventModel.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      { new: true }
    );
    
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Failed to update event' });
  }
});

// Delete event (admin and creator only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const event = await CalendarEventModel.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is admin or the creator
    if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }
    
    await CalendarEventModel.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Failed to delete event' });
  }
});

module.exports = router;
