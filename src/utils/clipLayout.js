import { isBackgroundClip } from './editorLayerUtils';
import { isTextLayer, parseCssPx, resolveTextClipRect } from './textClip';

export const COMPOSITION_W = 1920;
export const COMPOSITION_H = 1080;

function parseSizeNum(value) {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string') {
    const n = parseFloat(value);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

/**
 * Templates store position as % (e.g. x: 6, y: 20) with pixel-sized boxes.
 * Editor canvas expects top-left pixel coords on a 1920×1080 frame.
 */
export function usesPercentPosition(clip) {
  if (!clip?.position || clip._coordsNormalized || clip._userPlaced || isBackgroundClip(clip)) {
    return false;
  }

  const x = Number(clip.position.x ?? 0);
  const y = Number(clip.position.y ?? 0);
  if (x > 100 || y > 100) return false;

  const width = parseSizeNum(clip.size?.width);
  const height = parseSizeNum(clip.size?.height);
  const styleWidth = parseCssPx(clip.style?.width) || 0;

  if (width > 100 || height > 100 || styleWidth > 100) return true;
  if (x <= 90 && y <= 90 && (width > 0 || height > 0 || clip.type === 'text' || isTextLayer(clip))) {
    return true;
  }

  return false;
}

export function percentToPixelPosition(position = {}, canvas = { width: COMPOSITION_W, height: COMPOSITION_H }) {
  const w = canvas.width ?? COMPOSITION_W;
  const h = canvas.height ?? COMPOSITION_H;
  return {
    x: Math.round((Number(position.x ?? 0) / 100) * w),
    y: Math.round((Number(position.y ?? 0) / 100) * h),
  };
}

/** Persist template % coords as pixel position (run once on import). */
export function normalizeClipCoords(clip, resolution = { width: COMPOSITION_W, height: COMPOSITION_H }) {
  if (!clip) return clip;
  if (clip._coordsNormalized || clip._userPlaced) return clip;

  if (!usesPercentPosition(clip)) {
    return { ...clip, _coordsNormalized: true };
  }

  return {
    ...clip,
    position: percentToPixelPosition(clip.position, resolution),
    _coordsNormalized: true,
  };
}

export function normalizeSceneClips(clips = [], resolution = { width: COMPOSITION_W, height: COMPOSITION_H }) {
  return clips.map((clip) => normalizeClipCoords(clip, resolution));
}

/**
 * Single layout box for edit canvas and Remotion playback.
 * Top-left anchor in composition pixels.
 */
export function resolveClipRect(clip, resolution = { width: COMPOSITION_W, height: COMPOSITION_H }) {
  const w = resolution.width ?? COMPOSITION_W;
  const h = resolution.height ?? COMPOSITION_H;

  let working = clip;
  if (usesPercentPosition(clip)) {
    working = {
      ...clip,
      position: percentToPixelPosition(clip.position, { width: w, height: h }),
    };
  }

  if (clip?.type === 'text' || isTextLayer(clip)) {
    return resolveTextClipRect(working);
  }

  const pos = {
    x: Number(working?.position?.x ?? 0),
    y: Number(working?.position?.y ?? 0),
  };
  const size = {
    width:
      typeof working?.size?.width === 'number'
        ? working.size.width
        : parseSizeNum(working?.size?.width) || 400,
    height:
      typeof working?.size?.height === 'number'
        ? working.size.height
        : parseSizeNum(working?.size?.height) || 300,
  };

  return { position: pos, size, fontSize: null };
}

/** Map editor pixel coords (1920×1080) to % for Remotion composition */
export function pixelRectToPercent(position = {}, size = {}, canvas = { width: COMPOSITION_W, height: COMPOSITION_H }) {
  const cw = canvas.width ?? COMPOSITION_W;
  const ch = canvas.height ?? COMPOSITION_H;
  const x = Number(position.x ?? 0);
  const y = Number(position.y ?? 0);
  const width = size.width ?? 'auto';
  const height = size.height ?? 'auto';

  return {
    left: `${(x / cw) * 100}%`,
    top: `${(y / ch) * 100}%`,
    width: typeof width === 'number' ? `${(width / cw) * 100}%` : width,
    height: typeof height === 'number' ? `${(height / ch) * 100}%` : height,
  };
}
