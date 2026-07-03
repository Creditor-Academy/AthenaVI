import API_CONFIG, { buildUrl, getAuthHeaders } from '../config/api.js';

class CommentService {
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
      throw new Error(payload.message || `Comment request failed: ${response.status}`);
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

  normalizeComment(comment) {
    if (!comment || typeof comment !== 'object') return comment;
    return {
      ...comment,
      id: comment.id || comment._id,
      author: comment.author
        ? { ...comment.author, id: comment.author.id || comment.author._id }
        : comment.author,
    };
  }

  async listComments(workspaceId, projectId, params = {}) {
    const data = await this.request(
      `${API_CONFIG.ENDPOINTS.PROJECT_COMMENTS.BASE(workspaceId, projectId)}${this.buildQuery(params)}`
    );
    return {
      comments: (data?.comments || []).map((c) => this.normalizeComment(c)),
      nextCursor: data?.nextCursor ?? null,
    };
  }

  async createComment(workspaceId, projectId, payload) {
    const data = await this.request(
      API_CONFIG.ENDPOINTS.PROJECT_COMMENTS.BASE(workspaceId, projectId),
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return this.normalizeComment(data?.comment || data);
  }

  async updateComment(workspaceId, projectId, commentId, payload) {
    const data = await this.request(
      API_CONFIG.ENDPOINTS.PROJECT_COMMENTS.ONE(workspaceId, projectId, commentId),
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    );
    return this.normalizeComment(data?.comment || data);
  }

  async deleteComment(workspaceId, projectId, commentId) {
    const data = await this.request(
      API_CONFIG.ENDPOINTS.PROJECT_COMMENTS.ONE(workspaceId, projectId, commentId),
      { method: 'DELETE' }
    );
    return Boolean(data?.deleted);
  }

  async searchMentionableUsers(workspaceId, projectId, q = '') {
    const data = await this.request(
      `${API_CONFIG.ENDPOINTS.PROJECT_COMMENTS.MENTIONABLE_USERS(workspaceId, projectId)}${this.buildQuery({ q })}`
    );
    return (data?.users || []).map((user) => ({
      ...user,
      id: user.id || user._id,
    }));
  }
}

const commentService = new CommentService();
export default commentService;
