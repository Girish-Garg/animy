import express from 'express';
import clerkAuthMiddleware from '../middleware/clerkAuth.middleware.js';
import { createChat, deleteChat, getAllChats, getChat, renameChat } from '../controllers/chat.controller.js';
const router = express.Router();

router.use(clerkAuthMiddleware);

router.post('/', createChat);
router.get('/', getAllChats);
router.get('/:chatId', getChat);
router.delete('/:chatId', deleteChat);
router.patch('/:chatId/rename', renameChat);
router.post('/:chatId/generate')

export default router;