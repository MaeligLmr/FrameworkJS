/**
 * ResetPassword — Page de réinitialisation
 * Vérifie la correspondance des mots de passe puis appelle l'API pour réinitialiser.
 * Redirige vers la connexion après succès.
 */
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Soumet le nouveau mot de passe (avec vérification de confirmation)
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
        <Input
          type="password"
          name="password"
          label="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <Input
          type="password"
          name="confirm"
          label="Confirmer le mot de passe"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={6}
        />
        <Button
          type="submit"
          disabled={loading}
          full
        >
          {loading ? 'Réinitialisation...' : 'Réinitialiser'}
        </Button>
      </form>
      <p className="mt-4 text-sm">
        <Link to="/login" className="text-[#4062BB]">Retour connexion</Link>
      </p>
    </div>
  );
};

export default ResetPassword;
