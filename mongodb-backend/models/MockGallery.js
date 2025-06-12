// Mock gallery items for development when MongoDB is not available
const mockGalleryItems = [
  {
    _id: '60d0fe4f5311236168a109f1',
    title: 'College Building',
    description: 'Main building of Government Polytechnic College, Itarsi',
    image: 'default-gallery.jpg',
    category: 'campus',
    featured: true,
    createdAt: new Date(Date.now() - 3600000 * 24 * 30), // 30 days ago
    updatedAt: new Date(Date.now() - 3600000 * 24 * 15)  // 15 days ago
  },
  {
    _id: '60d0fe4f5311236168a109f2',
    title: 'Computer Lab',
    description: 'State-of-the-art computer laboratory with modern equipment',
    image: 'default-gallery.jpg',
    category: 'facilities',
    featured: true,
    createdAt: new Date(Date.now() - 3600000 * 24 * 28), // 28 days ago
    updatedAt: new Date(Date.now() - 3600000 * 24 * 14)  // 14 days ago
  },
  {
    _id: '60d0fe4f5311236168a109f3',
    title: 'Annual Function',
    description: 'Students performing at the annual cultural function',
    image: 'default-gallery.jpg',
    category: 'events',
    featured: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 26), // 26 days ago
    updatedAt: new Date(Date.now() - 3600000 * 24 * 13)  // 13 days ago
  },
  {
    _id: '60d0fe4f5311236168a109f4',
    title: 'Sports Day',
    description: 'Students participating in various sports activities',
    image: 'default-gallery.jpg',
    category: 'events',
    featured: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 24), // 24 days ago
    updatedAt: new Date(Date.now() - 3600000 * 24 * 12)  // 12 days ago
  },
  {
    _id: '60d0fe4f5311236168a109f5',
    title: 'Workshop on IoT',
    description: 'Students attending a workshop on Internet of Things',
    image: 'default-gallery.jpg',
    category: 'workshops',
    featured: true,
    createdAt: new Date(Date.now() - 3600000 * 24 * 22), // 22 days ago
    updatedAt: new Date(Date.now() - 3600000 * 24 * 11)  // 11 days ago
  }
];

// Mock Gallery model
class MockGallery {
  static async find(query = {}) {
    if (query.category) {
      return mockGalleryItems.filter(item => item.category === query.category);
    }
    if (query.featured) {
      return mockGalleryItems.filter(item => item.featured === query.featured);
    }
    return [...mockGalleryItems];
  }

  static async findById(id) {
    return mockGalleryItems.find(item => item._id === id);
  }

  static async findOne(query = {}) {
    if (query._id) {
      return mockGalleryItems.find(item => item._id === query._id);
    }
    if (query.title) {
      return mockGalleryItems.find(item => item.title === query.title);
    }
    return mockGalleryItems[0];
  }

  static async findByIdAndUpdate(id, update) {
    const item = mockGalleryItems.find(item => item._id === id);
    if (!item) return null;

    Object.assign(item, update);
    return item;
  }

  static async findByIdAndDelete(id) {
    const index = mockGalleryItems.findIndex(item => item._id === id);
    if (index === -1) return null;

    const deleted = mockGalleryItems.splice(index, 1)[0];
    return deleted;
  }
}

module.exports = MockGallery;
