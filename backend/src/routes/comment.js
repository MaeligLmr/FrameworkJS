const express = require('express');
// mergeParams: true permet d'accéder à articleId du parent
const router = express.Router({ mergeParams: true });

const {
    createComment,
    getCommentsByArticle,
    getApprovedComments
} = require('../controllers/commentController');

const auth = require('../middleware/auth');
router.use(auth.protect);

// /api/articles/:articleId/comments
router.route('/')
    .get(getCommentsByArticle)
    .post(createComment);

// /api/articles/:articleId/comments/approuves
router.get('/approuved', getApprovedComments);

module.exports = router;
