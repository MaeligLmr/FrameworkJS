import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Button from '../common/Button';

export const Navbar = () => {
  const { user, authToken, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="p-4 gap-4 flex justify-between items-center w-full">
        <Link to="/">Home</Link>
        {authToken || user ? (
          <>
            <Link to="/my-articles">Mes Articles</Link>
            <Link to="/create">Nouvel Article</Link>
          </>
        ) : null}

        {authToken || user ? (
          <>
            <Link to="/profile">Profile</Link>
            <Button onClick={handleLogout} className="text-sm text-red-600"><i className="fas fa-sign-out-alt"></i></Button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Register</Link>
          </>
        )}
    </nav>
  );
};

export default Navbar;