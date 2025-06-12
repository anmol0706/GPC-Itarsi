
const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5001',
  defaultProfileImage: '/images/placeholder.svg',
  uploadPath: '/uploads/profiles/',
};

// Log the API URL for debugging
console.log('API URL configured as:', config.apiUrl);

export default config;
