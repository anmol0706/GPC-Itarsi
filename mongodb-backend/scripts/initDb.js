const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Course = require('../models/Course');
const Overview = require('../models/Overview');
const ChatbotFAQ = require('../models/ChatbotFAQ');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://GPC:anmol4328@gpc-itarsi.puza0ta.mongodb.net/gpc-itarsi';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    initializeDatabase();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Initialize database with default data
async function initializeDatabase() {
  try {
    console.log('Initializing database with default data...');

    // Create default admin user if it doesn't exist
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new User({
        username: 'admin',
        password: hashedPassword,
        name: 'Administrator',
        role: 'admin',
        email: 'admin@gpcitarsi.edu.in'
      });
      await admin.save();
      console.log('Default admin user created');
    } else {
      console.log('Admin user already exists');
    }

    // Create test student user with roll number 2007
    const studentExists = await User.findOne({ rollNumber: '2007' });
    if (!studentExists) {
      const hashedPassword = await bcrypt.hash('2007', 10);
      const student = new User({
        username: 'student2007',
        password: hashedPassword,
        name: 'Test Student 2007',
        role: 'student',
        email: 'student2007@gpcitarsi.edu.in',
        profilePicture: 'default-profile.jpg',
        rollNumber: '2007',
        class: 'Second Year',
        branch: 'CS',
        attendance: 75
      });
      await student.save();
      console.log('Test student user created');
    } else {
      console.log('Test student user already exists');
    }

    // Create default overview if it doesn't exist
    const overviewExists = await Overview.findOne();
    if (!overviewExists) {
      const overview = new Overview({
        title: 'Government Polytechnic College, Itarsi',
        shortDescription: 'A premier technical institution offering diploma courses in engineering and technology.',
        longDescription: 'Government Polytechnic College, Itarsi is committed to providing quality technical education to students. The college offers various diploma courses in engineering and technology fields.',
        vision: 'To be a center of excellence in technical education, producing skilled professionals who contribute to the technological advancement of the nation.',
        mission: 'To impart quality technical education, foster innovation, and develop skilled professionals with strong ethical values.',
        establishedYear: 1965,
        address: 'Government Polytechnic College, Itarsi, Madhya Pradesh, India',
        phone: '+91-1234567890',
        email: 'info@gpcitarsi.edu.in',
        website: 'www.gpcitarsi.edu.in',
        principalMessage: 'Welcome to Government Polytechnic College, Itarsi. We are committed to providing quality technical education to our students.',
        principalName: 'Principal',
        stats: {
          students: 0,
          teachers: 0,
          courses: 0,
          placements: 0
        }
      });
      await overview.save();
      console.log('Default overview created');
    } else {
      console.log('Overview already exists');
    }

    // Create default courses if they don't exist
    const coursesExist = await Course.countDocuments();
    if (coursesExist === 0) {
      const defaultCourses = [
        {
          title: 'Computer Science & Engineering',
          code: 'CS',
          description: 'Diploma in Computer Science & Engineering covers computer programming, software development, and computer systems.',
          duration: '3 Years',
          eligibility: '10th Pass with Mathematics',
          seats: 60,
          fees: 5000,
          image: 'default-course.jpg'
        },
        {
          title: 'Mechanical Engineering',
          code: 'ME',
          description: 'Diploma in Mechanical Engineering covers design, manufacturing, and maintenance of mechanical systems.',
          duration: '3 Years',
          eligibility: '10th Pass with Mathematics and Science',
          seats: 60,
          fees: 5000,
          image: 'default-course.jpg'
        },
        {
          title: 'Electronics & Telecommunication',
          code: 'ET',
          description: 'Diploma in Electronics & Telecommunication covers electronic circuits, communication systems, and signal processing.',
          duration: '3 Years',
          eligibility: '10th Pass with Mathematics and Science',
          seats: 60,
          fees: 5000,
          image: 'default-course.jpg'
        },
        {
          title: 'Electrical Engineering',
          code: 'EE',
          description: 'Diploma in Electrical Engineering covers electrical systems, power generation, and electrical machines.',
          duration: '3 Years',
          eligibility: '10th Pass with Mathematics and Science',
          seats: 60,
          fees: 5000,
          image: 'default-course.jpg'
        }
      ];

      await Course.insertMany(defaultCourses);
      console.log('Default courses created');
    } else {
      console.log('Courses already exist');
    }

    // Create default chatbot FAQs if they don't exist
    const faqsExist = await ChatbotFAQ.countDocuments();
    if (faqsExist === 0) {
      const defaultFAQs = [
        {
          question: 'What courses are offered?',
          answer: 'We offer diploma courses in Computer Science, Mechanical Engineering, Electronics & Telecommunication, and Electrical Engineering.',
          keywords: ['courses', 'diploma', 'programs', 'degrees'],
          category: 'academic'
        },
        {
          question: 'How do I apply for admission?',
          answer: 'Admissions are done through the MP Online portal. Visit the Admission page on our website for more details.',
          keywords: ['admission', 'apply', 'entrance', 'registration'],
          category: 'admission'
        },
        {
          question: 'What are the hostel facilities?',
          answer: 'We have separate hostels for boys and girls with all basic amenities including mess, recreation room, and Wi-Fi.',
          keywords: ['hostel', 'accommodation', 'stay', 'residence'],
          category: 'facility'
        },
        {
          question: 'What is the fee structure?',
          answer: 'The fee structure varies by course. Generally, it is around Rs. 5000 per year for most diploma courses.',
          keywords: ['fees', 'cost', 'payment', 'tuition'],
          category: 'admission'
        },
        {
          question: 'Where is the college located?',
          answer: 'The college is located in Itarsi, Madhya Pradesh, India.',
          keywords: ['location', 'address', 'place', 'where'],
          category: 'general'
        }
      ];

      await ChatbotFAQ.insertMany(defaultFAQs);
      console.log('Default chatbot FAQs created');
    } else {
      console.log('Chatbot FAQs already exist');
    }

    console.log('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}
