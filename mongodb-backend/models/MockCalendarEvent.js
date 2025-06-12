// Mock calendar events for development when MongoDB is not available
const mockCalendarEvents = [
  {
    _id: '60d0fe4f5311236168a109f1',
    title: 'Mid-Term Examination',
    description: 'Mid-term examinations for all courses',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 15, 9, 0), // 15th of current month, 9 AM
    endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 20, 17, 0), // 20th of current month, 5 PM
    location: 'Main Building',
    type: 'exam',
    forClass: 'all',
    forSubject: '',
    color: '#F44336', // Red
    isRecurring: false,
    createdBy: '60d0fe4f5311236168a109cb', // admin user
    createdAt: new Date(Date.now() - 1209600000) // 14 days ago
  },
  {
    _id: '60d0fe4f5311236168a109f2',
    title: 'Programming Class',
    description: 'Regular programming class for CS students',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 10, 0), // Today, 10 AM
    endDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 12, 0), // Today, 12 PM
    location: 'Computer Lab',
    type: 'class',
    forClass: 'Third Year',
    forSubject: 'Programming',
    color: '#4CAF50', // Green
    isRecurring: true,
    recurrencePattern: {
      frequency: 'weekly',
      daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
      endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 3, new Date().getDate()) // 3 months from now
    },
    createdBy: '60d0fe4f5311236168a109cc', // teacher user
    createdAt: new Date(Date.now() - 604800000) // 7 days ago
  },
  {
    _id: '60d0fe4f5311236168a109f3',
    title: 'College Foundation Day',
    description: 'Celebration of college foundation day',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 25, 9, 0), // 25th of current month, 9 AM
    endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 25, 17, 0), // 25th of current month, 5 PM
    location: 'College Auditorium',
    type: 'event',
    forClass: 'all',
    forSubject: '',
    color: '#FF9800', // Orange
    isRecurring: false,
    createdBy: '60d0fe4f5311236168a109cb', // admin user
    createdAt: new Date(Date.now() - 2592000000) // 30 days ago
  },
  {
    _id: '60d0fe4f5311236168a109f4',
    title: 'Database Management Lab',
    description: 'Practical session for Database Management',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 14, 0), // Tomorrow, 2 PM
    endDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 16, 0), // Tomorrow, 4 PM
    location: 'Computer Lab 2',
    type: 'lab',
    forClass: 'Second Year',
    forSubject: 'Database Management',
    color: '#2196F3', // Blue
    isRecurring: true,
    recurrencePattern: {
      frequency: 'weekly',
      daysOfWeek: [2, 4], // Tuesday, Thursday
      endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 3, new Date().getDate()) // 3 months from now
    },
    createdBy: '60d0fe4f5311236168a109cc', // teacher user
    createdAt: new Date(Date.now() - 432000000) // 5 days ago
  },
  {
    _id: '60d0fe4f5311236168a109f5',
    title: 'Summer Vacation',
    description: 'Summer vacation for all students',
    startDate: new Date(new Date().getFullYear(), 5, 1, 0, 0), // June 1st, 12 AM
    endDate: new Date(new Date().getFullYear(), 6, 31, 23, 59), // July 31st, 11:59 PM
    location: '',
    type: 'holiday',
    forClass: 'all',
    forSubject: '',
    color: '#9C27B0', // Purple
    isRecurring: false,
    createdBy: '60d0fe4f5311236168a109cb', // admin user
    createdAt: new Date(Date.now() - 7776000000) // 90 days ago
  }
];

// Mock CalendarEvent model
class MockCalendarEvent {
  static async find(query = {}) {
    let events = [...mockCalendarEvents];
    
    // Filter by class if specified
    if (query.forClass) {
      events = events.filter(event => 
        event.forClass === query.forClass || event.forClass === 'all'
      );
    }
    
    // Filter by date range if specified
    if (query.startDate && query.endDate) {
      const startDate = new Date(query.startDate);
      const endDate = new Date(query.endDate);
      
      events = events.filter(event => {
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);
        
        return (eventStart >= startDate && eventStart <= endDate) || 
               (eventEnd >= startDate && eventEnd <= endDate) ||
               (eventStart <= startDate && eventEnd >= endDate);
      });
    }
    
    return events;
  }

  static async findById(id) {
    return mockCalendarEvents.find(event => event._id === id);
  }

  static async findByIdAndUpdate(id, update) {
    const event = mockCalendarEvents.find(event => event._id === id);
    if (!event) return null;

    Object.assign(event, update);
    return event;
  }

  static async findByIdAndDelete(id) {
    const index = mockCalendarEvents.findIndex(event => event._id === id);
    if (index === -1) return null;

    const deleted = mockCalendarEvents.splice(index, 1)[0];
    return deleted;
  }
}

module.exports = MockCalendarEvent;
