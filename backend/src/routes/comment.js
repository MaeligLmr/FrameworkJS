/**
 * Routes pour la gestion des commentaires
 * 
 * Organisation :
 * - Routes publiques pour lire les commentaires (accessible sans connexion)
 * - Routes protégées pour créer, modifier, supprimer des commentaires
 * 
 * Configuration :
 * - mergeParams: true permet d'accéder au paramètre articleId depuis le routeur parent
 *   (utilisé dans /api/articles/:articleId/comments)
 * 
 * Fonctionnalités :
 * - Liste des commentaires avec structure imbriquée (arbre de réponses)
 * - Création de commentaires et réponses
 * - Modification et suppression (avec vérification d'autorisation dans le contrôleur)
 */

import { protect } from '../middleware/auth.js';
import { createComment, getCommentsByArticle, updateComment, deleteComment, getCountCommentsByAuthor } from '../controller/commentController.js';
import express from 'express';
/** mergeParams: true permet d'accéder au paramètre articleId du routeur parent */
const router = express.Router({ mergeParams: true });

// ============== ROUTES PUBLIQUES ==============

/** Liste tous les commentaires d'un article avec structure imbriquée (accessible sans connexion) */
router.route('/')
    .get(getCommentsByArticle);

// ============== MIDDLEWARE GLOBAL ==============
/** Toutes les routes suivantes nécessitent une authentification */
router.use(protect);

// ============== ROUTES PROTÉGÉES - CRUD ==============

/** Crée un nouveau commentaire ou une réponse à un commentaire (protégé) */
router.post('/', createComment);

/** Compte le nombre de commentaires d'un auteur (protégé) */
router.get('/author/count/:authorId', getCountCommentsByAuthor);

/** Met à jour un commentaire existant (protégé, auteur uniquement) */
router.put('/:commentId', updateComment);

/** Supprime un commentaire (protégé, auteur uniquement) */
router.delete('/:commentId', deleteComment);

export { router };
