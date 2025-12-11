import mongoose from 'mongoose';
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
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Auteur obligatoire'],
            ref: 'User'
        },

        // Email (optionnel)
        email: {
            type: String,
            trim: true,
            lowercase: true,
            // simple, reliable email pattern
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email invalide']
        },

        // RÉFÉRENCE vers l'article
        article: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Article',
            required: [true, 'Article obligatoire']
        },

        comment :{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
            default: null
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

// Populate responses (replies) pour un commentaire
commentSchema.methods.populateResponses = async function () {
    await this.populate({
        path: 'responses',
        select: '_id content author createdAt',
        populate: {
            path: 'author',
            select: '_id username email'
        }
    });
    return this;
};

commentSchema.virtual('responses', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'comment'
});

// Populate automatique
commentSchema.pre(/^find/, function (next) {
    this.populate([
        {
            path: 'article',
            select: 'title author'
        },
        {
            path: 'comment',
            select: 'content author createdAt'
        },
        {
            path: 'author',
            select: '_id username email'
        }
    ]);
    next();
});

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;