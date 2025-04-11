import { useEffect, useMemo } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProfileImageUrl, handleImageError } from '../../utils/imageUtils';
import useMobileSidebar from '../../hooks/useMobileSidebar';
import { createSwipeHandler } from '../../utils/touchUtils';

// Admin Components
import Overview from './Overview';
import Students from './Students';
import Teachers from './Teachers';
import Notices from './Notices';
import Gallery from './Gallery';
import Courses from './Courses';
import Profile from './Profile';
import CourseEdit from './CourseEdit';
import OverviewEdit from './OverviewEdit';
import StudyMaterials from './StudyMaterials';
import Documents from './Documents';
import Chatbot from './Chatbot';
import Attendance from './Attendance';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useMobileSidebar();

  // Create swipe handlers for mobile sidebar
  const swipeHandlers = useMemo(
    () => createSwipeHandler(closeSidebar, null, 30),
    [closeSidebar]
  );

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      navigate('/login');
    }
  }, [isAdmin, navigate]);

  // Check if the current route is active
  const isActive = (path) => {
    return location.pathname === `/admin${path}`;
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
          className={`relative flex-1 flex flex-col max-w-[80%] w-full bg-primary-700 text-white transition ease-in-out duration-300 transform ${
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
              <span className="text-white text-xl font-bold">Admin Dashboard</span>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {/* Main Navigation */}
              <div className="pb-2">
                <h3 className="px-2 text-xs font-semibold text-white uppercase tracking-wider">
                  Main
                </h3>
                <div className="mt-2 space-y-1">
                  <Link
                    to="/admin"
                    className={`${
                      isActive('') ? 'bg-primary-800 text-white' : 'text-white hover:bg-primary-600'
                    } group flex items-center px-2 py-3 text-base font-medium rounded-md transition-colors duration-150`}
                  >
                    <svg
                      className="mr-4 h-5 w-5 text-secondary-200"
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
                </div>
              </div>

              {/* Management Section */}
              <div className="pt-2 pb-2">
                <h3 className="px-2 text-xs font-semibold text-secondary-200 uppercase tracking-wider">
                  Management
                </h3>
                <div className="mt-2 space-y-1">
                  <Link
                    to="/admin/students"
                    className={`${
                      isActive('/students') ? 'bg-primary-800 text-white' : 'text-white hover:bg-primary-600'
                    } group flex items-center px-2 py-3 text-base font-medium rounded-md transition-colors duration-150`}
                  >
                    <svg
                      className="mr-4 h-5 w-5 text-secondary-200"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    Students
                  </Link>
                  <Link
                    to="/admin/teachers"
                    className={`${
                      isActive('/teachers') ? 'bg-primary-700 text-white' : 'text-secondary-100 hover:bg-primary-600'
                    } group flex items-center px-2 py-3 text-base font-medium rounded-md transition-colors duration-150`}
                  >
                    <svg
                      className="mr-4 h-5 w-5 text-secondary-300"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Teachers
                  </Link>
                  <Link
                    to="/admin/attendance"
                    className={`${
                      isActive('/attendance') ? 'bg-primary-700 text-white' : 'text-secondary-100 hover:bg-primary-600'
                    } group flex items-center px-2 py-3 text-base font-medium rounded-md transition-colors duration-150`}
                  >
                    <svg
                      className="mr-4 h-5 w-5 text-secondary-300"
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
                </div>
              </div>

              {/* Content Section */}
              <div className="pt-2 pb-2">
                <h3 className="px-2 text-xs font-semibold text-secondary-200 uppercase tracking-wider">
                  Content
                </h3>
                <div className="mt-2 space-y-1">
                  <Link
                    to="/admin/notices"
                    className={`${
                      isActive('/notices') ? 'bg-primary-700 text-white' : 'text-secondary-100 hover:bg-primary-600'
                    } group flex items-center px-2 py-3 text-base font-medium rounded-md transition-colors duration-150`}
                  >
                    <svg
                      className="mr-4 h-5 w-5 text-secondary-300"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                      />
                    </svg>
                    Notices
                  </Link>
                  <Link
                    to="/admin/gallery"
                    className={`${
                      isActive('/gallery') ? 'bg-primary-700 text-white' : 'text-blue-100 hover:bg-primary-600'
                    } group flex items-center px-2 py-3 text-base font-medium rounded-md transition-colors duration-150`}
                  >
                    <svg
                      className="mr-4 h-5 w-5 text-blue-300"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Gallery
                  </Link>
                  <Link
                    to="/admin/courses"
                    className={`${
                      isActive('/courses') ? 'bg-primary-700 text-white' : 'text-blue-100 hover:bg-primary-600'
                    } group flex items-center px-2 py-3 text-base font-medium rounded-md transition-colors duration-150`}
                  >
                    <svg
                      className="mr-4 h-5 w-5 text-blue-300"
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
                    Courses
                  </Link>
                  <Link
                    to="/admin/courses/edit"
                    className={`${
                      isActive('/courses/edit') ? 'bg-primary-700 text-white' : 'text-blue-100 hover:bg-primary-600'
                    } group flex items-center px-2 py-3 pl-9 text-base font-medium rounded-md transition-colors duration-150`}
                  >
                    <svg
                      className="mr-4 h-5 w-5 text-blue-300"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit Courses
                  </Link>
                  <Link
                    to="/admin/study-materials"
                    className={`${
                      isActive('/study-materials') ? 'bg-primary-700 text-white' : 'text-blue-100 hover:bg-primary-600'
                    } group flex items-center px-2 py-3 text-base font-medium rounded-md transition-colors duration-150`}
                  >
                    <svg
                      className="mr-4 h-5 w-5 text-blue-300"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Study Materials
                  </Link>

                  <Link
                    to="/admin/documents"
                    className={`${
                      isActive('/documents') ? 'bg-primary-700 text-white' : 'text-blue-100 hover:bg-primary-600'
                    } group flex items-center px-2 py-3 text-base font-medium rounded-md transition-colors duration-150`}
                  >
                    <svg
                      className="mr-4 h-5 w-5 text-blue-300"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Forms & Applications
                  </Link>

                  <Link
                    to="/admin/chatbot"
                    className={`${
                      isActive('/chatbot') ? 'bg-primary-700 text-white' : 'text-blue-100 hover:bg-primary-600'
                    } group flex items-center px-2 py-3 text-base font-medium rounded-md transition-colors duration-150`}
                  >
                    <svg
                      className="mr-4 h-5 w-5 text-blue-300"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    Chatbot
                  </Link>
                </div>
              </div>

              {/* Settings Section */}
              <div className="pt-2 pb-2">
                <h3 className="px-2 text-xs font-semibold text-blue-200 uppercase tracking-wider">
                  Settings
                </h3>
                <div className="mt-2 space-y-1">
                  <Link
                    to="/admin/profile"
                    className={`${
                      isActive('/profile') ? 'bg-primary-700 text-white' : 'text-blue-100 hover:bg-primary-600'
                    } group flex items-center px-2 py-3 text-base font-medium rounded-md transition-colors duration-150`}
                  >
                    <svg
                      className="mr-4 h-5 w-5 text-blue-300"
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
                    My Profile
                  </Link>
                </div>
              </div>
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-blue-700 p-4 mt-auto">
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
                  <p className="text-sm font-medium text-blue-300">Admin</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-primary-700 text-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <span className="text-white text-xl font-bold">Admin Dashboard</span>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                <Link
                  to="/admin"
                  className={`${
                    isActive('') ? 'bg-primary-900 text-white' : 'text-secondary-100 hover:bg-primary-700'
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
                  to="/admin/students"
                  className={`${
                    isActive('/students') ? 'bg-primary-900 text-white' : 'text-secondary-100 hover:bg-primary-700'
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  Students
                </Link>
                <Link
                  to="/admin/teachers"
                  className={`${
                    isActive('/teachers') ? 'bg-primary-900 text-white' : 'text-secondary-100 hover:bg-primary-700'
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Teachers
                </Link>
                <Link
                  to="/admin/attendance"
                  className={`${
                    isActive('/attendance') ? 'bg-primary-900 text-white' : 'text-secondary-100 hover:bg-primary-700'
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
                  to="/admin/notices"
                  className={`${
                    isActive('/notices') ? 'bg-primary-900 text-white' : 'text-secondary-100 hover:bg-primary-700'
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
                      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                    />
                  </svg>
                  Notices
                </Link>
                <Link
                  to="/admin/gallery"
                  className={`${
                    isActive('/gallery') ? 'bg-primary-700 text-white' : 'text-blue-100 hover:bg-primary-600'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150`}
                >
                  <svg
                    className="mr-3 h-5 w-5 text-blue-300"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Gallery
                </Link>
                <Link
                  to="/admin/courses"
                  className={`${
                    isActive('/courses') ? 'bg-primary-700 text-white' : 'text-blue-100 hover:bg-primary-600'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150`}
                >
                  <svg
                    className="mr-3 h-5 w-5 text-blue-300"
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
                  Courses
                </Link>
                <Link
                  to="/admin/courses/edit"
                  className={`${
                    isActive('/courses/edit') ? 'bg-primary-700 text-white' : 'text-blue-100 hover:bg-primary-600'
                  } group flex items-center px-2 py-2 pl-9 text-sm font-medium rounded-md transition-colors duration-150`}
                >
                  <svg
                    className="mr-3 h-5 w-5 text-blue-300"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Courses
                </Link>

                <Link
                  to="/admin/study-materials"
                  className={`${
                    isActive('/study-materials') ? 'bg-primary-700 text-white' : 'text-blue-100 hover:bg-primary-600'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150`}
                >
                  <svg
                    className="mr-3 h-5 w-5 text-blue-300"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Study Materials
                </Link>

                <Link
                  to="/admin/documents"
                  className={`${
                    isActive('/documents') ? 'bg-primary-700 text-white' : 'text-blue-100 hover:bg-primary-600'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150`}
                >
                  <svg
                    className="mr-3 h-5 w-5 text-blue-300"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Forms & Applications
                </Link>

                <Link
                  to="/admin/chatbot"
                  className={`${
                    isActive('/chatbot') ? 'bg-primary-700 text-white' : 'text-blue-100 hover:bg-primary-600'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150`}
                >
                  <svg
                    className="mr-3 h-5 w-5 text-blue-300"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  Chatbot
                </Link>

                {/* Settings Section */}
                <div className="pt-4 pb-2">
                  <h3 className="px-2 text-xs font-semibold text-white uppercase tracking-wider">
                    Settings
                  </h3>
                  <div className="mt-2 space-y-1">
                    <Link
                      to="/admin/profile"
                      className={`${
                        isActive('/profile') ? 'bg-primary-800 text-white' : 'text-white hover:bg-primary-600'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150`}
                    >
                      <svg
                        className="mr-3 h-5 w-5 text-secondary-200"
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
                      My Profile
                    </Link>
                  </div>
                </div>
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-blue-700 p-4">
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
                    <p className="text-xs font-medium text-blue-300">Admin</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 sticky top-0 z-10 bg-white shadow-sm">
          <div className="flex justify-between items-center pr-4">
            <button
              className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
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
            <h1 className="text-lg font-semibold text-primary-700">Admin Dashboard</h1>
          </div>
        </div>
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-4 md:py-6">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8">
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/students" element={<Students />} />
                <Route path="/teachers" element={<Teachers />} />
                <Route path="/notices" element={<Notices />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/edit" element={<CourseEdit />} />
                <Route path="/courses/edit/:id" element={<CourseEdit />} />
                <Route path="/overview/edit" element={<OverviewEdit />} />
                <Route path="/study-materials" element={<StudyMaterials />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/chatbot" element={<Chatbot />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
