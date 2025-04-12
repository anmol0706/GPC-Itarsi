const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const dataService = require('./services/dataService');

// Initialize Express app
const app = express();

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({ message: 'Server is running correctly' });
});

// Environment variables
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors({
  origin: '*', // Allow all origins temporarily to debug the issue
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use('/uploads', (req, res, next) => {
  // Clean up the URL to handle potential issues
  const cleanUrl = req.url.replace(/\/{2,}/g, '/').trim();
  const filePath = path.join(__dirname, 'uploads', cleanUrl);

  console.log(`Requested file: ${filePath}`);

  if (fs.existsSync(filePath)) {
    console.log(`File exists: ${filePath}`);

    // Set appropriate content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      // Set Content-Disposition header for download for documents
      const filename = path.basename(filePath);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    } else if (ext === '.doc' || ext === '.docx') {
      res.setHeader('Content-Type', 'application/msword');
      // Set Content-Disposition header for download for documents
      const filename = path.basename(filePath);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    } else if (ext === '.xls' || ext === '.xlsx') {
      res.setHeader('Content-Type', 'application/vnd.ms-excel');
      // Set Content-Disposition header for download for documents
      const filename = path.basename(filePath);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    } else if (ext === '.ppt' || ext === '.pptx') {
      res.setHeader('Content-Type', 'application/vnd.ms-powerpoint');
      // Set Content-Disposition header for download for documents
      const filename = path.basename(filePath);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    } else if (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.gif') {
      // For images, set the appropriate content type but don't force download
      if (ext === '.jpg' || ext === '.jpeg') {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (ext === '.png') {
        res.setHeader('Content-Type', 'image/png');
      } else if (ext === '.gif') {
        res.setHeader('Content-Type', 'image/gif');
      }
      // Don't set Content-Disposition for images so they display in the browser
    } else {
      // For other file types, set a generic content type and force download
      const filename = path.basename(filePath);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    }

    next(); // File exists, continue to static middleware
  } else {
    console.log(`File not found: ${filePath}`);
    // For study materials, serve a default PDF if the file doesn't exist
    if (cleanUrl.includes('study-materials')) {
      const defaultPdfPath = path.join(__dirname, 'uploads', 'study-materials', 'default.pdf');
      if (!fs.existsSync(defaultPdfPath)) {
        // Create a default PDF if it doesn't exist
        const defaultPdfContent = `%PDF-1.4
1 0 obj
<</Type /Catalog /Pages 2 0 R>>
endobj
2 0 obj
<</Type /Pages /Kids [3 0 R] /Count 1>>
endobj
3 0 obj
<</Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 500 800] /Contents 6 0 R>>
endobj
4 0 obj
<</Font <</F1 5 0 R>>>>
endobj
5 0 obj
<</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>
endobj
6 0 obj
<</Length 44>>
stream
BT /F1 24 Tf 100 700 Td (File Not Available) Tj ET
endstream
endobj
xref
0 7
0000000000 65535 f
0000000009 00000 n
0000000056 00000 n
0000000111 00000 n
0000000212 00000 n
0000000250 00000 n
0000000317 00000 n
trailer
<</Size 7/Root 1 0 R>>
startxref
406
%%EOF`;
        fs.writeFileSync(defaultPdfPath, defaultPdfContent);
      }
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="file-not-available.pdf"');
      res.sendFile(defaultPdfPath);
    } else {
      res.status(404).send('File not found');
    }
  }
}, express.static(path.join(__dirname, 'uploads')));

// Special endpoint for study materials to handle file downloads properly
app.get('/api/download/study-material/:fileId', (req, res) => {
  try {
    const fileId = req.params.fileId;
    console.log(`Download request for study material: ${fileId}`);

    // Get the study material from the database
    const material = dataService.getStudyMaterialById(fileId);

    if (!material || !material.fileUrl) {
      console.log(`Study material not found or has no file: ${fileId}`);
      return res.status(404).json({ message: 'Study material not found' });
    }

    // Construct the file path
    const filePath = path.join(__dirname, 'uploads', 'study-materials', material.fileUrl);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.log(`File not found for study material: ${fileId} at path: ${filePath}`);

      // Serve a default PDF if the file doesn't exist
      const defaultPdfPath = path.join(__dirname, 'uploads', 'study-materials', 'default.pdf');
      if (!fs.existsSync(defaultPdfPath)) {
        // Create a default PDF if it doesn't exist
        const defaultPdfContent = `%PDF-1.4
1 0 obj
<</Type /Catalog /Pages 2 0 R>>
endobj
2 0 obj
<</Type /Pages /Kids [3 0 R] /Count 1>>
endobj
3 0 obj
<</Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 500 800] /Contents 6 0 R>>
endobj
4 0 obj
<</Font <</F1 5 0 R>>>>
endobj
5 0 obj
<</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>
endobj
6 0 obj
<</Length 44>>
stream
BT /F1 24 Tf 100 700 Td (File Not Available) Tj ET
endstream
endobj
xref
0 7
0000000000 65535 f
0000000009 00000 n
0000000056 00000 n
0000000111 00000 n
0000000212 00000 n
0000000250 00000 n
0000000317 00000 n
trailer
<</Size 7/Root 1 0 R>>
startxref
406
%%EOF`;
        fs.writeFileSync(defaultPdfPath, defaultPdfContent);
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${material.title || 'file-not-available'}.pdf"`);
      return res.sendFile(defaultPdfPath);
    }

    // Set appropriate content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.pdf') {
      res.setHeader('Content-Type', 'application/pdf');
    } else if (ext === '.doc' || ext === '.docx') {
      res.setHeader('Content-Type', 'application/msword');
    } else if (ext === '.xls' || ext === '.xlsx') {
      res.setHeader('Content-Type', 'application/vnd.ms-excel');
    } else if (ext === '.ppt' || ext === '.pptx') {
      res.setHeader('Content-Type', 'application/vnd.ms-powerpoint');
    }

    // Set Content-Disposition header for download
    const sanitizedTitle = material.title ? material.title.replace(/[^a-zA-Z0-9]/g, '_') : 'download';
    const filename = `${sanitizedTitle}${ext}`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error downloading study material:', error);
    res.status(500).json({ message: 'Failed to download study material' });
  }
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create directories for forms, applications, and newsletters if they don't exist
const formsDir = path.join(__dirname, 'uploads/forms');
const applicationsDir = path.join(__dirname, 'uploads/applications');
const newslettersDir = path.join(__dirname, 'uploads/newsletters');

if (!fs.existsSync(formsDir)) {
  fs.mkdirSync(formsDir, { recursive: true });
}

if (!fs.existsSync(applicationsDir)) {
  fs.mkdirSync(applicationsDir, { recursive: true });
}

if (!fs.existsSync(newslettersDir)) {
  fs.mkdirSync(newslettersDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine the destination folder based on the route
    let destFolder = uploadsDir;
    if (req.originalUrl.includes('/courses')) {
      destFolder = path.join(__dirname, 'uploads/courses');
    } else if (req.originalUrl.includes('/gallery')) {
      destFolder = path.join(__dirname, 'uploads/gallery');
    } else if (req.originalUrl.includes('/notices')) {
      destFolder = path.join(__dirname, 'uploads/notices');
    } else if (req.originalUrl.includes('/study-material') || req.originalUrl.includes('/upload-study-material')) {
      destFolder = path.join(__dirname, 'uploads/study-materials');
    } else if (req.originalUrl.includes('/forms')) {
      destFolder = path.join(__dirname, 'uploads/forms');
    } else if (req.originalUrl.includes('/applications')) {
      destFolder = path.join(__dirname, 'uploads/applications');
    } else if (req.originalUrl.includes('/newsletters')) {
      destFolder = path.join(__dirname, 'uploads/newsletters');
    }

    // Ensure the directory exists
    if (!fs.existsSync(destFolder)) {
      fs.mkdirSync(destFolder, { recursive: true });
    }

    cb(null, destFolder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

// Configure multer for profile picture uploads
const profilesDir = path.join(__dirname, 'uploads/profiles');
if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir, { recursive: true });
}

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profilesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

const profileUpload = multer({ storage: profileStorage });

// Authentication middleware
const authenticateToken = (req, res, next) => {
  console.log('Authentication check for path:', req.path);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('No token provided for path:', req.path);
    return res.status(401).json({ message: 'Authentication token required' });
  }
  console.log('Token found for path:', req.path);

  // For mock tokens (format: 'mock-jwt-token-{userId}')
  if (token.startsWith('mock-jwt-token-')) {
    const userId = token.split('-').pop();
    const user = dataService.getUserById(userId);

    if (!user) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    req.user = {
      id: user._id,
      username: user._id.startsWith('teacher_') ? user.name.toLowerCase() :
                user._id.startsWith('student_') ? user.rollNumber : 'admin',
      role: user._id.startsWith('teacher_') ? 'teacher' :
            user._id.startsWith('student_') ? 'student' : 'admin',
      name: user.name,
      department: user.department,
      subjects: user.subjects,
      rollNumber: user.rollNumber,
      class: user.class
    };
    next();
    return;
  }

  // For real JWT tokens
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get the full user data based on the ID in the token
    if (decoded && decoded.id) {
      const user = dataService.getUserById(decoded.id);
      if (!user) {
        return res.status(403).json({ message: 'User not found for token' });
      }

      req.user = {
        id: user._id,
        username: decoded.username,
        role: decoded.role,
        name: user.name,
        department: user.department,
        subjects: user.subjects,
        rollNumber: user.rollNumber,
        class: user.class
      };
    } else {
      req.user = decoded;
    }

    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Role-based authorization middleware
const authorize = (roles) => {
  return (req, res, next) => {
    console.log('Authorization check - User role:', req.user.role, 'Required roles:', roles);
    if (!roles.includes(req.user.role)) {
      console.log('Access denied for user:', req.user.username, 'with role:', req.user.role);
      return res.status(403).json({ message: 'Access denied' });
    }
    console.log('Access granted for user:', req.user.username, 'with role:', req.user.role);
    next();
  };
};

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', { username, password });

  const user = dataService.getUserByUsername(username);
  console.log('User found:', user ? 'Yes' : 'No');

  if (!user || user.password !== password) {
    console.log('Login failed: Invalid credentials');
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  console.log('Login successful for user:', username);

  // Create a user object without the password
  const userWithoutPassword = { ...user };
  delete userWithoutPassword.password;

  // With our updated dataService, user data is already complete
  // No need to look up additional data as it's already included
  let userData = null;

  if (user.role === 'student') {
    console.log('Student data found: Yes');
    // No need to look up additional data
    userData = {
      _id: user._id,
      name: user.name,
      rollNumber: user.rollNumber,
      class: user.class,
      attendance: user.attendance || []
    };
  } else if (user.role === 'teacher') {
    console.log('Teacher data found: Yes');
    console.log('Teacher data:', { name: user.name, id: user._id });
    // No need to look up additional data
    userData = {
      _id: user._id,
      name: user.name,
      department: user.department,
      subjects: user.subjects || []
    };
  }

  // Generate JWT token or use mock token for development
  let token;
  try {
    token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
        // Include minimal user info in the token
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  } catch (error) {
    console.error('Error generating JWT token:', error);
    // Fallback to mock token for development
    token = `mock-jwt-token-${user._id}`;
  }

  res.json({
    token,
    user: userWithoutPassword,
    userData: userData
  });

  console.log('Login response sent:', { token: token.substring(0, 20) + '...', user: { ...userWithoutPassword, password: undefined } });
});

app.post('/api/auth/change-password', authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  // Validate input
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required' });
  }

  // Get the current user
  const user = dataService.getUserById(userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Verify current password
  if (user.password !== currentPassword) {
    return res.status(401).json({ message: 'Current password is incorrect' });
  }

  // Update password
  const updatedUser = dataService.updateUser(userId, { password: newPassword });

  if (!updatedUser) {
    return res.status(500).json({ message: 'Failed to update password' });
  }

  res.json({ message: 'Password updated successfully' });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = dataService.getUserById(req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Return user without password
  const userWithoutPassword = { ...user };
  delete userWithoutPassword.password;

  // Get additional user data based on role
  let userData = null;
  if (user.role === 'student') {
    // Find student by name and roll number
    const students = dataService.getStudents();
    userData = students.find(s => s.rollNumber === user.rollNumber);
    console.log('Student data found:', userData ? 'Yes' : 'No');
  } else if (user.role === 'teacher') {
    // Find teacher by name and department
    const teachers = dataService.getTeachers();
    console.log('Total teachers in database:', teachers.length);

    // First try to find by exact match on name and department
    userData = teachers.find(t => t.name === user.name && t.department === user.department);

    // If not found, try to find just by name
    if (!userData) {
      console.log('Teacher not found by name and department, trying just name');
      userData = teachers.find(t => t.name === user.name);
    }

    // If still not found, try to find by username (in case name is different)
    if (!userData && user.username) {
      console.log('Teacher not found by name, trying username:', user.username);
      // This is a fallback in case the teacher's name in users.json doesn't match teachers.json
      // We'll check if any teacher has a similar name to the username
      const username = user.username.toLowerCase();
      userData = teachers.find(t =>
        t.name.toLowerCase().includes(username) ||
        (username.includes(t.name.toLowerCase()))
      );
    }

    // If still not found, create a new teacher entry
    if (!userData) {
      console.log('Creating new teacher entry for:', user.name);
      const newTeacher = {
        name: user.name,
        department: user.department || 'General',
        subjects: user.subjects || []
      };

      const addedTeacher = dataService.addTeacher(newTeacher);
      if (addedTeacher) {
        userData = addedTeacher;
        console.log('Successfully created teacher profile with ID:', addedTeacher._id);
      } else {
        console.error('Failed to create teacher profile');
      }
    }

    console.log('Teacher data found:', userData ? 'Yes' : 'No');
    if (userData) {
      console.log('Teacher data:', { name: userData.name, id: userData._id });
    }
  }

  res.json({
    user: userWithoutPassword,
    userData: userData
  });
});

// Student routes
app.get('/api/students', authenticateToken, (req, res) => {
  const students = dataService.getStudents();
  res.json(students);
});

app.get('/api/students/profile', authenticateToken, authorize(['student']), (req, res) => {
  const user = dataService.getUserById(req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Get student data from students.json
  const students = dataService.getStudents();
  const studentData = students.find(s => s.rollNumber === user.rollNumber);

  if (!studentData) {
    return res.status(404).json({ message: 'Student not found' });
  }

  res.json(studentData);
});

// Student Attendance API
app.get('/api/students/attendance', authenticateToken, authorize(['student']), (req, res) => {
  try {
    const user = dataService.getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get student data
    const students = dataService.getStudents();
    const student = students.find(s => s.rollNumber === user.rollNumber);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    console.log('Looking for attendance records for student:', student.name, 'with ID:', student._id, 'and roll number:', student.rollNumber);

    // Get all attendance records
    const allAttendanceRecords = dataService.getAttendance();

    // Find attendance records by student ID
    let studentAttendance = allAttendanceRecords.find(record => record.studentId === student._id);

    // If not found by ID, try to find by roll number (case insensitive)
    if (!studentAttendance) {
      console.log('No attendance records found by student ID, trying roll number...');
      studentAttendance = allAttendanceRecords.find(record =>
        record.rollNumber && record.rollNumber.toLowerCase() === student.rollNumber.toLowerCase()
      );
    }

    // If still not found, try to find by any ID that might contain the student's ID
    if (!studentAttendance) {
      console.log('No attendance records found by roll number, trying partial ID match...');
      studentAttendance = allAttendanceRecords.find(record =>
        record.studentId && (record.studentId.includes(student._id) || student._id.includes(record.studentId))
      );
    }

    console.log('Found attendance records:', studentAttendance ? 'Yes' : 'No');

    let attendanceData = {
      studentId: student._id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      class: student.class,
      attendance: []
    };

    if (studentAttendance) {
      // Convert records to the format expected by the frontend
      const records = studentAttendance.records || [];
      const formattedRecords = records.map(record => ({
        date: record.date,
        subject: record.subject,
        present: record.status === 'present'
      }));

      attendanceData.attendance = formattedRecords;

      // Calculate attendance summary
      const totalClasses = formattedRecords.length;
      const presentClasses = formattedRecords.filter(r => r.present).length;
      const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

      attendanceData.totalClasses = totalClasses;
      attendanceData.presentClasses = presentClasses;
      attendanceData.attendancePercentage = attendancePercentage;
    } else {
      // Set default values for summary
      attendanceData.totalClasses = 0;
      attendanceData.presentClasses = 0;
      attendanceData.attendancePercentage = 0;
    }

    res.json(attendanceData);
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    res.status(500).json({ message: 'Failed to load attendance records' });
  }
});

app.get('/api/students/:id', authenticateToken, (req, res) => {
  const student = dataService.getStudentById(req.params.id);

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  res.json(student);
});

// Profile picture upload for students
app.put('/api/students/update-profile-picture', authenticateToken, authorize(['student']), profileUpload.single('profilePicture'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const userId = req.user.id;
  const user = dataService.getUserById(userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Delete old profile picture if exists
  if (user.profilePicture) {
    const oldImagePath = path.join(profilesDir, user.profilePicture);
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
  }

  // Update user with new profile picture
  const updatedUser = dataService.updateUser(userId, {
    profilePicture: req.file.filename
  });

  if (!updatedUser) {
    return res.status(500).json({ message: 'Failed to update profile picture' });
  }

  res.json({
    message: 'Profile picture updated successfully',
    profilePicture: req.file.filename
  });
});

// Teacher routes
app.get('/api/teachers', authenticateToken, (req, res) => {
  const teachers = dataService.getTeachers();
  res.json(teachers);
});

// Public endpoint for faculty information
app.get('/api/faculty', (req, res) => {
  try {
    const teachers = dataService.getTeachers();

    // Map teachers to include only necessary fields for public display
    const faculty = teachers.map(teacher => ({
      _id: teacher._id,
      name: teacher.name,
      department: teacher.department,
      subjects: teacher.subjects,
      profilePicture: teacher.profilePicture,
      designation: teacher.designation || `Faculty, ${teacher.department}`,
      qualification: teacher.qualification || 'M.Tech',
      experience: teacher.experience || '5+ years'
    }));

    res.json(faculty);
  } catch (error) {
    console.error('Error fetching faculty data:', error);
    res.status(500).json({ message: 'Failed to load faculty information' });
  }
});

app.get('/api/teachers/profile', authenticateToken, authorize(['teacher']), (req, res) => {
  try {
    console.log('Teacher profile request for user ID:', req.user.id);
    const user = dataService.getUserById(req.user.id);

    if (!user) {
      console.log('User not found for ID:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Found user:', user.name, 'with role:', user.role);

    // Get teacher data from teachers.json
    const teachers = dataService.getTeachers();
    console.log('Total teachers in database:', teachers.length);

    // First try to find by exact match on name and department
    let teacherData = teachers.find(t => t.name === user.name && t.department === user.department);

    // If not found, try to find just by name
    if (!teacherData) {
      console.log('Teacher not found by name and department, trying just name');
      teacherData = teachers.find(t => t.name === user.name);
    }

    // If still not found, try to find by username (in case name is different)
    if (!teacherData && user.username) {
      console.log('Teacher not found by name, trying username:', user.username);
      // This is a fallback in case the teacher's name in users.json doesn't match teachers.json
      // We'll check if any teacher has a similar name to the username
      const username = user.username.toLowerCase();
      teacherData = teachers.find(t =>
        t.name.toLowerCase().includes(username) ||
        (username.includes(t.name.toLowerCase()))
      );
    }

    // If still not found, create a new teacher entry
    if (!teacherData) {
      console.log('Creating new teacher entry for:', user.name);
      const newTeacher = {
        name: user.name,
        department: user.department || 'General',
        subjects: user.subjects || []
      };

      const addedTeacher = dataService.addTeacher(newTeacher);
      if (addedTeacher) {
        teacherData = addedTeacher;
        console.log('Successfully created teacher profile with ID:', addedTeacher._id);
      } else {
        console.error('Failed to create teacher profile');
        return res.status(500).json({ message: 'Failed to create teacher profile' });
      }
    }

    console.log('Returning teacher data for:', teacherData.name);
    res.json(teacherData);
  } catch (error) {
    console.error('Error in teacher profile endpoint:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

app.get('/api/teachers/:id', authenticateToken, (req, res) => {
  const teacher = dataService.getTeacherById(req.params.id);

  if (!teacher) {
    return res.status(404).json({ message: 'Teacher not found' });
  }

  res.json(teacher);
});

// Mark attendance endpoint for teachers
app.post('/api/teachers/mark-attendance', authenticateToken, authorize(['teacher']), (req, res) => {
  try {
    const { studentId, subject, present, date } = req.body;

    // Find student
    const student = dataService.getStudentById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    console.log('Marking attendance for student:', student.name, 'with ID:', student._id, 'and roll number:', student.rollNumber);

    // Find teacher
    const user = dataService.getUserById(req.user.id);
    const teachers = dataService.getTeachers();
    const teacher = teachers.find(t => t.name === user.name && t.department === user.department);

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Get all attendance records
    const allAttendanceRecords = dataService.getAttendance();

    // Find attendance records by student ID
    let studentAttendance = allAttendanceRecords.find(record => record.studentId === student._id);

    // If not found by ID, try to find by roll number (case insensitive)
    if (!studentAttendance) {
      console.log('No existing attendance records found by student ID, trying roll number...');
      studentAttendance = allAttendanceRecords.find(record =>
        record.rollNumber && record.rollNumber.toLowerCase() === student.rollNumber.toLowerCase()
      );
    }

    // Format the date consistently
    const formattedDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    // Create the attendance record with consistent property names
    const attendanceRecord = {
      date: formattedDate,
      status: present ? 'present' : 'absent',
      subject: subject
    };

    if (!studentAttendance) {
      // Create new attendance record
      const newAttendanceRecord = {
        studentId: student._id, // Always use the student._id from students.json
        studentName: student.name,
        rollNumber: student.rollNumber,
        class: student.class,
        records: [attendanceRecord]
      };

      console.log('Creating new attendance record for student:', student.name);
      dataService.addAttendanceRecord(newAttendanceRecord);
    } else {
      // Add new attendance record to existing student
      const updatedRecord = {
        ...studentAttendance,
        // Update the studentId to ensure it matches the one in students.json
        studentId: student._id,
        records: [
          ...studentAttendance.records,
          attendanceRecord
        ]
      };

      console.log('Updating existing attendance record for student:', student.name);
      dataService.addAttendanceRecord(updatedRecord);
    }

    res.json({ message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Failed to mark attendance' });
  }
});

// Profile picture upload for teachers
app.put('/api/teachers/update-profile-picture', authenticateToken, authorize(['teacher']), profileUpload.single('profilePicture'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const userId = req.user.id;
  const user = dataService.getUserById(userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Delete old profile picture if exists
  if (user.profilePicture) {
    const oldImagePath = path.join(profilesDir, user.profilePicture);
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
  }

  // Update user with new profile picture
  const updatedUser = dataService.updateUser(userId, {
    profilePicture: req.file.filename
  });

  if (!updatedUser) {
    return res.status(500).json({ message: 'Failed to update profile picture' });
  }

  res.json({
    message: 'Profile picture updated successfully',
    profilePicture: req.file.filename
  });
});

// Notice routes
app.get('/api/notices', (req, res) => {
  const notices = dataService.getNotices();
  res.json(notices);
});

app.get('/api/notices/:id', (req, res) => {
  const notice = dataService.getNoticeById(req.params.id);

  if (!notice) {
    return res.status(404).json({ message: 'Notice not found' });
  }

  res.json(notice);
});

app.post('/api/notices', authenticateToken, authorize(['admin']), (req, res) => {
  const { title, content, important } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  const newNotice = dataService.addNotice({
    title,
    content,
    important: important || false
  });

  if (!newNotice) {
    return res.status(500).json({ message: 'Failed to add notice' });
  }

  res.status(201).json(newNotice);
});

app.put('/api/notices/:id', authenticateToken, authorize(['admin']), (req, res) => {
  const { title, content, important } = req.body;

  if (!title && !content && important === undefined) {
    return res.status(400).json({ message: 'At least one field is required' });
  }

  const updatedNotice = dataService.updateNotice(req.params.id, {
    ...(title && { title }),
    ...(content && { content }),
    ...(important !== undefined && { important })
  });

  if (!updatedNotice) {
    return res.status(404).json({ message: 'Notice not found' });
  }

  res.json(updatedNotice);
});

app.delete('/api/notices/:id', authenticateToken, authorize(['admin']), (req, res) => {
  const success = dataService.deleteNotice(req.params.id);

  if (!success) {
    return res.status(404).json({ message: 'Notice not found' });
  }

  res.json({ message: 'Notice deleted successfully' });
});

// Gallery routes
app.get('/api/gallery', (req, res) => {
  const gallery = dataService.getGallery();
  res.json(gallery);
});

// Courses routes
app.get('/api/courses', (req, res) => {
  try {
    const courses = dataService.getCourses();
    res.json(courses);
  } catch (error) {
    console.error('Error reading courses:', error);
    res.status(500).json({ message: 'Failed to load courses' });
  }
});

app.get('/api/courses/:id', (req, res) => {
  try {
    const course = dataService.getCourseById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error('Error reading course:', error);
    res.status(500).json({ message: 'Failed to load course' });
  }
});

// Overview routes
app.get('/api/overview', (req, res) => {
  try {
    const overview = dataService.getOverview();
    res.json(overview[0]); // Return the first overview object
  } catch (error) {
    console.error('Error reading overview:', error);
    res.status(500).json({ message: 'Failed to load overview data' });
  }
});

// Update overview data (admin only)
app.put('/api/admin/update-overview', authenticateToken, authorize(['admin']), profileUpload.single('principalImage'), (req, res) => {
  try {
    const {
      title,
      content,
      mission,
      vision,
      principalName,
      principalDesignation,
      principalMessage,
      stats
    } = req.body;

    // Prepare update data
    const updateData = {
      ...(title && { title }),
      ...(content && { content }),
      ...(mission && { mission }),
      ...(vision && { vision }),
      ...(principalName && { principalName }),
      ...(principalDesignation && { principalDesignation }),
      ...(principalMessage && { principalMessage })
    };

    // Handle stats if provided
    if (stats) {
      try {
        updateData.stats = JSON.parse(stats);
      } catch (e) {
        console.error('Error parsing stats JSON:', e);
      }
    }

    // Handle principal image if uploaded
    if (req.file) {
      updateData.principalImage = req.file.filename;
    }

    // Update overview data
    const updatedOverview = dataService.updateOverview(updateData);

    if (!updatedOverview) {
      return res.status(500).json({ message: 'Failed to update overview data' });
    }

    res.json({
      message: 'Overview updated successfully',
      overview: updatedOverview
    });
  } catch (error) {
    console.error('Error updating overview:', error);
    res.status(500).json({ message: 'Failed to update overview data' });
  }
});

// Attendance routes
app.get('/api/attendance/:studentId', authenticateToken, (req, res) => {
  try {
    const studentAttendance = dataService.getStudentAttendance(req.params.studentId);

    if (!studentAttendance) {
      return res.status(404).json({ message: 'Attendance records not found for this student' });
    }

    res.json(studentAttendance);
  } catch (error) {
    console.error('Error reading attendance records:', error);
    res.status(500).json({ message: 'Failed to load attendance records' });
  }
});

// Get all attendance records (admin only)
app.get('/api/admin/attendance', authenticateToken, authorize(['admin']), (req, res) => {
  try {
    const attendance = dataService.getAttendance();
    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ message: 'Failed to load attendance records' });
  }
});

// Reset attendance for a specific student (admin only)
app.post('/api/admin/reset-student-attendance/:studentId', authenticateToken, authorize(['admin']), (req, res) => {
  try {
    const { studentId } = req.params;

    const success = dataService.resetStudentAttendance(studentId);

    if (!success) {
      return res.status(404).json({ message: 'Student attendance record not found' });
    }

    res.json({ message: 'Student attendance reset successfully' });
  } catch (error) {
    console.error('Error resetting student attendance:', error);
    res.status(500).json({ message: 'Failed to reset student attendance' });
  }
});

// Reset attendance for all students (admin only)
app.post('/api/admin/reset-all-attendance', authenticateToken, authorize(['admin']), (req, res) => {
  try {
    const success = dataService.resetAllAttendance();

    if (!success) {
      return res.status(500).json({ message: 'Failed to reset all attendance records' });
    }

    res.json({ message: 'All attendance records reset successfully' });
  } catch (error) {
    console.error('Error resetting all attendance records:', error);
    res.status(500).json({ message: 'Failed to reset all attendance records' });
  }
});

// Study Materials routes
app.get('/api/teachers/study-materials', authenticateToken, authorize(['teacher']), (req, res) => {
  try {
    console.log('Study materials request for user ID:', req.user.id);
    // Get all study materials without filtering by teacher
    // This allows all teachers to see all study materials
    const studyMaterials = dataService.getStudyMaterials();

    // Return all study materials
    res.json(studyMaterials);
  } catch (error) {
    console.error('Error fetching study materials:', error);
    res.status(500).json({ message: 'Failed to load study materials' });
  }
});

app.post('/api/teachers/upload-study-material', authenticateToken, authorize(['teacher']), upload.single('file'), (req, res) => {
  try {
    console.log('Upload study material request from user ID:', req.user.id);

    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, description, forClass } = req.body;
    console.log('Upload details:', { title, forClass });

    if (!title || !forClass) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'Title and class are required' });
    }

    // Get teacher data
    const userId = req.user.id;
    const user = dataService.getUserById(userId);

    if (!user) {
      console.log('User not found for ID:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Found user:', user.name, 'with role:', user.role);

    // Create directory for study materials if it doesn't exist
    const studyMaterialsDir = path.join(__dirname, 'uploads', 'study-materials');
    if (!fs.existsSync(studyMaterialsDir)) {
      fs.mkdirSync(studyMaterialsDir, { recursive: true });
    }

    // Create new study material
    const newMaterial = {
      _id: `material_${Date.now()}`,
      title,
      subject: user.subjects && user.subjects.length > 0 ? user.subjects[0] : 'General',
      class: forClass,
      description: description || '',
      fileUrl: req.file.filename,
      uploadedBy: user.name,
      uploadDate: new Date().toISOString()
    };

    // Add new study material
    dataService.addStudyMaterial(newMaterial);

    res.status(201).json({
      message: 'Study material uploaded successfully',
      studyMaterial: newMaterial
    });
  } catch (error) {
    console.error('Error uploading study material:', error);
    res.status(500).json({ message: 'Failed to upload study material' });
  }
});

app.delete('/api/teachers/study-materials/:id', authenticateToken, authorize(['teacher']), (req, res) => {
  try {
    const materialId = req.params.id;
    console.log('Delete study material request for material ID:', materialId);

    // Get teacher data
    const userId = req.user.id;
    const user = dataService.getUserById(userId);

    if (!user) {
      console.log('User not found for ID:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Found user:', user.name, 'with role:', user.role);

    const teachers = dataService.getTeachers();
    console.log('Total teachers in database:', teachers.length);

    // First try to find by exact match on name and department
    let teacher = teachers.find(t => t.name === user.name && t.department === user.department);

    // If not found, try to find just by name
    if (!teacher) {
      console.log('Teacher not found by name and department, trying just name');
      teacher = teachers.find(t => t.name === user.name);
    }

    // If still not found, try to find by username (in case name is different)
    if (!teacher && user.username) {
      console.log('Teacher not found by name, trying username:', user.username);
      // This is a fallback in case the teacher's name in users.json doesn't match teachers.json
      // We'll check if any teacher has a similar name to the username
      const username = user.username.toLowerCase();
      teacher = teachers.find(t =>
        t.name.toLowerCase().includes(username) ||
        (username.includes(t.name.toLowerCase()))
      );
    }

    // If still not found, create a new teacher entry
    if (!teacher) {
      console.log('Creating new teacher entry for:', user.name);
      const newTeacher = {
        name: user.name,
        department: user.department || 'General',
        subjects: user.subjects || []
      };

      const addedTeacher = dataService.addTeacher(newTeacher);
      if (addedTeacher) {
        teacher = addedTeacher;
        console.log('Successfully created teacher profile with ID:', addedTeacher._id);
      } else {
        console.error('Failed to create teacher profile');
        return res.status(500).json({ message: 'Failed to create teacher profile' });
      }
    }

    console.log('Found teacher:', teacher.name, 'with ID:', teacher._id);

    // Get the study material
    const material = dataService.getStudyMaterialById(materialId);

    if (!material) {
      return res.status(404).json({ message: 'Study material not found' });
    }

    // Check if teacher is the owner of the material
    // For now, allow any teacher to delete any study material
    console.log('Material uploaded by:', material.uploadedBy, 'Current teacher:', teacher.name);
    // Commenting out ownership check to allow any teacher to delete any material
    // if (material.uploadedBy !== teacher.name) {
    //   return res.status(403).json({ message: 'Not authorized to delete this study material' });
    // }

    // Delete file if exists
    const fileUrl = material.fileUrl;
    if (fileUrl) {
      const filePath = path.join(__dirname, 'uploads', 'study-materials', fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Remove material
    dataService.deleteStudyMaterial(materialId);

    res.json({ message: 'Study material deleted successfully' });
  } catch (error) {
    console.error('Error deleting study material:', error);
    res.status(500).json({ message: 'Failed to delete study material' });
  }
});

// This endpoint is now handled by the updated version above

app.get('/api/study-materials', authenticateToken, (req, res) => {
  try {
    console.log('Study materials request from user:', req.user.username, 'with role:', req.user.role);
    const materials = dataService.getStudyMaterials();
    let filteredMaterials = [];

    // Filter materials based on user role and class/subject
    if (req.user.role === 'student') {
      const student = dataService.getUserById(req.user.id);
      console.log('Student class:', student.class);
      filteredMaterials = materials.filter(material => material.class === student.class);
    } else if (req.user.role === 'teacher') {
      const teacher = dataService.getUserById(req.user.id);
      console.log('Teacher name:', teacher.name);
      // All teachers can see all study materials
      filteredMaterials = materials;
    } else {
      // Admin can see all materials
      filteredMaterials = materials;
    }

    console.log('Returning', filteredMaterials.length, 'study materials');
    res.json(filteredMaterials);
  } catch (error) {
    console.error('Error reading study materials:', error);
    res.status(500).json({ message: 'Failed to load study materials' });
  }
});

// Endpoint to check if a file exists
app.get('/api/check-file/:type/:filename', (req, res) => {
  try {
    const { type, filename } = req.params;

    // Validate the type parameter to prevent directory traversal
    const allowedTypes = ['study-materials', 'gallery', 'profiles', 'courses', 'notices', 'forms', 'applications', 'newsletters'];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ exists: false, message: 'Invalid file type' });
    }

    // Validate the filename to prevent directory traversal
    const sanitizedFilename = path.basename(filename);
    if (sanitizedFilename !== filename) {
      return res.status(400).json({ exists: false, message: 'Invalid filename' });
    }

    const filePath = path.join(__dirname, 'uploads', type, sanitizedFilename);
    const exists = fs.existsSync(filePath);

    res.json({ exists });
  } catch (error) {
    console.error('Error checking file existence:', error);
    res.status(500).json({ exists: false, message: 'Error checking file' });
  }
});

// Public endpoint for study materials
app.get('/api/study-materials/public', (req, res) => {
  try {
    const materials = dataService.getStudyMaterials();

    // Map materials to include only necessary fields
    const publicMaterials = materials.map(material => ({
      _id: material._id,
      title: material.title,
      description: material.description,
      subject: material.subject,
      class: material.class,
      fileUrl: material.fileUrl,
      uploadedBy: material.uploadedBy,
      uploadDate: material.uploadDate,
      createdAt: material.createdAt
    }));

    res.json(publicMaterials);
  } catch (error) {
    console.error('Error fetching public study materials:', error);
    res.status(500).json({ message: 'Failed to load study materials' });
  }
});

// Fallback route for study materials that doesn't require specific role
app.get('/api/all-study-materials', authenticateToken, (req, res) => {
  try {
    console.log('All study materials request from user:', req.user.username);
    const materials = dataService.getStudyMaterials();
    res.json(materials);
  } catch (error) {
    console.error('Error reading all study materials:', error);
    res.status(500).json({ message: 'Failed to load study materials' });
  }
});

app.post('/api/admin/add-course', authenticateToken, authorize(['admin']), upload.single('image'), (req, res) => {
  try {
    const { title, code, description, duration, eligibility, seats, fees } = req.body;

    if (!title || !code || !description || !duration || !eligibility || !seats || !fees) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const filePath = path.join(__dirname, 'data/courses.json');
    const data = fs.readFileSync(filePath, 'utf8');
    const courses = JSON.parse(data);

    // Check if course code already exists
    const existingCourse = courses.find(c => c.code === code);
    if (existingCourse) {
      return res.status(400).json({ message: 'Course code already exists' });
    }

    const newCourse = {
      _id: `course_${Date.now()}`,
      title,
      code,
      description,
      duration,
      eligibility,
      seats: parseInt(seats),
      fees: parseInt(fees),
      image: req.file ? req.file.filename : 'default-course.jpg'
    };

    courses.push(newCourse);
    fs.writeFileSync(filePath, JSON.stringify(courses, null, 2), 'utf8');

    res.status(201).json(newCourse);
  } catch (error) {
    console.error('Error adding course:', error);
    res.status(500).json({ message: 'Failed to add course' });
  }
});

app.put('/api/admin/update-course/:id', authenticateToken, authorize(['admin']), upload.single('image'), (req, res) => {
  try {
    const { title, code, description, duration, eligibility, seats, fees } = req.body;

    if (!title && !code && !description && !duration && !eligibility && !seats && !fees) {
      return res.status(400).json({ message: 'At least one field is required' });
    }

    const filePath = path.join(__dirname, 'data/courses.json');
    const data = fs.readFileSync(filePath, 'utf8');
    const courses = JSON.parse(data);

    const courseIndex = courses.findIndex(c => c._id === req.params.id);
    if (courseIndex === -1) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if course code already exists (if code is being updated)
    if (code && code !== courses[courseIndex].code) {
      const existingCourse = courses.find(c => c.code === code);
      if (existingCourse) {
        return res.status(400).json({ message: 'Course code already exists' });
      }
    }

    // Update course fields
    if (title) courses[courseIndex].title = title;
    if (code) courses[courseIndex].code = code;
    if (description) courses[courseIndex].description = description;
    if (duration) courses[courseIndex].duration = duration;
    if (eligibility) courses[courseIndex].eligibility = eligibility;
    if (seats) courses[courseIndex].seats = parseInt(seats);
    if (fees) courses[courseIndex].fees = parseInt(fees);

    // Update image if provided
    if (req.file) {
      // Delete old image if it exists and is not the default
      if (courses[courseIndex].image && courses[courseIndex].image !== 'default-course.jpg') {
        const oldImagePath = path.join(uploadsDir, courses[courseIndex].image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      courses[courseIndex].image = req.file.filename;
    }

    fs.writeFileSync(filePath, JSON.stringify(courses, null, 2), 'utf8');

    res.json(courses[courseIndex]);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Failed to update course' });
  }
});

app.delete('/api/admin/delete-course/:id', authenticateToken, authorize(['admin']), (req, res) => {
  try {
    const filePath = path.join(__dirname, 'data/courses.json');
    const data = fs.readFileSync(filePath, 'utf8');
    const courses = JSON.parse(data);

    const courseIndex = courses.findIndex(c => c._id === req.params.id);
    if (courseIndex === -1) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Delete course image if it exists and is not the default
    if (courses[courseIndex].image && courses[courseIndex].image !== 'default-course.jpg') {
      const imagePath = path.join(uploadsDir, courses[courseIndex].image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    courses.splice(courseIndex, 1);
    fs.writeFileSync(filePath, JSON.stringify(courses, null, 2), 'utf8');

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Failed to delete course' });
  }
});

app.get('/api/gallery/:id', (req, res) => {
  const item = dataService.getGalleryItemById(req.params.id);

  if (!item) {
    return res.status(404).json({ message: 'Gallery item not found' });
  }

  res.json(item);
});

app.post('/api/gallery', authenticateToken, authorize(['admin']), upload.single('image'), (req, res) => {
  const { title, description } = req.body;

  if (!title || !req.file) {
    return res.status(400).json({ message: 'Title and image are required' });
  }

  const newItem = dataService.addGalleryItem({
    title,
    description: description || '',
    imageUrl: req.file.filename
  });

  if (!newItem) {
    return res.status(500).json({ message: 'Failed to add gallery item' });
  }

  res.status(201).json(newItem);
});

app.delete('/api/gallery/:id', authenticateToken, authorize(['admin']), (req, res) => {
  const item = dataService.getGalleryItemById(req.params.id);

  if (!item) {
    return res.status(404).json({ message: 'Gallery item not found' });
  }

  // Delete the image file
  if (item.imageUrl) {
    const imagePath = path.join(uploadsDir, item.imageUrl);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  const success = dataService.deleteGalleryItem(req.params.id);

  if (!success) {
    return res.status(500).json({ message: 'Failed to delete gallery item' });
  }

  res.json({ message: 'Gallery item deleted successfully' });
});

// Admin routes
app.post('/api/admin/add-student', authenticateToken, authorize(['admin']), (req, res) => {
  const { name, rollNumber, className, password, branch } = req.body;

  if (!name || !rollNumber || !className || !password || !branch) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate branch - must be one of CS, ME, ET, EE
  const validBranches = ['CS', 'ME', 'ET', 'EE'];
  if (!validBranches.includes(branch)) {
    return res.status(400).json({ message: 'Branch must be one of: CS, ME, ET, EE' });
  }

  // Check if roll number already exists (roll number is used as username)
  const existingUser = dataService.getUserByUsername(rollNumber);
  if (existingUser) {
    return res.status(400).json({ message: 'Roll number already exists' });
  }

  // Check if roll number already exists
  const existingStudent = dataService.getStudents().find(s => s.rollNumber === rollNumber);
  if (existingStudent) {
    return res.status(400).json({ message: 'Roll number already exists' });
  }

  // Add student to students.json with password
  const newStudent = dataService.addStudent({
    name,
    rollNumber,
    class: className,
    branch, // Add branch field
    password, // Store password directly in the student record
    attendance: [],
    profilePicture: null
  });

  if (!newStudent) {
    return res.status(500).json({ message: 'Failed to add student' });
  }

  res.status(201).json({ message: 'Student added successfully' });
});

app.put('/api/admin/update-student/:id', authenticateToken, authorize(['admin']), (req, res) => {
  const { name, className, branch } = req.body;

  if (!name && !className && !branch) {
    return res.status(400).json({ message: 'At least one field is required' });
  }

  // Validate branch if provided
  if (branch) {
    const validBranches = ['CS', 'ME', 'ET', 'EE'];
    if (!validBranches.includes(branch)) {
      return res.status(400).json({ message: 'Branch must be one of: CS, ME, ET, EE' });
    }
  }

  const student = dataService.getStudentById(req.params.id);

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  // Update student in students.json
  const updatedStudent = dataService.updateStudent(req.params.id, {
    ...(name && { name }),
    ...(className && { class: className }),
    ...(branch && { branch })
  });

  if (!updatedStudent) {
    return res.status(500).json({ message: 'Failed to update student' });
  }

  // No need to update a separate user record since we're using the student record directly

  res.json({ message: 'Student updated successfully' });
});

app.delete('/api/admin/delete-student/:id', authenticateToken, authorize(['admin']), (req, res) => {
  const student = dataService.getStudentById(req.params.id);

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  // Delete student from students.json
  const success = dataService.deleteStudent(req.params.id);

  if (!success) {
    return res.status(500).json({ message: 'Failed to delete student' });
  }

  // No need to delete a separate user record since we're using the student record directly

  res.json({ message: 'Student deleted successfully' });
});

app.post('/api/admin/add-teacher', authenticateToken, authorize(['admin']), (req, res) => {
  const { name, department, subjects, username, password, qualification, experience, designation } = req.body;

  if (!name || !department || !subjects || !username || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Check if username already exists
  const existingUser = dataService.getUserByUsername(username);
  if (existingUser) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  // Convert subjects to array if it's a string
  const subjectsArray = Array.isArray(subjects) ? subjects : subjects.split(',').map(s => s.trim());

  // Use the provided username instead of generating one

  // Add teacher to teachers.json
  const newTeacher = dataService.addTeacher({
    name,
    department,
    subjects: subjectsArray,
    qualification,
    experience,
    designation,
    username,  // Add username to teacher record
    password   // Add password to teacher record
  });

  if (!newTeacher) {
    return res.status(500).json({ message: 'Failed to add teacher' });
  }

  // Add teacher to users.json
  const newUser = dataService.addUser({
    username,
    password,
    role: 'teacher',
    name,
    department,
    subjects: subjectsArray,
    qualification,
    experience,
    designation,
    profilePicture: null
  });

  if (!newUser) {
    // Rollback teacher addition
    dataService.deleteTeacher(newTeacher._id);
    return res.status(500).json({ message: 'Failed to add teacher user' });
  }

  res.status(201).json({ message: 'Teacher added successfully', username });
});

app.put('/api/admin/update-teacher/:id', authenticateToken, authorize(['admin']), (req, res) => {
  const { name, department, subjects, qualification, experience, designation } = req.body;

  if (!name && !department && !subjects && !qualification && !experience && !designation) {
    return res.status(400).json({ message: 'At least one field is required' });
  }

  const teacher = dataService.getTeacherById(req.params.id);

  if (!teacher) {
    return res.status(404).json({ message: 'Teacher not found' });
  }

  // Convert subjects to array if it's a string
  const subjectsArray = subjects ? (Array.isArray(subjects) ? subjects : subjects.split(',').map(s => s.trim())) : undefined;

  // Update teacher in teachers.json
  const updatedTeacher = dataService.updateTeacher(req.params.id, {
    ...(name && { name }),
    ...(department && { department }),
    ...(subjectsArray && { subjects: subjectsArray })
  });

  if (!updatedTeacher) {
    return res.status(500).json({ message: 'Failed to update teacher' });
  }

  // Update the teacher directly
  // Note: We no longer need to update a separate user record since we've removed users.json

  res.json({ message: 'Teacher updated successfully' });
});

app.delete('/api/admin/delete-teacher/:id', authenticateToken, authorize(['admin']), (req, res) => {
  const teacher = dataService.getTeacherById(req.params.id);

  if (!teacher) {
    return res.status(404).json({ message: 'Teacher not found' });
  }

  // Delete teacher from teachers.json
  const success = dataService.deleteTeacher(req.params.id);

  if (!success) {
    return res.status(500).json({ message: 'Failed to delete teacher' });
  }

  // Delete the teacher directly
  // Note: We no longer need to delete a separate user record since we've removed users.json

  res.json({ message: 'Teacher deleted successfully' });
});

// Admin profile update
app.put('/api/admin/profile', authenticateToken, authorize(['admin']), profileUpload.single('profilePicture'), (req, res) => {
  const { name, email, phone, bio } = req.body;
  const userId = req.user.id;

  // Get the current user
  const user = dataService.getUserById(userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Prepare update data
  const updateData = {
    ...(name && { name }),
    ...(email && { email }),
    ...(phone && { phone }),
    ...(bio && { bio })
  };

  // If a new profile picture was uploaded
  if (req.file) {
    // Delete old profile picture if exists
    if (user.profilePicture) {
      const oldImagePath = path.join(profilesDir, user.profilePicture);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    updateData.profilePicture = req.file.filename;
  }

  // Update the user
  const updatedUser = dataService.updateUser(userId, updateData);

  if (!updatedUser) {
    return res.status(500).json({ message: 'Failed to update profile' });
  }

  // Return user without password
  const userWithoutPassword = { ...updatedUser };
  delete userWithoutPassword.password;

  res.json(userWithoutPassword);
});

// Admin change password
app.put('/api/admin/change-password', authenticateToken, authorize(['admin']), (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  // Validate input
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required' });
  }

  // Get the current user
  const user = dataService.getUserById(userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Verify current password
  if (user.password !== currentPassword) {
    return res.status(401).json({ message: 'Current password is incorrect' });
  }

  // Update password
  const updatedUser = dataService.updateUser(userId, { password: newPassword });

  if (!updatedUser) {
    return res.status(500).json({ message: 'Failed to update password' });
  }

  res.json({ message: 'Password updated successfully' });
});

// Admin study materials management
app.post('/api/admin/upload-study-material', authenticateToken, authorize(['admin']), upload.single('file'), (req, res) => {
  try {
    const { title, description, subject, class: className } = req.body;
    const userId = req.user.id;
    const user = dataService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!title || !subject || !className) {
      return res.status(400).json({ message: 'Title, subject, and class are required' });
    }

    // Create directory for study materials if it doesn't exist
    const studyMaterialsDir = path.join(__dirname, 'uploads', 'study-materials');
    if (!fs.existsSync(studyMaterialsDir)) {
      fs.mkdirSync(studyMaterialsDir, { recursive: true });
    }

    // Move the file to the study materials directory
    const fileExt = path.extname(req.file.originalname);
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;
    const filePath = path.join(studyMaterialsDir, fileName);

    fs.renameSync(req.file.path, filePath);

    // Add study material to database
    const newMaterial = dataService.addStudyMaterial({
      title,
      description,
      subject,
      class: className,
      fileUrl: fileName,
      uploadedBy: user.name,
      uploadDate: new Date().toISOString()
    });

    res.status(201).json(newMaterial);
  } catch (error) {
    console.error('Error uploading study material:', error);
    res.status(500).json({ message: 'Failed to upload study material' });
  }
});

// Document Management (Forms, Applications, Newsletters)
// Data structure for documents
let documents = [];
const documentsFilePath = path.join(__dirname, 'data/documents.json');

// Initialize documents data
try {
  if (fs.existsSync(documentsFilePath)) {
    const data = fs.readFileSync(documentsFilePath, 'utf8');
    documents = JSON.parse(data);
  } else {
    // Create an empty documents file if it doesn't exist
    fs.writeFileSync(documentsFilePath, JSON.stringify([], null, 2), 'utf8');
  }
} catch (error) {
  console.error('Error initializing documents data:', error);
}

// Helper function to save documents data
const saveDocuments = () => {
  try {
    fs.writeFileSync(documentsFilePath, JSON.stringify(documents, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving documents data:', error);
    return false;
  }
};

// Get all documents
app.get('/api/documents', (req, res) => {
  try {
    // Filter out documents based on query parameters
    let filteredDocuments = [...documents];

    if (req.query.type) {
      filteredDocuments = filteredDocuments.filter(doc => doc.type === req.query.type);
    }

    if (req.query.category) {
      filteredDocuments = filteredDocuments.filter(doc => doc.category === req.query.category);
    }

    // Sort by upload date (newest first)
    filteredDocuments.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    res.json(filteredDocuments);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Failed to load documents' });
  }
});

// Get document by ID
app.get('/api/documents/:id', (req, res) => {
  try {
    const document = documents.find(doc => doc._id === req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ message: 'Failed to load document' });
  }
});

// Upload a document (admin only)
app.post('/api/admin/documents', authenticateToken, authorize(['admin']), upload.single('file'), (req, res) => {
  try {
    const { title, description, type, category, driveUrl } = req.body;

    if (type !== 'drive_link' && !req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!title || !type) {
      return res.status(400).json({ message: 'Title and type are required' });
    }

    if (type === 'drive_link' && !driveUrl) {
      return res.status(400).json({ message: 'Drive URL is required for drive links' });
    }

    // Validate document type
    const validTypes = ['form', 'application', 'newsletter', 'drive_link'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid document type' });
    }

    // Create a new document record
    let newDocument = {
      _id: `doc_${Date.now()}`,
      title,
      description: description || '',
      type,
      category: category || 'general',
      uploadDate: new Date().toISOString(),
      uploadedBy: req.user.name || 'Admin'
    };

    if (type === 'drive_link') {
      // For drive links, store the URL
      newDocument.driveUrl = driveUrl;
    } else {
      // For file uploads, handle the file
      // Determine the destination folder based on type
      let destFolder;
      if (type === 'form') {
        destFolder = 'forms';
      } else if (type === 'application') {
        destFolder = 'applications';
      } else if (type === 'newsletter') {
        destFolder = 'newsletters';
      }

      // Move the file to the appropriate directory
      const sourceFilePath = req.file.path;
      const destFilePath = path.join(__dirname, 'uploads', destFolder, req.file.filename);

      // Create the destination directory if it doesn't exist
      const destDir = path.dirname(destFilePath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // Move the file if it's not already in the correct directory
      if (sourceFilePath !== destFilePath) {
        fs.renameSync(sourceFilePath, destFilePath);
      }

      // Add file-specific properties
      newDocument.fileUrl = req.file.filename;
      newDocument.filePath = `${destFolder}/${req.file.filename}`;
      newDocument.fileSize = req.file.size;
      newDocument.fileType = req.file.mimetype;
    }

    // Add the document to the array and save
    documents.push(newDocument);
    saveDocuments();

    res.status(201).json(newDocument);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ message: 'Failed to upload document' });
  }
});

// Update a document (admin only)
app.put('/api/admin/documents/:id', authenticateToken, authorize(['admin']), (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title && !description && !category) {
      return res.status(400).json({ message: 'At least one field is required' });
    }

    // Find the document
    const documentIndex = documents.findIndex(doc => doc._id === req.params.id);

    if (documentIndex === -1) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Update the document
    if (title) documents[documentIndex].title = title;
    if (description) documents[documentIndex].description = description;
    if (category) documents[documentIndex].category = category;

    // Save the changes
    saveDocuments();

    res.json(documents[documentIndex]);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ message: 'Failed to update document' });
  }
});

// Delete a document (admin only)
app.delete('/api/admin/documents/:id', authenticateToken, authorize(['admin']), (req, res) => {
  try {
    // Find the document
    const documentIndex = documents.findIndex(doc => doc._id === req.params.id);

    if (documentIndex === -1) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const document = documents[documentIndex];

    // Delete the file
    if (document.filePath) {
      const filePath = path.join(__dirname, 'uploads', document.filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Remove the document from the array
    documents.splice(documentIndex, 1);

    // Save the changes
    saveDocuments();

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Failed to delete document' });
  }
});

// Download a document
app.get('/api/download/document/:id', (req, res) => {
  try {
    const documentId = req.params.id;

    // Find the document
    const document = documents.find(doc => doc._id === documentId);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // If it's a drive link, return the URL
    if (document.type === 'drive_link') {
      return res.json({ driveUrl: document.driveUrl });
    }

    // For file documents, check if the file path exists
    if (!document.filePath) {
      return res.status(404).json({ message: 'Document file not found' });
    }

    // Construct the file path
    const filePath = path.join(__dirname, 'uploads', document.filePath);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Set appropriate content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.pdf') {
      res.setHeader('Content-Type', 'application/pdf');
    } else if (ext === '.doc' || ext === '.docx') {
      res.setHeader('Content-Type', 'application/msword');
    } else if (ext === '.xls' || ext === '.xlsx') {
      res.setHeader('Content-Type', 'application/vnd.ms-excel');
    } else if (ext === '.ppt' || ext === '.pptx') {
      res.setHeader('Content-Type', 'application/vnd.ms-powerpoint');
    }

    // Set Content-Disposition header for download
    const sanitizedTitle = document.title ? document.title.replace(/[^a-zA-Z0-9]/g, '_') : 'download';
    const filename = `${sanitizedTitle}${ext}`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ message: 'Failed to download document' });
  }
});

app.delete('/api/admin/study-materials/:id', authenticateToken, authorize(['admin']), (req, res) => {
  try {
    const materialId = req.params.id;

    // Get the study material
    const material = dataService.getStudyMaterialById(materialId);

    if (!material) {
      return res.status(404).json({ message: 'Study material not found' });
    }

    // Delete file if exists
    const fileUrl = material.fileUrl;
    if (fileUrl) {
      const filePath = path.join(__dirname, 'uploads', 'study-materials', fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Remove material
    dataService.deleteStudyMaterial(materialId);

    res.json({ message: 'Study material deleted successfully' });
  } catch (error) {
    console.error('Error deleting study material:', error);
    res.status(500).json({ message: 'Failed to delete study material' });
  }
});

// Course management endpoints
app.get('/api/courses/:id', (req, res) => {
  const course = dataService.getCourseById(req.params.id);

  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  res.json(course);
});

app.post('/api/admin/add-course', authenticateToken, authorize(['admin']), upload.single('image'), (req, res) => {
  const { title, code, description, duration, eligibility, seats, fees } = req.body;

  // Validate required fields
  if (!title || !code) {
    return res.status(400).json({ message: 'Title and code are required' });
  }

  // Check if course code already exists
  const courses = dataService.getCourses();
  const existingCourse = courses.find(c => c.code === code);

  if (existingCourse) {
    return res.status(400).json({ message: 'Course code already exists' });
  }

  // Create new course object
  const newCourse = {
    title,
    code,
    description: description || '',
    duration: duration || '',
    eligibility: eligibility || '',
    seats: seats || 0,
    fees: fees || 0,
    image: req.file ? req.file.filename : null
  };

  // Add course
  const course = dataService.addCourse(newCourse);

  if (!course) {
    return res.status(500).json({ message: 'Failed to add course' });
  }

  res.status(201).json(course);
});

app.put('/api/admin/update-course/:id', authenticateToken, authorize(['admin']), upload.single('image'), (req, res) => {
  const { title, code, description, duration, eligibility, seats, fees } = req.body;
  const courseId = req.params.id;

  // Get the course
  const course = dataService.getCourseById(courseId);

  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  // Prepare update data
  const updateData = {
    ...(title && { title }),
    ...(code && { code }),
    ...(description && { description }),
    ...(duration && { duration }),
    ...(eligibility && { eligibility }),
    ...(seats && { seats: parseInt(seats) }),
    ...(fees && { fees: parseInt(fees) })
  };

  // If a new image was uploaded
  if (req.file) {
    updateData.image = req.file.filename;

    // Delete old image if it exists
    if (course.image) {
      const oldImagePath = path.join(__dirname, 'uploads/courses', course.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
  }

  // Check if course code already exists (if code is being updated)
  if (code && code !== course.code) {
    const courses = dataService.getCourses();
    const existingCourse = courses.find(c => c.code === code && c._id !== courseId);

    if (existingCourse) {
      return res.status(400).json({ message: 'Course code already exists' });
    }
  }

  // Update course
  const updatedCourse = dataService.updateCourse(courseId, updateData);

  if (!updatedCourse) {
    return res.status(500).json({ message: 'Failed to update course' });
  }

  res.json(updatedCourse);
});

app.delete('/api/admin/delete-course/:id', authenticateToken, authorize(['admin']), (req, res) => {
  const courseId = req.params.id;

  // Get the course
  const course = dataService.getCourseById(courseId);

  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  // Delete course image if it exists
  if (course.image) {
    const imagePath = path.join(__dirname, 'uploads/courses', course.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  // Delete course
  const success = dataService.deleteCourse(courseId);

  if (!success) {
    return res.status(500).json({ message: 'Failed to delete course' });
  }

  res.json({ message: 'Course deleted successfully' });
});

// Add a singular version of the teacher study materials endpoint to fix the frontend issue
app.get('/api/teacher/study-materials', authenticateToken, (req, res) => {
  try {
    console.log('Study materials request from teacher (singular endpoint):', req.user.username);
    const materials = dataService.getStudyMaterials();
    res.json(materials);
  } catch (error) {
    console.error('Error fetching study materials:', error);
    res.status(500).json({ message: 'Failed to load study materials' });
  }
});

// Quick Links API endpoints

// Get all quick links
app.get('/api/quick-links', (req, res) => {
  try {
    const links = dataService.getQuickLinks();
    res.json(links);
  } catch (error) {
    console.error('Error fetching quick links:', error);
    res.status(500).json({ message: 'Failed to load quick links' });
  }
});

// Get a specific quick link by ID
app.get('/api/quick-links/:id', (req, res) => {
  try {
    const link = dataService.getQuickLinkById(req.params.id);
    if (!link) {
      return res.status(404).json({ message: 'Quick link not found' });
    }
    res.json(link);
  } catch (error) {
    console.error('Error fetching quick link:', error);
    res.status(500).json({ message: 'Failed to load quick link' });
  }
});

// Add a new quick link (admin only)
app.post('/api/quick-links', authenticateToken, authorize(['admin']), (req, res) => {
  try {
    const { title, url, icon, color } = req.body;

    if (!title || !url) {
      return res.status(400).json({ message: 'Title and URL are required' });
    }

    // Get existing links to determine the next order value
    const links = dataService.getQuickLinks();
    const maxOrder = links.length > 0 ? Math.max(...links.map(link => link.order || 0)) : 0;

    const newLink = dataService.addQuickLink({
      title,
      url,
      icon: icon || 'link',
      color: color || 'blue',
      order: maxOrder + 1
    });

    if (!newLink) {
      return res.status(500).json({ message: 'Failed to add quick link' });
    }

    res.status(201).json(newLink);
  } catch (error) {
    console.error('Error adding quick link:', error);
    res.status(500).json({ message: 'Failed to add quick link' });
  }
});

// Update an existing quick link (admin only)
app.put('/api/quick-links/:id', authenticateToken, authorize(['admin']), (req, res) => {
  try {
    const { title, url, icon, color, order } = req.body;

    if (!title && !url && !icon && !color && order === undefined) {
      return res.status(400).json({ message: 'At least one field is required' });
    }

    const updatedLink = dataService.updateQuickLink(req.params.id, {
      ...(title && { title }),
      ...(url && { url }),
      ...(icon && { icon }),
      ...(color && { color }),
      ...(order !== undefined && { order })
    });

    if (!updatedLink) {
      return res.status(404).json({ message: 'Quick link not found' });
    }

    res.json(updatedLink);
  } catch (error) {
    console.error('Error updating quick link:', error);
    res.status(500).json({ message: 'Failed to update quick link' });
  }
});

// Delete a quick link (admin only)
app.delete('/api/quick-links/:id', authenticateToken, authorize(['admin']), (req, res) => {
  try {
    const success = dataService.deleteQuickLink(req.params.id);

    if (!success) {
      return res.status(404).json({ message: 'Quick link not found' });
    }

    res.json({ message: 'Quick link deleted successfully' });
  } catch (error) {
    console.error('Error deleting quick link:', error);
    res.status(500).json({ message: 'Failed to delete quick link' });
  }
});

// Custom Buttons API endpoints

// Get all custom buttons
app.get('/api/custom-buttons', (req, res) => {
  try {
    const buttons = dataService.getCustomButtons();
    res.json(buttons);
  } catch (error) {
    console.error('Error fetching custom buttons:', error);
    res.status(500).json({ message: 'Failed to load custom buttons' });
  }
});

// Get a specific custom button by ID
app.get('/api/custom-buttons/:id', (req, res) => {
  try {
    const button = dataService.getCustomButtonById(req.params.id);
    if (!button) {
      return res.status(404).json({ message: 'Custom button not found' });
    }
    res.json(button);
  } catch (error) {
    console.error('Error fetching custom button:', error);
    res.status(500).json({ message: 'Failed to load custom button' });
  }
});

// Add a new custom button (admin only)
app.post('/api/custom-buttons', authenticateToken, authorize(['admin']), (req, res) => {
  try {
    const { title, url, icon, color } = req.body;

    if (!title || !url) {
      return res.status(400).json({ message: 'Title and URL are required' });
    }

    // Get existing buttons to determine the next order value
    const buttons = dataService.getCustomButtons();
    const maxOrder = buttons.length > 0 ? Math.max(...buttons.map(button => button.order || 0)) : 0;

    const newButton = dataService.addCustomButton({
      title,
      url,
      icon: icon || 'link',
      color: color || 'blue',
      order: maxOrder + 1
    });

    if (!newButton) {
      return res.status(500).json({ message: 'Failed to add custom button' });
    }

    res.status(201).json(newButton);
  } catch (error) {
    console.error('Error adding custom button:', error);
    res.status(500).json({ message: 'Failed to add custom button' });
  }
});

// Update an existing custom button (admin only)
app.put('/api/custom-buttons/:id', authenticateToken, authorize(['admin']), (req, res) => {
  try {
    const { title, url, icon, color, order } = req.body;

    if (!title && !url && !icon && !color && order === undefined) {
      return res.status(400).json({ message: 'At least one field is required' });
    }

    const updatedButton = dataService.updateCustomButton(req.params.id, {
      ...(title && { title }),
      ...(url && { url }),
      ...(icon && { icon }),
      ...(color && { color }),
      ...(order !== undefined && { order })
    });

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
app.delete('/api/custom-buttons/:id', authenticateToken, authorize(['admin']), (req, res) => {
  try {
    const success = dataService.deleteCustomButton(req.params.id);

    if (!success) {
      return res.status(404).json({ message: 'Custom button not found' });
    }

    res.json({ message: 'Custom button deleted successfully' });
  } catch (error) {
    console.error('Error deleting custom button:', error);
    res.status(500).json({ message: 'Failed to delete custom button' });
  }
});

// HOD API endpoints

// Get all HODs
app.get('/api/hods', (req, res) => {
  try {
    const hods = dataService.getHods();
    res.json(hods);
  } catch (error) {
    console.error('Error fetching HODs:', error);
    res.status(500).json({ message: 'Failed to load HODs' });
  }
});

// Get a specific HOD by ID
app.get('/api/hods/:id', (req, res) => {
  try {
    const hod = dataService.getHodById(req.params.id);
    if (!hod) {
      return res.status(404).json({ message: 'HOD not found' });
    }
    res.json(hod);
  } catch (error) {
    console.error('Error fetching HOD:', error);
    res.status(500).json({ message: 'Failed to load HOD' });
  }
});

// Add a new HOD (admin only)
app.post('/api/hods', authenticateToken, authorize(['admin']), profileUpload.single('image'), (req, res) => {
  try {
    const { name, department, designation, qualification, experience, message } = req.body;

    if (!name || !department) {
      return res.status(400).json({ message: 'Name and department are required' });
    }

    const newHod = dataService.addHod({
      name,
      department,
      designation: designation || '',
      qualification: qualification || '',
      experience: experience || '',
      message: message || '',
      image: req.file ? req.file.filename : ''
    });

    if (!newHod) {
      return res.status(500).json({ message: 'Failed to add HOD' });
    }

    res.status(201).json(newHod);
  } catch (error) {
    console.error('Error adding HOD:', error);
    res.status(500).json({ message: 'Failed to add HOD' });
  }
});

// Update an existing HOD (admin only)
app.put('/api/hods/:id', authenticateToken, authorize(['admin']), profileUpload.single('image'), (req, res) => {
  try {
    const { name, department, designation, qualification, experience, message } = req.body;

    if (!name && !department && !designation && !qualification && !experience && !message && !req.file) {
      return res.status(400).json({ message: 'At least one field is required' });
    }

    const hod = dataService.getHodById(req.params.id);
    if (!hod) {
      return res.status(404).json({ message: 'HOD not found' });
    }

    // If a new image was uploaded, delete the old one if it exists
    if (req.file && hod.image) {
      const oldImagePath = path.join(profilesDir, hod.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const updatedHod = dataService.updateHod(req.params.id, {
      ...(name && { name }),
      ...(department && { department }),
      ...(designation && { designation }),
      ...(qualification && { qualification }),
      ...(experience && { experience }),
      ...(message && { message }),
      ...(req.file && { image: req.file.filename })
    });

    if (!updatedHod) {
      return res.status(404).json({ message: 'HOD not found' });
    }

    res.json(updatedHod);
  } catch (error) {
    console.error('Error updating HOD:', error);
    res.status(500).json({ message: 'Failed to update HOD' });
  }
});

// Delete an HOD (admin only)
app.delete('/api/hods/:id', authenticateToken, authorize(['admin']), (req, res) => {
  try {
    const hod = dataService.getHodById(req.params.id);
    if (!hod) {
      return res.status(404).json({ message: 'HOD not found' });
    }

    // Delete the HOD's image if it exists
    if (hod.image) {
      const imagePath = path.join(profilesDir, hod.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    const success = dataService.deleteHod(req.params.id);
    if (!success) {
      return res.status(500).json({ message: 'Failed to delete HOD' });
    }

    res.json({ message: 'HOD deleted successfully' });
  } catch (error) {
    console.error('Error deleting HOD:', error);
    res.status(500).json({ message: 'Failed to delete HOD' });
  }
});

// Chatbot API endpoints

// Get all FAQs
app.get('/api/chatbot/faqs', (req, res) => {
  try {
    const faqs = dataService.getChatbotFaqs();
    res.json(faqs);
  } catch (error) {
    console.error('Error fetching chatbot FAQs:', error);
    res.status(500).json({ message: 'Failed to load chatbot FAQs' });
  }
});

// Get a specific FAQ by ID
app.get('/api/chatbot/faqs/:id', (req, res) => {
  try {
    const faq = dataService.getChatbotFaqById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    res.json(faq);
  } catch (error) {
    console.error('Error fetching chatbot FAQ:', error);
    res.status(500).json({ message: 'Failed to load chatbot FAQ' });
  }
});

// Add a new FAQ (admin only)
app.post('/api/chatbot/faqs', authenticateToken, authorize(['admin']), (req, res) => {
  try {
    const { question, answer, keywords } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and answer are required' });
    }

    const newFaq = dataService.addChatbotFaq({
      question,
      answer,
      keywords: keywords || []
    });

    if (!newFaq) {
      return res.status(500).json({ message: 'Failed to add FAQ' });
    }

    res.status(201).json(newFaq);
  } catch (error) {
    console.error('Error adding chatbot FAQ:', error);
    res.status(500).json({ message: 'Failed to add chatbot FAQ' });
  }
});

// Update an existing FAQ (admin only)
app.put('/api/chatbot/faqs/:id', authenticateToken, authorize(['admin']), (req, res) => {
  try {
    const { question, answer, keywords } = req.body;

    if (!question && !answer && !keywords) {
      return res.status(400).json({ message: 'At least one field is required' });
    }

    const updatedFaq = dataService.updateChatbotFaq(req.params.id, {
      ...(question && { question }),
      ...(answer && { answer }),
      ...(keywords && { keywords })
    });

    if (!updatedFaq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    res.json(updatedFaq);
  } catch (error) {
    console.error('Error updating chatbot FAQ:', error);
    res.status(500).json({ message: 'Failed to update chatbot FAQ' });
  }
});

// Delete an FAQ (admin only)
app.delete('/api/chatbot/faqs/:id', authenticateToken, authorize(['admin']), (req, res) => {
  try {
    const success = dataService.deleteChatbotFaq(req.params.id);

    if (!success) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Error deleting chatbot FAQ:', error);
    res.status(500).json({ message: 'Failed to delete chatbot FAQ' });
  }
});

// Get chatbot response for a query
app.post('/api/chatbot/query', (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    const response = dataService.getChatbotResponse(query);
    res.json(response);
  } catch (error) {
    console.error('Error processing chatbot query:', error);
    res.status(500).json({ message: 'Failed to process chatbot query' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
