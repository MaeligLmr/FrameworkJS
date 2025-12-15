import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { createToken } from '../middleware/auth.js';
export const signup = async (req, res, next) => {
  try {
    const { username, firstname, lastname, email, password } = req.body;
    const user = await User.create({ username, firstname, lastname, email, password });
    const token = createToken(user);
    res.status(201).json({ status: 'success', token, user });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      const appError = new AppError('Erreur de validation des données', 400, errors);
      return res.status(appError.statusCode).json(appError.toJSON());
    }
    const appError = new AppError('Erreur lors de l\'inscription', 500, [err.message || 'Erreur inconnue']);
    return res.status(appError.statusCode).json(appError.toJSON());
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      const appError = new AppError('Email et mot de passe sont requis', 400);
      return res.status(appError.statusCode).json(appError.toJSON());
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      const appError = new AppError('Erreur d\'authentification', 401, ['Email ou mot de passe incorrect']);
      return res.status(appError.statusCode).json(appError.toJSON());
    }
    const token = createToken(user);
    res.status(200).json({ status: 'success', token, user });
  } catch (err) {
    const appError = new AppError('Erreur lors de la connexion', 500, [err.message || 'Erreur inconnue']);
    return res.status(appError.statusCode).json(appError.toJSON());
  }
};

export const logout = (req, res) => {
  // Server cannot clear client localStorage; just respond success.
  res.status(200).json({ status: 'success', message: 'Déconnexion réussie' });
};

export const checkToken = (req, res) => {
  res.status(200).json({ status: 'success', valid: true });
}

export const verifyToken = async (req, res, next) => {
  try {
    // req.user is already set by authenticateToken middleware
    const userId = req.user?.id;
    if (!userId) {
      const appError = new AppError('Token invalide', 401, ['Token invalide ou expiré']);
      return res.status(appError.statusCode).json(appError.toJSON());
    }
    
    // Fetch fresh user data
    const user = await User.findById(userId).select('-password');
    if (!user) {
      const appError = new AppError('Utilisateur introuvable', 404, ['Utilisateur introuvable']);
      return res.status(appError.statusCode).json(appError.toJSON());
    }
    
    res.status(200).json({ status: 'success', user });
  } catch (err) {
    const appError = new AppError('Erreur lors de la vérification du token', 500, [err.message || 'Erreur inconnue']);
    return res.status(appError.statusCode).json(appError.toJSON());
  }
}