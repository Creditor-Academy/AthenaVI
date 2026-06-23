import { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import inboxService from '../../../services/inboxService.js';
import LoadingDots from '../LoadingDots/LoadingDots.jsx';
import { getSanitizedErrorMessage } from '../../../utils/userFacingMessage.js';
import {
  formatInboxRelativeTime,
  isInboxNotificationUnread,
  openNotificationActionUrl,
} from '../../../utils/inboxNotifications.js';

function NotificationsQuickModal({ onClose, onUnreadCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState('');

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await inboxService.listNotifications({ limit: 20 });
      setNotifications(data.notifications || []);
      onUnreadCountChange?.(data.unreadCount);
    } catch (err) {
      setError(getSanitizedErrorMessage(err, 'Failed to load notifications'));
    } finally {
      setLoading(false);
    }
  }, [onUnreadCountChange]);

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
        onUnreadCountChange?.(
          (prev) => (typeof prev === 'number' ? Math.max(0, prev - 1) : prev)
        );
      } catch {
        // still navigate if action exists
      }
    }

    if (actionUrl) {
      onClose();
      openNotificationActionUrl(actionUrl);
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

        {error && (
          <p style={{ margin: 0, padding: '12px 24px', fontSize: 13, color: '#ef4444' }}>{error}</p>
        )}

        <div className="notifications-list-mini">
          {loading ? (
            <p style={{ margin: 0, padding: '24px', textAlign: 'center', color: '#64748b' }}>
              <LoadingDots size="sm" /> Loading…
            </p>
          ) : notifications.length === 0 ? (
            <p style={{ margin: 0, padding: '24px', textAlign: 'center', color: '#64748b', fontSize: 14 }}>
              You&apos;re all caught up — no notifications yet.
            </p>
          ) : (
            notifications.map((notification) => {
              const unread = isInboxNotificationUnread(notification);
              return (
                <button
                  key={notification.id}
                  type="button"
                  className={`notification-item-mini${unread ? '' : ' notification-item-mini--read'}`}
                  onClick={() => handleItemClick(notification)}
                >
                  {unread && <div className="notif-dot" aria-hidden />}
                  {!unread && <div className="notif-dot notif-dot--read" aria-hidden />}
                  <div className="notif-content-mini">
                    <h6>{notification.title}</h6>
                    <p>{notification.message}</p>
                    <span>{formatInboxRelativeTime(notification.createdAt)}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationsQuickModal;
