import { useCallback, useEffect, useState } from 'react';
import inboxService from '../services/inboxService.js';

const POLL_INTERVAL_MS = 60_000;

export function useInboxUnreadCount({ enabled = true, poll = true } = {}) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [byCategory, setByCategory] = useState({});
  const [loading, setLoading] = useState(Boolean(enabled));

  const refresh = useCallback(async () => {
    if (!enabled) return 0;
    try {
      const data = await inboxService.getUnreadCount();
      const count = Number(data.unreadCount ?? 0);
      setUnreadCount(count);
      setByCategory(data.byCategory || {});
      return count;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;
    refresh();
    if (!poll) return undefined;

    const id = window.setInterval(refresh, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [enabled, poll, refresh]);

  return { unreadCount, byCategory, loading, refresh, setUnreadCount };
}

export default useInboxUnreadCount;
