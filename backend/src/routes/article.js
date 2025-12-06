import express from 'express';
import { createArticle, getArticleById, getAllArticles, updateArticle, deleteArticle, publishArticle, unpublishArticle } from '../controller/articleController.js';
import { protect } from '../middleware/auth.js';
import {router as commentRoutes} from './comment.js';

const router = express.Router();


router.get('/', (req, res) => {
    getAllArticles(req, res);
});

router.use(protect);

router.get('/:id', (req, res) => {
    getArticleById(req, res);
});

router.post('/', (req, res) => {
    createArticle(req, res);
});

router.put('/:id', (req, res) => {
    updateArticle(req, res);
});

router.patch('/:id/publish', (req, res) => {
    publishArticle(req, res);
});

router.patch('/:id/unpublish', (req, res) => {
    unpublishArticle(req, res);
});


// Monter sur /:articleId/comments
router.use('/:articleId/comments', commentRoutes);


router.delete('/:id', (req, res) => {
    deleteArticle(req, res);
});

export { router };