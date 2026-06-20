import { useState, useEffect, useCallback } from 'react';
import { albumsApi } from '@/api/albums';
import { normalizeAlbum } from '@/api/normalize';

/**
 * Loads the user's albums as normalized objects. `enabled` lets overlays fetch
 * only while open. Exposes setAlbums for optimistic create/rename/delete.
 */
export function useAlbums(enabled = true) {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await albumsApi.list();
      if (res.success) setAlbums((res.albums || []).map(normalizeAlbum));
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) refetch();
  }, [enabled, refetch]);

  return { albums, setAlbums, loading, error, refetch };
}
