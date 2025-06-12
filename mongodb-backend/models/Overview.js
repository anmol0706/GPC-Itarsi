const mongoose = require('mongoose');

const OverviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'Government Polytechnic College, Itarsi'
  },
  shortDescription: {
    type: String,
    required: true
  },
  longDescription: {
    type: String,
    required: true
  },
  vision: {
    type: String
  },
  mission: {
    type: String
  },
  establishedYear: {
    type: Number
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  email: {
    type: String
  },
  website: {
    type: String
  },
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String
  },
  principalName: {
    type: String,
    default: 'Principal'
  },
  principalMessage: {
    type: String,
    default: 'Welcome to Government Polytechnic College, Itarsi. We are committed to providing quality technical education to our students.'
  },
  principalImage: {
    type: String,
    default: 'default-principal.jpg'
  },
  stats: {
    students: {
      type: Number,
      default: 0
    },
    teachers: {
      type: Number,
      default: 0
    },
    courses: {
      type: Number,
      default: 0
    },
    placements: {
      type: Number,
      default: 0
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Overview', OverviewSchema);
