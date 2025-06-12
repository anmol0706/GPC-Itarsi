import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const DashboardBanner = ({
  title,
  subtitle,
  userName,
  userRole,
  actionButton,
  bgColor = 'bg-primary-800',
  className = '',
  showPattern = true,
  futuristic = true
}) => {
  const bannerRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    if (futuristic && bannerRef.current) {
      const banner = bannerRef.current;
      const titleElement = titleRef.current;

      // Add subtle glow effect to the banner (reduced elevation)
      banner.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.08), 0 0 15px rgba(99, 102, 241, 0.2)';

      // Add text shadow to the title for a glowing effect
      if (titleElement) {
        titleElement.style.textShadow = '0 0 10px rgba(255, 255, 255, 0.5)';
      }
    }
  }, [futuristic]);
  // Use teacher-banner class if we're in the teacher dashboard
  const bannerClass = futuristic
    ? `relative overflow-hidden rounded-lg shadow-md ${bgColor} ${className} transition-all duration-300 ${window.location.pathname.includes('/teacher') ? 'teacher-banner' : ''}`
    : `relative overflow-hidden rounded-lg shadow-md ${bgColor} ${className}`;

  return (
    <div ref={bannerRef} className={bannerClass}>
      {showPattern && (
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      )}
      <div className="relative z-10 px-6 py-5 sm:px-8 sm:py-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="md:flex-1">
            <h2 ref={titleRef} className="text-2xl font-bold leading-7 text-white sm:text-3xl transition-all duration-300">
              {title || `Welcome back, ${userName}!`}
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-white/80">
              {subtitle || `You are logged in as ${userRole}`}
            </p>
          </div>
          {actionButton && (
            <div className="mt-4 flex md:ml-4 md:mt-0">
              {actionButton}
            </div>
          )}
        </div>
      </div>

      {/* Decorative circles with animation */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 hidden md:block">
        <div className={`h-64 w-64 rounded-full bg-accent-500 opacity-10 ${futuristic ? 'animate-student-float' : ''}`} style={{ animationDuration: '8s' }}></div>
      </div>
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 hidden md:block">
        <div className={`h-40 w-40 rounded-full bg-primary-400 opacity-10 ${futuristic ? 'animate-student-float' : ''}`} style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
      </div>

      {/* Additional decorative elements for futuristic design */}
      {futuristic && (
        <>
          <div className="absolute top-1/4 left-1/3 hidden md:block">
            <div className="h-20 w-20 rounded-full bg-secondary-500 opacity-5 animate-student-pulse" style={{ animationDuration: '4s' }}></div>
          </div>
          <div className="absolute bottom-1/4 right-1/3 hidden md:block">
            <div className="h-16 w-16 rounded-full bg-accent-400 opacity-5 animate-student-pulse" style={{ animationDuration: '5s', animationDelay: '0.5s' }}></div>
          </div>
        </>
      )}
    </div>
  );
};

DashboardBanner.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  userName: PropTypes.string.isRequired,
  userRole: PropTypes.string.isRequired,
  actionButton: PropTypes.node,
  bgColor: PropTypes.string,
  className: PropTypes.string,
  showPattern: PropTypes.bool,
  futuristic: PropTypes.bool
};

export default DashboardBanner;
