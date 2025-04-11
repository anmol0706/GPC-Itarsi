const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');
const { authenticateToken, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all study materials (admin and teacher access)
router.get('/', authenticateToken, authorize(['admin', 'teacher']), (req, res) => {
  try {
    const materials = dataService.getStudyMaterials();
    res.json(materials);
  } catch (error) {
    console.error('Error fetching study materials:', error);
    res.status(500).json({ message: 'Failed to fetch study materials' });
  }
});

// Get public study materials (no authentication required)
router.get('/public', (req, res) => {
  try {
    const materials = dataService.getStudyMaterials();
    res.json(materials);
  } catch (error) {
    console.error('Error fetching public study materials:', error);
    res.status(500).json({ message: 'Failed to fetch study materials' });
  }
});

// Get study materials for a specific class (student access)
router.get('/class/:className', authenticateToken, authorize(['student']), (req, res) => {
  try {
    const { className } = req.params;
    const materials = dataService.getStudyMaterialsByClass(className);
    res.json(materials);
  } catch (error) {
    console.error('Error fetching study materials by class:', error);
    res.status(500).json({ message: 'Failed to fetch study materials' });
  }
});

// Upload study material (admin access)
router.post('/upload', authenticateToken, authorize(['admin']), upload.single('file'), (req, res) => {
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

    const newMaterial = dataService.addStudyMaterial({
      title,
      description: description || '',
      subject,
      class: className,
      fileUrl: req.file.filename,
      uploadedBy: user.username,
      uploadDate: new Date()
    });

    res.status(201).json(newMaterial);
  } catch (error) {
    console.error('Error uploading study material:', error);
    res.status(500).json({ message: 'Failed to upload study material' });
  }
});

// Delete study material (admin access)
router.delete('/:id', authenticateToken, authorize(['admin']), (req, res) => {
  try {
    const { id } = req.params;
    const deleted = dataService.deleteStudyMaterial(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Study material not found' });
    }

    res.json({ message: 'Study material deleted successfully' });
  } catch (error) {
    console.error('Error deleting study material:', error);
    res.status(500).json({ message: 'Failed to delete study material' });
  }
});

module.exports = router;
