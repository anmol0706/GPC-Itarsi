const express = require('express');
const router = express.Router();
const ContactInfo = require('../models/ContactInfo');
const { authenticateToken, authorize } = require('../middleware/auth');

// Mock data for development
const MockContactInfo = {
  findOne: async () => ({
    _id: '60d0fe4f5311236168a109a2',
    address: 'Government Polytechnic College, Itarsi, Madhya Pradesh, India',
    phone: '+91 8964035180',
    email: 'gpc.itarsi@gmail.com',
    socialMedia: {
      facebook: 'https://www.facebook.com/profile.php?id=61573030583115',
      instagram: 'https://www.instagram.com/gpcitarsi?igsh=M3pveTRrY3J5djZt',
      twitter: '',
      linkedin: ''
    },
    mapLocation: {
      latitude: 22.6174,
      longitude: 77.7567
    },
    officeHours: 'Monday to Friday: 9:00 AM - 5:00 PM',
    updatedAt: new Date()
  }),
  findOneAndUpdate: async (query, update) => ({
    ...update.$set,
    _id: '60d0fe4f5311236168a109a2',
    updatedAt: new Date()
  })
};

// Use mock or real model based on environment
const ContactInfoModel = process.env.NODE_ENV === 'mock' || (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('localhost'))
  ? MockContactInfo
  : ContactInfo;

// Get contact information
router.get('/', async (req, res) => {
  try {
    console.log('Fetching contact information...');

    // Set CORS headers explicitly for this route
    const origin = req.headers.origin;

    // List of allowed origins - make sure to include ALL possible frontend origins
    const allowedOrigins = [
      'https://gpc-itarsi-9cl7.onrender.com',
      'https://gpc-itarsi-developer.onrender.com',
      'https://gpc-itarsi-backend-1wu5.onrender.com',
      'https://gpc-itarsi-backend-8dod.onrender.com',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      // Add any other origins that might be accessing the API
      'https://gpc-itarsi.onrender.com'
    ];

    // Check if the request origin is in our list of allowed origins
    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      console.log(`Contact Info GET - Allowing specific origin: ${origin}`);
    } else {
      res.header('Access-Control-Allow-Origin', '*');
      console.log(`Contact Info GET - Using wildcard origin`);
    }

    res.header('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    // Find the contact info document or create a default one if it doesn't exist
    let contactInfo = await ContactInfoModel.findOne();

    if (!contactInfo) {
      // Create default contact info
      contactInfo = new ContactInfo({
        address: 'Government Polytechnic College, Itarsi, Madhya Pradesh, India',
        phone: '+91 8964035180',
        email: 'gpc.itarsi@gmail.com',
        socialMedia: {
          facebook: 'https://www.facebook.com/profile.php?id=61573030583115',
          instagram: 'https://www.instagram.com/gpcitarsi?igsh=M3pveTRrY3J5djZt',
          twitter: '',
          linkedin: ''
        },
        mapLocation: {
          latitude: 22.6174,
          longitude: 77.7567
        },
        officeHours: 'Monday to Friday: 9:00 AM - 5:00 PM'
      });

      await contactInfo.save();
    }

    res.json(contactInfo);
  } catch (error) {
    console.error('Error fetching contact information:', error);
    res.status(500).json({ message: 'Failed to fetch contact information' });
  }
});

// Update contact information (admin only)
router.put('/', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const {
      address,
      phone,
      email,
      socialMedia,
      mapLocation,
      officeHours
    } = req.body;

    // Update the contact info
    const updatedContactInfo = await ContactInfoModel.findOneAndUpdate(
      {}, // Find the first document
      {
        $set: {
          address,
          phone,
          email,
          socialMedia,
          mapLocation,
          officeHours,
          updatedAt: new Date()
        }
      },
      { new: true, upsert: true } // Return the updated document and create if it doesn't exist
    );

    res.json(updatedContactInfo);
  } catch (error) {
    console.error('Error updating contact information:', error);
    res.status(500).json({ message: 'Failed to update contact information' });
  }
});

module.exports = router;
