/**
 * Unified clip transform model for live canvas, Remotion preview, and export parity.
 * Position is top-left of the clip box; transforms use center-center origin.
 */

import { resolveClipRect } from './clipLayout';

export const CLIP_TRANSFORM_ORIGIN = 'center center';

/** Read flip scale from style.scaleX/Y or legacy flipHorizontal/flipVertical booleans. */
export function getClipFlipScale(style = {}) {
  let scaleX = 1;
  let scaleY = 1;

  if (style.scaleX === -1 || style.flipHorizontal === true) scaleX = -1;
  if (style.scaleY === -1 || style.flipVertical === true) scaleY = -1;

  return { scaleX, scaleY };
}

/** Map flip booleans for backend serialization. */
export function flipScaleToBackendFlags(style = {}) {
  const { scaleX, scaleY } = getClipFlipScale(style);
  return {
    flipHorizontal: scaleX === -1,
    flipVertical: scaleY === -1,
  };
}

/** Map backend flip flags into editor style.scaleX/Y. */
export function backendFlagsToFlipScale(style = {}) {
  const next = { ...style };
  if (style.flipHorizontal === true) next.scaleX = -1;
  else if (next.scaleX == null) next.scaleX = 1;
  if (style.flipVertical === true) next.scaleY = -1;
  else if (next.scaleY == null) next.scaleY = 1;
  return next;
}

/**
 * Build CSS transform string + origin for a clip.
 * Order: translate(anim) → rotate → uniform scale → flip scale
 */
export function buildClipTransform(clip, anim = {}) {
  const rotation = (clip?.rotation ?? 0) + (anim.rotation ?? 0);
  const uniformScale = (anim.scale ?? 1) * (clip?.scale ?? 1);
  const { scaleX: flipX, scaleY: flipY } = getClipFlipScale(clip?.style || {});

  const parts = [];
  const tx = anim.translateX ?? 0;
  const ty = anim.translateY ?? 0;
  if (tx !== 0 || ty !== 0) parts.push(`translate(${tx}px, ${ty}px)`);
  if (rotation !== 0) parts.push(`rotate(${rotation}deg)`);
  if (uniformScale !== 1) parts.push(`scale(${uniformScale})`);
  if (flipX !== 1 || flipY !== 1) parts.push(`scale(${flipX}, ${flipY})`);

  return {
    transform: parts.length ? parts.join(' ') : undefined,
    transformOrigin: CLIP_TRANSFORM_ORIGIN,
  };
}

/** Composition-space center of a clip's transform box. */
export function getClipCenter(clip, layout = null) {
  const x = Number(layout?.position?.x ?? clip?.position?.x ?? 0);
  const y = Number(layout?.position?.y ?? clip?.position?.y ?? 0);
  const width = Number(layout?.size?.width ?? clip?.size?.width ?? 200);
  const height = Number(layout?.size?.height ?? clip?.size?.height ?? 120);
  return { x: x + width / 2, y: y + height / 2 };
}

/** Axis-aligned bounding box of a rotated clip in composition space. */
export function getOrientedBounds(clip, layout = null) {
  const resolved = layout || resolveClipRect(clip);
  const x = Number(resolved.position?.x ?? 0);
  const y = Number(resolved.position?.y ?? 0);
  const w = Number(resolved.size?.width ?? 0);
  const h = Number(resolved.size?.height ?? 0);
  const rotation = ((clip?.rotation ?? 0) * Math.PI) / 180;

  if (!rotation) {
    return { x, y, width: w, height: h };
  }

  const cx = x + w / 2;
  const cy = y + h / 2;
  const corners = [
    { x: x, y: y },
    { x: x + w, y: y },
    { x: x + w, y: y + h },
    { x: x, y: y + h },
  ].map((p) => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    return {
      x: cx + dx * cos - dy * sin,
      y: cy + dx * sin + dy * cos,
    };
  });

  const xs = corners.map((c) => c.x);
  const ys = corners.map((c) => c.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

const degToRad = (deg) => (deg * Math.PI) / 180;

/** 2D affine matrix as [a, b, c, d, e, f] (SVG/CSS order). */
export function buildTransformMatrix({ x = 0, y = 0, width = 0, height = 0, rotation = 0, scale = 1, flipX = 1, flipY = 1 }) {
  const cx = x + width / 2;
  const cy = y + height / 2;
  const rad = degToRad(rotation);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const s = scale;

  // T(cx,cy) * R * S(s*flip) * T(-cx,-cy) as 2x3
  const a = cos * s * flipX;
  const b = sin * s * flipX;
  const c = -sin * s * flipY;
  const d = cos * s * flipY;
  const e = cx - a * cx - c * cy;
  const f = cy - b * cx - d * cy;

  return { a, b, c, d, e, f, x, y, width, height, rotation, scale, flipX, flipY };
}

export function clipToTransformMatrix(clip, layout = null) {
  const resolved = layout || resolveClipRect(clip);
  const { scaleX, scaleY } = getClipFlipScale(clip?.style || {});
  return buildTransformMatrix({
    x: resolved.position.x,
    y: resolved.position.y,
    width: resolved.size.width,
    height: resolved.size.height,
    rotation: clip?.rotation ?? 0,
    scale: clip?.scale ?? 1,
    flipX: scaleX,
    flipY: scaleY,
  });
}

function applyMatrixToPoint(m, px, py) {
  return {
    x: m.a * px + m.c * py + m.e,
    y: m.b * px + m.d * py + m.f,
  };
}

/** Compose parent world matrix with child local placement (top-left anchored box). */
export function composeWorldTransform(parentMatrix, localClip, localLayout = null) {
  const local = clipToTransformMatrix(localClip, localLayout);
  const origin = applyMatrixToPoint(parentMatrix, local.x, local.y);
  const childRotation = (parentMatrix.rotation ?? 0) + (localClip.rotation ?? 0);
  const childScale = (parentMatrix.scale ?? 1) * (localClip.scale ?? 1);
  const childFlipX = (parentMatrix.flipX ?? 1) * (local.flipX ?? 1);
  const childFlipY = (parentMatrix.flipY ?? 1) * (local.flipY ?? 1);

  return buildTransformMatrix({
    x: origin.x,
    y: origin.y,
    width: local.width,
    height: local.height,
    rotation: childRotation,
    scale: childScale,
    flipX: childFlipX,
    flipY: childFlipY,
  });
}

/** Convert world-space clip props to local coords relative to group origin matrix. */
export function worldToLocalTransform(groupMatrix, worldClip, worldLayout = null) {
  const world = clipToTransformMatrix(worldClip, worldLayout);
  const invRad = degToRad(-(groupMatrix.rotation ?? 0));
  const icos = Math.cos(invRad);
  const isin = Math.sin(invRad);
  const gs = groupMatrix.scale ?? 1;
  const gFlipX = groupMatrix.flipX ?? 1;
  const gFlipY = groupMatrix.flipY ?? 1;

  const gcx = groupMatrix.x + groupMatrix.width / 2;
  const gcy = groupMatrix.y + groupMatrix.height / 2;
  const wcx = world.x + world.width / 2;
  const wcy = world.y + world.height / 2;

  const dx = (wcx - gcx) / gs;
  const dy = (wcy - gcy) / gs;
  const localCx = gcx + dx * icos - dy * isin;
  const localCy = gcy + dx * isin + dy * icos;

  const localX = localCx - world.width / 2;
  const localY = localCy - world.height / 2;
  const localRotation = (world.rotation ?? 0) - (groupMatrix.rotation ?? 0);
  const localScale = (world.scale ?? 1) / gs;
  const localFlipX = (world.flipX ?? 1) / gFlipX;
  const localFlipY = (world.flipY ?? 1) / gFlipY;

  return {
    position: { x: localX, y: localY },
    size: { width: world.width, height: world.height },
    rotation: localRotation,
    scale: localScale,
    style: {
      ...(worldClip.style || {}),
      scaleX: localFlipX < 0 ? -1 : 1,
      scaleY: localFlipY < 0 ? -1 : 1,
    },
  };
}

/** Bake group matrix into child world placement (for ungroup). */
export function localToWorldTransform(groupMatrix, localClip, localLayout = null) {
  const local = clipToTransformMatrix(localClip, localLayout);
  const composed = composeWorldTransform(groupMatrix, localClip, localLayout);
  return {
    position: { x: composed.x, y: composed.y },
    size: { width: composed.width, height: composed.height },
    rotation: composed.rotation,
    scale: composed.scale,
    style: {
      ...(localClip.style || {}),
      scaleX: composed.flipX < 0 ? -1 : 1,
      scaleY: composed.flipY < 0 ? -1 : 1,
    },
  };
}
