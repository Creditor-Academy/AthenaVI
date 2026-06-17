/** Resize, rotation, and snap helpers for canvas object manipulation. */

export const MIN_CLIP_WIDTH = 40;
export const MIN_CLIP_HEIGHT = 24;
export const MIN_TEXT_WIDTH = 40;
export const MIN_TEXT_HEIGHT = 20;

export const SNAP_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
export const SNAP_ANGLE_THRESHOLD = 4;

const CORNER_HANDLES = new Set(['top-left', 'top-right', 'bottom-left', 'bottom-right']);

export function isCornerHandle(handle) {
  return CORNER_HANDLES.has(handle);
}

export function normalizeAngle(degrees) {
  const n = degrees % 360;
  return n < 0 ? n + 360 : n;
}

export function snapAngle(degrees, snap = true) {
  const normalized = normalizeAngle(degrees);
  if (!snap) return Math.round(normalized);
  let best = normalized;
  let bestDist = Infinity;
  for (const target of SNAP_ANGLES) {
    const dist = Math.min(
      Math.abs(normalized - target),
      Math.abs(normalized - target - 360),
      Math.abs(normalized - target + 360)
    );
    if (dist < bestDist) {
      bestDist = dist;
      best = target;
    }
  }
  return bestDist <= SNAP_ANGLE_THRESHOLD ? best : Math.round(normalized);
}

/**
 * Compute new size/position for a resize drag.
 * Corner handles preserve aspect ratio; edge handles resize one axis.
 */
export function computeResize(
  handle,
  { width: origW, height: origH, x: origX, y: origY },
  dx,
  dy,
  { proportional = true, minWidth = MIN_CLIP_WIDTH, minHeight = MIN_CLIP_HEIGHT } = {}
) {
  let newW = origW;
  let newH = origH;
  let newX = origX;
  let newY = origY;

  const isCorner = isCornerHandle(handle);

  if (isCorner && proportional) {
    const aspect = origW / origH || 1;
    let scale = 1;

    if (handle === 'bottom-right') {
      scale = Math.max((origW + dx) / origW, (origH + dy) / origH);
    } else if (handle === 'bottom-left') {
      scale = Math.max((origW - dx) / origW, (origH + dy) / origH);
    } else if (handle === 'top-right') {
      scale = Math.max((origW + dx) / origW, (origH - dy) / origH);
    } else if (handle === 'top-left') {
      scale = Math.max((origW - dx) / origW, (origH - dy) / origH);
    }

    scale = Math.max(scale, minWidth / origW, minHeight / origH);
    newW = Math.max(minWidth, origW * scale);
    newH = Math.max(minHeight, newW / aspect);

    if (newH < minHeight) {
      newH = minHeight;
      newW = Math.max(minWidth, newH * aspect);
    }

    if (handle.includes('left')) newX = origX + origW - newW;
    if (handle.includes('top')) newY = origY + origH - newH;
  } else {
    if (handle.includes('right')) newW = Math.max(minWidth, origW + dx);
    if (handle.includes('left')) {
      newW = Math.max(minWidth, origW - dx);
      newX = origX + origW - newW;
    }
    if (handle.includes('bottom')) newH = Math.max(minHeight, origH + dy);
    if (handle.includes('top')) {
      newH = Math.max(minHeight, origH - dy);
      newY = origY + origH - newH;
    }
  }

  return {
    width: newW,
    height: newH,
    x: newX,
    y: newY,
  };
}

/** Rotation angle from pointer position relative to element center (degrees). */
export function pointerAngleFromCenter(clientX, clientY, centerX, centerY) {
  return (Math.atan2(clientY - centerY, clientX - centerX) * 180) / Math.PI + 90;
}

/** Composition-space center of a clip's transform box. */
export function getClipTransformCenter(clip, layout = null) {
  const x = Number(layout?.position?.x ?? clip?.position?.x ?? 0);
  const y = Number(layout?.position?.y ?? clip?.position?.y ?? 0);
  const width = Number(layout?.size?.width ?? clip?.size?.width ?? 200);
  const height = Number(layout?.size?.height ?? clip?.size?.height ?? 120);
  return { x: x + width / 2, y: y + height / 2 };
}

export function measureTextContentSize(element, { paddingX = 8, paddingY = 4 } = {}) {
  if (!element) return null;
  const width = Math.ceil(element.scrollWidth + paddingX);
  const height = Math.ceil(element.scrollHeight + paddingY);
  return { width, height };
}
