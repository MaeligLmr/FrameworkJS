import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const RequireAuth = ({ children }) => {
  const { authToken, user } = useAuth();
  const location = useLocation();

  if (!authToken && !user) {
    // redirect to login, preserving the requested location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;
