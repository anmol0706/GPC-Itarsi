import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import useMobileSidebar from '../hooks/useMobileSidebar';
import { createSwipeHandler } from '../utils/touchUtils';
import { useAuth } from '../contexts/AuthContext';
import config from '../config';
// Import college logo from assets
import collegeLogo from '../assets/college-logo.png';
// Import futuristic styles
import '../styles/FuturisticDashboard.css';

// Developer Components
import Profile from './Profile';
import Overview from './Overview';
import Settings from './Settings';
import Users from './Users';
import ResetPassword from './ResetPassword';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { isSidebarOpen: isMobileSidebarOpen, toggleSidebar: toggleMobileSidebar, closeSidebar: closeMobileSidebar } = useMobileSidebar();

  // Set up touch handlers for mobile
  useEffect(() => {
    const handleSwipe = createSwipeHandler({
      onSwipeLeft: closeMobileSidebar,
      onSwipeRight: toggleMobileSidebar,
    });

    document.addEventListener('touchstart', handleSwipe.touchStart);
    document.addEventListener('touchmove', handleSwipe.touchMove);
    document.addEventListener('touchend', handleSwipe.touchEnd);

    return () => {
      document.removeEventListener('touchstart', handleSwipe.touchStart);
      document.removeEventListener('touchmove', handleSwipe.touchMove);
      document.removeEventListener('touchend', handleSwipe.touchEnd);
    };
  }, [closeMobileSidebar, toggleMobileSidebar]);

  const handleLogout = () => {
    logout();
    navigate('/developer/login');
  };

  return (
    <div className="h-screen flex overflow-hidden futuristic-dashboard">
      {/* Mobile sidebar */}
      <div
        className={`md:hidden fixed inset-0 flex z-40 transition-opacity duration-300 ease-linear ${
          isMobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 backdrop-blur-sm" onClick={closeMobileSidebar}></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full futuristic-sidebar">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white bg-primary-800/80 backdrop-blur-sm shadow-lg"
              onClick={closeMobileSidebar}
              style={{boxShadow: '0 0 10px rgba(99, 102, 241, 0.3)'}}
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
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <img className="h-12 w-auto filter drop-shadow-lg" src={collegeLogo} alt="College Logo" />
            </div>
            <div className="mt-5 flex flex-col items-center futuristic-profile-container">
              <div className="futuristic-profile-image w-20 h-20 rounded-full overflow-hidden border-2 border-primary-300 p-0.5 bg-gradient-to-r from-primary-600 to-secondary-500">
                <img
                  src={currentUser?.profilePicture ?
                    (currentUser.profilePicture.startsWith('http') ?
                      currentUser.profilePicture :
                      `${config.apiUrl}/uploads/${currentUser.profilePicture}`) :
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'Developer')}&background=0D8ABC&color=fff&size=200`}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <h2 className="mt-2 text-lg font-medium text-white">{currentUser?.name || 'Developer'}</h2>
              <p className="text-sm text-primary-300">{currentUser?.role === 'admin' ? 'Administrator' : 'Developer'}</p>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              <Link
                to="/developer"
                className={`futuristic-nav-link flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  location.pathname === '/developer'
                    ? 'active text-white'
                    : 'text-primary-100 hover:text-white'
                }`}
              >
                <svg
                  className="mr-3 h-5 w-5"
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
                to="/developer/profile"
                className={`futuristic-nav-link flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  location.pathname === '/developer/profile'
                    ? 'active text-white'
                    : 'text-primary-100 hover:text-white'
                }`}
              >
                <svg
                  className="mr-3 h-5 w-5"
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
                to="/developer/users"
                className={`futuristic-nav-link flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  location.pathname === '/developer/users'
                    ? 'active text-white'
                    : 'text-primary-100 hover:text-white'
                }`}
              >
                <svg
                  className="mr-3 h-5 w-5"
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
                Users
              </Link>

              <Link
                to="/developer/reset-password"
                className={`futuristic-nav-link flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  location.pathname === '/developer/reset-password'
                    ? 'active text-white'
                    : 'text-primary-100 hover:text-white'
                }`}
              >
                <svg
                  className="mr-3 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
                Reset Password
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="futuristic-nav-link w-full flex items-center px-4 py-2 text-sm font-medium rounded-md text-primary-100 hover:text-white mt-4"
              >
                <svg
                  className="mr-3 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 futuristic-sidebar">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <img className="h-12 w-auto filter drop-shadow-lg" src={collegeLogo} alt="College Logo" />
              </div>
              <div className="mt-5 flex flex-col items-center futuristic-profile-container">
                <div className="futuristic-profile-image w-20 h-20 rounded-full overflow-hidden border-2 border-primary-300 p-0.5 bg-gradient-to-r from-primary-600 to-secondary-500">
                  <img
                    src={currentUser?.profilePicture ?
                      (currentUser.profilePicture.startsWith('http') ?
                        currentUser.profilePicture :
                        `${config.apiUrl}/uploads/${currentUser.profilePicture}`) :
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'Developer')}&background=0D8ABC&color=fff&size=200`}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <h2 className="mt-2 text-lg font-medium text-white">{currentUser?.name || 'Developer'}</h2>
                <p className="text-sm text-primary-300">{currentUser?.role === 'admin' ? 'Administrator' : 'Developer'}</p>

                {/* Social Icons */}
                <div className="futuristic-social-icons">
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="futuristic-social-icon">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="futuristic-social-icon">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                  <a href="mailto:developer@example.com" className="futuristic-social-icon">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                  </a>
                </div>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                <Link
                  to="/developer"
                  className={`futuristic-nav-link flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    location.pathname === '/developer'
                      ? 'active text-white'
                      : 'text-primary-100 hover:text-white'
                  }`}
                >
                  <svg
                    className="mr-3 h-5 w-5"
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
                  to="/developer/profile"
                  className={`futuristic-nav-link flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    location.pathname === '/developer/profile'
                      ? 'active text-white'
                      : 'text-primary-100 hover:text-white'
                  }`}
                >
                  <svg
                    className="mr-3 h-5 w-5"
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
                  to="/developer/settings"
                  className={`futuristic-nav-link flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    location.pathname === '/developer/settings'
                      ? 'active text-white'
                      : 'text-primary-100 hover:text-white'
                  }`}
                >
                  <svg
                    className="mr-3 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Settings
                </Link>
                <Link
                  to="/developer/users"
                  className={`futuristic-nav-link flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    location.pathname === '/developer/users'
                      ? 'active text-white'
                      : 'text-primary-100 hover:text-white'
                  }`}
                >
                  <svg
                    className="mr-3 h-5 w-5"
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
                  Users
                </Link>

                <Link
                  to="/developer/reset-password"
                  className={`futuristic-nav-link flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    location.pathname === '/developer/reset-password'
                      ? 'active text-white'
                      : 'text-primary-100 hover:text-white'
                  }`}
                >
                  <svg
                    className="mr-3 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                  Reset Password
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="futuristic-nav-link w-full flex items-center px-4 py-2 text-sm font-medium rounded-md text-primary-100 hover:text-white mt-4"
                >
                  <svg
                    className="mr-3 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 flex items-center">
          <button
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-primary-600 hover:text-primary-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 bg-white/80 backdrop-blur-sm shadow-md"
            onClick={toggleMobileSidebar}
            style={{boxShadow: '0 0 10px rgba(99, 102, 241, 0.2)'}}
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
          <div className="ml-4">
            <h1 className="text-lg font-semibold text-primary-700 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-500">Developer Dashboard</h1>
          </div>
        </div>
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-4 md:py-6">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8">
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/users" element={<Users />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
