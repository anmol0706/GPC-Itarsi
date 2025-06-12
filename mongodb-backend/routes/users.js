const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all users (admin only)
router.get('/', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    // Only allow users to access their own data unless they're an admin
    if (req.user.role !== 'admin' && req.params.id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// Create a new user (admin only)
router.post('/', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { username, password, name, role, email } = req.body;

    // Check if username already exists
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create new user
    const user = new User({
      username: username.toLowerCase(),
      password,
      name,
      role,
      email
    });

    // Add role-specific fields
    if (role === 'teacher') {
      user.department = req.body.department;
      user.subjects = req.body.subjects || [];
    } else if (role === 'student') {
      user.rollNumber = req.body.rollNumber;
      user.class = req.body.class;
      user.branch = req.body.branch;
    } else if (role === 'developer') {
      user.title = req.body.title;
    }

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
});

// Update user (admin or self)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Only allow users to update their own data unless they're an admin
    if (req.user.role !== 'admin' && req.params.id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow role changes unless admin
    if (req.body.role && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Cannot change role' });
    }

    // Update fields
    const fieldsToUpdate = ['name', 'email'];

    // Admin can update any field
    if (req.user.role === 'admin') {
      fieldsToUpdate.push('role', 'username');
    }

    // Update basic fields
    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // Update password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }

    // Update role-specific fields
    if (user.role === 'teacher') {
      if (req.body.department) user.department = req.body.department;
      if (req.body.subjects) user.subjects = req.body.subjects;
    } else if (user.role === 'student') {
      if (req.body.rollNumber) user.rollNumber = req.body.rollNumber;
      if (req.body.class) user.class = req.body.class;
      if (req.body.branch) user.branch = req.body.branch;
      if (req.body.attendance !== undefined) user.attendance = req.body.attendance;
    } else if (user.role === 'developer') {
      if (req.body.title) user.title = req.body.title;
    }

    user.updatedAt = Date.now();
    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
});

// Change user role (admin only)
router.put('/:id/change-role', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }

    // Validate role
    const validRoles = ['admin', 'teacher', 'student', 'hod', 'principal'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Find the user
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if this is the last admin
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot change the last admin account' });
      }
    }

    // Store the old role for reference
    const oldRole = user.role;

    // Update the role
    user.role = role;

    // Handle role-specific fields
    if (role === 'student' && oldRole !== 'student') {
      // If changing to student, set required student fields
      if (!user.rollNumber) {
        // Generate a unique roll number if not present
        const year = new Date().getFullYear();
        const branch = 'CS'; // Default branch
        const count = await User.countDocuments({ role: 'student' });
        user.rollNumber = `${branch}${year}${(count + 1).toString().padStart(3, '0')}`;
      }
      if (!user.class) user.class = 'First Year';
      if (!user.branch) user.branch = 'CS';
      if (user.attendance === undefined) user.attendance = 0;
    }

    if (role === 'teacher' && oldRole !== 'teacher') {
      // If changing to teacher, set required teacher fields
      if (!user.department) user.department = 'Computer Science';
      if (!user.subjects) user.subjects = [];
    }

    if (role === 'hod' && oldRole !== 'hod') {
      // If changing to HOD, set required HOD fields
      if (!user.department) user.department = 'Computer Science';
      if (!user.designation) user.designation = `Head of Department, ${user.department || 'Computer Science'}`;
    }

    if (role === 'principal' && oldRole !== 'principal') {
      // If changing to principal, set required principal fields
      if (!user.designation) user.designation = 'Principal, Government Polytechnic College, Itarsi';
    }

    if (role === 'developer' && oldRole !== 'developer') {
      // If changing to developer, set required developer fields
      if (!user.title) user.title = 'Web Developer';
    }

    user.updatedAt = Date.now();
    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: 'User role updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Error changing user role:', error);
    res.status(500).json({ message: 'Failed to change user role', error: error.message });
  }
});

// Update profile picture
router.put('/:id/profile-picture', authenticateToken, upload.single('profilePicture'), async (req, res) => {
  try {
    // Only allow users to update their own profile picture unless they're an admin
    if (req.user.role !== 'admin' && req.params.id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profilePicture = req.file.filename;
    user.updatedAt = Date.now();
    await user.save();

    res.json({
      message: 'Profile picture updated successfully',
      profilePicture: user.profilePicture
    });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ message: 'Failed to update profile picture' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

module.exports = router;
