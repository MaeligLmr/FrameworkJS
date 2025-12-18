import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
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
      const res = await signup({ username, firstname, lastname, email, password });
      navigate('/', { state: { message: res?.message || 'Compte créé. Bienvenue !' } });
    } catch (err) {
      setErrors(err?.errors || ['Erreur lors de la création du compte']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='p-4'>
      <Link to="/" className="text-[#4062BB] hover:text-[#2F4889]"><i className="fas fa-arrow-left"></i> Retour à l'accueil</Link>
      <div className="min-h-screen p-6 max-w-xl mx-auto flex flex-col justify-center gap-4">
        <h1 className="text-2xl font-semibold">S'inscrire</h1>
        {errors.length > 0 &&
          errors.map((err, index) => (
            <div key={index} className="p-2 border border-red-600 bg-red-100 text-red-700 mb-4">{err}</div>
          ))}
        <RegisterForm onSubmit={handleSubmit} />
        {loading && <div className="mt-3">Création du compte…</div>}
        <p className="text-center">Déjà un compte ? <Link to="/login" className="text-[#4062BB] hover:text-[#2F4889]">Connectez-vous</Link></p>
      </div>
    </div>
  );
}

export default Register;
