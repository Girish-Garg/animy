import express from 'express';
import login from '../controllers/login.controller.js';
import signup from '../controllers/signup.controller.js';
import signout from '../controllers/signout.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.post('/signout', authMiddleware, signout);

export default router;