import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

const SubjectAttendanceChart = ({ attendanceData }) => {
  // Process attendance data for the chart
  const subjectData = useMemo(() => {
    if (!attendanceData || !attendanceData.attendance || attendanceData.attendance.length === 0) {
      return [];
    }

    const subjectMap = {};
    
    attendanceData.attendance.forEach(record => {
      const subject = record.subject;
      
      if (!subjectMap[subject]) {
        subjectMap[subject] = {
          subject,
          total: 0,
          present: 0
        };
      }
      
      subjectMap[subject].total += 1;
      if (record.present) {
        subjectMap[subject].present += 1;
      }
    });
    
    return Object.values(subjectMap).map(subject => ({
      ...subject,
      percentage: subject.total > 0 ? Math.round((subject.present / subject.total) * 100) : 0
    })).sort((a, b) => b.percentage - a.percentage);
  }, [attendanceData]);

  // Get color based on percentage
  const getBarColor = (percentage) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Get text color based on percentage
  const getTextColor = (percentage) => {
    if (percentage >= 75) return 'text-green-700';
    if (percentage >= 60) return 'text-yellow-700';
    return 'text-red-700';
  };

  if (subjectData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Subject-wise Attendance</h3>
        <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No attendance data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Subject-wise Attendance</h3>
      
      <div className="space-y-4">
        {subjectData.map((subject, index) => (
          <div key={index} className="relative">
            <div className="flex justify-between items-center mb-1">
              <div className="text-sm font-medium text-gray-700 truncate" title={subject.subject}>
                {subject.subject}
              </div>
              <div className={`text-sm font-medium ${getTextColor(subject.percentage)}`}>
                {subject.percentage}% ({subject.present}/{subject.total})
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`${getBarColor(subject.percentage)} h-2.5 rounded-full`} 
                style={{ width: `${subject.percentage}%` }}
              ></div>
            </div>
            {/* Threshold indicator at 75% */}
            <div 
              className="absolute top-0 bottom-0 w-px bg-gray-400" 
              style={{ left: '75%', height: '100%' }}
            >
              <div className="absolute -top-1 -ml-1 w-2 h-2 rounded-full bg-gray-400"></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <div>Minimum Required: 75%</div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
              <span>Good</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
              <span>Warning</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
              <span>Critical</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

SubjectAttendanceChart.propTypes = {
  attendanceData: PropTypes.object
};

export default SubjectAttendanceChart;
