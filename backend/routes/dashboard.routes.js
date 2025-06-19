import express from 'express';
import dashboard from '../controllers/dashboard.controller.js';
import clerkAuthMiddleware from '../middleware/clerkAuth.middleware.js';

const router = express.Router();

router.get('/dashboard', clerkAuthMiddleware, dashboard);

export default router;