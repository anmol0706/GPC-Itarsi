/**
 * Utility functions for handling images in the application
 */

import config from '../config';

/**
 * Get the full URL for a profile image
 * @param {string} profilePicture - The profile picture filename or URL
 * @returns {string} - The full URL to the profile image
 */
export const getProfileImageUrl = (profilePicture) => {
  console.log('Getting profile image URL for:', profilePicture);

  try {
    if (!profilePicture) {
      console.log('No profile picture provided, using default developer image');
      // Use the Cloudinary URL as the developer placeholder
      return 'https://res.cloudinary.com/daf99zan2/image/upload/v1746966715/gpc-itarsi/profiles/profilePicture-1746966715084-977581870.webp';
    }

    // Check if the profilePicture is a valid string
    if (typeof profilePicture !== 'string') {
      console.error('Invalid profile picture format, using default:', profilePicture);
      return 'https://res.cloudinary.com/daf99zan2/image/upload/v1746966715/gpc-itarsi/profiles/profilePicture-1746966715084-977581870.webp';
    }

    // Check if the profilePicture is a Cloudinary URL
    if (profilePicture.includes('cloudinary.com')) {
      console.log('Using Cloudinary URL');
      return profilePicture;
    }

    // Check if the profilePicture already includes the full path
    if (profilePicture.startsWith('http')) {
      console.log('Profile picture is already a full URL');
      return profilePicture;
    }

    // Special case for the default developer profile image
    if (profilePicture === 'IMG_20250302_114931_795.png' ||
        profilePicture.includes('anmol') ||
        profilePicture.includes('developer')) {
      console.log('Using special case for developer profile image');
      return `${config.apiUrl}/uploads/profiles/${profilePicture}`;
    }

    // Check if the profilePicture is the default image
    if (profilePicture === 'default-profile.jpg' || profilePicture === 'default-principal.jpg') {
      console.log('Using default profile image');
      return '/images/principal-placeholder.svg';
    }

    // Special case for principal.jpg which is known to be problematic
    if (profilePicture === 'principal.jpg') {
      console.log('Using placeholder for principal.jpg');
      return '/images/principal-placeholder.svg';
    }

    // Check if it's a principal image
    if (profilePicture.includes('principal')) {
      console.log('Using principal placeholder image');
      return '/images/principal-placeholder.svg';
    } else {
      // For other profile images, use the API URL
      const fullUrl = `${config.apiUrl}/uploads/profiles/${profilePicture}`;
      console.log('Constructed profile image URL:', fullUrl);
      return fullUrl;
    }
  } catch (error) {
    console.error('Error processing profile image URL:', error);
    return 'https://res.cloudinary.com/daf99zan2/image/upload/v1746966715/gpc-itarsi/profiles/profilePicture-1746966715084-977581870.webp';
  }
};

/**
 * Handle image loading errors by setting a fallback image
 * @param {Event} event - The error event
 */
export const handleImageError = (event) => {
  try {
    console.log('Error loading image, using fallback');
    console.log('Failed image source:', event.target.src);

    // Prevent infinite error loop
    event.target.onerror = null;

    // Check if the default image is already set to avoid loops
    if (event.target.src.includes('principal-placeholder.svg') ||
        event.target.src.includes('placeholder.svg')) {
      console.log('Already using default image, no need to replace');
      return;
    }

    // Check if it's a principal image or if we're on the About page
    if (event.target.src.includes('principal') ||
        event.target.alt?.toLowerCase().includes('principal') ||
        (event.target.closest('.rounded-full') &&
         event.target.closest('.image-hover'))) {
      // Use principal placeholder for principal images
      event.target.src = '/images/principal-placeholder.svg';
      console.log('Set principal fallback image:', '/images/principal-placeholder.svg');
    } else {
      // Set the default fallback image
      event.target.src = '/images/placeholder.svg';
      console.log('Set fallback image:', '/images/placeholder.svg');
    }
  } catch (error) {
    console.error('Error handling image error event:', error);
    // Last resort fallback
    try {
      event.target.src = '/images/placeholder.svg';
    } catch (e) {
      console.error('Failed to set even the basic fallback image:', e);
    }
  }
};
