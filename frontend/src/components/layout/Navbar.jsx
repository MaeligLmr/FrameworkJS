import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Avatar from '../profile/avatar';
import Button from '../common/Button';

export const Navbar = () => {
  const { user, authToken, logout } = useAuth();

  return (
    <nav className="gap-4 flex justify-between items-center w-full">
        <Link to="/" className='text-[#4062BB] flex items-center gap-2'><i className="fas fa-home text-3xl"></i> Zentra</Link>
        {authToken || user ? (
          <>
            <div className='flex gap-4'>
            <Link to="/create" className='hidden md:block rounded-lg text-white bg-[#4062BB] px-4 py-2 hover:bg-[#2F4889]'><i className='fas fa-plus'></i> Nouvel Article</Link>
            <Link to={`/profile/${user._id}`} className='flex justify-end items-center gap-2'>
            <span className="hidden md:block">{user.username}</span><Avatar dimensions={8} user={user}/>
            </Link>
            <Button onClick={logout} className='text-gray-500 rounded-lg p-2 hover:text-gray-700'><i className="fas fa-sign-out-alt"></i></Button>
            </div>
          </>
        ) : (
          <div className='flex gap-4'>
            <Link to="/login" className='bg-[#4062BB] text-white rounded-lg px-4 py-2 hover:bg-[#2F4889]'>Se Connecter</Link>
            <Link to="/signup" className='text-[#4062BB] hover:text-[#2F4889] px-4 py-2'>S'inscrire</Link>
          </div>
        )}
    </nav>
  );
};

export default Navbar;