import API_CONFIG, { buildUrl, getAuthHeaders } from '../config/api';
import { StorageLimitError } from '../utils/storageQuota';
import { prepareImageForUpload, shrinkImageForUpload } from '../utils/imageUploadFormat';
import { formatBytes, sendUpload } from '../utils/uploadRequest';
import {
  failTrackedUpload,
  finishTrackedUpload,
  setTrackedProgress,
  startTrackedUpload,
} from './uploadTracker';

export class AssetInUseError extends Error {
  constructor(message, data = {}) {
    super(message || 'This asset is used in one or more projects and cannot be deleted.');
    this.name = 'AssetInUseError';
    this.code = 'ASSET_IN_USE';
    this.status = 409;
    this.data = data;
  }
}

export function isAssetInUseError(error) {
  return error?.code === 'ASSET_IN_USE' || error instanceof AssetInUseError;
}

export class AssetPermissionError extends Error {
  constructor(message, data = {}) {
    super(message || 'You do not have permission to modify this asset.');
    this.name = 'AssetPermissionError';
    this.code = 'ASSET_PERMISSION_DENIED';
    this.status = 403;
    this.data = data;
  }
}

export function formatAssetInUseMessage(error) {
  const data = error?.data || {};
  const count =
    data.projectCount ??
    data.referenceCount ??
    data.referencesCount ??
    (Array.isArray(data.projects) ? data.projects.length : null) ??
    (Array.isArray(data.references) ? data.references.length : null);

  if (count != null && Number(count) > 0) {
    const n = Number(count);
    return `Used in ${n} project${n === 1 ? '' : 's'}. Remove it from projects first.`;
  }
  return error?.message || 'This asset is used in one or more projects and cannot be deleted.';
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'audio/mpeg',
  'audio/mp3',
]);

// Workspace media library limit (matches the server: uploadLibraryAsset).
export const MAX_UPLOAD_BYTES = 1024 * 1024 * 1024;

class AssetService {
  constructor() {
    this.normalizeAsset = this.normalizeAsset.bind(this);
  }

  async readErrorPayload(response) {
    return response.json().catch(() => ({}));
  }

  validateUploadFile(file) {
    if (!file) return 'No file selected';
    if (file.size > MAX_UPLOAD_BYTES) return `"${file.name}" is larger than the 1 GB upload limit`;
    const mime = file.type || '';
    const name = String(file.name || '').toLowerCase();
    const allowedByExtension =
      /\.(jpe?g|png|webp|mp4|mp3)$/.test(name);
    if (!mime && allowedByExtension) return null;
    if (!ALLOWED_MIME_TYPES.has(mime)) {
      return 'File type not allowed. Use JPEG, PNG, WebP, MP4, or MP3.';
    }
    return null;
  }

  /**
   * Upload a file to the workspace library. `onProgress(fraction)` reports upload progress.
   * Every upload shows in the app-wide upload panel (UploadProgressHost) unless `track: false`
   * (callers with their own progress UI, or silent background saves).
   * The returned asset has `uploadedSmallerCopy: true` when the original was refused as too
   * large and a smaller copy of the image was stored instead.
   */
  async uploadAsset(workspaceId, sourceFile, { onProgress, track = true } = {}) {
    const trackId = track ? startTrackedUpload(sourceFile) : null;
    try {
      const asset = await this.sendAssetUpload(workspaceId, sourceFile, {
        onProgress: (fraction) => {
          if (trackId) setTrackedProgress(trackId, fraction);
          onProgress?.(fraction);
        },
      });
      if (trackId) {
        finishTrackedUpload(trackId, {
          note: asset?.uploadedSmallerCopy
            ? 'Uploaded a smaller copy — the original was too large for the server'
            : '',
        });
      }
      return asset;
    } catch (error) {
      if (trackId) failTrackedUpload(trackId, error?.message || 'Upload failed');
      throw error;
    }
  }

  async sendAssetUpload(workspaceId, sourceFile, { onProgress } = {}) {
    // GIF/AVIF/BMP/SVG/.jfif… (typical downloads) become WebP/PNG/JPEG the server accepts.
    const file = await prepareImageForUpload(sourceFile);
    const validationError = this.validateUploadFile(file);
    if (validationError) throw new Error(validationError);

    const url = buildUrl(API_CONFIG.ENDPOINTS.ASSETS.UPLOAD(workspaceId));
    const send = (upload) => {
      const formData = new FormData();
      formData.append('file', upload);
      onProgress?.(0);
      return sendUpload(url, formData, {
        headers: { Authorization: getAuthHeaders().Authorization || '' },
        onProgress,
      });
    };
    const isLarge = (upload) => upload.size > 1024 * 1024;

    // One retry for failures that happen before the server handles the upload (gateway /
    // service unavailable, dropped connection) — these made identical uploads "sometimes"
    // fail. A 504 is not retried: the upload may have completed, and a retry would duplicate it.
    // A large file that got no answer is not resent as-is: that is a size refusal (below).
    const sendWithRetry = async (upload) => {
      let result = await send(upload);
      const transient =
        result.status === 502 || result.status === 503 || (result.status === 0 && !isLarge(upload));
      if (transient) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        result = await send(upload);
      }
      return result;
    };

    let uploaded = file;
    let result = await sendWithRetry(file);
    // A proxy in front of the API may refuse large uploads: with 413, or with no usable answer
    // at all (its error page has no CORS headers, so the browser only says "Failed to fetch").
    // Real photos hit this while small images went through. Store a smaller copy instead.
    if (result.status === 413 || (result.status === 0 && isLarge(file))) {
      const smaller = await shrinkImageForUpload(file);
      if (smaller) {
        uploaded = smaller;
        result = await sendWithRetry(smaller);
      }
    }

    if (result.status === 0) {
      throw new Error(
        isLarge(uploaded)
          ? `Couldn't upload "${file.name}" (${formatBytes(uploaded.size)}): the server didn't respond. ` +
              'Smaller files upload fine, so this file is likely over the server\'s upload size limit.'
          : 'Upload failed: the connection dropped. Check your network and try again.'
      );
    }
    const payload = result.payload || {};
    if (result.status < 200 || result.status >= 300) {
      // Only a real quota error is a storage error; other 400s (file type, validation) used to be
      // reported as "storage limit exceeded", hiding the actual reason the upload failed.
      if (result.status === 400 && /storage limit/i.test(String(payload.message || ''))) {
        throw new StorageLimitError(payload.message, payload);
      }
      if (result.status === 413) {
        throw new Error(
          `"${file.name}" (${formatBytes(uploaded.size)}) is too large for the server to accept. Try a smaller file.`
        );
      }
      throw new Error(payload.message || `Upload failed (${result.status}). Please try again.`);
    }

    onProgress?.(1);
    const asset = payload.data?.asset || payload.asset || payload.data || payload;
    if (uploaded !== file && asset && typeof asset === 'object') asset.uploadedSmallerCopy = true;
    return asset;
  }

  async listAssets(workspaceId, { take = 50, skip = 0, source = 'all' } = {}) {
    const params = new URLSearchParams({
      take: String(Math.min(Math.max(take, 1), 100)),
      skip: String(Math.max(skip, 0)),
    });
    if (source && source !== 'all') params.set('source', source);

    const response = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.ASSETS.LIST(workspaceId)}?${params}`), {
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

  async listAllAssets(workspaceId, { source = 'all', pageSize = 100 } = {}) {
    const take = Math.min(Math.max(pageSize, 1), 100);
    const all = [];
    let skip = 0;

    while (true) {
      const page = await this.listAssets(workspaceId, { take, skip, source });
      if (!page.length) break;
      all.push(...page);
      if (page.length < take) break;
      skip += take;
    }

    return all;
  }

  async renameAsset(workspaceId, assetId, name) {
    const trimmed = String(name || '').trim();
    if (!trimmed) throw new Error('Name is required');

    const response = await fetch(
      buildUrl(API_CONFIG.ENDPOINTS.ASSETS.RENAME(workspaceId, assetId)),
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
      const err = await this.readErrorPayload(response);
      if (response.status === 403) {
        throw new AssetPermissionError(err.message, err);
      }
      throw new Error(err.message || `Failed to rename asset: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.asset || data.asset || data.data || data;
  }

  async deleteAsset(workspaceId, assetId) {
    const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.ASSETS.DELETE(workspaceId, assetId)), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const err = await this.readErrorPayload(response);
      if (response.status === 409) {
        throw new AssetInUseError(formatAssetInUseMessage({ message: err.message, data: err }), err);
      }
      if (response.status === 403) {
        throw new AssetPermissionError(err.message, err);
      }
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
    const name = String(asset?.name || asset?.fileName || '').toLowerCase();
    if (/\.(mp3|mpeg|wav|ogg|m4a|aac)$/.test(name)) return 'audio';
    if (/\.(mp4|webm|mov)$/.test(name)) return 'video';
    if (/\.(jpe?g|png|webp|gif|svg)$/.test(name)) return 'image';
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
      owner:
        asset.uploader?.name ||
        asset.uploadedByName ||
        asset.ownerName ||
        asset.uploaderName ||
        '',
      uploader: asset.uploader || null,
      uploadedBy: asset.uploadedBy || asset.uploader?.id || null,
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
