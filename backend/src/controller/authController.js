import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { createToken } from '../middleware/auth.js';
import crypto from 'crypto';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../config/email.js';

export const signup = async (req, res, next) => {
  try {
    const { username, firstname, lastname, email, password } = req.body;
    
    // Vérifier l'unicité de l'email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const appError = new AppError('Email déjà utilisé', 400, ['Cet email est déjà associé à un compte']);
      return res.status(appError.statusCode).json(appError.toJSON());
    }
    
    const user = await User.create({ 
      username, 
      firstname, 
      lastname, 
      email, 
      password
    });
    
    // Envoyer l'email de bienvenue sans bloquer l'inscription
    try {
      await sendWelcomeEmail(email, username);
    } catch (emailErr) {
      console.error('Erreur envoi email:', emailErr);
    }
    
    const token = createToken(user);
    res.status(201).json({ 
      status: 'success', 
      token, 
      user,
      message: 'Inscription réussie. Bienvenue !' 
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      const appError = new AppError('Erreur de validation des données', 400, errors);
      return res.status(appError.statusCode).json(appError.toJSON());
    }
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const appError = new AppError('Données en double', 400, [`${field} déjà utilisé`]);
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

export const verifyToken = async (req, res, next) => {
  try {
    // req.user is already set by authenticateToken middleware
    const userId = req.user?._id;
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

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      const appError = new AppError('Token de vérification invalide', 400, ['Token invalide ou expiré']);
      return res.status(appError.statusCode).json(appError.toJSON());
    }
    
    await user.save();
    
    res.status(200).json({ status: 'success', message: 'Email vérifié avec succès' });
  } catch (err) {
    const appError = new AppError('Erreur lors de la vérification de l\'email', 500, [err.message]);
    return res.status(appError.statusCode).json(appError.toJSON());
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      // Ne pas révéler si l'email existe ou non
      return res.status(200).json({ 
        status: 'success', 
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé' 
      });
    }
    
    // Générer un token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 heure
    await user.save();
    
    // Envoyer l'email
    try {
      await sendPasswordResetEmail(email, resetToken, user.username);
    } catch (emailErr) {
      console.error('Erreur envoi email:', emailErr);
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      const appError = new AppError('Erreur lors de l\'envoi de l\'email', 500, ['Impossible d\'envoyer l\'email']);
      return res.status(appError.statusCode).json(appError.toJSON());
    }
    
    res.status(200).json({ 
      status: 'success', 
      message: 'Un email de réinitialisation a été envoyé' 
    });
  } catch (err) {
    const appError = new AppError('Erreur lors de la demande de réinitialisation', 500, [err.message]);
    return res.status(appError.statusCode).json(appError.toJSON());
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    if (!password || password.length < 6) {
      const appError = new AppError('Mot de passe invalide', 400, ['Le mot de passe doit contenir au moins 6 caractères']);
      return res.status(appError.statusCode).json(appError.toJSON());
    }
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      const appError = new AppError('Token invalide ou expiré', 400, ['Token invalide ou expiré']);
      return res.status(appError.statusCode).json(appError.toJSON());
    }
    
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    
    res.status(200).json({ 
      status: 'success', 
      message: 'Mot de passe réinitialisé avec succès' 
    });
  } catch (err) {
    const appError = new AppError('Erreur lors de la réinitialisation du mot de passe', 500, [err.message]);
    return res.status(appError.statusCode).json(appError.toJSON());
  }
};
