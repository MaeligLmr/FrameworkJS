import express from 'express';
import { createArticle, getArticleById, getAllArticles, updateArticle, deleteArticle } from '../controller/articleController.js';

export const router = express.Router();

const auth = require('../middleware/auth');

router.use(auth.protect);
router.get('/', (req, res) => {
    getAllArticles(req, res);
});

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

// Import du router commentaires
const commentRoutes = require('./comments');

// Monter sur /:articleId/comments
router.use('/:articleId/comments', commentRoutes);


router.delete('/:id', (req, res) => {
    deleteArticle(req, res);
});

