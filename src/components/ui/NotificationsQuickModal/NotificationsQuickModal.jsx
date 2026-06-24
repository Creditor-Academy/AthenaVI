import { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import inboxService from '../../../services/inboxService.js';
import LoadingDots from '../LoadingDots/LoadingDots.jsx';
import { getSanitizedErrorMessage } from '../../../utils/userFacingMessage.js';
import {
  decrementUnreadCount,
  formatInboxCategory,
  formatInboxRelativeTime,
  INBOX_CATEGORIES,
  isInboxNotificationUnread,
  openNotificationActionUrl,
} from '../../../utils/inboxNotifications.js';
import './NotificationsQuickModal.css';

function NotificationsQuickModal({ onClose, onUnreadCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [dismissingId, setDismissingId] = useState(null);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { limit: 50 };
      if (categoryFilter) params.category = categoryFilter;
      if (unreadOnly) params.unreadOnly = true;

      const data = await inboxService.listNotifications(params);
      setNotifications(data.notifications || []);
      onUnreadCountChange?.(data.unreadCount);
    } catch (err) {
      setError(getSanitizedErrorMessage(err, 'Failed to load notifications'));
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, unreadOnly, onUnreadCountChange]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleItemClick = async (notification) => {
    const actionUrl = notification?.metadata?.actionUrl;

    if (isInboxNotificationUnread(notification)) {
      try {
        const updated = await inboxService.markRead(notification.id);
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id
              ? { ...item, readAt: updated?.readAt ?? new Date().toISOString() }
              : item
          )
        );
        decrementUnreadCount(onUnreadCountChange);
      } catch {
        // still navigate if action exists
      }
    }

    if (actionUrl) {
      onClose();
      openNotificationActionUrl(actionUrl);
    }
  };

  const handleDismiss = async (event, notification) => {
    event.stopPropagation();
    if (dismissingId) return;

    setDismissingId(notification.id);
    setError('');
    try {
      await inboxService.dismiss(notification.id);
      setNotifications((prev) => prev.filter((item) => item.id !== notification.id));
      if (isInboxNotificationUnread(notification)) {
        decrementUnreadCount(onUnreadCountChange);
      }
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
      const data = await inboxService.markAllRead();
      const readAt = new Date().toISOString();
      setNotifications((prev) => prev.map((item) => ({ ...item, readAt: item.readAt || readAt })));
      onUnreadCountChange?.(data.unreadCount);
    } catch (err) {
      setError(getSanitizedErrorMessage(err, 'Failed to mark notifications as read'));
    } finally {
      setMarkingAll(false);
    }
  };

  const hasUnread = notifications.some(isInboxNotificationUnread);

  return (
    <div className="quick-access-modal-overlay" onClick={onClose}>
      <div
        className="quick-access-modal notifications-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="notifications-modal-title"
        aria-busy={loading}
      >
        <div className="modal-header-sleek">
          <h4 id="notifications-modal-title">Notifications</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {hasUnread && !loading && (
              <button
                type="button"
                className="btn-link-action"
                onClick={handleMarkAllRead}
                disabled={markingAll}
                style={{ padding: '4px 8px' }}
              >
                {markingAll ? 'Marking…' : 'Mark all read'}
              </button>
            )}
            <button type="button" className="close-mini-btn" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="inbox-modal-toolbar">
          <div className="inbox-category-filters" role="tablist" aria-label="Filter by category">
            {INBOX_CATEGORIES.map((cat) => (
              <button
                key={cat.id || 'all'}
                type="button"
                role="tab"
                aria-selected={categoryFilter === cat.id}
                className={`inbox-category-chip${categoryFilter === cat.id ? ' active' : ''}`}
                onClick={() => setCategoryFilter(cat.id)}
                disabled={loading}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <label className="inbox-unread-toggle">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(event) => setUnreadOnly(event.target.checked)}
              disabled={loading}
            />
            Unread only
          </label>
        </div>

        {error && <p className="inbox-modal-error">{error}</p>}

        <div className="notifications-list-mini">
          {loading ? (
            <p className="inbox-modal-loading">
              <LoadingDots size="sm" /> Loading…
            </p>
          ) : notifications.length === 0 ? (
            <p className="inbox-modal-empty">
              {unreadOnly || categoryFilter
                ? 'No notifications match these filters.'
                : "You're all caught up — no notifications yet."}
            </p>
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
                    {unread && <div className="notif-dot" aria-hidden />}
                    {!unread && <div className="notif-dot notif-dot--read" aria-hidden />}
                    <div className="notif-content-mini">
                      {category && (
                        <span className={`inbox-cat-badge inbox-cat-badge--${category}`}>
                          {formatInboxCategory(category)}
                        </span>
                      )}
                      <h6>{notification.title}</h6>
                      <p>{notification.message}</p>
                      <span>{formatInboxRelativeTime(notification.createdAt)}</span>
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
