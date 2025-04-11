import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfileImageUrl, handleImageError } from '../utils/imageUtils';
import collegeLogo from '../assets/college-logo.png';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isTeacher, isStudent } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('/');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 text-white navbar-shadow sticky top-0 z-50 transition-all duration-300 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-3 hover:opacity-95 transition-all duration-300 group">
              <div className="relative overflow-hidden rounded-full p-0.5 bg-white/10 group-hover:bg-white/20 transition-all duration-300 group-hover:scale-105 transform">
                <img src={collegeLogo} alt="College Logo" className="h-10 w-10 rounded-full object-cover" />
              </div>
              <span className="text-xl font-bold tracking-tight truncate group-hover:text-white/95 transition-all duration-300">GPC Itarsi</span>
            </Link>
            <div className="hidden md:ml-4 lg:ml-8 md:flex md:space-x-3 lg:space-x-6">
              <Link to="/" className={`px-3 lg:px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 desktop-nav-link ${activeLink === '/' ? 'bg-primary-600 nav-link-active' : ''}`}>Home</Link>
              <Link to="/courses" className={`px-3 lg:px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 desktop-nav-link ${activeLink === '/courses' ? 'bg-primary-600 nav-link-active' : ''}`}>Courses</Link>
              <Link to="/faculty" className={`px-3 lg:px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 desktop-nav-link ${activeLink === '/faculty' ? 'bg-primary-600 nav-link-active' : ''}`}>Faculty</Link>
              <Link to="/gallery" className={`px-3 lg:px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 desktop-nav-link ${activeLink === '/gallery' ? 'bg-primary-600 nav-link-active' : ''}`}>Gallery</Link>
              <Link to="/about" className={`px-3 lg:px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 desktop-nav-link ${activeLink === '/about' ? 'bg-primary-600 nav-link-active' : ''}`}>About</Link>
              <Link to="/admission" className={`px-3 lg:px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 desktop-nav-link ${activeLink === '/admission' ? 'bg-primary-600 nav-link-active' : ''}`}>Admission</Link>
              <Link to="/downloads" className={`px-3 lg:px-4 py-2 rounded-md text-sm font-medium bg-accent-500 hover:bg-accent-600 transition-all duration-200 flex items-center shadow-sm hover:shadow-md desktop-nav-link ${activeLink === '/downloads' ? 'bg-accent-600 nav-link-active' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="hidden sm:inline">Downloads</span>
              </Link>
            </div>
          </div>
          <div className="hidden md:flex md:items-center">
            {isAuthenticated ? (
              <div className="relative ml-3">
                <div className="flex items-center">
                  <span className="mr-3 font-medium text-white/90 group-hover:text-white transition-colors duration-200">{user.username}</span>
                  <button
                    onClick={toggleMenu}
                    className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-800 focus:ring-white border-2 border-white/70 hover:border-white transition-all duration-300 hover:shadow-md hover:shadow-primary-700/30 group overflow-hidden"
                  >
                    <div className="relative w-8 h-8 overflow-hidden rounded-full">
                      <img
                        className="h-8 w-8 rounded-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                        src={getProfileImageUrl(user.profilePicture)}
                        alt="Profile"
                        onError={handleImageError}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </button>
                </div>
                {isMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-xl py-1 bg-white/95 backdrop-blur-sm ring-1 ring-black/5 z-10 transform transition-all duration-200 ease-out dropdown-menu-animated border border-gray-100">
                    {isAdmin && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200 first:rounded-t-lg">Admin Dashboard</Link>
                    )}
                    {isTeacher && (
                      <Link to="/teacher" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200">Teacher Dashboard</Link>
                    )}
                    {isStudent && (
                      <Link to="/student" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200">Student Dashboard</Link>
                    )}
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-error transition-colors duration-200 last:rounded-b-lg font-medium"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-md text-sm font-medium bg-accent-500 hover:bg-accent-600 text-white transition-all duration-300 shadow-sm hover:shadow-md relative overflow-hidden group btn-hover-effect"
              >
                <span className="relative z-10 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Login
                </span>
              </Link>
            )}
          </div>
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-primary-600 focus:outline-none transition-all duration-300 hover:shadow-md relative overflow-hidden group"
            >
              <span className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md"></span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6 transform transition-transform duration-300 group-hover:scale-110`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6 transform transition-transform duration-300 group-hover:rotate-90`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block mobile-menu-animated' : 'hidden'} md:hidden transition-all duration-300 ease-in-out`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link to="/" className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-600 transition-all duration-200 mobile-nav-link ${activeLink === '/' ? 'bg-primary-600 shadow-inner nav-link-active' : ''}`}>Home</Link>
          <Link to="/courses" className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-600 transition-all duration-200 mobile-nav-link ${activeLink === '/courses' ? 'bg-primary-600 shadow-inner nav-link-active' : ''}`}>Courses</Link>
          <Link to="/faculty" className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-600 transition-all duration-200 mobile-nav-link ${activeLink === '/faculty' ? 'bg-primary-600 shadow-inner nav-link-active' : ''}`}>Faculty</Link>
          <Link to="/gallery" className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-600 transition-all duration-200 mobile-nav-link ${activeLink === '/gallery' ? 'bg-primary-600 shadow-inner nav-link-active' : ''}`}>Gallery</Link>
          <Link to="/about" className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-600 transition-all duration-200 mobile-nav-link ${activeLink === '/about' ? 'bg-primary-600 shadow-inner nav-link-active' : ''}`}>About</Link>
          <Link to="/admission" className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-600 transition-all duration-200 mobile-nav-link ${activeLink === '/admission' ? 'bg-primary-600 shadow-inner nav-link-active' : ''}`}>Admission</Link>
          <Link to="/downloads" className={`block px-3 py-2 rounded-md text-base font-medium bg-accent-500 hover:bg-accent-600 transition-all duration-200 flex items-center shadow-sm ${activeLink === '/downloads' ? 'bg-accent-600 nav-link-active' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Downloads
          </Link>
        </div>
        <div className="pt-4 pb-3 border-t border-primary-600/50 mt-2">
          {isAuthenticated ? (
            <div className="px-2 space-y-1">
              <div className="flex items-center px-3">
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={getProfileImageUrl(user.profilePicture)}
                    alt="Profile"
                    onError={handleImageError}
                  />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium">{user.username}</div>
                </div>
              </div>
              {isAdmin && (
                <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-700 transition-colors duration-200">Admin Dashboard</Link>
              )}
              {isTeacher && (
                <Link to="/teacher" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-700 transition-colors duration-200">Teacher Dashboard</Link>
              )}
              {isStudent && (
                <Link to="/student" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-700 transition-colors duration-200">Student Dashboard</Link>
              )}
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-primary-700 transition-colors duration-200 text-white/90 hover:text-white"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="px-2">
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium bg-accent-500 hover:bg-accent-600 text-white text-center transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
