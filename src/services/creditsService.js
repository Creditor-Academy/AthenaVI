import API_CONFIG, { buildUrl, getAuthHeaders } from '../config/api.js';
import { findRecentUsageCredits } from '../utils/creditTransactions.js';

export class InsufficientCreditsError extends Error {
  constructor(message, data = {}) {
    super(message || 'Insufficient credits');
    this.name = 'InsufficientCreditsError';
    this.code = 'INSUFFICIENT_CREDITS';
    this.status = 402;
    this.data = data;
  }
}

export function isInsufficientCreditsError(error) {
  return (
    error?.code === 'INSUFFICIENT_CREDITS' ||
    error?.status === 402 ||
    error instanceof InsufficientCreditsError
  );
}

class CreditsService {
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

    if (response.status === 402) {
      const payload = await this.readErrorPayload(response);
      throw new InsufficientCreditsError(payload.message || 'Insufficient credits', payload);
    }

    if (!response.ok) {
      const payload = await this.readErrorPayload(response);
      throw new Error(payload.message || `Credits request failed: ${response.status}`);
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

  normalizeHistory(data) {
    const history = data?.history || data;
    const transactions = history?.transactions || history?.items || [];
    const pagination = history?.pagination || {
      total: transactions.length,
      page: 1,
      limit: transactions.length || 20,
      totalPages: 1,
    };
    return { transactions, pagination };
  }

  async getPersonalBalance() {
    const data = await this.request(API_CONFIG.ENDPOINTS.CREDITS.ME);
    return {
      personalCredits: Number(data?.personalCredits ?? data?.credits ?? 0),
    };
  }

  async getPersonalHistory({ page = 1, limit = 20 } = {}) {
    const query = this.buildQuery({ page, limit });
    const data = await this.request(`${API_CONFIG.ENDPOINTS.CREDITS.ME_HISTORY}${query}`);
    return this.normalizeHistory(data);
  }

  async getPersonalEstimate({ feature, text } = {}) {
    const query = this.buildQuery({ feature, text });
    return this.request(`${API_CONFIG.ENDPOINTS.CREDITS.ME_ESTIMATE}${query}`);
  }

  async getWorkspaceBalance(workspaceId) {
    const data = await this.request(API_CONFIG.ENDPOINTS.CREDITS.WORKSPACE(workspaceId));
    return {
      workspaceId: data?.workspaceId || workspaceId,
      personalCredits: Number(data?.personalCredits ?? 0),
      workspaceCredits: Number(data?.workspaceCredits ?? data?.credits ?? 0),
      workspaceType: String(data?.workspaceType || '').toUpperCase(),
    };
  }

  async getWorkspaceHistory(workspaceId, { page = 1, limit = 20 } = {}) {
    const query = this.buildQuery({ page, limit });
    const data = await this.request(`${API_CONFIG.ENDPOINTS.CREDITS.WORKSPACE_HISTORY(workspaceId)}${query}`);
    return this.normalizeHistory(data);
  }

  async getMyWorkspaceHistory(workspaceId, { page = 1, limit = 20 } = {}) {
    const query = this.buildQuery({ page, limit });
    const data = await this.request(`${API_CONFIG.ENDPOINTS.CREDITS.MY_HISTORY(workspaceId)}${query}`);
    return this.normalizeHistory(data);
  }

  async getUsageByMember(workspaceId, { page = 1, limit = 20 } = {}) {
    const query = this.buildQuery({ page, limit });
    const data = await this.request(`${API_CONFIG.ENDPOINTS.CREDITS.USAGE_BY_MEMBER(workspaceId)}${query}`);
    return this.normalizeHistory(data);
  }

  async getWorkspaceEstimate(workspaceId, params = {}) {
    const query = this.buildQuery(params);
    return this.request(`${API_CONFIG.ENDPOINTS.CREDITS.ESTIMATE(workspaceId)}${query}`);
  }

  async allocate(workspaceId, amount) {
    return this.request(API_CONFIG.ENDPOINTS.CREDITS.ALLOCATE(workspaceId), {
      method: 'POST',
      body: JSON.stringify({ amount: Number(amount) }),
    });
  }

  async deallocate(workspaceId, amount) {
    return this.request(API_CONFIG.ENDPOINTS.CREDITS.DEALLOCATE(workspaceId), {
      method: 'POST',
      body: JSON.stringify({ amount: Number(amount) }),
    });
  }

  async resolveRecentUsageCredits(workspaceId, { withinMs = 180000 } = {}) {
    if (workspaceId) {
      try {
        const { transactions } = await this.getMyWorkspaceHistory(workspaceId, { page: 1, limit: 15 });
        const used = findRecentUsageCredits(transactions, { withinMs });
        if (used != null) return used;
      } catch {
        // fall through to personal history
      }
    }

    try {
      const { transactions } = await this.getPersonalHistory({ page: 1, limit: 15 });
      return findRecentUsageCredits(transactions, { withinMs });
    } catch {
      return null;
    }
  }
}

const creditsService = new CreditsService();
export default creditsService;
