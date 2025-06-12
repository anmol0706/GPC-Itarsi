// Mock courses for development when MongoDB is not available
const mockCourses = [
  {
    _id: '60d0fe4f5311236168a109b1',
    title: 'Diploma in Computer Science & Engineering',
    code: 'CSE',
    description: 'This program focuses on computer programming, software development, and hardware engineering.',
    duration: '3 Years',
    eligibility: '10th Pass with minimum 45% marks',
    seats: 60,
    fees: 15000,
    image: 'default-course.jpg',
    createdAt: new Date(Date.now() - 3600000 * 24 * 30), // 30 days ago
    updatedAt: new Date(Date.now() - 3600000 * 24 * 15)  // 15 days ago
  },
  {
    _id: '60d0fe4f5311236168a109b2',
    title: 'Diploma in Mechanical Engineering',
    code: 'ME',
    description: 'This program covers the design, manufacturing, and maintenance of mechanical systems.',
    duration: '3 Years',
    eligibility: '10th Pass with minimum 45% marks',
    seats: 60,
    fees: 15000,
    image: 'default-course.jpg',
    createdAt: new Date(Date.now() - 3600000 * 24 * 28), // 28 days ago
    updatedAt: new Date(Date.now() - 3600000 * 24 * 14)  // 14 days ago
  },
  {
    _id: '60d0fe4f5311236168a109b3',
    title: 'Diploma in Electrical Engineering',
    code: 'EE',
    description: 'This program focuses on electrical systems, power generation, and distribution.',
    duration: '3 Years',
    eligibility: '10th Pass with minimum 45% marks',
    seats: 60,
    fees: 15000,
    image: 'default-course.jpg',
    createdAt: new Date(Date.now() - 3600000 * 24 * 26), // 26 days ago
    updatedAt: new Date(Date.now() - 3600000 * 24 * 13)  // 13 days ago
  },
  {
    _id: '60d0fe4f5311236168a109b4',
    title: 'Diploma in Civil Engineering',
    code: 'CE',
    description: 'This program covers the design, construction, and maintenance of infrastructure.',
    duration: '3 Years',
    eligibility: '10th Pass with minimum 45% marks',
    seats: 60,
    fees: 15000,
    image: 'default-course.jpg',
    createdAt: new Date(Date.now() - 3600000 * 24 * 24), // 24 days ago
    updatedAt: new Date(Date.now() - 3600000 * 24 * 12)  // 12 days ago
  },
  {
    _id: '60d0fe4f5311236168a109b5',
    title: 'Diploma in Electronics & Communication',
    code: 'EC',
    description: 'This program focuses on electronic devices, communication systems, and signal processing.',
    duration: '3 Years',
    eligibility: '10th Pass with minimum 45% marks',
    seats: 60,
    fees: 15000,
    image: 'default-course.jpg',
    createdAt: new Date(Date.now() - 3600000 * 24 * 22), // 22 days ago
    updatedAt: new Date(Date.now() - 3600000 * 24 * 11)  // 11 days ago
  }
];

// Mock Course model
class MockCourse {
  static async find() {
    return [...mockCourses];
  }

  static async findById(id) {
    return mockCourses.find(course => course._id === id);
  }

  static async findOne(query = {}) {
    if (query.code) {
      return mockCourses.find(course => course.code === query.code);
    }
    return mockCourses[0];
  }

  static async countDocuments() {
    return mockCourses.length;
  }
}

module.exports = MockCourse;
