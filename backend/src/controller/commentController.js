/**
 * Contrôleur des commentaires
 * Gère les opérations CRUD sur les commentaires d'articles
 * Supporte les commentaires imbriqués (réponses aux commentaires)
 */

import Comment from '../models/Comment.js';
import  Article  from '../models/Article.js';
import { AppError } from '../utils/AppError.js';

/**
 * Crée un nouveau commentaire sur un article
 * Vérifie que l'article existe et est publié avant d'autoriser le commentaire
 * @route POST /api/articles/:articleId/comments
 */
export const createComment = async (req, res, next) => {
    try {
        const { articleId } = req.params;

        // Vérification de l'existence de l'article
        const article = await Article.findById(articleId);
        if (!article) {
            return next(new AppError('Article non trouvé', 404, ['Article non trouvé']));
        }
        
        // Seuls les articles publiés peuvent recevoir des commentaires
        if (!article.published) {
            return next(new AppError('Impossible de commenter un article non publié', 403, ['Cet article n\'est pas encore publié']));
        }

        // Récupère le contenu depuis content ou text (compatibilité)
        const content = req.body.content || req.body.text;
        if (!content) {
            return next(new AppError('Le contenu est obligatoire', 400, ['Le contenu est obligatoire']));
        }
        
        // Création du commentaire (avec référence au commentaire parent si réponse)
        const comment = await Comment.create({
            content,
            author: req.user?._id,
            article: articleId,
            comment: req.body.comment || null // ID du commentaire parent pour les réponses
        });

        res.status(201).json({
            success: true,
            data: comment
        });
    } catch (err) {
        next(AppError.from(err));
    }
};

/**
 * Compte le nombre de commentaires d'un auteur
 * @route GET /api/articles/:articleId/comments/author/count/:authorId
 */
export const getCountCommentsByAuthor = async (req, res, next) => {
    try {
        const { authorId } = req.params;
        const count = await Comment.countDocuments({ author: authorId });
        res.status(200).json({ count });
    } catch (err) {
        next(AppError.from(err));
    }
};

/**
 * Récupère tous les commentaires d'un article avec structure imbriquée
 * Construit un arbre de commentaires où chaque commentaire contient ses réponses
 * Retourne uniquement les commentaires de niveau racine (pas de parent)
 * Les réponses sont imbriquées dans le champ "responses"
 * @route GET /api/articles/:articleId/comments
 */
export const getCommentsByArticle = async (req, res, next) => {
    try {
        const { articleId } = req.params;

        // Vérification de l'existence de l'article
        const article = await Article.findById(articleId);
        if (!article) {
            return next(new AppError('Article non trouvé', 404, ['Article non trouvé']));
        }

        // Récupère tous les commentaires avec leurs relations (author, article, etc.)
        const comments = await Comment.find({ article: articleId }).sort({ createdAt: -1 });

        // Normalise en objets JavaScript pour manipulation
        const nodes = comments.map((c) => {
            const obj = typeof c.toObject === 'function' ? c.toObject({ virtuals: true }) : { ...c };
            if (!Array.isArray(obj.responses)) obj.responses = [];
            return obj;
        });

        // Construction d'un Map pour accès rapide par ID
        const byId = new Map();
        nodes.forEach((n) => {
            const id = String(n._id || n.id);
            byId.set(id, n);
        });

        // Construction de l'arbre : attache chaque commentaire à son parent
        const roots = [];
        nodes.forEach((n) => {
            const parentRef = n.comment;
            const parentId = parentRef
                ? String(typeof parentRef === 'object' ? (parentRef._id || parentRef.id) : parentRef)
                : null;
            if (parentId && byId.has(parentId)) {
                const parentNode = byId.get(parentId);
                if (!Array.isArray(parentNode.responses)) parentNode.responses = [];
                parentNode.responses.push(n);
            } else {
                roots.push(n);
            }
        });

        res.status(200).json({
            success: true,
            count: roots.length,
            data: roots
        });
    } catch (err) {
        next(AppError.from(err));
    }
};


export const updateComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const updates = { ...req.body };
        if (updates.text && !updates.content) {
            updates.content = updates.text;
            delete updates.text;
        }
        if (updates.author) delete updates.author;

        const comment = await Comment.findByIdAndUpdate(commentId, updates, { new: true, runValidators: true });
        if (!comment) {
            return next(new AppError('Commentaire non trouvé', 404, ['Commentaire non trouvé']));
        }
        res.status(200).json({
            success: true,
            data: comment
        });
    } catch (err) {
        next(AppError.from(err));
    }
};

export const deleteComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const comment = await Comment.findByIdAndDelete(commentId);
        if (!comment) {
            return next(new AppError('Commentaire non trouvé', 404, ['Commentaire non trouvé']));
        }
        res.status(204).json({ success: true, data: null });
    } catch (err) {
        next(AppError.from(err));
    }
};