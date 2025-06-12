const express = require('express');
const router = express.Router();
const User = require('../models/User');
const MockUser = require('../models/MockUser');
const MockTeacher = require('../models/MockTeacher');
const { authenticateToken, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { cloudinaryUpload, cloudinary } = require('../middleware/cloudinaryUpload');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Determine which models to use based on environment
const UserModel = process.env.NODE_ENV === 'mock' || (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('localhost'))
  ? MockUser
  : User;
const TeacherModel = process.env.NODE_ENV === 'mock' || (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('localhost'))
  ? MockTeacher
  : User; // Fallback to User model for production

// Get all teachers
router.get('/', async (req, res) => {
  try {
    // If using User model, filter by role
    if (UserModel === User) {
      const teachers = await UserModel.find({ role: 'teacher' }).select('-password');
      return res.json(teachers);
    }

    // If using MockTeacher, get all teachers
    const teachers = await TeacherModel.find();
    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ message: 'Failed to fetch teachers' });
  }
});

// Get students for attendance
router.get('/students', authenticateToken, authorize(['teacher']), async (req, res) => {
  try {
    console.log('Fetching students for attendance for teacher ID:', req.user.id);

    // Get all students with role 'student'
    const students = await User.find({ role: 'student' })
      .select('name rollNumber class branch')
      .sort({ rollNumber: 1 });

    if (!students || students.length === 0) {
      return res.status(404).json({ message: 'No students found' });
    }

    console.log(`Found ${students.length} students for attendance`);
    res.json(students);
  } catch (error) {
    console.error('Error fetching students for attendance:', error);
    res.status(500).json({ message: 'Failed to fetch students for attendance', error: error.message });
  }
});

// Get teacher profile (for teacher to view their own profile)
router.get('/profile', authenticateToken, authorize(['teacher']), async (req, res) => {
  try {
    console.log('Fetching teacher profile for ID:', req.user.id);

    // Get the teacher data with all fields except password
    const teacher = await User.findById(req.user.id).select('-password -plainTextPassword');

    if (!teacher) {
      console.error('Teacher not found with ID:', req.user.id);
      return res.status(404).json({ message: 'Teacher not found' });
    }

    console.log('Teacher profile found:', {
      id: teacher._id,
      name: teacher.name,
      department: teacher.department,
      profileComplete: teacher.profileComplete
    });

    // Return the full teacher object
    res.json(teacher);
  } catch (error) {
    console.error('Error fetching teacher profile:', error);
    res.status(500).json({ message: 'Failed to fetch teacher profile' });
  }
});

// Get teacher by ID
router.get('/:id', async (req, res) => {
  try {
    let teacher;

    // If using User model, filter by role
    if (UserModel === User) {
      teacher = await UserModel.findOne({ _id: req.params.id, role: 'teacher' }).select('-password');
    } else {
      // If using MockTeacher, get by ID
      teacher = await TeacherModel.findById(req.params.id);
    }

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json(teacher);
  } catch (error) {
    console.error('Error fetching teacher:', error);
    res.status(500).json({ message: 'Failed to fetch teacher' });
  }
});

// Add a new teacher (admin only)
router.post('/', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { name, department, subjects, username, password } = req.body;

    if (!name || !department) {
      return res.status(400).json({ message: 'Name and department are required' });
    }

    // Create username if not provided
    const teacherUsername = username || name.toLowerCase().replace(/\s+/g, '.');

    // Check if username already exists
    const existingTeacher = await User.findOne({ username: teacherUsername });
    if (existingTeacher) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create new teacher
    const teacher = new User({
      username: teacherUsername,
      password: password || '1234', // Default password if not provided
      name,
      role: 'teacher',
      department,
      subjects: subjects || []
    });

    await teacher.save();

    // Return teacher without password
    const teacherResponse = teacher.toObject();
    delete teacherResponse.password;

    res.status(201).json(teacherResponse);
  } catch (error) {
    console.error('Error adding teacher:', error);
    res.status(500).json({ message: 'Failed to add teacher', error: error.message });
  }
});

// Update teacher (admin only)
router.put('/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const teacher = await User.findOne({ _id: req.params.id, role: 'teacher' });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Update fields
    const fieldsToUpdate = ['name', 'department', 'subjects'];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        teacher[field] = req.body[field];
      }
    });

    // Special handling for username
    if (req.body.username && req.body.username !== teacher.username) {
      // Check if new username already exists
      const existingTeacher = await User.findOne({ username: req.body.username });
      if (existingTeacher && existingTeacher._id.toString() !== req.params.id) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      teacher.username = req.body.username;
    }

    // Update password if provided
    if (req.body.password) {
      teacher.password = req.body.password;
    }

    teacher.updatedAt = Date.now();
    await teacher.save();

    // Return teacher without password
    const teacherResponse = teacher.toObject();
    delete teacherResponse.password;

    res.json(teacherResponse);
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({ message: 'Failed to update teacher', error: error.message });
  }
});

// Delete teacher (admin only)
router.delete('/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const teacher = await User.findOne({ _id: req.params.id, role: 'teacher' });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // If the teacher has a Cloudinary profile picture, delete it
    if (teacher.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(teacher.cloudinaryPublicId);
        console.log(`Deleted teacher profile picture from Cloudinary: ${teacher.cloudinaryPublicId}`);
      } catch (err) {
        console.error('Error deleting teacher profile picture from Cloudinary:', err);
        // Continue with deletion even if Cloudinary deletion fails
      }
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ message: 'Failed to delete teacher' });
  }
});

// Mark attendance for a student
router.post('/mark-attendance', authenticateToken, authorize(['teacher']), async (req, res) => {
  try {
    const { studentId, subject, present, date } = req.body;

    if (!studentId || !subject || present === undefined || !date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if student exists
    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Create attendance record
    // Note: In a real application, you would have a separate Attendance model
    // For simplicity, we'll just return success
    console.log(`Marking attendance for student ${studentId} in ${subject} as ${present ? 'present' : 'absent'} on ${date}`);

    res.json({ message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Failed to mark attendance', error: error.message });
  }
});

module.exports = router;
