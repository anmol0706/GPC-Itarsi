import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';

// Dashboard Components
import DashboardCard from '../../components/dashboard/DashboardCard';
import DashboardStat from '../../components/dashboard/DashboardStat';
import DashboardTable from '../../components/dashboard/DashboardTable';
import UpcomingEvents from '../../components/calendar/UpcomingEvents';

const Overview = () => {
  const { user } = useAuth();
  const [teacherData, setTeacherData] = useState(null);
  const [students, setStudents] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set teacher data directly from user object
  useEffect(() => {
    if (user) {
      // Create a default teacher data object if none exists
      const defaultTeacherData = {
        name: user.name || user.username,
        department: user.department || 'General',
        subjects: user.subjects || []
      };

      // Use the user object directly as teacher data
      setTeacherData(defaultTeacherData);
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
          setError('Authentication token not found');
          setLoading(false);
          return;
        }

        // Skip teacher profile fetch since we're using the user data directly

        // Fetch students using the teacher-specific endpoint
        const studentsRes = await axios.get(`${config.apiUrl}/api/teachers/students`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setStudents(studentsRes.data);

        // Fetch study materials using our new dedicated endpoint
        try {
          const materialsRes = await axios.get(`${config.apiUrl}/api/study-materials`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setStudyMaterials(materialsRes.data);
          console.log('Successfully fetched study materials');
        } catch (materialError) {
          console.error('Error fetching study materials:', materialError);

          // Try fallback endpoint
          try {
            const fallbackRes = await axios.get(`${config.apiUrl}/api/study-materials/all`);
            setStudyMaterials(fallbackRes.data);
            console.log('Successfully fetched study materials from fallback endpoint');
          } catch (fallbackError) {
            console.error('Error fetching study materials from fallback endpoint:', fallbackError);
            // Set empty array if all attempts fail
            setStudyMaterials([]);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching overview data:', error);
        setError(error.response?.data?.message || 'Failed to load overview data');
        setLoading(false);
      }
    };

    // Only fetch data when teacherData is available
    if (teacherData) {
      fetchData();
    }
  }, [teacherData]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-4 md:hidden">Teacher Dashboard</h1>

      {loading ? (
        <div className="mt-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <DashboardCard
          title="Error"
          className="mt-6 border-red-200 bg-red-50"
          headerClassName="bg-red-100 text-red-800 border-red-200"
        >
          <div className="text-red-700">{error}</div>
        </DashboardCard>
      ) : !teacherData ? (
        <DashboardCard
          title="Notice"
          className="mt-6 border-yellow-200 bg-yellow-50"
          headerClassName="bg-yellow-100 text-yellow-800 border-yellow-200"
        >
          <div className="text-yellow-700">Creating teacher profile... Please wait a moment and refresh the page if this message persists.</div>
        </DashboardCard>
      ) : (
        <>
          {/* Profile Completion Notification */}
          {user && user.profileComplete === false && (
            <div className="mt-6 mb-6 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded relative
              shadow-lg transition-all duration-500 animate-pulse"
              style={{
                boxShadow: '0 0 15px rgba(0, 0, 255, 0.2)',
                background: 'linear-gradient(to right, rgba(219, 234, 254, 0.9), rgba(191, 219, 254, 0.9))'
              }}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">
                    Welcome! Your profile is incomplete. Please visit the <Link to="/teacher/profile" className="underline font-bold">Profile page</Link> to complete your details.
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* Teacher Info */}
          <DashboardCard
            title="Teacher Information"
            className="mb-6"
            headerClassName="bg-primary-50 text-primary-800"
            actions={
              <Link
                to="/teacher/profile"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
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
                    <div className="text-sm font-medium text-gray-900">{teacherData?.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Department</div>
                    <div className="text-sm font-medium text-gray-900">{teacherData?.department}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Teaching Information</h4>
                <div>
                  <div className="text-xs text-gray-500 mb-2">Subjects</div>
                  {teacherData?.subjects && teacherData.subjects.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {teacherData.subjects.map((subject, index) => (
                        <span key={index} className="bg-primary-100 text-primary-800 text-xs font-semibold px-2.5 py-0.5 rounded-md">
                          {subject}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">No subjects assigned</div>
                  )}
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Quick Stats */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DashboardStat
              title="Total Students"
              value={students.length.toString()}
              icon={
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
              iconBgColor="bg-primary-500"
              change="Mark Attendance"
              changeType="neutral"
            />

            <DashboardStat
              title="Study Materials"
              value={studyMaterials.length.toString()}
              icon={
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
              iconBgColor="bg-accent-500"
              change="Upload Materials"
              changeType="neutral"
            />

            <DashboardStat
              title="Today's Date"
              value={formatDate(new Date())}
              icon={
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              }
              iconBgColor="bg-green-500"
              change={new Date().toLocaleDateString('en-US', { weekday: 'long' })}
              changeType="neutral"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Link to="/teacher/attendance" className="block">
              <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100 hover:shadow-lg transition-shadow duration-300 h-full">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-md bg-primary-100 text-primary-700 mr-3">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Attendance Management</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">Mark and manage student attendance for your classes. View attendance records and generate reports.</p>
                <div className="text-sm font-medium text-primary-600 hover:text-primary-700">Manage attendance →</div>
              </div>
            </Link>

            <Link to="/teacher/study-materials" className="block">
              <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100 hover:shadow-lg transition-shadow duration-300 h-full">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-md bg-primary-100 text-primary-700 mr-3">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Study Materials</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">Upload and manage study materials for your students. Organize materials by class and subject.</p>
                <div className="text-sm font-medium text-primary-600 hover:text-primary-700">Manage materials →</div>
              </div>
            </Link>
          </div>

          {/* Recent Study Materials */}
          <DashboardCard
            title="Recent Study Materials"
            className="mb-6"
            headerClassName="bg-primary-50 text-primary-800"
            actions={
              <Link
                to="/teacher/study-materials"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200"
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
                <p className="mt-2">No study materials uploaded yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studyMaterials.slice(0, 4).map((material) => (
                  <div key={material._id} className="bg-white border border-gray-100 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-medium text-primary-600 truncate">{material.title}</h3>
                      <span className="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-green-100 text-green-800">
                        {formatDate(material.uploadDate)}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 mb-2 flex items-center">
                      <svg className="flex-shrink-0 mr-1 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      For Class: {material.forClass}
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {material.description || 'No description provided for this material.'}
                    </p>

                    <div className="flex justify-between items-center">
                      <a
                        href={`${config.apiUrl}/uploads/study-materials/${material.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200"
                      >
                        <svg className="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </a>

                      <span className="text-xs text-gray-500">
                        {material.subject || 'General'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>

          {/* Quick Actions */}
          <DashboardCard
            title="Quick Actions"
            className="mb-6"
            headerClassName="bg-primary-50 text-primary-800"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center mb-3">
                  <div className="p-2 rounded-md bg-primary-100 text-primary-700 mr-3">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h3 className="text-base font-medium text-gray-900">Mark Attendance</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Record student attendance for your classes.
                </p>
                <Link
                  to="/teacher/attendance"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
                >
                  Mark Attendance
                </Link>
              </div>

              <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center mb-3">
                  <div className="p-2 rounded-md bg-primary-100 text-primary-700 mr-3">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-base font-medium text-gray-900">Upload Materials</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Share study materials with your students.
                </p>
                <Link
                  to="/teacher/study-materials"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
                >
                  Upload Material
                </Link>
              </div>

              <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center mb-3">
                  <div className="p-2 rounded-md bg-primary-100 text-primary-700 mr-3">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-medium text-gray-900">Update Profile</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Update your profile information and picture.
                </p>
                <Link
                  to="/teacher/profile"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </DashboardCard>

          {/* Upcoming Events */}
          <UpcomingEvents />
        </>
      )}
    </div>
  );
};

export default Overview;
