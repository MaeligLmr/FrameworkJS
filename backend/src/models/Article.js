/**
 * Modèle Article
 * Représente un article de blog avec titre, contenu, auteur, catégorie et image
 * Gère également les états de publication et le compteur de vues
 */

import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";

const articleSchema = new mongoose.Schema(
    {
        // Titre de l'article (3-150 caractères)
        title: {
            type: String,
            required: [true, "Le titre est obligatoire"],
            trim: true,
            maxlength: [150, "Le titre ne peut pas dépasser 150 caractères"],
        },
        // Contenu principal (20-2000 caractères)
        content: {
            type: String,
            required: [true, "Le contenu est obligatoire"],
            trim: true,
            minlength: [20, "Le contenu doit contenir au moins 20 caractères"],
            maxlength: [2000, "Le contenu ne peut pas dépasser 2000 caractères"],
        },
        // Référence vers l'utilisateur auteur
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "L'auteur est obligatoire"],
        },
        // État de publication (false = brouillon)
        published: {
            type: Boolean,
            default: false,
        },
        // Catégorie de l'article (choix prédéfinis)
        category: {
            type: String,
            enum: [
                "Cinéma & Séries",
                "Musique",
                "Comics, Manga",
                "Internet"
            ],
            required: [true, "La catégorie est obligatoire"],
        },
        // URL de l'image stockée sur Cloudinary
        imageUrl: {
            type: String,
            trim: true,
            match: [/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/, "URL d'image invalide"],
        },
        // Nom original du fichier image
        imageName: {
            type: String,
            trim: true,
        },
        // Extension de l'image
        imageExtension: {
            type: String,
            trim: true,
            enum: ["jpg", "jpeg", "png", "gif", "webp"],
        },
        // Compteur de vues de l'article
        views: {
            type: Number,
            default: 0,
            min: [0, "Le nombre de vues ne peut pas être négatif"],
        },
    },
    {
        timestamps: true, // Ajoute createdAt et updatedAt automatiquement
        virtuals: true, // Active les champs virtuels
        toJSON: { virtuals: true }, // Inclut les virtuels dans les JSON
        toObject: { virtuals: true }
    }
);

// ============== MÉTHODES D'INSTANCE ==============

/**
 * Publie l'article (passe published à true)
 */
articleSchema.methods.publish = function () {
    this.published = true;
    return this.save();
}

/**
 * Dépublie l'article (passe published à false)
 */
articleSchema.methods.unpublish = function () {
    this.published = false;
    return this.save();
}

/**
 * Incrémente le compteur de vues de l'article
 */
articleSchema.methods.incrementViews = function () {
    this.views += 1;
    return this.save();
}

// ============== MÉTHODES STATIQUES ==============

/**
 * Récupère tous les articles publiés, triés par date décroissante
 */
articleSchema.statics.findPublished = function () {
    return this.find({ published: true }).sort({ createdAt: -1 });
}

/**
 * Récupère tous les articles d'une catégorie donnée
 */
articleSchema.statics.findByCategory = function (category) {
    return this.find({ category }).sort({ createdAt: -1 });
}

/**
 * Récupère tous les articles d'un auteur donné
 */
articleSchema.statics.findByAuthor = function (authorId) {
    return this.find({ author: authorId }).sort({ createdAt: -1 });
}

// ============== CHAMPS VIRTUELS ==============

/**
 * Génère un résumé court du contenu (100 premiers caractères + "...")
 */
articleSchema.virtual("summary").get(function () {
    const content = this.content || "";
    if (content.length <= 100) {
        return content;
    }
    return content.substring(0, 100) + "...";
});

articleSchema.virtual("comments", {
    ref: "Comment", // Modèle référencé
    localField: "_id",
    foreignField: "article"
});


articleSchema.pre(/^find/, function (next) {
    this.populate({
        path: "author",
        select: "username email avatar avatarPublicId avatarImageName"
    });
    next();
});

articleSchema.pre('findOneAndDelete', async function (next) {
    try {
        const doc = await this.model.findOne(this.getFilter());
        if (!doc) return next();

        // Delete associated comments
        await mongoose.model('Comment').deleteMany({ article: doc._id });

        // Delete image from Cloudinary if exists
        if (doc.imageUrl) {
            const publicIdMatch = doc.imageUrl.match(/\/articles\/([^/.]+)/);
            if (publicIdMatch) {
                const publicId = `articles/${publicIdMatch[1]}`;
                await cloudinary.uploader.destroy(publicId).catch(err => {
                    console.error('Error deleting image from Cloudinary:', err);
                });
            }
        }

        next();
    } catch (err) {
        next(err);
    }
});

const Article = mongoose.model("Article", articleSchema);
export default Article;
