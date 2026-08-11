/** Parse "cols 2-11, rows 4-7" → { c1, c2, r1, r2 } */
export function parseRegion(region) {
  if (!region) return null
  const colMatch = region.match(/cols?\s+(\d+)[-–](\d+)/i)
  const rowMatch = region.match(/rows?\s+(\d+)[-–](\d+)/i)
  if (!colMatch || !rowMatch) return null
  return {
    c1: parseInt(colMatch[1], 10),
    c2: parseInt(colMatch[2], 10),
    r1: parseInt(rowMatch[1], 10),
    r2: parseInt(rowMatch[2], 10),
  }
}

export function getGridDims(slots = []) {
  let maxR = 10
  let maxC = 12
  for (const slot of slots) {
    const reg = parseRegion(slot.region)
    if (!reg) continue
    maxR = Math.max(maxR, reg.r2)
    maxC = Math.max(maxC, reg.c2)
  }
  return { COLS: Math.max(12, maxC), ROWS: Math.max(10, maxR) }
}

export function regionToBox(reg, COLS, ROWS, insetPct = 0) {
  const x = ((reg.c1 - 1) / COLS) * 100 + insetPct
  const y = ((reg.r1 - 1) / ROWS) * 100 + insetPct
  const w = ((reg.c2 - reg.c1 + 1) / COLS) * 100 - insetPct * 2
  const h = ((reg.r2 - reg.r1 + 1) / ROWS) * 100 - insetPct * 2
  return { x, y, w: Math.max(w, 1), h: Math.max(h, 1) }
}

function mergeRegions(regions) {
  return regions.reduce(
    (acc, r) => ({
      c1: Math.min(acc.c1, r.c1),
      c2: Math.max(acc.c2, r.c2),
      r1: Math.min(acc.r1, r.r1),
      r2: Math.max(acc.r2, r.r2),
    }),
    { ...regions[0] }
  )
}

export function slotKind(id = '', role = '') {
  const s = `${id} ${role}`.toLowerCase().trim()
  if (/(?:^|[_\-])bg$|_card_bg|card_bg|background/.test(s) && !/icon/.test(s)) return 'bg'
  if (/^logo$|_logo$|^logo[_\-]/.test(s) || (role === 'image' && /^logo/i.test(id))) return 'logo'
  if (/icon|avatar/.test(s) && !/^logo/i.test(id)) return 'icon'
  if (role === 'heading' || /(^|[_\-])(heading|title)($|[_\-])/.test(s)) return 'heading'
  if (role === 'eyebrow') return 'eyebrow'
  if (role === 'caption') return 'caption'
  if (role === 'subheading' || /subtitle|subheading/.test(s)) return 'subheading'
  if (role === 'body' || /body|description|quote/.test(s)) return 'body'
  if (role === 'stat_label') return 'stat_label'
  if (role === 'stat' || /metric|number|value/.test(s)) return 'stat'
  if (role === 'label') return 'label'
  if (/bar_chart|main_chart|^chart$/.test(s) || (/_chart$/.test(s) && !/heading|caption|card|panel/.test(s)) || role === 'chart') return 'chart'
  if (/image|media|photo|picture/.test(s) || role === 'image') return 'image'
  if (role === 'decoration' || /circle|arrow|accent|badge|dot|shape/.test(s)) return 'decoration'
  if (role === 'background') return 'bg'
  return 'generic'
}

function slotFamily(id = '') {
  const lower = String(id || '').toLowerCase()

  const insightNum = lower.match(/^insight_(?:card_|icon_|label_)?(\d+)/)
  if (insightNum) return `insight_${insightNum[1]}`

  const stepNum = lower.match(/^step_(\d+)_/)
  if (stepNum) return `step_${stepNum[1]}`
  if (/^arrow_\d+$/.test(lower)) return lower

  const numberedPoint = lower.match(/^point_(\d+)_/)
  if (numberedPoint) return `point_${numberedPoint[1]}`
  if (/^points_bg|^points_panel|^point_grid/.test(lower)) return 'points_panel'
  if (/^point_card_bg$/.test(lower)) return 'point_panel_bg'
  if (/^point_heading$/.test(lower)) return 'point_panel_heading'
  if (/^point_body$/.test(lower)) return 'point_panel_body'
  if (/^point_image$/.test(lower)) return 'point_panel_image'
  if (/^point$|^point[_\-](?!(\d))/.test(lower)) return 'point'

  if (/^(bar_chart|main_chart)$/.test(lower) || lower === 'chart') return 'chart_main'
  if (/^chart_card_bg$/.test(lower)) return 'chart_panel_bg'
  if (/^chart_heading$/.test(lower)) return 'chart_panel_heading'
  if (/^chart_caption$/.test(lower)) return 'chart_panel_caption'

  const imageItem = lower.match(/^image_(\d+)$/)
  if (imageItem) return `image_${imageItem[1]}`
  const imagePart = lower.match(/^image_(\d+)_(frame|label)$/)
  if (imagePart) return `image_${imagePart[1]}`
  if (/^hero_image$/.test(lower)) return 'hero_image'
  if (/^image_frame$/.test(lower)) return 'hero_image_frame'

  const statNum = lower.match(/^stat_(\d+)_/)
  if (statNum) return `stat_${statNum[1]}`

  const colNum = lower.match(/^col_(\d+)_/)
  if (colNum) return `col_${colNum[1]}`

  const bullet = lower.match(/^(?:bullet|item|card).*?(\d+)/)
  if (bullet) return `card_${bullet[1]}`

  if (/^accent_bar$|^bottom_line$|^dot_accent$|^image_badge$|^image_overlay_shape$/.test(lower)) {
    return lower
  }

  return `slot_${lower || 'unknown'}`
}

export const SLOT_COLORS = [
  { fill: 'rgba(99,102,241,0.18)', stroke: 'rgba(99,102,241,0.7)', text: '#818cf8' },
  { fill: 'rgba(34,197,94,0.15)', stroke: 'rgba(34,197,94,0.65)', text: '#4ade80' },
  { fill: 'rgba(251,191,36,0.15)', stroke: 'rgba(251,191,36,0.65)', text: '#fbbf24' },
  { fill: 'rgba(236,72,153,0.15)', stroke: 'rgba(236,72,153,0.65)', text: '#f472b6' },
  { fill: 'rgba(14,165,233,0.15)', stroke: 'rgba(14,165,233,0.65)', text: '#38bdf8' },
  { fill: 'rgba(168,85,247,0.15)', stroke: 'rgba(168,85,247,0.65)', text: '#c084fc' },
]

export function buildPolishedGroups(slots) {
  const map = new Map()
  slots.forEach((slot, i) => {
    const reg = parseRegion(slot.region)
    if (!reg) return
    const kind = slotKind(slot.id, slot.role)
    const family = slotFamily(slot.id)
    if (!map.has(family)) map.set(family, { family, slots: [], kinds: new Set() })
    const g = map.get(family)
    g.slots.push({ slot, reg, kind, i })
    g.kinds.add(kind)
  })
  return [...map.values()].map((g) => ({
    ...g,
    bounds: mergeRegions(g.slots.map((s) => s.reg)),
    isInsight: g.family.startsWith('insight_'),
    isChart: g.family === 'chart',
    isPoint: g.family === 'point',
  }))
}

export function groupPlaceholderText(group, kind) {
  const entry = group.slots.find((s) => s.kind === kind)
  return entry?.slot?.placeholder_text?.trim() || ''
}

export function groupPrimaryText(group, kinds, fallback) {
  for (const kind of kinds) {
    const text = groupPlaceholderText(group, kind)
    if (text) return text
  }
  return fallback
}

/** Per-slot preview styling from schema.preview.slots[id] or slot.preview */
export function resolveSlotPreview(slot, previewHints = {}) {
  const hint = previewHints.slots?.[slot?.id] ?? slot?.preview ?? {}
  const role = slot?.role || ''
  const id = String(slot?.id || '')
  let variant = hint.variant
  if (!variant) {
    if (slotKind(id, role) === 'logo') variant = 'logo'
    else if (role === 'background' || slotKind(id, role) === 'bg') variant = 'image'
    else if (role === 'heading') variant = 'title'
    else if (role === 'subheading') variant = 'subheading'
    else if (role === 'caption' || role === 'eyebrow') variant = 'caption'
    else if (role === 'quote') variant = 'title'
    else if (role === 'body') variant = 'body'
    else if (role === 'image') variant = 'image'
    else variant = 'body'
  }

  const text =
    hint.text ??
    slot?.placeholder_text ??
    (variant === 'logo' ? 'logo' : variant === 'title' ? 'Section title' : '')

  return {
    variant,
    text,
    bold: hint.bold ?? variant === 'title',
    uppercase: hint.uppercase ?? variant === 'title',
  }
}

export function groupSlotPreview(group, previewHints = {}) {
  const primary = group.slots[0]?.slot
  if (!primary) {
    return { variant: 'body', text: '', bold: false, uppercase: false }
  }
  return resolveSlotPreview(primary, previewHints)
}

export function isTextPreviewGroup(group) {
  return [...group.kinds].every((k) =>
    ['heading', 'body', 'eyebrow', 'caption', 'subheading', 'stat', 'stat_label', 'generic', 'logo', 'quote', 'label'].includes(k)
  )
}

export function isShapePreviewGroup(group) {
  return group.kinds.has('decoration') || group.kinds.has('icon')
}

/** Vertical alignment from slot position on the 10-row grid. */
export function previewVerticalAlign(group) {
  const mid = (group.bounds.r1 + group.bounds.r2) / 2
  if (mid <= 4.5) return 'flex-start'
  if (mid >= 6.5) return 'flex-end'
  return 'center'
}
