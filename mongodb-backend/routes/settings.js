const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { authenticateToken, authorize } = require('../middleware/auth');

// Get website settings (public)
router.get('/', async (req, res) => {
  try {
    // Find settings or create default if none exists
    let settings = await Settings.findOne();
    
    if (!settings) {
      console.log('No settings found. Creating default settings...');
      settings = new Settings();
      await settings.save();
      console.log('Default settings created successfully');
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update website settings (requires developer role)
router.put('/', authenticateToken, authorize(['developer', 'admin']), async (req, res) => {
  try {
    const {
      siteName,
      siteDescription,
      contactEmail,
      contactPhone,
      address,
      socialLinks,
      colors
    } = req.body;

    // Build settings object
    const settingsFields = {
      updatedAt: Date.now()
    };
    
    if (siteName) settingsFields.siteName = siteName;
    if (siteDescription) settingsFields.siteDescription = siteDescription;
    if (contactEmail) settingsFields.contactEmail = contactEmail;
    if (contactPhone) settingsFields.contactPhone = contactPhone;
    if (address) settingsFields.address = address;
    
    // Handle social links
    if (socialLinks) {
      try {
        // If socialLinks is a string, parse it
        if (typeof socialLinks === 'string') {
          settingsFields.socialLinks = JSON.parse(socialLinks);
        } else {
          settingsFields.socialLinks = socialLinks;
        }
      } catch (e) {
        console.error('Error parsing socialLinks:', e);
        return res.status(400).json({ message: 'Invalid socialLinks format' });
      }
    }
    
    // Handle colors
    if (colors) {
      try {
        // If colors is a string, parse it
        if (typeof colors === 'string') {
          settingsFields.colors = JSON.parse(colors);
        } else {
          settingsFields.colors = colors;
        }
      } catch (e) {
        console.error('Error parsing colors:', e);
        return res.status(400).json({ message: 'Invalid colors format' });
      }
    }

    // Find settings or create default if none exists
    let settings = await Settings.findOne();
    
    if (!settings) {
      // Create new settings with provided fields
      settings = new Settings(settingsFields);
      await settings.save();
      return res.json(settings);
    }
    
    // Update existing settings
    settings = await Settings.findOneAndUpdate(
      {}, // Find the first document
      { $set: settingsFields },
      { new: true }
    );
    
    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update website settings (public - no authentication)
// This is for development purposes only and should be removed in production
router.put('/public', async (req, res) => {
  try {
    const {
      siteName,
      siteDescription,
      contactEmail,
      contactPhone,
      address,
      socialLinks,
      colors
    } = req.body;

    // Build settings object
    const settingsFields = {
      updatedAt: Date.now()
    };
    
    if (siteName) settingsFields.siteName = siteName;
    if (siteDescription) settingsFields.siteDescription = siteDescription;
    if (contactEmail) settingsFields.contactEmail = contactEmail;
    if (contactPhone) settingsFields.contactPhone = contactPhone;
    if (address) settingsFields.address = address;
    
    // Handle social links
    if (socialLinks) {
      try {
        // If socialLinks is a string, parse it
        if (typeof socialLinks === 'string') {
          settingsFields.socialLinks = JSON.parse(socialLinks);
        } else {
          settingsFields.socialLinks = socialLinks;
        }
      } catch (e) {
        console.error('Error parsing socialLinks:', e);
        return res.status(400).json({ message: 'Invalid socialLinks format' });
      }
    }
    
    // Handle colors
    if (colors) {
      try {
        // If colors is a string, parse it
        if (typeof colors === 'string') {
          settingsFields.colors = JSON.parse(colors);
        } else {
          settingsFields.colors = colors;
        }
      } catch (e) {
        console.error('Error parsing colors:', e);
        return res.status(400).json({ message: 'Invalid colors format' });
      }
    }

    // Find settings or create default if none exists
    let settings = await Settings.findOne();
    
    if (!settings) {
      // Create new settings with provided fields
      settings = new Settings(settingsFields);
      await settings.save();
      return res.json(settings);
    }
    
    // Update existing settings
    settings = await Settings.findOneAndUpdate(
      {}, // Find the first document
      { $set: settingsFields },
      { new: true }
    );
    
    res.json(settings);
  } catch (error) {
    console.error('Error updating public settings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
