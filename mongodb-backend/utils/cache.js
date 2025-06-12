/**
 * Cache utility for improving performance
 * Provides in-memory caching for frequently accessed data
 */
const NodeCache = require('node-cache');

// Create cache instances with different TTLs (Time To Live)
// Short-lived cache for authentication tokens (15 minutes)
const authCache = new NodeCache({
  stdTTL: 900, // 15 minutes in seconds
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false, // Don't clone objects (for better performance)
  deleteOnExpire: true, // Automatically delete expired items
});

// Medium-lived cache for user data (30 minutes)
const userCache = new NodeCache({
  stdTTL: 1800, // 30 minutes in seconds
  checkperiod: 300, // Check for expired keys every 5 minutes
  useClones: false, // Don't clone objects (for better performance)
  deleteOnExpire: true, // Automatically delete expired items
});

// Long-lived cache for static data (1 hour)
const staticCache = new NodeCache({
  stdTTL: 3600, // 1 hour in seconds
  checkperiod: 600, // Check for expired keys every 10 minutes
  useClones: false, // Don't clone objects (for better performance)
  deleteOnExpire: true, // Automatically delete expired items
});

// Cache statistics
let cacheHits = 0;
let cacheMisses = 0;

/**
 * Get user data from cache by ID
 * @param {string} userId - User ID
 * @returns {Object|null} User data or null if not found
 */
const getUserById = (userId) => {
  const cacheKey = `user:${userId}`;
  const cachedUser = userCache.get(cacheKey);
  
  if (cachedUser) {
    cacheHits++;
    return cachedUser;
  }
  
  cacheMisses++;
  return null;
};

/**
 * Store user data in cache
 * @param {string} userId - User ID
 * @param {Object} userData - User data to cache
 * @param {number} ttl - Optional custom TTL in seconds
 */
const cacheUser = (userId, userData, ttl = undefined) => {
  if (!userId || !userData) return;
  
  const cacheKey = `user:${userId}`;
  userCache.set(cacheKey, userData, ttl);
};

/**
 * Get user data from cache by username
 * @param {string} username - Username
 * @returns {Object|null} User data or null if not found
 */
const getUserByUsername = (username) => {
  if (!username) return null;
  
  const cacheKey = `username:${username.toLowerCase()}`;
  const cachedUserId = userCache.get(cacheKey);
  
  if (cachedUserId) {
    cacheHits++;
    return getUserById(cachedUserId);
  }
  
  cacheMisses++;
  return null;
};

/**
 * Store username to user ID mapping in cache
 * @param {string} username - Username
 * @param {string} userId - User ID
 * @param {number} ttl - Optional custom TTL in seconds
 */
const cacheUsername = (username, userId, ttl = undefined) => {
  if (!username || !userId) return;
  
  const cacheKey = `username:${username.toLowerCase()}`;
  userCache.set(cacheKey, userId, ttl);
};

/**
 * Get user data from cache by roll number
 * @param {string} rollNumber - Roll number
 * @returns {Object|null} User data or null if not found
 */
const getUserByRollNumber = (rollNumber) => {
  if (!rollNumber) return null;
  
  const cacheKey = `rollnumber:${rollNumber.toLowerCase()}`;
  const cachedUserId = userCache.get(cacheKey);
  
  if (cachedUserId) {
    cacheHits++;
    return getUserById(cachedUserId);
  }
  
  cacheMisses++;
  return null;
};

/**
 * Store roll number to user ID mapping in cache
 * @param {string} rollNumber - Roll number
 * @param {string} userId - User ID
 * @param {number} ttl - Optional custom TTL in seconds
 */
const cacheRollNumber = (rollNumber, userId, ttl = undefined) => {
  if (!rollNumber || !userId) return;
  
  const cacheKey = `rollnumber:${rollNumber.toLowerCase()}`;
  userCache.set(cacheKey, userId, ttl);
};

/**
 * Invalidate user cache for a specific user
 * @param {string} userId - User ID
 * @param {string} username - Username
 * @param {string} rollNumber - Roll number
 */
const invalidateUserCache = (userId, username, rollNumber) => {
  if (userId) {
    userCache.del(`user:${userId}`);
  }
  
  if (username) {
    userCache.del(`username:${username.toLowerCase()}`);
  }
  
  if (rollNumber) {
    userCache.del(`rollnumber:${rollNumber.toLowerCase()}`);
  }
};

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
const getCacheStats = () => {
  return {
    hits: cacheHits,
    misses: cacheMisses,
    ratio: cacheHits / (cacheHits + cacheMisses || 1),
    userCacheStats: userCache.getStats(),
    authCacheStats: authCache.getStats(),
    staticCacheStats: staticCache.getStats(),
  };
};

/**
 * Reset cache statistics
 */
const resetCacheStats = () => {
  cacheHits = 0;
  cacheMisses = 0;
};

/**
 * Clear all caches
 */
const clearAllCaches = () => {
  userCache.flushAll();
  authCache.flushAll();
  staticCache.flushAll();
  resetCacheStats();
};

module.exports = {
  authCache,
  userCache,
  staticCache,
  getUserById,
  cacheUser,
  getUserByUsername,
  cacheUsername,
  getUserByRollNumber,
  cacheRollNumber,
  invalidateUserCache,
  getCacheStats,
  resetCacheStats,
  clearAllCaches,
};
