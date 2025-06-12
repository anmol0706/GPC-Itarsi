const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { cloudinaryUpload, cloudinary, handleCloudinaryUpload } = require('../middleware/cloudinaryUpload');
const fs = require('fs');
const path = require('path');

// Get developer profile (authenticated)
router.get('/profile', authenticateToken, authorize(['developer']), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching developer profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get developer profile (public - no authentication)
router.get('/profile-public', async (req, res) => {
  try {
    console.log('Fetching public developer profile');
    // Find a user with developer role
    let developer = await User.findOne({ role: 'developer' }).select('-password');

    // If no developer exists, create one with default values
    if (!developer) {
      console.log('No developer found. Creating a new developer user with default values...');

      // Create a new developer user with default values
      const newDeveloper = new User({
        username: 'developer',
        password: '$2a$10$rrm7JyNBpv3WN/6srfv2SefNB2GvGEYGz6q8QE6Yy7IFYwoOAMM8K', // developer123
        name: 'Anmol Malviya',
        role: 'developer',
        email: 'anmolmalviya4328@gmail.com',
        profilePicture: 'default-profile.jpg',
        title: 'Web Developer',
        bio: 'I am a web developer specializing in React and Node.js.',
        education: 'Computer Science',
        experience: '5 years',
        socialLinks: {
          github: 'https://github.com/anmolmalviya',
          portfolio: 'https://anmolmalviya.com',
          instagram: 'https://instagram.com/anmolmalviya',
          email: 'anmolmalviya4328@gmail.com'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      developer = await newDeveloper.save();
      console.log('New developer user created successfully with ID:', developer._id);

      // Return the newly created developer without password
      developer = await User.findById(developer._id).select('-password');
    }

    console.log('Returning developer profile:', developer);
    res.json(developer);
  } catch (error) {
    console.error('Error fetching public developer profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update developer profile (authenticated)
router.put('/profile', authenticateToken, authorize(['developer']), async (req, res) => {
  try {
    const { name, title, bio, education, experience, socialLinks } = req.body;

    // Build profile object
    const profileFields = {};
    if (name) profileFields.name = name;
    if (title) profileFields.title = title;
    if (bio) profileFields.bio = bio;
    if (education) profileFields.education = education;
    if (experience) profileFields.experience = experience;
    if (socialLinks) {
      try {
        profileFields.socialLinks = JSON.parse(socialLinks);
      } catch (e) {
        profileFields.socialLinks = socialLinks;
      }
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Error updating developer profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update developer profile (public - no authentication)
router.put('/profile-public', async (req, res) => {
  try {
    const { name, title, bio, education, experience, socialLinks } = req.body;

    // Build profile object
    const profileFields = {};
    if (name) profileFields.name = name;
    if (title) profileFields.title = title;
    if (bio) profileFields.bio = bio;
    if (education) profileFields.education = education;
    if (experience) profileFields.experience = experience;
    if (socialLinks) {
      try {
        profileFields.socialLinks = JSON.parse(socialLinks);
      } catch (e) {
        profileFields.socialLinks = socialLinks;
      }
    }

    // Find developer user
    let developer = await User.findOne({ role: 'developer' });

    // If no developer exists, create one
    if (!developer) {
      console.log('No developer found. Creating a new developer user...');

      // Create a new developer user
      developer = new User({
        username: 'developer',
        password: '$2a$10$rrm7JyNBpv3WN/6srfv2SefNB2GvGEYGz6q8QE6Yy7IFYwoOAMM8K', // developer123
        name: name || 'Developer',
        role: 'developer',
        email: 'developer@gpcitarsi.edu.in',
        profilePicture: 'default-profile.jpg',
        title: title || 'Web Developer',
        bio: bio || 'I am a web developer specializing in React and Node.js.',
        education: education || 'Computer Science',
        experience: experience || '5 years',
        socialLinks: socialLinks ?
          (typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks) :
          {
            github: 'https://github.com/developer',
            portfolio: 'https://developer.com',
            instagram: 'https://instagram.com/developer',
            email: 'developer@example.com'
          },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await developer.save();
      console.log('New developer user created successfully');

      return res.status(201).json({
        message: 'Developer profile created successfully',
        user: developer
      });
    }

    // Update existing user
    const user = await User.findByIdAndUpdate(
      developer._id,
      { $set: profileFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Error updating public developer profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update profile picture (authenticated)
router.put('/profile-picture', authenticateToken, authorize(['developer']), upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old profile picture if exists
    if (user.profilePicture) {
      const oldPicturePath = path.join(__dirname, '..', 'uploads', user.profilePicture);
      if (fs.existsSync(oldPicturePath)) {
        fs.unlinkSync(oldPicturePath);
      }
    }

    // Update user with new profile picture
    user.profilePicture = req.file.filename;
    await user.save();

    res.json({ message: 'Profile picture updated successfully', filename: req.file.filename });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update profile picture (public - no authentication)
router.put('/profile-picture-public', handleCloudinaryUpload('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Find developer user
    let user = await User.findOne({ role: 'developer' });

    // If no developer exists, create one
    if (!user) {
      console.log('No developer found when updating profile picture. Creating a new developer user...');

      // Create a new developer user
      user = new User({
        username: 'developer',
        password: '$2a$10$rrm7JyNBpv3WN/6srfv2SefNB2GvGEYGz6q8QE6Yy7IFYwoOAMM8K', // developer123
        name: 'Developer',
        role: 'developer',
        email: 'developer@gpcitarsi.edu.in',
        title: 'Web Developer',
        bio: 'I am a web developer specializing in React and Node.js.',
        education: 'Computer Science',
        experience: '5 years',
        socialLinks: {
          github: 'https://github.com/developer',
          portfolio: 'https://developer.com',
          instagram: 'https://instagram.com/developer',
          email: 'developer@example.com'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await user.save();
      console.log('New developer user created successfully for profile picture update with ID:', user._id);
    }

    // Delete old profile picture from Cloudinary if exists
    if (user.profilePicture && user.profilePicture.includes('cloudinary')) {
      try {
        // Extract public_id from Cloudinary URL
        const publicId = user.profilePicture.split('/').pop().split('.')[0];
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
          console.log('Deleted old profile picture from Cloudinary:', publicId);
        }
      } catch (cloudinaryError) {
        console.error('Error deleting old profile picture from Cloudinary:', cloudinaryError);
      }
    }
    // Also try to delete from local storage if it exists
    else if (user.profilePicture) {
      const oldPicturePath = path.join(__dirname, '..', 'uploads', user.profilePicture);
      if (fs.existsSync(oldPicturePath)) {
        fs.unlinkSync(oldPicturePath);
        console.log('Deleted old profile picture from local storage:', oldPicturePath);
      }
    }

    // Update user with new profile picture
    // Check if the file was uploaded to Cloudinary or local storage
    if (req.file.path && req.file.path.includes('cloudinary')) {
      // For Cloudinary uploads, store the secure URL
      user.profilePicture = req.file.path;
    } else {
      // For local uploads, store the filename
      user.profilePicture = req.file.filename;
    }

    await user.save();

    res.json({
      message: 'Profile picture updated successfully',
      filename: req.file.filename,
      path: req.file.path || null,
      url: req.file.path || `/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('Error updating public profile picture:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all developers (for public display)
router.get('/s', async (req, res) => {
  try {
    // Find all users with developer role
    const developers = await User.find({ role: 'developer' }).select('-password');

    if (!developers || developers.length === 0) {
      return res.status(404).json({ message: 'No developers found' });
    }

    res.json(developers);
  } catch (error) {
    console.error('Error fetching developers:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all users (developer only)
router.get('/users', authenticateToken, authorize(['developer']), async (req, res) => {
  try {
    console.log('Fetching all users for developer');

    // Exclude password field for security
    const users = await User.find({}).select('-password');

    console.log(`Found ${users.length} users`);

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// Create a new user (developer only)
router.post('/users', authenticateToken, authorize(['developer']), async (req, res) => {
  try {
    const { username, password, name, role, email } = req.body;

    // Check if username already exists
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create new user
    const user = new User({
      username: username.toLowerCase(),
      password,
      name,
      role,
      email
    });

    // Add role-specific fields
    if (role === 'teacher') {
      user.department = req.body.department;
      user.subjects = req.body.subjects || [];
    } else if (role === 'student') {
      user.rollNumber = req.body.rollNumber;
      user.class = req.body.class;
      user.branch = req.body.branch;
    } else if (role === 'developer') {
      user.title = req.body.title;
    }

    await user.save();

    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
});

// Update a user (developer only)
router.put('/users/:id', authenticateToken, authorize(['developer']), async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If password is not changed, don't update it
    if (!updateData.password) {
      delete updateData.password;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
});

// Delete a user (developer only)
router.delete('/users/:id', authenticateToken, authorize(['developer']), async (req, res) => {
  try {
    const userId = req.params.id;

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});

// Reset user password (developer only)
router.post('/reset-user-password/:id', authenticateToken, authorize(['developer']), async (req, res) => {
  try {
    const userId = req.params.id;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    console.log(`Password reset for user: ${user.username} (${user._id})`);

    res.json({
      message: 'Password reset successfully',
      userId: user._id,
      username: user.username
    });
  } catch (error) {
    console.error('Error resetting user password:', error);
    res.status(500).json({ message: 'Failed to reset user password', error: error.message });
  }
});

module.exports = router;
