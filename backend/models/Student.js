const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true
  },
  class: {
    type: String,
    required: true
  },
  attendance: [{
    date: {
      type: Date,
      required: true
    },
    present: {
      type: Boolean,
      default: false
    },
    subject: {
      type: String,
      required: true
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    }
  }],
  marks: [{
    subject: {
      type: String,
      required: true
    },
    marks: {
      type: Number,
      required: true
    },
    totalMarks: {
      type: Number,
      required: true
    },
    examType: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }]
});

// Virtual for attendance percentage
StudentSchema.virtual('attendancePercentage').get(function() {
  if (this.attendance.length === 0) return 0;
  
  const totalClasses = this.attendance.length;
  const presentClasses = this.attendance.filter(a => a.present).length;
  
  return Math.round((presentClasses / totalClasses) * 100);
});

module.exports = mongoose.model('Student', StudentSchema);
