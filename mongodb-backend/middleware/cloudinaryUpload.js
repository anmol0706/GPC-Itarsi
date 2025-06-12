const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Verify Cloudinary configuration
console.log('Cloudinary configuration:');
console.log('- Cloud name:', process.env.CLOUDINARY_CLOUD_NAME ? process.env.CLOUDINARY_CLOUD_NAME : 'Not set');
console.log('- API key configured:', process.env.CLOUDINARY_API_KEY ? 'Yes (hidden)' : 'No');
console.log('- API secret configured:', process.env.CLOUDINARY_API_SECRET ? 'Yes (hidden)' : 'No');

// Test Cloudinary connection
cloudinary.api.ping((error, result) => {
  if (error) {
    console.error('Cloudinary connection test failed:', error);
    console.log('Cloudinary configuration details:');
    console.log('- Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('- API key:', process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.substring(0, 4) + '...' : 'Not set');
    console.log('- API secret:', process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.substring(0, 4) + '...' : 'Not set');
    console.log('- CLOUDINARY_URL:', process.env.CLOUDINARY_URL ? 'Set (hidden)' : 'Not set');
  } else {
    console.log('Cloudinary connection test successful:', result.status);
  }
});

// Create different folders for different types of uploads
const getFolder = (req) => {
  console.log('Determining Cloudinary folder for URL:', req.originalUrl);

  let folder = 'gpc-itarsi/misc';

  if (req.originalUrl.includes('/courses') || req.originalUrl.includes('/add-course') || req.originalUrl.includes('/update-course')) {
    folder = 'gpc-itarsi/courses';
  } else if (req.originalUrl.includes('/gallery')) {
    folder = 'gpc-itarsi/gallery';
  } else if (req.originalUrl.includes('/notices')) {
    folder = 'gpc-itarsi/notices';
  } else if (req.originalUrl.includes('/study-material') || req.originalUrl.includes('/upload-study-material')) {
    folder = 'gpc-itarsi/study-materials';
  } else if (req.originalUrl.includes('/profile') || req.originalUrl.includes('/update-profile') || req.originalUrl.includes('/profile-cloudinary')) {
    folder = 'gpc-itarsi/profiles';
  } else if (req.originalUrl.includes('/forms') || req.originalUrl.includes('/applications')) {
    folder = 'gpc-itarsi/forms';
  } else if (req.originalUrl.includes('/newsletters')) {
    folder = 'gpc-itarsi/newsletters';
  } else if (req.originalUrl.includes('/principal-message')) {
    folder = 'gpc-itarsi/principal';
  }

  console.log('Selected Cloudinary folder:', folder);
  return folder;
};

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    console.log('Setting up Cloudinary upload parameters for file:', file.originalname);

    const publicId = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    console.log('Generated Cloudinary public_id:', publicId);

    const params = {
      folder: getFolder(req),
      // Remove allowed_formats restriction to allow any file type
      public_id: publicId,
      resource_type: 'auto', // 'auto' will detect if it's an image or raw file
      // Only apply transformations to images
      transformation: file.mimetype.startsWith('image/') ? [
        { width: 500, height: 500, crop: 'limit' }
      ] : []
    };

    console.log('Cloudinary upload parameters:', JSON.stringify(params, null, 2));
    return params;
  }
});

// File filter to allow only certain file types
const fileFilter = (req, file, cb) => {
  console.log('Checking file type for Cloudinary upload:', file.originalname);
  console.log('File mimetype:', file.mimetype);
  console.log('Upload route:', req.originalUrl);

  // Get file extension from original name
  const fileExtension = file.originalname.split('.').pop().toLowerCase();
  console.log('File extension:', fileExtension);

  // List of allowed extensions - expanded to include more formats
  const allowedExtensions = [
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp',
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'txt', 'rtf', 'csv', 'zip', 'rar', '7z', 'tar', 'gz',
    'mp3', 'mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv',
    'html', 'htm', 'css', 'js', 'json', 'xml'
  ];

  // Accept based on extension as a fallback if mimetype check fails
  const isAllowedExtension = allowedExtensions.includes(fileExtension);

  // Accept images, documents, and PDFs based on mimetype
  const isAllowedMimetype =
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('application/') ||
      file.mimetype.startsWith('text/') ||
      file.mimetype.startsWith('audio/') ||
      file.mimetype.startsWith('video/') ||
      file.mimetype === 'application/octet-stream'; // Accept binary files

  // Special handling for study materials route
  if (req.originalUrl.includes('/study-material') || req.originalUrl.includes('/upload-study-material')) {
    // Be more permissive for study materials
    console.log('Study materials route detected - accepting all files');

    // For study materials, accept all files regardless of type
    console.log('File accepted for study materials:', file.originalname);
    return cb(null, true);
  }

  if (isAllowedMimetype || isAllowedExtension) {
    console.log('File type accepted for Cloudinary upload:', file.originalname);
    cb(null, true);
  } else {
    console.error('Unsupported file type rejected for Cloudinary upload:', file.mimetype, 'for file:', file.originalname);
    console.error('File extension check result:', isAllowedExtension ? 'Allowed' : 'Not allowed');
    console.error('Mimetype check result:', isAllowedMimetype ? 'Allowed' : 'Not allowed');
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed file types are: images, PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, and TXT.`), false);
  }
};

// Create multer upload instance with Cloudinary storage
const cloudinaryUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB file size limit
  }
});

// Import local upload middleware as fallback
const upload = require('./upload');
const fs = require('fs');

// Create a wrapper middleware to handle Multer errors
const handleCloudinaryUpload = (field) => {
  return (req, res, next) => {
    // First try Cloudinary upload
    const cloudUpload = cloudinaryUpload.single(field);

    cloudUpload(req, res, (cloudErr) => {
      if (cloudErr) {
        console.error('Cloudinary upload error:', cloudErr);

        if (cloudErr.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File too large. Maximum size is 50MB.' });
        }

        console.log('Falling back to local storage...');

        // If Cloudinary fails, fall back to local storage
        const localUpload = upload.single(field);

        localUpload(req, res, (localErr) => {
          if (localErr) {
            console.error('Local upload error:', localErr);
            return res.status(400).json({ message: `File upload error: ${localErr.message}` });
          }

          // Modify the file object to mimic Cloudinary response
          if (req.file) {
            // Create a path property that mimics Cloudinary URL format
            const relativePath = req.file.path.replace(/\\/g, '/').split('uploads/')[1];
            req.file.path = `/uploads/${relativePath}`;
            req.file.filename = path.basename(req.file.path);

            console.log('Successfully uploaded to local storage:', req.file.path);
          }

          next();
        });
      } else {
        console.log('Successfully uploaded to Cloudinary:', req.file ? req.file.path : 'No file');
        next();
      }
    });
  };
};

module.exports = {
  cloudinaryUpload,
  cloudinary,
  handleCloudinaryUpload
};
