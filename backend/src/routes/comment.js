import { protect } from '../middleware/auth.js';
import { createComment, getCommentsByArticle, getApprovedComments, updateComment, deleteComment } from '../controller/commentController.js';
import express from 'express';
// mergeParams: true permet d'accéder à articleId du parent
const router = express.Router({ mergeParams: true });

router.route('/')
    .get(getCommentsByArticle)
    .post(createComment);
router.get('/approved', getApprovedComments);

router.use(protect);


router.put('/:commentId', updateComment);

router.delete('/:commentId', deleteComment);

// /api/articles/:articleId/comments/approved


export { router };
