/**
 * Touch utilities for mobile interactions
 */

/**
 * Creates a touch handler for swipe gestures
 * @param {Function} onSwipeLeft - Function to call when user swipes left
 * @param {Function} onSwipeRight - Function to call when user swipes right
 * @param {number} threshold - Minimum distance in pixels to trigger swipe (default: 50)
 * @returns {Object} Touch event handlers
 */
export const createSwipeHandler = (onSwipeLeft, onSwipeRight, threshold = 50) => {
  let startX = 0;
  
  const handleTouchStart = (e) => {
    startX = e.touches[0].clientX;
  };
  
  const handleTouchMove = (e) => {
    if (!startX) return;
    
    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;
    
    // Prevent default to avoid scrolling while swiping
    if (Math.abs(diff) > 10) {
      e.preventDefault();
    }
  };
  
  const handleTouchEnd = (e) => {
    if (!startX) return;
    
    const currentX = e.changedTouches[0].clientX;
    const diff = startX - currentX;
    
    if (diff > threshold && onSwipeLeft) {
      onSwipeLeft();
    } else if (diff < -threshold && onSwipeRight) {
      onSwipeRight();
    }
    
    startX = 0;
  };
  
  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
};

export default {
  createSwipeHandler,
};
