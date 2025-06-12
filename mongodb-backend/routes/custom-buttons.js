const express = require('express');
const router = express.Router();
const CustomButton = require('../models/CustomButton');
const MockCustomButton = require('../models/MockCustomButton');
const { authenticateToken, authorize } = require('../middleware/auth');

// Determine which model to use based on environment
const CustomButtonModel = process.env.NODE_ENV === 'mock' || (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('localhost'))
  ? MockCustomButton
  : CustomButton;

// Get all custom buttons
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
      console.log(`Custom Buttons GET - Allowing specific origin: ${origin}`);
    } else {
      res.header('Access-Control-Allow-Origin', '*');
      console.log(`Custom Buttons GET - Using wildcard origin`);
    }

    res.header('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    console.log('Fetching custom buttons...');
    const buttons = await CustomButtonModel.find();
    res.json(buttons);
  } catch (error) {
    console.error('Error fetching custom buttons:', error);
    res.status(500).json({ message: 'Failed to fetch custom buttons' });
  }
});

// Get a specific custom button
router.get('/:id', async (req, res) => {
  try {
    const button = await CustomButtonModel.findById(req.params.id);
    if (!button) {
      return res.status(404).json({ message: 'Custom button not found' });
    }
    res.json(button);
  } catch (error) {
    console.error('Error fetching custom button:', error);
    res.status(500).json({ message: 'Failed to fetch custom button' });
  }
});

// Create a new custom button (admin only)
router.post('/', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { title, url, icon, color, position, isActive } = req.body;

    // Create a new custom button
    const newButton = new CustomButton({
      title,
      url,
      icon,
      color,
      position,
      isActive: isActive !== undefined ? isActive : true
    });

    await newButton.save();
    res.status(201).json(newButton);
  } catch (error) {
    console.error('Error creating custom button:', error);
    res.status(500).json({ message: 'Failed to create custom button' });
  }
});

// Update a custom button (admin only)
router.put('/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { title, url, icon, color, position, isActive } = req.body;

    // Find and update the custom button
    const updatedButton = await CustomButtonModel.findByIdAndUpdate(
      req.params.id,
      {
        title,
        url,
        icon,
        color,
        position,
        isActive
      },
      { new: true }
    );

    if (!updatedButton) {
      return res.status(404).json({ message: 'Custom button not found' });
    }

    res.json(updatedButton);
  } catch (error) {
    console.error('Error updating custom button:', error);
    res.status(500).json({ message: 'Failed to update custom button' });
  }
});

// Delete a custom button (admin only)
router.delete('/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const deletedButton = await CustomButtonModel.findByIdAndDelete(req.params.id);

    if (!deletedButton) {
      return res.status(404).json({ message: 'Custom button not found' });
    }

    res.json({ message: 'Custom button deleted successfully' });
  } catch (error) {
    console.error('Error deleting custom button:', error);
    res.status(500).json({ message: 'Failed to delete custom button' });
  }
});

module.exports = router;
