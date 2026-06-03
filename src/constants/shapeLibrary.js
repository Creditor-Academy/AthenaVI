/** Default fill applied on canvas — follows app accent via CSS variables. */
const FILL = 'var(--primary)';

const base = (w, h, extra = {}) => ({
  width: `${w}px`,
  height: `${h}px`,
  background: FILL,
  ...extra,
});

export const SHAPE_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'shapes', label: 'Shapes' },
  { id: 'basic', label: 'Basic' },
  { id: 'arrows', label: 'Arrows' },
];

export const SHAPE_LIBRARY = [
  { id: 'rect', name: 'Rectangle', category: 'basic', style: base(200, 120) },
  { id: 'square', name: 'Square', category: 'basic', style: base(120, 120) },
  { id: 'rounded-rect', name: 'Rounded rectangle', category: 'basic', style: base(200, 120, { borderRadius: '16px' }) },
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
    category: 'shapes',
    style: base(120, 110, { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }),
  },
  {
    id: 'triangle-down',
    name: 'Triangle down',
    category: 'shapes',
    style: base(120, 110, { clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' }),
  },
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
    id: 'diamond',
    name: 'Diamond',
    category: 'shapes',
    style: base(120, 120, { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }),
  },
  {
    id: 'pentagon',
    name: 'Pentagon',
    category: 'shapes',
    style: base(120, 115, { clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }),
  },
  {
    id: 'hexagon',
    name: 'Hexagon',
    category: 'shapes',
    style: base(120, 104, { clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }),
  },
  {
    id: 'octagon',
    name: 'Octagon',
    category: 'shapes',
    style: base(120, 120, {
      clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
    }),
  },
  {
    id: 'star',
    name: 'Star',
    category: 'shapes',
    style: base(120, 120, {
      clipPath:
        'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
    }),
  },
  {
    id: 'burst',
    name: 'Burst',
    category: 'shapes',
    style: base(120, 120, {
      clipPath:
        'polygon(50% 0%, 58% 26%, 85% 10%, 72% 36%, 100% 50%, 72% 64%, 85% 90%, 58% 74%, 50% 100%, 42% 74%, 15% 90%, 28% 64%, 0% 50%, 28% 36%, 15% 10%, 42% 26%)',
    }),
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
    id: 'parallelogram',
    name: 'Parallelogram',
    category: 'shapes',
    style: base(180, 100, { clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)' }),
  },
  {
    id: 'trapezoid',
    name: 'Trapezoid',
    category: 'shapes',
    style: base(180, 100, { clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }),
  },
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
    id: 'speech',
    name: 'Speech bubble',
    category: 'shapes',
    style: base(180, 120, { borderRadius: '20px', boxShadow: 'inset 0 -12px 0 -8px var(--primary)' }),
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
  {
    id: 'line-h',
    name: 'Line',
    category: 'basic',
    style: base(200, 8, { borderRadius: '4px' }),
  },
  {
    id: 'line-v',
    name: 'Line vertical',
    category: 'basic',
    style: base(8, 160, { borderRadius: '4px' }),
  },
];

/** @deprecated use SHAPE_LIBRARY */
export const predefinedShapes = SHAPE_LIBRARY;
