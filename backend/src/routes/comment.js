import { protect } from '../middleware/auth.js';
import { createComment, getCommentsByArticle, getApprovedComments, updateComment, deleteComment } from '../controller/commentController.js';
import express from 'express';
// mergeParams: true permet d'accéder à articleId du parent
const router = express.Router({ mergeParams: true });


router.use(protect);

// /api/articles/:articleId/comments
router.route('/')
    .get(getCommentsByArticle)
    .post(createComment);

router.put('/:commentId', updateComment);

router.delete('/:commentId', deleteComment);

// /api/articles/:articleId/comments/approved
router.get('/approved', getApprovedComments);

export { router };
