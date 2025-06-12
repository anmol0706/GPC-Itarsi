import { toast } from 'react-toastify';

/**
 * Utility functions for displaying toast notifications with consistent styling
 */

/**
 * Display a success toast notification
 * @param {string} message - The message to display
 * @param {Object} options - Additional toast options
 */
export const showSuccessToast = (message, options = {}) => {
  toast.success(message, {
    icon: '✅',
    ...options
  });
};

/**
 * Display an error toast notification
 * @param {string} message - The message to display
 * @param {Object} options - Additional toast options
 */
export const showErrorToast = (message, options = {}) => {
  toast.error(message, {
    icon: '❌',
    ...options
  });
};

/**
 * Display a warning toast notification
 * @param {string} message - The message to display
 * @param {Object} options - Additional toast options
 */
export const showWarningToast = (message, options = {}) => {
  toast.warning(message, {
    icon: '⚠️',
    ...options
  });
};

/**
 * Display an info toast notification
 * @param {string} message - The message to display
 * @param {Object} options - Additional toast options
 */
export const showInfoToast = (message, options = {}) => {
  toast.info(message, {
    icon: 'ℹ️',
    ...options
  });
};

/**
 * Display a custom toast notification
 * @param {string} message - The message to display
 * @param {Object} options - Additional toast options
 */
export const showCustomToast = (message, options = {}) => {
  toast(message, options);
};

export default {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
  showCustomToast
};
