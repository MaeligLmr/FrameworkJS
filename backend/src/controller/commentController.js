import Comment from '../models/Comment.js';
import  Article  from '../models/Article.js';
import { AppError } from '../utils/AppError.js';

// Créer un commentaire
export const createComment = async (req, res, next) => {
    try {
        const { articleId } = req.params;

        const article = await Article.findById(articleId);
        if (!article) {
            return next(new AppError('Article non trouvé', 404, ['Article non trouvé']));
        }

        const content = req.body.content || req.body.text;
        if (!content) {
            return next(new AppError('Le contenu est obligatoire', 400, ['Le contenu est obligatoire']));
        }

        const comment = await Comment.create({
            content,
            author: req.user?.id || req.body.author,
            article: articleId,
            comment: req.body.comment || null
        });

        res.status(201).json({
            success: true,
            data: comment
        });
    } catch (err) {
        next(AppError.from(err));
    }
};

export const getCountCommentsByAuthor = async (req, res, next) => {
    try {
        const { authorId } = req.params;
        const count = await Comment.countDocuments({ author: authorId });
        res.status(200).json({ count });
    } catch (err) {
        next(AppError.from(err));
    }
};

// Récupérer les commentaires d'un article

export const getCommentsByArticle = async (req, res, next) => {
    try {
        const { articleId } = req.params;

        const article = await Article.findById(articleId);
        if (!article) {
            return next(new AppError('Article non trouvé', 404, ['Article non trouvé']));
        }

        const comments = await Comment.find({ article: articleId })
            .sort({ createdAt: -1 });

        // Populate responses (replies) pour chaque commentaire
        await Promise.all(comments.map(c => c.populateResponses()));

        res.status(200).json({
            success: true,
            count: comments.length,
            data: comments
        });
    } catch (err) {
        next(AppError.from(err));
    }
};


export const getApprovedComments = async (req, res, next) => {
    try {
        const { articleId } = req.params;
        const article = await Article.findById(articleId);
        if (!article) {
            return next(new AppError('Article non trouvé', 404, ['Article non trouvé']));
        }
        const comments = await Comment.findApprovedByArticle(articleId);
        res.status(200).json({
            success: true,
            count: comments.length,
            data: comments
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