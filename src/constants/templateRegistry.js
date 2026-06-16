/** Single source of truth for template bundle JSON files and display metadata. */
export const TEMPLATE_BUNDLE_SOURCES = [
  {
    file: 'pitch_template',
    category: 'Pitch',
    label: 'Business Proposal',
    filterCategory: 'Corporate',
  },
  {
    file: 'product_launch_template',
    category: 'Product Launch',
    label: 'Product Launch',
    filterCategory: 'Marketing',
  },
  {
    file: 'course_module_template',
    category: 'Course Module',
    label: 'Course Module',
    filterCategory: 'Training',
  },
  {
    file: 'sales_demo_template',
    category: 'Sales Demo',
    label: 'Sales Demo',
    filterCategory: 'Corporate',
  },
  {
    file: 'social_short_template',
    category: 'Social Short',
    label: 'Social Short',
    filterCategory: 'Social',
  },
  {
    file: 'podcast_template',
    category: 'Podcast',
    label: 'Podcast Studio',
    filterCategory: 'Social',
  },
];

export const TEMPLATE_BUNDLE_FILES = TEMPLATE_BUNDLE_SOURCES.map((source) => source.file);

export const CATEGORY_FILE_MAP = Object.fromEntries(
  TEMPLATE_BUNDLE_SOURCES.flatMap((source) => {
    const file = source.file;
    const category = source.category.toLowerCase();
    return [
      [category, file],
      [category.replace(/\s+/g, '_'), file],
      [source.label.toLowerCase(), file],
    ];
  })
);

export const BUNDLE_CATEGORY_FILTER = Object.fromEntries(
  TEMPLATE_BUNDLE_SOURCES.map((source) => [source.category, source.filterCategory])
);

export function getBundleSourceByCategory(category) {
  const key = String(category || '').toLowerCase();
  if (key === 'all' || key === 'all templates') return null;
  const file = CATEGORY_FILE_MAP[key];
  if (!file) return null;
  return TEMPLATE_BUNDLE_SOURCES.find((source) => source.file === file) || null;
}
