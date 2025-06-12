import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './CourseDetailsModal.css';
import { getDepartmentImageUrl, getDepartmentImageAttribution } from '../utils/departmentImageUtils';
import ImageAttribution from './ImageAttribution';

const CourseDetailsModal = ({ isOpen, onClose, department }) => {
  const modalRef = useRef(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close modal on escape key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !department) return null;

  // Determine color scheme based on department
  const getColorScheme = () => {
    switch (department.name) {
      case 'Computer Science':
        return {
          bgGradient: 'from-blue-600 to-blue-800',
          iconBg: 'bg-blue-500',
          textColor: 'text-blue-700',
          bgLight: 'bg-blue-50',
          borderColor: 'border-blue-100',
          glowColor: 'rgba(59, 130, 246, 0.6)'
        };
      case 'Mechanical Engineering':
        return {
          bgGradient: 'from-yellow-500 to-yellow-700',
          iconBg: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          bgLight: 'bg-yellow-50',
          borderColor: 'border-yellow-100',
          glowColor: 'rgba(245, 158, 11, 0.6)'
        };
      case 'Electronics & Telecom':
        return {
          bgGradient: 'from-green-500 to-green-700',
          iconBg: 'bg-green-500',
          textColor: 'text-green-700',
          bgLight: 'bg-green-50',
          borderColor: 'border-green-100',
          glowColor: 'rgba(16, 185, 129, 0.6)'
        };
      case 'Electrical Engineering':
        return {
          bgGradient: 'from-red-500 to-red-700',
          iconBg: 'bg-red-500',
          textColor: 'text-red-700',
          bgLight: 'bg-red-50',
          borderColor: 'border-red-100',
          glowColor: 'rgba(239, 68, 68, 0.6)'
        };
      default:
        return {
          bgGradient: 'from-primary-500 to-primary-700',
          iconBg: 'bg-primary-500',
          textColor: 'text-primary-700',
          bgLight: 'bg-primary-50',
          borderColor: 'border-primary-100',
          glowColor: 'rgba(99, 102, 241, 0.6)'
        };
    }
  };

  const colors = getColorScheme();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Background overlay with blur */}
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

        {/* Modal content */}
        <div
          ref={modalRef}
          className="course-modal-container relative"
          style={{ '--glow-color': colors.glowColor }}
        >
          <div className="course-modal-content bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all max-w-2xl w-full">
            {/* Header with gradient background */}
            <div className={`relative px-6 py-4 bg-gradient-to-r ${colors.bgGradient} text-white`}>
              <div className="absolute inset-0 bg-grid-white opacity-10"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`${colors.iconBg} rounded-full p-2 shadow-lg mr-3`}>
                    {department.icon}
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">{department.name}</h3>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200 focus:outline-none transition-transform hover:scale-110"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className={`font-semibold ${colors.textColor} text-lg mb-2`}>Department Overview</h4>
                  <p className="text-gray-700">{department.description}</p>

                  {/* Department Image */}
                  <div className="mt-4 rounded-lg overflow-hidden shadow-md border border-gray-200">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={getDepartmentImageUrl(department.name)}
                        alt={`${department.name} Department`}
                        className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-110"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getDepartmentImageUrl('fallback');
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white text-sm font-medium">Department of {department.name}</p>
                      </div>
                    </div>
                    <div className="p-1 bg-gray-50">
                      <ImageAttribution {...getDepartmentImageAttribution(department.name)} />
                    </div>
                  </div>
                </div>

                <div className={`${colors.bgLight} rounded-lg p-5 ${colors.borderColor} border`}>
                  <h4 className={`font-semibold ${colors.textColor} mb-3 flex items-center`}>
                    <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Key Subjects
                  </h4>
                  <ul className="space-y-2">
                    {department.subjects.map((subject, index) => (
                      <li key={index} className="flex items-start">
                        <svg className={`h-5 w-5 ${colors.textColor} mr-2 flex-shrink-0 mt-0.5`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                        </svg>
                        {subject}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${colors.bgLight} border ${colors.borderColor}`}>
                  <h4 className={`font-semibold ${colors.textColor} mb-2 flex items-center`}>
                    <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Duration
                  </h4>
                  <p className="text-gray-700">3 Years (6 Semesters)</p>
                </div>

                <div className={`p-4 rounded-lg ${colors.bgLight} border ${colors.borderColor}`}>
                  <h4 className={`font-semibold ${colors.textColor} mb-2 flex items-center`}>
                    <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Seats Available
                  </h4>
                  <p className="text-gray-700">60 per year</p>
                </div>
              </div>
            </div>

            {/* Footer with action button */}
            <div className="px-6 py-4 bg-gray-50 flex justify-end">
              <button
                className={`px-4 py-2 bg-gradient-to-r ${colors.bgGradient} text-white rounded-md shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

CourseDetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  department: PropTypes.shape({
    name: PropTypes.string.isRequired,
    icon: PropTypes.node.isRequired,
    description: PropTypes.string.isRequired,
    subjects: PropTypes.arrayOf(PropTypes.string).isRequired
  })
};

export default CourseDetailsModal;
