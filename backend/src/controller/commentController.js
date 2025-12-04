import Comment from '../models/Comment.js';
import  Article  from '../models/Article.js';
import { AppError } from '../utils/AppError.js';

// Créer un commentaire
export const createComment = async (req, res, next) => {
    const { articleId } = req.params;

    // ⚠️ IMPORTANT : Vérifier que l'article existe
    const article = await Article.findById(articleId);
    if (!article) {
        return next(new AppError('Article non trouvé', 404));
    }

    // Créer le commentaire
    const comment = await Comment.create({
        contenu: req.body.contenu,
        auteur: req.body.auteur,
        email: req.body.email,
        article: articleId// Lier à l'article
    });

    res.status(201).json({
        success: true,
        data: comment
    });
};

// Récupérer les commentaires d'un article

export const getCommentsByArticle = async (req, res, next) => {
    const { articleId } = req.params;

    // Vérifier l'article

    const article = await Article.findById(articleId);
    if (!article) {
        return next(new AppError('Article non trouvé', 404));
    }

    // Récupérer les commentaires
    const comments = await Comment.find({ article: articleId })
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: comments.length,
        data: comments
    });
};

export const getApprovedComments = async (req, res, next) => {
    const { articleId } = req.params;
    // Vérifier l'article
    const article = await Article.findById(articleId);
    if (!article) {
        return next(new AppError('Article non trouvé', 404));
    }
    // Récupérer les commentaires approuvés
    const comments = await Comment.findApprovedByArticle(articleId);
    res.status(200).json({
        success: true,
        count: comments.length,
        data: comments
    });
};