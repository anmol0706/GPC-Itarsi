import config from '../config';

/**
 * Utility functions for API calls
 */

/**
 * Get the full API URL for an endpoint
 * @param {string} endpoint - The API endpoint (without leading slash)
 * @returns {string} - The full URL to the API endpoint
 */
export const getApiUrl = (endpoint) => {
  // Make sure endpoint doesn't start with a slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  return `${config.apiUrl}/${cleanEndpoint}`;
};

/**
 * Get the full URL for an uploaded file
 * @param {string} type - The type of upload (profiles, courses, gallery, etc.)
 * @param {string} filename - The filename
 * @returns {string} - The full URL to the file
 */
export const getUploadUrl = (type, filename) => {
  if (!filename) {
    return '/images/placeholder.svg';
  }

  // Check if the filename already includes the full path
  if (filename.startsWith('http')) {
    return filename;
  }

  return `${config.apiUrl}/uploads/${type}/${filename}`;
};

/**
 * Get the full URL for a profile image
 * @param {string} profilePicture - The profile picture filename
 * @returns {string} - The full URL to the profile image
 */
export const getProfileImageUrl = (profilePicture) => {
  return getUploadUrl('profiles', profilePicture);
};

/**
 * Get the full URL for a course image
 * @param {string} courseImage - The course image filename
 * @returns {string} - The full URL to the course image
 */
export const getCourseImageUrl = (courseImage) => {
  return getUploadUrl('courses', courseImage);
};

/**
 * Get the full URL for a gallery image
 * @param {string} galleryImage - The gallery image filename
 * @returns {string} - The full URL to the gallery image
 */
export const getGalleryImageUrl = (galleryImage) => {
  return getUploadUrl('gallery', galleryImage);
};

export default {
  getApiUrl,
  getUploadUrl,
  getProfileImageUrl,
  getCourseImageUrl,
  getGalleryImageUrl
};
