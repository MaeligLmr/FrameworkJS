/**
 * Navbar — Barre de navigation
 * Affiche le logo, les actions selon l'authentification (nouvel article, profil, déconnexion)
 * ou les liens de connexion/inscription. Inclut une confirmation pour la déconnexion.
 */
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Avatar from '../profile/avatar';
import Button from '../common/Button';
import { useState } from 'react';
import PopupConfirm from '../common/PopupConfirm';

export const Navbar = () => {
  const { user, authToken, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  }

  return (
    <>
    <nav className="gap-4 flex justify-between items-center w-full">
        {/* Vite sert les assets statiques depuis /public à la racine */}
        <Link to="/" className='rounded-full hover:bg-gray-100 p-1.25'><img src="/zentra.svg" alt="Z" className="w-8 h-8" /></Link>
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
        onConfirm={() => handleLogout()}
        onCancel={() => setShowLogoutConfirm(false)}
        confirmText="Se déconnecter"
        danger
      />
    )}
    </>
  );
};

export default Navbar;