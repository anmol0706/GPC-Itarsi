const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://GPC:anmol4328@gpc-itarsi.puza0ta.mongodb.net/gpc-itarsi';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    createAdminUser();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Create admin user
async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'operator' });
    
    if (existingAdmin) {
      console.log('Admin user "operator" already exists. Updating password...');

      // Update password - let the pre-save middleware handle hashing
      existingAdmin.password = '1234';
      await existingAdmin.save();

      console.log('Admin user password updated successfully');
    } else {
      console.log('Creating new admin user "operator"...');

      // Create new admin - let the pre-save middleware handle hashing
      const admin = new User({
        username: 'operator',
        password: '1234', // Plain text password - will be hashed by pre-save middleware
        name: 'Operator Admin',
        role: 'admin',
        email: 'operator@gpcitarsi.edu.in',
        profilePicture: 'default-profile.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await admin.save();
      console.log('Admin user created successfully');
    }
    
    console.log('Admin details:');
    console.log('Username: operator');
    console.log('Password: 1234');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}
