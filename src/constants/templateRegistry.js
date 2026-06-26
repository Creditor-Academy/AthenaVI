/** Single source of truth for template bundle JSON files and display metadata. */
export const TEMPLATE_BUNDLE_SOURCES = [
  {
    file: 'pitch_template',
    category: 'Company',
    label: 'Company Profile Pitch',
    filterCategory: 'Corporate',
  },
  {
    file: 'business_proposal_new_template',
    category: 'Company',
    label: 'Business Proposal',
    filterCategory: 'Corporate',
  },
  {
    file: 'company_culture_template',
    category: 'Company',
    label: 'Company Culture & Onboarding',
    filterCategory: 'Corporate',
  },
  {
    file: 'product_launch_template',
    category: 'Company',
    label: 'Product Launch',
    filterCategory: 'Corporate',
  },
  {
    file: 'course_module_template',
    category: 'Courses',
    label: 'Course Module',
    filterCategory: 'Training',
  },
  {
    file: 'course_explanation_template',
    category: 'Courses',
    label: 'Course Explanation — Clear Classroom',
    filterCategory: 'Training',
  },
  {
    file: 'masterclass_template',
    category: 'Courses',
    label: 'Masterclass Introduction',
    filterCategory: 'Training',
  },
  {
    file: 'financial_growth_template',
    category: 'Courses',
    label: 'Financial Growth — Opportunity Mapping',
    filterCategory: 'Training',
  },
  {
    file: 'womens_wellness_template',
    category: 'Courses',
    label: "Women's Wellness — Harmony & Health",
    filterCategory: 'Training',
  },
  {
    file: 'sales_demo_template',
    category: 'Company',
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

export const TEMPLATE_BUNDLE_FILES = [...new Set(TEMPLATE_BUNDLE_SOURCES.map((source) => source.file))];

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
