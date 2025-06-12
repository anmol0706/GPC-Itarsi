import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import collegeLogo from '../assets/college-logo.png';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Email entry, 2: OTP verification, 3: New password

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
    console.log('Verify OTP form submitted');

    if (!otp) {
      setError('Please enter the OTP sent to your email');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setMessage('');

      console.log('Verifying OTP:', { email, otp });

      const response = await axios.post(`${config.apiUrl}/api/password-reset/verify-otp`, {
        email,
        otp
      });

      console.log('OTP verification response:', response.data);

      // Store the token if provided
      if (response.data.token) {
        localStorage.setItem('resetToken', response.data.token);
      }

      setIsSuccess(true);
      setMessage('OTP verified successfully. Please set your new password.');

      // Keep the OTP in state for the next step
      // We'll need it for the reset-password-with-otp endpoint

      // Reset isSuccess and clear message when moving to password reset step
      setTimeout(() => {
        setIsSuccess(false);
        setMessage(''); // Clear the success message
        setStep(3); // Move to password reset step
      }, 1500);
    } catch (err) {
      console.error('Error verifying OTP:', err);
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
      }
      setIsSuccess(false);
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    console.log('Reset password form submitted - handleResetPassword function called');

    // Validate passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      console.log('Password validation failed: Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      console.log('Password validation failed: Password too short');
      return;
    }

    try {
      console.log('Password validation passed, proceeding with reset');
      setIsSubmitting(true);
      setError('');
      setMessage('');

      console.log('Sending password reset request with:', { email, otp: otp ? '******' : undefined, password: password ? '******' : undefined });

      // Make sure we have the OTP from the previous step
      if (!otp) {
        setError('OTP is missing. Please go back and verify your OTP again.');
        console.log('Error: OTP is missing');
        setIsSubmitting(false);
        return;
      }

      // Get the reset token from localStorage if available
      const resetToken = localStorage.getItem('resetToken');
      const headers = resetToken ? { Authorization: `Bearer ${resetToken}` } : {};

      console.log('Using headers:', headers);

      // Create a new axios instance to avoid global header issues
      const axiosInstance = axios.create();
      delete axiosInstance.defaults.headers.common['Authorization'];

      // Add the token to this specific request if available
      if (resetToken) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${resetToken}`;
      }

      console.log('Making request to:', `${config.apiUrl}/api/password-reset/reset-password-with-otp`);
      console.log('Request payload:', { email, otp: '******', password: '******' });
      console.log('Request headers:', axiosInstance.defaults.headers.common);

      try {
        const response = await axiosInstance.post(
          `${config.apiUrl}/api/password-reset/reset-password-with-otp`,
          {
            email,
            otp,
            password
          },
          { timeout: 10000 } // Add timeout to prevent hanging requests
        );

        console.log('Password reset response:', response.data);
        console.log('Password reset successful');
      } catch (requestError) {
        console.error('Error in axios request:', requestError);
        if (requestError.response) {
          console.error('Response status:', requestError.response.status);
          console.error('Response data:', requestError.response.data);
        } else if (requestError.request) {
          console.error('No response received, request details:', requestError.request);
        }
        throw requestError; // Re-throw to be caught by the outer catch block
      }

      setIsSuccess(true);
      setMessage('Your password has been reset successfully!');

      // Clear the reset token from localStorage
      localStorage.removeItem('resetToken');

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Error resetting password:', err);

      // Detailed error logging
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        console.error('Error response headers:', err.response.headers);
      } else if (err.request) {
        console.error('Error request:', err.request);
      } else {
        console.error('Error message:', err.message);
      }

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 to-secondary-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-900/80 backdrop-blur-lg p-8 rounded-xl shadow-lg transform transition-all duration-300 hover:shadow-2xl border border-primary-500/30 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="flex flex-col items-center relative z-10">
          <div className="w-24 h-24 overflow-hidden rounded-full border-4 border-primary-500/50 shadow-lg glow-sm">
            <img src={collegeLogo} alt="College Logo" className="w-full h-full object-cover" />
          </div>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-white text-glow">Forgot Password</h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            {step === 1 && "Enter your email address to receive a password reset OTP"}
            {step === 2 && "Enter the OTP sent to your email"}
            {step === 3 && "Create a new password for your account"}
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
              </div>
            </div>
          </div>
        )}

        {error && (
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

        {/* Step 1: Email Form */}
        {step === 1 && (
          <form className="mt-8 space-y-6 relative z-10" onSubmit={handleRequestOTP}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="form-group">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-primary-500/30 placeholder-gray-500 text-white bg-gray-800/50 backdrop-blur-sm rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-300"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-3 px-4 border border-primary-500/50 text-sm font-medium rounded-md text-white bg-primary-600/80 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400 disabled:opacity-50 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-primary-500/20"
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
                    Sending...
                  </span>
                ) : (
                  <span className="relative z-10">Send OTP</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: OTP Verification Form */}
        {step === 2 && (
          <form className="mt-8 space-y-6 relative z-10" onSubmit={handleVerifyOTP}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="form-group">
                <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-1">
                  Enter OTP
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-primary-500/30 placeholder-gray-500 text-white bg-gray-800/50 backdrop-blur-sm rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all duration-300 tracking-widest text-center"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  disabled={isSubmitting}
                  maxLength={6}
                />
                <p className="mt-2 text-xs text-gray-400">
                  A 6-digit OTP has been sent to {email}
                </p>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                className="group relative w-1/2 flex justify-center py-3 px-4 border border-gray-500 text-sm font-medium rounded-md text-white bg-transparent hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300"
              >
                <span className="relative z-10">Back</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting || otp.length !== 6}
                className="group relative w-1/2 flex justify-center py-3 px-4 border border-primary-500/50 text-sm font-medium rounded-md text-white bg-primary-600/80 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400 disabled:opacity-50 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-primary-500/20"
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
                    Verifying...
                  </span>
                ) : (
                  <span className="relative z-10">Verify OTP</span>
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleRequestOTP}
                disabled={isSubmitting}
                className="text-primary-400 hover:text-primary-300 text-sm font-medium focus:outline-none transition-all duration-300"
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {/* Step 3: New Password Form */}
        {step === 3 && (
          <form className="mt-8 space-y-6 relative z-10" onSubmit={handleResetPassword}>
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isSubmitting || isSuccess}
                className="group relative w-1/2 flex justify-center py-3 px-4 border border-gray-500 text-sm font-medium rounded-md text-white bg-transparent hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300"
              >
                <span className="relative z-10">Back</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isSuccess}
                className="group relative w-1/2 flex justify-center py-3 px-4 border border-primary-500/50 text-sm font-medium rounded-md text-white bg-primary-600/80 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400 disabled:opacity-50 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-primary-500/20"
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
                    Resetting...
                  </span>
                ) : (
                  <span className="relative z-10">Reset Password</span>
                )}
              </button>
            </div>
          </form>
        )}

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

export default ForgotPassword;
