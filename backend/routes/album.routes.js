import express from 'express';
import { createAlbum, addToAlbum, getAlbum, deleteAlbum, deleteFromAlbum, renameAlbum, getAllAlbums, editVideoName } from '../controllers/album.controller.js';
import clerkAuthMiddleware from '../middleware/clerkAuth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { 
    createAlbumSchema, 
    addToAlbumSchema, 
    albumParamsSchema, 
    albumVideoParamsSchema,
    updateAlbumNameSchema,
    updateVideoNameSchema
} from '../utils/zod.validation.js';

const router = express.Router();

router.use(clerkAuthMiddleware);

router.post('/', validateRequest(createAlbumSchema), createAlbum);
router.get('/', getAllAlbums);
router.patch('/:albumId/video', validateRequest(addToAlbumSchema), addToAlbum);
router.get('/:albumId', validateRequest(albumParamsSchema), getAlbum);
router.delete('/:albumId', validateRequest(albumParamsSchema), deleteAlbum);
router.delete('/:albumId/video/:videoId', validateRequest(albumVideoParamsSchema), deleteFromAlbum);
router.patch('/:albumId/rename', validateRequest(updateAlbumNameSchema), renameAlbum);
router.patch('/:albumId/video/:videoId/rename', validateRequest(updateVideoNameSchema), editVideoName);

export default router;