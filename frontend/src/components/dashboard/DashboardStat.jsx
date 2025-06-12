import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const DashboardStat = ({
  title,
  value,
  icon,
  iconBgColor = 'bg-primary-500',
  iconColor = 'text-white',
  change,
  changeType = 'neutral',
  className = '',
  isLoading = false,
  futuristic = true,
  noHoverEffect = false
}) => {
  const statRef = useRef(null);
  const iconRef = useRef(null);

  useEffect(() => {
    if (futuristic && statRef.current && !noHoverEffect) {
      const stat = statRef.current;
      const iconElement = iconRef.current;

      // Add subtle hover effects without 3D transformation
      const handleMouseEnter = () => {
        if (iconElement) {
          iconElement.style.animation = 'student-pulse 1.5s infinite';
        }
        // Remove the translateY effect but keep enhanced shadow
        stat.style.transform = 'translateY(0)';
        stat.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.08), 0 0 15px rgba(99, 102, 241, 0.15)';
      };

      const handleMouseLeave = () => {
        if (iconElement) {
          iconElement.style.animation = 'none';
        }
        stat.style.transform = 'translateY(0)';
        stat.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1), 0 0 10px rgba(99, 102, 241, 0.1)';
      };

      stat.addEventListener('mouseenter', handleMouseEnter);
      stat.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        stat.removeEventListener('mouseenter', handleMouseEnter);
        stat.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [futuristic, noHoverEffect]);
  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-green-600';
    if (changeType === 'negative') return 'text-red-600';
    return 'text-gray-500';
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
        </svg>
      );
    }
    if (changeType === 'negative') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      );
    }
    return null;
  };

  // Use teacher-stat class if we're in the teacher dashboard, otherwise use student-stat
  const statClass = futuristic
    ? `${window.location.pathname.includes('/teacher') ? 'teacher-stat' : 'student-stat'} p-4 transition-all duration-300 ${className}`
    : `bg-white rounded-lg shadow-md p-4 transition-all duration-300 hover:shadow-lg ${className}`;

  const iconClass = futuristic
    ? `flex-shrink-0 ${iconBgColor} rounded-md p-3 mr-4 ${window.location.pathname.includes('/teacher') ? 'teacher-stat-icon' : 'student-stat-icon'}`
    : `flex-shrink-0 ${iconBgColor} rounded-md p-3 mr-4`;

  return (
    <div ref={statRef} className={statClass}>
      <div className="flex items-center">
        <div ref={iconRef} className={iconClass}>
          <div className={`h-6 w-6 ${iconColor}`}>{icon}</div>
        </div>
        <div className="w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd>
              {isLoading ? (
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
              ) : (
                <div className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">{value}</div>
                  {change && (
                    <div className={`ml-2 flex items-center text-sm font-medium ${getChangeColor()}`}>
                      {getChangeIcon()}
                      <span className="ml-1">{change}</span>
                    </div>
                  )}
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
};

DashboardStat.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon: PropTypes.node.isRequired,
  iconBgColor: PropTypes.string,
  iconColor: PropTypes.string,
  change: PropTypes.string,
  changeType: PropTypes.oneOf(['positive', 'negative', 'neutral']),
  className: PropTypes.string,
  isLoading: PropTypes.bool,
  futuristic: PropTypes.bool,
  noHoverEffect: PropTypes.bool
};

export default DashboardStat;
