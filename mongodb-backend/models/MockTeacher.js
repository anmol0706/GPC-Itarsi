// Mock teachers for development when MongoDB is not available
const mockTeachers = [
  {
    _id: '60d0fe4f5311236168a109d5',
    name: 'Dr. Rajesh Kumar',
    designation: 'Professor',
    department: 'Computer Science',
    qualification: 'Ph.D. in Computer Science',
    experience: '15 years',
    email: 'rajesh.kumar@gpcitarsi.edu.in',
    phone: '+91-9876543210',
    photo: 'default-teacher.jpg',
    subjects: ['Data Structures', 'Algorithms', 'Database Management'],
    bio: 'Dr. Rajesh Kumar is a Professor in the Computer Science department with over 15 years of teaching experience. He has published numerous research papers in international journals.',
    joinedDate: new Date(2008, 5, 15),
    createdAt: new Date(Date.now() - 3600000 * 24 * 30), // 30 days ago
    updatedAt: new Date(Date.now() - 3600000 * 24 * 15)  // 15 days ago
  },
  {
    _id: '60d0fe4f5311236168a109d6',
    name: 'Prof. Sunita Verma',
    designation: 'Associate Professor',
    department: 'Electrical Engineering',
    qualification: 'M.Tech in Electrical Engineering',
    experience: '12 years',
    email: 'sunita.verma@gpcitarsi.edu.in',
    phone: '+91-9876543211',
    photo: 'default-teacher.jpg',
    subjects: ['Circuit Theory', 'Power Systems', 'Electrical Machines'],
    bio: 'Prof. Sunita Verma is an Associate Professor in the Electrical Engineering department with 12 years of teaching experience. She specializes in Power Systems and Electrical Machines.',
    joinedDate: new Date(2011, 7, 10),
    createdAt: new Date(Date.now() - 3600000 * 24 * 28), // 28 days ago
    updatedAt: new Date(Date.now() - 3600000 * 24 * 14)  // 14 days ago
  },
  {
    _id: '60d0fe4f5311236168a109d7',
    name: 'Dr. Amit Patel',
    designation: 'Assistant Professor',
    department: 'Mechanical Engineering',
    qualification: 'Ph.D. in Mechanical Engineering',
    experience: '8 years',
    email: 'amit.patel@gpcitarsi.edu.in',
    phone: '+91-9876543212',
    photo: 'default-teacher.jpg',
    subjects: ['Thermodynamics', 'Fluid Mechanics', 'Machine Design'],
    bio: 'Dr. Amit Patel is an Assistant Professor in the Mechanical Engineering department with 8 years of teaching experience. His research interests include Thermodynamics and Fluid Mechanics.',
    joinedDate: new Date(2015, 3, 20),
    createdAt: new Date(Date.now() - 3600000 * 24 * 26), // 26 days ago
    updatedAt: new Date(Date.now() - 3600000 * 24 * 13)  // 13 days ago
  },
  {
    _id: '60d0fe4f5311236168a109d8',
    name: 'Prof. Neha Singh',
    designation: 'Assistant Professor',
    department: 'Civil Engineering',
    qualification: 'M.Tech in Civil Engineering',
    experience: '6 years',
    email: 'neha.singh@gpcitarsi.edu.in',
    phone: '+91-9876543213',
    photo: 'default-teacher.jpg',
    subjects: ['Structural Engineering', 'Surveying', 'Construction Management'],
    bio: 'Prof. Neha Singh is an Assistant Professor in the Civil Engineering department with 6 years of teaching experience. She specializes in Structural Engineering and Construction Management.',
    joinedDate: new Date(2017, 6, 5),
    createdAt: new Date(Date.now() - 3600000 * 24 * 24), // 24 days ago
    updatedAt: new Date(Date.now() - 3600000 * 24 * 12)  // 12 days ago
  },
  {
    _id: '60d0fe4f5311236168a109d9',
    name: 'Dr. Pradeep Sharma',
    designation: 'Professor',
    department: 'Electronics & Communication',
    qualification: 'Ph.D. in Electronics Engineering',
    experience: '18 years',
    email: 'pradeep.sharma@gpcitarsi.edu.in',
    phone: '+91-9876543214',
    photo: 'default-teacher.jpg',
    subjects: ['Digital Electronics', 'Communication Systems', 'Signal Processing'],
    bio: 'Dr. Pradeep Sharma is a Professor in the Electronics & Communication department with 18 years of teaching experience. He has published several research papers in the field of Signal Processing.',
    joinedDate: new Date(2005, 8, 12),
    createdAt: new Date(Date.now() - 3600000 * 24 * 22), // 22 days ago
    updatedAt: new Date(Date.now() - 3600000 * 24 * 11)  // 11 days ago
  }
];

// Mock Teacher model
class MockTeacher {
  static async find() {
    return [...mockTeachers];
  }

  static async findById(id) {
    return mockTeachers.find(teacher => teacher._id === id);
  }

  static async findOne(query = {}) {
    if (query._id) {
      return mockTeachers.find(teacher => teacher._id === query._id);
    }
    if (query.name) {
      return mockTeachers.find(teacher => teacher.name === query.name);
    }
    return mockTeachers[0];
  }

  static async findByIdAndUpdate(id, update) {
    const teacher = mockTeachers.find(teacher => teacher._id === id);
    if (!teacher) return null;

    Object.assign(teacher, update);
    return teacher;
  }

  static async findByIdAndDelete(id) {
    const index = mockTeachers.findIndex(teacher => teacher._id === id);
    if (index === -1) return null;

    const deleted = mockTeachers.splice(index, 1)[0];
    return deleted;
  }
}

module.exports = MockTeacher;
