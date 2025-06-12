import React from 'react';
import { ToastContainer, cssTransition } from 'react-toastify';

/**
 * Create a custom CSS transition that doesn't pass problematic props to SVG elements
 */
const customBounce = cssTransition({
  enter: 'bounce-enter',
  exit: 'bounce-exit',
  appendPosition: true,
  collapse: true,
  collapseDuration: 300,
});

/**
 * CustomToastContainer component that wraps the react-toastify ToastContainer
 * This component helps prevent React warnings about custom attributes on SVG elements
 *
 * @param {Object} props - Component props to pass to ToastContainer
 * @returns {JSX.Element} - Wrapped ToastContainer
 */
const CustomToastContainer = (props) => {
  // Use our custom transition that doesn't pass problematic props to SVG elements
  return (
    <ToastContainer
      {...props}
      transition={customBounce}
    />
  );
};

export default CustomToastContainer;
