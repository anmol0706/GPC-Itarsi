const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const { authenticateToken, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all documents
router.get('/', async (req, res) => {
  try {
    const documents = await Document.find().sort({ createdAt: -1 }).populate('uploadedBy', 'name role');
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Failed to fetch documents' });
  }
});

// Get documents by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const documents = await Document.find({ category }).sort({ createdAt: -1 }).populate('uploadedBy', 'name role');
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents by category:', error);
    res.status(500).json({ message: 'Failed to fetch documents' });
  }
});

// Get document by ID
router.get('/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate('uploadedBy', 'name role');
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ message: 'Failed to fetch document' });
  }
});

// Upload document (admin only)
router.post('/', authenticateToken, authorize(['admin']), upload.single('file'), async (req, res) => {
  try {
    console.log('Document upload request received from user:', req.user.username);
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
      file: req.file ? req.file.filename : undefined,
      driveUrl: driveUrl || undefined,
      uploadedBy: req.user.id
    });

    await document.save();
    
    // Populate the uploaded by field for the response
    await document.populate('uploadedBy', 'name role');
    
    console.log('Document uploaded successfully:', document.title);
    res.status(201).json(document);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ message: 'Failed to upload document', error: error.message });
  }
});

// Update document (admin only)
router.put('/:id', authenticateToken, authorize(['admin']), upload.single('file'), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const { title, description, type, category, driveUrl } = req.body;

    // Validate type change
    if (type && type !== document.type) {
      if (type === 'file' && !req.file && !document.file) {
        return res.status(400).json({ message: 'File is required when changing type to file' });
      }
      if (type === 'drive_link' && !driveUrl && !document.driveUrl) {
        return res.status(400).json({ message: 'Drive URL is required when changing type to drive_link' });
      }
    }

    // Update fields
    if (title) document.title = title;
    if (description !== undefined) document.description = description;
    if (category) document.category = category;
    
    // Update type and related fields
    if (type) {
      document.type = type;
      if (type === 'drive_link' && driveUrl) {
        document.driveUrl = driveUrl;
      } else if (type === 'file' && req.file) {
        document.file = req.file.filename;
      }
    } else {
      // If type is not changing, update the appropriate field
      if (document.type === 'drive_link' && driveUrl) {
        document.driveUrl = driveUrl;
      } else if (document.type === 'file' && req.file) {
        document.file = req.file.filename;
      }
    }

    document.updatedAt = Date.now();
    await document.save();
    
    // Populate the uploaded by field for the response
    await document.populate('uploadedBy', 'name role');
    
    res.json(document);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ message: 'Failed to update document', error: error.message });
  }
});

// Delete document (admin only)
router.delete('/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    await Document.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Failed to delete document' });
  }
});

module.exports = router;
