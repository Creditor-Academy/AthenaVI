/**
 * PPT editor insert-toolbar option catalog (Gamma-style panels).
 * Shape/icon libraries stay in their own modules; this file owns
 * text, media rail, stickers, charts, tables, and embed providers.
 */

import { DOODLE_ICON_LIBRARY, ICON_CATEGORIES } from './iconLibrary'
import { SHAPE_LIBRARY, shapeMatchesCategory, getEssentialShapes } from './shapeLibrary'

// ── Text ───────────────────────────────────────────────────────────────

export const PPT_TEXT_PRESETS = [
  {
    id: 'text_title',
    category: 'Titles',
    label: 'Title',
    content: { text: 'Title', fontSize: 64, bold: true, align: 'left' },
  },
  {
    id: 'text_subtitle',
    category: 'Titles',
    label: 'Subtitle',
    content: { text: 'Subtitle', fontSize: 36, bold: false, align: 'left' },
  },
  {
    id: 'text_section',
    category: 'Titles',
    label: 'Section header',
    content: { text: 'Section', fontSize: 44, bold: true, align: 'left' },
  },
  {
    id: 'text_paragraph',
    category: 'Body',
    label: 'Paragraph',
    content: {
      text: 'Add your paragraph text here.',
      fontSize: 22,
      bold: false,
      align: 'left',
    },
  },
  {
    id: 'text_body',
    category: 'Body',
    label: 'Body',
    content: {
      text: 'Add body text here.',
      fontSize: 22,
      bold: false,
      align: 'left',
    },
  },
  {
    id: 'text_bullets',
    category: 'Body',
    label: 'Bullet list',
    content: {
      text: '• First point\n• Second point\n• Third point',
      fontSize: 22,
      bold: false,
      align: 'left',
    },
  },
  {
    id: 'text_numbered',
    category: 'Body',
    label: 'Numbered list',
    content: {
      text: '1. First\n2. Second\n3. Third',
      fontSize: 22,
      bold: false,
      align: 'left',
    },
  },
  {
    id: 'text_quote',
    category: 'Callouts',
    label: 'Quote',
    content: {
      text: '“A short quote that makes a point.”',
      fontSize: 28,
      italic: true,
      align: 'left',
    },
  },
  {
    id: 'text_caption',
    category: 'Callouts',
    label: 'Caption',
    content: { text: 'Caption', fontSize: 16, bold: false, align: 'left' },
  },
  {
    id: 'text_label',
    category: 'Callouts',
    label: 'Label / badge',
    content: { text: 'LABEL', fontSize: 14, bold: true, align: 'center' },
  },
  {
    id: 'text_big_number',
    category: 'Stats',
    label: 'Big number',
    content: { text: '42%', fontSize: 96, bold: true, align: 'center' },
  },
  {
    id: 'text_stat',
    category: 'Stats',
    label: 'Big number + label',
    content: { text: '42%\nGrowth', fontSize: 48, bold: true, align: 'center' },
  },
]

export const PPT_TEXT_CATEGORIES = [...new Set(PPT_TEXT_PRESETS.map((p) => p.category))]

// ── Media rail ─────────────────────────────────────────────────────────

export const PPT_MEDIA_LIBRARY_ITEMS = [
  { id: 'library-images', section: 'Library', label: 'Images', kind: 'library-images' },
  { id: 'library-videos', section: 'Library', label: 'Videos', kind: 'library-videos' },
]

export const PPT_MEDIA_INTEGRATIONS = [
  {
    id: 'unsplash',
    section: 'Integrations',
    label: 'Unsplash',
    kind: 'stock',
    provider: 'unsplash',
    stockType: 'photo',
  },
  {
    id: 'pexels',
    section: 'Integrations',
    label: 'Pexels',
    kind: 'stock',
    provider: 'pexels',
    stockType: 'photo',
  },
  {
    id: 'pixabay',
    section: 'Integrations',
    label: 'Pixabay',
    kind: 'stock',
    provider: 'pixabay',
    stockType: 'photo',
  },
  {
    id: 'icons',
    section: 'Integrations',
    label: 'Icon sets',
    kind: 'icons',
  },
  {
    id: 'brand-photos',
    section: 'Integrations',
    label: 'Brand kit photos',
    kind: 'brand-photos',
  },
]

export const PPT_MEDIA_RAIL = [...PPT_MEDIA_LIBRARY_ITEMS, ...PPT_MEDIA_INTEGRATIONS]

export const PPT_STOCK_TOPICS = [
  {
    id: 'gradient',
    label: 'Gradient',
    query: 'colorful gradient background',
    image:
      'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=320&h=180&q=80',
  },
  {
    id: 'data',
    label: 'Data',
    query: 'data code matrix green',
    image:
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=320&h=180&q=80',
  },
  {
    id: 'abstract',
    label: 'Abstract',
    query: 'abstract fluid colorful',
    image:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=320&h=180&q=80',
  },
  {
    id: 'tech',
    label: 'Tech',
    query: 'technology laptop dark',
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=320&h=180&q=80',
  },
  {
    id: 'shapes-3d',
    label: '3D Shapes',
    query: '3d geometric shapes purple',
    image:
      'https://images.unsplash.com/photo-1634017839464-5c339bbe3c8b?auto=format&fit=crop&w=320&h=180&q=80',
  },
]

/** Rotating queries for the default stock browse (before a topic chip is picked). */
export const PPT_STOCK_BROWSE_QUERIES = [
  'nature landscape',
  'architecture interior',
  'workspace minimal',
  'ocean sunset',
  'city skyline',
  'mountain adventure',
  'coffee shop aesthetic',
  'abstract texture',
]

export function pickRandomStockBrowseQuery() {
  const list = PPT_STOCK_BROWSE_QUERIES
  return list[Math.floor(Math.random() * list.length)] || 'nature landscape'
}

/** Curated sticker packs — static Icons8 doodle / accent assets. */
export const PPT_STICKER_PACKS = [
  {
    id: 'look-at-this',
    label: 'Look at This',
    items: [
      { id: 'sticker-arrows-down', label: 'Arrows', src: 'https://img.icons8.com/doodle/96/down-arrow.png' },
      { id: 'sticker-hot', label: 'Hot', src: 'https://img.icons8.com/doodle/96/fire-element.png' },
      { id: 'sticker-look', label: 'Look', src: 'https://img.icons8.com/doodle/96/visible.png' },
      { id: 'sticker-open', label: 'Open', src: 'https://img.icons8.com/doodle/96/open-sign.png' },
      { id: 'sticker-sparkles', label: 'Sparkles', src: 'https://img.icons8.com/doodle/96/sparkling.png' },
      { id: 'sticker-point', label: 'Point', src: 'https://img.icons8.com/doodle/96/hand-cursor.png' },
    ],
  },
  {
    id: 'mark-it-up',
    label: 'Mark It Up',
    items: [
      { id: 'sticker-circle', label: 'Circle', src: 'https://img.icons8.com/doodle/96/circled.png' },
      { id: 'sticker-rect', label: 'Rectangle', src: 'https://img.icons8.com/doodle/96/rectangle.png' },
      { id: 'sticker-square', label: 'Square', src: 'https://img.icons8.com/doodle/96/unchecked-checkbox.png' },
      { id: 'sticker-dash', label: 'Dashed', src: 'https://img.icons8.com/doodle/96/minus.png' },
      { id: 'sticker-wave', label: 'Wave', src: 'https://img.icons8.com/doodle/96/sine.png' },
      { id: 'sticker-scribble', label: 'Arrow', src: 'https://img.icons8.com/doodle/96/forward.png' },
    ],
  },
  {
    id: 'make-your-point',
    label: 'Make Your Point',
    items: [
      { id: 'sticker-underline', label: 'Underline', src: 'https://img.icons8.com/doodle/96/underline.png' },
      { id: 'sticker-box', label: 'Box', src: 'https://img.icons8.com/doodle/96/box.png' },
      { id: 'sticker-scribble-line', label: 'Scribble', src: 'https://img.icons8.com/doodle/96/pencil.png' },
      { id: 'sticker-zigzag', label: 'Zigzag', src: 'https://img.icons8.com/doodle/96/lightning-bolt.png' },
      { id: 'sticker-line', label: 'Line', src: 'https://img.icons8.com/doodle/96/horizontal-line.png' },
      { id: 'sticker-exclaim', label: 'Emphasis', src: 'https://img.icons8.com/doodle/96/exclamation-mark.png' },
    ],
  },
  {
    id: 'teamwork',
    label: 'Teamwork',
    items: [
      { id: 'sticker-team', label: 'Team', src: 'https://img.icons8.com/doodle/96/conference-call.png' },
      { id: 'sticker-chat', label: 'Chat', src: 'https://img.icons8.com/doodle/96/chat.png' },
      { id: 'sticker-handshake', label: 'Handshake', src: 'https://img.icons8.com/doodle/96/handshake.png' },
      { id: 'sticker-user', label: 'User', src: 'https://img.icons8.com/doodle/96/user.png' },
      { id: 'sticker-idea', label: 'Idea', src: 'https://img.icons8.com/doodle/96/light-on.png' },
      { id: 'sticker-trophy', label: 'Trophy', src: 'https://img.icons8.com/doodle/96/trophy.png' },
    ],
  },
]

export { DOODLE_ICON_LIBRARY, ICON_CATEGORIES }

// ── Shapes (panel categories mapped onto SHAPE_LIBRARY) ────────────────

export const PPT_SHAPE_PANEL_CATEGORIES = [
  { id: 'essential', label: 'Essential', libraryCategory: 'shapes' },
  { id: 'lines', label: 'Lines', libraryCategory: 'lines' },
  { id: 'arrows', label: 'Arrows', libraryCategory: 'arrows' },
  { id: 'flowchart', label: 'Process', libraryCategory: 'flowchart' },
  { id: 'speech', label: 'Speech / Bubbles', libraryCategory: 'speech' },
  { id: 'sticky', label: 'Sticky notes', libraryCategory: null },
  { id: 'buttons', label: 'Buttons and labels', libraryCategory: null },
  { id: 'devices', label: 'Devices', libraryCategory: null },
]

/** Device mockup presets for the shapes panel (1920×1080 canvas placements). */
export const PPT_DEVICE_FRAMES = [
  {
    id: 'device-phone',
    name: 'Phone',
    category: 'devices',
    deviceFrame: 'phone',
    previewAspect: '9 / 19',
    placement: { x: 840, y: 240, width: 240, height: 520 },
    content: { shape: 'device-frame', deviceFrame: 'phone', stroke: '#1e293b', fill: '#1e293b' },
  },
  {
    id: 'device-phone-landscape',
    name: 'Phone landscape',
    category: 'devices',
    deviceFrame: 'phone_landscape',
    previewAspect: '19 / 9',
    placement: { x: 620, y: 400, width: 680, height: 280 },
    content: { shape: 'device-frame', deviceFrame: 'phone_landscape', stroke: '#1e293b', fill: '#1e293b' },
  },
  {
    id: 'device-tablet',
    name: 'Tablet',
    category: 'devices',
    deviceFrame: 'tablet',
    previewAspect: '3 / 4',
    placement: { x: 720, y: 220, width: 480, height: 640 },
    content: { shape: 'device-frame', deviceFrame: 'tablet', stroke: '#1e293b', fill: '#1e293b' },
  },
  {
    id: 'device-tablet-landscape',
    name: 'Tablet landscape',
    category: 'devices',
    deviceFrame: 'tablet_landscape',
    previewAspect: '4 / 3',
    placement: { x: 480, y: 340, width: 960, height: 400 },
    content: { shape: 'device-frame', deviceFrame: 'tablet_landscape', stroke: '#1e293b', fill: '#1e293b' },
  },
  {
    id: 'device-laptop',
    name: 'Laptop',
    category: 'devices',
    deviceFrame: 'laptop',
    previewAspect: '16 / 10',
    placement: { x: 640, y: 330, width: 640, height: 420 },
    content: { shape: 'device-frame', deviceFrame: 'laptop', stroke: '#1e293b', fill: '#1e293b' },
  },
  {
    id: 'device-monitor',
    name: 'Monitor',
    category: 'devices',
    deviceFrame: 'monitor',
    previewAspect: '4 / 3',
    placement: { x: 620, y: 280, width: 680, height: 520 },
    content: { shape: 'device-frame', deviceFrame: 'monitor', stroke: '#1e293b', fill: '#1e293b' },
  },
  {
    id: 'device-watch',
    name: 'Smartwatch',
    category: 'devices',
    deviceFrame: 'watch',
    previewAspect: '4 / 5',
    placement: { x: 870, y: 430, width: 180, height: 220 },
    content: { shape: 'device-frame', deviceFrame: 'watch', stroke: '#1e293b', fill: '#1e293b' },
  },
]

/** Extra sticky / button presets not in SHAPE_LIBRARY. */
export const PPT_EXTRA_SHAPES = {
  sticky: [
    {
      id: 'sticky-yellow',
      name: 'Sticky note',
      category: 'sticky',
      style: {
        width: '140px',
        height: '140px',
        background: '#FEF08A',
        borderRadius: '4px',
        boxShadow: '2px 2px 0 rgba(0,0,0,0.08)',
      },
      content: { shape: 'rect', fill: '#FEF08A' },
    },
    {
      id: 'sticky-pink',
      name: 'Sticky pink',
      category: 'sticky',
      style: {
        width: '140px',
        height: '140px',
        background: '#FBCFE8',
        borderRadius: '4px',
      },
      content: { shape: 'rect', fill: '#FBCFE8' },
    },
    {
      id: 'sticky-mint',
      name: 'Sticky mint',
      category: 'sticky',
      style: {
        width: '140px',
        height: '140px',
        background: '#A7F3D0',
        borderRadius: '4px',
      },
      content: { shape: 'rect', fill: '#A7F3D0' },
    },
  ],
  buttons: [
    {
      id: 'btn-pill',
      name: 'Pill button',
      category: 'buttons',
      style: {
        width: '160px',
        height: '48px',
        background: 'var(--primary, #3B82F6)',
        borderRadius: '999px',
      },
      content: { shape: 'pill', fill: '#3B82F6' },
    },
    {
      id: 'btn-rounded',
      name: 'Rounded button',
      category: 'buttons',
      style: {
        width: '160px',
        height: '48px',
        background: 'var(--primary, #3B82F6)',
        borderRadius: '12px',
      },
      content: { shape: 'rounded-rect', fill: '#3B82F6' },
    },
    {
      id: 'btn-badge',
      name: 'Badge',
      category: 'buttons',
      style: {
        width: '80px',
        height: '28px',
        background: '#0F172A',
        borderRadius: '8px',
      },
      content: { shape: 'rounded-rect', fill: '#0F172A' },
    },
  ],
}

export function getPptShapesForCategory(categoryId) {
  if (categoryId === 'essential') {
    return getEssentialShapes()
  }
  if (categoryId === 'devices') {
    return PPT_DEVICE_FRAMES
  }
  if (categoryId === 'sticky' || categoryId === 'buttons') {
    return PPT_EXTRA_SHAPES[categoryId] || []
  }
  const meta = PPT_SHAPE_PANEL_CATEGORIES.find((c) => c.id === categoryId)
  const libCat = meta?.libraryCategory
  if (!libCat) return []
  return SHAPE_LIBRARY.filter((s) => shapeMatchesCategory(s, libCat))
}

// ── Charts ─────────────────────────────────────────────────────────────

export const PPT_CHART_SOURCES = [
  { id: 'manual', label: 'Manual / sample data', phase: 'v1' },
  { id: 'csv', label: 'Import a CSV', phase: 'v1' },
  { id: 'google-sheets', label: 'Google Sheets', phase: 'v1' },
  { id: 'google-analytics', label: 'Google Analytics', phase: 'v1' },
]

export const PPT_SAMPLE_CHART_DATA = {
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  series: [
    { name: 'Series A', values: [12, 19, 14, 22] },
    { name: 'Series B', values: [8, 11, 16, 18] },
  ],
}

export const PPT_CHART_TYPES = [
  {
    category: 'Column & bar charts',
    items: [
      { id: 'column', label: 'Column', chartType: 'column' },
      { id: 'column-grouped', label: 'Grouped column', chartType: 'column-grouped' },
      { id: 'column-stacked', label: 'Stacked column', chartType: 'column-stacked' },
      { id: 'bar', label: 'Bar', chartType: 'bar' },
      { id: 'bar-grouped', label: 'Grouped bar', chartType: 'bar-grouped' },
      { id: 'bar-stacked', label: 'Stacked bar', chartType: 'bar-stacked' },
    ],
  },
  {
    category: 'Line & area charts',
    items: [
      { id: 'line', label: 'Line', chartType: 'line' },
      { id: 'line-points', label: 'Line + points', chartType: 'line-points' },
      { id: 'line-multi', label: 'Multi-line', chartType: 'line-multi' },
      { id: 'area', label: 'Area', chartType: 'area' },
      { id: 'area-stacked', label: 'Stacked area', chartType: 'area-stacked' },
    ],
  },
  {
    category: 'Pie & donut',
    items: [
      { id: 'pie', label: 'Pie', chartType: 'pie' },
      { id: 'donut', label: 'Donut', chartType: 'donut' },
    ],
  },
  {
    category: 'Other',
    items: [{ id: 'kpi', label: 'KPI / metric', chartType: 'kpi' }],
  },
]

// ── Table ──────────────────────────────────────────────────────────────

export const PPT_TABLE_MAX_COLS = 8
export const PPT_TABLE_MAX_ROWS = 8
export const PPT_TABLE_QUICK_PRESETS = [
  { cols: 2, rows: 2 },
  { cols: 3, rows: 3 },
  { cols: 4, rows: 3 },
]

export function buildEmptyTableCells(rows, cols, { hasHeader = true } = {}) {
  const cells = []
  for (let r = 0; r < rows; r++) {
    const row = []
    for (let c = 0; c < cols; c++) {
      if (hasHeader && r === 0) row.push(`Header ${c + 1}`)
      else row.push('')
    }
    cells.push(row)
  }
  return cells
}

// ── Embed / links ──────────────────────────────────────────────────────

export const PPT_EMBED_PROVIDERS = [
  {
    id: 'youtube',
    label: 'YouTube',
    description: 'Embed any public YouTube video into your presentation.',
    placeholder: 'Paste any YouTube link',
    match: /(?:youtube\.com|youtu\.be)/i,
  },
  {
    id: 'vimeo',
    label: 'Vimeo',
    description: 'Embed a public Vimeo video.',
    placeholder: 'Paste any Vimeo link',
    match: /vimeo\.com/i,
  },
  {
    id: 'loom',
    label: 'Loom',
    description: 'Embed a Loom recording.',
    placeholder: 'Paste any Loom link',
    match: /loom\.com/i,
  },
  {
    id: 'graphy',
    label: 'Graphy',
    description: 'Embed a Graphy course or video.',
    placeholder: 'Paste any Graphy link',
    match: /graphy\.com/i,
  },
  {
    id: 'notion',
    label: 'Notion',
    description: 'Embed a Notion page or database.',
    placeholder: 'Paste any Notion link',
    match: /notion\.(so|site)/i,
  },
  {
    id: 'monday',
    label: 'Monday.com',
    description: 'Embed a Monday board, timeline, or kanban.',
    placeholder: 'Paste any Monday.com link',
    match: /monday\.com/i,
  },
  {
    id: 'typeform',
    label: 'Typeform',
    description: 'Embed a Typeform survey or quiz.',
    placeholder: 'Paste any Typeform link',
    match: /typeform\.com/i,
  },
  {
    id: 'hubspot',
    label: 'HubSpot',
    description: 'Embed HubSpot CRM content for pitch rooms.',
    placeholder: 'Paste HubSpot share link',
    match: /hubspot\.com|hsforms\.com/i,
  },
  {
    id: 'any-link',
    label: 'Any link',
    description: 'Add a link card with title and URL.',
    placeholder: 'Paste any URL',
    match: null,
  },
]

export function detectEmbedProvider(url) {
  const trimmed = String(url || '').trim()
  if (!trimmed) return null
  for (const p of PPT_EMBED_PROVIDERS) {
    if (p.id === 'any-link') continue
    if (p.match && p.match.test(trimmed)) return p.id
  }
  return 'any-link'
}

export function isValidHttpUrl(value) {
  try {
    const u = new URL(String(value || '').trim())
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

// ── Default placements (1920×1080 canvas) ──────────────────────────────

export const PPT_DEFAULT_PLACEMENTS = {
  text: { x: 160, y: 200, width: 1000, height: 120 },
  image: { x: 560, y: 240, width: 800, height: 500 },
  icon: { x: 860, y: 400, width: 120, height: 120 },
  graphic: { x: 1480, y: 40, width: 360, height: 280 },
  shape: { x: 760, y: 340, width: 400, height: 280 },
  chart: { x: 360, y: 200, width: 1200, height: 640 },
  table: { x: 280, y: 220, width: 1360, height: 520 },
  embed: { x: 480, y: 240, width: 960, height: 540 },
}

export const PPT_INSERT_TOOLS = [
  { id: 'text', label: 'Text' },
  { id: 'media', label: 'Media' },
  { id: 'shape', label: 'Shape' },
  { id: 'graphics', label: 'Graphics' },
  { id: 'chart', label: 'Chart' },
  { id: 'table', label: 'Table' },
  { id: 'embed', label: 'Embed' },
]
