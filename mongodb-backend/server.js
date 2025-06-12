const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
const envResult = dotenv.config({ path: path.join(__dirname, '.env') });
console.log('Dotenv config result:', envResult);

// Debug environment variables
console.log('Environment variables loaded:');
console.log('- CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not set');
console.log('- CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set');
console.log('- CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

// Create Express app
const app = express();

// Environment variables
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://GPC:anmol4328@gpc-itarsi.puza0ta.mongodb.net/gpc-itarsi';

console.log('Server starting with PORT:', PORT);
console.log('JWT_SECRET configured:', JWT_SECRET ? 'Yes (value hidden)' : 'No');
console.log('MONGODB_URI configured:', MONGODB_URI ? 'Yes (value hidden)' : 'No');

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Continuing with mock data...');
  });

// Apply universal CORS middleware first - before any other middleware
const universalCors = require('./middleware/universal-cors');
app.use(universalCors);

console.log('CORS middleware applied');

// Log incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Parse JSON request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log('Creating uploads directory at:', uploadsDir);
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create subdirectories for different types of uploads
const uploadSubdirs = ['profiles', 'courses', 'gallery', 'notices', 'study-materials', 'forms', 'applications', 'newsletters'];
uploadSubdirs.forEach(dir => {
  const dirPath = path.join(uploadsDir, dir);
  if (!fs.existsSync(dirPath)) {
    console.log('Creating upload subdirectory:', dir);
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Ensure public directory exists
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  console.log('Creating public directory at:', publicDir);
  fs.mkdirSync(publicDir, { recursive: true });
}

// Import utilities
const { getCacheStats, resetCacheStats } = require('./utils/cache');
const { getMetrics, resetMetrics, configure: configurePerformance } = require('./utils/performance');
const { authenticateToken, authorize } = require('./middleware/auth');

// Configure performance monitoring
configurePerformance({
  slowQueryThreshold: 200, // ms
  maxSlowQueries: 50,
  enabled: true
});

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const studentRoutes = require('./routes/students');
const teacherRoutes = require('./routes/teachers');
const teacherProfileRoutes = require('./routes/teacherProfile');
const teacherDashboardRoutes = require('./routes/teacherDashboard');
const courseRoutes = require('./routes/courses');
const noticeRoutes = require('./routes/notices');
const galleryRoutes = require('./routes/gallery');
const studyMaterialRoutes = require('./routes/studyMaterials');
const documentRoutes = require('./routes/documents');
const overviewRoutes = require('./routes/overview');
const chatbotRoutes = require('./routes/chatbot');
const facultyRoutes = require('./routes/faculty');
const hodRoutes = require('./routes/hod');
const customButtonRoutes = require('./routes/custom-buttons');
const notificationRoutes = require('./routes/notifications');
const calendarEventRoutes = require('./routes/calendar-events');
const contactInfoRoutes = require('./routes/contact-info');
const adminRoutes = require('./routes/admin');
const developerRoutes = require('./routes/developer');
const admissionDetailsRoutes = require('./routes/admission-details');
const settingsRoutes = require('./routes/settings');
const passwordResetRoutes = require('./routes/passwordReset');

// Special handling for problematic routes
app.options('/api/contact-info', (req, res) => {
  console.log('Special handling for OPTIONS request to /api/contact-info');

  // Get the origin from the request headers
  const origin = req.headers.origin;

  // List of allowed origins - make sure to include ALL possible frontend origins
  const allowedOrigins = [
    'https://gpc-itarsi-9cl7.onrender.com',
    'https://gpc-itarsi-developer.onrender.com',
    'https://gpc-itarsi-backend-1wu5.onrender.com',
    'https://gpc-itarsi-backend-8dod.onrender.com',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://developer.anmol.onrender.com',
    'https://developer.anmol.onrender.com',
    'http://anmol.onrender.com/developer',
    'https://anmol.onrender.com/developer',
    // Add any other origins that might be accessing the API
    'https://gpc-itarsi.onrender.com'
  ];

  // Check if the request origin is in our list of allowed origins
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    console.log(`Contact Info OPTIONS - Allowing specific origin: ${origin}`);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
    console.log(`Contact Info OPTIONS - Using wildcard origin`);
  }

  res.header('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(204).send();
});

app.options('/api/custom-buttons', (req, res) => {
  console.log('Special handling for OPTIONS request to /api/custom-buttons');

  // Get the origin from the request headers
  const origin = req.headers.origin;

  // List of allowed origins - make sure to include ALL possible frontend origins
  const allowedOrigins = [
    'https://gpc-itarsi-9cl7.onrender.com',
    'https://gpc-itarsi-developer.onrender.com',
    'https://gpc-itarsi-backend-1wu5.onrender.com',
    'https://gpc-itarsi-backend-8dod.onrender.com',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://developer.anmol.onrender.com',
    'https://developer.anmol.onrender.com',
    'http://anmol.onrender.com/developer',
    'https://anmol.onrender.com/developer',
    // Add any other origins that might be accessing the API
    'https://gpc-itarsi.onrender.com'
  ];

  // Check if the request origin is in our list of allowed origins
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    console.log(`Custom Buttons OPTIONS - Allowing specific origin: ${origin}`);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
    console.log(`Custom Buttons OPTIONS - Using wildcard origin`);
  }

  res.header('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(204).send();
});

// Special handling for notices route - this is the most problematic one
app.options('/api/notices', (req, res) => {
  console.log('Special handling for OPTIONS request to /api/notices');

  // Get the origin from the request headers
  const origin = req.headers.origin;

  // List of allowed origins - make sure to include ALL possible frontend origins
  const allowedOrigins = [
    'https://gpc-itarsi-9cl7.onrender.com',
    'https://gpc-itarsi-developer.onrender.com',
    'https://gpc-itarsi-backend-1wu5.onrender.com',
    'https://gpc-itarsi-backend-8dod.onrender.com',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://developer.anmol.onrender.com',
    'https://developer.anmol.onrender.com',
    'http://anmol.onrender.com/developer',
    'https://anmol.onrender.com/developer',
    // Add any other origins that might be accessing the API
    'https://gpc-itarsi.onrender.com'
  ];

  // Check if the request origin is in our list of allowed origins
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    console.log(`Notices OPTIONS - Allowing specific origin: ${origin}`);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
    console.log(`Notices OPTIONS - Using wildcard origin`);
  }

  res.header('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(204).send();
});

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/teacher-profile', teacherProfileRoutes);
app.use('/api/teacher-dashboard', teacherDashboardRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/password-reset', passwordResetRoutes);
// Apply special CORS middleware for notices route
const noticesCorsMiddleware = require('./middleware/notices-cors');
app.use('/api/notices', noticesCorsMiddleware, noticeRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/study-materials', studyMaterialRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/overview', overviewRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/hod', hodRoutes);
app.use('/api/custom-buttons', customButtonRoutes);
app.use('/api/admin/custom-buttons', customButtonRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/calendar-events', calendarEventRoutes);
app.use('/api/contact-info', contactInfoRoutes);
app.use('/api/admission-details', admissionDetailsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/developer', developerRoutes);
app.use('/api/settings', settingsRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to GPC Itarsi MongoDB Backend API' });
});

// Performance monitoring route (admin only)
app.get('/api/performance', authenticateToken, authorize(['admin', 'developer']), (req, res) => {
  try {
    // Get performance metrics
    const metrics = getMetrics();

    // Get cache statistics
    const cacheStats = getCacheStats();

    // Update cache metrics in performance metrics
    metrics.cache = cacheStats;

    res.json({
      metrics,
      timestamp: new Date(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ message: 'Error fetching performance metrics' });
  }
});

// Reset performance metrics (admin only)
app.post('/api/performance/reset', authenticateToken, authorize(['admin', 'developer']), (req, res) => {
  try {
    // Reset performance metrics
    resetMetrics();

    // Reset cache statistics
    resetCacheStats();

    res.json({ message: 'Performance metrics reset successfully' });
  } catch (error) {
    console.error('Error resetting performance metrics:', error);
    res.status(500).json({ message: 'Error resetting performance metrics' });
  }
});

// Handle OPTIONS requests for all routes
app.options('*', (req, res) => {
  console.log('Catch-all OPTIONS handler for:', req.path);
  console.log('Request origin:', req.headers.origin);

  // Get the origin from the request headers
  const origin = req.headers.origin;

  // List of allowed origins - make sure to include ALL possible frontend origins
  const allowedOrigins = [
    'https://gpc-itarsi-9cl7.onrender.com',
    'https://gpc-itarsi-developer.onrender.com',
    'https://gpc-itarsi-backend-1wu5.onrender.com',
    'https://gpc-itarsi-backend-8dod.onrender.com',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://developer.anmol.onrender.com',
    'https://developer.anmol.onrender.com',
    'http://anmol.onrender.com/developer',
    'https://anmol.onrender.com/developer',
    // Add any other origins that might be accessing the API
    'https://gpc-itarsi.onrender.com'
  ];

  // Check if the request origin is in our list of allowed origins
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    console.log(`Catch-all OPTIONS - Allowing specific origin: ${origin}`);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
    console.log(`Catch-all OPTIONS - Using wildcard origin`);
  }

  res.header('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(204).send();
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
