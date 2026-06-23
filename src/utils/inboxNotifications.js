export function formatInboxRelativeTime(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(diff) || diff < 0) return '';
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Navigate to a notification action URL (same-origin path or full URL). */
export function openNotificationActionUrl(actionUrl) {
  if (!actionUrl) return;

  try {
    const target = new URL(actionUrl, window.location.origin);
    if (target.origin === window.location.origin) {
      const path = `${target.pathname}${target.search}${target.hash}`;
      if (window.location.pathname.startsWith('/dashboard') || window.location.hash) {
        window.location.hash = path.startsWith('/') ? path : `/${path}`;
      } else {
        window.location.assign(path);
      }
      return;
    }
  } catch {
    // fall through
  }

  window.open(actionUrl, '_blank', 'noopener,noreferrer');
}

export function isInboxNotificationUnread(notification) {
  return notification?.readAt == null;
}
