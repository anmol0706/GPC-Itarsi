const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'https://gpc-itarsi-backend-8.onrender.com',
  defaultProfileImage: '/images/placeholder.svg',
  uploadPath: '/uploads/profiles/',
  mainWebsiteUrl: import.meta.env.VITE_MAIN_WEBSITE_URL || 'http://localhost:3000',
};

// Log the API URL for debugging
console.log('Developer Dashboard - API URL configured as:', config.apiUrl);
console.log('Developer Dashboard - Main Website URL configured as:', config.mainWebsiteUrl);

export default config;
