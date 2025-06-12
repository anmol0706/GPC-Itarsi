import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import config from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const storedToken = localStorage.getItem('token');

        if (!storedToken) {
          console.log('No token found in localStorage');
          setLoading(false);
          return;
        }

        console.log('Token found in localStorage:', storedToken.substring(0, 20) + '...');

        // Update token state
        setToken(storedToken);

        // Set axios default headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        console.log('Setting Authorization header with token:', storedToken.substring(0, 20) + '...');

        // Get user data with retry mechanism
        let retries = 2;
        let userData = null;

        while (retries > 0 && !userData) {
          try {
            console.log(`Attempting to fetch user data (retries left: ${retries})`);
            const response = await axios.get(`${config.apiUrl}/api/auth/me`);
            console.log('User data from /me endpoint:', response.data);

            if (response.data && response.data.user) {
              userData = response.data;
            } else {
              console.error('Invalid user data format received:', response.data);
              throw new Error('Invalid user data format');
            }
          } catch (fetchError) {
            console.error(`Error fetching user data (retries left: ${retries}):`, fetchError);
            retries--;

            if (retries === 0) {
              throw fetchError; // Re-throw to be caught by outer catch
            }

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        if (userData) {
          // Set the user data with the ID
          const userDataObj = userData.userData || {};
          const userWithId = {
            ...userData.user,
            id: userData.user._id, // Ensure ID is set correctly
            userData: userDataObj
          };

          console.log('Setting user with ID:', userWithId);
          console.log('User ID for API calls will be:', userWithId.id);
          setUser(userWithId);
        }
      } catch (error) {
        console.error('Authentication error:', error);

        // Provide more detailed error logging
        if (error.response) {
          console.error('Error response status:', error.response.status);
          console.error('Error response data:', error.response.data);

          // Only clear token for auth errors (401/403)
          if (error.response.status === 401 || error.response.status === 403) {
            console.log('Authentication error (401/403), clearing token');
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            setToken(null);
          } else {
            console.log('Non-authentication error, keeping token');
          }
        } else {
          console.error('Error with no response:', error.message);
          // For network errors, we might want to keep the token
          if (error.message.includes('Network Error')) {
            console.log('Network error, keeping token');
          } else {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            setToken(null);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Attempting login with:', { username, password });

      // Validate inputs
      if (!username || !password) {
        const errorMsg = 'Username and password are required';
        console.error(errorMsg);
        setError(errorMsg);
        setLoading(false);
        throw new Error(errorMsg);
      }

      // Create the login payload
      const loginPayload = {
        username,
        password
      };

      console.log('Sending login request with payload:', loginPayload);

      // Clear any existing token and headers before login attempt
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];

      // Add timeout to login request
      const response = await axios.post(`${config.apiUrl}/api/auth/login`, loginPayload, {
        timeout: 10000 // 10 second timeout
      });

      // Validate response data
      if (!response.data || !response.data.token || !response.data.user) {
        const errorMsg = 'Invalid response from server. Missing token or user data.';
        console.error(errorMsg, response.data);
        setError(errorMsg);
        setLoading(false);
        throw new Error(errorMsg);
      }

      const { token, user, userData } = response.data;
      console.log('Login response:', { token: token.substring(0, 20) + '...', user, userData });

      // Save token to localStorage
      localStorage.setItem('token', token);

      // Update token state
      setToken(token);

      // Set axios default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Login: Setting Authorization header with token:', token.substring(0, 20) + '...');

      // Set user data with ID
      const userWithId = {
        ...user,
        id: user._id, // Ensure ID is set correctly
        userData: userData || {}
      };

      console.log('Setting user with ID after login:', userWithId);
      console.log('User ID for API calls will be:', userWithId.id);
      console.log('User role:', userWithId.role);
      setUser(userWithId);

      return userData;
    } catch (error) {
      console.error('Login error in AuthContext:', error);

      // Handle different types of errors
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);

        // Handle specific status codes
        if (error.response.status === 401) {
          setError('Invalid username or password. Please try again.');
        } else if (error.response.status === 403) {
          setError('Access denied. You do not have permission to log in with these credentials.');
        } else if (error.response.status === 404) {
          setError('Login service not found. Please contact support.');
        } else if (error.response.status >= 500) {
          setError('Server error. Please try again later or contact support.');
        } else {
          setError(error.response.data?.message || 'Login failed. Please try again.');
        }
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received:', error.request);
        setError('No response from server. Please check your internet connection and try again.');
      } else if (error.message.includes('timeout')) {
        // Request timed out
        console.error('Request timeout:', error.message);
        setError('Request timed out. Please try again later.');
      } else if (error.message) {
        // Error thrown from our own validation
        setError(error.message);
      } else {
        // Something else happened
        setError('Login failed. Please check your credentials and try again.');
      }

      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  // Update user profile
  const updateProfile = (updatedData) => {
    console.log('Updating user profile with data:', updatedData);

    // Ensure we have valid data to update with
    if (!updatedData) {
      console.error('Invalid data provided to updateProfile:', updatedData);
      return;
    }

    setUser(prev => {
      if (!prev) {
        console.log('No previous user data, setting initial user data');
        // If there's no previous user data, just use the updated data
        const newUser = {
          ...updatedData,
          id: updatedData._id || updatedData.id, // Ensure ID is set correctly
          userData: {
            ...updatedData
          }
        };
        console.log('New user data:', newUser);
        return newUser;
      }

      // Create a deep merged object
      const updated = {
        ...prev,
        ...updatedData,
        // Ensure ID is preserved or updated correctly
        id: updatedData._id || updatedData.id || prev.id,
        // Ensure userData is properly updated
        userData: {
          ...(prev?.userData || {}),
          ...updatedData
        }
      };

      console.log('Updated user data:', updated);
      return updated;
    });
  };

  // Compute authentication state values
  const isAuthenticated = !loading && !!user;

  // Only check roles when user is authenticated and loaded
  const isAdmin = isAuthenticated && user?.role === 'admin';
  const isTeacher = isAuthenticated && user?.role === 'teacher';
  const isStudent = isAuthenticated && user?.role === 'student';
  const isDeveloper = isAuthenticated && user?.role === 'developer';

  const value = {
    user,
    setUser,
    token,
    loading,
    error,
    login,
    logout,
    updateProfile,
    isAuthenticated,
    isAdmin,
    isTeacher,
    isStudent,
    isDeveloper,
    userData: user?.userData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
