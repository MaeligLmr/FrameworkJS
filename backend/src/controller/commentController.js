const Comment = require('../models/Comment');
const Article = require('../models/Article');
const AppError = require('../utils/AppError');
const { catchAsync } = require('../middleware/errorHandler');

// Créer un commentaire
exports.createComment = catchAsync(async (req, res, next) => {
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
});

// Récupérer les commentaires d'un article

exports.getCommentsByArticle = catchAsync(async (req, res, next) => {
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
});

