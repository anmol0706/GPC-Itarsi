/**
 * Performance monitoring utility
 * Provides functions to measure and log performance metrics
 */

// Store performance metrics
const metrics = {
  auth: {
    loginAttempts: 0,
    loginSuccess: 0,
    loginFailure: 0,
    averageLoginTime: 0,
    tokenVerifications: 0,
    averageTokenVerificationTime: 0,
  },
  database: {
    queries: 0,
    averageQueryTime: 0,
    slowQueries: [], // Queries that took longer than threshold
  },
  cache: {
    hits: 0,
    misses: 0,
    ratio: 0,
  },
};

// Configuration
const config = {
  slowQueryThreshold: 200, // ms
  maxSlowQueries: 50, // Maximum number of slow queries to store
  enabled: true, // Whether performance monitoring is enabled
};

/**
 * Measure execution time of a function
 * @param {Function} fn - Function to measure
 * @param {Array} args - Arguments to pass to the function
 * @returns {Object} Result and execution time
 */
const measureExecutionTime = async (fn, ...args) => {
  if (!config.enabled) {
    return { result: await fn(...args), executionTime: 0 };
  }

  const start = performance.now();
  try {
    const result = await fn(...args);
    const end = performance.now();
    const executionTime = end - start;
    return { result, executionTime };
  } catch (error) {
    const end = performance.now();
    const executionTime = end - start;
    throw { error, executionTime };
  }
};

/**
 * Record login attempt
 * @param {boolean} success - Whether login was successful
 * @param {number} executionTime - Execution time in ms
 */
const recordLoginAttempt = (success, executionTime) => {
  if (!config.enabled) return;

  metrics.auth.loginAttempts++;
  
  if (success) {
    metrics.auth.loginSuccess++;
    
    // Update average login time
    const prevTotal = metrics.auth.averageLoginTime * (metrics.auth.loginSuccess - 1);
    metrics.auth.averageLoginTime = (prevTotal + executionTime) / metrics.auth.loginSuccess;
  } else {
    metrics.auth.loginFailure++;
  }
};

/**
 * Record token verification
 * @param {boolean} success - Whether verification was successful
 * @param {number} executionTime - Execution time in ms
 */
const recordTokenVerification = (success, executionTime) => {
  if (!config.enabled) return;

  metrics.auth.tokenVerifications++;
  
  if (success) {
    // Update average token verification time
    const prevTotal = metrics.auth.averageTokenVerificationTime * (metrics.auth.tokenVerifications - 1);
    metrics.auth.averageTokenVerificationTime = (prevTotal + executionTime) / metrics.auth.tokenVerifications;
  }
};

/**
 * Record database query
 * @param {string} query - Query description
 * @param {number} executionTime - Execution time in ms
 */
const recordDatabaseQuery = (query, executionTime) => {
  if (!config.enabled) return;

  metrics.database.queries++;
  
  // Update average query time
  const prevTotal = metrics.database.averageQueryTime * (metrics.database.queries - 1);
  metrics.database.averageQueryTime = (prevTotal + executionTime) / metrics.database.queries;
  
  // Record slow query
  if (executionTime > config.slowQueryThreshold) {
    // Add to slow queries list, keeping only the most recent ones
    metrics.database.slowQueries.push({
      query,
      executionTime,
      timestamp: new Date(),
    });
    
    // Trim list if it exceeds max size
    if (metrics.database.slowQueries.length > config.maxSlowQueries) {
      metrics.database.slowQueries.shift();
    }
  }
};

/**
 * Update cache metrics
 * @param {Object} cacheStats - Cache statistics
 */
const updateCacheMetrics = (cacheStats) => {
  if (!config.enabled) return;
  
  metrics.cache = {
    hits: cacheStats.hits,
    misses: cacheStats.misses,
    ratio: cacheStats.ratio,
  };
};

/**
 * Get all performance metrics
 * @returns {Object} Performance metrics
 */
const getMetrics = () => {
  return { ...metrics };
};

/**
 * Reset all performance metrics
 */
const resetMetrics = () => {
  metrics.auth = {
    loginAttempts: 0,
    loginSuccess: 0,
    loginFailure: 0,
    averageLoginTime: 0,
    tokenVerifications: 0,
    averageTokenVerificationTime: 0,
  };
  
  metrics.database = {
    queries: 0,
    averageQueryTime: 0,
    slowQueries: [],
  };
  
  metrics.cache = {
    hits: 0,
    misses: 0,
    ratio: 0,
  };
};

/**
 * Configure performance monitoring
 * @param {Object} newConfig - New configuration
 */
const configure = (newConfig) => {
  Object.assign(config, newConfig);
};

module.exports = {
  measureExecutionTime,
  recordLoginAttempt,
  recordTokenVerification,
  recordDatabaseQuery,
  updateCacheMetrics,
  getMetrics,
  resetMetrics,
  configure,
};
