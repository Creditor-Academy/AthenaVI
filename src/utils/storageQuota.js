import storageService from '../services/storageService.js';
import { formatBytes } from './formatSize.js';

export const STORAGE_REFRESH_EVENT = 'storage-quota-refresh';

export function dispatchStorageRefresh() {
  window.dispatchEvent(new CustomEvent(STORAGE_REFRESH_EVENT));
}

export function getAvailableBytes(quota) {
  if (!quota) return null;
  if (quota.availableBytes != null && Number.isFinite(Number(quota.availableBytes))) {
    return Math.max(0, Number(quota.availableBytes));
  }
  const limit = Number(quota.limitBytes);
  const used = Number(quota.usedBytes);
  if (!Number.isFinite(limit) || !Number.isFinite(used)) return null;
  return Math.max(0, limit - used);
}

export function formatStorageTransactionType(type) {
  const labels = {
    initial: 'Initial allocation',
    platform_grant: 'Platform grant',
    platform_revoke: 'Platform revoke',
    purchase: 'Purchase',
  };
  return labels[type] || type || '—';
}

export class StorageLimitError extends Error {
  constructor(message, data = {}) {
    super(message || 'Storage limit exceeded');
    this.name = 'StorageLimitError';
    this.code = 'STORAGE_LIMIT_EXCEEDED';
    this.status = 400;
    this.data = data;
  }
}

export function formatStorageLimitMessage(error, { settingsPath = 'credits' } = {}) {
  const base =
    error?.message ||
    'Storage limit exceeded. Workspace assets, HeyGen scene videos, and completed renders count toward your quota.';
  return `${base} Contact your administrator to request more storage, or open Billing in Settings to review usage.`;
}

export function isStorageLimitError(error) {
  return (
    error?.code === 'STORAGE_LIMIT_EXCEEDED' ||
    error?.status === 400 && error instanceof StorageLimitError ||
    error instanceof StorageLimitError
  );
}

export async function assertUploadFits(workspaceId, fileSize) {
  const size = Number(fileSize);
  if (!Number.isFinite(size) || size <= 0) return;

  let available = null;

  if (workspaceId) {
    try {
      const ws = await storageService.getWorkspaceStorage(workspaceId);
      available = getAvailableBytes(ws?.quota);
    } catch {
      const personal = await storageService.getPersonalQuota();
      available = getAvailableBytes(personal);
    }
  } else {
    const personal = await storageService.getPersonalQuota();
    available = getAvailableBytes(personal);
  }

  if (available != null && size > available) {
    throw new StorageLimitError(
      `Not enough storage. This file needs ${formatBytes(size)} but only ${formatBytes(available)} is available.`,
      { availableBytes: available, fileSize: size }
    );
  }
}
