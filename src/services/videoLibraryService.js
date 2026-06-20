import API_CONFIG, { buildUrl, getAuthHeaders } from '../config/api.js';

class VideoLibraryService {
  unwrapData(json) {
    return json?.data ?? json;
  }

  async readErrorPayload(response) {
    return response.json().catch(() => ({}));
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

  normalizeLibraryVideo(item) {
    if (!item) return null;
    const id = item.id || item._id || item.renderId;
    return {
      id,
      workspaceId: item.workspaceId,
      projectId: item.projectId,
      title: item.projectTitle || item.title || item.name || 'Untitled',
      folderId: item.folderId || null,
      status: String(item.status || 'completed').toLowerCase(),
      fileSizeBytes: Number(item.fileSizeBytes ?? item.sizeBytes ?? 0) || null,
      completedAt: item.completedAt || item.updatedAt || item.createdAt || null,
      triggeredBy: item.triggeredBy || null,
      downloadPath: item.downloadPath || null,
      workspace: item.workspace || null,
      workspaceName: item.workspace?.name || item.workspaceName || '',
      workspaceType: item.workspaceType || item.workspace?.type || null,
      membershipRole:
        item.membershipRole ||
        item.workspace?.userRole ||
        item.workspace?.role ||
        null,
      raw: item,
    };
  }

  normalizeListResponse(data) {
    const videos = (data?.videos || data?.items || []).map((v) => this.normalizeLibraryVideo(v)).filter(Boolean);
    const pagination = data?.pagination || {
      total: videos.length,
      page: 1,
      limit: videos.length || 20,
      totalPages: 1,
    };
    return { videos, pagination };
  }

  async requestList(endpoint, params = {}) {
    const query = this.buildQuery({
      take: params.take ?? 20,
      skip: params.skip ?? 0,
      status: params.status ?? 'completed',
    });

    const response = await fetch(buildUrl(`${endpoint}${query}`), {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      const err = await this.readErrorPayload(response);
      throw new Error(err.message || `Failed to load videos: ${response.status}`);
    }

    const json = await response.json();
    return this.normalizeListResponse(this.unwrapData(json));
  }

  async listUserVideos({ take = 20, skip = 0, status = 'completed' } = {}) {
    return this.requestList(API_CONFIG.ENDPOINTS.VIDEO_LIBRARY.USER, { take, skip, status });
  }

  async listWorkspaceVideos(workspaceId, { take = 20, skip = 0, status = 'completed' } = {}) {
    if (!workspaceId) return { videos: [], pagination: { total: 0, page: 1, limit: take, totalPages: 0 } };
    return this.requestList(API_CONFIG.ENDPOINTS.VIDEO_LIBRARY.WORKSPACE(workspaceId), {
      take,
      skip,
      status,
    });
  }

  resolveDownloadEndpoint(video) {
    if (!video) return null;
    if (video.downloadPath) {
      return video.downloadPath.startsWith('http')
        ? video.downloadPath
        : buildUrl(video.downloadPath);
    }
    if (video.workspaceId && video.projectId && video.id) {
      return buildUrl(
        `/api/workspaces/${video.workspaceId}/projects/${video.projectId}/renders/${video.id}/download`
      );
    }
    return null;
  }

  resolveStreamEndpoint(video) {
    if (!video?.workspaceId || !video?.projectId || !video?.id) return null;
    return buildUrl(
      `/api/workspaces/${video.workspaceId}/projects/${video.projectId}/renders/${video.id}/stream`
    );
  }

  async fetchPresignedDownloadUrl(video) {
    const endpoint = this.resolveDownloadEndpoint(video);
    if (!endpoint) throw new Error('Download is not available for this video.');

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      const err = await this.readErrorPayload(response);
      throw new Error(err.message || `Download failed: ${response.status}`);
    }

    const data = this.unwrapData(await response.json());
    return (
      data.presignedUrl ||
      data.url ||
      data.downloadUrl ||
      data.signedUrl ||
      null
    );
  }

  async downloadVideoFile(video, filename) {
    if (!video?.workspaceId || !video?.projectId || !video?.id) {
      throw new Error('Download is not available for this video.');
    }

    const safeName = String(filename || video.title || 'video')
      .replace(/[<>:"/\\|?*]+/g, '-')
      .trim()
      .slice(0, 120) || 'video';
    const finalName = safeName.toLowerCase().endsWith('.mp4') ? safeName : `${safeName}.mp4`;

    const url = await this.fetchPresignedDownloadUrl(video);
    if (!url) throw new Error('Download URL unavailable.');

    const link = document.createElement('a');
    link.href = url;
    link.download = finalName;
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
    return { filename: finalName };
  }
}

const videoLibraryService = new VideoLibraryService();
export default videoLibraryService;
