import { describe, it, expect } from 'vitest';
import { normalizeChatSummary, normalizeVideo, normalizeAlbum } from './normalize';

describe('normalizeChatSummary', () => {
  it('maps _id to id and keeps title/createdAt', () => {
    expect(normalizeChatSummary({ _id: 'c1', title: 'Hi', createdAt: 'd' })).toEqual({
      id: 'c1',
      title: 'Hi',
      createdAt: 'd',
    });
  });
});

describe('normalizeVideo', () => {
  it('maps backend video fields to the client shape', () => {
    expect(
      normalizeVideo({ _id: 'v1', videoPath: '/p.mp4', name: 'My Vid', thumbnailPath: '/t.png' })
    ).toEqual({ id: 'v1', path: '/p.mp4', title: 'My Vid', thumbnailPath: '/t.png' });
  });

  it('uses the backend _id rather than a random key', () => {
    expect(normalizeVideo({ _id: 'v1', videoPath: '/p', name: 'n', thumbnailPath: '/t' }).id).toBe('v1');
  });
});

describe('normalizeAlbum', () => {
  it('maps albumName to name and normalizes nested videos', () => {
    const album = {
      _id: 'a1',
      albumName: 'Favorites',
      videos: [{ _id: 'v1', videoPath: '/p', name: 'n', thumbnailPath: '/t' }],
      createdAt: 'c',
      updatedAt: 'u',
    };
    expect(normalizeAlbum(album)).toEqual({
      id: 'a1',
      name: 'Favorites',
      videos: [{ id: 'v1', path: '/p', title: 'n', thumbnailPath: '/t' }],
      createdAt: 'c',
      updatedAt: 'u',
    });
  });

  it('defaults videos to an empty array when missing', () => {
    expect(normalizeAlbum({ _id: 'a1', albumName: 'x' }).videos).toEqual([]);
  });
});
