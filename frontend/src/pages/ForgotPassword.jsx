import { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setMessage('');
    try {
      setLoading(true);
      const res = await authService.forgotPassword(email);
      setMessage(res?.message || 'Si cet email existe, un lien a été envoyé.');
    } catch (err) {
      setErrors(err?.errors || ['Erreur lors de la demande']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Mot de passe oublié</h1>
      {message && <div className="p-3 bg-green-100 border border-green-500 text-green-700 mb-4">{message}</div>}
      {errors.length > 0 && errors.map((err, i) => (
        <div key={i} className="p-2 border border-red-600 bg-red-100 text-red-700 mb-2">{err}</div>
      ))}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          name="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button
          type="submit"
          disabled={loading}
          full
        >
          {loading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
        </Button>
      </form>
      <p className="mt-4 text-sm">
        <Link to="/login" className="text-[#4062BB]">Retour connexion</Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
