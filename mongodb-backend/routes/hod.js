const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken, authorize } = require('../middleware/auth');
const { handleCloudinaryUpload } = require('../middleware/cloudinaryUpload');

// Get all HODs for public display
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all HODs for public display');

    // Find all users with HOD role
    const hods = await User.find({ role: 'hod' })
      .select('-password -resetPasswordToken -resetPasswordExpires -resetOTP -resetOTPExpires')
      .sort({ department: 1 });

    if (!hods || hods.length === 0) {
      console.log('No HODs found');
      return res.status(404).json({ message: 'No HODs found' });
    }

    console.log(`Found ${hods.length} HODs`);
    res.json(hods);
  } catch (error) {
    console.error('Error fetching HODs:', error);
    res.status(500).json({ message: 'Failed to fetch HODs', error: error.message });
  }
});

// Get HOD by ID
router.get('/:id', async (req, res) => {
  try {
    console.log(`Fetching HOD with ID: ${req.params.id}`);

    const hod = await User.findOne({ _id: req.params.id, role: 'hod' })
      .select('-password -resetPasswordToken -resetPasswordExpires -resetOTP -resetOTPExpires');

    if (!hod) {
      console.log('HOD not found');
      return res.status(404).json({ message: 'HOD not found' });
    }

    console.log('HOD found:', hod.name);
    res.json(hod);
  } catch (error) {
    console.error('Error fetching HOD:', error);
    res.status(500).json({ message: 'Failed to fetch HOD', error: error.message });
  }
});

// Get HODs by department
router.get('/department/:department', async (req, res) => {
  try {
    const department = req.params.department;
    console.log(`Fetching HOD for department: ${department}`);

    const hod = await User.findOne({ role: 'hod', department: department })
      .select('-password -resetPasswordToken -resetPasswordExpires -resetOTP -resetOTPExpires');

    if (!hod) {
      console.log(`No HOD found for department: ${department}`);
      return res.status(404).json({ message: `No HOD found for department: ${department}` });
    }

    console.log('HOD found:', hod.name);
    res.json(hod);
  } catch (error) {
    console.error('Error fetching HOD by department:', error);
    res.status(500).json({ message: 'Failed to fetch HOD by department', error: error.message });
  }
});

// Update HOD message (admin or self only)
router.put('/:id/message', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    // Check if user is admin or the HOD themselves
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Access denied - only admins or the HOD can update their message' });
    }

    // Find the HOD
    const hod = await User.findOne({ _id: id, role: 'hod' });

    if (!hod) {
      return res.status(404).json({ message: 'HOD not found' });
    }

    // Update the message
    hod.message = message;
    hod.updatedAt = Date.now();

    await hod.save();

    res.json({ message: 'HOD message updated successfully', data: { message: hod.message } });
  } catch (error) {
    console.error('Error updating HOD message:', error);
    res.status(500).json({ message: 'Failed to update HOD message', error: error.message });
  }
});

// Update HOD profile with Cloudinary (admin or self only)
router.put('/:id/profile', authenticateToken, handleCloudinaryUpload('profilePicture'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department, qualification, experience, designation, message } = req.body;

    // Check if user is admin or the HOD themselves
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Access denied - only admins or the HOD can update their profile' });
    }

    // Find the HOD
    const hod = await User.findOne({ _id: id, role: 'hod' });

    if (!hod) {
      return res.status(404).json({ message: 'HOD not found' });
    }

    // Update fields if provided
    if (name) hod.name = name;
    if (department) hod.department = department;
    if (qualification) hod.qualification = qualification;
    if (experience) hod.experience = experience;
    if (designation) hod.designation = designation;
    if (message) hod.message = message;

    // Update profile picture if provided
    if (req.file) {
      // If there's an existing Cloudinary public ID, we should delete the old image
      if (hod.cloudinaryPublicId) {
        // We'll handle this in a separate middleware or function
        console.log('Old image public ID:', hod.cloudinaryPublicId);
      }

      hod.profilePicture = req.file.path;
      hod.cloudinaryPublicId = req.file.filename;
    }

    hod.updatedAt = Date.now();
    await hod.save();

    // Return updated HOD without sensitive information
    const updatedHod = hod.toObject();
    delete updatedHod.password;
    delete updatedHod.resetPasswordToken;
    delete updatedHod.resetPasswordExpires;
    delete updatedHod.resetOTP;
    delete updatedHod.resetOTPExpires;

    res.json({ message: 'HOD profile updated successfully', data: updatedHod });
  } catch (error) {
    console.error('Error updating HOD profile:', error);
    res.status(500).json({ message: 'Failed to update HOD profile', error: error.message });
  }
});

module.exports = router;
