const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create subdirectories for different types of uploads
const uploadSubdirs = ['profiles', 'courses', 'gallery', 'notices', 'study-materials', 'forms', 'applications', 'newsletters'];
uploadSubdirs.forEach(dir => {
  const dirPath = path.join(uploadsDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('File upload request received for URL:', req.originalUrl);
    console.log('File details:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype
    });

    // Determine the destination folder based on the route
    let destFolder = uploadsDir;
    if (req.originalUrl.includes('/courses') || req.originalUrl.includes('/add-course') || req.originalUrl.includes('/update-course')) {
      destFolder = path.join(uploadsDir, 'courses');
      console.log('Destination folder set to courses');
    } else if (req.originalUrl.includes('/gallery')) {
      destFolder = path.join(uploadsDir, 'gallery');
      console.log('Destination folder set to gallery');
    } else if (req.originalUrl.includes('/notices')) {
      destFolder = path.join(uploadsDir, 'notices');
      console.log('Destination folder set to notices');
    } else if (req.originalUrl.includes('/study-material') || req.originalUrl.includes('/upload-study-material')) {
      destFolder = path.join(uploadsDir, 'study-materials');
      console.log('Destination folder set to study-materials');
    } else if (req.originalUrl.includes('/profile') || req.originalUrl.includes('/update-profile')) {
      destFolder = path.join(uploadsDir, 'profiles');
      console.log('Destination folder set to profiles');
    } else if (req.originalUrl.includes('/forms') || req.originalUrl.includes('/applications')) {
      destFolder = path.join(uploadsDir, 'forms');
      console.log('Destination folder set to forms');
    } else if (req.originalUrl.includes('/newsletters')) {
      destFolder = path.join(uploadsDir, 'newsletters');
      console.log('Destination folder set to newsletters');
    }

    console.log('Final destination folder:', destFolder);

    // Check if destination folder exists, create if not
    if (!fs.existsSync(destFolder)) {
      console.log('Creating destination folder:', destFolder);
      fs.mkdirSync(destFolder, { recursive: true });
    }

    cb(null, destFolder);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const newFilename = file.fieldname + '-' + uniqueSuffix + ext;

    console.log('Generated filename:', newFilename);
    cb(null, newFilename);
  }
});

// File filter to allow only certain file types
const fileFilter = (req, file, cb) => {
  console.log('Checking file type for:', file.originalname);
  console.log('File mimetype:', file.mimetype);

  // Accept images, documents, and PDFs
  if (file.mimetype.startsWith('image/') ||
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-powerpoint' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      file.mimetype === 'text/plain') {
    console.log('File type accepted for:', file.originalname);
    cb(null, true);
  } else {
    console.error('Unsupported file type rejected:', file.mimetype, 'for file:', file.originalname);
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB file size limit
  }
});

module.exports = upload;
