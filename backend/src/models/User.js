/**
 * Modèle User
 * Représente un utilisateur de l'application avec authentification
 * Gère le hashage automatique des mots de passe et la réinitialisation par email
 * Champs principaux : username, email, password, avatar
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const userSchema = new mongoose.Schema(
    {
        // ============== INFORMATIONS UTILISATEUR ==============
        /** Nom d'utilisateur unique (affiché publiquement) */
        username: {
            type: String,
            required: [true, 'Le nom d\'utilisateur est obligatoire'],
            unique: true,
            trim: true,
            maxlength: [50, 'Le nom d\'utilisateur ne peut pas dépasser 50 caractères']
        },
        /** Prénom de l'utilisateur */
        firstname: {
            type: String,
            required: [true, 'Le prénom est obligatoire'],
            trim: true,
            maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères']
        },
        /** Nom de famille de l'utilisateur */
        lastname: {
            type: String,
            required: [true, 'Le nom est obligatoire'],
            trim: true,
            maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
        },
        /** Adresse email unique (utilisée pour la connexion) */
        email: {
            type: String,
            required: [true, 'L\'email est obligatoire'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
        },
        /** Mot de passe hashé avec bcrypt (minimum 6 caractères) */
        password: {
            type: String,
            required: [true, 'Le mot de passe est obligatoire'],
            minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères']
        },
        // ============== RÉINITIALISATION MOT DE PASSE ==============
        /** Token cryptographique pour réinitialiser le mot de passe */
        resetPasswordToken: {
            type: String,
            default: null
        },
        /** Date d'expiration du token de réinitialisation (1h après génération) */
        resetPasswordExpires: {
            type: Date,
            default: null
        },
        // ============== AVATAR ==============
        /** URL de l'image avatar (stockée sur Cloudinary) */
        avatar: {
            type: String,
            default: null
        },
        /** ID public Cloudinary pour suppression de l'ancien avatar */
        avatarPublicId: {
            type: String,
            default: null
        },
        /** Nom du fichier original de l'avatar */
        avatarImageName: {
            type: String,
            default: null
        }
    },
    {
        // Ajoute automatiquement createdAt et updatedAt
        timestamps: true
    }
);

// ============== MIDDLEWARE ==============

/**
 * Hook pre-save : Hash le mot de passe avant de sauvegarder
 * Utilise bcrypt avec un salt de 10 rounds
 * Ne hash que si le mot de passe a été modifié (évite le double hashage)
 */
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ============== MÉTHODES D'INSTANCE ==============

/**
 * Compare un mot de passe en clair avec le hash stocké
 * @param {string} candidatePassword - Le mot de passe à vérifier
 * @returns {Promise<boolean>} - true si le mot de passe correspond
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ============== CHAMPS VIRTUELS ==============

/**
 * Relation virtuelle vers les articles de l'utilisateur
 * Permet de faire un populate('articles') sur un document User
 */
userSchema.virtual('articles', {
    ref: 'Article',
    localField: '_id',
    foreignField: 'author'
});

const User = mongoose.model('User', userSchema);
export default User;