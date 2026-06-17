import {
  TEMPLATE_BUNDLE_SOURCES,
  BUNDLE_CATEGORY_FILTER,
} from '../constants/templateRegistry';


function parseBundleAspectRatio(meta, scenes) {
  if (meta?.aspectRatio && meta.aspectRatio !== 'custom') return meta.aspectRatio;
  const first = scenes?.[0];
  if (!first?.canvasSize) return '16:9';
  const { width = 1280, height = 720 } = first.canvasSize;
  if (height > width) return '9:16';
  if (width === height) return '1:1';
  return '16:9';
}

function normalizeBundle(data, source) {
  const meta = data?.template || {};
  const scenes = data?.scenes || [];
  const category = data?.category || source.category;

  return {
    id: meta.id || source.file,
    name: meta.name || source.label || source.category,
    label: source.label,
    category,
    file: source.file,
    filterCategory: BUNDLE_CATEGORY_FILTER[category] || source.filterCategory,
    totalSlides: meta.totalSlides || scenes.length,
    description: meta.description || '',
    canvasSize: meta.canvasSize || scenes[0]?.canvasSize || { width: 1280, height: 720 },
    aspectRatio: parseBundleAspectRatio(meta, scenes),
    colorPalette: meta.colorPalette,
    scenes,
    coverScene: scenes[0] || null,
  };
}

export async function fetchTemplateBundle(file) {
  const source = TEMPLATE_BUNDLE_SOURCES.find((item) => item.file === file);
  if (!source) return null;
  try {
    const res = await fetch(`/templates/${file}.json`);
    if (!res.ok) return null;
    const data = await res.json();
    return normalizeBundle(data, source);
  } catch {
    return null;
  }
}

export async function fetchTemplateBundles() {
  const seenFiles = new Set();
  const bundles = await Promise.all(
    TEMPLATE_BUNDLE_SOURCES.map(async (source) => {
      if (seenFiles.has(source.file)) return null;
      seenFiles.add(source.file);
      try {
        const res = await fetch(`/templates/${source.file}.json`, { cache: 'no-store' });
        if (!res.ok) {
          console.warn(`[templates] Failed to load ${source.file}.json (${res.status})`);
          return null;
        }
        const data = await res.json();
        if (!data?.scenes?.length) {
          console.warn(`[templates] ${source.file}.json has no scenes`);
          return null;
        }
        return normalizeBundle(data, source);
      } catch (err) {
        console.warn(`[templates] Error loading ${source.file}.json`, err);
        return null;
      }
    })
  );
  return bundles.filter(Boolean);
}

export function sceneToPickerItem(scene, bundle) {
  const badge = scene.slideIndex != null ? String(scene.slideIndex).padStart(2, '0') : '01';
  return {
    id: scene.id,
    name: scene.title || scene.name || 'Untitled Scene',
    scene,
    bundleId: bundle.id,
    bundleName: bundle.name,
    category: bundle.filterCategory,
    bundleCategory: bundle.category,
    bundleFile: bundle.file,
    tags: [...new Set([...(scene.tags || []), bundle.category, bundle.filterCategory])],
    badge,
    badgeType: 'new',
  };
}

export function flattenBundleScenes(bundles = []) {
  return bundles.flatMap((bundle) =>
    (bundle.scenes || []).map((scene) => sceneToPickerItem(scene, bundle))
  );
}

export default fetchTemplateBundles;
