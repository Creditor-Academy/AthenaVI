import { dashboardPathForSection, resolveDashboardSectionFromPath } from './dashboardRouting.js';

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

export function getInboxNotificationCategory(notification) {
  return String(notification?.category || '').toLowerCase();
}

export function getInboxNotificationType(notification) {
  return String(
    notification?.type || notification?.eventType || notification?.kind || ''
  ).toLowerCase();
}

/** Client-side category filter (API may return all items regardless of category param). */
export function notificationMatchesInboxCategory(notification, categoryId) {
  if (!categoryId) return true;

  const category = getInboxNotificationCategory(notification);
  const type = getInboxNotificationType(notification);

  switch (categoryId) {
    case 'comments':
      return isCollaboratorInboxNotification(notification);
    case 'videos':
      return (
        category === 'videos' ||
        type.includes('video') ||
        type.includes('export') ||
        type.includes('render')
      );
    case 'credits':
      return category === 'credits' || type.includes('credit');
    case 'storage':
      return category === 'storage' || type.includes('storage');
    case 'workspace':
      return isWorkspaceNotification(category, type);
    case 'platform':
      return category === 'platform' || type.includes('platform');
    default:
      return category === categoryId;
  }
}

export function filterInboxNotificationsByCategory(notifications, categoryId) {
  if (!categoryId) return notifications || [];
  return (notifications || []).filter((notification) =>
    notificationMatchesInboxCategory(notification, categoryId)
  );
}

export const INBOX_CATEGORY_EMPTY_STATE = {
  comments: {
    title: 'No comments',
    message: 'Collaborator comments and @mentions will appear here.',
  },
  videos: {
    title: 'No video alerts',
    message: 'Export and render updates will appear here.',
  },
  credits: {
    title: 'No credit alerts',
    message: 'Credit balance updates will appear here.',
  },
  storage: {
    title: 'No storage alerts',
    message: 'Storage usage updates will appear here.',
  },
  workspace: {
    title: 'No workspace alerts',
    message: 'Team and workspace activity will appear here.',
  },
  platform: {
    title: 'No platform alerts',
    message: 'Platform announcements will appear here.',
  },
};

export function getInboxEmptyState(categoryFilter, unreadOnly) {
  if (categoryFilter && INBOX_CATEGORY_EMPTY_STATE[categoryFilter]) {
    return INBOX_CATEGORY_EMPTY_STATE[categoryFilter];
  }
  if (unreadOnly) {
    return { title: 'No unread notifications', message: 'You are all caught up.' };
  }
  if (categoryFilter) {
    const label = formatInboxCategory(categoryFilter).toLowerCase();
    return { title: `No ${label} alerts`, message: 'Nothing in this category yet.' };
  }
  return {
    title: 'No notifications',
    message: 'Activity from exports, credits, storage, and your workspace will appear here.',
  };
}

export function countUnreadUserFacingInboxNotifications(notifications) {
  return filterUserFacingInboxNotifications(notifications).filter(isInboxNotificationUnread).length;
}

function readNotificationMetaValue(meta, ...keys) {
  for (const key of keys) {
    const value = meta?.[key];
    if (value != null && value !== '') return value;
  }
  return null;
}

function buildEditorConfigFromMeta(meta = {}, overrides = {}) {
  const projectId = readNotificationMetaValue(meta, 'projectId', 'videoId', 'project_id', 'video_id');
  const workspaceId = readNotificationMetaValue(meta, 'workspaceId', 'workspace_id');
  const folderId = readNotificationMetaValue(meta, 'folderId', 'folder_id');
  const commentId = readNotificationMetaValue(meta, 'commentId', 'comment_id');
  const openComments =
    overrides.openComments ??
    (
      meta.openComments === true ||
      meta.comments === true ||
      meta.comments === '1' ||
      Boolean(commentId)
    );

  if (!projectId && !openComments) return null;

  return {
    videoId: projectId || undefined,
    workspaceId: workspaceId || undefined,
    folderId: folderId || undefined,
    openComments,
    highlightCommentId: commentId || null,
    ...overrides,
  };
}

function isCreditsNotification(category, type) {
  return category === 'credits' || category === 'storage' || type.includes('credit') || type.includes('storage');
}

function isWorkspaceNotification(category, type) {
  return (
    category === 'workspace' ||
    type.includes('workspace') ||
    type.includes('team') ||
    type.includes('invite')
  );
}

/** Teammate project comments and @mentions — not workspace/team membership alerts. */
export function isCollaboratorInboxNotification(notification) {
  if (!notification) return false;

  const category = getInboxNotificationCategory(notification);
  const type = getInboxNotificationType(notification);
  const meta = notification?.metadata || {};
  const title = String(notification?.title || '').toLowerCase();
  const message = String(notification?.message || notification?.body || '').toLowerCase();

  const looksLikeTeamAlert =
    isWorkspaceNotification(category, type) ||
    type.includes('workspace_invitation') ||
    type.includes('invitation') ||
    type.includes('member_join') ||
    type.includes('member_leave') ||
    type.includes('member_removed') ||
    type.includes('member_added') ||
    type.includes('role_change') ||
    type.includes('collaborator_invite') ||
    title.includes('invited you') ||
    title.includes('joined the workspace') ||
    title.includes('removed from') ||
    title.includes('role updated') ||
    message.includes('invited you to') ||
    message.includes('joined the workspace');

  if (looksLikeTeamAlert) return false;

  const isCollaboratorCategory =
    category === 'comments' ||
    category === 'collaborators' ||
    category === 'collaborator';

  const isCommentEventType =
    type.includes('project_comment') ||
    type.includes('comment_created') ||
    type.includes('comment_added') ||
    type.includes('comment_replied') ||
    type.includes('user_mentioned') ||
    type.includes('mention') ||
    type === 'comment' ||
    type.endsWith('_comment');

  const hasProjectCommentContext = Boolean(
    readNotificationMetaValue(meta, 'projectId', 'videoId', 'project_id', 'video_id')
  );

  if (isCollaboratorCategory) return true;
  if (isCommentEventType && hasProjectCommentContext) return true;

  return false;
}

/** Resolve where a notification should navigate (editor, dashboard section, or external URL). */
export function resolveNotificationDestination(notification) {
  if (!notification) return null;

  const meta = notification.metadata || {};
  const category = String(notification.category || '').toLowerCase();
  const type = String(
    notification.type || notification.eventType || notification.kind || ''
  ).toLowerCase();

  if (isCreditsNotification(category, type)) {
    return { type: 'dashboard', section: 'credits', settingsTab: 'billing' };
  }

  if (isWorkspaceNotification(category, type)) {
    return { type: 'dashboard', section: 'workspace' };
  }

  const actionUrl = readNotificationMetaValue(meta, 'actionUrl', 'url', 'link', 'href');
  if (actionUrl) {
    return parseNotificationActionUrl(actionUrl);
  }

  const editorConfig = buildEditorConfigFromMeta(meta);

  if (isCollaboratorInboxNotification(notification)) {
    if (editorConfig?.videoId) {
      return { type: 'create', config: { ...editorConfig, openComments: true } };
    }
    return { type: 'dashboard', section: 'workspace' };
  }

  if (
    category === 'comments' ||
    type.includes('comment') ||
    type.includes('mention')
  ) {
    if (editorConfig?.videoId) {
      return { type: 'create', config: { ...editorConfig, openComments: true } };
    }
    return { type: 'dashboard', section: 'workspace' };
  }

  if (
    category === 'videos' ||
    type.includes('video') ||
    type.includes('export') ||
    type.includes('render')
  ) {
    if (editorConfig?.videoId) {
      return { type: 'create', config: editorConfig };
    }
    return { type: 'dashboard', section: 'videos' };
  }

  if (category === 'platform' || type.includes('platform')) {
    return { type: 'dashboard', section: 'settings', settingsTab: 'notifications' };
  }

  return { type: 'dashboard', section: 'home' };
}

export function parseNotificationActionUrl(actionUrl) {
  if (!actionUrl) return null;

  try {
    const target = new URL(actionUrl, window.location.origin);
    if (target.origin !== window.location.origin) {
      return { type: 'external', url: actionUrl };
    }

    const path = `${target.pathname}${target.search}${target.hash}`;

    if (target.pathname === '/create' || target.pathname.startsWith('/create/')) {
      const deepLink = parseProjectCommentsDeepLink(path);
      const params = target.searchParams;
      const config = buildEditorConfigFromMeta(
        {
          projectId: params.get('projectId'),
          workspaceId: params.get('workspaceId'),
          folderId: params.get('folderId'),
          commentId: params.get('commentId'),
          comments: params.get('comments'),
        },
        {
          openComments: deepLink?.openComments,
          highlightCommentId: deepLink?.highlightCommentId,
        }
      );
      return { type: 'create', config: config || {} };
    }

    const section = resolveDashboardSectionFromPath(target.pathname, target.hash);
    if (section) {
      if (section === 'credits') {
        return { type: 'dashboard', section: 'credits', settingsTab: 'billing' };
      }
      if (section === 'workspace') {
        return { type: 'dashboard', section: 'workspace' };
      }
      const destination = { type: 'dashboard', section };
      if (section === 'settings') {
        const tab = target.searchParams.get('tab');
        if (tab === 'billing') {
          return { type: 'dashboard', section: 'credits', settingsTab: 'billing' };
        }
        if (tab) destination.settingsTab = tab;
      }
      return destination;
    }

    return { type: 'path', path };
  } catch {
    return { type: 'external', url: actionUrl };
  }
}

function dispatchClientNavigation(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new CustomEvent('athena:navigation', { detail: { path } }));
}

/** Navigate to a notification destination using app callbacks when available. */
export function navigateToNotification(notification, handlers = {}) {
  const destination = resolveNotificationDestination(notification);
  if (!destination) return false;

  const { onOpenEditor, onGoToSection } = handlers;

  switch (destination.type) {
    case 'create': {
      if (onOpenEditor) {
        onOpenEditor(destination.config || {});
        return true;
      }
      const params = new URLSearchParams();
      const config = destination.config || {};
      if (config.videoId) params.set('projectId', config.videoId);
      if (config.workspaceId) params.set('workspaceId', config.workspaceId);
      if (config.folderId) params.set('folderId', config.folderId);
      if (config.openComments) params.set('comments', '1');
      if (config.highlightCommentId) params.set('commentId', config.highlightCommentId);
      dispatchClientNavigation(`/create?${params.toString()}`);
      return true;
    }

    case 'dashboard': {
      if (onGoToSection) {
        onGoToSection(destination.section, { settingsTab: destination.settingsTab });
        return true;
      }
      dispatchClientNavigation(dashboardPathForSection(destination.section));
      window.dispatchEvent(
        new CustomEvent('athena:dashboard-navigate', {
          detail: { section: destination.section, settingsTab: destination.settingsTab },
        })
      );
      return true;
    }

    case 'external':
      window.open(destination.url, '_blank', 'noopener,noreferrer');
      return true;

    case 'path':
      dispatchClientNavigation(destination.path);
      return true;

    default:
      return false;
  }
}

/** Navigate to a notification action URL (same-origin path or full URL). */
export function openNotificationActionUrl(actionUrl) {
  if (!actionUrl) return;
  navigateToNotification({ metadata: { actionUrl } });
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
