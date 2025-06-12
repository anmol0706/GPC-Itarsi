import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design
 * @param {string} query - Media query string
 * @returns {boolean} - Whether the media query matches
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Update the state initially
    setMatches(media.matches);
    
    // Define callback for media query change
    const listener = (event) => {
      setMatches(event.matches);
    };
    
    // Add event listener
    media.addEventListener('change', listener);
    
    // Clean up
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
};

export default useMediaQuery;
