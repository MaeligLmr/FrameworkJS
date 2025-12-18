import Article from '../models/Article.js';
import { AppError } from '../utils/AppError.js';

/**
 * Crée un nouvel article à partir des données fournies dans req.body et renvoie la réponse JSON.
 * @param {import('express').Request} req Requête HTTP — body doit contenir { title, content, author, category }
 * @param {import('express').Response} res Réponse HTTP
 * @returns {Promise<import('express').Response>} Réponse JSON avec l'article créé (201) ou une erreur (4xx/5xx)
 */
export const createArticle = async (req, res, next) => {
    const { title, content, category, published } = req.body;
    const imageUrl = req.file?.path || req.body.imageUrl;
    const imageName = req.file?.originalname || req.body.imageName;
    const author = req.user?._id;
    const imageExtension = req.file?.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)?.[1].toLowerCase() || req.body.imageExtension;
    try {
        const newArticle = new Article({ 
            title, 
            content, 
            author, 
            category, 
            imageUrl, 
            imageName, 
            imageExtension,
            published
        });
        const saved = await newArticle.save();
        const message = saved.published ? "Article publié avec succès" : "Article enregistré en brouillon";
        return res.status(201).json({success : true, message, data : saved});
    } catch (err) {
        if(err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Erreur de validation des données',
                errors: Object.values(err.errors).map(e => e.message)
            });
        }
        return res.status(500).json({
             success: false, 
             message: 'Erreur lors de la création de l\'article',
             error : err.message
            });
        
    }
}

export const getCountArticlesByAuthor = async (req, res) => {
    const { authorId } = req.params;
    try {
        const count = await Article.countDocuments({ author: authorId });
        return res.status(200).json({ count });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

export const getViewsByAuthor = async (req, res) => {
    const { authorId } = req.params;
    try {
        const articles = await Article.find({ author: authorId });
        const totalViews = articles.reduce((sum, article) => sum + article.views, 0);
        return res.status(200).json({ count: totalViews });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

export const getArticleById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const article = await Article.findById(id);
        if (!article) {
            return res.status(404).json({ message: 'Article non trouvé' });
        }
        
        // Vérifier que seul l'auteur peut voir les brouillons
        if (!article.published) {
            const userId = req.user?._id;
            if (!userId || article.author._id.toString() !== userId.toString()) {
                return res.status(403).json({ message: "Accès refusé. Cet article n'est pas publié." });
            }
        }
        
        await article.incrementViews();
        return res.status(200).json(article);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

export const getAllArticles = async (req, res, next) => {
    try {
        let { search, author, category, page = 1, limit = 10, sort = 'recent', showDrafts } = req.query;
        const query = {};
        const requesterId = req.user?._id;
        if(author === 'me' && requesterId){
            author = requesterId;
        } else if(author === 'me' && !requesterId){
            return next(new AppError('Authentification requise pour voir vos articles', 401, ['Authentification requise']));
        }

        // Par défaut, n'afficher que les articles publiés.
        // Si showDrafts=true, on restreint aux brouillons de l'auteur authentifié uniquement.
        if (showDrafts === 'true') {
            if (!requesterId) {
                return res.status(403).json({ message: 'Accès refusé. Authentification requise pour voir vos brouillons.' });
            }
            query.author = requesterId;
        } else {
            query.published = true;
        }

        // Recherche par titre ou contenu
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        if (author) {
            query.author = author;
        }

        // Filtre par catégorie
        if (category && category !== 'all') {
            query.category = category;
        }

        // Déterminer l'ordre de tri
        let sortObj = { createdAt: -1 }; // défaut : récent
        if (sort === 'oldest') {
            sortObj = { createdAt: 1 };
        } else if (sort === 'views') {
            sortObj = { views: -1 };
        } else if (sort === 'popular') {
            sortObj = { views: -1, createdAt: -1 };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Article.countDocuments(query);
        const articles = await Article.find(query)
            .sort(sortObj)
            .skip(skip)
            .limit(parseInt(limit));

        return res.status(200).json({
            articles,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit)),
                hasMore: skip + articles.length < total
            }
        });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

export const updateArticle = async (req, res) => {
    const { id } = req.params;
    const updates = { ...req.body };
    if (req.file?.path) {
        updates.imageUrl = req.file.path;
        updates.imageName = req.file.originalname;
        const extMatch = req.file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i);
        if (extMatch) {
            updates.imageExtension = extMatch[1].toLowerCase();
        }
    }
    // éviter le changement d'auteur via update
    if (updates.author) delete updates.author;
    try {
        const article = await Article.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        if (!article) {
            return res.status(404).json({ message: 'Article non trouvé' });
        }
        await article.save();
        return res.status(200).json(article);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

export const deleteArticle = async (req, res) => {
    const { id } = req.params;
    try {
        const article = await Article.findByIdAndDelete(id);
        if (!article) {
            return res.status(404).json({ message: 'Article non trouvé' });
        }
        return res.status(200).json({ message: 'Article supprimé avec succès' });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

export const publishArticle = async (req, res) => {
    const { id } = req.params;
    try {
        const article = await Article.findById(id);
        if (!article) {
            return res.status(404).json({ message: 'Article non trouvé' });
        }
        const updated = await article.publish();
        return res.status(200).json(updated);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

export const unpublishArticle = async (req, res) => {
    const { id } = req.params;
    try {
        const article = await Article.findById(id);
        if (!article) {
            return res.status(404).json({ message: 'Article non trouvé' });
        }
        const updated = await article.unpublish();
        return res.status(200).json(updated);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}