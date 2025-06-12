import React from 'react';
import PropTypes from 'prop-types';

/**
 * Component to display Unsplash image attribution
 */
const ImageAttribution = ({ credit, creditUrl, unsplashUrl }) => {
  return (
    <div className="text-xs text-gray-500 mt-1 flex items-center">
      <span>Photo by </span>
      <a 
        href={creditUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="mx-1 text-blue-600 hover:underline"
      >
        {credit}
      </a>
      <span>on</span>
      <a 
        href={unsplashUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="ml-1 text-blue-600 hover:underline"
      >
        Unsplash
      </a>
    </div>
  );
};

ImageAttribution.propTypes = {
  credit: PropTypes.string.isRequired,
  creditUrl: PropTypes.string.isRequired,
  unsplashUrl: PropTypes.string.isRequired
};

export default ImageAttribution;
