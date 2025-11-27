import mongoose from "mongoose";

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
            type: String,
            ref: "User",
            required: [true, "L'auteur est obligatoire"],
        },
        published: {
            type: Boolean,
            default: false,
        },
        category: {
            type: String,
            enum: ["Technologie", "Santé", "Finance", "Éducation", "Divertissement"],
            required: [true, "La catégorie est obligatoire"],
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
    if (this.content.length <= 100) {
        return this.content;
    }
    return this.content.substring(0, 100) + "...";
});

articleSchema.virtual("comments", {
    ref: "Comment", // Modèle référencé
    localField: "_id",
    foreignField: "article"
});

articleSchema.pre("save", function (next) {
    console.log(`Sauvegarde de l'article : ${this.title}`);
    next();
});

articleSchema.post("save", function (doc) {
    console.log(`Article ${doc._id} sauvegardé avec succès.`);
});


const Article = mongoose.model("Article", articleSchema);
export default Article;
