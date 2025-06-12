const jwt = require('jsonwebtoken');
const User = require('../models/User');
const MockUser = require('../models/MockUser');
const { authCache, userCache, getUserById, cacheUser } = require('../utils/cache');
const { measureExecutionTime, recordTokenVerification } = require('../utils/performance');

// Always use the real User model since we're connected to MongoDB Atlas
const UserModel = User;

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const startTime = performance.now();
  const path = req.path;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Only log detailed info for non-common paths to reduce log noise
  const isCommonPath = path.includes('/api/auth/me') || path.includes('/api/overview');

  if (!isCommonPath) {
    console.log('Authentication check for path:', path);
    // Reduce logging of sensitive data
    console.log('Authorization header:', authHeader ? `${authHeader.substring(0, 15)}...` : 'none');
    console.log('Extracted token:', token ? `${token.substring(0, 10)}...` : 'none');
  }

  if (!token) {
    console.log('No token provided for path:', path);
    return res.status(401).json({ message: 'Authentication token required' });
  }

  if (!isCommonPath) {
    console.log('Token found for path:', path);
  }

  try {
    // Check token cache first
    const cacheKey = `token:${token.substring(0, 50)}`; // Use first 50 chars as key
    let decoded = authCache.get(cacheKey);
    let verificationTime = 0;

    if (!decoded) {
      // Token not in cache, verify it
      if (!isCommonPath) {
        // Log token format for debugging (only first few characters)
        console.log('Token format check:', token.substring(0, 10) + '...');
        console.log('Token length:', token.length);
      }

      // Check if token is malformed before verification
      let cleanToken = token;
      if (token.includes(' ') || token.includes('\n') || token.includes('\t')) {
        console.error('Token contains whitespace characters, cleaning...');
        cleanToken = token.trim().replace(/\s+/g, '');
      }

      // Measure token verification time
      const verificationStart = performance.now();

      if (!isCommonPath) {
        console.log('Attempting to verify JWT token with secret');
      }

      decoded = jwt.verify(cleanToken, process.env.JWT_SECRET || 'your-jwt-secret-key');

      verificationTime = performance.now() - verificationStart;

      if (!isCommonPath) {
        console.log('JWT token verified successfully in', verificationTime.toFixed(2), 'ms');
      }

      // Cache the decoded token for future requests
      // Set TTL to slightly less than token expiry to ensure we don't cache expired tokens
      const tokenTTL = 60 * 60; // 1 hour (assuming token expires in 24h)
      authCache.set(cacheKey, decoded, tokenTTL);

      // Record token verification performance
      recordTokenVerification(true, verificationTime);
    } else if (!isCommonPath) {
      console.log('Token found in cache');
    }

    // Get the user from cache or database
    if (decoded && decoded.id) {
      let user;
      const userId = decoded.id;

      // Try to get user from cache first
      user = getUserById(userId);

      if (!user) {
        if (!isCommonPath) {
          console.log('User not in cache, looking up user data for ID:', userId);
        }

        // Measure database query time
        const dbQueryStart = performance.now();
        user = await UserModel.findById(userId);
        const dbQueryTime = performance.now() - dbQueryStart;

        if (!isCommonPath) {
          console.log('Database query completed in', dbQueryTime.toFixed(2), 'ms');
        }

        if (!user) {
          console.log('User not found for token ID:', userId);
          return res.status(403).json({ message: 'User not found for token' });
        }

        // Cache the user for future requests
        cacheUser(userId, user);
      } else if (!isCommonPath) {
        console.log('User found in cache');
      }

      if (!isCommonPath) {
        console.log('User found:', user.name);
      }

      req.user = {
        id: user._id.toString(), // Convert ObjectId to string for easier comparison
        _id: user._id.toString(), // Keep both id and _id for compatibility
        username: decoded.username || user.username || user.name.toLowerCase(),
        role: user.role,
        name: user.name,
        department: user.department,
        subjects: user.subjects,
        rollNumber: user.rollNumber,
        class: user.class,
        title: user.title
      };

      if (!isCommonPath) {
        console.log('User ID set in request:', req.user.id, 'with role:', req.user.role);
      }
    } else {
      console.log('No user ID in token, using decoded token data directly');
      req.user = decoded;

      // Ensure ID is set correctly and converted to string
      if (!req.user.id && req.user._id) {
        console.log('Setting req.user.id from req.user._id');
        req.user.id = req.user._id.toString();
      } else if (req.user.id && !req.user._id) {
        console.log('Setting req.user._id from req.user.id');
        req.user._id = req.user.id.toString();
      } else if (req.user.id) {
        // Make sure both are strings
        req.user.id = req.user.id.toString();
        req.user._id = req.user.id;
      }
    }

    // Calculate total authentication time
    const totalTime = performance.now() - startTime;

    // Only log timing for non-common paths to reduce log noise
    if (!isCommonPath && totalTime > 100) { // Only log slow authentications
      console.log(`Authentication completed in ${totalTime.toFixed(2)} ms for path: ${path}`);
    }

    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
    console.error('JWT Secret used:', process.env.JWT_SECRET ? 'Secret exists (hidden)' : 'No secret');
    console.error('Token length:', token ? token.length : 'N/A');

    // Check if token is malformed and provide more specific error
    if (error.name === 'JsonWebTokenError' && error.message === 'jwt malformed') {
      console.error('Token appears to be malformed. This could be due to:');
      console.error('1. Incorrect token format');
      console.error('2. Token corruption during transmission');
      console.error('3. Frontend not sending the token correctly');
    }

    // Record failed token verification
    recordTokenVerification(false, performance.now() - startTime);

    return res.status(403).json({ message: 'Invalid or expired token', error: error.message });
  }
};

// Role-based authorization middleware
const authorize = (roles) => {
  return (req, res, next) => {
    console.log('Authorization check - User role:', req.user?.role, 'Required roles:', roles);

    // Make sure user and role exist
    if (!req.user || !req.user.role) {
      console.log('User or role not defined in request');
      return res.status(403).json({ message: 'Access denied - user role not defined' });
    }

    // Special case for admin role - admins should have access to everything
    if (req.user.role === 'admin') {
      console.log('Admin access granted for user:', req.user.username || req.user.id);
      return next();
    }

    // Check if user role is in the allowed roles
    if (roles.includes(req.user.role)) {
      console.log('Access granted for user:', req.user.username || req.user.id);
      return next();
    }

    console.log('Access denied for user:', req.user.username || req.user.id);
    return res.status(403).json({ message: 'Access denied - insufficient permissions' });
  };
};

module.exports = { authenticateToken, authorize };
