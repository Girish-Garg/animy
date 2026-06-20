// Maps backend documents (Mongo `_id`, `albumName`, `videoPath`, ...) to the
// flatter client shape the UI uses. Centralizes the transforms that were
// previously copy-pasted across the pages/overlays, and always uses the
// backend `_id` for keys (never a random fallback).

export function normalizeChatSummary(chat) {
  return {
    id: chat._id,
    title: chat.title,
    createdAt: chat.createdAt,
  };
}

export function normalizeVideo(video) {
  return {
    id: video._id,
    path: video.videoPath,
    title: video.name,
    thumbnailPath: video.thumbnailPath,
  };
}

export function normalizeAlbum(album) {
  return {
    id: album._id,
    name: album.albumName,
    videos: Array.isArray(album.videos) ? album.videos.map(normalizeVideo) : [],
    createdAt: album.createdAt,
    updatedAt: album.updatedAt,
  };
}
