const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://GPC:anmol4328@gpc-itarsi.puza0ta.mongodb.net/gpc-itarsi';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    testPassword();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function testPassword() {
  try {
    // Find the operator user
    const user = await User.findOne({ username: 'operator' });
    
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }
    
    console.log('User found:', user.username);
    console.log('Stored password hash:', user.password);
    
    // Test password comparison
    const testPassword = '1234';
    console.log('Testing password:', testPassword);
    
    // Test with bcrypt.compare directly
    const isMatch1 = await bcrypt.compare(testPassword, user.password);
    console.log('bcrypt.compare result:', isMatch1);
    
    // Test with user method
    const isMatch2 = await user.comparePassword(testPassword);
    console.log('user.comparePassword result:', isMatch2);
    
    // Test creating a new hash
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(testPassword, salt);
    console.log('New hash for comparison:', newHash);
    
    const isMatch3 = await bcrypt.compare(testPassword, newHash);
    console.log('New hash comparison result:', isMatch3);
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing password:', error);
    process.exit(1);
  }
}
