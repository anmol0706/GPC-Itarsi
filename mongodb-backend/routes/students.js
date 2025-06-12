const express = require('express');
const router = express.Router();
const User = require('../models/User');
const MockUser = require('../models/MockUser');
const { authenticateToken, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Determine which user model to use based on environment
const UserModel = process.env.NODE_ENV === 'mock' || (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('localhost'))
  ? MockUser
  : User;

// Get all students (admin and teacher access)
router.get('/', authenticateToken, authorize(['admin', 'teacher']), async (req, res) => {
  try {
    const students = await UserModel.find({ role: 'student' });

    // If the user is a teacher, filter out sensitive information
    if (req.user.role === 'teacher') {
      const limitedStudentData = students.map(student => ({
        _id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        class: student.class,
        branch: student.branch,
        attendance: student.attendance,
        profilePicture: student.profilePicture
      }));
      return res.json(limitedStudentData);
    }

    // For admins, return full data but without passwords
    const studentsWithoutPasswords = students.map(student => {
      const studentObj = typeof student.toObject === 'function'
        ? student.toObject()
        : {...student};

      delete studentObj.password;
      return studentObj;
    });

    res.json(studentsWithoutPasswords);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
});

// Get attendance for a specific student (admin, teacher, and student access)
router.get('/attendance/:studentId', authenticateToken, authorize(['admin', 'teacher', 'student']), async (req, res) => {
  try {
    const { studentId } = req.params;

    // If student is accessing, they can only view their own attendance
    if (req.user.role === 'student' && studentId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied - students can only view their own attendance' });
    }

    // Find the student
    const student = await UserModel.findOne({ _id: studentId, role: 'student' });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // For now, we'll return mock attendance records
    // In a real implementation, you would fetch actual attendance records from a database
    const today = new Date();
    const records = [];

    // Generate some mock attendance records for the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Random attendance status (present/absent)
      const isPresent = Math.random() > 0.2; // 80% chance of being present

      records.push({
        date: date.toISOString().split('T')[0],
        status: isPresent ? 'present' : 'absent',
        subject: ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'English'][Math.floor(Math.random() * 5)]
      });
    }

    res.json({
      student: {
        _id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        class: student.class,
        branch: student.branch,
        attendance: student.attendance || 0
      },
      records: records
    });
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    res.status(500).json({ message: 'Failed to fetch student attendance' });
  }
});

// Get student profile (for student to view their own profile)
router.get('/profile', authenticateToken, authorize(['student']), async (req, res) => {
  try {
    const student = await UserModel.findById(req.user.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Remove password from response
    const studentObj = typeof student.toObject === 'function'
      ? student.toObject()
      : {...student};

    delete studentObj.password;

    res.json(studentObj);
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ message: 'Failed to fetch student profile' });
  }
});

// Get student by ID
router.get('/:id', authenticateToken, authorize(['admin', 'teacher']), async (req, res) => {
  try {
    const student = await UserModel.findOne({ _id: req.params.id, role: 'student' });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // If the user is a teacher, filter out sensitive information
    if (req.user.role === 'teacher') {
      const limitedStudentData = {
        _id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        class: student.class,
        branch: student.branch,
        attendance: student.attendance,
        profilePicture: student.profilePicture
      };
      return res.json(limitedStudentData);
    }

    // For admins, return full data
    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Failed to fetch student' });
  }
});

// Add a new student (admin only)
router.post('/', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { name, rollNumber, class: className, password, branch } = req.body;

    if (!name || !rollNumber || !className || !branch) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate branch - must be one of CS, ME, ET, EE
    const validBranches = ['CS', 'ME', 'ET', 'EE'];
    if (!validBranches.includes(branch)) {
      return res.status(400).json({ message: 'Branch must be one of: CS, ME, ET, EE' });
    }

    // Check if roll number already exists
    const existingStudent = await User.findOne({ rollNumber });
    if (existingStudent) {
      return res.status(400).json({ message: 'Roll number already exists' });
    }

    // Generate a unique email for the student based on roll number
    // Sanitize roll number for email (remove any characters that might not be valid in an email)
    const sanitizedRollNumber = rollNumber.toLowerCase().replace(/[^a-zA-Z0-9._-]/g, '');
    const email = `${sanitizedRollNumber}@gpcitarsi.edu.in`;

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'A student with this email already exists' });
    }

    // Create new student
    const student = new User({
      username: rollNumber.toLowerCase(), // Use roll number as username
      password: password || '1234', // Default password if not provided
      name,
      role: 'student',
      rollNumber,
      class: className,
      branch,
      email, // Add email field
      attendance: 0 // Default attendance
    });

    await student.save();

    // Return student without password
    const studentResponse = student.toObject();
    delete studentResponse.password;

    res.status(201).json(studentResponse);
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ message: 'Failed to add student', error: error.message });
  }
});

// Update student (admin only)
router.put('/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update fields
    const fieldsToUpdate = ['name', 'class', 'branch', 'attendance'];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        student[field] = req.body[field];
      }
    });

    // Special handling for roll number (username)
    if (req.body.rollNumber && req.body.rollNumber !== student.rollNumber) {
      // Check if new roll number already exists
      const existingStudent = await User.findOne({ rollNumber: req.body.rollNumber });
      if (existingStudent && existingStudent._id.toString() !== req.params.id) {
        return res.status(400).json({ message: 'Roll number already exists' });
      }

      // Generate a new email based on the new roll number
      // Sanitize roll number for email (remove any characters that might not be valid in an email)
      const sanitizedRollNumber = req.body.rollNumber.toLowerCase().replace(/[^a-zA-Z0-9._-]/g, '');
      const newEmail = `${sanitizedRollNumber}@gpcitarsi.edu.in`;

      // Check if the new email already exists
      const existingEmail = await User.findOne({ email: newEmail });
      if (existingEmail && existingEmail._id.toString() !== req.params.id) {
        return res.status(400).json({ message: 'A student with this email already exists' });
      }

      student.rollNumber = req.body.rollNumber;
      student.username = req.body.rollNumber.toLowerCase();
      student.email = newEmail;
    }

    // Update password if provided
    if (req.body.password) {
      student.password = req.body.password;
    }

    student.updatedAt = Date.now();
    await student.save();

    // Return student without password
    const studentResponse = student.toObject();
    delete studentResponse.password;

    res.json(studentResponse);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Failed to update student', error: error.message });
  }
});

// Delete student (admin only)
router.delete('/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Failed to delete student' });
  }
});

// Promote students (admin only)
router.post('/promote', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { fromClass, toClass, branch } = req.body;

    if (!fromClass || !toClass || !branch) {
      return res.status(400).json({ message: 'From class, to class, and branch are required' });
    }

    // Find all students in the specified class and branch
    const students = await User.find({ role: 'student', class: fromClass, branch });

    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found in the specified class and branch' });
    }

    // Update all students to the new class
    const updatePromises = students.map(student => {
      student.class = toClass;
      student.updatedAt = Date.now();
      return student.save();
    });

    await Promise.all(updatePromises);

    res.json({
      message: `Successfully promoted ${students.length} students from ${fromClass} to ${toClass}`,
      count: students.length
    });
  } catch (error) {
    console.error('Error promoting students:', error);
    res.status(500).json({ message: 'Failed to promote students', error: error.message });
  }
});

module.exports = router;
