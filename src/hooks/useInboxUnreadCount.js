import { useCallback, useEffect, useState } from 'react';
import inboxService from '../services/inboxService.js';
import { countUnreadUserFacingInboxNotifications } from '../utils/inboxNotifications.js';

const POLL_INTERVAL_MS = 60_000;
const UNREAD_LIST_LIMIT = 100;

export function useInboxUnreadCount({ enabled = true, poll = true } = {}) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [byCategory, setByCategory] = useState({});
  const [loading, setLoading] = useState(Boolean(enabled));

  const refresh = useCallback(async () => {
    if (!enabled) return 0;
    try {
      const [countData, listData] = await Promise.all([
        inboxService.getUnreadCount(),
        inboxService.listNotifications({ limit: UNREAD_LIST_LIMIT }),
      ]);

      const visibleUnread = countUnreadUserFacingInboxNotifications(listData.notifications || []);
      setUnreadCount(visibleUnread);
      setByCategory(countData.byCategory || {});
      return visibleUnread;
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
