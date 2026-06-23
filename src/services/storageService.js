import API_CONFIG, { buildUrl, getAuthHeaders } from '../config/api.js';

class StorageService {
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
      throw new Error(payload.message || `Storage request failed: ${response.status}`);
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

  normalizeUpgradeRequest(row) {
    if (!row) return null;
    const requestedAdditionalBytes = Number(row.requestedAdditionalBytes ?? 0);
    const requestedAdditionalGb =
      row.requestedAdditionalGb != null
        ? Number(row.requestedAdditionalGb)
        : requestedAdditionalBytes > 0
          ? Math.round((requestedAdditionalBytes / 1024 ** 3) * 10) / 10
          : null;

    return {
      requestId: row.requestId || row.id || null,
      status: row.status || null,
      requestedAdditionalGb,
      requestedAdditionalBytes,
      reason: row.reason || '',
      urgency: row.urgency || null,
      currentUsedBytes: row.currentUsedBytes != null ? Number(row.currentUsedBytes) : null,
      currentLimitBytes: row.currentLimitBytes != null ? Number(row.currentLimitBytes) : null,
      tierId: row.tierId || null,
      tierLabel: row.tierLabel || null,
      workspaceId: row.workspaceId || null,
      workspaceName: row.workspaceName || null,
      workspaceFootprintBytes:
        row.workspaceFootprintBytes != null ? Number(row.workspaceFootprintBytes) : null,
      submittedAt: row.submittedAt || null,
      reviewedAt: row.reviewedAt || null,
      reviewNote: row.reviewNote || null,
    };
  }

  normalizeQuota(data) {
    const limitBytes = Number(data?.limitBytes ?? 0);
    const usedBytes = Number(data?.usedBytes ?? 0);
    const availableBytes =
      data?.availableBytes != null
        ? Number(data.availableBytes)
        : Math.max(0, limitBytes - usedBytes);
    const percentUsed =
      data?.percentUsed != null
        ? Number(data.percentUsed)
        : limitBytes > 0
          ? Math.min(100, (usedBytes / limitBytes) * 100)
          : 0;

    const activeUpgradeRequest = this.normalizeUpgradeRequest(data?.activeUpgradeRequest);

    return {
      userId: data?.userId,
      limitBytes,
      usedBytes,
      availableBytes,
      percentUsed,
      tier: data?.tier || null,
      activeUpgradeRequest,
    };
  }

  normalizeHistory(data) {
    const history = data?.history ?? data;
    const transactions = history?.transactions || history?.items || [];
    const pagination = history?.pagination || {
      total: transactions.length,
      page: 1,
      limit: transactions.length || 20,
      totalPages: 1,
    };
    return { transactions, pagination };
  }

  normalizeUpgradeRequests(data) {
    const requests = (data?.requests || []).map((row) => this.normalizeUpgradeRequest(row));
    const pagination = data?.pagination || {
      total: requests.length,
      page: 1,
      limit: requests.length || 20,
      totalPages: 1,
    };
    return { requests, pagination };
  }

  async getPersonalQuota() {
    const data = await this.request(API_CONFIG.ENDPOINTS.STORAGE.ME);
    return this.normalizeQuota(data);
  }

  async getPersonalHistory({ page = 1, limit = 20, type } = {}) {
    const query = this.buildQuery({ page, limit, type });
    const data = await this.request(`${API_CONFIG.ENDPOINTS.STORAGE.ME_HISTORY}${query}`);
    return this.normalizeHistory(data);
  }

  async getUpgradeRequests({ page = 1, limit = 20, status } = {}) {
    const query = this.buildQuery({ page, limit, status });
    const data = await this.request(`${API_CONFIG.ENDPOINTS.STORAGE.REQUESTS}${query}`);
    return this.normalizeUpgradeRequests(data);
  }

  async getWorkspaceStorage(workspaceId) {
    const data = await this.request(API_CONFIG.ENDPOINTS.STORAGE.WORKSPACE(workspaceId));
    const quota = data?.quota
      ? {
          limitBytes: Number(data.quota.limitBytes ?? 0),
          usedBytes: Number(data.quota.usedBytes ?? 0),
        }
      : null;
    const footprint = data?.footprint
      ? {
          assetBytes: Number(data.footprint.assetBytes ?? 0),
          heygenBytes: Number(data.footprint.heygenBytes ?? 0),
          renderBytes: Number(data.footprint.renderBytes ?? 0),
          totalBytes: Number(data.footprint.totalBytes ?? 0),
        }
      : null;

    return {
      workspaceId: data?.workspaceId || workspaceId,
      workspaceType: String(data?.workspaceType || '').toUpperCase(),
      owner: data?.owner || null,
      quota,
      footprint,
    };
  }

  /** Submit a storage upgrade request — notifies platform superadmin by email. */
  async requestMoreStorage(payload = {}) {
    const data = await this.request(API_CONFIG.ENDPOINTS.STORAGE.REQUEST, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return {
      ...this.normalizeUpgradeRequest(data),
      requestId: data?.requestId || data?.id,
      submittedAt: data?.submittedAt || null,
      status: data?.status || 'pending',
    };
  }
}

const storageService = new StorageService();
export default storageService;
