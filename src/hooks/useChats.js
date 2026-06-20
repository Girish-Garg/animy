import { useState, useEffect, useCallback } from 'react';
import { chatsApi } from '@/api/chats';
import { normalizeChatSummary } from '@/api/normalize';

/**
 * Loads the user's chat list as normalized summaries ({ id, title, createdAt }).
 * Exposes setChats so callers can optimistically update after rename/delete.
 */
export function useChats(enabled = true) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await chatsApi.list();
      if (res.success) setChats((res.chats || []).map(normalizeChatSummary));
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) refetch();
  }, [enabled, refetch]);

  return { chats, setChats, loading, error, refetch };
}
