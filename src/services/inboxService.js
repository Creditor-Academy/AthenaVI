import API_CONFIG, { buildUrl, getAuthHeaders } from '../config/api.js';

class InboxService {
  unwrapData(json) {
    return json?.data ?? json;
  }

  async readErrorPayload(response) {
    return response.json().catch(() => ({}));
  }

  async request(endpoint, options = {}) {
    const response = await fetch(buildUrl(endpoint), {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const payload = await this.readErrorPayload(response);
      throw new Error(payload.message || `Inbox request failed: ${response.status}`);
    }

    if (response.status === 204) return null;
    const json = await response.json();
    return this.unwrapData(json);
  }

  buildQuery(params = {}) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        search.set(key, String(value));
      }
    });
    const query = search.toString();
    return query ? `?${query}` : '';
  }

  async listNotifications(params = {}) {
    const data = await this.request(
      `${API_CONFIG.ENDPOINTS.USER.INBOX.LIST}${this.buildQuery(params)}`
    );
    return {
      notifications: data?.notifications || [],
      unreadCount: Number(data?.unreadCount ?? 0),
    };
  }

  async getUnreadCount() {
    const data = await this.request(API_CONFIG.ENDPOINTS.USER.INBOX.UNREAD_COUNT);
    return {
      unreadCount: Number(data?.unreadCount ?? 0),
      byCategory: data?.byCategory || {},
    };
  }

  async getNotification(notificationId) {
    const data = await this.request(API_CONFIG.ENDPOINTS.USER.INBOX.ONE(notificationId));
    return data?.notification || null;
  }

  async markRead(notificationId) {
    const data = await this.request(API_CONFIG.ENDPOINTS.USER.INBOX.MARK_READ(notificationId), {
      method: 'PATCH',
    });
    return data?.notification || null;
  }

  async markBulkRead(notificationIds) {
    const data = await this.request(API_CONFIG.ENDPOINTS.USER.INBOX.MARK_BULK_READ, {
      method: 'PATCH',
      body: JSON.stringify({ notificationIds }),
    });
    return { unreadCount: Number(data?.unreadCount ?? 0) };
  }

  async markAllRead() {
    const data = await this.request(API_CONFIG.ENDPOINTS.USER.INBOX.MARK_ALL_READ, {
      method: 'PATCH',
    });
    return { unreadCount: Number(data?.unreadCount ?? 0) };
  }

  async dismiss(notificationId) {
    const data = await this.request(API_CONFIG.ENDPOINTS.USER.INBOX.ONE(notificationId), {
      method: 'DELETE',
    });
    return Boolean(data?.deleted);
  }
}

const inboxService = new InboxService();
export default inboxService;
