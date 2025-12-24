/**
 * Routes pour la gestion des articles
 * 
 * Organisation :
 * - Routes publiques avec partialProtect (accessible sans connexion, infos utilisateur optionnelles)
 * - Routes protégées avec protect (nécessite authentification JWT)
 * - Intégration des sous-routes de commentaires
 * 
 * Middlewares :
 * - partialProtect : Extrait le token JWT si présent, mais n'exige pas l'authentification
 * - protect : Exige un token JWT valide
 * - uploadImage : Gère l'upload d'images via Cloudinary (multer)
 */

import express from 'express';
import { createArticle, getArticleById, getAllArticles, updateArticle, deleteArticle, publishArticle, unpublishArticle, getCountArticlesByAuthor, getViewsByAuthor } from '../controller/articleController.js';
import { uploadImage } from '../config/cloudinary.js';
import { partialProtect, protect } from '../middleware/auth.js';
import {router as commentRoutes} from './comment.js';

const router = express.Router();

// ============== ROUTES PUBLIQUES / SEMI-PUBLIQUES ==============

/** Liste tous les articles avec filtres (accessible sans connexion) */
router.get('/', partialProtect, getAllArticles);

/** Détail d'un article par ID (accessible sans connexion) */
router.get('/:id', partialProtect, getArticleById);

// ============== ROUTES PROTÉGÉES - STATISTIQUES ==============

/** Compte le nombre d'articles d'un auteur (protégé) */
router.get('/author/count/:authorId', protect, getCountArticlesByAuthor);

/** Calcule les vues cumulées d'un auteur (protégé) */
router.get('/author/views/:authorId', protect, getViewsByAuthor);

// ============== SOUS-ROUTES COMMENTAIRES ==============

/** Délègue toutes les routes /articles/:articleId/comments au routeur de commentaires */
router.use('/:articleId/comments', commentRoutes);

// ============== ROUTES PROTÉGÉES - CRUD ==============

/** Crée un nouvel article (protégé, avec upload d'image) */
router.post('/', protect, uploadImage('image'), createArticle);

/** Met à jour un article existant (protégé, avec upload d'image optionnel) */
router.put('/:id', protect, uploadImage('image'), updateArticle);

/** Publie un article (le rend visible publiquement) */
router.patch('/:id/publish', protect, publishArticle);

/** Dépublie un article (le repasse en brouillon) */
router.patch('/:id/unpublish', protect, unpublishArticle);

/** Supprime définitivement un article (protégé) */
router.delete('/:id', protect, deleteArticle);

export { router };