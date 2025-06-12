const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const MockCourse = require('../models/MockCourse');
const { authenticateToken, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { cloudinaryUpload, cloudinary } = require('../middleware/cloudinaryUpload');

// Determine which model to use based on environment
const CourseModel = process.env.NODE_ENV === 'mock' || (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('localhost'))
  ? MockCourse
  : Course;

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await CourseModel.find();
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
});

// Get course by ID
router.get('/:id', async (req, res) => {
  try {
    const course = await CourseModel.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Failed to fetch course' });
  }
});

// Add a new course (admin only)
router.post('/', authenticateToken, authorize(['admin']), cloudinaryUpload.single('image'), async (req, res) => {
  try {
    const { title, code, description, duration, eligibility, seats, fees } = req.body;

    if (!title || !code || !description || !duration || !eligibility || !seats || !fees) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if course code already exists
    const existingCourse = await Course.findOne({ code });
    if (existingCourse) {
      return res.status(400).json({ message: 'Course code already exists' });
    }

    // Create new course
    const course = new Course({
      title,
      code,
      description,
      duration,
      eligibility,
      seats: parseInt(seats),
      fees: parseInt(fees),
      image: req.file ? req.file.path : 'default-course.jpg',
      cloudinaryPublicId: req.file ? req.file.filename : undefined
    });

    await course.save();

    res.status(201).json(course);
  } catch (error) {
    console.error('Error adding course:', error);
    res.status(500).json({ message: 'Failed to add course', error: error.message });
  }
});

// Update course (admin only)
router.put('/:id', authenticateToken, authorize(['admin']), cloudinaryUpload.single('image'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Update fields
    const fieldsToUpdate = ['title', 'description', 'duration', 'eligibility'];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        course[field] = req.body[field];
      }
    });

    // Special handling for numeric fields
    if (req.body.seats !== undefined) {
      course.seats = parseInt(req.body.seats);
    }

    if (req.body.fees !== undefined) {
      course.fees = parseInt(req.body.fees);
    }

    // Special handling for course code
    if (req.body.code && req.body.code !== course.code) {
      // Check if new code already exists
      const existingCourse = await Course.findOne({ code: req.body.code });
      if (existingCourse && existingCourse._id.toString() !== req.params.id) {
        return res.status(400).json({ message: 'Course code already exists' });
      }

      course.code = req.body.code;
    }

    // Update image if provided
    if (req.file) {
      // If there was a previous Cloudinary image, delete it
      if (course.cloudinaryPublicId) {
        try {
          await cloudinary.uploader.destroy(course.cloudinaryPublicId);
          console.log(`Deleted previous course image from Cloudinary: ${course.cloudinaryPublicId}`);
        } catch (err) {
          console.error('Error deleting previous course image from Cloudinary:', err);
          // Continue with update even if Cloudinary deletion fails
        }
      }

      course.image = req.file.path;
      course.cloudinaryPublicId = req.file.filename;
    }

    course.updatedAt = Date.now();
    await course.save();

    res.json(course);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Failed to update course', error: error.message });
  }
});

// Delete course (admin only)
router.delete('/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // If the course has a Cloudinary image, delete it
    if (course.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(course.cloudinaryPublicId);
        console.log(`Deleted course image from Cloudinary: ${course.cloudinaryPublicId}`);
      } catch (err) {
        console.error('Error deleting course image from Cloudinary:', err);
        // Continue with deletion even if Cloudinary deletion fails
      }
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Failed to delete course' });
  }
});

module.exports = router;
