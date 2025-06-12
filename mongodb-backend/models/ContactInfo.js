const mongoose = require('mongoose');

const ContactInfoSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    default: 'Government Polytechnic College, Itarsi, Madhya Pradesh, India'
  },
  phone: {
    type: String,
    required: true,
    default: '+91 8964035180'
  },
  email: {
    type: String,
    required: true,
    default: 'gpc.itarsi@gmail.com'
  },
  socialMedia: {
    facebook: { type: String, default: 'https://www.facebook.com/profile.php?id=61573030583115' },
    instagram: { type: String, default: 'https://www.instagram.com/gpcitarsi?igsh=M3pveTRrY3J5djZt' },
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' }
  },
  mapLocation: {
    latitude: { type: Number, default: 22.6174 },
    longitude: { type: Number, default: 77.7567 }
  },
  officeHours: {
    type: String,
    default: 'Monday to Friday: 9:00 AM - 5:00 PM'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create a model from the schema
const ContactInfo = mongoose.model('ContactInfo', ContactInfoSchema);

module.exports = ContactInfo;
