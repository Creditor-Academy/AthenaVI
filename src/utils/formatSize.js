const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

export function formatBytes(bytes, decimals = 1) {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n < 0) return '-';
  if (n === 0) return '0 B';

  const k = 1024;
  const unitIndex = Math.min(
    Math.floor(Math.log(n) / Math.log(k)),
    SIZE_UNITS.length - 1
  );
  const value = n / k ** unitIndex;
  const fractionDigits = unitIndex === 0 ? 0 : decimals;

  return `${value.toFixed(fractionDigits)} ${SIZE_UNITS[unitIndex]}`;
}

/** Parse numeric bytes or strings like "12.5 MB" into a byte count. */
export function parseSizeToBytes(value) {
  if (value == null || value === '') return null;

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value >= 0 ? value : null;
  }

  const str = String(value).trim();
  if (!str) return null;

  const unitMatch = str.match(/^([\d.]+)\s*(B|KB|MB|GB|TB)$/i);
  if (unitMatch) {
    const amount = Number(unitMatch[1]);
    if (!Number.isFinite(amount)) return null;
    const unit = unitMatch[2].toUpperCase();
    const power = SIZE_UNITS.indexOf(unit);
    if (power < 0) return null;
    return Math.round(amount * 1024 ** power);
  }

  const plain = Number(str);
  if (Number.isFinite(plain) && str.match(/^-?\d+(\.\d+)?$/)) {
    return plain >= 0 ? plain : null;
  }

  return null;
}

export function getProjectBytes(item) {
  if (!item) return null;

  const candidates = [
    item.sizeBytes,
    item.fileSizeBytes,
    item.storageBytes,
    item.bytes,
    item.fileSize,
    item.file_size,
    item.size
  ];

  for (const candidate of candidates) {
    const parsed = parseSizeToBytes(candidate);
    if (parsed != null) return parsed;
  }

  return null;
}

export function formatProjectSize(video) {
  const bytes = getProjectBytes(video);
  if (bytes != null) return formatBytes(bytes);
  if (video?.duration) return String(video.duration);
  return '-';
}

export function formatFolderSize(folder) {
  if (Array.isArray(folder?.videos) && folder.videos.length > 0) {
    const totalBytes = folder.videos.reduce((sum, video) => {
      const bytes = getProjectBytes(video);
      return bytes != null ? sum + bytes : sum;
    }, 0);

    if (totalBytes > 0) return formatBytes(totalBytes);

    const count = folder.videos.length;
    return `${count} ${count === 1 ? 'item' : 'items'}`;
  }

  if (folder?.projectCount != null) {
    const count = Number(folder.projectCount);
    if (Number.isFinite(count)) {
      return `${count} ${count === 1 ? 'item' : 'items'}`;
    }
  }

  const folderBytes = getProjectBytes(folder);
  if (folderBytes != null) return formatBytes(folderBytes);

  return '-';
}
