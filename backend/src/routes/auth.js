import express from 'express';
const router = express.Router();
import * as authController from '../controller/authController.js';
import { protect } from '../middleware/auth.js';
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

router.use(protect);

router.get('/verify', authController.verifyToken);
export {router};