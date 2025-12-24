/**
 * Contrôleur d'authentification
 * Gère l'inscription, connexion, déconnexion et réinitialisation de mot de passe
 * Utilise JWT pour l'authentification et Nodemailer pour les emails
 */

import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { createToken } from '../middleware/auth.js';
import crypto from 'crypto';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../config/email.js';

/**
 * Inscription d'un nouvel utilisateur
 * Vérifie l'unicité de l'email, crée l'utilisateur et envoie un email de bienvenue
 * @route POST /api/auth/register
 */
export const signup = async (req, res, next) => {
  try {
    const { username, firstname, lastname, email, password } = req.body;
    
    // Vérifier l'unicité de l'email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const appError = new AppError('Email déjà utilisé', 400, ['Cet email est déjà associé à un compte']);
      return res.status(appError.statusCode).json(appError.toJSON());
    }
    
    // Création de l'utilisateur (le mot de passe sera hashé par le middleware pre-save)
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
      // On ne bloque pas l'inscription même si l'email échoue
    }
    
    // Génération du token JWT
    const token = createToken(user);
    res.status(201).json({ 
      status: 'success', 
      token, 
      user,
      message: 'Inscription réussie. Bienvenue !' 
    });
  } catch (err) {
    // Gestion des erreurs de validation Mongoose
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      const appError = new AppError('Erreur de validation des données', 400, errors);
      return res.status(appError.statusCode).json(appError.toJSON());
    }
    // Gestion des doublons (index unique MongoDB)
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const appError = new AppError('Données en double', 400, [`${field} déjà utilisé`]);
      return res.status(appError.statusCode).json(appError.toJSON());
    }
    const appError = new AppError('Erreur lors de l\'inscription', 500, [err.message || 'Erreur inconnue']);
    return res.status(appError.statusCode).json(appError.toJSON());
  }
};

/**
 * Connexion d'un utilisateur existant
 * Vérifie les identifiants et retourne un token JWT
 * @route POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validation des champs requis
    if (!email || !password) {
      const appError = new AppError('Email et mot de passe sont requis', 400);
      return res.status(appError.statusCode).json(appError.toJSON());
    }
    
    // Récupération de l'utilisateur avec le mot de passe (normalement exclu)
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      const appError = new AppError('Erreur d\'authentification', 401, ['Email ou mot de passe incorrect']);
      return res.status(appError.statusCode).json(appError.toJSON());
    }
    
    // Génération du token JWT
    const token = createToken(user);
    res.status(200).json({ status: 'success', token, user });
  } catch (err) {
    const appError = new AppError('Erreur lors de la connexion', 500, [err.message || 'Erreur inconnue']);
    return res.status(appError.statusCode).json(appError.toJSON());
  }
};

/**
 * Déconnexion de l'utilisateur
 * Note : Le serveur ne peut pas supprimer le token côté client (localStorage)
 * La déconnexion réelle se fait côté frontend
 * @route POST /api/auth/logout
 */
export const logout = (req, res) => {
  res.status(200).json({ status: 'success', message: 'Déconnexion réussie' });
};

/**
 * Vérifie la validité du token JWT
 * Récupère les informations actualisées de l'utilisateur
 * @route GET /api/auth/verify
 */
export const verifyToken = async (req, res, next) => {
  try {
    // req.user est déjà défini par le middleware authenticateToken
    const userId = req.user?._id;
    if (!userId) {
      const appError = new AppError('Token invalide', 401, ['Token invalide ou expiré']);
      return res.status(appError.statusCode).json(appError.toJSON());
    }
    
    // Récupérer les données utilisateur actualisées
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

/**
 * Vérifie l'email d'un utilisateur via un token
 * Actuellement non utilisé, mais préparé pour implémentation future
 * @route GET /api/auth/verify-email/:token
 */
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

/**
 * Demande de réinitialisation de mot de passe
 * Génère un token de reset et envoie un email à l'utilisateur
 * Ne révèle pas si l'email existe dans la base de données (sécurité)
 * @route POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      // Ne pas révéler si l'email existe ou non (protection contre l'énumération)
      return res.status(200).json({ 
        status: 'success', 
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé' 
      });
    }
    
    // Générer un token de reset cryptographiquement sécurisé
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 heure
    await user.save();
    
    // Envoyer l'email de réinitialisation
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

/**
 * Réinitialise le mot de passe avec un token de reset
 * Vérifie la validité et l'expiration du token avant de modifier le mot de passe
 * @route POST /api/auth/reset-password/:token
 */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    // Validation du nouveau mot de passe
    if (!password || password.length < 6) {
      const appError = new AppError('Mot de passe invalide', 400, ['Le mot de passe doit contenir au moins 6 caractères']);
      return res.status(appError.statusCode).json(appError.toJSON());
    }
    
    // Recherche d'un utilisateur avec un token valide et non expiré
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      const appError = new AppError('Token invalide ou expiré', 400, ['Token invalide ou expiré']);
      return res.status(appError.statusCode).json(appError.toJSON());
    }
    
    // Mise à jour du mot de passe et suppression du token
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
