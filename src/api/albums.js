import { apiUtils } from '@/lib/apiClient';

// Single source of truth for the album endpoints. Paths use no trailing slash
// consistently (the old code mixed '/album' and '/album/').
export const albumsApi = {
  list: () => apiUtils.get('/album').then((r) => r.data),
  get: (albumId) => apiUtils.get(`/album/${albumId}`).then((r) => r.data),
  create: (albumName) => apiUtils.post('/album', { albumName }).then((r) => r.data),
  remove: (albumId) => apiUtils.delete(`/album/${albumId}`).then((r) => r.data),
  addVideo: (albumId, payload) => apiUtils.patch(`/album/${albumId}/video`, payload).then((r) => r.data),
  removeVideo: (albumId, videoId) =>
    apiUtils.delete(`/album/${albumId}/video/${videoId}`).then((r) => r.data),
  rename: (albumId, newAlbumName) =>
    apiUtils.patch(`/album/${albumId}/rename`, { newAlbumName }).then((r) => r.data),
  renameVideo: (albumId, videoId, newVideoName) =>
    apiUtils.patch(`/album/${albumId}/video/${videoId}/rename`, { newVideoName }).then((r) => r.data),
};
