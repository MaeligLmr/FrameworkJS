import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";

const articleSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Le titre est obligatoire"],
            trim: true,
            maxlength: [150, "Le titre ne peut pas dépasser 150 caractères"],
        },
        content: {
            type: String,
            required: [true, "Le contenu est obligatoire"],
            trim: true,
            minlength: [20, "Le contenu doit contenir au moins 20 caractères"],
            maxlength: [2000, "Le contenu ne peut pas dépasser 2000 caractères"],
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "L'auteur est obligatoire"],
        },
        published: {
            type: Boolean,
            default: false,
        },
        category: {
            type: String,
            enum: [
                "Cinéma & Séries",
                "Musique",
                "Comics",
                "Internet"
            ],
            required: [true, "La catégorie est obligatoire"],
        },
        imageUrl: {
            type: String,
            trim: true,
            match: [/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/, "URL d'image invalide"],
        },
        imageName: {
            type: String,
            trim: true,
        },
        imageExtension: {
            type: String,
            trim: true,
            enum: ["jpg", "jpeg", "png", "gif", "webp"],
        },
        views: {
            type: Number,
            default: 0,
            min: [0, "Le nombre de vues ne peut pas être négatif"],
        },
    },
    {
        //createdAt
        timestamps: true,
        virtuals: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

articleSchema.methods.publish = function () {
    this.published = true;
    return this.save();
}

articleSchema.methods.unpublish = function () {
    this.published = false;
    return this.save();
}

articleSchema.methods.incrementViews = function () {
    this.views += 1;
    return this.save();
}


articleSchema.statics.findPublished = function () {
    return this.find({ published: true }).sort({ createdAt: -1 });
}

articleSchema.statics.findByCategory = function (category) {
    return this.find({ category }).sort({ createdAt: -1 });
}

articleSchema.statics.findByAuthor = function (authorId) {
    return this.find({ author: authorId }).sort({ createdAt: -1 });
}

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
