/** Text-only canvas transform helpers (Canva-style interactions). */

import {
  computeResize,
  getResizeAnchorPoint,
  localizePointerDelta,
  MIN_TEXT_HEIGHT,
  MIN_TEXT_WIDTH,
  normalizeAngle,
  pointerAngleFromCenter,
} from './canvasTransformUtils';
import { getClipCenter } from './clipTransformUtils';
import { resolveClipRect } from './clipLayout';
import { isTextLayer } from './textClip';

export const TEXT_SNAP_ANGLES = Array.from({ length: 24 }, (_, i) => i * 15);
export const TEXT_SNAP_ANGLE_THRESHOLD = 4;

export function snapTextAngle(degrees, snap = true) {
  const normalized = normalizeAngle(degrees);
  if (!snap) return Math.round(normalized);
  let best = normalized;
  let bestDist = Infinity;
  for (const target of TEXT_SNAP_ANGLES) {
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
  return bestDist <= TEXT_SNAP_ANGLE_THRESHOLD ? best : Math.round(normalized);
}

/** Resize with optional center anchor (Alt) for text boxes. */
export function computeTextResize(
  handle,
  bounds,
  dx,
  dy,
  { proportional = false, fromCenter = false, rotation = 0 } = {}
) {
  const { width: origW, height: origH, x: origX, y: origY } = bounds;
  const { dx: localDx, dy: localDy } = localizePointerDelta(dx, dy, rotation);

  if (!fromCenter) {
    return computeResize(handle, bounds, localDx, localDy, {
      proportional,
      minWidth: MIN_TEXT_WIDTH,
      minHeight: MIN_TEXT_HEIGHT,
    });
  }

  const cx = origX + origW / 2;
  const cy = origY + origH / 2;
  const anchor = { x: cx, y: cy };
  const handlePoint = getHandlePointForCenterResize(handle, origX, origY, origW, origH);
  const dragX = handlePoint.x + localDx;
  const dragY = handlePoint.y + localDy;

  let width = Math.abs(dragX - anchor.x) * 2;
  let height = Math.abs(dragY - anchor.y) * 2;
  width = Math.max(MIN_TEXT_WIDTH, width);
  height = Math.max(MIN_TEXT_HEIGHT, height);

  if (proportional) {
    const aspect = origW / origH || 1;
    const scale = Math.max(width / origW, height / origH);
    width = Math.max(MIN_TEXT_WIDTH, origW * scale);
    height = Math.max(MIN_TEXT_HEIGHT, width / aspect);
  }

  return {
    x: cx - width / 2,
    y: cy - height / 2,
    width,
    height,
  };
}

function getHandlePointForCenterResize(handle, x, y, width, height) {
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
      return { x: cx, y: cy };
  }
}

export function isCornerResizeHandle(handle) {
  return ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(handle);
}

export function isSideResizeHandle(handle) {
  return ['top', 'bottom', 'left', 'right'].includes(handle);
}

/** Axis-aligned bounds for smart guides (uses layout rect, not rotated AABB). */
export function getTextClipBounds(clip) {
  const layout = resolveClipRect(clip);
  return {
    id: clip.id,
    x: layout.position.x,
    y: layout.position.y,
    width: Number(layout.size.width) || 0,
    height: Number(layout.size.height) || 0,
    centerX: layout.position.x + (Number(layout.size.width) || 0) / 2,
    centerY: layout.position.y + (Number(layout.size.height) || 0) / 2,
    right: layout.position.x + (Number(layout.size.width) || 0),
    bottom: layout.position.y + (Number(layout.size.height) || 0),
  };
}

export function getTextClips(clips = []) {
  return clips.filter((c) => c.type === 'text' || isTextLayer(c));
}

export function rectsIntersect(a, b) {
  return !(a.x + a.width < b.x || b.x + b.width < a.x || a.y + a.height < b.y || b.y + b.height < a.y);
}

export function getClipCenterFromLayout(clip) {
  return getClipCenter(clip);
}
