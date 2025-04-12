const fs = require('fs');
const path = require('path');

// Path to data directory
const dataDir = path.join(__dirname, '../data');
console.log('Data directory path:', dataDir);

// Helper function to read data from a JSON file
const readData = (fileName) => {
  try {
    const filePath = path.join(dataDir, fileName);
    // Only log file path in debug mode
    if (process.env.DEBUG) {
      console.log(`Reading file: ${filePath}`);
    }
    if (!fs.existsSync(filePath)) {
      console.error(`File does not exist: ${filePath}`);
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    // Only log file content in debug mode
    if (process.env.DEBUG) {
      console.log(`File content: ${data}`);
    }
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${fileName}:`, error);
    return [];
  }
};

// Helper function to write data to a JSON file
const writeData = (fileName, data) => {
  try {
    const filePath = path.join(dataDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing to ${fileName}:`, error);
    return false;
  }
};

// Generate a unique ID
const generateId = (prefix) => {
  return `${prefix}${Date.now()}`;
};

// User data operations - Now using teachers.json and students.json instead of users.json
const getUserById = (id) => {
  // Check if it's a teacher ID
  if (id.startsWith('teacher_')) {
    return getTeacherById(id);
  }
  // Check if it's a student ID
  else if (id.startsWith('student_')) {
    return getStudentById(id);
  }
  // Check if it's an admin ID
  else if (id.startsWith('admin_')) {
    const admins = readData('admin.json');
    return admins.find(admin => admin._id === id);
  }
  return null;
};

const getUserByUsername = (username) => {
  // Make the username comparison case-insensitive
  const lowerUsername = username.toLowerCase();
  console.log('Looking for username:', lowerUsername);

  // Check if it's an admin
  const admins = readData('admin.json');
  console.log('Admins found:', admins);
  const admin = admins.find(admin => admin.username.toLowerCase() === lowerUsername);
  console.log('Admin match found:', admin ? 'Yes' : 'No');
  if (admin) {
    return admin;
  }

  // Check if it's a teacher (using username field if available, otherwise name)
  const teachers = getTeachers();
  // First try to find by username field
  const teacher = teachers.find(t => t.username && t.username.toLowerCase() === lowerUsername);
  if (teacher) {
    return {
      _id: teacher._id,
      username: teacher.username.toLowerCase(),
      password: teacher.password || '1234', // Use stored password or default
      role: 'teacher',
      name: teacher.name,
      department: teacher.department,
      subjects: teacher.subjects,
      profilePicture: teacher.profilePicture
    };
  }

  // If not found by username, try by name (for backward compatibility)
  const teacherByName = teachers.find(t => t.name.toLowerCase() === lowerUsername);
  if (teacherByName) {
    return {
      _id: teacherByName._id,
      username: teacherByName.name.toLowerCase(),
      password: teacherByName.password || '1234', // Use stored password or default
      role: 'teacher',
      name: teacherByName.name,
      department: teacherByName.department,
      subjects: teacherByName.subjects,
      profilePicture: teacherByName.profilePicture
    };
  }

  // Check if it's a student (using rollNumber as username)
  const students = getStudents();
  const student = students.find(s => s.rollNumber && s.rollNumber.toLowerCase() === lowerUsername);
  if (student) {
    return {
      _id: student._id,
      username: student.rollNumber.toLowerCase(),
      password: student.password || '1234', // Use stored password or default
      role: 'student',
      name: student.name,
      rollNumber: student.rollNumber,
      class: student.class,
      attendance: student.attendance,
      profilePicture: student.profilePicture
    };
  }

  return null;
};

// These functions are no longer needed as we're using teachers.json and students.json directly
// Keeping them as stubs for backward compatibility
const addUser = (user) => {
  // Just return the user object as if it was added successfully
  // We're not actually adding to a users.json file anymore
  return { ...user, _id: user._id || generateId(`${user.role}_`) };
};

const updateUser = (id, userData) => {
  if (id.startsWith('teacher_')) {
    return updateTeacher(id, userData);
  } else if (id.startsWith('student_')) {
    return updateStudent(id, userData);
  } else if (id.startsWith('admin_')) {
    // Handle admin user updates
    const admins = readData('admin.json');
    const index = admins.findIndex(admin => admin._id === id);
    if (index === -1) return null;

    admins[index] = { ...admins[index], ...userData };
    return writeData('admin.json', admins) ? admins[index] : null;
  }
  return null;
};

const deleteUser = (id) => {
  if (id.startsWith('teacher_')) {
    return deleteTeacher(id);
  } else if (id.startsWith('student_')) {
    return deleteStudent(id);
  }
  return false;
};

// Get all users (combining students and teachers)
const getUsers = () => {
  const students = getStudents().map(student => ({
    _id: student._id,
    username: student.rollNumber.toLowerCase(),
    role: 'student',
    name: student.name,
    rollNumber: student.rollNumber,
    class: student.class
  }));

  const teachers = getTeachers().map(teacher => ({
    _id: teacher._id,
    username: teacher.username || teacher.name.toLowerCase(),
    role: 'teacher',
    name: teacher.name,
    department: teacher.department,
    subjects: teacher.subjects
  }));

  const admins = readData('admin.json');

  return [...students, ...teachers, ...admins];
};

// Student data operations
const getStudents = () => readData('students.json');
const getStudentById = (id) => {
  const students = getStudents();
  return students.find(student => student._id === id);
};
const addStudent = (student) => {
  const students = getStudents();
  const newStudent = { ...student, _id: generateId('student_') };
  students.push(newStudent);
  return writeData('students.json', students) ? newStudent : null;
};
const updateStudent = (id, studentData) => {
  const students = getStudents();
  const index = students.findIndex(student => student._id === id);
  if (index === -1) return null;

  students[index] = { ...students[index], ...studentData };
  return writeData('students.json', students) ? students[index] : null;
};
const deleteStudent = (id) => {
  const students = getStudents();
  const filteredStudents = students.filter(student => student._id !== id);
  return writeData('students.json', filteredStudents);
};

// Teacher data operations
const getTeachers = () => readData('teachers.json');
const getTeacherById = (id) => {
  const teachers = getTeachers();
  return teachers.find(teacher => teacher._id === id);
};
const addTeacher = (teacher) => {
  const teachers = getTeachers();
  // Make sure to include username and password if provided
  const newTeacher = {
    ...teacher,
    _id: generateId('teacher_'),
    // Store username and password if provided
    username: teacher.username || teacher.name.toLowerCase(),
    password: teacher.password || '1234'
  };
  teachers.push(newTeacher);
  return writeData('teachers.json', teachers) ? newTeacher : null;
};
const updateTeacher = (id, teacherData) => {
  const teachers = getTeachers();
  const index = teachers.findIndex(teacher => teacher._id === id);
  if (index === -1) return null;

  teachers[index] = { ...teachers[index], ...teacherData };
  return writeData('teachers.json', teachers) ? teachers[index] : null;
};
const deleteTeacher = (id) => {
  const teachers = getTeachers();
  const filteredTeachers = teachers.filter(teacher => teacher._id !== id);
  return writeData('teachers.json', filteredTeachers);
};

// Notice data operations
const getNotices = () => readData('notices.json');
const getNoticeById = (id) => {
  const notices = getNotices();
  return notices.find(notice => notice._id === id);
};
const addNotice = (notice) => {
  const notices = getNotices();
  const newNotice = {
    ...notice,
    _id: generateId('notice_'),
    createdAt: new Date().toISOString()
  };
  notices.push(newNotice);
  return writeData('notices.json', notices) ? newNotice : null;
};
const updateNotice = (id, noticeData) => {
  const notices = getNotices();
  const index = notices.findIndex(notice => notice._id === id);
  if (index === -1) return null;

  notices[index] = { ...notices[index], ...noticeData };
  return writeData('notices.json', notices) ? notices[index] : null;
};
const deleteNotice = (id) => {
  const notices = getNotices();
  const filteredNotices = notices.filter(notice => notice._id !== id);
  return writeData('notices.json', filteredNotices);
};

// Gallery data operations
const getGallery = () => readData('gallery.json');
const getGalleryItemById = (id) => {
  const gallery = getGallery();
  return gallery.find(item => item._id === id);
};
const addGalleryItem = (item) => {
  const gallery = getGallery();
  const newItem = {
    ...item,
    _id: generateId('gallery_'),
    uploadDate: new Date().toISOString()
  };
  gallery.push(newItem);
  return writeData('gallery.json', gallery) ? newItem : null;
};
const updateGalleryItem = (id, itemData) => {
  const gallery = getGallery();
  const index = gallery.findIndex(item => item._id === id);
  if (index === -1) return null;

  gallery[index] = { ...gallery[index], ...itemData };
  return writeData('gallery.json', gallery) ? gallery[index] : null;
};
const deleteGalleryItem = (id) => {
  const gallery = getGallery();
  const filteredGallery = gallery.filter(item => item._id !== id);
  return writeData('gallery.json', filteredGallery);
};

// Course data operations
const getCourses = () => readData('courses.json');
const getCourseById = (id) => {
  const courses = getCourses();
  return courses.find(course => course._id === id);
};
const addCourse = (course) => {
  const courses = getCourses();
  const newCourse = {
    ...course,
    _id: generateId('course_')
  };
  courses.push(newCourse);
  return writeData('courses.json', courses) ? newCourse : null;
};
const updateCourse = (id, courseData) => {
  const courses = getCourses();
  const index = courses.findIndex(course => course._id === id);
  if (index === -1) return null;

  courses[index] = { ...courses[index], ...courseData };
  return writeData('courses.json', courses) ? courses[index] : null;
};
const deleteCourse = (id) => {
  const courses = getCourses();
  const filteredCourses = courses.filter(course => course._id !== id);
  return writeData('courses.json', filteredCourses);
};

// Study Materials operations
const getStudyMaterials = () => readData('study-materials.json');
const getStudyMaterialById = (id) => {
  const materials = getStudyMaterials();
  return materials.find(material => material._id === id);
};
const addStudyMaterial = (material) => {
  const materials = getStudyMaterials();
  const newMaterial = { ...material, _id: generateId('material_') };
  materials.push(newMaterial);
  return writeData('study-materials.json', materials) ? newMaterial : null;
};
const updateStudyMaterial = (id, updates) => {
  const materials = getStudyMaterials();
  const index = materials.findIndex(material => material._id === id);
  if (index === -1) return null;
  materials[index] = { ...materials[index], ...updates };
  return writeData('study-materials.json', materials) ? materials[index] : null;
};
const deleteStudyMaterial = (id) => {
  const materials = getStudyMaterials();
  const filteredMaterials = materials.filter(material => material._id !== id);
  return writeData('study-materials.json', filteredMaterials);
};

// Overview operations
const getOverview = () => readData('overview.json');
const updateOverview = (updates) => {
  const overview = getOverview();
  if (overview.length === 0) {
    const newOverview = { ...updates, _id: generateId('overview_') };
    return writeData('overview.json', [newOverview]) ? newOverview : null;
  }
  overview[0] = { ...overview[0], ...updates };
  return writeData('overview.json', overview) ? overview[0] : null;
};

// Attendance operations
const getAttendance = () => readData('attendance.json');
const getStudentAttendance = (studentId) => {
  const attendance = getAttendance();

  // First try to find by exact studentId match
  let studentAttendance = attendance.find(record => record.studentId === studentId);

  if (!studentAttendance) {
    // If not found, try to find by partial match (for backward compatibility)
    studentAttendance = attendance.find(record =>
      record.studentId && (record.studentId.includes(studentId) || studentId.includes(record.studentId))
    );
  }

  // If we have a student object, we can also try to find by roll number
  if (!studentAttendance && studentId.startsWith('student_')) {
    // Try to get the student object to find the roll number
    const student = getStudentById(studentId);
    if (student && student.rollNumber) {
      // Try to find attendance by roll number
      studentAttendance = attendance.find(record =>
        record.rollNumber && record.rollNumber.toLowerCase() === student.rollNumber.toLowerCase()
      );
    }
  }

  return studentAttendance;
};
const addAttendanceRecord = (record) => {
  const attendance = getAttendance();

  // First try to find by studentId
  let existingIndex = attendance.findIndex(r => r.studentId === record.studentId);

  // If not found, try to find by roll number (case insensitive)
  if (existingIndex === -1 && record.rollNumber) {
    existingIndex = attendance.findIndex(r =>
      r.rollNumber && r.rollNumber.toLowerCase() === record.rollNumber.toLowerCase()
    );
  }

  if (existingIndex === -1) {
    // Add new student attendance record
    const newRecord = { ...record, _id: generateId('attendance_') };
    console.log('Adding new attendance record with ID:', newRecord._id);
    attendance.push(newRecord);
    return writeData('attendance.json', attendance) ? newRecord : null;
  } else {
    // Update existing student attendance record
    console.log('Updating existing attendance record with ID:', attendance[existingIndex]._id);

    // Update the studentId to ensure consistency
    if (record.studentId) {
      attendance[existingIndex].studentId = record.studentId;
    }

    // Add the new attendance record
    attendance[existingIndex].records.push(record.records[0]);
    return writeData('attendance.json', attendance) ? attendance[existingIndex] : null;
  }
};

// Reset attendance for a specific student
const resetStudentAttendance = (studentId) => {
  const attendance = getAttendance();

  // Find the student's attendance record
  const studentIndex = attendance.findIndex(record => record.studentId === studentId);

  if (studentIndex === -1) {
    return false; // Student not found
  }

  // Keep the student's basic info but reset the records
  attendance[studentIndex].records = [];

  return writeData('attendance.json', attendance);
};

// Reset attendance for all students
const resetAllAttendance = () => {
  const attendance = getAttendance();

  // Reset records for all students
  const resetAttendance = attendance.map(record => ({
    ...record,
    records: []
  }));

  return writeData('attendance.json', resetAttendance);
};

// Quick Links operations
const getQuickLinks = () => readData('quick-links.json');
const getQuickLinkById = (id) => {
  const links = getQuickLinks();
  return links.find(link => link._id === id);
};
const addQuickLink = (link) => {
  const links = getQuickLinks();
  const newLink = {
    ...link,
    _id: generateId('link_'),
    createdAt: new Date().toISOString()
  };
  links.push(newLink);
  return writeData('quick-links.json', links) ? newLink : null;
};
const updateQuickLink = (id, linkData) => {
  const links = getQuickLinks();
  const index = links.findIndex(link => link._id === id);
  if (index === -1) return null;

  links[index] = { ...links[index], ...linkData };
  return writeData('quick-links.json', links) ? links[index] : null;
};
const deleteQuickLink = (id) => {
  const links = getQuickLinks();
  const filteredLinks = links.filter(link => link._id !== id);
  return writeData('quick-links.json', filteredLinks);
};

// Custom Buttons operations
const getCustomButtons = () => readData('custom-buttons.json');
const getCustomButtonById = (id) => {
  const buttons = getCustomButtons();
  return buttons.find(button => button._id === id);
};
const addCustomButton = (button) => {
  const buttons = getCustomButtons();
  // Get existing buttons to determine the next order value
  const maxOrder = buttons.length > 0 ? Math.max(...buttons.map(btn => btn.order || 0)) : 0;

  const newButton = {
    ...button,
    _id: generateId('button_'),
    order: button.order || maxOrder + 1,
    createdAt: new Date().toISOString()
  };
  buttons.push(newButton);
  return writeData('custom-buttons.json', buttons) ? newButton : null;
};
const updateCustomButton = (id, buttonData) => {
  const buttons = getCustomButtons();
  const index = buttons.findIndex(button => button._id === id);
  if (index === -1) return null;

  buttons[index] = { ...buttons[index], ...buttonData };
  return writeData('custom-buttons.json', buttons) ? buttons[index] : null;
};
const deleteCustomButton = (id) => {
  const buttons = getCustomButtons();
  const filteredButtons = buttons.filter(button => button._id !== id);
  return writeData('custom-buttons.json', filteredButtons);
};

// Chatbot FAQ operations
const getChatbotFaqs = () => readData('chatbot-faqs.json');
const getChatbotFaqById = (id) => {
  const faqs = getChatbotFaqs();
  return faqs.find(faq => faq._id === id);
};
const addChatbotFaq = (faq) => {
  const faqs = getChatbotFaqs();
  const newFaq = {
    ...faq,
    _id: generateId('faq_'),
    keywords: faq.keywords || [],
    createdAt: new Date().toISOString()
  };
  faqs.push(newFaq);
  return writeData('chatbot-faqs.json', faqs) ? newFaq : null;
};
const updateChatbotFaq = (id, faqData) => {
  const faqs = getChatbotFaqs();
  const index = faqs.findIndex(faq => faq._id === id);
  if (index === -1) return null;

  faqs[index] = { ...faqs[index], ...faqData };
  return writeData('chatbot-faqs.json', faqs) ? faqs[index] : null;
};
const deleteChatbotFaq = (id) => {
  const faqs = getChatbotFaqs();
  const filteredFaqs = faqs.filter(faq => faq._id !== id);
  return writeData('chatbot-faqs.json', filteredFaqs);
};

// Chatbot response function
const getChatbotResponse = (query) => {
  const faqs = getChatbotFaqs();
  if (!query || query.trim() === '') {
    return {
      found: false,
      message: 'Please ask a question about the college.'
    };
  }

  // Convert query to lowercase for case-insensitive matching
  const lowerQuery = query.toLowerCase();

  // First, try to find an exact match in questions
  const exactMatch = faqs.find(faq =>
    faq.question.toLowerCase() === lowerQuery
  );

  if (exactMatch) {
    return {
      found: true,
      question: exactMatch.question,
      answer: exactMatch.answer
    };
  }

  // Next, try to find a partial match in questions
  const questionMatches = faqs.filter(faq =>
    faq.question.toLowerCase().includes(lowerQuery)
  );

  if (questionMatches.length > 0) {
    // Return the first match
    return {
      found: true,
      question: questionMatches[0].question,
      answer: questionMatches[0].answer
    };
  }

  // Finally, try to match keywords
  const keywordMatches = faqs.filter(faq =>
    faq.keywords && faq.keywords.some(keyword =>
      lowerQuery.includes(keyword.toLowerCase())
    )
  );

  if (keywordMatches.length > 0) {
    // Return the first match
    return {
      found: true,
      question: keywordMatches[0].question,
      answer: keywordMatches[0].answer
    };
  }

  // No match found
  return {
    found: false,
    message: "I'm sorry, I don't have information about that. Please try asking something else about the college."
  };
};

module.exports = {
  // User operations (now using teachers.json and students.json)
  getUserById,
  getUserByUsername,
  addUser,
  updateUser,
  deleteUser,
  getUsers,

  // Student operations
  getStudents,
  getStudentById,
  addStudent,
  updateStudent,
  deleteStudent,

  // Teacher operations
  getTeachers,
  getTeacherById,
  addTeacher,
  updateTeacher,
  deleteTeacher,

  // Notice operations
  getNotices,
  getNoticeById,
  addNotice,
  updateNotice,
  deleteNotice,

  // Gallery operations
  getGallery,
  getGalleryItemById,
  addGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,

  // Course operations
  getCourses,
  getCourseById,
  addCourse,
  updateCourse,
  deleteCourse,

  // Study Materials operations
  getStudyMaterials,
  getStudyMaterialById,
  addStudyMaterial,
  updateStudyMaterial,
  deleteStudyMaterial,

  // Overview operations
  getOverview,
  updateOverview,

  // Attendance operations
  getAttendance,
  getStudentAttendance,
  addAttendanceRecord,
  resetStudentAttendance,
  resetAllAttendance,

  // Quick Links operations
  getQuickLinks,
  getQuickLinkById,
  addQuickLink,
  updateQuickLink,
  deleteQuickLink,

  // Custom Buttons operations
  getCustomButtons,
  getCustomButtonById,
  addCustomButton,
  updateCustomButton,
  deleteCustomButton,

  // Chatbot operations
  getChatbotFaqs,
  getChatbotFaqById,
  addChatbotFaq,
  updateChatbotFaq,
  deleteChatbotFaq,
  getChatbotResponse
};
