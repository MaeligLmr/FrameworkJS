import Article from '../models/Article.js';

/**
 * Crée un nouvel article à partir des données fournies dans req.body et renvoie la réponse JSON.
 * @param {import('express').Request} req Requête HTTP — body doit contenir { title, content, author, category }
 * @param {import('express').Response} res Réponse HTTP
 * @returns {Promise<import('express').Response>} Réponse JSON avec l'article créé (201) ou une erreur (4xx/5xx)
 */
export const createArticle = async (req, res) => {
    const { title, content, author, category } = req.body;
    const imageUrl = req.file?.path || req.body.imageUrl;
    try {
        const newArticle = new Article({ title, content, author, category, imageUrl });
        const saved = await newArticle.save();
        return res.status(201).json({success : true, message : "Article créé avec succès", data : saved});
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

export const getArticleById = async (req, res) => {
    const { id } = req.params;
    try {
        const article = await Article.findById(id);
        if (!article) {
            return res.status(404).json({ message: 'Article non trouvé' });
        }
        await article.incrementViews();
        return res.status(200).json(article);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

export const getAllArticles = async (req, res) => {
    try {
        const articles = await Article.find().sort({ createdAt: -1 });
        return res.status(200).json(articles);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

export const updateArticle = async (req, res) => {
    const { id } = req.params;
    const updates = { ...req.body };
    if (req.file?.path) {
        updates.imageUrl = req.file.path;
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