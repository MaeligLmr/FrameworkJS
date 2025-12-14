import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

export const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    if(e.target.password.value !== e.target.confirmPassword.value) {
      setErrors(['Les mots de passe ne correspondent pas']);
      return;
    }
    const username = e.target.username.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const firstname = e.target.firstname.value;
    const lastname = e.target.lastname.value;
    try {
      setLoading(true);
      // call signup endpoint
      await authService.signup({ username, firstname, lastname, email, password });
      // after signup, try login automatically
      await login(email, password);
      navigate('/');
    } catch (err) {
      setErrors(err?.errors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold mb-4">S'inscrire</h1>
      {errors.length > 0 &&
        errors.map((err, index) => (
          <div key={index} className="p-2 border border-red-600 bg-red-100 text-red-700 mb-4">{err}</div>
        ))}
      <RegisterForm onSubmit={handleSubmit} />
      {loading && <div className="mt-3">Création du compte…</div>}
      <p>Déjà un compte ? <Link to="/login" className="text-blue-600 hover:text-blue-800">Connectez-vous</Link></p>
    </div>
  );
}

export default Register;
