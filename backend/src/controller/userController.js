import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import cloudinary from "../config/cloudinary.js";

export const getUserProfile = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return next(new AppError('Utilisateur non authentifié', 401, ['Authentification requise']));
        }

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

export const updateUserProfile = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return next(new AppError('Utilisateur non authentifié', 401, ['Authentification requise']));
        }

        const user = await User.findById(userId);
        if (!user) {
            return next(new AppError('Utilisateur non trouvé', 404, ['Utilisateur non trouvé']));
        }

        const { username, firstname, lastname, email } = req.body;
        const updates = {};
        
        if (username !== undefined) updates.username = username;
        if (firstname !== undefined) updates.firstname = firstname;
        if (lastname !== undefined) updates.lastname = lastname;
        if (email !== undefined) updates.email = email;

        // Handle avatar upload
        if (req.file) {
            // Delete old avatar if exists
            if (user.avatarPublicId) {
                try {
                    await cloudinary.uploader.destroy(user.avatarPublicId);
                } catch (err) {
                    console.error('Error deleting old avatar:', err);
                }
            }
            updates.avatar = req.file.path;
            updates.avatarPublicId = req.file.filename;
            updates.avatarImageName = req.file.originalname;
        }

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

export const changePassword = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return next(new AppError('Utilisateur non authentifié', 401, ['Authentification requise']));
        }

        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return next(new AppError('Tous les champs sont obligatoires', 400, ['Tous les champs sont obligatoires']));
        }

        if (newPassword !== confirmPassword) {
            return next(new AppError('Les mots de passe ne correspondent pas', 400, ['Les mots de passe ne correspondent pas']));
        }

        if (newPassword.length < 6) {
            return next(new AppError('Le mot de passe doit contenir au moins 6 caractères', 400, ['Le mot de passe doit contenir au moins 6 caractères']));
        }

        const user = await User.findById(userId);
        if (!user) {
            return next(new AppError('Utilisateur non trouvé', 404, ['Utilisateur non trouvé']));
        }

        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            return next(new AppError('Le mot de passe actuel est incorrect', 401, ['Le mot de passe actuel est incorrect']));
        }

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

