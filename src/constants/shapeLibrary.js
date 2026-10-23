/** Default fill applied on canvas — follows app accent via CSS variables. */
const FILL = 'var(--primary)';

const base = (w, h, extra = {}) => ({
  width: `${w}px`,
  height: `${h}px`,
  background: FILL,
  ...extra,
});

const line = (w, style = 'solid') => ({
  width: `${w}px`,
  height: '0px',
  background: 'transparent',
  borderTop: `4px ${style} ${FILL}`,
});

export const SHAPE_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'shapes', label: 'Shapes' },
  { id: 'lines', label: 'Lines' },
  { id: 'basic', label: 'Basic' },
  { id: 'polygons', label: 'Polygons' },
  { id: 'stars', label: 'Stars' },
  { id: 'arrows', label: 'Arrows' },
  { id: 'flowchart', label: 'Flowchart' },
  { id: 'speech', label: 'Bubbles' },
  { id: 'clouds', label: 'Clouds' },
  { id: 'decorative', label: 'Decorative' },
  { id: 'pitch', label: 'Pitch' },
  { id: 'product-launch', label: 'Launch' },
  { id: 'course-module', label: 'Course' },
  { id: 'sales-demo', label: 'Sales' },
  { id: 'social-short', label: 'Social' },
];

const SHAPES_GROUP = new Set(['basic', 'polygons', 'stars', 'shapes', 'decorative', 'clouds', 'arrows', 'speech']);

export function shapeMatchesCategory(shape, category) {
  if (category === 'all') return true;
  if (category === 'shapes') return SHAPES_GROUP.has(shape.category);
  return shape.category === category;
}

/** Curated Essential tab order for PPT Shape panel (filled + outline pairs). */
export const PPT_ESSENTIAL_SHAPE_IDS = [
  'rect',
  'square',
  'rounded-rect',
  'round-corner-rect',
  'cut-corner-rect',
  'concave-rect',
  'wavy-bottom-rect',
  'pill',
  'circle',
  'ellipse',
  'semicircle',
  'quarter-circle',
  'arch',
  'triangle-up',
  'triangle-down',
  'triangle-left',
  'triangle-right',
  'diamond',
  'pentagon',
  'hexagon',
  'heptagon',
  'octagon',
  'parallelogram',
  'trapezoid',
  'star-4',
  'star',
  'star-6',
  'star-8',
  'burst',
  'burst-soft',
  'sparkle',
  'cross',
  'leaf',
  'clover',
  'wave',
  'arrow-right',
  'arrow-left',
  'arrow-up',
  'arrow-down',
  'arrow-double',
  'chevron-right',
  'arrow-fat-right',
  'banner',
  'banner-pointed',
  'banner-wavy',
  'shield',
  'ticket',
  'speech-rect',
  'speech-rounded',
  'speech-cloud',
  'cloud-1',
];

export const SHAPE_LIBRARY = [
  // ── Lines ───────────────────────────────────────────────────────────────
  { id: 'line-solid', name: 'Solid line', category: 'lines', style: line(200, 'solid') },
  { id: 'line-dashed', name: 'Dashed line', category: 'lines', style: line(200, 'dashed') },
  { id: 'line-dotted', name: 'Dotted line', category: 'lines', style: line(200, 'dotted') },
  {
    id: 'line-arrow',
    name: 'Arrow line',
    category: 'lines',
    style: base(200, 24, {
      clipPath: 'polygon(0% 40%, 72% 40%, 72% 20%, 100% 50%, 72% 80%, 72% 60%, 0% 60%)',
    }),
  },
  {
    id: 'line-chevron',
    name: 'Chevron line',
    category: 'lines',
    style: base(200, 24, {
      clipPath: 'polygon(0% 35%, 70% 35%, 70% 10%, 100% 50%, 70% 90%, 70% 65%, 0% 65%)',
    }),
  },

  // ── Basic ───────────────────────────────────────────────────────────────
  { id: 'rect', name: 'Rectangle', category: 'basic', style: base(200, 120) },
  { id: 'square', name: 'Square', category: 'basic', style: base(120, 120) },
  { id: 'rounded-rect', name: 'Rounded square', category: 'basic', style: base(120, 120, { borderRadius: '16px' }) },
  { id: 'pill', name: 'Pill', category: 'basic', style: base(180, 64, { borderRadius: '999px' }) },
  { id: 'circle', name: 'Circle', category: 'basic', style: base(120, 120, { borderRadius: '50%' }) },
  { id: 'ellipse', name: 'Ellipse', category: 'basic', style: base(200, 120, { borderRadius: '50%' }) },
  {
    id: 'semicircle',
    name: 'Semicircle',
    category: 'basic',
    style: base(140, 70, { borderRadius: '140px 140px 0 0' }),
  },
  {
    id: 'triangle-up',
    name: 'Triangle',
    category: 'basic',
    style: base(120, 110, { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }),
  },
  {
    id: 'triangle-down',
    name: 'Triangle down',
    category: 'basic',
    style: base(120, 110, { clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' }),
  },
  {
    id: 'diamond',
    name: 'Diamond',
    category: 'basic',
    style: base(120, 120, { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }),
  },
  {
    id: 'ring',
    name: 'Ring',
    category: 'basic',
    style: {
      ...base(120, 120, { borderRadius: '50%' }),
      background: 'transparent',
      border: '14px solid var(--primary)',
    },
  },

  // ── Polygons ────────────────────────────────────────────────────────────
  {
    id: 'pentagon',
    name: 'Pentagon',
    category: 'polygons',
    style: base(120, 115, { clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }),
  },
  {
    id: 'hexagon',
    name: 'Hexagon',
    category: 'polygons',
    style: base(120, 104, { clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }),
  },
  {
    id: 'heptagon',
    name: 'Heptagon',
    category: 'polygons',
    style: base(120, 115, {
      clipPath: 'polygon(50% 0%, 90% 20%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 10% 20%)',
    }),
  },
  {
    id: 'octagon',
    name: 'Octagon',
    category: 'polygons',
    style: base(120, 120, {
      clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
    }),
  },
  {
    id: 'parallelogram',
    name: 'Parallelogram',
    category: 'polygons',
    style: base(180, 100, { clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)' }),
  },
  {
    id: 'trapezoid',
    name: 'Trapezoid',
    category: 'polygons',
    style: base(180, 100, { clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }),
  },

  // ── Stars ───────────────────────────────────────────────────────────────
  {
    id: 'star-4',
    name: '4-point star',
    category: 'stars',
    style: base(120, 120, {
      clipPath: 'polygon(50% 0%, 65% 35%, 100% 50%, 65% 65%, 50% 100%, 35% 65%, 0% 50%, 35% 35%)',
    }),
  },
  {
    id: 'star',
    name: '5-point star',
    category: 'stars',
    style: base(120, 120, {
      clipPath:
        'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
    }),
  },
  {
    id: 'star-6',
    name: '6-point star',
    category: 'stars',
    style: base(120, 120, {
      clipPath:
        'polygon(50% 0%, 62% 25%, 90% 25%, 70% 45%, 78% 75%, 50% 58%, 22% 75%, 30% 45%, 10% 25%, 38% 25%)',
    }),
  },
  {
    id: 'star-8',
    name: '8-point star',
    category: 'stars',
    style: base(120, 120, {
      clipPath:
        'polygon(50% 0%, 58% 26%, 85% 10%, 72% 36%, 100% 50%, 72% 64%, 85% 90%, 58% 74%, 50% 100%, 42% 74%, 15% 90%, 28% 64%, 0% 50%, 28% 36%, 15% 10%, 42% 26%)',
    }),
  },
  {
    id: 'burst',
    name: 'Burst',
    category: 'stars',
    style: base(120, 120, {
      clipPath:
        'polygon(50% 0%, 55% 18%, 72% 8%, 68% 28%, 90% 22%, 78% 40%, 100% 50%, 78% 60%, 90% 78%, 68% 72%, 72% 92%, 55% 82%, 50% 100%, 45% 82%, 28% 92%, 32% 72%, 10% 78%, 22% 60%, 0% 50%, 22% 40%, 10% 22%, 32% 28%, 28% 8%, 45% 18%)',
    }),
  },
  {
    id: 'burst-soft',
    name: 'Scalloped burst',
    category: 'stars',
    style: base(120, 120, {
      clipPath:
        'polygon(50% 0%, 61% 8%, 75% 4%, 82% 18%, 96% 22%, 90% 36%, 100% 50%, 90% 64%, 96% 78%, 82% 82%, 75% 96%, 61% 92%, 50% 100%, 39% 92%, 25% 96%, 18% 82%, 4% 78%, 10% 64%, 0% 50%, 10% 36%, 4% 22%, 18% 18%, 25% 4%, 39% 8%)',
    }),
  },
  {
    id: 'sparkle',
    name: 'Sparkle',
    category: 'stars',
    style: base(100, 100, {
      clipPath: 'polygon(50% 0%, 58% 42%, 100% 50%, 58% 58%, 50% 100%, 42% 58%, 0% 50%, 42% 42%)',
    }),
  },

  // ── Arrows ──────────────────────────────────────────────────────────────
  {
    id: 'arrow-right',
    name: 'Arrow right',
    category: 'arrows',
    style: base(160, 80, { clipPath: 'polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)' }),
  },
  {
    id: 'arrow-left',
    name: 'Arrow left',
    category: 'arrows',
    style: base(160, 80, { clipPath: 'polygon(100% 20%, 40% 20%, 40% 0%, 0% 50%, 40% 100%, 40% 80%, 100% 80%)' }),
  },
  {
    id: 'arrow-up',
    name: 'Arrow up',
    category: 'arrows',
    style: base(80, 160, { clipPath: 'polygon(20% 100%, 20% 40%, 0% 40%, 50% 0%, 100% 40%, 80% 40%, 80% 100%)' }),
  },
  {
    id: 'arrow-down',
    name: 'Arrow down',
    category: 'arrows',
    style: base(80, 160, { clipPath: 'polygon(20% 0%, 20% 60%, 0% 60%, 50% 100%, 100% 60%, 80% 60%, 80% 0%)' }),
  },
  {
    id: 'chevron-right',
    name: 'Chevron',
    category: 'arrows',
    style: base(100, 120, { clipPath: 'polygon(0% 0%, 60% 50%, 0% 100%, 25% 100%, 85% 50%, 25% 0%)' }),
  },
  {
    id: 'arrow-fat-right',
    name: 'Block arrow right',
    category: 'arrows',
    style: base(180, 100, { clipPath: 'polygon(0% 25%, 55% 25%, 55% 0%, 100% 50%, 55% 100%, 55% 75%, 0% 75%)' }),
  },
  {
    id: 'arrow-double',
    name: 'Double arrow',
    category: 'arrows',
    style: base(180, 80, {
      clipPath:
        'polygon(0% 50%, 22% 0%, 22% 28%, 78% 28%, 78% 0%, 100% 50%, 78% 100%, 78% 72%, 22% 72%, 22% 100%)',
    }),
  },

  // ── Flowchart ───────────────────────────────────────────────────────────
  {
    id: 'flow-hexagon',
    name: 'Preparation',
    category: 'flowchart',
    style: base(160, 90, { clipPath: 'polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)' }),
  },
  {
    id: 'flow-stadium',
    name: 'Start / End',
    category: 'flowchart',
    style: base(180, 72, { borderRadius: '999px' }),
  },
  {
    id: 'flow-process',
    name: 'Process',
    category: 'flowchart',
    style: base(180, 100, { borderRadius: '4px' }),
  },
  {
    id: 'flow-decision',
    name: 'Decision',
    category: 'flowchart',
    style: base(140, 140, { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }),
  },
  {
    id: 'flow-document',
    name: 'Document',
    category: 'flowchart',
    style: base(160, 110, {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 82%, 50% 100%, 0% 82%)',
    }),
  },
  {
    id: 'flow-data',
    name: 'Data',
    category: 'flowchart',
    style: base(160, 100, {
      clipPath: 'polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%)',
    }),
  },

  // ── Speech bubbles ──────────────────────────────────────────────────────
  {
    id: 'speech-rect',
    name: 'Speech bubble',
    category: 'speech',
    style: base(180, 110, { borderRadius: '16px' }),
  },
  {
    id: 'speech-oval',
    name: 'Oval bubble',
    category: 'speech',
    style: base(180, 110, { borderRadius: '50%' }),
  },
  {
    id: 'speech-rounded',
    name: 'Rounded bubble',
    category: 'speech',
    style: base(180, 100, { borderRadius: '24px' }),
  },
  {
    id: 'speech-thought',
    name: 'Thought cloud',
    category: 'speech',
    style: base(180, 120, {
      borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
    }),
  },
  {
    id: 'speech-cloud',
    name: 'Cloud bubble',
    category: 'speech',
    style: base(200, 110, {
      clipPath:
        'polygon(18% 55%, 8% 42%, 18% 28%, 35% 22%, 50% 12%, 68% 18%, 82% 12%, 92% 28%, 88% 45%, 95% 58%, 82% 68%, 68% 72%, 52% 78%, 35% 72%, 22% 68%)',
    }),
  },

  // ── Clouds ──────────────────────────────────────────────────────────────
  {
    id: 'cloud-1',
    name: 'Cloud',
    category: 'clouds',
    style: base(200, 100, {
      borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
    }),
  },
  {
    id: 'cloud-2',
    name: 'Cloud wide',
    category: 'clouds',
    style: base(220, 90, {
      clipPath:
        'polygon(12% 60%, 0% 45%, 12% 30%, 30% 22%, 48% 12%, 65% 18%, 82% 10%, 95% 28%, 90% 48%, 100% 62%, 85% 72%, 68% 78%, 50% 82%, 32% 76%, 18% 72%)',
    }),
  },
  {
    id: 'cloud-3',
    name: 'Cloud puffy',
    category: 'clouds',
    style: base(180, 110, {
      clipPath:
        'polygon(20% 55%, 5% 40%, 20% 22%, 42% 15%, 55% 5%, 75% 12%, 90% 5%, 98% 25%, 92% 45%, 100% 60%, 85% 72%, 65% 78%, 45% 85%, 25% 78%)',
    }),
  },

  // ── Misc (legacy category "shapes") ─────────────────────────────────────
  {
    id: 'triangle-left',
    name: 'Triangle left',
    category: 'shapes',
    style: base(110, 120, { clipPath: 'polygon(100% 0%, 100% 100%, 0% 50%)' }),
  },
  {
    id: 'triangle-right',
    name: 'Triangle right',
    category: 'shapes',
    style: base(110, 120, { clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)' }),
  },
  {
    id: 'cross',
    name: 'Cross',
    category: 'shapes',
    style: base(100, 100, {
      clipPath:
        'polygon(35% 0%, 65% 0%, 65% 35%, 100% 35%, 100% 65%, 65% 65%, 65% 100%, 35% 100%, 35% 65%, 0% 65%, 0% 35%, 35% 35%)',
    }),
  },
  {
    id: 'speech',
    name: 'Speech (legacy)',
    category: 'shapes',
    style: base(180, 120, { borderRadius: '20px' }),
  },
  {
    id: 'line-h',
    name: 'Line horizontal',
    category: 'shapes',
    style: base(200, 8, { borderRadius: '4px' }),
  },
  {
    id: 'line-v',
    name: 'Line vertical',
    category: 'shapes',
    style: base(8, 160, { borderRadius: '4px' }),
  },

  // ── Decorative / reference-sheet extras ─────────────────────────────────
  {
    id: 'round-corner-rect',
    name: 'Round corner',
    category: 'decorative',
    style: base(160, 120, { borderRadius: '0 28px 0 0' }),
  },
  {
    id: 'cut-corner-rect',
    name: 'Cut corner',
    category: 'decorative',
    style: base(160, 120, {
      clipPath: 'polygon(0% 0%, 78% 0%, 100% 22%, 100% 100%, 0% 100%)',
    }),
  },
  {
    id: 'concave-rect',
    name: 'Concave corners',
    category: 'decorative',
    style: base(160, 120, {
      clipPath:
        'polygon(8% 0%, 92% 0%, 100% 8%, 100% 92%, 92% 100%, 8% 100%, 0% 92%, 0% 8%)',
    }),
  },
  {
    id: 'wavy-bottom-rect',
    name: 'Wavy bottom',
    category: 'decorative',
    style: base(180, 120, {
      clipPath:
        'polygon(0% 0%, 100% 0%, 100% 78%, 88% 88%, 75% 78%, 62% 90%, 50% 78%, 38% 90%, 25% 78%, 12% 88%, 0% 78%)',
    }),
  },
  {
    id: 'quarter-circle',
    name: 'Quarter circle',
    category: 'decorative',
    style: base(120, 120, { borderRadius: '0 0 0 100%' }),
  },
  {
    id: 'arch',
    name: 'Arch',
    category: 'decorative',
    style: base(120, 150, { borderRadius: '999px 999px 0 0' }),
  },
  {
    id: 'leaf',
    name: 'Leaf',
    category: 'decorative',
    style: base(120, 160, {
      clipPath: 'polygon(50% 0%, 92% 42%, 50% 100%, 8% 42%)',
    }),
  },
  {
    id: 'clover',
    name: 'Clover',
    category: 'decorative',
    style: base(140, 140, {
      clipPath:
        'polygon(50% 18%, 62% 8%, 78% 12%, 88% 28%, 82% 42%, 92% 52%, 88% 68%, 72% 78%, 58% 72%, 50% 88%, 42% 72%, 28% 78%, 12% 68%, 8% 52%, 18% 42%, 12% 28%, 22% 12%, 38% 8%)',
    }),
  },
  {
    id: 'wave',
    name: 'Wave',
    category: 'decorative',
    style: base(200, 70, {
      clipPath:
        'polygon(0% 40%, 12% 20%, 25% 40%, 38% 20%, 50% 40%, 62% 20%, 75% 40%, 88% 20%, 100% 40%, 100% 80%, 88% 60%, 75% 80%, 62% 60%, 50% 80%, 38% 60%, 25% 80%, 12% 60%, 0% 80%)',
    }),
  },
  {
    id: 'banner',
    name: 'Banner',
    category: 'decorative',
    style: base(200, 80, {
      clipPath: 'polygon(0% 0%, 100% 0%, 88% 50%, 100% 100%, 0% 100%, 12% 50%)',
    }),
  },
  {
    id: 'banner-pointed',
    name: 'Banner pointed',
    category: 'decorative',
    style: base(200, 80, {
      clipPath: 'polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%)',
    }),
  },
  {
    id: 'banner-wavy',
    name: 'Banner wavy',
    category: 'decorative',
    style: base(200, 70, {
      clipPath:
        'polygon(0% 30%, 15% 10%, 30% 30%, 45% 10%, 60% 30%, 75% 10%, 90% 30%, 100% 15%, 100% 70%, 90% 90%, 75% 70%, 60% 90%, 45% 70%, 30% 90%, 15% 70%, 0% 90%)',
    }),
  },
  {
    id: 'shield',
    name: 'Shield',
    category: 'decorative',
    style: base(110, 130, {
      clipPath: 'polygon(50% 0%, 100% 18%, 100% 55%, 50% 100%, 0% 55%, 0% 18%)',
    }),
  },
  {
    id: 'ticket',
    name: 'Ticket',
    category: 'decorative',
    style: base(180, 100, {
      clipPath:
        'polygon(0% 0%, 100% 0%, 100% 38%, 94% 50%, 100% 62%, 100% 100%, 0% 100%, 0% 62%, 6% 50%, 0% 38%)',
    }),
  },
];

export function getEssentialShapes() {
  const byId = new Map(SHAPE_LIBRARY.map((s) => [s.id, s]));
  return PPT_ESSENTIAL_SHAPE_IDS.map((id) => byId.get(id)).filter(Boolean);
}

/** @deprecated use SHAPE_LIBRARY */
export const predefinedShapes = SHAPE_LIBRARY;
