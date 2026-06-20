import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '@/api/dashboard';

/**
 * Loads the dashboard (chats + albums) once on mount. Returns loading/error
 * state and a refetch callback. Replaces the inline fetch-in-effect that
 * refetched on every Clerk user re-emit and had no error handling.
 */
export function useDashboard(enabled = true) {
  const [chats, setChats] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardApi.get();
      if (res.success) {
        setChats(res.chats || []);
        setAlbums(res.albums || []);
      }
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) refetch();
  }, [enabled, refetch]);

  return { chats, albums, loading, error, refetch };
}
