import { sortClipsByPaintOrder } from './editorLayerUtils';

export function setCanvasDragData(e, payload) {
  e.dataTransfer.setData('application/json', JSON.stringify(payload));
  e.dataTransfer.effectAllowed = 'copy';
}

export function parseCanvasDragData(e) {
  try {
    const raw = e.dataTransfer.getData('application/json');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function resolveDropImageSrc(content) {
  if (!content) return null;
  if (typeof content === 'string') return content;
  return content.url || content.src || content.full || null;
}

export function resolveDropAssetId(content) {
  if (!content || typeof content !== 'object') return null;
  return content.assetId || content.id || null;
}

export function isFrameClip(clip) {
  return clip?.type === 'shape' && clip?.role === 'frame';
}

/** Top-most image frame under composition coordinates (1920×1080). */
export function findTopFrameAtPoint(clips, x, y) {
  const sorted = sortClipsByPaintOrder(clips || []).slice().reverse();
  for (const clip of sorted) {
    if (!isFrameClip(clip) || clip.locked) continue;
    const px = Number(clip.position?.x ?? 0);
    const py = Number(clip.position?.y ?? 0);
    const w = Number(clip.size?.width ?? 0);
    const h = Number(clip.size?.height ?? 0);
    if (w > 0 && h > 0 && x >= px && x <= px + w && y >= py && y <= py + h) {
      return clip;
    }
  }
  return null;
}

export function buildShapeImageFillPatch(src, assetId = null, objectFit = 'cover') {
  return {
    fillSrc: src,
    fillAssetId: assetId || undefined,
    fillObjectFit: objectFit,
  };
}

export function clearShapeImageFillPatch() {
  return {
    fillSrc: null,
    fillAssetId: undefined,
    fillObjectFit: undefined,
  };
}

/** @deprecated use findTopFrameAtPoint */
export const findTopShapeAtPoint = findTopFrameAtPoint;

export function canAcceptImageFill(clip) {
  return isFrameClip(clip) && !clip.locked;
}
