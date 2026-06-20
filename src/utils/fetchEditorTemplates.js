import {
  TEMPLATE_BUNDLE_SOURCES,
  BUNDLE_CATEGORY_FILTER,
} from '../constants/templateRegistry';

export { BUNDLE_CATEGORY_FILTER };

function parseAspectRatio(aspectRatio) {
  if (!aspectRatio || aspectRatio === 'custom') return null;
  const parts = String(aspectRatio).split(':').map(Number);
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return parts[0] / parts[1];
}

export function sceneAspectRatio(scene) {
  const width = scene?.canvasSize?.width ?? 1280;
  const height = scene?.canvasSize?.height ?? 720;
  return width / height;
}

export function sceneMatchesAspectRatio(scene, aspectRatio) {
  const target = parseAspectRatio(aspectRatio);
  if (!target) return true;
  return Math.abs(sceneAspectRatio(scene) - target) < 0.08;
}

function sceneToPickerItem(scene, { file, category }) {
  const filterCategory = BUNDLE_CATEGORY_FILTER[category] || category;
  const badge = scene.slideIndex != null ? String(scene.slideIndex).padStart(2, '0') : '01';

  return {
    id: scene.id,
    name: scene.title || scene.name || 'Untitled Scene',
    scene,
    category: filterCategory,
    bundleCategory: category,
    bundleFile: file,
    tags: [...new Set([...(scene.tags || []), category, filterCategory])],
    badge,
    badgeType: 'new',
  };
}

export async function fetchEditorTemplateScenes() {
  const results = [];
  for (const source of TEMPLATE_BUNDLE_SOURCES) {
    try {
      const res = await fetch(`/templates/${source.file}.json`);
      if (!res.ok) continue;
      const data = await res.json();
      (data.scenes || []).forEach((scene) => {
        results.push(sceneToPickerItem(scene, source));
      });
    } catch {
      /* skip missing bundle */
    }
  }
  return results;
}

export async function fetchEditorTemplateBundles() {
  const { default: fetchTemplateBundles } = await import('./fetchTemplateBundles');
  return fetchTemplateBundles();
}

export default fetchEditorTemplateScenes;
