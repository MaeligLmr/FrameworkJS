import express from 'express';
import { createArticle, getArticleById, getAllArticles, updateArticle, deleteArticle, publishArticle, unpublishArticle, getCountArticlesByAuthor, getViewsByAuthor } from '../controller/articleController.js';
import { uploadImage } from '../config/cloudinary.js';
import { partialProtect, protect } from '../middleware/auth.js';
import {router as commentRoutes} from './comment.js';

const router = express.Router();

router.get('/', partialProtect, getAllArticles);

router.get('/author/count/:authorId', protect, getCountArticlesByAuthor);
router.get('/author/views/:authorId', protect, getViewsByAuthor);

router.use('/:articleId/comments', commentRoutes);

router.get('/:id', partialProtect, getArticleById);

router.post('/', protect, uploadImage('image'), createArticle);

router.put('/:id', protect, uploadImage('image'), updateArticle);

router.patch('/:id/publish', protect, publishArticle);
router.patch('/:id/unpublish', protect, unpublishArticle);

router.delete('/:id', protect, deleteArticle);

export { router };