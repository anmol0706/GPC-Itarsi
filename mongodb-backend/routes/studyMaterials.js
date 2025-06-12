const express = require('express');
const router = express.Router();
const path = require('path');
const StudyMaterial = require('../models/StudyMaterial');
const User = require('../models/User');
const { authenticateToken, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { cloudinaryUpload, cloudinary, handleCloudinaryUpload } = require('../middleware/cloudinaryUpload');
const { upload: simpleUpload, cloudinary: simpleCloudinary } = require('../middleware/cloudinaryUpload-simple');
const compressFile = require('../middleware/fileCompression');
const compressAndUpload = require('../middleware/compressAndUpload');

// Get all study materials (admin and teacher access)
router.get('/', authenticateToken, authorize(['admin', 'teacher']), async (req, res) => {
  try {
    const materials = await StudyMaterial.find().sort({ createdAt: -1 }).populate('uploadedBy', 'name role');
    res.json(materials);
  } catch (error) {
    console.error('Error fetching study materials:', error);
    res.status(500).json({ message: 'Failed to fetch study materials' });
  }
});

// Get all study materials (public access, no authentication)
router.get('/all', async (req, res) => {
  try {
    const materials = await StudyMaterial.find().sort({ createdAt: -1 }).populate('uploadedBy', 'name role');
    res.json(materials);
  } catch (error) {
    console.error('Error fetching study materials:', error);
    res.status(500).json({ message: 'Failed to fetch study materials' });
  }
});

// Get study materials for a specific class (student access)
router.get('/class/:className', authenticateToken, authorize(['student']), async (req, res) => {
  try {
    const { className } = req.params;
    const materials = await StudyMaterial.find({ class: className }).sort({ createdAt: -1 }).populate('uploadedBy', 'name role');
    res.json(materials);
  } catch (error) {
    console.error('Error fetching study materials for class:', error);
    res.status(500).json({ message: 'Failed to fetch study materials' });
  }
});

// Get study material by ID
router.get('/:id', async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id).populate('uploadedBy', 'name role');

    if (!material) {
      return res.status(404).json({ message: 'Study material not found' });
    }

    res.json(material);
  } catch (error) {
    console.error('Error fetching study material:', error);
    res.status(500).json({ message: 'Failed to fetch study material' });
  }
});

// Upload study material (admin and teacher access) - REDIRECTS TO CLOUDINARY
router.post('/upload', authenticateToken, authorize(['admin', 'teacher']), (req, res, next) => {
  console.log('Starting study material upload with compression');
  // Add request ID for tracking
  req.uploadId = Date.now().toString();
  console.log(`Upload ID: ${req.uploadId}`);

  // Call the compressAndUpload middleware
  const uploadMiddleware = compressAndUpload('file');
  uploadMiddleware(req, res, next);
}, async (req, res) => {
  try {
    console.log('Processing study material upload request');
    console.log('Request body:', req.body);

    // If we get here, the file upload and compression were successful
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('Request file:', req.file);
    const { title, description, subject, class: className } = req.body;

    if (!title || !subject || !className) {
      return res.status(400).json({ message: 'Title, subject, and class are required' });
    }

    // Determine file type
    let fileType = 'other';
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();

    console.log('File extension:', fileExtension);
    console.log('File mimetype:', req.file.mimetype);

    // Validate file type by both extension and mimetype
    const validExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'rtf', 'csv', 'jpg', 'jpeg', 'png', 'gif', 'zip', 'rar'];

    if (!validExtensions.includes(fileExtension)) {
      console.error(`Invalid file extension: ${fileExtension}`);
      return res.status(400).json({
        message: 'File upload error',
        error: `Invalid file extension: ${fileExtension}`,
        details: 'Please upload a file with one of these extensions: pdf, doc, docx, ppt, pptx, xls, xlsx, txt, rtf, csv, jpg, jpeg, png, gif, zip, rar'
      });
    }

    // Set file type based on extension
    if (['pdf'].includes(fileExtension)) {
      fileType = 'pdf';
    } else if (['doc', 'docx', 'rtf'].includes(fileExtension)) {
      fileType = 'doc';
    } else if (['ppt', 'pptx'].includes(fileExtension)) {
      fileType = 'ppt';
    } else if (['xls', 'xlsx', 'csv'].includes(fileExtension)) {
      fileType = 'xls';
    } else if (['txt'].includes(fileExtension)) {
      fileType = 'txt';
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      fileType = 'image';
    } else if (['zip', 'rar'].includes(fileExtension)) {
      fileType = 'archive';
    }

    console.log('Cloudinary upload successful:', req.file);

    // Validate file path
    if (!req.file.path) {
      console.error('Missing file path in uploaded file object');
      return res.status(500).json({ message: 'Invalid file upload response from server' });
    }

    // Create new study material with Cloudinary URL
    const material = new StudyMaterial({
      title,
      description: description || '',
      subject,
      class: className,
      file: req.file.path, // Cloudinary URL
      uploadedBy: req.user.id,
      fileType,
      cloudinaryPublicId: req.file.filename || path.basename(req.file.path) // Store Cloudinary public ID for future reference
    });

    await material.save();

    // Populate the uploaded by field for the response
    await material.populate('uploadedBy', 'name role');

    res.status(201).json(material);
  } catch (error) {
    console.error('Error uploading study material to Cloudinary:', error);

    // Log detailed error information
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      uploadId: req.uploadId || 'No upload ID'
    });

    // Check if it's a Cloudinary error
    if (error.http_code) {
      return res.status(400).json({
        message: 'Cloudinary upload failed',
        error: error.message || 'Cloudinary error',
        details: 'There was a problem with the cloud storage service. Please try again later.'
      });
    }

    res.status(500).json({
      message: 'Failed to upload study material',
      error: error.message || 'Unknown server error',
      details: 'There was a problem processing your upload. Please try again with a different file or contact support.',
      uploadId: req.uploadId || 'No upload ID'
    });
  }
});

// Update study material (admin and original uploader)
router.put('/:id', authenticateToken, compressAndUpload('file'), async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ message: 'Study material not found' });
    }

    // Check if user is admin or the original uploader
    if (req.user.role !== 'admin' && material.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this study material' });
    }

    // Update fields
    const fieldsToUpdate = ['title', 'description', 'subject', 'class'];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        material[field] = req.body[field];
      }
    });

    // Update file if provided
    if (req.file) {
      // If there was a previous Cloudinary file, delete it
      if (material.cloudinaryPublicId) {
        try {
          await cloudinary.uploader.destroy(material.cloudinaryPublicId);
          console.log(`Deleted previous file from Cloudinary: ${material.cloudinaryPublicId}`);
        } catch (err) {
          console.error('Error deleting previous file from Cloudinary:', err);
          // Continue with update even if Cloudinary deletion fails
        }
      }

      // Update with new Cloudinary file
      material.file = req.file.path;
      material.cloudinaryPublicId = req.file.filename;

      // Update file type
      const fileExtension = req.file.originalname.split('.').pop().toLowerCase();

      console.log('File extension for update:', fileExtension);
      console.log('File mimetype for update:', req.file.mimetype);

      // Validate file type by extension
      const validExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'rtf', 'csv', 'jpg', 'jpeg', 'png', 'gif', 'zip', 'rar'];

      if (!validExtensions.includes(fileExtension)) {
        console.error(`Invalid file extension for update: ${fileExtension}`);
        return res.status(400).json({
          message: 'File upload error',
          error: `Invalid file extension: ${fileExtension}`,
          details: 'Please upload a file with one of these extensions: pdf, doc, docx, ppt, pptx, xls, xlsx, txt, rtf, csv, jpg, jpeg, png, gif, zip, rar'
        });
      }

      if (['pdf'].includes(fileExtension)) {
        material.fileType = 'pdf';
      } else if (['doc', 'docx', 'rtf'].includes(fileExtension)) {
        material.fileType = 'doc';
      } else if (['ppt', 'pptx'].includes(fileExtension)) {
        material.fileType = 'ppt';
      } else if (['xls', 'xlsx', 'csv'].includes(fileExtension)) {
        material.fileType = 'xls';
      } else if (['txt'].includes(fileExtension)) {
        material.fileType = 'txt';
      } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
        material.fileType = 'image';
      } else if (['zip', 'rar'].includes(fileExtension)) {
        material.fileType = 'archive';
      } else {
        material.fileType = 'other';
      }
    }

    material.updatedAt = Date.now();
    await material.save();

    // Populate the uploaded by field for the response
    await material.populate('uploadedBy', 'name role');

    res.json(material);
  } catch (error) {
    console.error('Error updating study material:', error);
    res.status(500).json({ message: 'Failed to update study material', error: error.message });
  }
});

// Upload study material with Cloudinary (admin and teacher access)
router.post('/upload-cloudinary', authenticateToken, authorize(['admin', 'teacher']), (req, res, next) => {
  console.log('Starting study material upload with Cloudinary');
  // Add request ID for tracking
  req.uploadId = Date.now().toString();
  console.log(`Upload ID: ${req.uploadId}`);

  // Call the compressAndUpload middleware
  const uploadMiddleware = compressAndUpload('file');
  uploadMiddleware(req, res, next);
}, async (req, res) => {
  try {
    console.log('Processing study material upload request');
    console.log('Request body:', req.body);
    console.log('Request user:', req.user ? { id: req.user.id, role: req.user.role } : 'No user');

    // If we get here, the file upload and compression were successful
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('Request file:', req.file);
    const { title, description, subject, class: className } = req.body;

    // Detailed validation with specific error messages
    const missingFields = [];
    if (!title) missingFields.push('title');
    if (!subject) missingFields.push('subject');
    if (!className) missingFields.push('class');

    if (missingFields.length > 0) {
      console.error(`Missing required fields: ${missingFields.join(', ')}`);
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields
      });
    }

    // Determine file type
    let fileType = 'other';
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();

    console.log('File extension:', fileExtension);
    console.log('File mimetype:', req.file.mimetype);

    // Validate file type by both extension and mimetype
    const validExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'rtf', 'csv', 'jpg', 'jpeg', 'png', 'gif', 'zip', 'rar'];

    if (!validExtensions.includes(fileExtension)) {
      console.error(`Invalid file extension: ${fileExtension}`);
      return res.status(400).json({
        message: 'File upload error',
        error: `Invalid file extension: ${fileExtension}`,
        details: 'Please upload a file with one of these extensions: pdf, doc, docx, ppt, pptx, xls, xlsx, txt, rtf, csv, jpg, jpeg, png, gif, zip, rar'
      });
    }

    // Set file type based on extension
    if (['pdf'].includes(fileExtension)) {
      fileType = 'pdf';
    } else if (['doc', 'docx', 'rtf'].includes(fileExtension)) {
      fileType = 'doc';
    } else if (['ppt', 'pptx'].includes(fileExtension)) {
      fileType = 'ppt';
    } else if (['xls', 'xlsx', 'csv'].includes(fileExtension)) {
      fileType = 'xls';
    } else if (['txt'].includes(fileExtension)) {
      fileType = 'txt';
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      fileType = 'image';
    } else if (['zip', 'rar'].includes(fileExtension)) {
      fileType = 'archive';
    }

    console.log('Cloudinary upload successful:', req.file);

    // Validate file path
    if (!req.file.path) {
      console.error('Missing file path in uploaded file object');
      return res.status(500).json({ message: 'Invalid file upload response from server' });
    }

    // Create new study material with Cloudinary URL
    const material = new StudyMaterial({
      title,
      description: description || '',
      subject,
      class: className,
      file: req.file.path, // Cloudinary URL
      uploadedBy: req.user.id,
      fileType,
      cloudinaryPublicId: req.file.filename || path.basename(req.file.path) // Store Cloudinary public ID for future reference
    });

    await material.save();

    // Populate the uploaded by field for the response
    await material.populate('uploadedBy', 'name role');

    res.status(201).json(material);
  } catch (error) {
    console.error('Error uploading study material to Cloudinary:', error);

    // Log detailed error information
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      uploadId: req.uploadId || 'No upload ID'
    });

    // Check if it's a Cloudinary error
    if (error.http_code) {
      return res.status(400).json({
        message: 'Cloudinary upload failed',
        error: error.message || 'Cloudinary error',
        details: 'There was a problem with the cloud storage service. Please try again later.'
      });
    }

    res.status(500).json({
      message: 'Failed to upload study material',
      error: error.message || 'Unknown server error',
      details: 'There was a problem processing your upload. Please try again with a different file or contact support.',
      uploadId: req.uploadId || 'No upload ID'
    });
  }
});

// Delete study material (admin and original uploader)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    console.log('Delete study material request for ID:', req.params.id);
    console.log('User making request:', req.user ? { id: req.user.id, role: req.user.role } : 'No user');

    const material = await StudyMaterial.findById(req.params.id);

    if (!material) {
      console.log('Study material not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Study material not found' });
    }

    console.log('Found study material:', {
      id: material._id,
      title: material.title,
      uploadedBy: material.uploadedBy
    });

    // Check if user is admin or teacher (teachers can delete any material)
    if (req.user.role === 'admin' || req.user.role === 'teacher') {
      console.log(`User is ${req.user.role}, allowing deletion`);
    }
    // Check if user is the original uploader
    else if (material.uploadedBy && material.uploadedBy.toString() === req.user.id) {
      console.log('User is the original uploader, allowing deletion');
    }
    else {
      console.log('User not authorized to delete this material');
      console.log('Material uploadedBy:', material.uploadedBy ? material.uploadedBy.toString() : 'none');
      console.log('User ID:', req.user.id);
      return res.status(403).json({ message: 'Not authorized to delete this study material' });
    }

    // If the file was uploaded to Cloudinary, delete it from there
    if (material.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(material.cloudinaryPublicId);
        console.log(`Deleted file from Cloudinary: ${material.cloudinaryPublicId}`);
      } catch (err) {
        console.error('Error deleting file from Cloudinary:', err);
        // Continue with deletion even if Cloudinary deletion fails
      }
    }

    await StudyMaterial.findByIdAndDelete(req.params.id);
    console.log('Study material deleted successfully');

    res.json({ message: 'Study material deleted successfully' });
  } catch (error) {
    console.error('Error deleting study material:', error);
    res.status(500).json({ message: 'Failed to delete study material' });
  }
});

// Upload study material with simple Cloudinary middleware (admin and teacher access)
router.post('/upload-simple', authenticateToken, authorize(['admin', 'teacher']), (req, res, next) => {
  // Custom middleware to handle the upload with better error handling
  const handleSimpleUpload = simpleUpload.handleUpload('file');
  handleSimpleUpload(req, res, next);
}, async (req, res) => {
  try {
    console.log('Processing study material upload with simple middleware');
    console.log('Request body:', req.body);
    console.log('Request user:', req.user ? { id: req.user.id, role: req.user.role } : 'No user');

    // If we get here, the file upload was successful
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('Request file:', req.file);
    const { title, description, subject, class: className } = req.body;

    // Detailed validation with specific error messages
    const missingFields = [];
    if (!title) missingFields.push('title');
    if (!subject) missingFields.push('subject');
    if (!className) missingFields.push('class');

    if (missingFields.length > 0) {
      console.error(`Missing required fields: ${missingFields.join(', ')}`);
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields
      });
    }

    // Determine file type
    let fileType = 'other';
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();

    console.log('File extension:', fileExtension);
    console.log('File mimetype:', req.file.mimetype);

    // Set file type based on extension
    if (['pdf'].includes(fileExtension)) {
      fileType = 'pdf';
    } else if (['doc', 'docx', 'rtf'].includes(fileExtension)) {
      fileType = 'doc';
    } else if (['ppt', 'pptx'].includes(fileExtension)) {
      fileType = 'ppt';
    } else if (['xls', 'xlsx', 'csv'].includes(fileExtension)) {
      fileType = 'xls';
    } else if (['txt'].includes(fileExtension)) {
      fileType = 'txt';
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      fileType = 'image';
    } else if (['zip', 'rar'].includes(fileExtension)) {
      fileType = 'archive';
    }

    console.log('Simple Cloudinary upload successful:', req.file);

    // Create new study material with Cloudinary URL
    const material = new StudyMaterial({
      title,
      description: description || '',
      subject,
      class: className,
      file: req.file.path, // Cloudinary URL
      uploadedBy: req.user.id,
      fileType,
      cloudinaryPublicId: req.file.filename || path.basename(req.file.path) // Store Cloudinary public ID for future reference
    });

    await material.save();

    // Populate the uploaded by field for the response
    await material.populate('uploadedBy', 'name role');

    res.status(201).json(material);
  } catch (error) {
    console.error('Error uploading study material with simple middleware:', error);

    // Log detailed error information
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });

    // Check if it's a Cloudinary error
    if (error.http_code) {
      return res.status(400).json({
        message: 'Cloudinary upload failed',
        error: error.message || 'Cloudinary error',
        details: 'There was a problem with the cloud storage service. Please try again later.'
      });
    }

    res.status(500).json({
      message: 'Failed to upload study material',
      error: error.message || 'Unknown server error',
      details: 'There was a problem processing your upload. Please try again with a different file or contact support.'
    });
  }
});

module.exports = router;
