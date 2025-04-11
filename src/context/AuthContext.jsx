import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');

        if (token) {
          // Set axios default headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // Get user data
          const response = await axios.get(`${API_URL}/api/auth/me`);
          console.log('User data from /me endpoint:', response.data);
          setUser(response.data.user);

          // If there's userData, merge it with the user object
          if (response.data.userData) {
            setUser(prev => ({ ...prev, userData: response.data.userData }));
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('token');
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
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password
      });

      const { token, user, userData } = response.data;
      console.log('Login response:', { token: token.substring(0, 20) + '...', user, userData });

      // Save token to localStorage
      localStorage.setItem('token', token);

      // Set axios default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Set user data
      setUser(user);

      // If there's userData, merge it with the user object
      if (userData) {
        setUser(prev => ({ ...prev, userData }));
      }

      return userData;
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      setError('Login failed. Please check your credentials and ensure the server is running.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Update user profile
  const updateProfile = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  const value = {
    user,
    setUser,
    loading,
    error,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',
    userData: user?.userData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
