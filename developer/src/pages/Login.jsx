import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import collegeLogo from '../assets/college-logo.png';
import '../styles/FuturisticDashboard.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/developer';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Login form submitted with:', { username, password });

      // Show loading state in the button
      const loginButton = document.getElementById('dev-login-button');
      if (loginButton) {
        loginButton.disabled = true;
        loginButton.innerHTML = '<div class="futuristic-loader mr-2"></div> Authenticating...';
      }

      // Implement retry mechanism for better reliability
      let loginAttempts = 0;
      const maxAttempts = 2;
      let success = false;
      let lastError = null;

      while (loginAttempts < maxAttempts && !success) {
        try {
          console.log(`Login attempt ${loginAttempts + 1} of ${maxAttempts}`);
          success = await login(username, password);

          if (!success) {
            throw new Error('Login returned false');
          }
        } catch (loginError) {
          lastError = loginError;
          loginAttempts++;
          console.error(`Login attempt ${loginAttempts} failed:`, loginError);

          if (loginAttempts < maxAttempts) {
            console.log(`Retrying login in 1 second (attempt ${loginAttempts + 1} of ${maxAttempts})...`);
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      if (!success) {
        throw lastError || new Error('Login failed after multiple attempts');
      }

      // Check if token was stored in localStorage
      const token = localStorage.getItem('token');
      console.log('Token after login:', token ? `${token.substring(0, 20)}...` : 'No token');

      if (success && token) {
        console.log('Login successful, navigating to dashboard');
        const from = location.state?.from?.pathname || '/developer';
        navigate(from, { replace: true });
      } else if (success && !token) {
        console.error('Login reported success but no token was stored');
        // Try to login again or show an error
        throw new Error('Authentication failed: No token received');
      }
    } catch (err) {
      console.error('Login submission error:', err);

      // Reset button state
      const loginButton = document.getElementById('dev-login-button');
      if (loginButton) {
        loginButton.disabled = false;
        loginButton.innerHTML = 'Sign in';
      }

      // Error is already handled by the AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-primary-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 futuristic-card p-8">
        <div>
          <div className="flex justify-center">
            <img className="h-20 w-auto filter drop-shadow-lg" src={collegeLogo} alt="College Logo" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Developer Portal
          </h2>
          <p className="mt-2 text-center text-sm text-primary-300">
            Sign in to access the developer dashboard
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 border border-red-300">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {/* You can add a "Remember me" checkbox here if needed */}
            </div>
            <div className="text-sm">
              <Link to="/developer/reset-password" className="font-medium text-primary-400 hover:text-primary-300 transition-colors duration-200">
                Forgot password?
              </Link>
            </div>
          </div>

          <div>
            <button
              id="dev-login-button"
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300"
            >
              {isLoading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-primary-500 group-hover:text-primary-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
