import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const Users = () => {
  const { checkTokenValidity } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isUpdatingPasswords, setIsUpdatingPasswords] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        // First, validate the token
        console.log('Validating token before fetching users...');
        const isTokenValid = await checkTokenValidity();

        if (!isTokenValid) {
          console.error('Token validation failed');
          setError('Authentication token is invalid. Please login again.');
          setLoading(false);
          toast.error('Session expired. Please login again.');

          // Redirect to login after a short delay
          setTimeout(() => {
            window.location.href = '/developer/login';
          }, 2000);

          return;
        }

        // Get token from localStorage (should be valid now)
        const token = localStorage.getItem('token');
        console.log('Token validated, fetching users with token:', token.substring(0, 20) + '...');
        console.log('API URL:', `${config.apiUrl}/api/developer/users`);

        // Make the API request with the token
        const response = await axios.get(`${config.apiUrl}/api/developer/users`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.data) {
          throw new Error('No data received from server');
        }

        console.log('Users fetched successfully:', response.data.length);
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        console.error('Error details:', err.response?.data || err.message);
        console.error('Error status:', err.response?.status);

        // Handle different error scenarios
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.error('Authentication failed (401/403)');
          setError('Authentication failed. Please login again.');
          toast.error('Session expired. Please login again.');

          // Clear token and redirect to login
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];

          // Redirect to login after a short delay
          setTimeout(() => {
            window.location.href = '/developer/login';
          }, 2000);
        } else if (err.response?.status === 404) {
          console.error('API endpoint not found (404)');
          setError('API endpoint not found. Please check server configuration.');
          toast.error('API endpoint not found: /api/developer/users');
        } else {
          setError('Failed to fetch users. Please try again later.');
          toast.error('Failed to fetch users: ' + (err.response?.data?.message || err.message));
        }

        setLoading(false);
      }
    };

    fetchUsers();
  }, [checkTokenValidity]);

  const filteredUsers = users.filter(user => {
    // Apply role filter
    if (filter !== 'all' && user.role !== filter) {
      return false;
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.name?.toLowerCase().includes(searchLower) ||
        user.username?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user._id?.toLowerCase().includes(searchLower) ||
        user.rollNumber?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'teacher':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      case 'developer':
        return 'bg-purple-100 text-purple-800';
      case 'hod':
        return 'bg-yellow-100 text-yellow-800';
      case 'principal':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const togglePasswordVisibility = () => {
    setShowPasswords(!showPasswords);
  };

  const updatePlaintextPasswords = async () => {
    try {
      setIsUpdatingPasswords(true);
      setError(null);

      // First, validate the token
      console.log('Validating token before updating plaintext passwords...');
      const isTokenValid = await checkTokenValidity();

      if (!isTokenValid) {
        console.error('Token validation failed');
        setError('Authentication token is invalid. Please login again.');
        setIsUpdatingPasswords(false);
        toast.error('Session expired. Please login again.');

        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/developer/login';
        }, 2000);

        return;
      }

      // Get token from localStorage (should be valid now)
      const token = localStorage.getItem('token');
      console.log('Token validated, updating plaintext passwords with token:', token.substring(0, 20) + '...');
      console.log('API URL:', `${config.apiUrl}/api/developer/update-plaintext-passwords`);

      // Make the API request to update plaintext passwords
      const response = await axios.post(
        `${config.apiUrl}/api/developer/update-plaintext-passwords`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.data) {
        throw new Error('No data received from server');
      }

      console.log('Update plaintext passwords response:', response.data);
      toast.success(`${response.data.message} (${response.data.updatedCount}/${response.data.totalUsers} users updated)`);

      // Refresh the user list
      console.log('Refreshing user list after password update');
      const usersResponse = await axios.get(`${config.apiUrl}/api/developer/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!usersResponse.data) {
        throw new Error('No data received when refreshing users');
      }

      console.log('Users refreshed successfully:', usersResponse.data.length);
      setUsers(usersResponse.data);
    } catch (err) {
      console.error('Error updating plaintext passwords:', err);
      console.error('Error details:', err.response?.data || err.message);
      console.error('Error status:', err.response?.status);

      // Handle different error scenarios
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.error('Authentication failed (401/403)');
        setError('Authentication failed. Please login again.');
        toast.error('Session expired. Please login again.');

        // Clear token and redirect to login
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];

        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/developer/login';
        }, 2000);
      } else if (err.response?.status === 404) {
        console.error('API endpoint not found (404)');
        setError('API endpoint not found. Please check server configuration.');
        toast.error('API endpoint not found: /api/developer/update-plaintext-passwords');
      } else {
        setError('Failed to update plaintext passwords. Please try again later.');
        toast.error('Failed to update plaintext passwords: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setIsUpdatingPasswords(false);
    }
  };

  if (loading) {
    return (
      <div className="futuristic-card p-6 bg-gradient-to-br from-white to-primary-50/30">
        <div className="flex justify-center items-center h-64">
          <div className="futuristic-loader"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="futuristic-card p-6 bg-gradient-to-br from-white to-primary-50/30">
        <div className="text-center text-red-600 p-4">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="futuristic-card overflow-hidden">
        <div className="futuristic-card-header px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-white flex items-center">
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            User Management
          </h3>
        </div>
        <div className="p-6 bg-gradient-to-br from-white to-primary-50/30">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="inline-flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className={`relative inline-flex items-center px-4 py-2 rounded-md border border-gray-300 text-sm font-medium ${
                    filter === 'all' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('admin')}
                  className={`relative inline-flex items-center px-4 py-2 rounded-md border border-gray-300 text-sm font-medium ${
                    filter === 'admin' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Administrators
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('principal')}
                  className={`relative inline-flex items-center px-4 py-2 rounded-md border border-gray-300 text-sm font-medium ${
                    filter === 'principal' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Principal
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('hod')}
                  className={`relative inline-flex items-center px-4 py-2 rounded-md border border-gray-300 text-sm font-medium ${
                    filter === 'hod' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  HODs
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('teacher')}
                  className={`relative inline-flex items-center px-4 py-2 rounded-md border border-gray-300 text-sm font-medium ${
                    filter === 'teacher' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Teachers
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('student')}
                  className={`relative inline-flex items-center px-4 py-2 rounded-md border border-gray-300 text-sm font-medium ${
                    filter === 'student' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Students
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={togglePasswordVisibility}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                  showPasswords
                    ? 'text-white bg-red-600 hover:bg-red-700'
                    : 'text-white bg-primary-600 hover:bg-primary-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300`}
              >
                {showPasswords ? (
                  <>
                    <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                    Hide Passwords
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Show Passwords
                  </>
                )}
              </button>
              <button
                onClick={updatePlaintextPasswords}
                disabled={isUpdatingPasswords}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
              >
                {isUpdatingPasswords ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Update Plaintext Passwords
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Password
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.profilePicture ?
                                (user.profilePicture.startsWith('http') ?
                                  user.profilePicture :
                                  `${config.apiUrl}/uploads/${user.profilePicture}`) :
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                              alt=""
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.rollNumber && (
                              <div className="text-sm text-gray-500">Roll: {user.rollNumber}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(user.role)}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user._id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {showPasswords ? (
                          <div className="flex items-center">
                            <span className="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                              {user.plainTextPassword || 'Not available'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">••••••••</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No users found matching the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
