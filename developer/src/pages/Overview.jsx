import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { Link } from 'react-router-dom';
import './Overview.css';
import '../styles/FuturisticDashboard.css';

const Overview = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState({
    name: 'Developer',
    title: 'Developer Portal'
  });
  const [previewImage, setPreviewImage] = useState('https://ui-avatars.com/api/?name=Developer&background=0D8ABC&color=fff&size=200');
  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    notices: 0,
    galleries: 0
  });
  const [connectedFromCard, setConnectedFromCard] = useState(false);
  const [developerName, setDeveloperName] = useState('');

  // Check for URL parameters indicating connection from Developer Card
  useEffect(() => {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('source');
    const name = urlParams.get('name');

    // Check if connected from Developer Card
    if (source === 'developer_card') {
      setConnectedFromCard(true);
      if (name) {
        setDeveloperName(decodeURIComponent(name));
      }

      // Remove the parameters from the URL to avoid sharing them
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  // Log stats whenever they change
  useEffect(() => {
    console.log('Stats updated:', stats);
  }, [stats]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch profile data from backend without authentication
        console.log('Overview - Fetching profile from:', `${config.apiUrl}/api/developer/profile-public`);
        try {
          const response = await axios.get(`${config.apiUrl}/api/developer/profile-public`);
          console.log('Overview - Profile data received:', response.data);

          if (response.data) {
            setProfileData({
              name: response.data.name || 'Developer',
              title: response.data.title || 'Developer Portal'
            });

            if (response.data.profilePicture) {
              // Check if the profile picture is a Cloudinary URL or a local file
              if (response.data.profilePicture.includes('cloudinary') || response.data.profilePicture.startsWith('http')) {
                setPreviewImage(response.data.profilePicture);
              } else {
                setPreviewImage(`${config.apiUrl}/uploads/${response.data.profilePicture}`);
              }
            }
          }
        } catch (err) {
          console.error('Overview - Error fetching profile:', err);
          console.error('Overview - Error details:', err.response ? err.response.data : 'No response data');

          // Check if the error is "Developer not found"
          const isDeveloperNotFound =
            err.response &&
            err.response.data &&
            err.response.data.message === "Developer not found";

          if (isDeveloperNotFound) {
            console.log('Developer not found. This is expected if you have not yet created a developer profile.');
          }
          // Keep default values if API fails
        }

        // Fetch statistics data
        try {
          console.log('Fetching real statistics data from API...');

          // Try to fetch overview data first, which might contain stats
          try {
            const overviewResponse = await axios.get(`${config.apiUrl}/api/overview`);
            if (overviewResponse.data && overviewResponse.data.stats) {
              console.log('Found stats in overview data:', overviewResponse.data.stats);

              // Map the overview stats to our format
              const overviewStats = {
                users: overviewResponse.data.stats.students + overviewResponse.data.stats.teachers || 0,
                courses: overviewResponse.data.stats.courses || 0,
                notices: 0, // Will try to fetch this separately
                galleries: 0  // Will try to fetch this separately
              };

              // Update with overview stats first
              setStats(prevStats => ({
                ...prevStats,
                users: overviewStats.users,
                courses: overviewStats.courses
              }));

              console.log('Updated stats with overview data');
            }
          } catch (overviewErr) {
            console.log('Could not fetch overview stats:', overviewErr.message);
          }

          // Fetch notices count (public endpoint)
          try {
            const noticesResponse = await axios.get(`${config.apiUrl}/api/notices`);
            const noticesCount = noticesResponse.data.length;
            console.log('Notices count:', noticesCount);

            // Update just the notices count
            setStats(prevStats => ({
              ...prevStats,
              notices: noticesCount
            }));
          } catch (noticesErr) {
            console.log('Could not fetch notices count:', noticesErr.message);
          }

          // Fetch gallery items count (public endpoint)
          try {
            const galleryResponse = await axios.get(`${config.apiUrl}/api/gallery`);
            const galleryCount = galleryResponse.data.length;
            console.log('Gallery count:', galleryCount);

            // Update just the gallery count
            setStats(prevStats => ({
              ...prevStats,
              galleries: galleryCount
            }));
          } catch (galleryErr) {
            console.log('Could not fetch gallery count:', galleryErr.message);
          }

          // Try to fetch users and courses as a fallback
          try {
            // These endpoints might require authentication
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            // Try to fetch users count - use developer endpoint instead of users endpoint
            try {
              const usersResponse = await axios.get(`${config.apiUrl}/api/developer/users`, { headers });
              const usersCount = usersResponse.data.length;
              console.log('Users count from /api/developer/users:', usersCount);

              // Update just the users count
              setStats(prevStats => ({
                ...prevStats,
                users: usersCount || prevStats.users
              }));
            } catch (usersErr) {
              console.log('Could not fetch users count from /api/developer/users:', usersErr.message);
            }

            // Try to fetch courses count
            try {
              const coursesResponse = await axios.get(`${config.apiUrl}/api/courses`, { headers });
              const coursesCount = coursesResponse.data.length;
              console.log('Courses count from /api/courses:', coursesCount);

              // Update just the courses count
              setStats(prevStats => ({
                ...prevStats,
                courses: coursesCount || prevStats.courses
              }));
            } catch (coursesErr) {
              console.log('Could not fetch courses count from /api/courses:', coursesErr.message);
            }
          } catch (authErr) {
            console.log('Error with authenticated requests:', authErr.message);
          }

          // We can't log the final stats here because of React's state batching
          // The stats state might not be updated yet
          console.log('Statistics data fetching completed');
        } catch (err) {
          console.error('Error fetching statistics:', err);
          console.error('Error details:', err.response ? err.response.data : 'No response data');

          // Keep default values if API fails
          console.log('Using fallback mock data for statistics');
          setStats({
            users: 125,
            courses: 15,
            notices: 42,
            galleries: 8
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="futuristic-card p-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"
               style={{boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)'}}></div>
        </div>
      ) : (
        <>
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 mb-4 rounded-r-md shadow-md">
              <p>{error}</p>
            </div>
          )}

          <div className="futuristic-card overflow-hidden">
            <div className="futuristic-card-header px-4 py-5 sm:px-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-white">Developer Dashboard</h3>
                  <p className="mt-1 max-w-2xl text-sm text-primary-200">
                    Welcome to your developer control panel
                  </p>
                </div>

                {/* Connection indicator badge */}
                {connectedFromCard ? (
                  <div className="futuristic-badge" style={{animation: 'pulse 2s infinite'}}>
                    <div className="connection-indicator-dot"></div>
                    <span>Connected from Developer Card</span>
                  </div>
                ) : (
                  <div className="futuristic-badge" style={{ opacity: 0.6 }}>
                    <div className="connection-indicator-dot" style={{ backgroundColor: 'rgba(6, 182, 212, 0.5)' }}></div>
                    <span>Developer Card Connection</span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 bg-gradient-to-br from-white to-primary-50/30">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                <div className="flex-shrink-0">
                  <div className="futuristic-profile-image w-24 h-24 rounded-full overflow-hidden border-4 border-primary-100 shadow-lg">
                    <img
                      src={previewImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-secondary-600">{profileData.name}</h2>
                  <p className="text-sm text-gray-500">{profileData.title}</p>
                  <div className="mt-2 text-sm text-gray-700">
                    <p>Use this dashboard to manage your developer profile and customize the website.</p>
                  </div>

                  {/* Connection status message */}
                  {connectedFromCard ? (
                    <div className="mt-3 text-xs text-cyan-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"
                           style={{filter: 'drop-shadow(0 0 2px rgba(6, 182, 212, 0.5))'}}>
                        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      {developerName ? `Connected as ${developerName}` : 'Connected from Developer Card'}
                    </div>
                  ) : (
                    <div className="mt-3 text-xs text-gray-500 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Access Developer Card from the main website
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="futuristic-card overflow-hidden">
            <div className="futuristic-card-header px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-white flex items-center">
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Website Statistics
              </h3>
            </div>
            <div className="p-6 bg-gradient-to-br from-white to-primary-50/30">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="futuristic-stat p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50">
                  <div className="flex flex-col items-center">
                    <div className="futuristic-stat-icon w-12 h-12 mb-3 rounded-full bg-blue-600 flex items-center justify-center">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="text-3xl font-bold text-blue-600" style={{textShadow: '0 0 10px rgba(59, 130, 246, 0.3)'}}>{stats.users}</div>
                    <div className="text-sm text-gray-500">Users</div>
                  </div>
                </div>
                <div className="futuristic-stat p-4 bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/50">
                  <div className="flex flex-col items-center">
                    <div className="futuristic-stat-icon w-12 h-12 mb-3 rounded-full bg-green-600 flex items-center justify-center">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="text-3xl font-bold text-green-600" style={{textShadow: '0 0 10px rgba(16, 185, 129, 0.3)'}}>{stats.courses}</div>
                    <div className="text-sm text-gray-500">Courses</div>
                  </div>
                </div>
                <div className="futuristic-stat p-4 bg-gradient-to-br from-yellow-50 to-yellow-100/50 border border-yellow-200/50">
                  <div className="flex flex-col items-center">
                    <div className="futuristic-stat-icon w-12 h-12 mb-3 rounded-full bg-yellow-600 flex items-center justify-center">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                    </div>
                    <div className="text-3xl font-bold text-yellow-600" style={{textShadow: '0 0 10px rgba(245, 158, 11, 0.3)'}}>{stats.notices}</div>
                    <div className="text-sm text-gray-500">Notices</div>
                  </div>
                </div>
                <div className="futuristic-stat p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50">
                  <div className="flex flex-col items-center">
                    <div className="futuristic-stat-icon w-12 h-12 mb-3 rounded-full bg-purple-600 flex items-center justify-center">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-3xl font-bold text-purple-600" style={{textShadow: '0 0 10px rgba(139, 92, 246, 0.3)'}}>{stats.galleries}</div>
                    <div className="text-sm text-gray-500">Galleries</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="futuristic-card overflow-hidden">
            <div className="futuristic-card-header px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-white flex items-center">
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Actions
              </h3>
            </div>
            <div className="p-6 bg-gradient-to-br from-white to-primary-50/30">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="futuristic-card p-4 bg-gradient-to-br from-primary-50 to-primary-100/30 border border-primary-200/50 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center shadow-md"
                         style={{boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)'}}>
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">Update Profile</h4>
                      <p className="text-sm text-gray-500">Edit your developer information</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link to="/developer/profile" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300">
                      Edit Profile
                      <svg className="ml-2 -mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>

                <div className="futuristic-card p-4 bg-gradient-to-br from-primary-50 to-primary-100/30 border border-primary-200/50 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center shadow-md"
                         style={{boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)'}}>
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">Website Settings</h4>
                      <p className="text-sm text-gray-500">Manage website configuration</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link to="/developer/settings" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300">
                      Manage Settings
                      <svg className="ml-2 -mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>

                <div className="futuristic-card p-4 bg-gradient-to-br from-primary-50 to-primary-100/30 border border-primary-200/50 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center shadow-md"
                         style={{boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)'}}>
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">User Management</h4>
                      <p className="text-sm text-gray-500">Manage all system users</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link to="/developer/users" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300">
                      Manage Users
                      <svg className="ml-2 -mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>

                <div className="futuristic-card p-4 bg-gradient-to-br from-primary-50 to-primary-100/30 border border-primary-200/50 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center shadow-md"
                         style={{boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)'}}>
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">Website Content</h4>
                      <p className="text-sm text-gray-500">Manage website content</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <a href={`${config.apiUrl}/admin`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300">
                      Open Admin Panel
                      <svg className="ml-2 -mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
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
