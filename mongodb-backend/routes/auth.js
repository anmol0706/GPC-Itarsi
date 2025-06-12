const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const MockUser = require('../models/MockUser');
const { authenticateToken } = require('../middleware/auth');
const {
  getUserByUsername,
  getUserByRollNumber,
  cacheUser,
  cacheUsername,
  cacheRollNumber
} = require('../utils/cache');
const {
  measureExecutionTime,
  recordLoginAttempt,
  recordDatabaseQuery
} = require('../utils/performance');

// Always use the real User model since we're connected to MongoDB Atlas
const UserModel = User;

// Login route
router.post('/login', async (req, res) => {
  const startTime = performance.now();

  try {
    const { username, password } = req.body;
    console.log('Login attempt:', { username });

    let user;
    let fromCache = false;
    let searchMethod = '';

    // Try to get user from cache first
    if (username) {
      // Check if this looks like a roll number (typically contains numbers)
      const isLikelyRollNumber = /\d/.test(username);

      if (isLikelyRollNumber) {
        // Try to get from roll number cache first
        user = getUserByRollNumber(username);
        if (user) {
          fromCache = true;
          searchMethod = 'rollNumber-cache';
          console.log('User found in cache by roll number');
        }
      }

      // If not found by roll number or not a roll number, try username cache
      if (!user) {
        user = getUserByUsername(username);
        if (user) {
          fromCache = true;
          searchMethod = 'username-cache';
          console.log('User found in cache by username');
        }
      }
    }

    // If not found in cache, query the database
    if (!user) {
      // First, try to find user by roll number (for students)
      console.log('Searching database by roll number:', username);
      const rollNumberQueryStart = performance.now();

      user = await UserModel.findOne({
        rollNumber: { $regex: new RegExp('^' + username + '$', 'i') }
      });

      const rollNumberQueryTime = performance.now() - rollNumberQueryStart;
      recordDatabaseQuery('findUserByRollNumber', rollNumberQueryTime);

      if (user) {
        searchMethod = 'rollNumber-db';
        // Cache the user for future requests
        cacheUser(user._id.toString(), user);
        cacheRollNumber(username, user._id.toString());
        console.log('User found in database by roll number, cached for future requests');
      }

      // If not found by roll number, try by username
      if (!user) {
        console.log('User not found by roll number, trying username:', username);
        const usernameQueryStart = performance.now();

        user = await UserModel.findOne({
          username: { $regex: new RegExp('^' + username + '$', 'i') }
        });

        const usernameQueryTime = performance.now() - usernameQueryStart;
        recordDatabaseQuery('findUserByUsername', usernameQueryTime);

        if (user) {
          searchMethod = 'username-db';
          // Cache the user for future requests
          cacheUser(user._id.toString(), user);
          cacheUsername(username, user._id.toString());
          console.log('User found in database by username, cached for future requests');
        }
      }
    }

    console.log('User found:', user ? `Yes (via ${searchMethod})` : 'No');

    if (!user) {
      console.log('Login failed: User not found');
      recordLoginAttempt(false, performance.now() - startTime);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    console.log('Verifying password for user:', username);
    console.log('Password provided:', password);
    console.log('Stored password hash:', user.password);
    const passwordVerifyStart = performance.now();
    const isMatch = await user.comparePassword(password);
    const passwordVerifyTime = performance.now() - passwordVerifyStart;
    console.log('Password comparison result:', isMatch);

    if (!isMatch) {
      console.log('Login failed: Invalid password');
      recordLoginAttempt(false, performance.now() - startTime);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`Password verified in ${passwordVerifyTime.toFixed(2)} ms`);
    console.log('Login successful for user:', username);

    // Create a user object without the password
    const userWithoutPassword = {
      _id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
      email: user.email,
      profilePicture: user.profilePicture,
      department: user.department,
      subjects: user.subjects,
      rollNumber: user.rollNumber,
      class: user.class,
      branch: user.branch,
      attendance: user.attendance,
      title: user.title,
      profileComplete: user.profileComplete
    };

    // Generate JWT token
    let token;
    try {
      const tokenGenStart = performance.now();
      console.log('Generating JWT token for user:', user._id);

      // Create a payload with only the essential information
      const payload = {
        id: user._id,
        username: user.username,
        role: user.role,
        name: user.name,
        profileComplete: user.profileComplete
      };

      // Sign the token with the JWT secret
      token = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'your-jwt-secret-key',
        { expiresIn: '24h' }
      );

      const tokenGenTime = performance.now() - tokenGenStart;
      console.log(`JWT token generated successfully in ${tokenGenTime.toFixed(2)} ms`);
    } catch (error) {
      console.error('Error generating JWT token:', error);
      recordLoginAttempt(false, performance.now() - startTime);
      return res.status(500).json({ message: 'Error generating authentication token' });
    }

    // Record successful login
    const totalLoginTime = performance.now() - startTime;
    recordLoginAttempt(true, totalLoginTime);

    console.log(`Login completed in ${totalLoginTime.toFixed(2)} ms`);

    res.json({
      token,
      user: userWithoutPassword
    });

    console.log('Login response sent:', { token: token.substring(0, 20) + '...', user: { ...userWithoutPassword, password: undefined } });
  } catch (error) {
    console.error('Login error:', error);
    recordLoginAttempt(false, performance.now() - startTime);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user route
router.get('/me', authenticateToken, async (req, res) => {
  const startTime = performance.now();

  try {
    // User data should already be in req.user from the authenticateToken middleware
    // which now uses caching, so we can just return that data directly in most cases

    // For backward compatibility and to ensure we have the latest data,
    // we'll do a quick check to make sure we have all the fields we need
    const requiredFields = ['_id', 'username', 'name', 'role'];
    const hasAllRequiredFields = requiredFields.every(field =>
      req.user && (req.user[field] || field === '_id' && req.user.id)
    );

    let user;

    if (hasAllRequiredFields) {
      // Use the user data from the request
      console.log('Using user data from request for /me endpoint');

      // Get the cached user to ensure we have all fields
      user = getUserById(req.user.id);

      if (!user) {
        // If not in cache for some reason, get from database
        console.log('User not in cache, fetching from database');
        const dbQueryStart = performance.now();
        user = await UserModel.findById(req.user.id);
        const dbQueryTime = performance.now() - dbQueryStart;

        recordDatabaseQuery('findUserById-me', dbQueryTime);

        if (user) {
          // Cache the user for future requests
          cacheUser(user._id.toString(), user);
        }
      }
    } else {
      // Fallback to database query if req.user doesn't have all required fields
      console.log('Incomplete user data in request, fetching from database');
      const dbQueryStart = performance.now();
      user = await UserModel.findById(req.user.id);
      const dbQueryTime = performance.now() - dbQueryStart;

      recordDatabaseQuery('findUserById-me-fallback', dbQueryTime);

      if (user) {
        // Cache the user for future requests
        cacheUser(user._id.toString(), user);
      }
    }

    if (!user) {
      console.log('User not found for /me endpoint with ID:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    const responseData = {
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        email: user.email,
        profilePicture: user.profilePicture,
        department: user.department,
        subjects: user.subjects,
        rollNumber: user.rollNumber,
        class: user.class,
        branch: user.branch,
        attendance: user.attendance,
        title: user.title,
        profileComplete: user.profileComplete
      }
    };

    const totalTime = performance.now() - startTime;
    console.log(`/me endpoint completed in ${totalTime.toFixed(2)} ms`);

    res.json(responseData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
