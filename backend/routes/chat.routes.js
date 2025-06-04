import express from 'express';
import chat from '../controllers/chat.controller.js';
import newChat from '../controllers/newChat.controller.js';
import prompt from '../controllers/prompt.controller.js';
const router = express.Router();

router.get('/:chatId', chat);
router.post('/:chatId/prompt', prompt);
router.post('/:chatId/new', newChat);

export default router;