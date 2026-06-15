/**
 * Product Launch template assets — loaded from public/templates/product-launch-assets.json.
 */

let cached = null;

export async function loadProductLaunchAssets() {
  if (cached) return cached;
  const response = await fetch('/templates/product-launch-assets.json');
  if (!response.ok) throw new Error('Failed to load product launch assets');
  cached = await response.json();
  return cached;
}

export function getProductLaunchAssetsSync() {
  return cached;
}

export function productLaunchImagesAsMedia(assets = cached) {
  return (assets?.images || []).map((item) => ({
    id: item.id,
    name: item.name,
    image: item.thumb || item.src,
    full: item.src,
    type: 'image',
    role: item.role,
  }));
}

export function productLaunchShapesAsLibrary(assets = cached) {
  return (assets?.shapes || []).map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category || 'product-launch',
    role: item.role || 'decoration',
    style: item.style,
  }));
}
