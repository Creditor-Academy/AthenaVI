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
  { id: 'pitch', label: 'Pitch' },
];

const SHAPES_GROUP = new Set(['basic', 'polygons', 'stars', 'shapes']);

export function shapeMatchesCategory(shape, category) {
  if (category === 'all') return true;
  if (category === 'shapes') return SHAPES_GROUP.has(shape.category);
  return shape.category === category;
}

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
        'polygon(50% 0%, 58% 26%, 85% 10%, 72% 36%, 100% 50%, 72% 64%, 85% 90%, 58% 74%, 50% 100%, 42% 74%, 15% 90%, 28% 64%, 0% 50%, 28% 36%, 15% 10%, 42% 26%)',
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
];

/** @deprecated use SHAPE_LIBRARY */
export const predefinedShapes = SHAPE_LIBRARY;
