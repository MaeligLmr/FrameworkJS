import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

// Load env vars if not already loaded
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'articles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic'],
  },
});

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic'],
  },
});

const upload = multer({ storage });
const uploadAvatar = multer({ storage: avatarStorage });

// Wrap multer single to surface errors as HTTP 400 instead of crashing the request
export const uploadImage = (fieldName = 'image') => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: "Erreur lors de l'upload de fichier", error: err.message });
    }
    next();
  });
};

export const uploadAvatarImage = (fieldName = 'avatar') => (req, res, next) => {
  uploadAvatar.single(fieldName)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: "Erreur lors de l'upload de l'avatar", error: err.message });
    }
    next();
  });
};

export default cloudinary;
