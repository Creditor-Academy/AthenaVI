/**
 * Course Explanation template assets — loaded from public/templates/course-explanation-assets.json.
 */

let cached = null;

export async function loadCourseExplanationAssets() {
  if (cached) return cached;
  const response = await fetch('/templates/course-explanation-assets.json');
  if (!response.ok) throw new Error('Failed to load course explanation assets');
  cached = await response.json();
  return cached;
}

export function getCourseExplanationAssetsSync() {
  return cached;
}

export function courseExplanationImagesAsMedia(assets = cached) {
  return (assets?.images || []).map((item) => ({
    id: item.id,
    name: item.name,
    image: item.thumb || item.src,
    full: item.src,
    type: 'image',
    role: item.role,
  }));
}

export function courseExplanationShapesAsLibrary(assets = cached) {
  return (assets?.shapes || []).map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category || 'course-explanation',
    role: item.role || 'decoration',
    style: item.style,
  }));
}
