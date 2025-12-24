/**
 * Contrôleur des utilisateurs
 * Gère les opérations sur les profils utilisateur :
 * - Récupération de profil (soi-même ou autre utilisateur)
 * - Mise à jour du profil avec upload d'avatar
 * - Changement de mot de passe avec vérification
 */

import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import cloudinary from "../config/cloudinary.js";

/**
 * Récupère le profil de l'utilisateur connecté
 * @route GET /api/users/me
 */
export const getUserProfile = async (req, res, next) => {
    try {
        // Récupération de l'ID depuis le token JWT
        const userId = req.user?._id;
        if (!userId) {
            return next(new AppError('Utilisateur non authentifié', 401, ['Authentification requise']));
        }

        // Récupération de l'utilisateur sans le mot de passe
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return next(new AppError('Utilisateur non trouvé', 404, ['Utilisateur non trouvé']));
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(AppError.from(err));
    }
};

/**
 * Récupère le profil d'un utilisateur par son ID
 * Accessible publiquement pour afficher les profils d'auteurs
 * @route GET /api/users/:id
 */
export const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-password');
        if (!user) {
            return next(new AppError('Utilisateur non trouvé', 404, ['Utilisateur non trouvé']));
        }
        return res.status(200).json({ success: true, data: user });
    } catch (err) {
        next(AppError.from(err));
    }
};

/**
 * Met à jour le profil de l'utilisateur connecté
 * Permet de modifier username, nom, prénom, email et avatar
 * Gère l'upload et la suppression d'avatar via Cloudinary
 * @route PUT /api/users/me
 */
export const updateUserProfile = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return next(new AppError('Utilisateur non authentifié', 401, ['Authentification requise']));
        }

        const user = await User.findById(userId);
        if (!user) {
            return next(new AppError('Utilisateur non trouvé', 404, ['Utilisateur non trouvé']));
        }

        // Construction d'un objet avec uniquement les champs fournis
        const { username, firstname, lastname, email } = req.body;
        const updates = {};
        
        if (username !== undefined) updates.username = username;
        if (firstname !== undefined) updates.firstname = firstname;
        if (lastname !== undefined) updates.lastname = lastname;
        if (email !== undefined) updates.email = email;

        // Gestion de l'upload d'avatar
        if (req.file) {
            // Suppression de l'ancien avatar sur Cloudinary si présent
            if (user.avatarPublicId) {
                try {
                    await cloudinary.uploader.destroy(user.avatarPublicId);
                } catch (deleteErr) {
                    console.error('Erreur suppression ancien avatar:', deleteErr);
                }
            }
            // Mise à jour avec les URLs Cloudinary
            updates.avatar = req.file.path;
            updates.avatarPublicId = req.file.filename;
            updates.avatarImageName = req.file.originalname;
        }

        // Mise à jour avec validation Mongoose
        const updatedUser = await User.findByIdAndUpdate(userId, updates, { 
            new: true, 
            runValidators: true 
        }).select('-password');

        res.status(200).json({
            success: true,
            message: 'Profil mis à jour avec succès',
            data: updatedUser
        });
    } catch (err) {
        next(AppError.from(err));
    }
};

/**
 * Change le mot de passe de l'utilisateur connecté
 * Vérifie le mot de passe actuel, la correspondance du nouveau mot de passe
 * et les critères de sécurité minimaux (6 caractères)
 * @route PUT /api/users/me/password
 */
export const changePassword = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return next(new AppError('Utilisateur non authentifié', 401, ['Authentification requise']));
        }

        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validation de la présence de tous les champs
        if (!currentPassword || !newPassword || !confirmPassword) {
            return next(new AppError('Tous les champs sont obligatoires', 400, ['Tous les champs sont obligatoires']));
        }

        // Vérification de la correspondance des nouveaux mots de passe
        if (newPassword !== confirmPassword) {
            return next(new AppError('Les mots de passe ne correspondent pas', 400, ['Les mots de passe ne correspondent pas']));
        }

        // Validation de la longueur minimale
        if (newPassword.length < 6) {
            return next(new AppError('Le mot de passe doit contenir au moins 6 caractères', 400, ['Le mot de passe doit contenir au moins 6 caractères']));
        }

        const user = await User.findById(userId);
        if (!user) {
            return next(new AppError('Utilisateur non trouvé', 404, ['Utilisateur non trouvé']));
        }

        // Vérification du mot de passe actuel via bcrypt
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            return next(new AppError('Le mot de passe actuel est incorrect', 401, ['Le mot de passe actuel est incorrect']));
        }

        // Mise à jour du mot de passe (sera hashé par le middleware pre-save)
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Mot de passe changé avec succès'
        });
    } catch (err) {
        next(AppError.from(err));
    }
};

