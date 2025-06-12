import React from 'react';

/**
 * List of non-standard SVG attributes that cause React warnings
 */
const NON_STANDARD_PROPS = [
  'isIn',
  'nomodal',
  'done',
  'isin',
  'noModal',
  'isintransition',
  'preventexittransition'
];

/**
 * SVGWrapper component to handle custom attributes that might cause React warnings
 * This component strips out non-standard SVG attributes that might be added by third-party libraries
 *
 * @param {Object} props - Component props
 * @returns {JSX.Element} - SVG element without problematic props
 */
const SVGWrapper = ({ children, ...props }) => {
  // Filter out problematic props that cause React warnings
  const safeProps = { ...props };

  // Remove props that cause warnings
  NON_STANDARD_PROPS.forEach(prop => {
    delete safeProps[prop];
    // Also check for camelCase and lowercase variations
    delete safeProps[prop.toLowerCase()];
    delete safeProps[prop.charAt(0).toUpperCase() + prop.slice(1)];
  });

  // Pass the filtered props to the SVG element
  return React.cloneElement(children, safeProps);
};

export default SVGWrapper;
