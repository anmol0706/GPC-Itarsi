const express = require('express');
const router = express.Router();
const AdmissionDetails = require('../models/AdmissionDetails');
const { authenticateToken, authorize } = require('../middleware/auth');

// Get admission details (public)
router.get('/', async (req, res) => {
  try {
    console.log('Fetching admission details');
    
    // Find the admission details (there should be only one document)
    const admissionDetails = await AdmissionDetails.findOne();
    
    if (!admissionDetails) {
      // If no admission details exist, return default values
      return res.json({
        academicYear: '2024-25',
        pageTitle: 'Begin Your Journey at',
        pageSubtitle: 'GPC Itarsi',
        pageDescription: 'Join our prestigious institution to gain quality technical education and build a successful career in engineering and technology. Applications for 2024-25 academic year are now open.',
        applicationPeriod: {
          startDate: '2024-05-15',
          endDate: '2024-07-15',
          status: 'Currently Active'
        },
        entranceExam: {
          startDate: '2024-06-10',
          endDate: '2024-06-15',
          status: 'Upcoming'
        },
        classesBegin: {
          date: '2024-08-01',
          status: 'Coming Soon'
        },
        counseling: {
          startDate: '2024-07-05',
          endDate: '2024-07-20',
          status: 'Upcoming'
        },
        results: {
          date: '2024-06-30',
          status: 'Upcoming'
        },
        additionalInfo: 'Online applications open for all diploma programs. Apply through MP Online portal.',
        applyButtonText: 'Apply Now',
        learnMoreButtonText: 'Learn More',
        applicationSteps: [],
        faqSection: {
          title: 'Frequently Asked Questions',
          items: []
        }
      });
    }
    
    res.json(admissionDetails);
  } catch (error) {
    console.error('Error fetching admission details:', error);
    res.status(500).json({ message: 'Failed to fetch admission details', error: error.message });
  }
});

// Update admission details (admin only)
router.put('/', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    console.log('Updating admission details');
    
    const {
      academicYear,
      pageTitle,
      pageSubtitle,
      pageDescription,
      applicationPeriod,
      entranceExam,
      classesBegin,
      counseling,
      results,
      additionalInfo,
      applyButtonText,
      learnMoreButtonText,
      applicationSteps,
      faqSection
    } = req.body;
    
    // Update the admission details
    const updatedAdmissionDetails = await AdmissionDetails.findOneAndUpdate(
      {}, // Find the first document
      {
        $set: {
          academicYear,
          pageTitle,
          pageSubtitle,
          pageDescription,
          applicationPeriod,
          entranceExam,
          classesBegin,
          counseling,
          results,
          additionalInfo,
          applyButtonText,
          learnMoreButtonText,
          applicationSteps,
          faqSection,
          updatedAt: new Date()
        }
      },
      { new: true, upsert: true } // Return the updated document and create if it doesn't exist
    );
    
    res.json(updatedAdmissionDetails);
  } catch (error) {
    console.error('Error updating admission details:', error);
    res.status(500).json({ message: 'Failed to update admission details', error: error.message });
  }
});

module.exports = router;
