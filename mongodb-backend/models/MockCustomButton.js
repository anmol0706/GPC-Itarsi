// Mock custom buttons for development when MongoDB is not available
const mockCustomButtons = [
  {
    _id: '60d0fe4f5311236168a109e5',
    title: 'Admission Form',
    url: '/admission',
    icon: 'fa-user-plus',
    color: '#4CAF50',
    position: 1,
    isActive: true,
    createdAt: new Date(Date.now() - 3600000 * 24 * 30), // 30 days ago
    updatedAt: new Date(Date.now() - 3600000 * 24 * 15)  // 15 days ago
  },
  {
    _id: '60d0fe4f5311236168a109e6',
    title: 'Exam Results',
    url: '/results',
    icon: 'fa-graduation-cap',
    color: '#2196F3',
    position: 2,
    isActive: true,
    createdAt: new Date(Date.now() - 3600000 * 24 * 28), // 28 days ago
    updatedAt: new Date(Date.now() - 3600000 * 24 * 14)  // 14 days ago
  },
  {
    _id: '60d0fe4f5311236168a109e7',
    title: 'Fee Payment',
    url: '/fees',
    icon: 'fa-credit-card',
    color: '#FF9800',
    position: 3,
    isActive: true,
    createdAt: new Date(Date.now() - 3600000 * 24 * 26), // 26 days ago
    updatedAt: new Date(Date.now() - 3600000 * 24 * 13)  // 13 days ago
  }
];

// Mock CustomButton model
class MockCustomButton {
  static async find() {
    return [...mockCustomButtons];
  }

  static async findById(id) {
    return mockCustomButtons.find(button => button._id === id);
  }

  static async findOne(query = {}) {
    if (query._id) {
      return mockCustomButtons.find(button => button._id === query._id);
    }
    if (query.title) {
      return mockCustomButtons.find(button => button.title === query.title);
    }
    return mockCustomButtons[0];
  }

  static async findByIdAndUpdate(id, update) {
    const button = mockCustomButtons.find(button => button._id === id);
    if (!button) return null;

    Object.assign(button, update);
    return button;
  }

  static async findByIdAndDelete(id) {
    const index = mockCustomButtons.findIndex(button => button._id === id);
    if (index === -1) return null;

    const deleted = mockCustomButtons.splice(index, 1)[0];
    return deleted;
  }
}

module.exports = MockCustomButton;
