/**
 * Modèle Comment
 * Représente un commentaire sur un article avec système de réponses imbriquées
 * Supporte la modération avec un flag "reported"
 * Utilise un système parent-enfant : le champ "comment" référence le commentaire parent
 */

import mongoose from 'mongoose';
const commentSchema = new mongoose.Schema(
    {
        // ============== CONTENU ==============
        /** Texte du commentaire (2-500 caractères) */
        content: {
            type: String,
            required: [true, 'Le contenu est obligatoire'],
            trim: true,
            minlength: [2, 'Minimum 2 caractères'],
            maxlength: [500, 'Maximum 500 caractères']
        },

        // ============== AUTEUR ==============
        /** Référence vers l'utilisateur auteur du commentaire */
        author: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Auteur obligatoire'],
            ref: 'User'
        },

        /** Email de l'auteur (optionnel, utilisé pour les notifications) */
        email: {
            type: String,
            trim: true,
            lowercase: true,
            // Pattern simple et fiable pour valider l'email
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email invalide']
        },

        // ============== RELATIONS ==============
        /** Référence vers l'article commenté */
        article: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Article',
            required: [true, 'Article obligatoire']
        },

        /** Référence vers le commentaire parent (null si commentaire de niveau racine) */
        comment :{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
            default: null
        },

        // ============== MODÉRATION ==============
        /** Flag indiquant si le commentaire a été signalé comme inapproprié */
        reported: {
            type: Boolean,
            default: false
        }
    },
    {
        // Ajoute automatiquement createdAt et updatedAt
        timestamps: true,
        toJSON: {
            // Active les champs virtuels lors de la sérialisation JSON
            virtuals: true,
            transform: function (doc, ret) {
                // Garantit que responses est toujours un tableau, même vide
                if (!Array.isArray(ret.responses)) ret.responses = [];
                return ret;
            }
        }
    }
);

// ============== INDEX ==============
/** Index composé pour optimiser les requêtes de commentaires par article */
commentSchema.index({ article: 1, createdAt: -1 });

// ============== MÉTHODES D'INSTANCE ==============

/**
 * Peuple les réponses (commentaires enfants) d'un commentaire
 * Utilise populate récursif pour inclure les informations des auteurs
 * @returns {Promise<Comment>} Le commentaire avec ses réponses peuplées
 */
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

// ============== CHAMPS VIRTUELS ==============

/**
 * Relation virtuelle vers les réponses (commentaires ayant ce commentaire comme parent)
 * Permet de construire un arbre de commentaires imbriqués
 */
commentSchema.virtual('responses', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'comment'
});

// ============== MIDDLEWARE ==============

/**
 * Hook pre-find : Peuple automatiquement les relations
 * S'applique à toutes les opérations find* (findOne, find, findById, etc.)
 * Inclut l'article, le commentaire parent et l'auteur avec leurs détails
 */
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
            select: '_id username email avatar avatarPublicId avatarImageName'
        }
    ]);
    next();
});

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;