import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Bell,
  CheckCheck,
  Coins,
  HardDrive,
  MessageSquare,
  Settings,
  Shield,
  Users,
  Video,
  X,
} from 'lucide-react';
import inboxService from '../../../services/inboxService.js';
import LoadingDots from '../LoadingDots/LoadingDots.jsx';
import InboxPopover, { InboxDetailPanel, InboxListItem } from '../InboxPopover/InboxPopover.jsx';
import { getSanitizedErrorMessage } from '../../../utils/userFacingMessage.js';
import {
  countUnreadUserFacingInboxNotifications,
  filterInboxNotificationsByCategory,
  filterUserFacingInboxNotifications,
  formatInboxCategory,
  formatInboxFullTimestamp,
  formatInboxRelativeTime,
  getInboxEmptyState,
  getNotificationActionLabel,
  INBOX_CATEGORIES,
  isInboxNotificationUnread,
  navigateToNotification,
} from '../../../utils/inboxNotifications.js';

const CATEGORY_ICONS = {
  videos: Video,
  credits: Coins,
  storage: HardDrive,
  workspace: Users,
  comments: MessageSquare,
  platform: Shield,
};

function categoryOf(notification) {
  return String(notification?.category || '').toLowerCase();
}

function NotificationsQuickModal({ onClose, onUnreadCountChange, onOpenNotificationSettings, onNavigate }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [dismissingId, setDismissingId] = useState(null);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  // Keeps the opened message visible after "Unread" filtering would hide it once read.
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);

  const syncUnreadCount = useCallback(
    (items) => {
      onUnreadCountChange?.(countUnreadUserFacingInboxNotifications(items));
    },
    [onUnreadCountChange]
  );

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch all notifications — category filtering is client-side only.
      // The API rejects some category values (e.g. comments) with 400.
      const params = { limit: 100 };
      if (unreadOnly) params.unreadOnly = true;

      const data = await inboxService.listNotifications(params);
      let visible = filterUserFacingInboxNotifications(data.notifications || []);

      if (categoryFilter) {
        visible = filterInboxNotificationsByCategory(visible, categoryFilter);
      }
      if (unreadOnly) {
        visible = visible.filter(isInboxNotificationUnread);
      }

      setNotifications(visible);

      if (!categoryFilter && !unreadOnly) {
        syncUnreadCount(filterUserFacingInboxNotifications(data.notifications || []));
      }
    } catch (err) {
      setError(getSanitizedErrorMessage(err, 'Failed to load notifications'));
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, unreadOnly, syncUnreadCount]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const emptyState = useMemo(
    () => getInboxEmptyState(categoryFilter, unreadOnly),
    [categoryFilter, unreadOnly]
  );

  const unreadCount = useMemo(
    () => notifications.filter(isInboxNotificationUnread).length,
    [notifications]
  );

  const selected = useMemo(
    () => notifications.find((item) => item.id === selectedId) || (selectedId ? selectedSnapshot : null),
    [notifications, selectedId, selectedSnapshot]
  );

  const closeDetail = useCallback(() => {
    setSelectedId(null);
    setSelectedSnapshot(null);
  }, []);

  const handleSelect = async (notification) => {
    setSelectedId(notification.id);
    setSelectedSnapshot(notification);
    if (!isInboxNotificationUnread(notification)) return;

    try {
      const updated = await inboxService.markRead(notification.id);
      const readAt = updated?.readAt ?? new Date().toISOString();
      setSelectedSnapshot((prev) => (prev?.id === notification.id ? { ...prev, readAt } : prev));
      setNotifications((prev) => {
        const next = prev.map((item) => (item.id === notification.id ? { ...item, readAt } : item));
        syncUnreadCount(next);
        return next;
      });
    } catch {
      // Opening the message still works if marking read fails.
    }
  };

  const handleOpenDestination = (notification) => {
    onClose();
    navigateToNotification(notification, onNavigate);
  };

  const handleDismiss = async (notification) => {
    if (dismissingId) return;

    setDismissingId(notification.id);
    setError('');
    try {
      await inboxService.dismiss(notification.id);
      if (selectedId === notification.id) closeDetail();
      setNotifications((prev) => {
        const next = prev.filter((item) => item.id !== notification.id);
        syncUnreadCount(next);
        return next;
      });
    } catch (err) {
      setError(getSanitizedErrorMessage(err, 'Failed to dismiss notification'));
    } finally {
      setDismissingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    setError('');
    try {
      await inboxService.markAllRead();
      const readAt = new Date().toISOString();
      setNotifications((prev) => {
        const next = prev.map((item) => ({ ...item, readAt: item.readAt || readAt }));
        syncUnreadCount(next);
        return next;
      });
    } catch (err) {
      setError(getSanitizedErrorMessage(err, 'Failed to mark notifications as read'));
    } finally {
      setMarkingAll(false);
    }
  };

  const handleOpenSettings = () => {
    onClose();
    onOpenNotificationSettings?.();
  };

  const detail = selected ? (
    <NotificationDetail
      notification={selected}
      dismissing={dismissingId === selected.id}
      onClose={closeDetail}
      onDismiss={() => handleDismiss(selected)}
      onOpen={() => handleOpenDestination(selected)}
    />
  ) : null;

  return (
    <InboxPopover
      label="Notifications"
      onClose={onClose}
      detail={detail}
      onCloseDetail={closeDetail}
      busy={loading}
    >
      <header className="inbox-pop-header">
        <h4 className="inbox-pop-title">
          Notifications
          {!loading && unreadCount > 0 && <span className="inbox-pop-count">{unreadCount} new</span>}
        </h4>
        <div className="inbox-pop-header-actions">
          {!loading && unreadCount > 0 && (
            <button
              type="button"
              className="inbox-pop-icon-btn"
              onClick={handleMarkAllRead}
              disabled={markingAll}
              aria-label="Mark all as read"
              title="Mark all as read"
            >
              <CheckCheck size={16} strokeWidth={1.85} />
            </button>
          )}
          <button
            type="button"
            className="inbox-pop-icon-btn"
            onClick={handleOpenSettings}
            aria-label="Notification settings"
            title="Notification settings"
          >
            <Settings size={16} strokeWidth={1.85} />
          </button>
          <button type="button" className="inbox-pop-icon-btn" onClick={onClose} aria-label="Close" title="Close">
            <X size={16} strokeWidth={1.85} />
          </button>
        </div>
      </header>

      <div className="inbox-pop-toolbar">
        <div className="inbox-pop-tabs" role="tablist" aria-label="Read status">
          {[
            { value: false, label: 'All' },
            { value: true, label: 'Unread' },
          ].map((tab) => (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={unreadOnly === tab.value}
              className={`inbox-pop-tab${unreadOnly === tab.value ? ' active' : ''}`}
              onClick={() => setUnreadOnly(tab.value)}
              disabled={loading}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="inbox-pop-chips" role="group" aria-label="Filter by category">
          {INBOX_CATEGORIES.map((cat) => (
            <button
              key={cat.id || 'all'}
              type="button"
              aria-pressed={categoryFilter === cat.id}
              className={`inbox-pop-chip${categoryFilter === cat.id ? ' active' : ''}`}
              onClick={() => setCategoryFilter(cat.id)}
              disabled={loading}
            >
              {cat.id ? cat.label : 'All categories'}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="inbox-pop-error">{error}</p>}

      <div className="inbox-pop-list">
        {loading ? (
          <div className="inbox-pop-state">
            <LoadingDots size="sm" />
            <span>Loading notifications…</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="inbox-pop-state">
            <span className="inbox-pop-state-icon" aria-hidden>
              <Bell size={20} strokeWidth={1.75} />
            </span>
            <strong>{emptyState.title}</strong>
            <p>{emptyState.message}</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const category = categoryOf(notification);
            return (
              <InboxListItem
                key={notification.id}
                icon={CATEGORY_ICONS[category] || Bell}
                tone={CATEGORY_ICONS[category] ? category : 'default'}
                title={notification.title}
                preview={notification.message}
                time={formatInboxRelativeTime(notification.createdAt)}
                timeIso={notification.createdAt}
                unread={isInboxNotificationUnread(notification)}
                selected={notification.id === selectedId}
                onSelect={() => handleSelect(notification)}
                onDismiss={() => handleDismiss(notification)}
                dismissing={dismissingId === notification.id}
              />
            );
          })
        )}
      </div>
    </InboxPopover>
  );
}

function NotificationDetail({ notification, dismissing, onClose, onDismiss, onOpen }) {
  const category = categoryOf(notification);
  const actionLabel = getNotificationActionLabel(notification);

  return (
    <InboxDetailPanel
      icon={CATEGORY_ICONS[category] || Bell}
      tone={CATEGORY_ICONS[category] ? category : 'default'}
      eyebrow={formatInboxCategory(category) || 'Notification'}
      title={notification.title}
      timestamp={formatInboxFullTimestamp(notification.createdAt)}
      timestampIso={notification.createdAt}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="inbox-pop-btn inbox-pop-btn--ghost" onClick={onDismiss} disabled={dismissing}>
            {dismissing ? 'Dismissing…' : 'Dismiss'}
          </button>
          {actionLabel && (
            <button type="button" className="inbox-pop-btn inbox-pop-btn--primary" onClick={onOpen}>
              {actionLabel}
              <ArrowUpRight size={14} strokeWidth={2} aria-hidden />
            </button>
          )}
        </>
      }
    >
      {notification.message ? <p>{notification.message}</p> : <p>No additional details.</p>}
    </InboxDetailPanel>
  );
}

export default NotificationsQuickModal;
