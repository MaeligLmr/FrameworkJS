import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const username = e.target.username.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      setLoading(true);
      // call signup endpoint
      await api.request('/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: username, email, password }),
      });
      // after signup, try login automatically
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
      <h1 className="text-2xl font-semibold mb-4">S'inscrire</h1>
      {error && <div className="mb-3 text-red-600">{error}</div>}
      <RegisterForm onSubmit={handleSubmit} />
      {loading && <div className="mt-3">Création du compte…</div>}
      <p>Déjà un compte ? <Link to="/login" className="text-blue-600 hover:text-blue-800">Connectez-vous</Link></p>
    </div>
  );
}

export default Register;
