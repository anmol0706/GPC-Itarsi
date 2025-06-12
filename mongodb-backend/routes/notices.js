const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const MockUser = require('../models/MockUser');
const { authenticateToken, authorize } = require('../middleware/auth');

// Mock notices for development when MongoDB is not available
const mockNotices = [
  {
    _id: '60d0fe4f5311236168a109d5',
    title: 'Welcome to New Academic Session',
    content: 'Welcome to the new academic session 2023-24. All students are requested to complete their registration process.',
    category: 'general',
    important: true,
    postedBy: MockUser.findById('60d0fe4f5311236168a109cb'), // admin user
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000)
  },
  {
    _id: '60d0fe4f5311236168a109d6',
    title: 'Mid-Term Examination Schedule',
    content: 'The mid-term examinations will be held from 15th to 20th of this month. All students are advised to prepare accordingly.',
    category: 'exam',
    important: true,
    postedBy: MockUser.findById('60d0fe4f5311236168a109cc'), // teacher user
    createdAt: new Date(Date.now() - 172800000), // 2 days ago
    updatedAt: new Date(Date.now() - 172800000)
  },
  {
    _id: '60d0fe4f5311236168a109d7',
    title: 'College Foundation Day',
    content: 'The college foundation day will be celebrated on 25th of this month. All students and faculty members are invited to participate.',
    category: 'event',
    important: false,
    postedBy: MockUser.findById('60d0fe4f5311236168a109cb'), // admin user
    createdAt: new Date(Date.now() - 259200000), // 3 days ago
    updatedAt: new Date(Date.now() - 259200000)
  }
];

// Get all notices
router.get('/', async (req, res) => {
  try {
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
      console.log(`Notices GET - Allowing specific origin: ${origin}`);
    } else {
      res.header('Access-Control-Allow-Origin', '*');
      console.log(`Notices GET - Using wildcard origin`);
    }

    res.header('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    console.log('Fetching notices...');
    console.log('Request origin:', req.headers.origin);
    console.log('Request method:', req.method);

    // Use mock data if in mock environment
    if (process.env.NODE_ENV === 'mock' || (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('localhost'))) {
      // Sort mock notices by createdAt in descending order
      const sortedNotices = [...mockNotices].sort((a, b) => b.createdAt - a.createdAt);
      console.log('Returning mock notices data');
      return res.json(sortedNotices);
    }

    // Otherwise use MongoDB
    console.log('Fetching notices from MongoDB...');
    const notices = await Notice.find().sort({ createdAt: -1 }).populate('postedBy', 'name role');
    console.log('Successfully fetched notices from MongoDB');
    res.json(notices);
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({ message: 'Failed to fetch notices' });
  }
});

// Get notice by ID
router.get('/:id', async (req, res) => {
  try {
    // Use mock data if in mock environment
    if (process.env.NODE_ENV === 'mock' || (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('localhost'))) {
      const notice = mockNotices.find(notice => notice._id === req.params.id);

      if (!notice) {
        return res.status(404).json({ message: 'Notice not found' });
      }

      return res.json(notice);
    }

    // Otherwise use MongoDB
    const notice = await Notice.findById(req.params.id).populate('postedBy', 'name role');

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    res.json(notice);
  } catch (error) {
    console.error('Error fetching notice:', error);
    res.status(500).json({ message: 'Failed to fetch notice' });
  }
});

// Add a new notice (admin and teacher)
router.post('/', authenticateToken, authorize(['admin', 'teacher']), async (req, res) => {
  try {
    const { title, content, category, important, expiresAt } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    // Create new notice
    const notice = new Notice({
      title,
      content,
      category: category || 'general',
      important: important === 'true' || important === true,
      postedBy: req.user.id,
      expiresAt: expiresAt || undefined
    });

    await notice.save();

    // Populate the posted by field for the response
    await notice.populate('postedBy', 'name role');

    res.status(201).json(notice);
  } catch (error) {
    console.error('Error adding notice:', error);
    res.status(500).json({ message: 'Failed to add notice', error: error.message });
  }
});

// Update notice (admin and original poster)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    // Check if user is admin or the original poster
    if (req.user.role !== 'admin' && notice.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this notice' });
    }

    // Update fields
    const fieldsToUpdate = ['title', 'content', 'category', 'important', 'expiresAt'];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'important') {
          notice[field] = req.body[field] === 'true' || req.body[field] === true;
        } else {
          notice[field] = req.body[field];
        }
      }
    });

    notice.updatedAt = Date.now();
    await notice.save();

    // Populate the posted by field for the response
    await notice.populate('postedBy', 'name role');

    res.json(notice);
  } catch (error) {
    console.error('Error updating notice:', error);
    res.status(500).json({ message: 'Failed to update notice', error: error.message });
  }
});

// Delete notice (admin and original poster)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    // Check if user is admin or the original poster
    if (req.user.role !== 'admin' && notice.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this notice' });
    }

    await Notice.findByIdAndDelete(req.params.id);

    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Error deleting notice:', error);
    res.status(500).json({ message: 'Failed to delete notice' });
  }
});

module.exports = router;
