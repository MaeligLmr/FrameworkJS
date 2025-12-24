/**
 * Routes d'authentification
 * 
 * Organisation :
 * - Routes publiques pour inscription, connexion et réinitialisation de mot de passe
 * - Routes protégées (après router.use(protect)) nécessitant un token JWT valide
 * 
 * Fonctionnalités :
 * - Inscription et connexion avec génération de token JWT
 * - Vérification d'email (préparé, non utilisé actuellement)
 * - Réinitialisation de mot de passe par email avec token temporaire
 * - Vérification de validité du token JWT
 */

import express from 'express';
const router = express.Router();
import * as authController from '../controller/authController.js';
import { protect } from '../middleware/auth.js';

// ============== ROUTES PUBLIQUES ==============

/** Inscription d'un nouvel utilisateur */
router.post('/signup', authController.signup);

/** Connexion d'un utilisateur existant */
router.post('/login', authController.login);

/** Déconnexion (simplement un endpoint de confirmation côté serveur) */
router.post('/logout', authController.logout);

/** Vérification d'email via token (fonctionnalité préparée) */
router.get('/verify-email/:token', authController.verifyEmail);

/** Demande de réinitialisation de mot de passe (génère et envoie un token par email) */
router.post('/forgot-password', authController.forgotPassword);

/** Réinitialisation effective du mot de passe avec le token */
router.post('/reset-password/:token', authController.resetPassword);

// ============== MIDDLEWARE GLOBAL ==============
/** Toutes les routes suivantes nécessitent une authentification */
router.use(protect);

// ============== ROUTES PROTÉGÉES ==============

/** Vérifie la validité du token JWT et retourne les données utilisateur */
router.get('/verify', authController.verifyToken);

export {router};