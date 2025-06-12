const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    default: 'Government Polytechnic College, Itarsi'
  },
  siteDescription: {
    type: String,
    default: 'Official website of Government Polytechnic College, Itarsi'
  },
  contactEmail: {
    type: String,
    default: 'contact@gpcitarsi.edu.in'
  },
  contactPhone: {
    type: String,
    default: '+91 1234567890'
  },
  address: {
    type: String,
    default: 'Government Polytechnic College, Itarsi, Madhya Pradesh, India'
  },
  socialLinks: {
    facebook: {
      type: String,
      default: 'https://facebook.com/gpcitarsi'
    },
    twitter: {
      type: String,
      default: 'https://twitter.com/gpcitarsi'
    },
    instagram: {
      type: String,
      default: 'https://instagram.com/gpcitarsi'
    },
    youtube: {
      type: String,
      default: 'https://youtube.com/gpcitarsi'
    }
  },
  colors: {
    primary: {
      type: String,
      default: '#0D47A1'
    },
    secondary: {
      type: String,
      default: '#1976D2'
    },
    accent: {
      type: String,
      default: '#2196F3'
    }
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

module.exports = mongoose.model('Settings', SettingsSchema);
