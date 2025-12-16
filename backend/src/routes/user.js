import express from 'express';
import { getUserProfile, updateUserProfile, changePassword } from '../controller/userController.js';
import { protect } from '../middleware/auth.js';
import { uploadAvatarImage } from '../config/cloudinary.js';

const router = express.Router();

// All user routes require authentication
router.use(protect);

// Get user profile
router.get('/profile', getUserProfile);

// Update user profile
router.put('/profile', uploadAvatarImage('avatar'), updateUserProfile);

// Change password
router.put('/change-password', changePassword);

export default router;
