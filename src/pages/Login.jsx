import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../config/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      setLoading(true);
      setError('');

      console.log('Attempting login with:', { username, password });

      // Make the API call
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password
      });

      console.log('Login response:', response.data);

      const { token, user } = response.data;

      // Save token to localStorage
      localStorage.setItem('token', token);

      // Set axios default headers for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Set user in context
      setUser(user);

      // Redirect based on user role
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'teacher') {
        navigate('/teacher');
      } else if (user.role === 'student') {
        navigate('/student');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);

      // Provide more specific error messages based on the error
      if (error.response) {
        // The request was made and the server responded with a status code
        if (error.response.status === 401) {
          setError('Invalid credentials. Please check your username and password.');
        } else if (error.response.status === 404) {
          setError('Login endpoint not found. The server might be misconfigured.');
        } else if (error.response.status >= 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(`Login failed: ${error.response.data.message || 'Unknown error'}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your internet connection or try again later.');
      } else {
        // Something happened in setting up the request
        setError('Login failed. Please check your credentials and ensure the server is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary-900">RGPVI College</h2>
          <p className="mt-2 text-center text-sm text-secondary-600">
            Sign in to your account
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={() => setUserType('student')}
              className={`px-4 py-2 rounded-md ${
                userType === 'student' ? 'bg-primary-500 text-white' : 'bg-secondary-100 text-secondary-700'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setUserType('teacher')}
              className={`px-4 py-2 rounded-md ${
                userType === 'teacher' ? 'bg-primary-500 text-white' : 'bg-secondary-100 text-secondary-700'
              }`}
            >
              Teacher
            </button>
            <button
              type="button"
              onClick={() => setUserType('admin')}
              className={`px-4 py-2 rounded-md ${
                userType === 'admin' ? 'bg-primary-500 text-white' : 'bg-secondary-100 text-secondary-700'
              }`}
            >
              Admin
            </button>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  {userType === 'student' ? 'Roll Number' : userType === 'teacher' ? 'Username' : 'Username'}
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="form-input"
                  placeholder={userType === 'student' ? 'Enter your roll number' : 'Enter your username'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400 disabled:opacity-50 transition-colors duration-200"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          {userType === 'admin' && (
            <div className="mt-4 text-center text-sm text-secondary-600">
            </div>
          )}

          {userType === 'student' && (
            <div className="mt-4 text-center text-sm text-secondary-600">

            </div>
          )}

          {userType === 'teacher' && (
            <div className="mt-4 text-center text-sm text-secondary-600">

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
