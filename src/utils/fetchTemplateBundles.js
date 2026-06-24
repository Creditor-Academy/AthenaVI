import {
  TEMPLATE_BUNDLE_SOURCES,
  BUNDLE_CATEGORY_FILTER,
} from '../constants/templateRegistry';
import { TEMPLATE_CATEGORY_IMAGES } from '../constants/templateCategoryImages';


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

function findFirstImageSrc(clips = []) {
  for (const clip of clips) {
    if (clip.type === 'image') {
      const src = clip.src || clip.content?.src || clip.url;
      if (src) return src;
    }
  }
  return null;
}

function findSceneImageSrc(scene) {
  if (!scene) return null;
  if (scene.thumbnail) return scene.thumbnail;
  if (scene.backgroundImage) return scene.backgroundImage;
  const bg = scene.background?.value;
  if (bg && typeof bg === 'string' && (bg.startsWith('http') || bg.startsWith('/'))) return bg;

  for (const clip of scene.clips || []) {
    if (clip.type === 'avatar') {
      const avatarSrc = clip.src || clip.previewImage || clip.thumbnail;
      if (avatarSrc) return avatarSrc;
    }
  }

  return findFirstImageSrc(scene.clips);
}

/**
 * Map a single template scene to a dome gallery tile image.
 */
export function sceneToDomeImage(scene, bundle) {
  if (!scene) return null;

  const clipSrc = findSceneImageSrc(scene);
  if (clipSrc) {
    return {
      id: scene.id,
      bundleId: bundle?.id,
      src: clipSrc,
      alt: scene.title || bundle?.name || 'Template scene',
    };
  }

  const categorySrc = TEMPLATE_CATEGORY_IMAGES[bundle?.category];
  if (categorySrc) {
    return {
      id: scene.id,
      bundleId: bundle?.id,
      src: categorySrc,
      alt: scene.title || bundle?.name || bundle?.category,
    };
  }

  return null;
}

/**
 * Flatten all scenes from bundles into dome gallery images.
 */
export function bundlesToSceneDomeImages(bundles = [], { limit } = {}) {
  const pairs = bundles.flatMap((bundle) =>
    (bundle.scenes || []).map((scene) => ({ scene, bundle }))
  );
  const slice = typeof limit === 'number' ? pairs.slice(0, limit) : pairs;
  return slice.map(({ scene, bundle }) => sceneToDomeImage(scene, bundle)).filter(Boolean);
}

/**
 * Map template bundles to static images for Dome Gallery tiles.
 */
export function bundleToDomeImage(bundle) {
  if (!bundle) return null;

  const thumb = bundle.thumb || bundle.coverScene?.thumbnail;
  if (thumb) {
    return { id: bundle.id, src: thumb, alt: bundle.name || bundle.category };
  }

  const clipSrc = findFirstImageSrc(bundle.coverScene?.clips);
  if (clipSrc) {
    return { id: bundle.id, src: clipSrc, alt: bundle.name || bundle.category };
  }

  const categorySrc = TEMPLATE_CATEGORY_IMAGES[bundle.category];
  if (categorySrc) {
    return { id: bundle.id, src: categorySrc, alt: bundle.name || bundle.category };
  }

  return null;
}

export function bundlesToDomeImages(bundles = []) {
  return bundles.map(bundleToDomeImage).filter(Boolean);
}

export function bundleToDetailsTemplate(bundle) {
  const sceneCount = bundle.scenes?.length || bundle.totalSlides || 0;
  const totalDuration = (bundle.scenes || []).reduce((sum, scene) => sum + (scene.duration || 8), 0);
  return {
    ...bundle,
    name: bundle.name,
    category: bundle.category,
    tag: (bundle.category || '').toUpperCase(),
    duration: `${totalDuration}s`,
    scenes: sceneCount,
    ratio: bundle.aspectRatio || '16:9',
    description: bundle.description,
    thumb: bundle.coverScene?.thumbnail || '',
    sceneList: (bundle.scenes || []).map((scene) => ({
      id: scene.id,
      title: scene.title,
      description: scene.description,
      tags: scene.tags || [],
      scene,
    })),
    bundleScenes: bundle.scenes || [],
    coverScene: bundle.coverScene || bundle.scenes?.[0] || null,
  };
}

export default fetchTemplateBundles;
