import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Avatar from '../profile/avatar';
import Button from '../common/Button';
import { useState } from 'react';
import PopupConfirm from '../common/PopupConfirm';

export const Navbar = () => {
  const { user, authToken, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <>
    <nav className="gap-4 flex justify-between items-center w-full">
        <Link to="/" className='text-[#2A407A] flex items-baseline home'><img src="/public/zentra.svg" alt="Z" className="w-8 h-auto" /></Link>
        {authToken || user ? (
          <>
            <div className='flex gap-4 items-center'>
            <Link to="/create" className='hidden md:block'><Button icon="plus">Nouvel Article</Button></Link>
            <Link to={`/profile/${user._id}`} className='py-2'>
            <Avatar dimensions={8} user={user} showName={false}/>
            </Link>
            <Button onClick={() => setShowLogoutConfirm(true)} noBorders icon="sign-out-alt" rounded></Button>
            </div>
          </>
        ) : (
          <div className='flex gap-4'>
            <Link to="/login"><Button>Se Connecter</Button></Link>
            <Link to="/signup"><Button light>S'inscrire</Button></Link>
          </div>
        )}
    </nav>
    
    {showLogoutConfirm && (
      <PopupConfirm
        message="Êtes-vous sûr de vouloir vous déconnecter ?"
        onConfirm={logout}
        onCancel={() => setShowLogoutConfirm(false)}
        confirmText="Se déconnecter"
        danger
      />
    )}
    </>
  );
};

export default Navbar;