/**
 * Universal CORS middleware that ensures all responses have proper CORS headers
 * This is a direct approach that bypasses the cors package
 */

module.exports = function(req, res, next) {
  // Log request information for debugging
  console.log('Universal CORS Middleware - Request path:', req.path);
  console.log('Universal CORS Middleware - Request method:', req.method);
  console.log('Universal CORS Middleware - Request origin:', req.headers.origin);

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
    'http://localhost:5176',
    'http://developer.anmol.onrender.com',
    'https://developer.anmol.onrender.com',
    'http://anmol.onrender.com/developer',
    'https://anmol.onrender.com/developer',
    // Add any other origins that might be accessing the API
    'https://gpc-itarsi.onrender.com'
  ];

  // Always set Access-Control-Allow-Origin header
  if (origin) {
    // If the origin is in our allowed list, set it specifically
    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      console.log(`Universal CORS Middleware - Allowing specific origin: ${origin}`);
    } else {
      // For unknown origins, use wildcard (less secure but more permissive)
      res.header('Access-Control-Allow-Origin', '*');
      console.log(`Universal CORS Middleware - Using wildcard origin for: ${origin}`);
    }
  } else {
    // No origin in the request, use wildcard
    res.header('Access-Control-Allow-Origin', '*');
    console.log(`Universal CORS Middleware - No origin in request, using wildcard`);
  }

  // Set other CORS headers
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Universal CORS Middleware - Handling OPTIONS preflight request for:', req.path);
    return res.status(204).send();
  }

  next();
};
