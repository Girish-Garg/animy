import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

vi.mock('@/api/dashboard', () => ({ dashboardApi: { get: vi.fn() } }));
vi.mock('@/api/chats', () => ({ chatsApi: { list: vi.fn() } }));
vi.mock('@/api/albums', () => ({ albumsApi: { list: vi.fn() } }));

import { dashboardApi } from '@/api/dashboard';
import { chatsApi } from '@/api/chats';
import { albumsApi } from '@/api/albums';
import { useDashboard } from './useDashboard';
import { useChats } from './useChats';
import { useAlbums } from './useAlbums';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useDashboard', () => {
  it('loads chats and albums', async () => {
    dashboardApi.get.mockResolvedValue({ success: true, chats: [{ _id: 'c1' }], albums: [] });
    const { result } = renderHook(() => useDashboard());
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.chats).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it('captures errors and stops loading', async () => {
    dashboardApi.get.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useDashboard());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe('useChats', () => {
  it('returns normalized chat summaries', async () => {
    chatsApi.list.mockResolvedValue({
      success: true,
      chats: [{ _id: 'c1', title: 'T', createdAt: 'd' }],
    });
    const { result } = renderHook(() => useChats());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.chats).toEqual([{ id: 'c1', title: 'T', createdAt: 'd' }]);
  });
});

describe('useAlbums', () => {
  it('returns normalized albums', async () => {
    albumsApi.list.mockResolvedValue({
      success: true,
      albums: [{ _id: 'a1', albumName: 'A', videos: [] }],
    });
    const { result } = renderHook(() => useAlbums());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.albums).toEqual([
      { id: 'a1', name: 'A', videos: [], createdAt: undefined, updatedAt: undefined },
    ]);
  });

  it('does not fetch when disabled', () => {
    renderHook(() => useAlbums(false));
    expect(albumsApi.list).not.toHaveBeenCalled();
  });
});
