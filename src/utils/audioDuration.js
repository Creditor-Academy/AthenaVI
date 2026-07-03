/**
 * Read audio duration from a blob or remote URL via a temporary Audio element.
 */
export function probeAudioDuration(src, { timeoutMs = 12000, crossOrigin = false } = {}) {
  if (!src || typeof src !== 'string') return Promise.resolve(null);

  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    if (crossOrigin) audio.crossOrigin = 'anonymous';

    const cleanup = () => {
      audio.onloadedmetadata = null;
      audio.onerror = null;
      audio.src = '';
    };

    const timer = setTimeout(() => {
      cleanup();
      resolve(null);
    }, timeoutMs);

    audio.onloadedmetadata = () => {
      clearTimeout(timer);
      const duration = audio.duration;
      cleanup();
      resolve(Number.isFinite(duration) && duration > 0 ? duration : null);
    };

    audio.onerror = () => {
      clearTimeout(timer);
      cleanup();
      resolve(null);
    };

    audio.src = src;
  });
}

/** Probe duration from a local File without revoking the blob URL (caller owns lifecycle). */
export function createAudioBlobPreview(file) {
  if (!file) return null;
  const previewBlobUrl = URL.createObjectURL(file);
  return {
    previewBlobUrl,
    durationPromise: probeAudioDuration(previewBlobUrl),
  };
}

export function isAudioFile(file) {
  if (!file) return false;
  if (String(file.type || '').startsWith('audio/')) return true;
  return /\.(mp3|wav|ogg|webm|m4a|aac|flac)$/i.test(String(file.name || ''));
}
