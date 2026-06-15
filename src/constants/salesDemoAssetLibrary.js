/**
 * Sales Demo template assets — loaded from public/templates/sales-demo-assets.json.
 */

let cached = null;

export async function loadSalesDemoAssets() {
  if (cached) return cached;
  const response = await fetch('/templates/sales-demo-assets.json');
  if (!response.ok) throw new Error('Failed to load sales demo assets');
  cached = await response.json();
  return cached;
}

export function getSalesDemoAssetsSync() {
  return cached;
}

export function salesDemoImagesAsMedia(assets = cached) {
  return (assets?.images || []).map((item) => ({
    id: item.id,
    name: item.name,
    image: item.thumb || item.src,
    full: item.src,
    type: 'image',
    role: item.role,
  }));
}

export function salesDemoShapesAsLibrary(assets = cached) {
  return (assets?.shapes || []).map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category || 'sales-demo',
    role: item.role || 'decoration',
    style: item.style,
  }));
}
