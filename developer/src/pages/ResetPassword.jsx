import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import config from '../config';
import { useAuth } from '../contexts/AuthContext';
import collegeLogo from '../assets/college-logo.png';

const ResetPassword = () => {
  const { currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Email entry, 2: OTP verification, 3: New password

  // Pre-fill email if user is logged in
  useState(() => {
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setMessage('');

      await axios.post(`${config.apiUrl}/api/password-reset/forgot-password`, { email });

      setIsSuccess(true);
      setMessage('If an account with that email exists, a password reset OTP has been sent.');
      setStep(2); // Move to OTP verification step
    } catch (err) {
      console.error('Error requesting password reset OTP:', err);
      setIsSuccess(false);
      setError(err.response?.data?.message || 'An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp) {
      setError('Please enter the OTP sent to your email');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setMessage('');

      const response = await axios.post(`${config.apiUrl}/api/password-reset/verify-otp`, {
        email,
        otp
      });

      // Store the token if provided
      if (response.data.token) {
        localStorage.setItem('resetToken', response.data.token);
      }

      setIsSuccess(true);
      setMessage('OTP verified successfully. Please set your new password.');

      // Reset isSuccess and clear message when moving to password reset step
      setTimeout(() => {
        setIsSuccess(false);
        setMessage(''); // Clear the success message
        setStep(3); // Move to password reset step
      }, 1500);
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setIsSuccess(false);
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setMessage('');

      // Make sure we have the OTP from the previous step
      if (!otp) {
        setError('OTP is missing. Please go back and verify your OTP again.');
        setIsSubmitting(false);
        return;
      }

      // Create a clean axios instance without any default headers
      const axiosInstance = axios.create();
      delete axiosInstance.defaults.headers.common['Authorization'];

      const response = await axiosInstance.post(
        `${config.apiUrl}/api/password-reset/reset-password-with-otp`,
        {
          email,
          otp,
          password
        }
      );

      setIsSuccess(true);
      setMessage('Your password has been reset successfully! You can now log in with your new password.');
      toast.success('Password reset successful!');

      // Clear form
      setPassword('');
      setConfirmPassword('');
      setOtp('');

      // Return to step 1 after a delay
      setTimeout(() => {
        setStep(1);
        setIsSuccess(false);
        setMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error resetting password:', err);
      setIsSuccess(false);

      // More specific error messages
      if (err.response?.status === 500) {
        setError('Server error. Please try again later or contact support.');
      } else if (err.response?.status === 400) {
        setError(err.response.data?.message || 'Invalid request. Please check your information and try again.');
      } else if (err.response?.status === 401) {
        setError('Authentication error. Please try requesting a new password reset.');
      } else if (err.code === 'ECONNABORTED' || !err.response) {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError(err.response?.data?.message || 'An error occurred. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-primary-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 futuristic-card p-8 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-500 rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary-500 rounded-full filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '1s'}}></div>

        <div className="relative z-10">
          <div className="flex justify-center">
            <img className="h-20 w-auto filter drop-shadow-lg" src={collegeLogo} alt="College Logo" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-primary-300">
            Secure password reset with OTP verification
          </p>
        </div>

        <div className="relative z-10">
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 backdrop-blur-sm border border-red-500/50 text-red-200 rounded-lg shadow-lg">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p>{error}</p>
              </div>
            </div>
          )}

          {isSuccess && message && (
            <div className="mb-6 p-4 bg-green-900/30 backdrop-blur-sm border border-green-500/50 text-green-200 rounded-lg shadow-lg">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p>{message}</p>
              </div>
            </div>
          )}

          {/* Step 1: Email Form */}
          {step === 1 && (
            <form className="space-y-6" onSubmit={handleRequestOTP}>
              <div className="relative group">
                <label htmlFor="email" className="block text-sm font-medium text-primary-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-primary-500/30 placeholder-gray-500 text-white bg-gray-800/50 backdrop-blur-sm rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-300"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary-500/20 to-secondary-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting || !email}
                  className="futuristic-button w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden group"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary-400 to-secondary-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                  <span className="relative flex items-center">
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Send OTP
                      </>
                    )}
                  </span>
                </button>
              </div>

              <div className="text-center mt-4">
                <Link to="/developer/login" className="text-sm text-primary-400 hover:text-primary-300 transition-colors duration-200">
                  Back to Login
                </Link>
              </div>
            </form>
          )}

          {/* Step 2: OTP Verification Form */}
          {step === 2 && (
            <form className="space-y-6" onSubmit={handleVerifyOTP}>
              <div className="relative group">
                <label htmlFor="otp" className="block text-sm font-medium text-primary-300 mb-1">
                  Enter OTP
                </label>
                <div className="relative">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    className="appearance-none block w-full px-3 py-3 border border-primary-500/30 placeholder-gray-500 text-white bg-gray-800/50 backdrop-blur-sm rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-300 text-center tracking-widest letter-spacing-2"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    disabled={isSubmitting}
                    maxLength={6}
                  />
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary-500/20 to-secondary-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                <p className="mt-2 text-xs text-primary-400">
                  A 6-digit OTP has been sent to <span className="text-white">{email}</span>
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                  className="w-1/2 flex justify-center py-3 px-4 border border-primary-500/30 rounded-md shadow-sm text-sm font-medium text-primary-300 bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden group"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary-400/10 to-secondary-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center">
                    <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                  </span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || otp.length !== 6}
                  className="w-1/2 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden group"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary-400 to-secondary-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                  <span className="relative flex items-center">
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Verify OTP
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New Password Form */}
          {step === 3 && (
            <form className="space-y-6" onSubmit={handleResetPassword}>
              <div className="relative group">
                <label htmlFor="password" className="block text-sm font-medium text-primary-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-primary-500/30 placeholder-gray-500 text-white bg-gray-800/50 backdrop-blur-sm rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-300"
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary-500/20 to-secondary-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                <p className="mt-1 text-xs text-primary-400">
                  Password must be at least 6 characters long
                </p>
              </div>

              <div className="relative group">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-primary-500/30 placeholder-gray-500 text-white bg-gray-800/50 backdrop-blur-sm rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-300"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary-500/20 to-secondary-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                {password && confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-400">
                    Passwords do not match
                  </p>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={isSubmitting}
                  className="w-1/2 flex justify-center py-3 px-4 border border-primary-500/30 rounded-md shadow-sm text-sm font-medium text-primary-300 bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden group"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary-400/10 to-secondary-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center">
                    <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                  </span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !password || !confirmPassword || password !== confirmPassword || password.length < 6}
                  className="w-1/2 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden group"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary-400 to-secondary-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                  <span className="relative flex items-center">
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Resetting...
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        Reset Password
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
