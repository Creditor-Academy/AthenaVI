import assetService from '../services/assetService';
import workspaceService from '../services/workspaceService';

export const HEYGEN_SOURCE_MAX_BYTES = 900 * 1024 * 1024;
export const HEYGEN_VOICE_MAX_BYTES = 100 * 1024 * 1024;
export const WORKSPACE_ASSET_MAX_BYTES = 50 * 1024 * 1024;

const UPLOADABLE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/webm',
]);

export async function resolveDefaultWorkspaceId() {
  const list = await workspaceService.listWorkspaces();
  const workspaces = Array.isArray(list)
    ? list
    : list?.workspaces ?? list?.data ?? [];
  return workspaces[0]?.id ?? null;
}

export function canUploadFileAsHeygenUrl(file) {
  if (!file) return false;
  const mime = (file.type || '').split(';')[0];
  return file.size <= WORKSPACE_ASSET_MAX_BYTES && UPLOADABLE_MIMES.has(mime);
}

export async function uploadFileAsHeygenUrl(file, workspaceId) {
  if (!file) throw new Error('No file provided');
  const mime = (file.type || '').split(';')[0];
  if (!UPLOADABLE_MIMES.has(mime)) {
    throw new Error('File type is not supported for upload.');
  }
  if (file.size > WORKSPACE_ASSET_MAX_BYTES) {
    throw new Error('File exceeds the 50 MB upload limit. Use a smaller file or trim your training video.');
  }

  const wsId = workspaceId || (await resolveDefaultWorkspaceId());
  if (!wsId) {
    throw new Error('No workspace found. Create a workspace first.');
  }

  const asset = await assetService.uploadAsset(wsId, file);
  const normalized = assetService.normalizeAsset(asset);
  const url = normalized?.url;
  if (!url) {
    throw new Error('Upload succeeded but no file URL was returned.');
  }

  return { url, workspaceId: wsId, assetId: normalized.id };
}

export function buildHeygenUrlAsset(url) {
  return { type: 'url', url };
}

/** HeyGen file union from POST /api/heygen/avatars|voices/upload response payload. */
export function buildHeygenFileAssetFromUploadPayload(payload) {
  if (!payload || typeof payload !== 'object') return null;

  const assetId = payload.asset_id ?? payload.assetId;
  if (assetId) {
    return { type: 'asset_id', asset_id: String(assetId) };
  }

  const url = payload.url;
  if (url) {
    return { type: 'url', url: String(url) };
  }

  return null;
}

/** Normalize File/Blob for multipart upload (strip codec suffix from MIME). */
export function normalizeHeygenUploadFile(file, fallbackName = 'upload') {
  if (!(file instanceof Blob) || file.size <= 0) return null;

  const baseMime = (file.type || '').split(';')[0].trim();
  const name = file.name || fallbackName;

  if (file instanceof File && (!baseMime || file.type === baseMime)) {
    return file;
  }

  return new File([file], name, {
    type: baseMime || file.type || 'application/octet-stream',
  });
}

/**
 * Multipart upload with upload progress (fetch cannot report upload %).
 * @param {{ url: string, formData: FormData, headers?: Record<string, string>, onProgress?: (p: { loaded: number, total: number, percent: number }) => void }} opts
 */
export function uploadFormDataWithProgress({ url, formData, headers = {}, onProgress }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    Object.entries(headers).forEach(([key, value]) => {
      if (value != null && value !== '') xhr.setRequestHeader(key, value);
    });

    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable) return;
      onProgress({
        loaded: event.loaded,
        total: event.total,
        percent: Math.min(100, Math.round((event.loaded / event.total) * 100)),
      });
    };

    xhr.onload = () => {
      const body = xhr.responseText || '';
      let json;
      try {
        json = body ? JSON.parse(body) : {};
      } catch {
        reject(new Error(body || `Upload failed: ${xhr.status}`));
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ status: xhr.status, data: json });
        return;
      }

      const message = json?.message || json?.error || `Upload failed: ${xhr.status}`;
      reject(Object.assign(new Error(message), { status: xhr.status, data: json }));
    };

    xhr.onerror = () => reject(new Error('Upload failed due to a network error.'));
    xhr.send(formData);
  });
}
