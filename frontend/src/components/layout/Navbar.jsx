import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Avatar from '../profile/avatar';

export const Navbar = () => {
  const { user, authToken } = useAuth();

  return (
    <nav className="gap-4 flex justify-between items-center w-full">
        <Link to="/"><i className="fas fa-home"></i></Link>
        {authToken || user ? (
          <>
            <div className='flex gap-4'>
            <Link to="/create" className='hidden md:block rounded-lg text-white bg-blue-600 px-4 py-2 hover:bg-blue-700'>+ Nouvel Article</Link>
            <Link to={`/profile/${user._id}`} className='flex justify-end items-center gap-2'>
            <span className="hidden md:block">{user.username}</span><Avatar dimensions={8} user={user}/>
            </Link>
            </div>
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