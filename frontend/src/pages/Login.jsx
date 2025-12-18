import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      setLoading(true);
      await authService.login({ email, password });
      await login(email, password);

      navigate('/');
    } catch (err) {
      setErrors(err?.errors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='p-4'>
      <Link to="/" className="text-[#4062BB] hover:text-[#2F4889]"><i className="fas fa-arrow-left"></i> Retour à l'accueil</Link>
      <div className="min-h-screen p-6 max-w-xl mx-auto flex flex-col justify-center gap-4">
        <h1 className="text-2xl font-semibold">Se connecter</h1>
        {errors.length > 0 &&
          errors.map((err, index) => (
            <div key={index} className="p-2 border border-red-600 bg-red-100 text-red-700 mb-4">{err}</div>
          ))}

        <LoginForm onSubmit={handleSubmit} />
        {loading && <div className="mt-3">Connexion en cours…</div>}
        <p className="text-center">Pas encore de compte ? <Link to="/signup" className="text-[#4062BB] hover:text-[#2F4889]">Inscrivez-vous</Link></p>
        <p className="text-center"><Link to="/forgot-password" className="text-[#4062BB] hover:text-[#2F4889]">Mot de passe oublié ?</Link></p>
      </div>
    </div>

  );
}

export default Login;