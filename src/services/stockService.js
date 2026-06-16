import { buildUrl, getAuthHeaders } from '../config/api';

class StockService {
  async search({ q, type = 'photo', provider = 'all', page = 1, perPage = 20 } = {}) {
    const query = String(q || '').trim();
    if (!query) {
      throw new Error('Enter a search term');
    }

    const params = new URLSearchParams({
      q: query,
      type,
      provider,
      page: String(page),
      perPage: String(Math.min(80, Math.max(1, perPage))),
    });

    const response = await fetch(buildUrl(`/api/stock/search?${params}`), {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const message =
        err.message ||
        (response.status === 503
          ? 'Stock search is unavailable'
          : response.status === 429
            ? 'Too many requests — try again shortly'
            : `Stock search failed (${response.status})`);
      throw new Error(message);
    }

    const payload = await response.json();
    return payload.data || payload;
  }

  async importStock(workspaceId, { provider, externalId, mediaType, name } = {}) {
    if (!workspaceId) {
      throw new Error('Workspace is required to import stock media');
    }

    const response = await fetch(buildUrl(`/api/stock/workspaces/${workspaceId}/import`), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        provider,
        externalId: String(externalId),
        mediaType,
        ...(name ? { name } : {}),
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const message =
        err.message ||
        (response.status === 503
          ? 'Stock import is unavailable'
          : response.status === 404
            ? 'This item is no longer available from the stock provider'
            : `Stock import failed (${response.status})`);
      throw new Error(message);
    }

    const payload = await response.json();
    return payload.data?.asset || payload.asset || payload.data || payload;
  }
}

const stockService = new StockService();
export default stockService;
