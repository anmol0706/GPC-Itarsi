const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  // Removed plainTextPassword field for security
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'student', 'developer', 'hod', 'principal'],
    required: true
  },
  email: {
    type: String,
    match: [/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please provide a valid email address'],
    sparse: true
  },
  phone: {
    type: String,
    sparse: true
  },
  bio: {
    type: String,
    sparse: true
  },
  profilePicture: {
    type: String,
    default: 'default-profile.jpg'
  },
  cloudinaryPublicId: {
    type: String
  },
  // Fields for teacher role
  department: {
    type: String,
    required: function() { return this.role === 'teacher'; }
  },
  subjects: {
    type: [String],
    default: function() { return this.role === 'teacher' ? [] : undefined; }
  },
  qualification: {
    type: String,
    sparse: true
  },
  experience: {
    type: String,
    sparse: true
  },
  designation: {
    type: String,
    sparse: true
  },
  displayOrder: {
    type: Number,
    default: 9999, // Default to a high number so new faculty appear at the end
    sparse: true
  },
  profileComplete: {
    type: Boolean,
    default: false
  },
  // Fields for student role
  rollNumber: {
    type: String,
    required: function() { return this.role === 'student'; },
    unique: function() { return this.role === 'student'; },
    sparse: true
  },
  class: {
    type: String,
    required: function() { return this.role === 'student'; }
  },
  branch: {
    type: String,
    enum: ['CS', 'ME', 'ET', 'EE'],
    required: function() { return this.role === 'student'; }
  },
  attendance: {
    type: Number,
    min: 0,
    max: 100,
    default: function() { return this.role === 'student' ? 0 : undefined; }
  },
  // Fields for developer role
  title: {
    type: String,
    required: function() { return this.role === 'developer'; }
  },
  // Password reset fields
  resetPasswordToken: {
    type: String,
    sparse: true
  },
  resetPasswordExpires: {
    type: Date,
    sparse: true
  },
  // OTP for password reset
  resetOTP: {
    type: String,
    sparse: true
  },
  resetOTPExpires: {
    type: Date,
    sparse: true
  },
  // Common fields
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) return next();

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Hash the password along with the new salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error('Error in password hashing:', error);
    next(error);
  }
});

// Method to compare password for login
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate password reset token
UserSchema.methods.generatePasswordResetToken = function() {
  // Generate a random token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash the token and set it to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set token expiry time (1 hour from now)
  this.resetPasswordExpires = Date.now() + 3600000; // 1 hour

  return resetToken;
};

// Method to generate OTP for password reset
UserSchema.methods.generatePasswordResetOTP = function() {
  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash the OTP and store it
  this.resetOTP = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');

  // Set OTP expiry time (10 minutes from now)
  this.resetOTPExpires = Date.now() + 600000; // 10 minutes

  return otp;
};

module.exports = mongoose.model('User', UserSchema);
