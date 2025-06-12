const bcrypt = require('bcryptjs');

// Mock users for development when MongoDB is not available
const mockUsers = [
  {
    _id: '60d0fe4f5311236168a109ca',
    username: 'admin',
    password: '$2a$10$rrm7JyNBpv3WN/6srfv2SefNB2GvGEYGz6q8QE6Yy7IFYwoOAMMOK', // admin123
    name: 'Administrator',
    role: 'admin',
    email: 'admin@gpcitarsi.edu.in',
    profilePicture: 'default-profile.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '60d0fe4f5311236168a109e1',
    username: 'operator',
    password: '$2a$10$rrm7JyNBpv3WN/6srfv2SefNB2GvGEYGz6q8QE6Yy7IFYwoOAMM9K', // 1234
    name: 'Operator Admin',
    role: 'admin',
    email: 'operator@gpcitarsi.edu.in',
    profilePicture: 'default-profile.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '60d0fe4f5311236168a109cb',
    username: 'anmol',
    password: '$2a$10$rrm7JyNBpv3WN/6srfv2SefNB2GvGEYGz6q8QE6Yy7IFYwoOAMM1K', // 2007
    name: 'Anmol Admin',
    role: 'admin',
    email: 'anmol@gpcitarsi.edu.in',
    profilePicture: 'default-profile.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '60d0fe4f5311236168a109cc',
    username: 'teacher',
    password: '$2a$10$rrm7JyNBpv3WN/6srfv2SefNB2GvGEYGz6q8QE6Yy7IFYwoOAMM2K', // teacher123
    name: 'Test Teacher',
    role: 'teacher',
    email: 'teacher@gpcitarsi.edu.in',
    profilePicture: 'default-profile.jpg',
    department: 'Computer Science',
    subjects: ['Programming', 'Database Management'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '60d0fe4f5311236168a109cd',
    username: 'student',
    password: '$2a$10$rrm7JyNBpv3WN/6srfv2SefNB2GvGEYGz6q8QE6Yy7IFYwoOAMM3K', // student123
    name: 'Test Student',
    role: 'student',
    email: 'student@gpcitarsi.edu.in',
    profilePicture: 'default-profile.jpg',
    rollNumber: 'CS2023001',
    class: 'Third Year',
    branch: 'CS',
    attendance: 85,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Add more test students
  {
    _id: '60d0fe4f5311236168a109ce',
    username: 'student2',
    password: '$2a$10$rrm7JyNBpv3WN/6srfv2SefNB2GvGEYGz6q8QE6Yy7IFYwoOAMM4K', // student123
    name: 'John Doe',
    role: 'student',
    email: 'john@gpcitarsi.edu.in',
    profilePicture: 'default-profile.jpg',
    rollNumber: 'CS2023002',
    class: 'Second Year',
    branch: 'CS',
    attendance: 78,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '60d0fe4f5311236168a109cf',
    username: 'student3',
    password: '$2a$10$rrm7JyNBpv3WN/6srfv2SefNB2GvGEYGz6q8QE6Yy7IFYwoOAMM5K', // student123
    name: 'Jane Smith',
    role: 'student',
    email: 'jane@gpcitarsi.edu.in',
    profilePicture: 'default-profile.jpg',
    rollNumber: 'ME2023001',
    class: 'First Year',
    branch: 'ME',
    attendance: 92,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '60d0fe4f5311236168a109d0',
    username: 'student4',
    password: '$2a$10$rrm7JyNBpv3WN/6srfv2SefNB2GvGEYGz6q8QE6Yy7IFYwoOAMM6K', // student123
    name: 'Rahul Kumar',
    role: 'student',
    email: 'rahul@gpcitarsi.edu.in',
    profilePicture: 'default-profile.jpg',
    rollNumber: 'ET2023001',
    class: 'Second Year',
    branch: 'ET',
    attendance: 65,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '60d0fe4f5311236168a109d1',
    username: 'student5',
    password: '$2a$10$rrm7JyNBpv3WN/6srfv2SefNB2GvGEYGz6q8QE6Yy7IFYwoOAMM7K', // student123
    name: 'Priya Sharma',
    role: 'student',
    email: 'priya@gpcitarsi.edu.in',
    profilePicture: 'default-profile.jpg',
    rollNumber: 'EE2023001',
    class: 'Third Year',
    branch: 'EE',
    attendance: 88,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '60d0fe4f5311236168a109d2',
    username: 'student2007',
    password: '$2a$10$rrm7JyNBpv3WN/6srfv2SefNB2GvGEYGz6q8QE6Yy7IFYwoOAMM7K', // student123
    name: 'Test Student 2007',
    role: 'student',
    email: 'student2007@gpcitarsi.edu.in',
    profilePicture: 'default-profile.jpg',
    rollNumber: '2007',
    class: 'Second Year',
    branch: 'CS',
    attendance: 75,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '60d0fe4f5311236168a109d3',
    username: 'developer',
    password: '$2a$10$rrm7JyNBpv3WN/6srfv2SefNB2GvGEYGz6q8QE6Yy7IFYwoOAMM8K', // developer123
    name: 'Anmol Malviya',
    role: 'developer',
    email: 'developer@gpcitarsi.edu.in',
    profilePicture: 'default-profile.jpg',
    title: 'Web Developer',
    bio: 'I am a web developer specializing in React and Node.js.',
    education: 'Computer Science',
    experience: '5 years',
    socialLinks: {
      github: 'https://github.com/developer',
      portfolio: 'https://developer.com',
      instagram: 'https://instagram.com/developer',
      email: 'developer@example.com'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '60d0fe4f5311236168a109d4',
    username: 'hod_cs',
    password: '$2a$10$rrm7JyNBpv3WN/6srfv2SefNB2GvGEYGz6q8QE6Yy7IFYwoOAMM2K', // teacher123
    name: 'Dr. Amit Sharma',
    role: 'hod',
    email: 'hod_cs@gpcitarsi.edu.in',
    profilePicture: 'default-profile.jpg',
    department: 'Computer Science',
    subjects: ['Advanced Algorithms', 'Machine Learning'],
    qualification: 'Ph.D. in Computer Science',
    experience: '12 years',
    designation: 'Head of Department, Computer Science',
    message: 'Welcome to the Computer Science department at GPC Itarsi. Our department is committed to providing quality education in the field of computer science and information technology.',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '60d0fe4f5311236168a109d5',
    username: 'principal',
    password: '$2a$10$rrm7JyNBpv3WN/6srfv2SefNB2GvGEYGz6q8QE6Yy7IFYwoOAMM2K', // teacher123
    name: 'Dr. Rajesh Kumar',
    role: 'principal',
    email: 'principal@gpcitarsi.edu.in',
    profilePicture: 'default-profile.jpg',
    qualification: 'Ph.D. in Mechanical Engineering',
    experience: '20 years',
    designation: 'Principal, Government Polytechnic College, Itarsi',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Mock User model
class MockUser {
  static async findOne(query) {
    // Handle username query
    if (query.username) {
      const username = query.username.$regex
        ? query.username.$regex.source.replace('^', '').replace('$', '')
        : query.username;

      return mockUsers.find(user =>
        user.username.toLowerCase() === username.toLowerCase()
      );
    }

    // Handle rollNumber query for student login
    if (query.rollNumber) {
      const rollNumber = query.rollNumber.$regex
        ? query.rollNumber.$regex.source.replace('^', '').replace('$', '')
        : query.rollNumber;

      // If role is specified, check that too
      if (query.role) {
        return mockUsers.find(user =>
          user.rollNumber &&
          user.rollNumber.toLowerCase() === rollNumber.toLowerCase() &&
          user.role === query.role
        );
      }

      return mockUsers.find(user =>
        user.rollNumber &&
        user.rollNumber.toLowerCase() === rollNumber.toLowerCase()
      );
    }

    // Handle ID query
    if (query._id) {
      return mockUsers.find(user => user._id === query._id);
    }

    return null;
  }

  static async findById(id) {
    return mockUsers.find(user => user._id === id);
  }

  static async find(query = {}) {
    if (query.role) {
      return mockUsers.filter(user => user.role === query.role);
    }
    return [...mockUsers];
  }

  static async countDocuments(query = {}) {
    if (query.role) {
      return mockUsers.filter(user => user.role === query.role).length;
    }
    return mockUsers.length;
  }

  // Mock comparePassword method
  static async comparePassword(candidatePassword, userPassword) {
    // For testing purposes, we'll use a simple comparison for specific test passwords
    if (candidatePassword === '2007' && userPassword.includes('AMM')) {
      return true; // Allow '2007' password for any mock user with AMM in their password hash
    }
    if (candidatePassword === 'admin123' && userPassword.includes('AMMOK')) {
      return true;
    }
    if (candidatePassword === 'teacher123' && userPassword.includes('AMM2K')) {
      return true;
    }
    if (candidatePassword === 'student123' && userPassword.includes('AMM')) {
      return true; // Allow 'student123' for any student
    }
    if (candidatePassword === '1234' && userPassword.includes('AMM9K')) {
      return true; // Allow '1234' for operator admin
    }
    if (candidatePassword === 'developer123' && userPassword.includes('AMM8K')) {
      return true; // Allow 'developer123' for developer
    }

    // For other cases, use bcrypt
    return bcrypt.compare(candidatePassword, userPassword);
  }
}

// Add comparePassword method to mock user objects
mockUsers.forEach(user => {
  user.comparePassword = async function(candidatePassword) {
    return MockUser.comparePassword(candidatePassword, this.password);
  };
});

module.exports = MockUser;
