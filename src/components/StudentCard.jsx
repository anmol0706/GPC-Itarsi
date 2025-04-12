import React from 'react';
import { getProfileImageUrl, handleImageError } from '../utils/imageUtils';
import { API_URL } from '../config/api';

const StudentCard = ({ student, onClick }) => {
  // Function to get profile image URL or use first letter of name as fallback
  const getStudentImage = (student) => {
    if (student.profilePicture) {
      return `${API_URL}/uploads/profiles/${student.profilePicture}`;
    }
    return null;
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105"
      onClick={() => onClick(student)}
    >
      <div className="p-4 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center mb-3">
          {student.profilePicture ? (
            <img
              src={getStudentImage(student)}
              alt={student.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=6366F1&color=fff`;
              }}
            />
          ) : (
            <span className="text-primary-600 font-medium text-xl">{student.name.charAt(0)}</span>
          )}
        </div>
        <h3 className="text-sm font-medium text-gray-900 text-center">{student.name}</h3>
        <p className="text-xs text-gray-500 text-center mt-1">{student.rollNumber}</p>
        <div className="mt-2">
          <span className="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-blue-100 text-blue-800">
            {student.class || 'No Class'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StudentCard;
