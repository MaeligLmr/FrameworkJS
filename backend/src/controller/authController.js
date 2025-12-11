import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { createToken } from '../middleware/auth.js';
export const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.create({ username, email, password });
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
