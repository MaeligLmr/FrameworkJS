const express = require('express');
// mergeParams: true permet d'accéder à articleId du parentconst router = express.Router({ mergeParams: true });

const {
    createComment,
    getCommentsByArticle,
    getApprovedComments
} = require('../controllers/commentController');

// /api/articles/:articleId/comments
router.route('/')
    .get(getCommentsByArticle)
    .post(createComment);

// /api/articles/:articleId/comments/approuves
router.get('/approuves', getApprovedComments);

module.exports = router;
