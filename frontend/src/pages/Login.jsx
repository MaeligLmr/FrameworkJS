import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {LoginForm} from '../components/auth/LoginForm';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err?.message || JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold mb-4">Se connecter</h1>
      {error && <div className="mb-3 text-red-600">{error}</div>}
      <LoginForm onSubmit={handleSubmit} />
      {loading && <div className="mt-3">Connexion en cours…</div>}
      <p>Pas encore de compte ? <Link to="/signup" className="text-blue-600 hover:text-blue-800">Inscrivez-vous</Link></p>
    </div>
  );
}

export default Login;