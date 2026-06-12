/**
 * Social Short template assets — loaded from public/templates/social-short-assets.json.
 */

let cached = null;

export async function loadSocialShortAssets() {
  if (cached) return cached;
  const response = await fetch('/templates/social-short-assets.json');
  if (!response.ok) throw new Error('Failed to load social short assets');
  cached = await response.json();
  return cached;
}

export function getSocialShortAssetsSync() {
  return cached;
}

export function socialShortImagesAsMedia(assets = cached) {
  return (assets?.images || []).map((item) => ({
    id: item.id,
    name: item.name,
    image: item.thumb || item.src,
    full: item.src,
    type: 'image',
    role: item.role,
  }));
}

export function socialShortShapesAsLibrary(assets = cached) {
  return (assets?.shapes || []).map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category || 'social-short',
    role: item.role || 'decoration',
    style: item.style,
  }));
}
