const mongoose = require('mongoose');

const AdmissionDetailsSchema = new mongoose.Schema({
  academicYear: {
    type: String,
    required: true,
    default: '2024-25'
  },
  pageTitle: {
    type: String,
    default: 'Begin Your Journey at'
  },
  pageSubtitle: {
    type: String,
    default: 'GPC Itarsi'
  },
  pageDescription: {
    type: String,
    default: 'Join our prestigious institution to gain quality technical education and build a successful career in engineering and technology.'
  },
  applicationPeriod: {
    startDate: {
      type: String,
      default: ''
    },
    endDate: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      default: 'Coming Soon'
    }
  },
  entranceExam: {
    startDate: {
      type: String,
      default: ''
    },
    endDate: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      default: 'Coming Soon'
    }
  },
  classesBegin: {
    date: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      default: 'Coming Soon'
    }
  },
  counseling: {
    startDate: {
      type: String,
      default: ''
    },
    endDate: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      default: 'Coming Soon'
    }
  },
  results: {
    date: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      default: 'Coming Soon'
    }
  },
  additionalInfo: {
    type: String,
    default: ''
  },
  applyButtonText: {
    type: String,
    default: 'Apply Now'
  },
  learnMoreButtonText: {
    type: String,
    default: 'Learn More'
  },
  applicationSteps: [{
    title: String,
    description: String
  }],
  faqSection: {
    title: {
      type: String,
      default: 'Frequently Asked Questions'
    },
    items: [{
      question: String,
      answer: String
    }]
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create a model from the schema
const AdmissionDetails = mongoose.model('AdmissionDetails', AdmissionDetailsSchema);

// Create a mock model for development
const MockAdmissionDetails = {
  findOne: async () => {
    return {
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
      applicationSteps: [
        {
          title: 'Register Online',
          description: 'Create an account on MP Online portal and fill the application form.'
        },
        {
          title: 'Pay Application Fee',
          description: 'Pay the application fee through online payment methods.'
        },
        {
          title: 'Entrance Exam',
          description: 'Appear for the entrance examination at the designated center.'
        },
        {
          title: 'Counseling',
          description: 'If selected, attend the counseling session with all original documents.'
        }
      ],
      faqSection: {
        title: 'Frequently Asked Questions',
        items: [
          {
            question: 'What are the eligibility criteria for admission?',
            answer: 'Candidates must have passed 10th standard with minimum 35% marks in aggregate.'
          },
          {
            question: 'How can I apply for admission?',
            answer: 'Applications can be submitted online through the MP Online portal.'
          },
          {
            question: 'What is the fee structure?',
            answer: 'The fee structure varies by course. Please check the detailed fee structure on our website.'
          },
          {
            question: 'Is hostel facility available?',
            answer: 'Yes, separate hostels for boys and girls are available on campus.'
          }
        ]
      },
      updatedAt: new Date()
    };
  },
  findOneAndUpdate: async (query, update) => {
    return {
      ...update.$set,
      updatedAt: new Date()
    };
  }
};

module.exports = process.env.NODE_ENV === 'mock' || (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('localhost'))
  ? MockAdmissionDetails
  : AdmissionDetails;
