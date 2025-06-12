// Mock overview data for development when MongoDB is not available
const mockOverview = {
  _id: '60d0fe4f5311236168a109a1',
  title: 'Government Polytechnic College, Itarsi',
  shortDescription: 'A premier technical institution offering diploma courses in engineering and technology.',
  longDescription: 'Government Polytechnic College, Itarsi is committed to providing quality technical education to students. The college offers various diploma courses in engineering and technology fields.',
  content: 'Government Polytechnic College, Itarsi is committed to providing quality technical education to students. The college offers various diploma courses in engineering and technology fields.',
  vision: 'To be a center of excellence in technical education, producing skilled professionals who contribute to the technological advancement of the nation.',
  mission: 'To impart quality technical education, foster innovation, and develop skilled professionals with strong ethical values.',
  establishedYear: 1965,
  address: 'Government Polytechnic College, Itarsi, Madhya Pradesh, India',
  phone: '+91-1234567890',
  email: 'info@gpcitarsi.edu.in',
  website: 'www.gpcitarsi.edu.in',
  socialMedia: {
    facebook: 'https://facebook.com/gpcitarsi',
    twitter: 'https://twitter.com/gpcitarsi',
    instagram: 'https://instagram.com/gpcitarsi',
    linkedin: 'https://linkedin.com/school/gpcitarsi'
  },
  stats: {
    students: 450,
    teachers: 35,
    courses: 8,
    placements: 85
  },
  principalMessage: 'Welcome to Government Polytechnic College, Itarsi. We are committed to providing quality technical education to our students. Our goal is to prepare students for successful careers in the industry by providing them with the necessary skills and knowledge.',
  principalName: 'Dr. Rajesh Kumar',
  principalImage: 'default-principal.jpg',
  updatedAt: new Date()
};

// Mock Overview model
class MockOverview {
  static async findOne() {
    return { ...mockOverview };
  }

  static async findById() {
    return { ...mockOverview };
  }

  static async findByIdAndUpdate(id, update) {
    // In a real implementation, this would update the document
    return { ...mockOverview, ...update };
  }

  static async save() {
    // In a real implementation, this would save the document
    return { ...mockOverview };
  }
}

module.exports = MockOverview;
