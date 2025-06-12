const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'academic', 'exam', 'event', 'holiday', 'other'],
    default: 'general'
  },
  important: {
    type: Boolean,
    default: false
  },
  attachment: {
    type: String
  },
  cloudinaryPublicId: {
    type: String
  },
  postedBy: {
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
  },
  expiresAt: {
    type: Date
  }
});

module.exports = mongoose.model('Notice', NoticeSchema);
