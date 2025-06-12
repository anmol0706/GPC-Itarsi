import { useEffect, useMemo } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProfileImageUrl, handleImageError } from '../../utils/imageUtils';
import useMobileSidebar from '../../hooks/useMobileSidebar';
import { createSwipeHandler } from '../../utils/touchUtils';
import LoadingSpinner from '../../components/LoadingSpinner';

// Teacher Components
import Overview from './Overview';
import Attendance from './Attendance';
import StudyMaterials from './StudyMaterials';
import Profile from './Profile';
import NotificationManagement from './NotificationManagement';
// Grades feature has been removed

// Dashboard Components
import DashboardBanner from '../../components/dashboard/DashboardBanner';

// Import Teacher Dashboard styles
import '../../styles/TeacherDashboard.css';

const Dashboard = () => {
  const { user, isTeacher, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useMobileSidebar();

  // Create swipe handlers for mobile sidebar
  const swipeHandlers = useMemo(
    () => createSwipeHandler(closeSidebar, null, 30),
    [closeSidebar]
  );

  useEffect(() => {
    // Redirect if not teacher and not in loading state
    if (!loading && !isTeacher) {
      navigate('/login');
    }
  }, [isTeacher, navigate, loading]);

  // Show loading spinner while authentication is in progress
  if (loading) {
    return <LoadingSpinner message="Loading teacher dashboard..." fullScreen={true} />;
  }

  // Check if the current route is active
  const isActive = (path) => {
    return location.pathname === `/teacher${path}`;
  };

  return (
    <div className="h-screen flex overflow-hidden bg-neutral-100">
      {/* Sidebar for mobile */}
      <div className={`md:hidden ${isSidebarOpen ? 'fixed inset-0 z-50 flex' : 'hidden'}`}>
        <div
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${
            isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={toggleSidebar}
        ></div>
        <div
          className={`relative flex-1 flex flex-col max-w-[80%] w-full bg-primary-900 text-white transition ease-in-out duration-300 transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          {...swipeHandlers}
        >
          <div className="absolute top-0 right-0 -mr-14 pt-4">
            <button
              className="ml-1 flex items-center justify-center h-12 w-12 rounded-full bg-gray-800 bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={toggleSidebar}
            >
              <span className="sr-only">Close sidebar</span>
              <svg
                className="h-6 w-6 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto scrollbar-thin scrollbar-thumb-primary-800 scrollbar-track-primary-600">
            <div className="flex-shrink-0 flex items-center px-4">
              <span className="text-white text-xl font-bold">Teacher Dashboard</span>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              <Link
                to="/teacher"
                className={`${
                  isActive('') ? 'bg-primary-700 text-white' : 'text-white hover:bg-primary-800'
                } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
              >
                <svg
                  className="mr-4 h-6 w-6 text-secondary-200"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Overview
              </Link>
              <Link
                to="/teacher/attendance"
                className={`${
                  isActive('/attendance') ? 'bg-primary-700 text-white' : 'text-white hover:bg-primary-800'
                } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
              >
                <svg
                  className="mr-4 h-6 w-6 text-secondary-200"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
                Attendance
              </Link>
              <Link
                to="/teacher/study-materials"
                className={`${
                  isActive('/study-materials') ? 'bg-primary-700 text-white' : 'text-white hover:bg-primary-800'
                } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
              >
                <svg
                  className="mr-4 h-6 w-6 text-secondary-200"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                Study Materials
              </Link>
              {/* Grades feature has been removed */}
              <Link
                to="/teacher/profile"
                className={`${
                  isActive('/profile') ? 'bg-primary-700 text-white' : 'text-white hover:bg-primary-800'
                } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
              >
                <svg
                  className="mr-4 h-6 w-6 text-secondary-200"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Profile
              </Link>
              <Link
                to="/calendar"
                className="text-white hover:bg-primary-800 group flex items-center px-2 py-2 text-base font-medium rounded-md"
              >
                <svg
                  className="mr-4 h-6 w-6 text-secondary-200"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Calendar
              </Link>
              <Link
                to="/teacher/notifications"
                className={`${
                  isActive('/notifications') ? 'bg-primary-700 text-white' : 'text-white hover:bg-primary-800'
                } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
              >
                <svg
                  className="mr-4 h-6 w-6 text-secondary-200"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                Notifications
              </Link>
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-primary-700 p-4 mt-auto">
            <div className="flex-shrink-0 group block">
              <div className="flex items-center">
                <div>
                  <img
                    className="inline-block h-10 w-10 rounded-full object-cover"
                    src={getProfileImageUrl(user?.profilePicture)}
                    alt="Profile"
                    onError={handleImageError}
                  />
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-white">{user?.username}</p>
                  <p className="text-sm font-medium text-accent-300">Teacher</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-primary-900 text-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <span className="text-white text-xl font-bold">Teacher Dashboard</span>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                <Link
                  to="/teacher"
                  className={`${
                    isActive('') ? 'bg-primary-700 text-white' : 'text-secondary-100 hover:bg-primary-800'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <svg
                    className="mr-3 h-6 w-6 text-secondary-300"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Overview
                </Link>
                <Link
                  to="/teacher/attendance"
                  className={`${
                    isActive('/attendance') ? 'bg-primary-700 text-white' : 'text-secondary-100 hover:bg-primary-800'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <svg
                    className="mr-3 h-6 w-6 text-secondary-300"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                  Attendance
                </Link>
                <Link
                  to="/teacher/study-materials"
                  className={`${
                    isActive('/study-materials') ? 'bg-primary-700 text-white' : 'text-secondary-100 hover:bg-primary-800'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <svg
                    className="mr-3 h-6 w-6 text-secondary-300"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  Study Materials
                </Link>
                {/* Grades feature has been removed */}
                <Link
                  to="/teacher/profile"
                  className={`${
                    isActive('/profile') ? 'bg-primary-700 text-white' : 'text-secondary-100 hover:bg-primary-800'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <svg
                    className="mr-3 h-6 w-6 text-secondary-300"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Profile
                </Link>
                <Link
                  to="/calendar"
                  className="text-secondary-100 hover:bg-primary-800 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                >
                  <svg
                    className="mr-3 h-6 w-6 text-secondary-300"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Calendar
                </Link>
                <Link
                  to="/teacher/notifications"
                  className={`${
                    isActive('/notifications') ? 'bg-primary-700 text-white' : 'text-secondary-100 hover:bg-primary-800'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <svg
                    className="mr-3 h-6 w-6 text-secondary-300"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  Notifications
                </Link>
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-primary-700 p-4">
              <div className="flex-shrink-0 w-full group block">
                <div className="flex items-center">
                  <div>
                    <img
                      className="inline-block h-9 w-9 rounded-full object-cover"
                      src={getProfileImageUrl(user?.profilePicture)}
                      alt="Profile"
                      onError={handleImageError}
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">{user?.username}</p>
                    <p className="text-xs font-medium text-accent-300">Teacher</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 sticky top-0 z-10 bg-white shadow-md">
          <div className="flex justify-between items-center pr-4">
            <button
              className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors duration-200"
              onClick={toggleSidebar}
            >
            <span className="sr-only">Open sidebar</span>
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            </button>
            <h1 className="text-lg font-semibold text-primary-700">Teacher Dashboard</h1>
          </div>
        </div>
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-neutral-50">
          <div className="py-3 md:py-4">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8">
              {/* Welcome Banner */}
              <div className="mb-6 hidden md:block">
                <DashboardBanner
                  userName={user?.username || 'Teacher'}
                  userRole="Teacher"
                  subtitle={`Welcome to your dashboard. Here you can manage student attendance, upload study materials, and update your profile.`}
                  bgColor="bg-primary-800"
                  showPattern={true}
                  actionButton={
                    <Link
                      to="/teacher/profile"
                      className="inline-flex items-center px-4 py-2 border border-primary-600/30 rounded-md shadow-sm text-sm font-medium text-white bg-primary-700 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                    >
                      View Profile
                    </Link>
                  }
                />
              </div>

              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/study-materials" element={<StudyMaterials />} />
                {/* Grades feature has been removed */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/notifications" element={<NotificationManagement />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
