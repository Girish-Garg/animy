import express from 'express';
import clerkAuthMiddleware from '../middleware/clerkAuth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { createChat, deleteChat, getAllChats, getChat, renameChat } from '../controllers/chat.controller.js';
import { generateVideo, getVideoStatus, killStatus } from '../controllers/generate.controller.js';
import { 
    createChatSchema, 
    chatParamsSchema, 
    updateChatTitleSchema,
    generateVideoSchema,
    getVideoStatusSchema,
    killStatusSchema
} from '../utils/zod.validation.js';

const router = express.Router();

router.use(clerkAuthMiddleware);

router.post('/', validateRequest(createChatSchema), createChat);
router.get('/', getAllChats);
router.get('/:chatId', validateRequest(chatParamsSchema), getChat);
router.delete('/:chatId', validateRequest(chatParamsSchema), deleteChat);
router.patch('/:chatId/rename', validateRequest(updateChatTitleSchema), renameChat);
router.post('/:chatId/generate', validateRequest(generateVideoSchema), generateVideo);
router.get('/:chatId/status/:promptId', validateRequest(getVideoStatusSchema), getVideoStatus);
router.post('/:chatId/kill/:promptId', validateRequest(killStatusSchema), killStatus);

export default router;