/** Image frames — masks that accept a dragged photo via fillSrc on the canvas. */

const base = (w, h, extra = {}) => ({
  width: `${w}px`,
  height: `${h}px`,
  backgroundColor: '#e2e8f0',
  ...extra,
});

export const FRAME_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'basic', label: 'Basic' },
  { id: 'film', label: 'Film' },
  { id: 'devices', label: 'Devices' },
  { id: 'paper', label: 'Paper' },
  { id: 'flowers', label: 'Flowers' },
  { id: 'blob', label: 'Blob' },
  { id: 'retro', label: 'Retro' },
];

export const FRAME_LIBRARY = [
  // ── Basic ─────────────────────────────────────────────────────────────
  { id: 'frame-square', name: 'Square', category: 'basic', style: base(200, 200) },
  { id: 'frame-rounded', name: 'Rounded square', category: 'basic', style: base(200, 200, { borderRadius: '24px' }) },
  { id: 'frame-circle', name: 'Circle', category: 'basic', style: base(180, 180, { borderRadius: '50%' }) },
  {
    id: 'frame-triangle',
    name: 'Triangle',
    category: 'basic',
    style: base(200, 174, { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }),
  },
  {
    id: 'frame-diamond',
    name: 'Diamond',
    category: 'basic',
    style: base(200, 200, { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }),
  },
  {
    id: 'frame-hexagon',
    name: 'Hexagon',
    category: 'basic',
    style: base(180, 156, { clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }),
  },
  {
    id: 'frame-star',
    name: 'Star',
    category: 'basic',
    style: base(180, 180, {
      clipPath:
        'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
    }),
  },
  {
    id: 'frame-heart',
    name: 'Heart',
    category: 'basic',
    style: base(180, 160, {
      clipPath:
        'polygon(50% 88%, 6% 42%, 6% 22%, 22% 6%, 42% 6%, 50% 18%, 58% 6%, 78% 6%, 94% 22%, 94% 42%)',
    }),
  },
  {
    id: 'frame-arch',
    name: 'Arch',
    category: 'basic',
    style: base(160, 220, { borderRadius: '80px 80px 0 0' }),
  },

  // ── Film & photo ────────────────────────────────────────────────────────
  {
    id: 'frame-polaroid',
    name: 'Polaroid',
    category: 'film',
    style: {
      width: '220px',
      height: '260px',
      backgroundColor: '#ffffff',
      borderRadius: '4px',
      boxShadow: '0 4px 16px rgba(15,23,42,0.12)',
      border: '10px solid #ffffff',
      paddingBottom: '48px',
      boxSizing: 'border-box',
    },
  },
  {
    id: 'frame-filmstrip-h',
    name: 'Film strip horizontal',
    category: 'film',
    style: base(300, 110, {
      backgroundColor: '#0f172a',
      borderRadius: '4px',
      border: '8px solid #0f172a',
      boxShadow: 'inset 0 0 0 2px #334155',
    }),
  },
  {
    id: 'frame-filmstrip-v',
    name: 'Film strip vertical',
    category: 'film',
    style: base(110, 300, {
      backgroundColor: '#0f172a',
      borderRadius: '4px',
      border: '8px solid #0f172a',
      boxShadow: 'inset 0 0 0 2px #334155',
    }),
  },
  {
    id: 'frame-filmstrip-3',
    name: 'Triple frame',
    category: 'film',
    style: base(280, 120, {
      backgroundColor: '#0f172a',
      borderRadius: '4px',
      border: '8px solid #0f172a',
      boxShadow: 'inset 0 0 0 2px #334155',
    }),
  },
  {
    id: 'frame-rounded-photo',
    name: 'Rounded photo',
    category: 'film',
    style: base(220, 180, { borderRadius: '16px', boxShadow: '0 4px 20px rgba(15,23,42,0.15)' }),
  },

  // ── Devices ───────────────────────────────────────────────────────────────
  {
    id: 'frame-phone',
    name: 'Smartphone',
    category: 'devices',
    style: base(120, 220, {
      borderRadius: '22px',
      border: '10px solid #1e293b',
      backgroundColor: '#f1f5f9',
    }),
  },
  {
    id: 'frame-tablet',
    name: 'Tablet',
    category: 'devices',
    style: base(160, 220, {
      borderRadius: '16px',
      border: '10px solid #1e293b',
      backgroundColor: '#f1f5f9',
    }),
  },
  {
    id: 'frame-monitor',
    name: 'Monitor',
    category: 'devices',
    style: {
      width: '240px',
      height: '200px',
      backgroundColor: '#f1f5f9',
      borderRadius: '12px 12px 0 0',
      border: '10px solid #1e293b',
      boxShadow: '0 24px 0 -14px #334155',
    },
  },
  {
    id: 'frame-laptop',
    name: 'Laptop',
    category: 'devices',
    style: {
      width: '260px',
      height: '180px',
      backgroundColor: '#f1f5f9',
      borderRadius: '10px 10px 0 0',
      border: '8px solid #1e293b',
      boxShadow: '0 18px 0 -10px #475569, 0 28px 0 -8px #cbd5e1',
    },
  },
  {
    id: 'frame-tv',
    name: 'TV',
    category: 'devices',
    style: base(260, 160, {
      borderRadius: '8px',
      border: '12px solid #1e293b',
      backgroundColor: '#f1f5f9',
      boxShadow: '0 20px 0 -12px #475569',
    }),
  },

  // ── Paper ───────────────────────────────────────────────────────────────
  {
    id: 'frame-torn-h',
    name: 'Torn paper',
    category: 'paper',
    style: base(240, 180, {
      clipPath:
        'polygon(0% 0%, 100% 0%, 100% 88%, 92% 92%, 84% 86%, 76% 94%, 68% 88%, 60% 96%, 52% 90%, 44% 98%, 36% 92%, 28% 100%, 20% 94%, 12% 98%, 4% 90%, 0% 96%)',
      backgroundColor: '#fafafa',
      boxShadow: '0 2px 8px rgba(15,23,42,0.08)',
    }),
  },
  {
    id: 'frame-deckled',
    name: 'Deckled edge',
    category: 'paper',
    style: base(220, 200, {
      clipPath:
        'polygon(2% 4%, 8% 0%, 18% 3%, 28% 0%, 38% 4%, 48% 1%, 58% 5%, 68% 2%, 78% 6%, 88% 3%, 98% 7%, 100% 14%, 97% 24%, 100% 34%, 96% 44%, 99% 54%, 95% 64%, 98% 74%, 94% 84%, 97% 94%, 90% 100%, 80% 96%, 70% 100%, 60% 95%, 50% 99%, 40% 94%, 30% 98%, 20% 93%, 10% 97%, 0% 92%, 3% 82%, 0% 72%, 4% 62%, 1% 52%, 5% 42%, 2% 32%, 6% 22%, 3% 12%)',
      backgroundColor: '#fffef8',
    }),
  },
  {
    id: 'frame-torn-v',
    name: 'Torn paper tall',
    category: 'paper',
    style: base(160, 280, {
      clipPath:
        'polygon(0% 0%, 100% 0%, 100% 92%, 94% 96%, 88% 90%, 82% 98%, 76% 92%, 70% 100%, 64% 94%, 58% 98%, 52% 92%, 46% 98%, 40% 92%, 34% 96%, 28% 90%, 22% 98%, 16% 92%, 10% 96%, 4% 90%, 0% 94%)',
      backgroundColor: '#fafafa',
    }),
  },
  {
    id: 'frame-note',
    name: 'Sticky note',
    category: 'paper',
    style: base(200, 200, {
      backgroundColor: '#fef08a',
      borderRadius: '2px',
      boxShadow: '2px 4px 12px rgba(15,23,42,0.12)',
      transform: 'rotate(-2deg)',
    }),
  },

  // ── Flowers ─────────────────────────────────────────────────────────────
  {
    id: 'frame-scallop',
    name: 'Scalloped circle',
    category: 'flowers',
    style: base(180, 180, {
      clipPath:
        'polygon(50% 0%, 62% 6%, 75% 0%, 88% 8%, 100% 20%, 94% 35%, 100% 50%, 94% 65%, 100% 80%, 88% 92%, 75% 100%, 62% 94%, 50% 100%, 38% 94%, 25% 100%, 12% 92%, 0% 80%, 6% 65%, 0% 50%, 6% 35%, 0% 20%, 12% 8%, 25% 0%, 38% 6%)',
    }),
  },
  {
    id: 'frame-flower-circle',
    name: 'Flower petal',
    category: 'flowers',
    style: base(180, 180, {
      borderRadius: '50%',
      border: '12px solid #fbbf24',
      backgroundColor: '#fef3c7',
      boxShadow: 'inset 0 0 0 8px #fde68a',
    }),
  },
  {
    id: 'frame-tulip',
    name: 'Tulip',
    category: 'flowers',
    style: base(160, 220, {
      clipPath:
        'polygon(50% 0%, 72% 18%, 88% 8%, 82% 32%, 100% 42%, 78% 48%, 88% 72%, 62% 58%, 58% 100%, 42% 100%, 38% 58%, 12% 72%, 22% 48%, 0% 42%, 18% 32%, 12% 8%, 28% 18%)',
    }),
  },
  {
    id: 'frame-wreath',
    name: 'Wreath',
    category: 'flowers',
    style: base(200, 200, {
      borderRadius: '50%',
      border: '16px solid #86efac',
      backgroundColor: 'transparent',
      boxShadow: 'inset 0 0 0 4px #fbbf24',
    }),
  },

  // ── Blob ────────────────────────────────────────────────────────────────
  {
    id: 'frame-blob-1',
    name: 'Blob vertical',
    category: 'blob',
    style: base(170, 220, {
      borderRadius: '63% 37% 54% 46% / 55% 48% 52% 45%',
    }),
  },
  {
    id: 'frame-blob-2',
    name: 'Blob horizontal',
    category: 'blob',
    style: base(240, 160, {
      borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
    }),
  },
  {
    id: 'frame-blob-3',
    name: 'Blob round',
    category: 'blob',
    style: base(200, 190, {
      borderRadius: '48% 52% 38% 62% / 58% 42% 58% 42%',
    }),
  },
  {
    id: 'frame-blob-4',
    name: 'Blob soft',
    category: 'blob',
    style: base(200, 200, {
      borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
    }),
  },

  // ── Retro ───────────────────────────────────────────────────────────────
  {
    id: 'frame-retro-oval',
    name: 'Ornate oval',
    category: 'retro',
    style: base(180, 240, {
      borderRadius: '50%',
      border: '6px double #94a3b8',
      backgroundColor: '#f8fafc',
      boxShadow: 'inset 0 0 0 3px #cbd5e1',
    }),
  },
  {
    id: 'frame-retro-rect',
    name: 'Ornate rectangle',
    category: 'retro',
    style: base(180, 240, {
      borderRadius: '4px',
      border: '8px solid #cbd5e1',
      boxShadow: 'inset 0 0 0 3px #f8fafc, inset 0 0 0 6px #94a3b8',
      backgroundColor: '#f1f5f9',
    }),
  },
  {
    id: 'frame-retro-square',
    name: 'Ornate square',
    category: 'retro',
    style: base(200, 200, {
      borderRadius: '4px',
      border: '8px solid #cbd5e1',
      boxShadow: 'inset 0 0 0 3px #f8fafc, inset 0 0 0 6px #94a3b8',
      backgroundColor: '#f1f5f9',
    }),
  },
  {
    id: 'frame-retro-circle',
    name: 'Ornate circle',
    category: 'retro',
    style: base(180, 180, {
      borderRadius: '50%',
      border: '10px solid #cbd5e1',
      boxShadow: 'inset 0 0 0 4px #94a3b8',
      backgroundColor: '#f8fafc',
    }),
  },
];
