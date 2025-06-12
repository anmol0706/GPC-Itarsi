const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const MockTeacher = require('../models/MockTeacher');
const { authenticateToken, authorize } = require('../middleware/auth');

// Determine which model to use based on environment
const UserModel = User;
// Use MockTeacher as a fallback if needed
const TeacherModel = process.env.NODE_ENV === 'mock' ? MockTeacher : Teacher;

// Get all faculty members (public route)
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/faculty - Fetching all faculty members');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Using models - UserModel:', UserModel.modelName || 'MockUser', 'TeacherModel:', TeacherModel.modelName || 'MockTeacher');

    let faculty = [];
    let userModelError = null;

    // First try to get teachers from User model with role 'teacher'
    try {
      console.log('Attempting to fetch teachers from User model');
      faculty = await UserModel.find({ role: 'teacher' })
        .select('-password -plainTextPassword')
        .sort({ displayOrder: 1, name: 1 }); // Sort by displayOrder first, then by name
      console.log(`User model returned ${faculty.length} teachers`);
    } catch (err) {
      userModelError = err;
      console.error('Error fetching from User model:', err.message);
      faculty = []; // Ensure faculty is empty if there was an error
    }

    // If no teachers found in User model or there was an error, try the Teacher model
    if (!faculty || faculty.length === 0) {
      console.log('No teachers found in User model or there was an error, trying Teacher model');
      try {
        // Use MockTeacher if we're in development or if there was a database error
        const teacherResults = await TeacherModel.find();
        console.log(`Teacher model returned ${teacherResults.length} teachers`);
        faculty = teacherResults;
      } catch (teacherErr) {
        console.error('Error fetching from Teacher model:', teacherErr.message);
        // If both models failed, return the original error
        if (userModelError) {
          throw userModelError;
        }
        throw teacherErr;
      }
    }

    // Map the data to ensure consistent structure
    const mappedFaculty = faculty.map(teacher => {
      // Create a consistent structure regardless of which model the data came from
      return {
        _id: teacher._id,
        name: teacher.name,
        department: teacher.department,
        designation: teacher.designation || `Faculty, ${teacher.department}`,
        qualification: teacher.qualification || 'M.Tech',
        experience: teacher.experience || '5+ years',
        subjects: teacher.subjects || [],
        profilePicture: teacher.profilePicture || teacher.photo || 'default-teacher.jpg',
        email: teacher.email || `${teacher.name.toLowerCase().replace(/\s+/g, '.')}@gpcitarsi.edu.in`,
        phone: teacher.phone || '',
        bio: teacher.bio || `Faculty member in the ${teacher.department} department.`
      };
    });

    console.log(`Found ${mappedFaculty.length} faculty members`);

    // If we still have no faculty, use hardcoded data as a last resort
    if (mappedFaculty.length === 0) {
      console.log('No faculty found in any model, using hardcoded fallback data');
      const fallbackFaculty = [
        {
          _id: 'fallback1',
          name: 'Dr. Rajesh Kumar',
          department: 'Computer Science',
          designation: 'Professor',
          qualification: 'Ph.D. in Computer Science',
          experience: '15 years',
          subjects: ['Data Structures', 'Algorithms', 'Database Management'],
          profilePicture: 'default-teacher.jpg',
          email: 'rajesh.kumar@gpcitarsi.edu.in',
          phone: '',
          bio: 'Professor in the Computer Science department.'
        },
        {
          _id: 'fallback2',
          name: 'Prof. Sunita Verma',
          department: 'Electrical Engineering',
          designation: 'Associate Professor',
          qualification: 'M.Tech in Electrical Engineering',
          experience: '12 years',
          subjects: ['Circuit Theory', 'Power Systems', 'Electrical Machines'],
          profilePicture: 'default-teacher.jpg',
          email: 'sunita.verma@gpcitarsi.edu.in',
          phone: '',
          bio: 'Associate Professor in the Electrical Engineering department.'
        }
      ];
      res.json(fallbackFaculty);
    } else {
      res.json(mappedFaculty);
    }
  } catch (error) {
    console.error('Error fetching faculty members:', error);
    res.status(500).json({
      message: 'Failed to fetch faculty members',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
});

// Get faculty member by ID (public route)
router.get('/:id', async (req, res) => {
  try {
    console.log(`GET /api/faculty/${req.params.id} - Fetching faculty member by ID`);

    // First try to find in User model
    let faculty = await UserModel.findOne({ _id: req.params.id, role: 'teacher' }).select('-password -plainTextPassword');

    // If not found, try Teacher model
    if (!faculty) {
      console.log('Faculty member not found in User model, trying Teacher model');
      faculty = await TeacherModel.findById(req.params.id);
    }

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty member not found' });
    }

    // Map the data to ensure consistent structure
    const mappedFaculty = {
      _id: faculty._id,
      name: faculty.name,
      department: faculty.department,
      designation: faculty.designation,
      qualification: faculty.qualification,
      experience: faculty.experience,
      subjects: faculty.subjects || [],
      profilePicture: faculty.profilePicture || faculty.photo,
      email: faculty.email,
      phone: faculty.phone,
      bio: faculty.bio
    };

    console.log('Faculty member found:', mappedFaculty.name);
    res.json(mappedFaculty);
  } catch (error) {
    console.error('Error fetching faculty member:', error);
    res.status(500).json({ message: 'Failed to fetch faculty member', error: error.message });
  }
});

// Get faculty members by department (public route)
router.get('/department/:dept', async (req, res) => {
  try {
    const department = req.params.dept;
    console.log(`GET /api/faculty/department/${department} - Fetching faculty members by department`);

    // First try to get from User model
    let faculty = await UserModel.find({ role: 'teacher', department }).select('-password -plainTextPassword');

    // If no results, try Teacher model
    if (!faculty || faculty.length === 0) {
      console.log('No faculty members found in User model for department, trying Teacher model');
      faculty = await TeacherModel.find({ department });
    }

    // Map the data to ensure consistent structure
    const mappedFaculty = faculty.map(teacher => ({
      _id: teacher._id,
      name: teacher.name,
      department: teacher.department,
      designation: teacher.designation,
      qualification: teacher.qualification,
      experience: teacher.experience,
      subjects: teacher.subjects || [],
      profilePicture: teacher.profilePicture || teacher.photo,
      email: teacher.email,
      phone: teacher.phone,
      bio: teacher.bio
    }));

    console.log(`Found ${mappedFaculty.length} faculty members for department ${department}`);
    res.json(mappedFaculty);
  } catch (error) {
    console.error('Error fetching faculty members by department:', error);
    res.status(500).json({ message: 'Failed to fetch faculty members by department', error: error.message });
  }
});

// Update faculty display order (admin only)
router.put('/update-order', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    console.log('PUT /api/faculty/update-order - Updating faculty display order');
    const { facultyOrder } = req.body;

    if (!facultyOrder || !Array.isArray(facultyOrder)) {
      return res.status(400).json({ message: 'Invalid request. Faculty order array is required.' });
    }

    console.log(`Received order update for ${facultyOrder.length} faculty members`);

    // Process each faculty member in the array
    const updatePromises = facultyOrder.map(async (item, index) => {
      if (!item._id) {
        console.warn(`Skipping item at index ${index} - missing _id`);
        return null;
      }

      try {
        // Update the display order for this faculty member
        const result = await UserModel.findOneAndUpdate(
          { _id: item._id, role: 'teacher' },
          { displayOrder: index },
          { new: true }
        ).select('name displayOrder');

        if (!result) {
          console.warn(`Faculty member not found with ID: ${item._id}`);
          return null;
        }

        console.log(`Updated display order for ${result.name} to ${result.displayOrder}`);
        return result;
      } catch (updateError) {
        console.error(`Error updating faculty member ${item._id}:`, updateError);
        return null;
      }
    });

    // Wait for all updates to complete
    const results = await Promise.all(updatePromises);
    const successfulUpdates = results.filter(Boolean);

    console.log(`Successfully updated ${successfulUpdates.length} out of ${facultyOrder.length} faculty members`);
    res.json({
      message: `Successfully updated display order for ${successfulUpdates.length} faculty members`,
      updatedFaculty: successfulUpdates
    });
  } catch (error) {
    console.error('Error updating faculty display order:', error);
    res.status(500).json({
      message: 'Failed to update faculty display order',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
});

module.exports = router;
