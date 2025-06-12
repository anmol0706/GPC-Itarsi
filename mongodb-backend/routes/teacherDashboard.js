const express = require('express');
const router = express.Router();
const StudyMaterial = require('../models/StudyMaterial');
const User = require('../models/User');
const { authenticateToken, authorize } = require('../middleware/auth');

// Get all study materials for teacher dashboard
router.get('/study-materials', authenticateToken, authorize(['teacher']), async (req, res) => {
  try {
    console.log('Fetching study materials for teacher dashboard');
    const materials = await StudyMaterial.find().sort({ createdAt: -1 }).populate('uploadedBy', 'name role');
    res.json(materials);
  } catch (error) {
    console.error('Error fetching study materials for teacher dashboard:', error);
    res.status(500).json({ message: 'Failed to fetch study materials' });
  }
});

// Get all students for teacher dashboard
router.get('/students', authenticateToken, authorize(['teacher']), async (req, res) => {
  try {
    console.log('Fetching students for teacher dashboard');
    const students = await User.find({ role: 'student' })
      .select('name rollNumber class branch')
      .sort({ rollNumber: 1 });

    if (!students || students.length === 0) {
      return res.status(404).json({ message: 'No students found' });
    }

    console.log(`Found ${students.length} students for teacher dashboard`);
    res.json(students);
  } catch (error) {
    console.error('Error fetching students for teacher dashboard:', error);
    res.status(500).json({ message: 'Failed to fetch students', error: error.message });
  }
});

module.exports = router;
