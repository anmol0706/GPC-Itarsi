/**
 * Utility functions for handling images in the application
 */

const API_URL = 'http://localhost:5001';

/**
 * Get the full URL for a profile image
 * @param {string} profilePicture - The profile picture filename
 * @returns {string} - The full URL to the profile image
 */
export const getProfileImageUrl = (profilePicture) => {
  if (!profilePicture) {
    return '/images/placeholder.svg';
  }

  // Check if the profilePicture already includes the full path
  if (profilePicture.startsWith('http')) {
    return profilePicture;
  }

  return `${API_URL}/uploads/profiles/${profilePicture}`;
};

/**
 * Handle image loading errors by setting a fallback image
 * @param {Event} event - The error event
 */
export const handleImageError = (event) => {
  console.log('Error loading image, using fallback');
  event.target.onerror = null;
  event.target.src = '/images/placeholder.svg';
};
