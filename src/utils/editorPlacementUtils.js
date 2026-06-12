/** Safe zone on 1920×1080 — matches CanvasGuidesOverlay 5% inset. */
export const COMPOSITION_W = 1920;
export const COMPOSITION_H = 1080;

export const SAFE_ZONE = {
  x: Math.round(COMPOSITION_W * 0.05),
  y: Math.round(COMPOSITION_H * 0.05),
  w: Math.round(COMPOSITION_W * 0.9),
  h: Math.round(COMPOSITION_H * 0.9),
};

function parseShapePx(value, fallback = 200) {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  const n = parseInt(String(value ?? ''), 10);
  return Number.isNaN(n) ? fallback : n;
}

function clampPlacement(x, y, width, height) {
  const maxX = SAFE_ZONE.x + SAFE_ZONE.w;
  const maxY = SAFE_ZONE.y + SAFE_ZONE.h;
  const w = Math.min(width, SAFE_ZONE.w);
  const h = Math.min(height, SAFE_ZONE.h);
  const nx = Math.max(SAFE_ZONE.x, Math.min(x, maxX - w));
  const ny = Math.max(SAFE_ZONE.y, Math.min(y, maxY - h));
  return { position: { x: Math.round(nx), y: Math.round(ny) }, size: { width: Math.round(w), height: Math.round(h) } };
}

/** Default size + centered safe-area placement for topbar inserts. */
export function getDefaultClipPlacement(type, content, meta = {}) {
  if (meta?.size) {
    const width = meta.size.width;
    const height = meta.size.height;
    if (meta?.position) {
      return clampPlacement(meta.position.x, meta.position.y, width, height);
    }
    const x = SAFE_ZONE.x + Math.round((SAFE_ZONE.w - width) / 2);
    const y = SAFE_ZONE.y + Math.round((SAFE_ZONE.h - height) / 2);
    return clampPlacement(x, y, width, height);
  }

  let width;
  let height;

  if (type === 'icon') {
    width = 120;
    height = 120;
  } else if (type === 'shape') {
    const scale = meta?.role === 'frame' ? 1.4 : 1.3;
    width = Math.round(parseShapePx(content?.style?.width, 260) * scale);
    height = Math.round(parseShapePx(content?.style?.height, 260) * scale);
    if (height < 12) height = 12;
    width = Math.max(meta?.role === 'frame' ? 300 : 180, width);
    height = Math.max(meta?.role === 'frame' ? 300 : 180, height);
  } else if (type === 'image') {
    width = meta?.role === 'logo' ? 320 : 560;
    height = meta?.role === 'logo' ? 80 : 420;
  } else if (type === 'video') {
    width = 640;
    height = 360;
  } else if (type === 'text') {
    width = 800;
    height = 120;
  } else {
    width = 480;
    height = 480;
  }

  if (meta?.dropAt) {
    return clampPlacement(
      meta.dropAt.x - width / 2,
      meta.dropAt.y - height / 2,
      width,
      height
    );
  }

  const x = SAFE_ZONE.x + Math.round((SAFE_ZONE.w - width) / 2);
  const y = SAFE_ZONE.y + Math.round((SAFE_ZONE.h - height) / 2);
  return clampPlacement(x, y, width, height);
}

/** Map a screen point to composition pixels (accounts for canvas scale + offset). */
export function clientToComposition(
  clientX,
  clientY,
  containerEl,
  displayScale,
  displayOffset,
  compositionWidth = COMPOSITION_W,
  compositionHeight = COMPOSITION_H
) {
  if (!containerEl || !displayScale) {
    return { x: compositionWidth / 2, y: compositionHeight / 2 };
  }
  const rect = containerEl.getBoundingClientRect();
  const x = (clientX - rect.left - (displayOffset?.x ?? 0)) / displayScale;
  const y = (clientY - rect.top - (displayOffset?.y ?? 0)) / displayScale;
  return {
    x: Math.max(0, Math.min(compositionWidth, Math.round(x))),
    y: Math.max(0, Math.min(compositionHeight, Math.round(y))),
  };
}
