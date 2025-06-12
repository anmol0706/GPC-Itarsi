import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import collegeLogo from '../assets/college-logo.png';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        setIsValidating(true);
        console.log(`Validating token: ${token}`);

        // Create a new axios instance to avoid global header issues
        const axiosInstance = axios.create();
        delete axiosInstance.defaults.headers.common['Authorization'];

        console.log(`Making validation request to: ${config.apiUrl}/api/password-reset/validate-token/${token}`);

        const response = await axiosInstance.get(
          `${config.apiUrl}/api/password-reset/validate-token/${token}`,
          {
            headers: {
              'Content-Type': 'application/json',
              // Explicitly avoid sending any Authorization header
            }
          }
        );

        console.log('Token validation response:', response.data);

        if (response.data && response.data.message === 'Token is valid') {
          console.log('Token is valid, userId:', response.data.userId);
          setIsValidToken(true);
        } else {
          console.warn('Unexpected response format:', response.data);
          setError('Invalid response from server. Please try again or request a new reset link.');
          setIsValidToken(false);
        }
      } catch (err) {
        console.error('Invalid or expired token:', err);
        console.error('Error details:', err.response?.data || err.message);
        console.error('Error status:', err.response?.status);

        if (err.response?.status === 400) {
          setError('This password reset link is invalid or has expired. Please request a new one.');
        } else if (err.response?.status === 401) {
          setError('Authentication error. Please request a new password reset link.');
        } else {
          setError('Error validating reset link. Please try again or request a new reset link.');
        }

        setIsValidToken(false);
      } finally {
        setIsValidating(false);
      }
    };

    if (token) {
      validateToken();
    } else {
      setIsValidating(false);
      setIsValidToken(false);
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  // Function to handle password reset
  const resetPassword = async () => {
    console.log('Reset Password function called');

    // Validate passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setMessage('');

      console.log(`Submitting password reset for token: ${token}`);

      // Make sure we don't have any Authorization headers that could interfere
      const axiosInstance = axios.create();
      delete axiosInstance.defaults.headers.common['Authorization'];

      // Log the request we're about to make
      console.log(`Making request to: ${config.apiUrl}/api/password-reset/reset-password/${token}`);
      console.log('Request payload:', { password: '******' });

      const response = await axiosInstance.post(
        `${config.apiUrl}/api/password-reset/reset-password/${token}`,
        { password },
        {
          headers: {
            'Content-Type': 'application/json',
            // Explicitly avoid sending any Authorization header
          }
        }
      );

      console.log('Password reset response:', response.data);

      setIsSuccess(true);
      setMessage('Your password has been reset successfully!');

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

      return true;
    } catch (err) {
      console.error('Error resetting password:', err);
      console.error('Error details:', err.response?.data || err.message);
      console.error('Error status:', err.response?.status);
      console.error('Error headers:', err.response?.headers);

      setIsSuccess(false);

      // Provide more specific error messages based on status code
      if (err.response?.status === 401) {
        setError('Authentication error. Please try requesting a new password reset link.');
      } else if (err.response?.status === 400) {
        setError(err.response.data?.message || 'Invalid request. Please check your information and try again.');
      } else {
        setError(err.response?.data?.message || 'An error occurred. Please try again later.');
      }

      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 to-secondary-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-gray-900/80 backdrop-blur-lg p-8 rounded-xl shadow-lg border border-primary-500/30 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>

          <div className="flex flex-col items-center relative z-10">
            <div className="w-24 h-24 overflow-hidden rounded-full border-4 border-primary-500/50 shadow-lg glow-sm">
              <img src={collegeLogo} alt="College Logo" className="w-full h-full object-cover" />
            </div>
            <h2 className="mt-4 text-center text-3xl font-extrabold text-white text-glow">Reset Password</h2>
            <div className="mt-4 flex justify-center">
              <svg className="animate-spin h-10 w-10 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="mt-2 text-center text-sm text-gray-300">
              Validating your reset link...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 to-secondary-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-gray-900/80 backdrop-blur-lg p-8 rounded-xl shadow-lg border border-primary-500/30 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>

          <div className="flex flex-col items-center relative z-10">
            <div className="w-24 h-24 overflow-hidden rounded-full border-4 border-primary-500/50 shadow-lg glow-sm">
              <img src={collegeLogo} alt="College Logo" className="w-full h-full object-cover" />
            </div>
            <h2 className="mt-4 text-center text-3xl font-extrabold text-white text-glow">Reset Password</h2>
          </div>

          <div className="rounded-md bg-red-900/50 border border-red-500/50 p-4 my-4 backdrop-blur-sm relative z-10">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-300">
                  {error}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center relative z-10">
            <Link to="/forgot-password" className="font-medium text-primary-400 hover:text-primary-300 transition-colors duration-200 inline-flex items-center group">
              <svg className="w-4 h-4 mr-1 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
              Request a new password reset
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 to-secondary-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-900/80 backdrop-blur-lg p-8 rounded-xl shadow-lg border border-primary-500/30 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="flex flex-col items-center relative z-10">
          <div className="w-24 h-24 overflow-hidden rounded-full border-4 border-primary-500/50 shadow-lg glow-sm">
            <img src={collegeLogo} alt="College Logo" className="w-full h-full object-cover" />
          </div>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-white text-glow">Reset Password</h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Enter your new password below
          </p>
        </div>

        {message && (
          <div className={`rounded-md ${isSuccess ? 'bg-green-900/50' : 'bg-red-900/50'} border ${isSuccess ? 'border-green-500/50' : 'border-red-500/50'} p-4 my-4 backdrop-blur-sm relative z-10`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {isSuccess ? (
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${isSuccess ? 'text-green-300' : 'text-red-300'}`}>
                  {message}
                </p>
                {isSuccess && (
                  <p className="mt-2 text-sm text-green-300">
                    Redirecting to login page...
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {error && !message && (
          <div className="rounded-md bg-red-900/50 border border-red-500/50 p-4 my-4 backdrop-blur-sm relative z-10">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-300">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 space-y-6 relative z-10">
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="form-group">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-primary-500/30 placeholder-gray-500 text-white bg-gray-800/50 backdrop-blur-sm rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-300"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting || isSuccess}
              />
            </div>
            <div className="form-group mt-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-primary-500/30 placeholder-gray-500 text-white bg-gray-800/50 backdrop-blur-sm rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-300"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting || isSuccess}
              />
            </div>
          </div>

          <div>
            <button
              type="button"
              disabled={isSubmitting || isSuccess}
              className="group relative w-full flex justify-center py-3 px-4 border border-primary-500/50 text-sm font-medium rounded-md text-white bg-primary-600/80 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400 disabled:opacity-50 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-primary-500/20"
              onClick={() => {
                console.log('Reset Password button clicked directly');
                resetPassword();
              }}
            >
              <span className="absolute inset-0 overflow-hidden rounded-md">
                <span className="absolute inset-0 rounded-md bg-gradient-to-r from-primary-500/40 to-secondary-500/40 opacity-0 group-hover:opacity-100 group-hover:blur-sm transition-all duration-500"></span>
              </span>
              {isSubmitting ? (
                <span className="flex items-center relative z-10">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting Password...
                </span>
              ) : (
                <span className="relative z-10">Reset Password</span>
              )}
            </button>
          </div>
        </div>

        <div className="mt-4 text-center relative z-10">
          <Link to="/login" className="font-medium text-primary-400 hover:text-primary-300 transition-colors duration-200 inline-flex items-center group">
            <svg className="w-4 h-4 mr-1 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
