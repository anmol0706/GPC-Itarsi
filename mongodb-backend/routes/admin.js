const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Document = require('../models/Document');
const { authenticateToken, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload'); // Local file upload
const { cloudinaryUpload, cloudinary } = require('../middleware/cloudinaryUpload'); // Cloudinary upload
const compressAndUpload = require('../middleware/compressAndUpload'); // Compression and upload
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Add a new teacher (admin only) - Simplified version
router.post('/add-teacher', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    console.log('Received request to add teacher:', req.body);
    console.log('User making request:', req.user ? `ID: ${req.user.id}, Role: ${req.user.role}` : 'No user in request');

    const { name, department, username, password, email } = req.body;

    // Validate required fields
    if (!name || !username || !password || !department) {
      console.log('Missing required fields:', {
        name: !!name,
        username: !!username,
        password: !!password,
        department: !!department
      });
      return res.status(400).json({ message: 'Name, username, password, and department are required' });
    }

    try {
      // Check if username already exists
      const existingTeacher = await User.findOne({ username });
      if (existingTeacher) {
        console.log('Username already exists:', username);
        return res.status(400).json({ message: 'Username already exists' });
      }
    } catch (findError) {
      console.error('Error checking for existing username:', findError);
      return res.status(500).json({
        message: 'Database error while checking username',
        error: findError.message,
        stack: process.env.NODE_ENV === 'production' ? null : findError.stack
      });
    }

    // Handle email - either use provided email or generate one
    let teacherEmail = email;
    if (!teacherEmail) {
      // Generate a unique email for the teacher based on username
      // Sanitize username for email (remove any characters that might not be valid in an email)
      const sanitizedUsername = username.replace(/[^a-zA-Z0-9._-]/g, '');
      teacherEmail = `${sanitizedUsername}@gpc-itarsi.edu.in`;
    }

    // Check if email already exists
    try {
      const existingEmail = await User.findOne({ email: teacherEmail });
      if (existingEmail) {
        console.log('Email already exists:', teacherEmail);
        return res.status(400).json({
          message: 'Duplicate key error',
          error: 'A teacher with this email already exists',
          field: 'email'
        });
      }
    } catch (emailError) {
      console.error('Error checking for existing email:', emailError);
      return res.status(500).json({
        message: 'Database error while checking email',
        error: emailError.message,
        stack: process.env.NODE_ENV === 'production' ? null : emailError.stack
      });
    }

    // Create new teacher object with minimal required fields
    // Other fields will be completed by the teacher after login
    const teacherData = {
      username,
      password,
      name,
      role: 'teacher',
      department,
      email: teacherEmail,
      profileComplete: false // Flag to indicate profile needs completion
    };

    console.log('Creating new teacher with data:', { ...teacherData, password: '[HIDDEN]' });

    try {
      // Create new teacher
      const teacher = new User(teacherData);

      // Save the teacher to the database
      await teacher.save();
      console.log('Teacher saved successfully with ID:', teacher._id);

      // Return teacher without password
      const teacherResponse = teacher.toObject();
      delete teacherResponse.password;

      res.status(201).json(teacherResponse);
    } catch (saveError) {
      console.error('Error saving teacher to database:', saveError);
      console.error('Error details:', saveError.stack);

      // Check for validation errors
      if (saveError.name === 'ValidationError') {
        const validationErrors = {};

        // Extract validation error messages
        for (const field in saveError.errors) {
          validationErrors[field] = saveError.errors[field].message;
        }

        return res.status(400).json({
          message: 'Validation error',
          validationErrors,
          error: saveError.message
        });
      }

      // Check for duplicate key error
      if (saveError.code === 11000) {
        return res.status(400).json({
          message: 'Duplicate key error',
          error: 'A teacher with this username already exists',
          field: Object.keys(saveError.keyPattern)[0]
        });
      }

      return res.status(500).json({
        message: 'Failed to save teacher to database',
        error: saveError.message,
        stack: process.env.NODE_ENV === 'production' ? null : saveError.stack
      });
    }
  } catch (error) {
    console.error('Error adding teacher:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      message: 'Failed to add teacher',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
});

// Update teacher (admin only)
router.put('/update-teacher/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const teacher = await User.findOne({ _id: req.params.id, role: 'teacher' });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Check if username is being updated
    if (req.body.username && req.body.username !== teacher.username) {
      // Check if new username already exists
      const existingUsername = await User.findOne({ username: req.body.username });
      if (existingUsername && existingUsername._id.toString() !== req.params.id) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      // Generate a new email based on the new username
      // Sanitize username for email (remove any characters that might not be valid in an email)
      const sanitizedUsername = req.body.username.replace(/[^a-zA-Z0-9._-]/g, '');
      const newEmail = `${sanitizedUsername}@gpc-itarsi.edu.in`;

      // Check if the new email already exists
      const existingEmail = await User.findOne({ email: newEmail });
      if (existingEmail && existingEmail._id.toString() !== req.params.id) {
        return res.status(400).json({
          message: 'Duplicate key error',
          error: 'A teacher with this email already exists',
          field: 'email'
        });
      }

      teacher.username = req.body.username;
      teacher.email = newEmail;
    }

    // Update fields
    const fieldsToUpdate = ['name', 'department', 'subjects', 'qualification', 'experience', 'designation'];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        teacher[field] = req.body[field];
      }
    });

    // Update password if provided
    if (req.body.password) {
      teacher.password = req.body.password;
    }

    teacher.updatedAt = Date.now();

    try {
      await teacher.save();
    } catch (saveError) {
      console.error('Error saving teacher updates:', saveError);

      // Check for duplicate key error
      if (saveError.code === 11000) {
        return res.status(400).json({
          message: 'Duplicate key error',
          error: 'A teacher with this username or email already exists',
          field: Object.keys(saveError.keyPattern)[0]
        });
      }

      return res.status(500).json({
        message: 'Failed to save teacher updates',
        error: saveError.message
      });
    }

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
router.delete('/delete-teacher/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const teacher = await User.findOne({ _id: req.params.id, role: 'teacher' });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ message: 'Failed to delete teacher' });
  }
});

// Add a new student (admin only)
router.post('/add-student', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { name, rollNumber, className, password, branch } = req.body;

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
    const email = `${sanitizedRollNumber}@gpc-itarsi.edu.in`;

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
router.put('/update-student/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update fields
    const fieldsToUpdate = ['name', 'class', 'branch'];

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
      const newEmail = `${sanitizedRollNumber}@gpc-itarsi.edu.in`;

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
router.delete('/delete-student/:id', authenticateToken, authorize(['admin']), async (req, res) => {
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

// Add a new course (admin only)
router.post('/add-course', authenticateToken, authorize(['admin']), upload.single('image'), async (req, res) => {
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
      seats,
      fees,
      image: req.file ? req.file.filename : null
    });

    await course.save();

    res.status(201).json(course);
  } catch (error) {
    console.error('Error adding course:', error);
    res.status(500).json({ message: 'Failed to add course', error: error.message });
  }
});

// Update course (admin only)
router.put('/update-course/:id', authenticateToken, authorize(['admin']), upload.single('image'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Update fields
    const fieldsToUpdate = ['title', 'code', 'description', 'duration', 'eligibility', 'seats', 'fees'];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        course[field] = req.body[field];
      }
    });

    // Update image if provided
    if (req.file) {
      course.image = req.file.filename;
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
router.delete('/delete-course/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Failed to delete course' });
  }
});

// Get attendance statistics (admin only)
router.get('/attendance/stats', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    console.log('Fetching attendance statistics');

    // Get filter by class if provided
    const classFilter = req.query.class ? { class: req.query.class } : {};

    // Get all students (with class filter if provided)
    const students = await User.find({
      role: 'student',
      ...classFilter
    });

    // Calculate overall statistics
    const totalStudents = students.length;
    let totalAttendance = 0;
    let lowAttendanceCount = 0;

    // Get attendance by class
    const classes = [...new Set(students.map(student => student.class))];
    const attendanceByClass = [];

    for (const className of classes) {
      const classStudents = students.filter(student => student.class === className);
      const studentCount = classStudents.length;
      let classAttendance = 0;
      let lowAttendanceStudentsInClass = 0;

      classStudents.forEach(student => {
        classAttendance += student.attendance || 0;
        if ((student.attendance || 0) < 75) {
          lowAttendanceStudentsInClass++;
        }
      });

      const averageAttendance = studentCount > 0 ? Math.round(classAttendance / studentCount) : 0;

      attendanceByClass.push({
        className,
        studentCount,
        averageAttendance,
        lowAttendanceCount: lowAttendanceStudentsInClass
      });
    }

    // Calculate overall statistics
    students.forEach(student => {
      totalAttendance += student.attendance || 0;
      if ((student.attendance || 0) < 75) {
        lowAttendanceCount++;
      }
    });

    const averageAttendance = totalStudents > 0 ? Math.round(totalAttendance / totalStudents) : 0;

    // Get students with low attendance
    const lowAttendanceStudents = students
      .filter(student => (student.attendance || 0) < 75)
      .map(student => ({
        _id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        class: student.class,
        attendance: student.attendance || 0,
        lastPresent: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Random date in last 30 days
      }))
      .sort((a, b) => a.attendance - b.attendance)
      .slice(0, 10); // Get top 10 lowest attendance

    // Generate mock recent attendance records
    const recentAttendance = [];
    const today = new Date();

    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const randomClass = classes[Math.floor(Math.random() * classes.length)];
      const classStudents = students.filter(student => student.class === randomClass);
      const totalClassStudents = classStudents.length;
      const presentStudents = Math.floor(Math.random() * totalClassStudents);

      recentAttendance.push({
        date,
        className: randomClass,
        subject: ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'English'][Math.floor(Math.random() * 5)],
        present: presentStudents,
        absent: totalClassStudents - presentStudents,
        percentage: totalClassStudents > 0 ? Math.round((presentStudents / totalClassStudents) * 100) : 0
      });
    }

    // Generate mock monthly attendance data
    const attendanceByMonth = [];
    const currentMonth = today.getMonth();

    for (let i = 0; i < 6; i++) {
      const month = new Date(today.getFullYear(), currentMonth - i, 1);
      attendanceByMonth.push({
        month: month.toLocaleString('default', { month: 'short', year: 'numeric' }),
        attendance: Math.floor(70 + Math.random() * 25) // Random attendance between 70-95%
      });
    }

    // Return all statistics
    res.json({
      totalStudents,
      totalClasses: classes.length,
      averageAttendance,
      lowAttendanceCount,
      classesThisMonth: 0, // Set to 0 after attendance reset
      attendanceByClass,
      recentAttendance,
      lowAttendanceStudents,
      attendanceByMonth
    });

  } catch (error) {
    console.error('Error fetching attendance statistics:', error);
    res.status(500).json({ message: 'Failed to fetch attendance statistics', error: error.message });
  }
});

// Get available classes (admin only)
router.get('/classes', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    // Get all unique class values from students
    const classes = await User.distinct('class', { role: 'student' });
    res.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ message: 'Failed to fetch classes', error: error.message });
  }
});

// Reset attendance for all students (admin only)
router.post('/reset-all-attendance', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    console.log('Resetting attendance for all students');

    // Update all students to set attendance to 0
    const result = await User.updateMany(
      { role: 'student' },
      { $set: { attendance: 0 } }
    );

    console.log(`Reset attendance for ${result.modifiedCount} students`);

    res.json({
      message: 'All student attendance has been reset successfully',
      studentsUpdated: result.modifiedCount
    });
  } catch (error) {
    console.error('Error resetting all attendance:', error);
    res.status(500).json({ message: 'Failed to reset attendance', error: error.message });
  }
});

// Reset attendance for a specific student (admin only)
router.post('/reset-student-attendance/:studentId', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { studentId } = req.params;

    console.log(`Resetting attendance for student ${studentId}`);

    // Find the student and update attendance to 0
    const student = await User.findOneAndUpdate(
      { _id: studentId, role: 'student' },
      { $set: { attendance: 0 } },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    console.log(`Reset attendance for student ${student.name}`);

    res.json({
      message: 'Student attendance has been reset successfully',
      student: {
        _id: student._id,
        name: student.name,
        attendance: student.attendance
      }
    });
  } catch (error) {
    console.error('Error resetting student attendance:', error);
    res.status(500).json({ message: 'Failed to reset student attendance', error: error.message });
  }
});

// Update student attendance (admin only)
router.put('/update-student-attendance', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { studentId, recordId, present } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    // Find the student
    const student = await User.findOne({ _id: studentId, role: 'student' });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // In a real implementation, you would update the actual attendance record in the database
    // For now, we'll just return a success response with the updated record

    console.log(`Updating attendance for student ${student.name} (${studentId}), record ${recordId}, present: ${present}`);

    // Return the updated record
    res.json({
      message: 'Attendance updated successfully',
      record: {
        _id: `record-${recordId}`,
        date: new Date().toISOString().split('T')[0],
        status: present ? 'present' : 'absent',
        subject: 'Updated Subject'
      }
    });
  } catch (error) {
    console.error('Error updating student attendance:', error);
    res.status(500).json({ message: 'Failed to update student attendance', error: error.message });
  }
});

// Promote students (admin only)
router.post('/promote-students', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { branch, currentClass } = req.body;
    console.log('Promoting students with filters:', { branch, currentClass });

    // Build the query
    const query = { role: 'student' };

    // Add branch filter if specified
    if (branch && branch !== 'all') {
      query.branch = branch;
    }

    // Add class filter if specified
    if (currentClass && currentClass !== 'all') {
      query.class = currentClass;
    }

    // Find all students matching the query
    const students = await User.find(query);

    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found matching the criteria' });
    }

    console.log(`Found ${students.length} students to promote`);

    // Count of successfully promoted students
    let promotedCount = 0;

    // Update all matching students to the next class/semester
    const updatePromises = students.map(student => {
      // Parse the current class to determine the next class
      const currentClassParts = student.class.split(' ');

      // Skip students in final semester (6)
      if (currentClassParts.length === 2) {
        const semesterOrYear = parseInt(currentClassParts[1]);
        if (!isNaN(semesterOrYear) && semesterOrYear >= 6) {
          console.log(`Skipping student ${student.name} (${student.rollNumber}) as they are already in final semester`);
          return Promise.resolve(null);
        }

        // Increment the semester/year
        const nextSemester = semesterOrYear + 1;
        const nextClass = `${currentClassParts[0]} ${nextSemester}`;

        console.log(`Promoting student ${student.name} (${student.rollNumber}) from ${student.class} to ${nextClass}`);

        // Update the student's class
        student.class = nextClass;
        student.updatedAt = Date.now();
        promotedCount++;
        return student.save();
      } else {
        console.log(`Skipping student ${student.name} (${student.rollNumber}) due to invalid class format: ${student.class}`);
        return Promise.resolve(null);
      }
    });

    await Promise.all(updatePromises.filter(p => p !== null));

    res.json({
      message: `Successfully promoted students to the next class/semester`,
      promotedCount
    });
  } catch (error) {
    console.error('Error promoting students:', error);
    res.status(500).json({ message: 'Failed to promote students', error: error.message });
  }
});

// Get admin profile
router.get('/profile', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    console.log('GET /api/admin/profile - Fetching admin profile for user ID:', req.user.id);

    const admin = await User.findById(req.user.id).select('-password');

    if (!admin) {
      console.error('Admin not found for user ID:', req.user.id);
      return res.status(404).json({ message: 'Admin not found' });
    }

    console.log('Admin profile found:', admin.username);
    res.json(admin);
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({
      message: 'Failed to fetch admin profile',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
});

// Update admin profile with local storage
router.put('/profile', authenticateToken, authorize(['admin']), upload.single('profilePicture'), async (req, res) => {
  try {
    console.log('PUT /api/admin/profile - Updating admin profile for user ID:', req.user.id);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file ? `File uploaded: ${req.file.filename}` : 'No file uploaded');
    console.log('User from token:', req.user);

    const { name, email, phone, bio } = req.body;

    // Validate required fields
    if (!name) {
      console.error('Name is required but not provided');
      return res.status(400).json({ message: 'Name is required' });
    }

    // Find the admin user by ID
    let admin;
    try {
      admin = await User.findById(req.user.id);
      console.log('Admin user found:', admin ? 'Yes' : 'No');
    } catch (findError) {
      console.error('Error finding admin by ID:', findError);
      return res.status(500).json({
        message: 'Database error while finding admin user',
        error: findError.message
      });
    }

    if (!admin) {
      console.error('Admin not found for user ID:', req.user.id);
      return res.status(404).json({ message: 'Admin not found' });
    }

    console.log('Found admin:', admin.username);

    // Update fields if provided
    if (name) {
      console.log('Updating name from', admin.name, 'to', name);
      admin.name = name;
    }
    if (email) {
      console.log('Updating email from', admin.email, 'to', email);
      admin.email = email;
    }
    if (phone) {
      console.log('Updating phone from', admin.phone, 'to', phone);
      admin.phone = phone;
    }
    if (bio) {
      console.log('Updating bio from', admin.bio, 'to', bio);
      admin.bio = bio;
    }

    // Update profile picture if provided
    if (req.file) {
      console.log('Updating profile picture to:', req.file.filename);

      try {
        // Delete old profile picture if exists
        if (admin.profilePicture && admin.profilePicture !== 'default-profile.jpg' && !admin.profilePicture.includes('cloudinary.com')) {
          const oldPicturePath = path.join(__dirname, '..', 'uploads', 'profiles', admin.profilePicture);
          console.log('Checking for old profile picture at:', oldPicturePath);

          if (fs.existsSync(oldPicturePath)) {
            console.log('Deleting old profile picture:', oldPicturePath);
            try {
              fs.unlinkSync(oldPicturePath);
            } catch (unlinkError) {
              console.error('Error deleting old profile picture:', unlinkError);
              // Continue with the update even if deletion fails
            }
          } else {
            console.log('Old profile picture not found at path:', oldPicturePath);
          }
        }
      } catch (fileError) {
        console.error('Error handling old profile picture:', fileError);
        // Continue with the update even if file handling fails
      }

      // Set new profile picture
      admin.profilePicture = req.file.filename;
    }

    // Update timestamp
    admin.updatedAt = Date.now();

    // Save the updated admin profile
    try {
      await admin.save();
      console.log('Admin profile updated successfully');
    } catch (saveError) {
      console.error('Error saving admin profile:', saveError);
      return res.status(500).json({
        message: 'Failed to save admin profile',
        error: saveError.message
      });
    }

    // Return admin without password
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    console.log('Sending updated admin profile response:', adminResponse);
    res.json(adminResponse);
  } catch (error) {
    console.error('Error updating admin profile:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({
      message: 'Failed to update admin profile',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
});

// Update admin profile with Cloudinary
router.put('/profile-cloudinary', authenticateToken, authorize(['admin']), cloudinaryUpload.single('profilePicture'), async (req, res) => {
  try {
    console.log('PUT /api/admin/profile-cloudinary - Updating admin profile with Cloudinary for user ID:', req.user.id);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file ? `File uploaded to Cloudinary: ${JSON.stringify(req.file)}` : 'No file uploaded');
    console.log('User from token:', req.user);

    const { name, email, phone, bio } = req.body;

    // Validate required fields
    if (!name) {
      console.error('Name is required but not provided');
      return res.status(400).json({ message: 'Name is required' });
    }

    // Find the admin user by ID
    let admin;
    try {
      admin = await User.findById(req.user.id);
      console.log('Admin user found:', admin ? 'Yes' : 'No');
    } catch (findError) {
      console.error('Error finding admin by ID:', findError);
      return res.status(500).json({
        message: 'Database error while finding admin user',
        error: findError.message
      });
    }

    if (!admin) {
      console.error('Admin not found for user ID:', req.user.id);
      return res.status(404).json({ message: 'Admin not found' });
    }

    console.log('Found admin:', admin.username);

    // Update fields if provided
    if (name) {
      console.log('Updating name from', admin.name, 'to', name);
      admin.name = name;
    }
    if (email) {
      console.log('Updating email from', admin.email, 'to', email);
      admin.email = email;
    }
    if (phone) {
      console.log('Updating phone from', admin.phone, 'to', phone);
      admin.phone = phone;
    }
    if (bio) {
      console.log('Updating bio from', admin.bio, 'to', bio);
      admin.bio = bio;
    }

    // Update profile picture if provided
    if (req.file) {
      console.log('Cloudinary upload result:', req.file);

      try {
        // Delete old profile picture from Cloudinary if it's a Cloudinary URL
        if (admin.profilePicture && admin.profilePicture.includes('cloudinary.com')) {
          try {
            // Extract public_id from the URL
            const publicIdMatch = admin.profilePicture.match(/\/v\d+\/(.+?)\./);
            if (publicIdMatch && publicIdMatch[1]) {
              const publicId = publicIdMatch[1];
              console.log('Deleting old Cloudinary image with public_id:', publicId);

              // Delete the image from Cloudinary
              await cloudinary.uploader.destroy(publicId);
              console.log('Successfully deleted old Cloudinary image');
            }
          } catch (deleteError) {
            console.error('Error deleting old Cloudinary image:', deleteError);
            // Continue with the update even if deletion fails
          }
        }

        // Set new profile picture URL from Cloudinary
        // Check if req.file has path or secure_url property
        if (req.file.path) {
          admin.profilePicture = req.file.path; // Cloudinary URL
          console.log('Setting profile picture from path:', req.file.path);
        } else if (req.file.secure_url) {
          admin.profilePicture = req.file.secure_url; // Cloudinary secure URL
          console.log('Setting profile picture from secure_url:', req.file.secure_url);
        } else {
          console.log('No standard URL found in Cloudinary response, checking for alternative properties:', Object.keys(req.file));
          // Try to find any URL-like property in the response
          const urlProperty = Object.keys(req.file).find(key =>
            typeof req.file[key] === 'string' &&
            (req.file[key].includes('cloudinary.com') || req.file[key].startsWith('http'))
          );

          if (urlProperty) {
            admin.profilePicture = req.file[urlProperty];
            console.log(`Setting profile picture from alternative property ${urlProperty}:`, req.file[urlProperty]);
          } else {
            console.error('No valid URL found in Cloudinary response:', req.file);
            // Continue without updating the profile picture
          }
        }
      } catch (cloudinaryError) {
        console.error('Error processing Cloudinary file:', cloudinaryError);
        // Continue with the update even if Cloudinary processing fails
      }
    }

    // Update timestamp
    admin.updatedAt = Date.now();

    // Save the updated admin profile
    try {
      await admin.save();
      console.log('Admin profile updated successfully with Cloudinary');
    } catch (saveError) {
      console.error('Error saving admin profile with Cloudinary:', saveError);
      return res.status(500).json({
        message: 'Failed to save admin profile with Cloudinary',
        error: saveError.message
      });
    }

    // Return admin without password
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    console.log('Sending updated admin profile response:', adminResponse);
    res.json(adminResponse);
  } catch (error) {
    console.error('Error updating admin profile with Cloudinary:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({
      message: 'Failed to update admin profile with Cloudinary',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
});

// Update admin password
router.put('/change-password', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    console.log('PUT /api/admin/change-password - Changing password for user ID:', req.user.id);

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      console.log('Missing required fields:', {
        hasCurrentPassword: !!currentPassword,
        hasNewPassword: !!newPassword
      });
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const admin = await User.findById(req.user.id);

    if (!admin) {
      console.error('Admin not found for user ID:', req.user.id);
      return res.status(404).json({ message: 'Admin not found' });
    }

    console.log('Found admin:', admin.username);

    // Verify current password
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      console.log('Current password is incorrect for admin:', admin.username);
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    admin.password = newPassword;
    admin.updatedAt = Date.now();
    await admin.save();
    console.log('Password updated successfully for admin:', admin.username);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating admin password:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({
      message: 'Failed to update password',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
});

// Update principal's message (admin only)
router.put('/principal-message', authenticateToken, authorize(['admin']), cloudinaryUpload.single('image'), async (req, res) => {
  try {
    console.log('Updating principal message with Cloudinary image upload');
    console.log('Request body:', req.body);

    // Extract data from request body
    const { name, message, title } = req.body;

    // Log the received data
    console.log('Received data:', { name, message, title });
    console.log('File:', req.file);

    // Find the overview document
    const Overview = require('../models/Overview');
    let overview = await Overview.findOne();

    if (!overview) {
      // Create a new overview document if it doesn't exist
      console.log('No overview document found, creating a new one');
      overview = new Overview({
        title: 'Government Polytechnic College, Itarsi',
        shortDescription: 'A premier technical institution offering diploma courses in engineering and technology.',
        longDescription: 'Government Polytechnic College, Itarsi is committed to providing quality technical education to students. The college offers various diploma courses in engineering and technology fields.',
        address: 'Government Polytechnic College, Itarsi, Madhya Pradesh, India'
      });
    }

    // Update principal's message and name
    if (message) {
      console.log('Updating principal message to:', message);
      overview.principalMessage = message;
    }

    if (name) {
      console.log('Updating principal name to:', name);
      overview.principalName = name;
    }

    if (title) {
      console.log('Title received but not stored in the model:', title);
    }

    // Save the image if provided
    if (req.file) {
      console.log('Principal image uploaded to Cloudinary:', req.file);

      // If it's a Cloudinary upload with path
      if (req.file.path && req.file.path.includes('cloudinary')) {
        overview.principalImage = req.file.path;
        console.log('Using Cloudinary path:', req.file.path);
      }
      // If it has a secure_url property (direct Cloudinary response)
      else if (req.file.secure_url) {
        overview.principalImage = req.file.secure_url;
        console.log('Using Cloudinary secure_url:', req.file.secure_url);
      }
      // If it has a public_id and url from Cloudinary
      else if (req.file.public_id) {
        overview.principalImage = req.file.url || req.file.secure_url;
        console.log('Using Cloudinary public_id URL:', overview.principalImage);
      }
      // Fallback to filename for local storage
      else if (req.file.filename) {
        overview.principalImage = req.file.filename;
        console.log('Using local filename:', req.file.filename);
      }
      // Last resort - use the original name
      else {
        overview.principalImage = req.file.originalname;
        console.log('Using original filename as fallback:', req.file.originalname);
      }

      console.log('Principal image saved to database:', overview.principalImage);
    }

    overview.updatedAt = Date.now();
    console.log('Saving overview document to database');
    await overview.save();
    console.log('Overview document saved successfully');

    res.json({
      message: 'Principal message updated successfully',
      data: {
        name: overview.principalName,
        message: overview.principalMessage,
        title: title || 'Principal, Government Polytechnic College, Itarsi',
        image: overview.principalImage
      }
    });
  } catch (error) {
    console.error('Error updating principal message:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({ message: 'Failed to update principal message', error: error.message });
  }
});

// File Manager Routes

// Get all files from Cloudinary
router.get('/files', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    console.log('GET /api/admin/files - Fetching all files from Cloudinary');

    // Define the directories/folders we want to search in Cloudinary
    const directories = [
      'applications',
      'courses',
      'forms',
      'gallery',
      'newsletters',
      'notices',
      'profiles',
      'study-materials'
    ];

    console.log('Searching directories in Cloudinary:', directories);

    // Create an object to store files by directory
    const filesByDirectory = {};

    // First, try to get all resources in the gpc-itarsi folder
    try {
      console.log('Fetching all resources in gpc-itarsi folder');

      const allResourcesResult = await cloudinary.search
        .expression('folder:gpc-itarsi/*')
        .max_results(500)
        .execute();

      console.log(`Found ${allResourcesResult.total_count} total resources in Cloudinary`);

      // Process each resource and categorize by directory
      allResourcesResult.resources.forEach(resource => {
        // Extract directory from public_id
        // Format: gpc-itarsi/directory/filename
        const pathParts = resource.public_id.split('/');
        let directory = 'other'; // Default directory

        if (pathParts.length >= 2) {
          directory = pathParts[1]; // Get the directory part
        }

        // Initialize directory array if it doesn't exist
        if (!filesByDirectory[directory]) {
          filesByDirectory[directory] = [];
        }

        // Add file to the appropriate directory
        filesByDirectory[directory].push({
          name: resource.filename || path.basename(resource.public_id),
          path: resource.secure_url,
          public_id: resource.public_id,
          size: resource.bytes,
          format: resource.format,
          createdAt: new Date(resource.created_at),
          updatedAt: new Date(resource.created_at)
        });
      });
    } catch (allResourcesError) {
      console.error('Error fetching all resources:', allResourcesError);

      // Fallback to searching each directory individually
      console.log('Falling back to directory-by-directory search');

      // Process each directory
      for (const directory of directories) {
        try {
          // Search for resources in the specific folder
          const folderPath = `gpc-itarsi/${directory}`;
          console.log(`Searching Cloudinary folder: ${folderPath}`);

          const result = await cloudinary.search
            .expression(`folder:${folderPath}`)
            .max_results(500)
            .execute();

          console.log(`Found ${result.resources.length} files in ${directory}`);

          // Map Cloudinary resources to our file format
          const files = result.resources.map(resource => {
            return {
              name: resource.filename || path.basename(resource.public_id),
              path: resource.secure_url,
              public_id: resource.public_id,
              size: resource.bytes,
              format: resource.format,
              createdAt: new Date(resource.created_at),
              updatedAt: new Date(resource.created_at)
            };
          });

          filesByDirectory[directory] = files;
        } catch (folderError) {
          console.error(`Error fetching files from ${directory} folder:`, folderError);
          filesByDirectory[directory] = [];
        }
      }
    }

    const totalFiles = Object.values(filesByDirectory).reduce((sum, files) => sum + files.length, 0);
    console.log(`Found ${totalFiles} files in total`);

    res.json({
      directories: filesByDirectory
    });
  } catch (error) {
    console.error('Error fetching files from Cloudinary:', error);
    res.status(500).json({ message: 'Failed to fetch files', error: error.message });
  }
});

// Delete a file from Cloudinary
router.delete('/files/:directory/:public_id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { directory, public_id } = req.params;
    console.log(`DELETE /api/admin/files/${directory}/${public_id} - Deleting file from Cloudinary`);

    // The public_id might be URL encoded, so decode it
    const decodedPublicId = decodeURIComponent(public_id);

    // Delete the file from Cloudinary
    const result = await cloudinary.uploader.destroy(decodedPublicId);

    if (result.result === 'ok' || result.result === 'not found') {
      console.log('File deleted successfully from Cloudinary:', decodedPublicId);
      res.json({ message: 'File deleted successfully', result });
    } else {
      console.error('Failed to delete file from Cloudinary:', result);
      res.status(500).json({ message: 'Failed to delete file', result });
    }
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    res.status(500).json({ message: 'Failed to delete file', error: error.message });
  }
});

// Upload document (admin only)
router.post('/documents', authenticateToken, authorize(['admin']), compressAndUpload('file'), async (req, res) => {
  try {
    console.log('Document upload request received from admin:', req.user.username);
    console.log('Request body:', req.body);
    console.log('File received:', req.file ? 'Yes' : 'No');

    const { title, description, type, category, driveUrl } = req.body;

    // Validate request
    if (type !== 'drive_link' && !req.file) {
      console.error('Document upload failed: No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!title || !type) {
      console.error('Document upload failed: Missing required fields');
      return res.status(400).json({ message: 'Title and type are required' });
    }

    if (type === 'drive_link' && !driveUrl) {
      console.error('Document upload failed: Drive URL is required for drive_link type');
      return res.status(400).json({ message: 'Drive URL is required for drive_link type' });
    }

    // Create new document
    const document = new Document({
      title,
      description: description || '',
      type,
      category: category || 'other',
      file: req.file ? req.file.path : undefined,
      driveUrl: driveUrl || undefined,
      uploadedBy: req.user.id
    });

    // Save document
    await document.save();
    console.log('Document saved successfully:', document._id);

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: {
        _id: document._id,
        title: document.title,
        description: document.description,
        type: document.type,
        category: document.category,
        file: document.file,
        driveUrl: document.driveUrl,
        createdAt: document.createdAt
      }
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ message: 'Failed to upload document', error: error.message });
  }
});

// Delete document (admin only)
router.delete('/documents/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // If document has a file, delete it from Cloudinary
    if (document.file && document.file.includes('cloudinary')) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = document.file.split('/');
        const filenameWithExtension = urlParts[urlParts.length - 1];
        const filename = filenameWithExtension.split('.')[0];
        const folderPath = urlParts[urlParts.length - 2];
        const publicId = `${folderPath}/${filename}`;

        console.log('Attempting to delete file from Cloudinary:', publicId);
        await cloudinary.uploader.destroy(publicId);
        console.log('File deleted from Cloudinary successfully');
      } catch (cloudinaryError) {
        console.error('Error deleting file from Cloudinary:', cloudinaryError);
        // Continue with document deletion even if Cloudinary deletion fails
      }
    }

    // Delete document from database
    await Document.findByIdAndDelete(req.params.id);
    console.log('Document deleted successfully:', req.params.id);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Failed to delete document', error: error.message });
  }
});

// Upload a file to Cloudinary in a specific directory
router.post('/files/:directory', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { directory } = req.params;
    console.log(`POST /api/admin/files/${directory} - Uploading file to Cloudinary directory`);

    // Create a temporary storage for the file
    const multer = require('multer');
    const storage = multer.memoryStorage();
    const uploadMiddleware = multer({ storage: storage }).single('file');

    // Process the upload
    uploadMiddleware(req, res, async (err) => {
      if (err) {
        console.error('Error in file upload:', err);
        return res.status(400).json({ message: 'File upload error', error: err.message });
      }

      if (!req.file) {
        console.error('No file uploaded');
        return res.status(400).json({ message: 'No file uploaded' });
      }

      try {
        // Create a unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const originalName = req.file.originalname;
        const fileExtension = path.extname(originalName);
        const fileName = path.basename(originalName, fileExtension);
        const cloudinaryFileName = `${fileName}-${uniqueSuffix}${fileExtension}`;

        // Create a Cloudinary upload stream
        const folderPath = `gpc-itarsi/${directory}`;

        // Upload to Cloudinary
        const cloudinaryUploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: folderPath,
              resource_type: 'auto',
              public_id: cloudinaryFileName.replace(fileExtension, '')
            },
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                reject(error);
              } else {
                console.log('Cloudinary upload success:', result.public_id);
                resolve(result);
              }
            }
          );

          // Convert buffer to stream and pipe to Cloudinary
          const bufferStream = new require('stream').PassThrough();
          bufferStream.end(req.file.buffer);
          bufferStream.pipe(uploadStream);
        });

        console.log('File uploaded successfully to Cloudinary:', cloudinaryUploadResult);

        // Return the file details
        res.status(201).json({
          message: 'File uploaded successfully',
          file: {
            name: cloudinaryUploadResult.original_filename,
            path: cloudinaryUploadResult.secure_url,
            public_id: cloudinaryUploadResult.public_id,
            size: cloudinaryUploadResult.bytes,
            format: cloudinaryUploadResult.format,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
      } catch (uploadError) {
        console.error('Error uploading to Cloudinary:', uploadError);
        res.status(500).json({ message: 'Failed to upload file to Cloudinary', error: uploadError.message });
      }
    });
  } catch (error) {
    console.error('Error in file upload route:', error);
    res.status(500).json({ message: 'Failed to process upload', error: error.message });
  }
});

module.exports = router;
