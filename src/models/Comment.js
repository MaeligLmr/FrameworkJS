const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
    {
        // Contenu du commentaire
        content: {
            type: String,
            required: [true, 'Le contenu est obligatoire'],
            trim: true,
            minlength: [2, 'Minimum 2 caractères'],
            maxlength: [500, 'Maximum 500 caractères']
        },

        // Auteur
        author: {
            type: String,
            required: [true, 'Auteur obligatoire'],
            trim: true,
            maxlength: [100, 'Maximum 100 caractères']
        },

        // Email (optionnel)
        email: {
            type: String,
            trim: true,
            lowercase: true,
            match: [/^\w+[\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
        },

        // RÉFÉRENCE vers l'article
        article: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Article',
            required: [true, 'Article obligatoire']
        },

        // Modération
        approved: {
            type: Boolean,
            default: false
        },

        reported: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true }
    }
);

// INDEX pour optimiser les requêtes
commentSchema.index({ article: 1, createdAt: -1 });

// Méthodes d'instance
commentSchema.methods.approve = function () {
    this.approved = true;
    return this.save();
};

// Méthodes statiques
commentSchema.statics.findApprovedByArticle = function (articleId) {
    return this.find({ article: articleId, approved: true })
        .sort({ createdAt: -1 });
};

// Populate automatique
commentSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'article',
        select: 'title author'
    });
    next();
});

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
