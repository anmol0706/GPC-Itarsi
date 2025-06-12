import React, { useRef, useEffect } from 'react';

/**
 * Higher-order component that makes links inside a component clickable
 * This HOC uses event delegation to handle link clicks
 * 
 * @param {React.ComponentType} WrappedComponent - The component to wrap
 * @returns {React.ComponentType} - The wrapped component with clickable links
 */
const withClickableLinks = (WrappedComponent) => {
  /**
   * The enhanced component with clickable links
   * 
   * @param {Object} props - Component props
   * @returns {JSX.Element} - The rendered component
   */
  const WithClickableLinks = (props) => {
    const containerRef = useRef(null);

    // Set up event delegation for handling link clicks
    useEffect(() => {
      const handleLinkClick = (event) => {
        // Find if the click was on a link or inside a link
        let target = event.target;
        while (target && target !== containerRef.current) {
          if (target.tagName && target.tagName.toLowerCase() === 'a') {
            // This is a link - handle the click
            event.stopPropagation();
            
            // If it's an external link (has target="_blank"), let the browser handle it
            if (target.getAttribute('target') === '_blank') {
              return true; // Allow default behavior
            }
            
            // For internal links or links without target, we can add custom handling here
            // For example, you could use React Router for internal navigation
            
            return true; // Allow default behavior for now
          }
          target = target.parentNode;
        }
        
        // Not a link click, no special handling needed
        return true;
      };

      // Add event listener to the container
      const containerElement = containerRef.current;
      if (containerElement) {
        containerElement.addEventListener('click', handleLinkClick);
      }

      // Clean up event listener on unmount
      return () => {
        if (containerElement) {
          containerElement.removeEventListener('click', handleLinkClick);
        }
      };
    }, []);

    // Add the ref to the wrapped component
    return (
      <div ref={containerRef} style={{ position: 'relative', zIndex: 1 }}>
        <WrappedComponent {...props} />
      </div>
    );
  };

  // Set display name for debugging
  WithClickableLinks.displayName = `WithClickableLinks(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithClickableLinks;
};

export default withClickableLinks;
