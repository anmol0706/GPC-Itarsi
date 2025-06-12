export const createSwipeHandler = ({ onSwipeLeft, onSwipeRight, threshold = 50 }) => {
  let startX = 0;
  let startY = 0;
  let endX = 0;
  let endY = 0;

  const touchStart = (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  };

  const touchMove = (e) => {
    endX = e.touches[0].clientX;
    endY = e.touches[0].clientY;
  };

  const touchEnd = () => {
    const diffX = startX - endX;
    const diffY = startY - endY;

    // Only trigger swipe if horizontal movement is greater than vertical movement
    // and greater than the threshold
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        // Swiped left
        onSwipeLeft && onSwipeLeft();
      } else {
        // Swiped right
        onSwipeRight && onSwipeRight();
      }
    }

    // Reset values
    startX = 0;
    startY = 0;
    endX = 0;
    endY = 0;
  };

  return {
    touchStart,
    touchMove,
    touchEnd
  };
};
