const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken, authorize } = require('../middleware/auth');
const { cloudinaryUpload, cloudinary } = require('../middleware/cloudinaryUpload');
const fs = require('fs');
const path = require('path');
const { check, validationResult } = require('express-validator');

// Update teacher profile picture with Cloudinary
router.put('/update-picture', authenticateToken, authorize(['teacher']), cloudinaryUpload.single('profilePicture'), async (req, res) => {
  try {
    console.log('Updating teacher profile picture with Cloudinary for user ID:', req.user.id);

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const teacher = await User.findById(req.user.id);

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // If the teacher has a previous Cloudinary profile picture, delete it
    if (teacher.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(teacher.cloudinaryPublicId);
        console.log(`Deleted previous teacher profile picture from Cloudinary: ${teacher.cloudinaryPublicId}`);
      } catch (err) {
        console.error('Error deleting previous teacher profile picture from Cloudinary:', err);
        // Continue with update even if Cloudinary deletion fails
      }
    }

    // Delete old local profile picture if exists
    if (teacher.profilePicture && !teacher.profilePicture.includes('cloudinary.com') && teacher.profilePicture !== 'default-profile.jpg') {
      try {
        const oldPicturePath = path.join(__dirname, '..', 'uploads', teacher.profilePicture);
        if (fs.existsSync(oldPicturePath)) {
          fs.unlinkSync(oldPicturePath);
          console.log(`Deleted old local profile picture: ${oldPicturePath}`);
        }
      } catch (err) {
        console.error('Error deleting old local profile picture:', err);
        // Continue with update even if local file deletion fails
      }
    }

    // Update teacher with new profile picture from Cloudinary
    teacher.profilePicture = req.file.path;
    teacher.cloudinaryPublicId = req.file.filename;
    teacher.updatedAt = Date.now();

    await teacher.save();

    console.log('Teacher profile picture updated successfully with Cloudinary:', {
      profilePicture: teacher.profilePicture,
      cloudinaryPublicId: teacher.cloudinaryPublicId
    });

    res.json({
      message: 'Profile picture updated successfully',
      profilePicture: teacher.profilePicture
    });
  } catch (error) {
    console.error('Error updating teacher profile picture with Cloudinary:', error);
    res.status(500).json({
      message: 'Failed to update profile picture',
      error: error.message
    });
  }
});

// Update teacher profile information
router.put('/update',
  authenticateToken,
  authorize(['teacher']),
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').optional().isEmail(),
    check('phone', 'Please enter a valid phone number').optional(),
    check('department', 'Department is required').not().isEmpty(),
    check('qualification', 'Qualification is required').optional(),
    check('experience', 'Experience is required').optional(),
    check('subjects', 'Subjects must be an array').optional().isArray()
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      console.log('Updating teacher profile for user ID:', req.user.id);

      const teacher = await User.findById(req.user.id);

      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }

      // Extract fields from request body
      const { name, email, phone, department, qualification, experience, subjects, bio } = req.body;

      console.log('Updating teacher profile with data:', {
        name, email, phone, department, qualification, experience,
        subjects: Array.isArray(subjects) ? `${subjects.length} subjects` : subjects,
        bio: bio ? 'Provided' : 'Not provided'
      });

      // Check if there are any actual changes to make
      let hasChanges = false;

      // Compare each field to see if there are changes
      if (name && name !== teacher.name) {
        teacher.name = name;
        hasChanges = true;
      }
      if (email && email !== teacher.email) {
        teacher.email = email;
        hasChanges = true;
      }
      if (phone && phone !== teacher.phone) {
        teacher.phone = phone;
        hasChanges = true;
      }
      if (department && department !== teacher.department) {
        teacher.department = department;
        hasChanges = true;
      }
      if (qualification && qualification !== teacher.qualification) {
        teacher.qualification = qualification;
        hasChanges = true;
      }
      if (experience && experience !== teacher.experience) {
        teacher.experience = experience;
        hasChanges = true;
      }
      if (bio !== undefined && bio !== teacher.bio) {
        teacher.bio = bio;
        hasChanges = true;
      }
      if (subjects && JSON.stringify(subjects) !== JSON.stringify(teacher.subjects)) {
        teacher.subjects = subjects;
        hasChanges = true;
      }

      // If no changes were made, return early
      if (!hasChanges) {
        console.log('No changes detected in teacher profile update request');
        return res.json({
          message: 'No changes detected',
          teacher: teacher.toObject()
        });
      }

      // Mark profile as complete if it was previously incomplete
      // and required fields are now filled
      if (teacher.profileComplete === false &&
          name && department && qualification && experience) {
        teacher.profileComplete = true;
        console.log('Teacher profile marked as complete');
      }

      teacher.updatedAt = Date.now();

      // Save the updated teacher profile
      await teacher.save();

      console.log('Teacher profile updated successfully with fields:', Object.keys(req.body));

      // Return updated teacher without password
      const teacherResponse = teacher.toObject();
      delete teacherResponse.password;
      delete teacherResponse.plainTextPassword;

      res.json({
        message: 'Profile updated successfully',
        teacher: teacherResponse
      });
    } catch (error) {
      console.error('Error updating teacher profile:', error);
      res.status(500).json({
        message: 'Failed to update profile',
        error: error.message
      });
    }
  }
);

module.exports = router;
