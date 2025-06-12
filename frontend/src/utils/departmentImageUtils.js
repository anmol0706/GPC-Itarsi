/**
 * Utility functions for department images from Unsplash
 */

// Department image data with Unsplash attribution
const departmentImages = {
  'computer-science': {
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    alt: 'Computer Science - Programming code on a screen',
    credit: 'Markus Spiske',
    creditUrl: 'https://unsplash.com/@markusspiske',
    unsplashUrl: 'https://unsplash.com/photos/code-on-a-screen-iar-afB0QQw'
  },
  'mechanical-engineering': {
    url: 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    alt: 'Mechanical Engineering - Industrial machinery and gears',
    credit: 'Ant Rozetsky',
    creditUrl: 'https://unsplash.com/@rozetsky',
    unsplashUrl: 'https://unsplash.com/photos/silver-and-black-robot-HHTxsY8FfXU'
  },
  'electronics-telecom': {
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    alt: 'Electronics & Telecom - Circuit board close-up',
    credit: 'Alexandre Debiève',
    creditUrl: 'https://unsplash.com/@alexkixa',
    unsplashUrl: 'https://unsplash.com/photos/green-and-black-computer-motherboard-FO7JIlwjOtU'
  },
  'electrical-engineering': {
    url: 'https://images.unsplash.com/photo-1620283085439-39620a1e21c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    alt: 'Electrical Engineering - Electrical power lines and transformer',
    credit: 'Matthew Henry',
    creditUrl: 'https://unsplash.com/@matthewhenry',
    unsplashUrl: 'https://unsplash.com/photos/blue-and-white-light-2Ts5HnA67k8'
  },
  'fallback': {
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    alt: 'Education - College campus building',
    credit: 'Nathan Dumlao',
    creditUrl: 'https://unsplash.com/@nate_dumlao',
    unsplashUrl: 'https://unsplash.com/photos/brown-concrete-building-during-daytime-ewGMqs2tmJI'
  }
};

/**
 * Get the image data for a department
 * @param {string} departmentName - The name of the department
 * @returns {Object} The image data object
 */
export const getDepartmentImageData = (departmentName) => {
  if (!departmentName) return departmentImages.fallback;
  
  // Convert department name to URL-friendly format
  const key = departmentName.toLowerCase()
    .replace(/\s+&\s+/g, '-')
    .replace(/\s+/g, '-');
  
  return departmentImages[key] || departmentImages.fallback;
};

/**
 * Get the image URL for a department
 * @param {string} departmentName - The name of the department
 * @returns {string} The image URL
 */
export const getDepartmentImageUrl = (departmentName) => {
  return getDepartmentImageData(departmentName).url;
};

/**
 * Get the attribution component props for a department image
 * @param {string} departmentName - The name of the department
 * @returns {Object} The attribution props
 */
export const getDepartmentImageAttribution = (departmentName) => {
  const data = getDepartmentImageData(departmentName);
  return {
    credit: data.credit,
    creditUrl: data.creditUrl,
    unsplashUrl: data.unsplashUrl
  };
};

export default {
  getDepartmentImageData,
  getDepartmentImageUrl,
  getDepartmentImageAttribution
};
