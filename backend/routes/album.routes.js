import express from 'express';
import { createAlbum, addToAlbum, getAlbum, deleteAlbum, deleteFromAlbum, renameAlbum, getAllAlbums } from '../controllers/album.controller';
import clerkAuthMiddleware from '../middleware/clerkAuth.middleware';
const router = express.Router();

router.use(clerkAuthMiddleware);

router.post('/', createAlbum);
router.get('/', getAllAlbums);
router.patch('/:albumId/videos', addToAlbum);
router.get('/:albumId', getAlbum);
router.delete('/:albumId', deleteAlbum);
router.delete('/:albumId/videos', deleteFromAlbum);
router.patch('/:albumId/rename', renameAlbum);

export default router;