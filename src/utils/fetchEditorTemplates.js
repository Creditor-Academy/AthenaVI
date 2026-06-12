const TEMPLATE_SOURCES = [
  { file: 'pitch_template', category: 'Pitch' },
  { file: 'product_launch_template', category: 'Product Launch' },
  { file: 'course_module_template', category: 'Course Module' },
  { file: 'sales_demo_template', category: 'Sales Demo' },
  { file: 'social_short_template', category: 'Social Short' },
];

/** Maps bundle categories to CreateVideoModal filter chips */
const BUNDLE_CATEGORY_FILTER = {
  Pitch: 'Corporate',
  'Product Launch': 'Marketing',
  'Course Module': 'Training',
  'Sales Demo': 'Corporate',
  'Social Short': 'Social',
};

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
  for (const source of TEMPLATE_SOURCES) {
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

export default fetchEditorTemplateScenes;
