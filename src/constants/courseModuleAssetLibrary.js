/**
 * Course Module template assets — loaded from public/templates/course-module-assets.json.
 */

let cached = null;

export async function loadCourseModuleAssets() {
  if (cached) return cached;
  const response = await fetch('/templates/course-module-assets.json');
  if (!response.ok) throw new Error('Failed to load course module assets');
  cached = await response.json();
  return cached;
}

export function getCourseModuleAssetsSync() {
  return cached;
}

export function courseModuleImagesAsMedia(assets = cached) {
  return (assets?.images || []).map((item) => ({
    id: item.id,
    name: item.name,
    image: item.thumb || item.src,
    full: item.src,
    type: 'image',
    role: item.role,
  }));
}

export function courseModuleShapesAsLibrary(assets = cached) {
  return (assets?.shapes || []).map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category || 'course-module',
    role: item.role || 'decoration',
    style: item.style,
  }));
}
