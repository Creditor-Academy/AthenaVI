import assetService from '../services/assetService';
import workspaceService from '../services/workspaceService';

export const HEYGEN_SOURCE_MAX_BYTES = 900 * 1024 * 1024;
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
