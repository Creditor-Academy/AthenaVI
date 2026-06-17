import { buildUrl, getAuthHeaders } from '../config/api';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'audio/mpeg',
  'audio/mp3',
]);

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

class AssetService {
  validateUploadFile(file) {
    if (!file) return 'No file selected';
    if (file.size > MAX_UPLOAD_BYTES) return 'File exceeds the 50 MB limit';
    const mime = file.type || '';
    if (!ALLOWED_MIME_TYPES.has(mime)) {
      return 'File type not allowed. Use JPEG, PNG, WebP, MP4, or MP3.';
    }
    return null;
  }

  async uploadAsset(workspaceId, file) {
    const validationError = this.validateUploadFile(file);
    if (validationError) throw new Error(validationError);

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

  async listAssets(workspaceId, { take = 50, skip = 0, source = 'all' } = {}) {
    const params = new URLSearchParams({
      take: String(Math.min(Math.max(take, 1), 100)),
      skip: String(Math.max(skip, 0)),
    });
    if (source && source !== 'all') params.set('source', source);

    const response = await fetch(buildUrl(`/api/assets/${workspaceId}?${params}`), {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Failed to list assets: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.assets || data.assets || [];
  }

  async renameAsset(workspaceId, assetId, name) {
    const trimmed = String(name || '').trim();
    if (!trimmed) throw new Error('Name is required');

    const response = await fetch(
      buildUrl(`/api/assets/${workspaceId}/${assetId}/rename`),
      {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: trimmed }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Failed to rename asset: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.asset || data.asset || data.data || data;
  }

  async deleteAsset(workspaceId, assetId) {
    const response = await fetch(buildUrl(`/api/assets/${workspaceId}/${assetId}`), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Failed to delete asset: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.asset || data.asset || data.data || data;
  }

  formatFileSize(bytes) {
    const value = Number(bytes);
    if (!Number.isFinite(value) || value <= 0) return '--';
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  }

  formatModifiedDate(iso) {
    if (!iso) return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  }

  inferMediaType(asset) {
    const mime = asset?.mimeType || (String(asset?.type || '').includes('/') ? asset.type : '');
    if (mime.startsWith('video')) return 'video';
    if (mime.startsWith('audio')) return 'audio';
    if (mime.startsWith('image')) return 'image';
    const raw = String(asset?.mediaType || asset?.type || '').toLowerCase();
    if (raw === 'video' || raw === 'audio' || raw === 'image') return raw;
    return 'image';
  }

  resolveAssetUrl(asset) {
    if (!asset) return null;
    const direct =
      asset.url ||
      asset.presignedUrl ||
      asset.downloadUrl ||
      asset.fileUrl ||
      asset.publicUrl ||
      asset.cdnUrl ||
      asset.s3Url ||
      asset.storageUrl ||
      asset.src ||
      asset.path;
    if (typeof direct === 'string' && direct.trim()) {
      if (direct.startsWith('http') || direct.startsWith('blob:')) return direct;
      if (direct.startsWith('/')) return buildUrl(direct);
      return direct;
    }
    return null;
  }

  normalizeAsset(asset) {
    if (!asset) return null;
    const id = asset.id || asset._id || asset.assetId;
    const url = this.resolveAssetUrl(asset);
    const mediaType = this.inferMediaType(asset);
    const mimeType = asset.mimeType || (String(asset.type || '').includes('/') ? asset.type : undefined);
    const sizeBytes = asset.size ?? asset.fileSize ?? asset.bytes;
    const source = asset.source || (asset.isStock ? 'stock' : 'upload');

    return {
      id,
      name: asset.name || asset.fileName || 'Asset',
      url,
      mediaType,
      mimeType,
      sizeBytes,
      sizeLabel: this.formatFileSize(sizeBytes),
      modified: this.formatModifiedDate(asset.updatedAt || asset.createdAt),
      source,
      owner: asset.uploadedByName || asset.ownerName || asset.uploaderName || '',
      raw: asset,
    };
  }

  toLibraryTab(mediaType) {
    if (mediaType === 'video') return 'videos';
    if (mediaType === 'audio') return 'music';
    return 'images';
  }

  acceptForTab(tab) {
    if (tab === 'videos') return 'video/mp4';
    if (tab === 'music') return 'audio/mpeg,audio/mp3,.mp3';
    return 'image/jpeg,image/png,image/webp';
  }
}

const assetService = new AssetService();
export default assetService;
