/** Resize, rotation, and snap helpers for canvas object manipulation. */

import { getClipCenter } from './clipTransformUtils';

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

/** Fixed anchor point (opposite edge/corner) while resizing from `handle`. */
export function getResizeAnchorPoint(handle, x, y, width, height) {
  const right = x + width;
  const bottom = y + height;
  const cx = x + width / 2;
  const cy = y + height / 2;

  switch (handle) {
    case 'top-left':
      return { x: right, y: bottom };
    case 'top-right':
      return { x, y: bottom };
    case 'bottom-left':
      return { x: right, y };
    case 'bottom-right':
      return { x, y };
    case 'top':
      return { x: cx, y: bottom };
    case 'bottom':
      return { x: cx, y };
    case 'left':
      return { x: right, y: cy };
    case 'right':
      return { x, y: cy };
    default:
      return { x, y };
  }
}

function getHandlePoint(handle, x, y, width, height) {
  const right = x + width;
  const bottom = y + height;
  const cx = x + width / 2;
  const cy = y + height / 2;

  switch (handle) {
    case 'top-left':
      return { x, y };
    case 'top-right':
      return { x: right, y };
    case 'bottom-left':
      return { x, y: bottom };
    case 'bottom-right':
      return { x: right, y: bottom };
    case 'top':
      return { x: cx, y };
    case 'bottom':
      return { x: cx, y: bottom };
    case 'left':
      return { x, y: cy };
    case 'right':
      return { x: right, y: cy };
    default:
      return { x, y };
  }
}

function buildRectFromAnchorDrag(
  handle,
  anchor,
  dragX,
  dragY,
  { minWidth, minHeight, origX, origY, origW, origH, proportional }
) {
  const ax = anchor.x;
  const ay = anchor.y;
  let x;
  let y;
  let width;
  let height;

  if (handle === 'bottom-right') {
    x = ax;
    y = ay;
    width = dragX - ax;
    height = dragY - ay;
  } else if (handle === 'top-left') {
    x = dragX;
    y = dragY;
    width = ax - dragX;
    height = ay - dragY;
  } else if (handle === 'top-right') {
    x = ax;
    y = dragY;
    width = dragX - ax;
    height = ay - dragY;
  } else if (handle === 'bottom-left') {
    x = dragX;
    y = ay;
    width = ax - dragX;
    height = dragY - ay;
  } else if (handle === 'top') {
    x = origX;
    y = dragY;
    width = origW;
    height = ay - dragY;
  } else if (handle === 'bottom') {
    x = origX;
    y = ay;
    width = origW;
    height = dragY - ay;
  } else if (handle === 'left') {
    x = dragX;
    y = origY;
    width = ax - dragX;
    height = origH;
  } else if (handle === 'right') {
    x = ax;
    y = origY;
    width = dragX - ax;
    height = origH;
  } else {
    return { x: origX, y: origY, width: origW, height: origH };
  }

  width = Math.max(minWidth, width);
  height = Math.max(minHeight, height);

  if (proportional && isCornerHandle(handle)) {
    const aspect = origW / origH || 1;
    const scale = Math.max(width / origW, height / origH);
    width = Math.max(minWidth, origW * scale);
    height = Math.max(minHeight, width / aspect);
    if (height < minHeight) {
      height = minHeight;
      width = Math.max(minWidth, height * aspect);
    }
  }

  if (handle === 'top-left') {
    x = ax - width;
    y = ay - height;
  } else if (handle === 'top-right') {
    x = ax;
    y = ay - height;
  } else if (handle === 'bottom-left') {
    x = ax - width;
    y = ay;
  } else if (handle === 'top') {
    x = origX;
    y = ay - height;
  } else if (handle === 'left') {
    x = ax - width;
    y = origY;
  } else if (handle === 'bottom-right') {
    x = ax;
    y = ay;
  } else if (handle === 'bottom') {
    x = origX;
    y = ay;
  } else if (handle === 'right') {
    x = ax;
    y = origY;
  }

  return { x, y, width, height };
}

/** Map screen-space drag delta into clip-local axes when the clip is rotated. */
export function localizePointerDelta(dx, dy, rotationDeg = 0) {
  if (!rotationDeg) return { dx, dy };
  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    dx: dx * cos + dy * sin,
    dy: -dx * sin + dy * cos,
  };
}

/**
 * Compute new size/position for a resize drag.
 * The edge/corner opposite the dragged handle stays fixed on the canvas.
 */
export function computeResize(
  handle,
  { width: origW, height: origH, x: origX, y: origY },
  dx,
  dy,
  { proportional = false, minWidth = MIN_CLIP_WIDTH, minHeight = MIN_CLIP_HEIGHT } = {}
) {
  const anchor = getResizeAnchorPoint(handle, origX, origY, origW, origH);
  const handlePoint = getHandlePoint(handle, origX, origY, origW, origH);
  const dragX = handlePoint.x + dx;
  const dragY = handlePoint.y + dy;

  const result = buildRectFromAnchorDrag(handle, anchor, dragX, dragY, {
    minWidth,
    minHeight,
    origX,
    origY,
    origW,
    origH,
    proportional: proportional && isCornerHandle(handle),
  });

  return {
    width: result.width,
    height: result.height,
    x: result.x,
    y: result.y,
  };
}

/** Rotation angle from pointer position relative to element center (degrees). */
export function pointerAngleFromCenter(clientX, clientY, centerX, centerY) {
  return (Math.atan2(clientY - centerY, clientX - centerX) * 180) / Math.PI + 90;
}

/** Composition-space center of a clip's transform box. */
export function getClipTransformCenter(clip, layout = null) {
  return getClipCenter(clip, layout);
}

export function measureTextContentSize(element, { paddingX = 8, paddingY = 4 } = {}) {
  if (!element) return null;
  const width = Math.ceil(element.scrollWidth + paddingX);
  const height = Math.ceil(element.scrollHeight + paddingY);
  return { width, height };
}
