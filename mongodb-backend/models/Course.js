const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  eligibility: {
    type: String,
    required: true
  },
  seats: {
    type: Number,
    required: true,
    min: 0
  },
  fees: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    default: 'default-course.jpg'
  },
  cloudinaryPublicId: {
    type: String
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

module.exports = mongoose.model('Course', CourseSchema);
