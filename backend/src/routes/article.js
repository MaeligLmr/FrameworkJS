import express from 'express';
import { createArticle, getArticleById, getAllArticles, updateArticle, deleteArticle, publishArticle, unpublishArticle, getCountArticlesByAuthor, getViewsByAuthor } from '../controller/articleController.js';
import { uploadImage } from '../config/cloudinary.js';
import { protect } from '../middleware/auth.js';
import {router as commentRoutes} from './comment.js';

const router = express.Router();


router.get('/', (req, res) => {
    getAllArticles(req, res);
});

router.get('/:id', (req, res) => {
    getArticleById(req, res);
});

router.use('/:articleId/comments', commentRoutes);


router.use(protect);


router.get('/author/count/:authorId', (req, res) => {
    getCountArticlesByAuthor(req, res);
});

router.get('/author/views/:authorId', (req, res) => {
    getViewsByAuthor(req, res);
});
router.post('/', uploadImage('image'), (req, res) => {
    createArticle(req, res);
});

router.put('/:id', uploadImage('image'), (req, res) => {
    updateArticle(req, res);
});

router.patch('/:id/publish', (req, res) => {
    publishArticle(req, res);
});

router.patch('/:id/unpublish', (req, res) => {
    unpublishArticle(req, res);
});


router.delete('/:id', (req, res) => {
    deleteArticle(req, res);
});

export { router };