import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

export const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setMessage('');
    if (password !== confirm) {
      setErrors(['Les mots de passe ne correspondent pas']);
      return;
    }
    try {
      setLoading(true);
      const res = await authService.resetPassword(token, password);
      setMessage(res?.message || 'Mot de passe réinitialisé. Vous pouvez vous connecter.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setErrors(err?.errors || ['Erreur lors de la réinitialisation']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Réinitialiser le mot de passe</h1>
      {message && <div className="p-3 bg-green-100 border border-green-500 text-green-700 mb-4">{message}</div>}
      {errors.length > 0 && errors.map((err, i) => (
        <div key={i} className="p-2 border border-red-600 bg-red-100 text-red-700 mb-2">{err}</div>
      ))}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
            minLength={6}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
            minLength={6}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[#4062BB] text-white py-2 rounded-lg hover:bg-[#2F4889] disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Réinitialisation...' : 'Réinitialiser'}
        </button>
      </form>
      <p className="mt-4 text-sm">
        <Link to="/login" className="text-[#4062BB]">Retour connexion</Link>
      </p>
    </div>
  );
};

export default ResetPassword;
