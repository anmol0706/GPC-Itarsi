/**
 * Special CORS middleware specifically for the notices endpoint
 * This middleware is designed to fix the persistent CORS issues with the notices endpoint
 */

module.exports = function(req, res, next) {
  // Log detailed information about the request
  console.log('NOTICES CORS MIDDLEWARE');
  console.log('Request URL:', req.originalUrl);
  console.log('Request Method:', req.method);
  console.log('Request Origin:', req.headers.origin);
  console.log('Request Headers:', req.headers);

  // Get the origin from the request headers
  const origin = req.headers.origin;

  // List of allowed origins - make sure to include ALL possible frontend origins
  const allowedOrigins = [
    'https://gpc-itarsi-9cl7.onrender.com',
    'https://gpc-itarsi-developer.onrender.com',
    'https://gpc-itarsi-backend-1wu5.onrender.com',
    'https://gpc-itarsi-backend-8dod.onrender.com',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    // Add any other origins that might be accessing the API
    'https://gpc-itarsi.onrender.com'
  ];

  // Always set Access-Control-Allow-Origin header
  if (origin) {
    // If the origin is in our allowed list, set it specifically
    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      console.log(`Notices CORS Middleware - Allowing specific origin: ${origin}`);
    } else {
      // For unknown origins, use wildcard (less secure but more permissive)
      res.header('Access-Control-Allow-Origin', '*');
      console.log(`Notices CORS Middleware - Using wildcard origin for: ${origin}`);
    }
  } else {
    // No origin in the request, use wildcard
    res.header('Access-Control-Allow-Origin', '*');
    console.log(`Notices CORS Middleware - No origin in request, using wildcard`);
  }

  // Set other CORS headers
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request for notices endpoint');
    return res.status(204).send();
  }

  next();
};
