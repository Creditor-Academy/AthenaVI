export const INBOX_CATEGORIES = [
  { id: '', label: 'All' },
  { id: 'videos', label: 'Videos' },
  { id: 'credits', label: 'Credits' },
  { id: 'storage', label: 'Storage' },
  { id: 'workspace', label: 'Workspace' },
  { id: 'comments', label: 'Comments' },
  { id: 'platform', label: 'Platform' },
];

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

export function formatInboxCategory(category) {
  const labels = {
    videos: 'Videos',
    credits: 'Credits',
    storage: 'Storage',
    workspace: 'Workspace',
    comments: 'Comments',
    platform: 'Platform',
  };
  return labels[String(category || '').toLowerCase()] || category || '';
}

/** Early-access admin alerts belong in the superadmin portal, not the user inbox popover. */
export function isEarlyAccessInboxNotification(notification) {
  if (!notification) return false;

  const type = String(
    notification.type || notification.eventType || notification.kind || ''
  ).toLowerCase();
  const category = String(notification.category || '').toLowerCase();
  const title = String(notification.title || '').toLowerCase();
  const message = String(notification.message || notification.body || '').toLowerCase();
  const actionUrl = String(notification.metadata?.actionUrl || '').toLowerCase();

  if (type.includes('early_access') || type.includes('early-access')) return true;
  if (category === 'early_access' || category === 'early-access') return true;
  if (actionUrl.includes('/early-access')) return true;
  if (title.includes('early access') && title.includes('request')) return true;
  if (message.includes('early access request')) return true;

  return false;
}

export function filterUserFacingInboxNotifications(notifications) {
  return (notifications || []).filter((notification) => !isEarlyAccessInboxNotification(notification));
}

export function countUnreadUserFacingInboxNotifications(notifications) {
  return filterUserFacingInboxNotifications(notifications).filter(isInboxNotificationUnread).length;
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
      window.dispatchEvent(new CustomEvent('athena:navigation', { detail: { path } }));
      return;
    }
  } catch {
    // fall through
  }

  window.open(actionUrl, '_blank', 'noopener,noreferrer');
}

/** Parse editor comment deep-link query params from the current URL or an action URL. */
export function parseProjectCommentsDeepLink(href = window.location.href) {
  try {
    const url = new URL(href, window.location.origin);
    let params = url.searchParams;

    const hash = url.hash || '';
    if (hash.includes('?')) {
      const hashQuery = hash.split('?').slice(1).join('?').split('#')[0];
      params = new URLSearchParams(hashQuery);
    }

    const projectId = params.get('projectId');
    const workspaceId = params.get('workspaceId');
    const openComments =
      params.get('comments') === '1' ||
      params.get('comments') === 'true' ||
      Boolean(params.get('commentId'));
    const highlightCommentId = params.get('commentId') || null;

    if (!projectId && !openComments) return null;

    return {
      projectId: projectId || null,
      workspaceId: workspaceId || null,
      openComments,
      highlightCommentId,
    };
  } catch {
    return null;
  }
}

/** Build a same-origin editor URL that opens the comments panel. */
export function buildCreateCommentsActionUrl({ workspaceId, projectId, commentId }) {
  const params = new URLSearchParams();
  if (projectId) params.set('projectId', projectId);
  if (workspaceId) params.set('workspaceId', workspaceId);
  params.set('comments', '1');
  if (commentId) params.set('commentId', commentId);
  return `/create?${params.toString()}`;
}

export function isInboxNotificationUnread(notification) {
  return notification?.readAt == null;
}

export function decrementUnreadCount(setter) {
  if (typeof setter !== 'function') return;
  setter((prev) => Math.max(0, (typeof prev === 'number' ? prev : 0) - 1));
}
