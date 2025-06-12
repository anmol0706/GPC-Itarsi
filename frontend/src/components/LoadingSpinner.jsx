import React from 'react';

const LoadingSpinner = ({ message = 'Loading...', fullScreen = false }) => {
  const containerClasses = fullScreen 
    ? 'flex flex-col justify-center items-center h-screen bg-gray-50' 
    : 'flex flex-col justify-center items-center py-8';

  return (
    <div className={containerClasses}>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
