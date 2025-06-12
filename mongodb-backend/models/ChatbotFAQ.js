const mongoose = require('mongoose');

const ChatbotFAQSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    required: true
  },
  keywords: {
    type: [String],
    default: []
  },
  category: {
    type: String,
    enum: ['admission', 'academic', 'facility', 'general', 'other', 'courses', 'faculty', 'hostel', 'fees', 'placement', 'contact'],
    default: 'general'
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  relatedQuestions: {
    type: [String],
    default: []
  },
  metadata: {
    type: Map,
    of: String,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
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

// Index for faster searching
ChatbotFAQSchema.index({ question: 'text', keywords: 'text' });

// Pre-save hook to update the updatedAt field
ChatbotFAQSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ChatbotFAQ', ChatbotFAQSchema);
