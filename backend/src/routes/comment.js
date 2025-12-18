import { protect } from '../middleware/auth.js';
import { createComment, getCommentsByArticle, getApprovedComments, updateComment, deleteComment, getCountCommentsByAuthor } from '../controller/commentController.js';
import express from 'express';
// mergeParams: true permet d'accéder à articleId du parent
const router = express.Router({ mergeParams: true });

router.route('/')
    .get(getCommentsByArticle);
router.get('/approved', getApprovedComments);

router.use(protect);

router.post('/', createComment);

router.get('/author/count/:authorId', getCountCommentsByAuthor);

router.put('/:commentId', updateComment);

router.delete('/:commentId', deleteComment);

// /api/articles/:articleId/comments/approved


export { router };
