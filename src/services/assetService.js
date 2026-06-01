import { buildUrl, getAuthHeaders } from '../config/api';

class AssetService {
  async uploadAsset(workspaceId, file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(buildUrl(`/api/assets/${workspaceId}/upload`), {
      method: 'POST',
      headers: {
        Authorization: getAuthHeaders().Authorization || '',
      },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Upload failed: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.asset || data.asset || data.data || data;
  }

  async listAssets(workspaceId, { take = 50, skip = 0 } = {}) {
    const response = await fetch(
      buildUrl(`/api/assets/${workspaceId}?take=${take}&skip=${skip}`),
      { method: 'GET', headers: getAuthHeaders(), cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error(`Failed to list assets: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.assets || data.assets || [];
  }

  normalizeAsset(asset) {
    if (!asset) return null;
    const id = asset.id || asset._id || asset.assetId;
    const url =
      asset.url ||
      asset.presignedUrl ||
      asset.downloadUrl ||
      asset.fileUrl ||
      asset.src;
    const mediaType =
      asset.type ||
      asset.mediaType ||
      (asset.mimeType?.startsWith('video')
        ? 'video'
        : asset.mimeType?.startsWith('audio')
          ? 'audio'
          : 'image');

    return {
      id,
      name: asset.name || asset.fileName || 'Asset',
      url,
      mediaType,
      mimeType: asset.mimeType,
      raw: asset,
    };
  }
}

const assetService = new AssetService();
export default assetService;
