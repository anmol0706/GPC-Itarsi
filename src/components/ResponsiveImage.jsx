import { useState, useEffect } from 'react';
import useResponsive from '../hooks/useResponsive';

/**
 * Responsive image component that loads different image sizes based on viewport
 * 
 * @param {Object} props - Component props
 * @param {string} props.src - Default image source
 * @param {string} props.mobileSrc - Image source for mobile devices
 * @param {string} props.tabletSrc - Image source for tablet devices
 * @param {string} props.desktopSrc - Image source for desktop devices
 * @param {string} props.alt - Alt text for the image
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.imgProps - Additional props to pass to the img element
 * @returns {JSX.Element} Responsive image component
 */
const ResponsiveImage = ({ 
  src, 
  mobileSrc, 
  tabletSrc, 
  desktopSrc, 
  alt = '', 
  className = '', 
  ...imgProps 
}) => {
  const { isMobile, isTablet } = useResponsive();
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isMobile && mobileSrc) {
      setImageSrc(mobileSrc);
    } else if (isTablet && tabletSrc) {
      setImageSrc(tabletSrc);
    } else if (desktopSrc) {
      setImageSrc(desktopSrc);
    } else {
      setImageSrc(src);
    }
  }, [isMobile, isTablet, mobileSrc, tabletSrc, desktopSrc, src]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    console.error(`Failed to load image: ${imageSrc}`);
    // Fallback to default src if the responsive image fails to load
    if (imageSrc !== src) {
      setImageSrc(src);
    }
  };

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      onLoad={handleLoad}
      onError={handleError}
      loading="lazy"
      {...imgProps}
    />
  );
};

export default ResponsiveImage;
