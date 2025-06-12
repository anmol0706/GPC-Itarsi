import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

const AttendanceSummary = ({ attendanceData }) => {
  // Calculate summary statistics
  const stats = useMemo(() => {
    if (!attendanceData) {
      return {
        totalClasses: 0,
        presentClasses: 0,
        absentClasses: 0,
        attendancePercentage: 0,
        status: 'warning'
      };
    }

    const totalClasses = attendanceData.totalClasses || 0;
    const presentClasses = attendanceData.presentClasses || 0;
    const absentClasses = totalClasses - presentClasses;
    const attendancePercentage = attendanceData.attendancePercentage || 0;

    // Determine status based on attendance percentage
    let status = 'warning';
    if (attendancePercentage >= 75) {
      status = 'good';
    } else if (attendancePercentage < 60) {
      status = 'critical';
    }

    return {
      totalClasses,
      presentClasses,
      absentClasses,
      attendancePercentage,
      status
    };
  }, [attendanceData]);

  // Calculate classes needed to reach 75% attendance
  const classesNeeded = useMemo(() => {
    if (stats.attendancePercentage >= 75 || stats.totalClasses === 0) {
      return 0;
    }

    // Formula: (0.75 * (totalClasses + x) - presentClasses) = x
    // Solving for x: x = (3 * presentClasses - 0.75 * totalClasses) / 0.25
    const x = Math.ceil((3 * stats.presentClasses - 0.75 * stats.totalClasses) / 0.25);
    return Math.max(0, x);
  }, [stats]);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'good':
        return 'bg-success/10 text-success';
      case 'warning':
        return 'bg-warning/10 text-warning';
      case 'critical':
        return 'bg-error/10 text-error';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get progress bar color
  const getProgressColor = (percentage) => {
    if (percentage >= 75) return 'bg-success';
    if (percentage >= 60) return 'bg-warning';
    return 'bg-error';
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium text-primary-700 mb-4">Attendance Summary</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Total Classes</div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalClasses}</div>
        </div>

        <div className="bg-success/5 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Present</div>
          <div className="text-2xl font-bold text-success">{stats.presentClasses}</div>
        </div>

        <div className="bg-error/5 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Absent</div>
          <div className="text-2xl font-bold text-error">{stats.absentClasses}</div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-medium text-gray-700">Overall Attendance</div>
          <div className="flex items-center">
            <span className="text-lg font-bold text-gray-900 mr-2">{stats.attendancePercentage}%</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(stats.status)}`}>
              {stats.status === 'good' ? 'Good' : stats.status === 'warning' ? 'Warning' : 'Critical'}
            </span>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
          <div
            className={`${getProgressColor(stats.attendancePercentage)} h-2.5 rounded-full`}
            style={{ width: `${stats.attendancePercentage}%` }}
          ></div>
        </div>

        <div className="relative w-full h-4">
          <div className="absolute left-3/4 top-0 w-px h-2 bg-gray-400"></div>
          <div className="absolute left-3/4 -top-1 transform -translate-x-1/2 text-xs text-gray-500">
            75% (Required)
          </div>
        </div>
      </div>

      {stats.attendancePercentage < 75 && (
        <div className="bg-warning/5 border border-warning/20 rounded-lg p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-warning">Attendance Alert</h3>
              <div className="mt-2 text-sm text-warning/90">
                <p>
                  Your attendance is below the required 75%. You need to attend at least <strong>{classesNeeded}</strong> more consecutive classes to reach the minimum requirement.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500">
        <p>Note: Minimum 75% attendance is required as per college regulations.</p>
      </div>
    </div>
  );
};

AttendanceSummary.propTypes = {
  attendanceData: PropTypes.object
};

export default AttendanceSummary;
