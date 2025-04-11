import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import sanitizeHtml from '../../utils/sanitizeHtml';

const Overview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    notices: 0,
    gallery: 0,
    courses: 0,
    studyMaterials: 0
  });
  const [recentNotices, setRecentNotices] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastLoginTime, setLastLoginTime] = useState(null);

  useEffect(() => {
    // Set last login time
    const now = new Date();
    setLastLoginTime(now.toLocaleString());

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch students
        const studentsRes = await axios.get('http://localhost:5001/api/students');

        // Fetch teachers
        const teachersRes = await axios.get('http://localhost:5001/api/teachers');

        // Fetch notices
        const noticesRes = await axios.get('http://localhost:5001/api/notices');

        // Fetch gallery
        const galleryRes = await axios.get('http://localhost:5001/api/gallery');

        // Fetch courses
        const coursesRes = await axios.get('http://localhost:5001/api/courses');

        // Fetch study materials
        const materialsRes = await axios.get('http://localhost:5001/api/study-materials');

        // Fetch overview data
        const overviewRes = await axios.get('http://localhost:5001/api/overview');

        setStats({
          students: studentsRes.data.length,
          teachers: teachersRes.data.length,
          notices: noticesRes.data.length,
          gallery: galleryRes.data.length,
          courses: coursesRes.data.length,
          studyMaterials: materialsRes.data.length
        });

        setOverviewData(overviewRes.data);

        // Set recent notices
        setRecentNotices(noticesRes.data.slice(0, 5));

        // Set recent students (sort by newest first)
        const sortedStudents = [...studentsRes.data].sort((a, b) => {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });
        setRecentStudents(sortedStudents.slice(0, 5));

        setLoading(false);
      } catch (error) {
        console.error('Error fetching overview data:', error);
        setError('Failed to load overview data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
        <div className="text-sm text-gray-500">
          Last login: {lastLoginTime}
        </div>
      </div>

      {/* Welcome Section */}
      <div className="mt-6 bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-start">
          <div className="mr-4">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold">Welcome back, {user?.name || 'Admin'}!</h2>
            <p className="mt-1 text-primary-100">Here's what's happening with your college today.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 admin-stats-grid">
            <div className="bg-white overflow-hidden shadow rounded-lg admin-card admin-stat-card">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stats.students}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link to="/admin/students" className="font-medium text-blue-600 hover:text-blue-500">
                    View all
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg admin-card admin-stat-card">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Teachers</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stats.teachers}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link to="/admin/teachers" className="font-medium text-blue-600 hover:text-blue-500">
                    View all
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg admin-card admin-stat-card">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Notices</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stats.notices}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link to="/admin/notices" className="font-medium text-blue-600 hover:text-blue-500">
                    View all
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg admin-card admin-stat-card">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Gallery Images</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stats.gallery}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link to="/admin/gallery" className="font-medium text-blue-600 hover:text-blue-500">
                    View all
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg admin-card admin-stat-card">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Courses</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stats.courses}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link to="/admin/courses" className="font-medium text-blue-600 hover:text-blue-500">
                    View all
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg admin-card admin-stat-card">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-pink-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Study Materials</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stats.studyMaterials}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link to="/admin/study-materials" className="font-medium text-blue-600 hover:text-blue-500">
                    View all
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* College Overview */}
          {overviewData && (
            <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg admin-card">
              <div className="px-4 py-5 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">{overviewData.title}</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">{overviewData.content}</p>
                </div>
                <Link
                  to="/admin/overview/edit"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 admin-action-btn"
                >
                  Edit Overview
                </Link>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Mission</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{overviewData.mission}</dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Vision</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{overviewData.vision}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {/* Recent Activity Section */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 admin-content-section">
            {/* Recent Notices */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                <h2 className="text-lg font-medium text-gray-900">Recent Notices</h2>
                <Link to="/admin/notices" className="text-sm font-medium text-primary-600 hover:text-primary-800">
                  View all notices
                </Link>
              </div>
              <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md admin-card">
                <ul className="divide-y divide-gray-200">
                  {recentNotices.length > 0 ? (
                    recentNotices.map((notice) => (
                      <li key={notice._id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-blue-600 truncate">
                              {notice.title}
                              {notice.important && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Important
                                </span>
                              )}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {formatDate(notice.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <div className="text-sm text-gray-500">
                                {notice.content.length > 100
                                  ? <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(`${notice.content.substring(0, 100)}...`) }} />
                                  : <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(notice.content) }} />}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-4 sm:px-6 text-center text-gray-500">No notices available</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Recent Students */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                <h2 className="text-lg font-medium text-gray-900">Recently Added Students</h2>
                <Link to="/admin/students" className="text-sm font-medium text-primary-600 hover:text-primary-800">
                  View all students
                </Link>
              </div>
              <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md admin-card">
                <ul className="divide-y divide-gray-200">
                  {recentStudents.length > 0 ? (
                    recentStudents.map((student) => (
                      <li key={student._id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <span className="text-primary-600 font-medium">{student.name.charAt(0)}</span>
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-medium text-gray-900">{student.name}</p>
                                <p className="text-sm text-gray-500">{student.rollNumber || 'No Roll Number'}</p>
                              </div>
                            </div>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {student.class || 'Class not assigned'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-4 sm:px-6 text-center text-gray-500">No recent students</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
              <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
              <p className="text-sm text-gray-500">Frequently used admin actions</p>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 admin-content-section">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden shadow-md rounded-lg border border-blue-200 hover:shadow-lg transition-all duration-200">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-2">
                      <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                    <h3 className="ml-3 text-lg font-medium text-gray-900">Add Student</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    Register a new student with their details and credentials.
                  </p>
                  <div className="mt-4">
                    <Link
                      to="/admin/students"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 w-full justify-center admin-action-btn"
                    >
                      Add Student
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 overflow-hidden shadow-md rounded-lg border border-green-200 hover:shadow-lg transition-all duration-200">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-2">
                      <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                    <h3 className="ml-3 text-lg font-medium text-gray-900">Add Teacher</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    Register a new teacher with their details and credentials.
                  </p>
                  <div className="mt-4">
                    <Link
                      to="/admin/teachers"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 w-full justify-center admin-action-btn"
                    >
                      Add Teacher
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 overflow-hidden shadow-md rounded-lg border border-yellow-200 hover:shadow-lg transition-all duration-200">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 bg-yellow-500 rounded-md p-2">
                      <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                    </div>
                    <h3 className="ml-3 text-lg font-medium text-gray-900">Post Notice</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    Create and publish a new notice for students and teachers.
                  </p>
                  <div className="mt-4">
                    <Link
                      to="/admin/notices"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 w-full justify-center admin-action-btn"
                    >
                      Post Notice
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 overflow-hidden shadow-md rounded-lg border border-purple-200 hover:shadow-lg transition-all duration-200">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 bg-purple-500 rounded-md p-2">
                      <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="ml-3 text-lg font-medium text-gray-900">Add to Gallery</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    Upload new images to the college gallery section.
                  </p>
                  <div className="mt-4">
                    <Link
                      to="/admin/gallery"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 w-full justify-center admin-action-btn"
                    >
                      Upload Images
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Overview;
