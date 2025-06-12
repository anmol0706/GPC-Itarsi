import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  // Show a loading spinner while authentication state is being determined
  if (loading) {
    return <LoadingSpinner message="Loading your profile..." fullScreen={true} />;
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Safely check if user has the required role
  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    // Redirect based on user role
    if (user.role === 'admin') {
      return <Navigate to="/admin" />;
    } else if (user.role === 'teacher') {
      return <Navigate to="/teacher" />;
    } else if (user.role === 'student') {
      return <Navigate to="/student" />;
    } else if (user.role === 'developer') {
      return <Navigate to="/developer" />;
    } else {
      return <Navigate to="/" />;
    }
  }

  return children;
};

export default ProtectedRoute;
