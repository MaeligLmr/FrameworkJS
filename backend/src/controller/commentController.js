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
        content: req.body.content,
        author: req.body.author,
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

export const updateComment = async (req, res, next) => {
    const { commentId } = req.params;
    const updates = req.body;
    const comment = await Comment.findByIdAndUpdate(commentId, updates, { new: true, runValidators: true });
    if (!comment) {
        return next(new AppError('Commentaire non trouvé', 404));
    }
    res.status(200).json({
        success: true,
        data: comment
    });
};

export const deleteComment = async (req, res, next) => {
    const { commentId } = req.params;
    const comment = await Comment.findByIdAndDelete(commentId);
    if (!comment) {
        return next(new AppError('Commentaire non trouvé', 404));
    }
    res.status(204).json({ success: true, data: null });
};