import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * OptimizedImage component for SEO-friendly images with lazy loading
 * 
 * @param {Object} props - Component props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Alt text for the image (required for SEO)
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.width - Image width
 * @param {number} props.height - Image height
 * @param {string} props.loading - Loading strategy ('lazy' or 'eager')
 * @param {string} props.fallbackSrc - Fallback image source if main image fails to load
 * @param {string} props.credit - Image credit (photographer name)
 * @param {string} props.creditUrl - URL to photographer's profile
 * @param {boolean} props.showAttribution - Whether to show attribution
 * @returns {JSX.Element} - The rendered component
 */
const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  fallbackSrc = '/images/placeholder.svg',
  credit,
  creditUrl,
  showAttribution = false,
  ...rest
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setError(false);
    setIsLoaded(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setError(true);
    setImgSrc(fallbackSrc);
    console.error(`Failed to load image: ${src}`);
  };

  return (
    <div className="relative">
      <img
        src={imgSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        width={width}
        height={height}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        {...rest}
      />
      
      {/* Loading placeholder */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      
      {/* Image attribution */}
      {showAttribution && credit && creditUrl && isLoaded && !error && (
        <div className="absolute bottom-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
          Photo by <a href={creditUrl} target="_blank" rel="noopener noreferrer" className="underline">{credit}</a>
        </div>
      )}
    </div>
  );
};

OptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  loading: PropTypes.oneOf(['lazy', 'eager']),
  fallbackSrc: PropTypes.string,
  credit: PropTypes.string,
  creditUrl: PropTypes.string,
  showAttribution: PropTypes.bool
};

export default OptimizedImage;
