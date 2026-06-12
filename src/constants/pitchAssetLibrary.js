/**
 * Single source of truth for pitch-deck template assets.
 * Loaded from public/templates/pitch-assets.json (also used by build-pitch-template.mjs).
 */

let cached = null;

export async function loadPitchAssets() {
  if (cached) return cached;
  const response = await fetch('/templates/pitch-assets.json');
  if (!response.ok) throw new Error('Failed to load pitch assets');
  cached = await response.json();
  return cached;
}

/** Synchronous access after first load (editor panels call loadPitchAssets on mount). */
export function getPitchAssetsSync() {
  return cached;
}

export function getPitchImage(id, assets = cached) {
  return assets?.images?.find((item) => item.id === id);
}

export function getPitchIcon(id, assets = cached) {
  return assets?.icons?.find((item) => item.id === id);
}

export function getPitchShape(id, assets = cached) {
  return assets?.shapes?.find((item) => item.id === id);
}

/** Map pitch images into editor media-grid shape. */
export function pitchImagesAsMedia(assets = cached) {
  return (assets?.images || []).map((item) => ({
    id: item.id,
    name: item.name,
    image: item.thumb || item.src,
    full: item.src,
    type: 'image',
    role: item.role,
  }));
}

/** Map pitch shapes into shape-library cell shape. */
export function pitchShapesAsLibrary(assets = cached) {
  return (assets?.shapes || []).map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category || 'pitch',
    role: item.role || 'decoration',
    style: item.style,
  }));
}
