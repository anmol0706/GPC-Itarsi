const express = require('express');
const router = express.Router();
const Overview = require('../models/Overview');
const MockOverview = require('../models/MockOverview');
const User = require('../models/User');
const MockUser = require('../models/MockUser');
const Course = require('../models/Course');
const MockCourse = require('../models/MockCourse');
const { authenticateToken, authorize } = require('../middleware/auth');

// Determine which models to use based on environment
const OverviewModel = process.env.NODE_ENV === 'mock' || (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('localhost'))
  ? MockOverview
  : Overview;
const UserModel = process.env.NODE_ENV === 'mock' || (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('localhost'))
  ? MockUser
  : User;
const CourseModel = process.env.NODE_ENV === 'mock' || (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('localhost'))
  ? MockCourse
  : Course;

// Get overview data
router.get('/', async (req, res) => {
  try {
    console.log('Fetching overview data...');

    // Check if we're using mock data
    const isMockData = process.env.NODE_ENV === 'mock' || (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('localhost'));
    console.log('Using mock data:', isMockData);

    // Create a default overview object in case of errors
    const defaultOverview = {
      _id: '60d0fe4f5311236168a109a1',
      title: 'Government Polytechnic College, Itarsi',
      shortDescription: 'A premier technical institution offering diploma courses in engineering and technology.',
      longDescription: 'Government Polytechnic College, Itarsi is committed to providing quality technical education to students. The college offers various diploma courses in engineering and technology fields.',
      content: 'Government Polytechnic College, Itarsi is committed to providing quality technical education to students. The college offers various diploma courses in engineering and technology fields.',
      vision: 'To be a center of excellence in technical education, producing skilled professionals who contribute to the technological advancement of the nation.',
      mission: 'To impart quality technical education, foster innovation, and develop skilled professionals with strong ethical values.',
      establishedYear: 1965,
      address: 'Government Polytechnic College, Itarsi, Madhya Pradesh, India',
      phone: '+91-1234567890',
      email: 'info@gpcitarsi.edu.in',
      website: 'www.gpcitarsi.edu.in',
      stats: {
        students: 450,
        teachers: 35,
        courses: 8,
        placements: 85
      },
      updatedAt: new Date()
    };

    let overview;

    try {
      if (isMockData) {
        // Use mock data directly
        console.log('Attempting to retrieve mock overview data...');
        overview = await OverviewModel.findOne();
        console.log('Mock overview data retrieved:', overview ? 'Success' : 'Not found');
      } else {
        // Use real MongoDB data
        console.log('Attempting to retrieve MongoDB overview data...');
        overview = await OverviewModel.findOne();
        console.log('MongoDB overview data retrieved:', overview ? 'Success' : 'Not found');

        if (!overview) {
          console.log('Creating new overview document in MongoDB...');
          // Create a default overview
          overview = new Overview({
            title: 'Government Polytechnic College, Itarsi',
            shortDescription: 'A premier technical institution offering diploma courses in engineering and technology.',
            longDescription: 'Government Polytechnic College, Itarsi is committed to providing quality technical education to students. The college offers various diploma courses in engineering and technology fields.',
            vision: 'To be a center of excellence in technical education, producing skilled professionals who contribute to the technological advancement of the nation.',
            mission: 'To impart quality technical education, foster innovation, and develop skilled professionals with strong ethical values.',
            establishedYear: 1965,
            address: 'Government Polytechnic College, Itarsi, Madhya Pradesh, India',
            phone: '+91-1234567890',
            email: 'info@gpcitarsi.edu.in',
            website: 'www.gpcitarsi.edu.in'
          });

          await overview.save();
          console.log('New overview document created successfully');
        }

        // Update stats in real-time
        console.log('Updating stats in real-time...');
        const studentCount = await UserModel.countDocuments({ role: 'student' });
        const teacherCount = await UserModel.countDocuments({ role: 'teacher' });
        const courseCount = await CourseModel.countDocuments();

        // Update the stats
        overview.stats = {
          students: studentCount,
          teachers: teacherCount,
          courses: courseCount,
          placements: overview.stats?.placements || 0
        };
        console.log('Stats updated successfully');
      }
    } catch (innerError) {
      console.error('Error retrieving overview data:', innerError);
      console.log('Using default overview data as fallback');
      overview = defaultOverview;
    }

    // If overview is still undefined, use the default
    if (!overview) {
      console.log('Overview is undefined, using default data');
      overview = defaultOverview;
    }

    // Add content field for compatibility with frontend
    if (!overview.content && overview.longDescription) {
      console.log('Adding content field from longDescription');
      overview.content = overview.longDescription;
    }

    console.log('Sending overview data to client:', JSON.stringify(overview).substring(0, 100) + '...');
    res.json(overview);
  } catch (error) {
    console.error('Error in overview route:', error);
    // Return default data in case of error
    const defaultData = {
      _id: '60d0fe4f5311236168a109a1',
      title: 'Government Polytechnic College, Itarsi',
      shortDescription: 'A premier technical institution offering diploma courses in engineering and technology.',
      content: 'Government Polytechnic College, Itarsi is committed to providing quality technical education to students. The college offers various diploma courses in engineering and technology fields.',
      vision: 'To be a center of excellence in technical education.',
      mission: 'To impart quality technical education, foster innovation, and develop skilled professionals.',
      stats: {
        students: 450,
        teachers: 35,
        courses: 8,
        placements: 85
      }
    };
    console.log('Sending default overview data due to error');
    res.json(defaultData);
  }
});

// Update overview (admin only)
router.put('/', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    // Find the overview document or create a default one if it doesn't exist
    let overview = await OverviewModel.findOne();

    if (!overview) {
      overview = new Overview({
        title: 'Government Polytechnic College, Itarsi',
        shortDescription: 'A premier technical institution offering diploma courses in engineering and technology.',
        longDescription: 'Government Polytechnic College, Itarsi is committed to providing quality technical education to students. The college offers various diploma courses in engineering and technology fields.',
        address: 'Government Polytechnic College, Itarsi, Madhya Pradesh, India'
      });
    }

    // Update fields
    const fieldsToUpdate = [
      'title', 'shortDescription', 'longDescription', 'vision', 'mission',
      'establishedYear', 'address', 'phone', 'email', 'website'
    ];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        overview[field] = req.body[field];
      }
    });

    // Update social media links if provided
    if (req.body.socialMedia) {
      overview.socialMedia = {
        ...overview.socialMedia,
        ...req.body.socialMedia
      };
    }

    // Update stats if provided
    if (req.body.stats) {
      overview.stats = {
        ...overview.stats,
        ...req.body.stats
      };
    }

    overview.updatedAt = Date.now();
    await overview.save();

    res.json(overview);
  } catch (error) {
    console.error('Error updating overview:', error);
    res.status(500).json({ message: 'Failed to update overview', error: error.message });
  }
});

// Get principal's message
router.get('/principal-message', async (req, res) => {
  try {
    // Find the overview document
    const overview = await OverviewModel.findOne();

    if (!overview) {
      return res.status(404).json({ message: 'Overview not found' });
    }

    // Return the principal's message or a default message
    res.json({
      message: overview.principalMessage || 'Welcome to Government Polytechnic College, Itarsi. We are committed to providing quality technical education to our students.',
      name: overview.principalName || 'Principal',
      title: 'Principal, Government Polytechnic College, Itarsi',
      image: overview.principalImage || 'default-principal.jpg'
    });
  } catch (error) {
    console.error('Error fetching principal message:', error);
    res.status(500).json({ message: 'Failed to fetch principal message' });
  }
});

// Update principal's message (admin only)
router.put('/principal-message', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    // Find the overview document or create a default one if it doesn't exist
    let overview = await OverviewModel.findOne();

    if (!overview) {
      overview = new Overview({
        title: 'Government Polytechnic College, Itarsi',
        shortDescription: 'A premier technical institution offering diploma courses in engineering and technology.',
        longDescription: 'Government Polytechnic College, Itarsi is committed to providing quality technical education to students. The college offers various diploma courses in engineering and technology fields.',
        address: 'Government Polytechnic College, Itarsi, Madhya Pradesh, India'
      });
    }

    // Update principal's message and name
    if (req.body.message) {
      overview.principalMessage = req.body.message;
    }

    if (req.body.name) {
      overview.principalName = req.body.name;
    }

    overview.updatedAt = Date.now();
    await overview.save();

    res.json({
      message: overview.principalMessage,
      name: overview.principalName,
      title: 'Principal, Government Polytechnic College, Itarsi',
      image: overview.principalImage || 'default-principal.jpg'
    });
  } catch (error) {
    console.error('Error updating principal message:', error);
    res.status(500).json({ message: 'Failed to update principal message', error: error.message });
  }
});

module.exports = router;
