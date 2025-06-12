/**
 * Utility functions for URL validation and formatting
 */

/**
 * Validates a URL using a comprehensive regex pattern
 * 
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if the URL is valid, false otherwise
 */
export const isValidUrl = (url) => {
  if (!url) return false;
  
  // URL validation regex pattern
  const validUrlPattern = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/i;
  
  return validUrlPattern.test(url);
};

/**
 * Ensures a URL has a protocol (https:// by default)
 * 
 * @param {string} url - The URL to format
 * @param {string} defaultProtocol - The default protocol to add (defaults to 'https://')
 * @returns {string} - The formatted URL with protocol
 */
export const ensureUrlProtocol = (url, defaultProtocol = 'https://') => {
  if (!url) return '';
  
  // Skip if it's an anchor link
  if (url.startsWith('#')) return url;
  
  // Skip if it already has a protocol
  if (/^(?:f|ht)tps?:\/\//i.test(url)) return url;
  
  // Add the default protocol
  return defaultProtocol + url;
};

/**
 * Sanitizes a URL to prevent common security issues
 * 
 * @param {string} url - The URL to sanitize
 * @returns {object} - Object containing the sanitized URL and validation status
 */
export const sanitizeUrl = (url) => {
  if (!url || url.trim() === '') {
    return { url: '#', isValid: false };
  }
  
  // Skip sanitization for anchor links
  if (url.startsWith('#')) {
    return { url, isValid: true };
  }
  
  // Ensure URL has a protocol
  const formattedUrl = ensureUrlProtocol(url);
  
  // Validate the URL
  const isValid = isValidUrl(formattedUrl);
  
  // Return sanitized URL or fallback to # if invalid
  return {
    url: isValid ? formattedUrl : '#',
    isValid
  };
};

/**
 * Checks if a URL is an external link
 * 
 * @param {string} url - The URL to check
 * @returns {boolean} - True if the URL is external, false otherwise
 */
export const isExternalUrl = (url) => {
  if (!url) return false;
  
  // Check if the URL starts with http:// or https://
  return /^(?:f|ht)tps?:\/\//i.test(url);
};

export default {
  isValidUrl,
  ensureUrlProtocol,
  sanitizeUrl,
  isExternalUrl
};
