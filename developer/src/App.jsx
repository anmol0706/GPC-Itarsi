import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, currentUser, checkTokenValidity } = useAuth();
  const location = useLocation();
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [validationAttempted, setValidationAttempted] = useState(false);

  // Check if there's a token in localStorage
  const token = localStorage.getItem('token');

  console.log('ProtectedRoute initial check:', {
    isAuthenticated,
    loading,
    hasToken: !!token,
    currentUser: currentUser ? `${currentUser.name} (${currentUser.role})` : 'No user'
  });

  // Validate token on component mount - only once
  useEffect(() => {
    // Only validate if we haven't already attempted validation
    if (!validationAttempted) {
      const validateToken = async () => {
        try {
          if (token) {
            console.log('Validating token in ProtectedRoute...');
            const isValid = await checkTokenValidity();
            console.log('Token validation result:', isValid);
            setTokenValid(isValid);
          } else {
            console.log('No token to validate');
            setTokenValid(false);
          }
        } catch (error) {
          console.error('Error validating token:', error);
          setTokenValid(false);
        } finally {
          setValidating(false);
          setValidationAttempted(true);
        }
      };

      validateToken();
    }
  }, [token, checkTokenValidity, validationAttempted]);

  if (loading || validating) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-primary-900">
      <div className="futuristic-loader"></div>
      <p className="text-white ml-3">Authenticating...</p>
    </div>;
  }

  // If not authenticated, no token, or invalid token, redirect to login
  if (!isAuthenticated || !token || !tokenValid) {
    console.log('Not authenticated or invalid token, redirecting to login');
    // Only clear token if we're sure it's invalid (after validation)
    if (validationAttempted) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
    return <Navigate to="/developer/login" state={{ from: location }} replace />;
  }

  // If authenticated but not a developer or admin, show access denied
  if (currentUser && currentUser.role !== 'developer' && currentUser.role !== 'admin') {
    console.log('User does not have developer/admin role:', currentUser.role);
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-primary-900">
      <div className="max-w-md w-full space-y-8 futuristic-card p-8">
        <div className="text-center text-red-600">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">Access Denied</h2>
          <p className="mt-2 text-center text-sm text-primary-300">
            You do not have permission to access the developer dashboard.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              delete axios.defaults.headers.common['Authorization'];
              window.location.href = '/developer/login';
            }}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    </div>;
  }

  return children;
};

function AppRoutes() {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/developer/login" element={<Login />} />

        {/* Protected routes */}
        <Route path="/developer/*" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* Redirect to developer dashboard */}
        <Route path="/" element={<Navigate to="/developer" replace />} />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/developer" replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
