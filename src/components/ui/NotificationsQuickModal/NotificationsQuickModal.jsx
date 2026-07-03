import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bell,
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
import { getSanitizedErrorMessage } from '../../../utils/userFacingMessage.js';
import {
  countUnreadUserFacingInboxNotifications,
  filterInboxNotificationsByCategory,
  filterUserFacingInboxNotifications,
  formatInboxCategory,
  formatInboxRelativeTime,
  getInboxEmptyState,
  INBOX_CATEGORIES,
  isInboxNotificationUnread,
  navigateToNotification,
} from '../../../utils/inboxNotifications.js';
import './NotificationsQuickModal.css';

const CATEGORY_ICONS = {
  videos: Video,
  credits: Coins,
  storage: HardDrive,
  workspace: Users,
  comments: MessageSquare,
  platform: Shield,
};

function NotificationCategoryIcon({ category }) {
  const Icon = CATEGORY_ICONS[String(category || '').toLowerCase()] || Bell;
  return (
    <span className={`inbox-notif-icon inbox-notif-icon--${category || 'default'}`} aria-hidden>
      <Icon size={16} strokeWidth={1.85} />
    </span>
  );
}

function NotificationsQuickModal({ onClose, onUnreadCountChange, onOpenNotificationSettings, onNavigate }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [dismissingId, setDismissingId] = useState(null);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);

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

  const handleItemClick = async (notification) => {
    if (isInboxNotificationUnread(notification)) {
      try {
        const updated = await inboxService.markRead(notification.id);
        setNotifications((prev) => {
          const next = prev.map((item) =>
            item.id === notification.id
              ? { ...item, readAt: updated?.readAt ?? new Date().toISOString() }
              : item
          );
          syncUnreadCount(next);
          return next;
        });
      } catch {
        // still navigate
      }
    }

    onClose();
    navigateToNotification(notification, onNavigate);
  };

  const handleDismiss = async (event, notification) => {
    event.stopPropagation();
    if (dismissingId) return;

    setDismissingId(notification.id);
    setError('');
    try {
      await inboxService.dismiss(notification.id);
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

  return (
    <div className="quick-access-modal-overlay" onClick={onClose}>
      <div
        className="quick-access-modal notifications-modal notifications-modal--enhanced"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="notifications-modal-title"
        aria-busy={loading}
      >
        <div className="notifications-modal-header">
          <div className="notifications-modal-heading">
            <div className="notifications-modal-title-row">
              <span className="notifications-modal-title-icon" aria-hidden>
                <Bell size={18} strokeWidth={1.85} />
              </span>
              <div>
                <h4 id="notifications-modal-title">Notifications</h4>
                <p className="notifications-modal-subtitle">
                  {loading
                    ? 'Loading your alerts…'
                    : unreadCount > 0
                      ? `${unreadCount} unread alert${unreadCount === 1 ? '' : 's'}`
                      : 'You are all caught up'}
                </p>
              </div>
            </div>
          </div>

          <div className="notifications-modal-actions">
            {unreadCount > 0 && !loading && (
              <button
                type="button"
                className="notifications-action-btn notifications-action-btn--text"
                onClick={handleMarkAllRead}
                disabled={markingAll}
              >
                {markingAll ? 'Marking…' : 'Mark all read'}
              </button>
            )}
            <button
              type="button"
              className="notifications-action-btn"
              onClick={handleOpenSettings}
              aria-label="Notification settings"
              title="Notification settings"
            >
              <Settings size={16} strokeWidth={1.85} />
            </button>
            <button type="button" className="notifications-action-btn" onClick={onClose} aria-label="Close">
              <X size={16} strokeWidth={1.85} />
            </button>
          </div>
        </div>

        <div className="inbox-modal-toolbar">
          <div className="notifications-filter-bar">
            <span className="notifications-filter-label">Filter by</span>
            <button
              type="button"
              className={`notifications-unread-pill${unreadOnly ? ' active' : ''}`}
              onClick={() => setUnreadOnly((value) => !value)}
              disabled={loading}
              aria-pressed={unreadOnly}
            >
              Unread only
            </button>
          </div>
          <div className="inbox-category-filters-track" role="tablist" aria-label="Filter by category">
            {INBOX_CATEGORIES.map((cat) => {
              const Icon = cat.id ? CATEGORY_ICONS[cat.id] : Bell;
              const isActive = categoryFilter === cat.id;
              return (
                <button
                  key={cat.id || 'all'}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`inbox-category-chip${isActive ? ' active' : ''}`}
                  onClick={() => setCategoryFilter(cat.id)}
                  disabled={loading}
                >
                  <Icon size={14} strokeWidth={1.85} aria-hidden />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {error && <p className="inbox-modal-error">{error}</p>}

        <div className="notifications-list-mini">
          {loading ? (
            <p className="inbox-modal-loading">
              <LoadingDots size="sm" /> Loading notifications…
            </p>
          ) : notifications.length === 0 ? (
            <div className="inbox-modal-empty">
              <span className="inbox-empty-icon" aria-hidden>
                <Bell size={28} strokeWidth={1.5} />
              </span>
              <strong>{emptyState.title}</strong>
              <p>{emptyState.message}</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const unread = isInboxNotificationUnread(notification);
              const category = notification.category || '';
              return (
                <div key={notification.id} className="notification-item-row">
                  <button
                    type="button"
                    className={`notification-item-mini${unread ? '' : ' notification-item-mini--read'}`}
                    onClick={() => handleItemClick(notification)}
                  >
                    <NotificationCategoryIcon category={category} />
                    <div className="notif-content-mini">
                      {category && (
                        <span className={`inbox-cat-badge inbox-cat-badge--${category}`}>
                          {formatInboxCategory(category)}
                        </span>
                      )}
                      <h6>{notification.title}</h6>
                      <p>{notification.message}</p>
                    </div>
                    <div className="notif-item-meta">
                      <time className="notif-time" dateTime={notification.createdAt || undefined}>
                        {formatInboxRelativeTime(notification.createdAt)}
                      </time>
                      {unread && <span className="notif-unread-pill" aria-label="Unread" />}
                    </div>
                  </button>
                  <button
                    type="button"
                    className="inbox-dismiss-btn"
                    aria-label="Dismiss notification"
                    disabled={dismissingId === notification.id}
                    onClick={(event) => handleDismiss(event, notification)}
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        
      </div>
    </div>
  );
}

export default NotificationsQuickModal;
