import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Avatar from '../profile/avatar';
import Button from '../common/Button';

export const Navbar = () => {
  const { user, authToken, logout } = useAuth();

  return (
    <nav className="gap-4 flex justify-between items-center w-full">
        <Link to="/" className='text-[#4062BB] flex items-center gap-2'><img src="/public/Zentra.webp" alt="Zentra Logo" className="w-8 h-8" /></Link>
        {authToken || user ? (
          <>
            <div className='flex gap-4 items-center'>
            <Link to="/create" className='hidden md:block'><Button icon="plus">Nouvel Article</Button></Link>
            <Link to={`/profile/${user._id}`} className='py-2'>
            <Avatar dimensions={8} user={user} showName={false}/>
            </Link>
            <Button onClick={logout} noBorders><i className="fas fa-sign-out-alt"></i></Button>
            </div>
          </>
        ) : (
          <div className='flex gap-4'>
            <Link to="/login"><Button>Se Connecter</Button></Link>
            <Link to="/signup"><Button light>S'inscrire</Button></Link>
          </div>
        )}
    </nav>
  );
};

export default Navbar;