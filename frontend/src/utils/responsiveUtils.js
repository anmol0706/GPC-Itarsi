/**
 * Responsive utility functions for the application
 */

/**
 * Determines if the current viewport is mobile
 * @returns {boolean} True if viewport width is less than 640px
 */
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 640;
};

/**
 * Determines if the current viewport is tablet
 * @returns {boolean} True if viewport width is between 640px and 1024px
 */
export const isTablet = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 640 && window.innerWidth < 1024;
};

/**
 * Determines if the current viewport is desktop
 * @returns {boolean} True if viewport width is 1024px or greater
 */
export const isDesktop = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 1024;
};

/**
 * Returns appropriate image size based on viewport
 * @param {Object} sizes - Object containing image sizes for different viewports
 * @param {string} sizes.mobile - Image URL for mobile devices
 * @param {string} sizes.tablet - Image URL for tablet devices
 * @param {string} sizes.desktop - Image URL for desktop devices
 * @returns {string} The appropriate image URL for the current viewport
 */
export const getResponsiveImageUrl = (sizes) => {
  if (isMobile()) return sizes.mobile;
  if (isTablet()) return sizes.tablet;
  return sizes.desktop;
};

/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last time it was invoked
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Function} The debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Adds event listener for responsive viewport changes
 * @param {Function} callback - Function to call when viewport size changes
 * @returns {Function} Function to remove the event listener
 */
export const addResponsiveListener = (callback) => {
  const debouncedCallback = debounce(callback, 250);
  window.addEventListener('resize', debouncedCallback);
  return () => {
    window.removeEventListener('resize', debouncedCallback);
  };
};

/**
 * Gets appropriate class names based on viewport size
 * @param {Object} classes - Object containing classes for different viewports
 * @param {string} classes.mobile - Classes for mobile devices
 * @param {string} classes.tablet - Classes for tablet devices
 * @param {string} classes.desktop - Classes for desktop devices
 * @returns {string} The appropriate classes for the current viewport
 */
export const getResponsiveClasses = (classes) => {
  if (isMobile()) return classes.mobile || '';
  if (isTablet()) return classes.tablet || '';
  return classes.desktop || '';
};
