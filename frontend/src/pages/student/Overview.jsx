import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';
import NoticeContent from '../../components/notices/NoticeContent';

// Dashboard Components
import DashboardCard from '../../components/dashboard/DashboardCard';
import DashboardStat from '../../components/dashboard/DashboardStat';
import DashboardTable from '../../components/dashboard/DashboardTable';
import UpcomingEvents from '../../components/calendar/UpcomingEvents';

const Overview = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [notices, setNotices] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors
        const token = localStorage.getItem('token');

        if (!token) {
          setError('Authentication token not found. Please log in again.');
          setLoading(false);
          return;
        }

        // Fetch student profile with better error handling
        let profileData;
        try {
          console.log('Fetching student profile...');
          const profileRes = await axios.get(`${config.apiUrl}/api/students/profile`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          profileData = profileRes.data;
          setStudentData(profileData);
          console.log('Student profile fetched successfully:', profileData.name);
        } catch (profileError) {
          console.error('Error fetching student profile:', profileError);

          // Handle specific authentication errors
          if (profileError.response && (profileError.response.status === 401 || profileError.response.status === 403)) {
            setError('Your session has expired or you do not have permission to access this page. Please log in again.');
            setLoading(false);
            // Optionally redirect to login page or clear token
            // localStorage.removeItem('token');
            return;
          }

          throw profileError; // Re-throw to be caught by the outer catch block
        }

        // Fetch notices - continue even if this fails
        try {
          console.log('Fetching notices...');
          const noticesRes = await axios.get(`${config.apiUrl}/api/notices`);
          setNotices(noticesRes.data.slice(0, 5)); // Get only the latest 5 notices
          console.log('Notices fetched successfully:', noticesRes.data.length);
        } catch (noticesError) {
          console.error('Error fetching notices:', noticesError);
          // Don't set error state, just continue with empty notices
          setNotices([]);
        }

        // Fetch study materials for student's class - continue even if this fails
        try {
          console.log('Fetching study materials...');
          const materialsRes = await axios.get(`${config.apiUrl}/api/study-materials`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          // Filter study materials for student's class
          const allMaterials = materialsRes.data.filter(material =>
            material.class === profileData.class
          );

          // Sort by upload date (newest first)
          allMaterials.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

          setStudyMaterials(allMaterials.slice(0, 5)); // Get only the latest 5 materials
          console.log('Study materials fetched successfully:', allMaterials.length);
        } catch (materialsError) {
          console.error('Error fetching study materials:', materialsError);
          // Don't set error state, just continue with empty materials
          setStudyMaterials([]);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching overview data:', error);

        // Provide more detailed error information
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);

          // Handle different status codes
          if (error.response.status === 401) {
            setError('Your session has expired. Please log in again.');
          } else if (error.response.status === 403) {
            setError('You do not have permission to access this page. Please log in with the correct account.');
          } else if (error.response.status === 404) {
            setError('The requested resource was not found. Please contact support if this issue persists.');
          } else if (error.response.status >= 500) {
            setError('The server encountered an error. Please try again later or contact support.');
          } else {
            setError(error.response.data?.message || `Server error: ${error.response.status}`);
          }
        } else if (error.request) {
          // The request was made but no response was received
          console.error('Error request:', error.request);
          setError('No response received from server. Please check your internet connection and try again.');
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error message:', error.message);
          setError(`Error: ${error.message}`);
        }

        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateAttendancePercentage = () => {
    if (!studentData || !studentData.attendance) {
      return 0;
    }

    // Handle both array format and object format for attendance
    if (Array.isArray(studentData.attendance)) {
      if (studentData.attendance.length === 0) {
        return 0;
      }

      const totalClasses = studentData.attendance.length;
      const presentClasses = studentData.attendance.filter(a => a.present).length;

      return Math.round((presentClasses / totalClasses) * 100);
    } else if (typeof studentData.attendance === 'object') {
      // If attendance is stored in a different format
      return studentData.attendance.percentage || 0;
    }

    return 0;
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-4 md:hidden">Student Dashboard</h1>

      {loading ? (
        <div className="mt-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <DashboardCard
          title="Error"
          className="mt-6 border-red-200 bg-red-50"
          headerClassName="bg-red-100 text-red-800 border-red-200"
          futuristic={true}
        >
          <div className="p-4 flex flex-col items-center">
            <svg className="h-12 w-12 text-red-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-red-700 text-center mb-4">{error}</div>
            <div className="text-gray-600 text-sm text-center mb-6">
              Please try refreshing the page or logging out and back in. If the problem persists, contact support.
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Page
              </button>
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Log Out
              </Link>
            </div>
          </div>
        </DashboardCard>
      ) : (
        <>
          {/* Student Info */}
          <DashboardCard
            title="Student Information"
            className="mb-6"
            headerClassName="bg-primary-50 text-primary-800"
            futuristic={true}
            noHoverEffect={true}
            actions={
              <Link
                to="/student/profile"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600"
              >
                View Profile
              </Link>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Personal Details</h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-500">Full Name</div>
                    <div className="text-sm font-medium text-gray-900">{studentData?.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Roll Number</div>
                    <div className="text-sm font-medium text-gray-900">{studentData?.rollNumber}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Class</div>
                    <div className="text-sm font-medium text-gray-900">{studentData?.class}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Attendance Overview</h4>
                <div className="flex flex-col justify-center h-full">
                  <div className="mb-2 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Current Attendance</span>
                    <span className={`text-sm font-bold ${
                      calculateAttendancePercentage() >= 75 ? 'text-green-600' :
                      calculateAttendancePercentage() >= 60 ? 'text-yellow-500' : 'text-red-600'
                    }`}>
                      {calculateAttendancePercentage()}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        calculateAttendancePercentage() >= 75 ? 'bg-green-600' :
                        calculateAttendancePercentage() >= 60 ? 'bg-yellow-500' : 'bg-red-600'
                      }`}
                      style={{ width: `${calculateAttendancePercentage()}%` }}
                    ></div>
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    {calculateAttendancePercentage() >= 75
                      ? "Good attendance! Keep it up."
                      : calculateAttendancePercentage() >= 60
                        ? "Your attendance needs improvement."
                        : "Warning: Your attendance is below the required minimum."}
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Quick Stats */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DashboardStat
              title="Attendance"
              value={`${calculateAttendancePercentage()}%`}
              icon={
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              }
              iconBgColor={calculateAttendancePercentage() >= 75 ? 'bg-green-500' : calculateAttendancePercentage() >= 60 ? 'bg-yellow-500' : 'bg-red-500'}
              change="View details"
              changeType="neutral"
              futuristic={true}
              noHoverEffect={true}
            />

            <DashboardStat
              title="Study Materials"
              value={`${studyMaterials.length} available`}
              icon={
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
              iconBgColor="bg-primary-500"
              change="View all"
              changeType="neutral"
              futuristic={true}
              noHoverEffect={true}
            />

            <DashboardStat
              title="Notices"
              value={`${notices.length} new`}
              icon={
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              }
              iconBgColor="bg-accent-500"
              change="View all"
              changeType="neutral"
              futuristic={true}
              noHoverEffect={true}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Link to="/student/attendance" className="block">
              <div className="student-card p-4 h-full">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-md bg-primary-100 text-primary-700 mr-3 student-stat-icon">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Attendance Details</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">View your complete attendance record, including daily logs and monthly statistics.</p>
                <div className="text-sm font-medium text-primary-600">View attendance →</div>
              </div>
            </Link>

            <Link to="/student/study-materials" className="block">
              <div className="student-card p-4 h-full">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-md bg-primary-100 text-primary-700 mr-3 student-stat-icon">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Study Materials</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">Access all study materials, notes, and resources for your courses.</p>
                <div className="text-sm font-medium text-primary-600">Browse materials →</div>
              </div>
            </Link>
          </div>

          {/* Upcoming Events */}
          <UpcomingEvents />

          {/* Recent Notices */}
          <DashboardCard
            title="Recent Notices"
            className="mb-6"
            headerClassName="bg-primary-50 text-primary-800"
            futuristic={true}
            noHoverEffect={true}
            actions={
              <a
                href="/"
                className="text-sm font-medium text-primary-600"
              >
                View all
              </a>
            }
          >
            {notices.length === 0 ? (
              <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-md">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="mt-2">No notices available</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notices.map((notice) => (
                  <div key={notice._id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <h3 className="text-sm font-medium text-primary-600 truncate mr-2">
                          {notice.title}
                        </h3>
                        {notice.important && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Important
                          </span>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {formatDate(notice.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <NoticeContent
                        content={notice.content}
                        maxLength={150}
                        truncate={notice.content.length > 150}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>

          {/* Recent Study Materials */}
          <DashboardCard
            title="Recent Study Materials"
            className="mb-6"
            headerClassName="bg-primary-50 text-primary-800"
            futuristic={true}
            noHoverEffect={true}
            actions={
              <Link
                to="/student/study-materials"
                className="text-sm font-medium text-primary-600"
              >
                View all
              </Link>
            }
          >
            {studyMaterials.length === 0 ? (
              <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-md">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="mt-2">No study materials available for your class</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studyMaterials.map((material) => (
                  <div key={material._id} className="bg-white border border-gray-100 rounded-lg shadow-sm p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-medium text-primary-600 truncate">{material.title}</h3>
                      <span className="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-green-100 text-green-800">
                        {formatDate(material.uploadDate)}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 mb-2 flex items-center">
                      <svg className="flex-shrink-0 mr-1 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      By: {material.teacherName}
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {material.description || 'No description provided for this material.'}
                    </p>

                    <a
                      href={`${config.apiUrl}/uploads/study-materials/${material.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm font-medium text-primary-600"
                    >
                      <svg className="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </>
      )}
    </div>
  );
};

export default Overview;
