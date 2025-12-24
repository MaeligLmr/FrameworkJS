/**
 * Routes pour la gestion des profils utilisateur
 * 
 * Organisation :
 * - Route publique pour consulter un profil utilisateur par ID
 * - Routes protégées pour gérer son propre profil (consultation, modification, changement de mot de passe)
 * 
 * Middlewares :
 * - protect : Exige un token JWT valide pour les routes protégées
 * - uploadAvatarImage : Gère l'upload d'avatar via Cloudinary (multer)
 * 
 * Fonctionnalités :
 * - Consultation publique de profils (pour afficher les auteurs d'articles)
 * - Gestion complète de son propre profil (infos personnelles, avatar, mot de passe)
 */

import express from 'express';
import { getUserProfile, updateUserProfile, changePassword, getUserById } from '../controller/userController.js';
import { protect } from '../middleware/auth.js';
import { uploadAvatarImage } from '../config/cloudinary.js';

const router = express.Router();

// ============== ROUTES PUBLIQUES ==============

/** Récupère le profil public d'un utilisateur par son ID (accessible sans connexion) */
router.get('/user/:id', getUserById);

// ============== MIDDLEWARE GLOBAL ==============
/** Toutes les routes suivantes nécessitent une authentification */
router.use(protect);

// ============== ROUTES PROTÉGÉES - PROFIL ==============

/** Récupère le profil complet de l'utilisateur connecté */
router.get('/profile', getUserProfile);

/** Met à jour le profil de l'utilisateur connecté (infos + avatar) */
router.put('/profile', uploadAvatarImage('avatar'), updateUserProfile);

/** Change le mot de passe de l'utilisateur connecté */
router.put('/change-password', changePassword);

export default router;
