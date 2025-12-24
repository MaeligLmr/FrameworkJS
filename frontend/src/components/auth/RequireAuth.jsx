/**
 * RequireAuth — garde de route
 * Protège une route en vérifiant la présence d'un token ou d'un utilisateur.
 * Redirige vers /login si non authentifié.
 */
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const RequireAuth = ({ children }) => {
  const { authToken, user } = useAuth();
  const location = useLocation();

  if (!authToken && !user) {
    // Redirige vers la connexion en conservant la location demandée
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;
