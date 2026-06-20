import { describe, it, expect, vi, beforeEach } from 'vitest';

const apiUtils = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));
vi.mock('@/lib/apiClient', () => ({ apiUtils }));

import { chatsApi } from './chats';
import { albumsApi } from './albums';
import { dashboardApi } from './dashboard';

beforeEach(() => {
  Object.values(apiUtils).forEach((fn) => {
    fn.mockReset();
    fn.mockResolvedValue({ data: {} });
  });
});

describe('chatsApi', () => {
  it('list() GETs /chat', async () => {
    await chatsApi.list();
    expect(apiUtils.get).toHaveBeenCalledWith('/chat');
  });

  it('get(id) GETs /chat/:id', async () => {
    await chatsApi.get('c1');
    expect(apiUtils.get).toHaveBeenCalledWith('/chat/c1');
  });

  it('generate(chatId, prompt) POSTs the prompt', async () => {
    await chatsApi.generate('c1', 'a cat');
    expect(apiUtils.post).toHaveBeenCalledWith('/chat/c1/generate', { prompt: 'a cat' });
  });

  it('kill(chatId, promptId) POSTs the kill endpoint', async () => {
    await chatsApi.kill('c1', 'p1');
    expect(apiUtils.post).toHaveBeenCalledWith('/chat/c1/kill/p1');
  });

  it('returns response.data', async () => {
    apiUtils.get.mockResolvedValueOnce({ data: { success: true, chats: [] } });
    await expect(chatsApi.list()).resolves.toEqual({ success: true, chats: [] });
  });
});

describe('albumsApi', () => {
  it('list() GETs /album with no trailing slash', async () => {
    await albumsApi.list();
    expect(apiUtils.get).toHaveBeenCalledWith('/album');
  });

  it('create(name) POSTs albumName to /album', async () => {
    await albumsApi.create('Faves');
    expect(apiUtils.post).toHaveBeenCalledWith('/album', { albumName: 'Faves' });
  });

  it('addVideo(albumId, payload) PATCHes /album/:id/video', async () => {
    const payload = { video: {}, chatId: 'c1', name: 'n' };
    await albumsApi.addVideo('a1', payload);
    expect(apiUtils.patch).toHaveBeenCalledWith('/album/a1/video', payload);
  });

  it('renameVideo PATCHes the nested rename endpoint', async () => {
    await albumsApi.renameVideo('a1', 'v1', 'new name');
    expect(apiUtils.patch).toHaveBeenCalledWith('/album/a1/video/v1/rename', { newVideoName: 'new name' });
  });
});

describe('dashboardApi', () => {
  it('get() GETs /dashboard', async () => {
    await dashboardApi.get();
    expect(apiUtils.get).toHaveBeenCalledWith('/dashboard');
  });
});
