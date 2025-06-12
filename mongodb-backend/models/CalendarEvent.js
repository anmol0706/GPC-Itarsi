const mongoose = require('mongoose');

const RecurrencePatternSchema = new mongoose.Schema({
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'weekly'
  },
  daysOfWeek: {
    type: [Number], // 0 = Sunday, 1 = Monday, etc.
    default: [1] // Monday by default
  },
  endDate: {
    type: Date,
    required: true
  }
}, { _id: false });

const CalendarEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['class', 'exam', 'lab', 'event', 'deadline', 'holiday'],
    default: 'event'
  },
  forClass: {
    type: String,
    default: 'all' // 'all' or specific class name
  },
  forSubject: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#4CAF50' // Green
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    type: RecurrencePatternSchema,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CalendarEvent', CalendarEventSchema);
