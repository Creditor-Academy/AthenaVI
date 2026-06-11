const TEMPLATE_SOURCES = [
  { file: 'corporate', category: 'Corporate' },
  { file: 'educational', category: 'Training' },
  { file: 'marketing', category: 'Marketing' },
  { file: 'social', category: 'Social' },
  { file: 'personal', category: 'Minimal' }
];

const DEFAULT_THUMBNAIL =
  'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=80';

/**
 * Load editor template scenes from public JSON files (same source as TemplateModal).
 */
export async function fetchEditorTemplateScenes() {
  const batches = await Promise.all(
    TEMPLATE_SOURCES.map(async ({ file, category }) => {
      try {
        const response = await fetch(`/templates/${file}.json`);
        if (!response.ok) return [];
        const data = await response.json();
        return (data.scenes || []).map((scene) => normalizeEditorTemplateItem(scene, category));
      } catch {
        return [];
      }
    })
  );

  return batches.flat();
}

function normalizeEditorTemplateItem(scene, category) {
  const tags = Array.isArray(scene.tags) ? scene.tags : [];
  return {
    id: scene.id,
    name: scene.title || 'Untitled Template',
    tags: [category, ...tags],
    category,
    badge: tags[0] ? String(tags[0]).toUpperCase() : 'TEMPLATE',
    badgeType: 'interactive',
    thumbnail: DEFAULT_THUMBNAIL,
    scene
  };
}
