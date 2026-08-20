/** Shared builders for Simple slides DECK_LAYOUT v2 schemas. */

import { isAiOnlyPreviewSlot } from './layoutPreviewUtils.js'

/** Metadata for AI — never rendered in layout catalog previews. */
export function shapeHint(overrides = {}) {
  return { aiOnly: true, ...overrides }
}

export function slot(id, region, role, placeholder_text, extra = {}) {
  return {
    id,
    region,
    role,
    ...(placeholder_text ? { placeholder_text } : {}),
    ...extra,
  }
}

export function typo(role, overrides = {}) {
  const base = {
    eyebrow: { fontSize: 14, fontWeight: 400, colorRole: 'muted', align: 'left', lineHeight: 1.3 },
    caption: { fontSize: 14, fontWeight: 400, colorRole: 'muted', align: 'left', lineHeight: 1.3 },
    heading: { fontSize: 40, fontWeight: 800, colorRole: 'text', align: 'left', lineHeight: 1.15 },
    subheading: { fontSize: 24, fontWeight: 400, colorRole: 'muted', align: 'left', lineHeight: 1.4 },
    body: { fontSize: 18, fontWeight: 400, colorRole: 'muted', align: 'left', lineHeight: 1.45 },
    quote: { fontSize: 30, fontWeight: 700, colorRole: 'text', align: 'left', lineHeight: 1.35 },
    stat: { fontSize: 72, fontWeight: 900, colorRole: 'accent', align: 'left', lineHeight: 1.0 },
    cta: { fontSize: 20, fontWeight: 700, colorRole: 'primary', align: 'center', lineHeight: 1.2 },
  }
  const key = role === 'eyebrow' ? 'eyebrow' : role
  return { ...(base[key] || base.body), ...overrides }
}

export function displayTypo(overrides = {}) {
  return typo('quote', { fontSize: 60, fontWeight: 800, lineHeight: 1.1, ...overrides })
}

export function centeredTypo(role, overrides = {}) {
  return typo(role, { align: 'center', ...overrides })
}

/** AI hint: optional card behind an image slot (not shown in layout preview). */
export function cardShapeHint(region, id = 'IMAGE_CARD_BG', borderRadius = 10, pairsWithSlotId = null) {
  return slot(id, region, 'decoration', null, {
    layer: 1,
    aiOnly: true,
    shapeHint: shapeHint({
      kind: 'cardBehind',
      suggestedBehind: 'card',
      borderRadius,
      pairsWithSlotId,
    }),
    shape: { type: 'rect', fillColorRole: 'cardBg', borderRadius },
  })
}

/** @deprecated alias */
export const cardShape = cardShapeHint

export function surfaceHalfHint(region, id = 'TEXT_HALF_BG', pairsWithSlotId = null) {
  return slot(id, region, 'background', null, {
    layer: 0,
    aiOnly: true,
    shapeHint: shapeHint({
      kind: 'surfaceFill',
      suggestedBehind: 'surface',
      pairsWithSlotId,
    }),
    shape: { type: 'rect', fillColorRole: 'surface' },
  })
}

export const surfaceHalf = surfaceHalfHint

export function overlayScrimHint(region = 'cols 1-12, rows 1-12', opacity = 0.45) {
  return slot('OVERLAY_SCRIM', region, 'background', null, {
    layer: 1,
    aiOnly: true,
    shapeHint: shapeHint({
      kind: 'overlayScrim',
      overlay: true,
      suggestedScrim: opacity,
    }),
    shape: {
      type: 'rect',
      fillColorRole: 'overlayScrim',
      fill: { type: 'solid', colorRole: 'overlayScrim', color: `rgba(0,0,0,${opacity})` },
    },
  })
}

export const overlayScrim = overlayScrimHint

export function ctaPillHint(region, id = 'CTA_BG', pairsWithSlotId = 'CTA') {
  return slot(id, region, 'decoration', null, {
    layer: 5,
    aiOnly: true,
    shapeHint: shapeHint({
      kind: 'ctaPill',
      suggestedBehind: 'pill',
      pairsWithSlotId,
    }),
    shape: { type: 'rect', fillColorRole: 'primary', borderRadius: 200 },
  })
}

export const ctaPill = ctaPillHint

/** Attach optional shape/mask hint to a content slot for AI. */
export function withShapeHint(slotDef, hint) {
  return {
    ...slotDef,
    shapeHint: shapeHint(hint),
  }
}

export function layoutBase(layout_id, content_type, slots, preview = {}) {
  const visibleSlots = slots.filter(Boolean)
  const autoPreview = buildAutoPreviewSlots(visibleSlots, preview)
  return {
    layout_id,
    content_type,
    schemaVersion: 2,
    grid: '12-col',
    shapePolicy: 'ai_decides',
    slots: visibleSlots,
    preview: autoPreview,
  }
}

function buildAutoPreviewSlots(slots, preview = {}) {
  const out = { mode: preview.mode || null, ...preview, slots: { ...(preview.slots || {}) } }
  for (const s of slots) {
    if (!s?.id || isAiOnlyPreviewSlot(s)) continue
    if (out.slots[s.id]?.text) continue
    const role = s.role || 'body'
    if (role === 'image' || s.id === 'BACKGROUND_IMAGE') {
      out.slots[s.id] = { ...(out.slots[s.id] || {}), variant: 'image' }
      continue
    }
    if (!s.placeholder_text) continue
    const variant =
      role === 'heading' || role === 'quote'
        ? 'title'
        : role === 'subheading'
          ? 'subheading'
          : role === 'caption' || role === 'eyebrow'
            ? 'caption'
            : role === 'stat'
              ? 'stat'
              : 'body'
    out.slots[s.id] = previewSlot(String(s.placeholder_text), variant, {
      bold: variant === 'title' || role === 'stat' || role === 'quote',
    })
  }
  return out
}

export function previewSlot(text, variant = 'body', extra = {}) {
  return { text, variant, bold: variant === 'title' || variant === 'quote', uppercase: false, ...extra }
}

/** Sample 3–4 line body copy for layout previews and AI slot sizing. */
export const SAMPLE_PARA = {
  one: 'We help teams turn complex ideas into clear narratives that drive decisions and build momentum across the organization.',
  two: 'Our approach combines research, design, and storytelling so every slide earns attention and every message lands with precision.',
  three: 'From first draft to final delivery, we keep copy concise, visual, and aligned to your audience and goals.',
  four: 'The result is a deck that feels polished, purposeful, and ready for the room where it matters most.',
  short: 'Supporting paragraph with three to four lines of scannable copy that explains the key idea without overwhelming the slide.',
}

export function body(id, region, text = SAMPLE_PARA.one, maxLines = 4, extra = {}) {
  return slot(id, region, 'body', text, {
    layer: 10,
    typography: typo('body'),
    max_lines: maxLines,
    ...extra,
  })
}

export function heading(id, region, text, extra = {}) {
  return slot(id, region, 'heading', text, {
    layer: 10,
    typography: typo('heading', { fontSize: 36 }),
    max_lines: 2,
    ...extra,
  })
}

/** Image presentation presets — border radius + soft shadow for canvas compile. */
export const IMAGE_PRESENTATION = {
  hero: {
    borderRadius: 18,
    shadow: '0 14px 40px rgba(15, 23, 42, 0.14), 0 4px 14px rgba(99, 102, 241, 0.12)',
  },
  featured: {
    borderRadius: 14,
    shadow: '0 10px 28px rgba(15, 23, 42, 0.1), 0 2px 8px rgba(99, 102, 241, 0.08)',
  },
  card: {
    borderRadius: 12,
    shadow: '0 6px 18px rgba(15, 23, 42, 0.08)',
  },
  inset: {
    borderRadius: 8,
    shadow: '0 2px 10px rgba(15, 23, 42, 0.06)',
  },
  flat: {
    borderRadius: 0,
    shadow: null,
  },
}

function inferImageStyle(slotId) {
  const id = String(slotId || '').toUpperCase()
  if (id === 'BACKGROUND_IMAGE') return 'flat'
  if (id === 'HERO_IMAGE') return 'hero'
  if (/^IMAGE_\d+$|^COL_\d+_IMAGE$|^METRIC_IMAGE/.test(id)) return 'card'
  if (/^DEVICE_|^PHONE_|^LAPTOP_|^TABLET_|^WATCH_/.test(id)) return 'inset'
  return 'featured'
}

export function resolveImagePresentation(slot = {}) {
  const key = slot.imageStyle || inferImageStyle(slot.id)
  return IMAGE_PRESENTATION[key] || IMAGE_PRESENTATION.inset
}

function imageSlot(id, region, imageStyle = 'featured', extra = {}) {
  const presentation = IMAGE_PRESENTATION[imageStyle] || IMAGE_PRESENTATION.inset
  return slot(id, region, 'image', null, {
    layer: 2,
    fit: 'cover',
    imageStyle,
    borderRadius: presentation.borderRadius,
    shadow: presentation.shadow,
    ...extra,
  })
}

/** Wide or prominent hero image with generous corner radius. */
export function heroImage(region, id = 'HERO_IMAGE', extra = {}) {
  return imageSlot(id, region, 'hero', extra)
}

/** Full-height image bleeding to the right edge (Pitch-style split). */
export function imageRight(region = 'cols 7-12, rows 1-10', id = 'HERO_IMAGE', imageStyle = 'featured') {
  return imageSlot(id, region, imageStyle)
}

/** Full-height image bleeding to the left edge. */
export function imageLeft(region = 'cols 1-6, rows 1-10', id = 'HERO_IMAGE', imageStyle = 'featured') {
  return imageSlot(id, region, imageStyle)
}

/** Inset boxed image (explicit boxed variant layouts only). */
export function imageBoxed(region, id = 'HERO_IMAGE', imageStyle = 'featured') {
  return imageSlot(id, region, imageStyle, { layer: 12 })
}

/** Chart slot — data filled at generation from content.chart */
export function chartSlot(id, region, extra = {}) {
  return slot(id, region, 'chart', null, { layer: 10, ...extra })
}

/** Table slot — data filled at generation from content.table */
export function tableSlot(id, region, extra = {}) {
  return slot(id, region, 'table', null, { layer: 10, ...extra })
}

/** Stat value + label pair for metric layouts */
export function statPair(index, valueRegion, labelRegion, value = '100k', label = 'Add a key metric here', extra = {}) {
  const n = index
  return [
    slot(`STAT_${n}_VALUE`, valueRegion, 'stat', value, {
      layer: 10,
      typography: typo('stat', { fontSize: n === 1 ? 56 : 48, align: 'center' }),
      max_lines: 1,
      ...extra.value,
    }),
    slot(`STAT_${n}_LABEL`, labelRegion, 'stat_label', label, {
      layer: 10,
      typography: typo('caption', { align: 'center' }),
      max_lines: 2,
      ...extra.label,
    }),
  ]
}

/** AI-only device frame hint paired with an image slot */
export function deviceFrameHint(region, kind = 'phone', id = null, pairsWithSlotId = null) {
  const defaultIds = {
    phone: 'PHONE_FRAME',
    phone_landscape: 'PHONE_LANDSCAPE_FRAME',
    laptop: 'LAPTOP_FRAME',
    tablet: 'TABLET_FRAME',
    watch: 'WATCH_FRAME',
  }
  const frameId = id || defaultIds[kind] || 'PHONE_FRAME'
  const frameKind = kind === 'phone_landscape' ? 'phoneLandscape' : kind === 'watch' ? 'watch' : kind === 'tablet' ? 'tablet' : kind === 'laptop' ? 'laptop' : 'phone'
  return slot(frameId, region, 'decoration', null, {
    layer: 1,
    aiOnly: true,
    shapeHint: shapeHint({
      kind: `${frameKind}Frame`,
      suggestedBehind: 'deviceFrame',
      pairsWithSlotId,
    }),
  })
}

/** Device screen image + optional frame hint */
export function deviceScreenSlot(id, region, kind = 'phone', frameId = null) {
  return [
    deviceFrameHint(region, kind, frameId, id),
    imageSlot(id, region, 'inset'),
  ]
}

/** Standard left-column copy for device mockup layouts */
export function deviceSplitCopy(cols = 'cols 1-6') {
  return [
    heading('HEADING', `${cols}, rows 2-3`, 'Describe this mockup', {
      typography: typo('heading', { fontSize: 28 }),
    }),
    body('BODY', `${cols}, rows 4-9`, SAMPLE_PARA.short, 3, {
      typography: typo('body', { fontSize: 14 }),
    }),
  ]
}

/** Insight card trio for grid_insights_chart layouts */
export function insightCard(index, colStart, colEnd) {
  const n = index
  const region = `cols ${colStart}-${colEnd}`
  return [
    cardShapeHint(`${region}, rows 1-2`, `INSIGHT_CARD_${n}_BG`, 10, `INSIGHT_ICON_${n}`),
    slot(`INSIGHT_ICON_${n}`, `${region}, rows 1-2`, 'decoration', null, {
      layer: 2,
      aiOnly: true,
      shapeHint: shapeHint({ kind: 'iconCircle', suggestedBehind: 'none' }),
    }),
    slot(`INSIGHT_LABEL_${n}`, `${region}, rows 3-4`, 'caption', `Insight ${n}`, {
      layer: 10,
      typography: typo('caption', { align: 'center' }),
      max_lines: 2,
    }),
  ]
}

/** Grid image slot helper */
export function gridImage(index, region, imageStyle = 'card') {
  return imageSlot(`IMAGE_${index}`, region, imageStyle)
}

const DEFAULT_PLAN_FEATURES = [
  'The first point',
  'The second point',
  'The third point',
]

/** Pricing plan card slots: label, price, feature list body */
export function planFields(index, colStart, colEnd, labels = {}) {
  const n = index
  const region = `cols ${colStart}-${colEnd}`
  const label = labels.label || (n === 1 ? 'Basic' : n === 2 ? 'Standard' : n === 3 ? 'Pro' : `Plan ${n}`)
  const price = labels.price || (n === 1 ? '$99' : n === 2 ? '$299' : n === 3 ? '$999' : '$499')
  const features = labels.features || DEFAULT_PLAN_FEATURES.slice(0, 3 + (n % 2)).join('\n')
  return [
    slot(`PLAN_${n}_LABEL`, `${region}, rows 2-3`, 'heading', label, {
      layer: 10,
      typography: typo('heading', { fontSize: 20 }),
      max_lines: 1,
    }),
    slot(`PLAN_${n}_PRICE`, `${region}, rows 3-4`, 'stat', price, {
      layer: 10,
      typography: typo('stat', { fontSize: 36, align: 'left' }),
      max_lines: 1,
    }),
    slot(`PLAN_${n}_BODY`, `${region}, rows 4-9`, 'body', features, {
      layer: 10,
      typography: typo('body', { fontSize: 14 }),
      max_lines: 6,
    }),
  ]
}

const DEFAULT_MEMBERS = [
  { name: 'Johanna Doe', role: 'Co-founder & CEO', email: 'johanna@example.com' },
  { name: 'Jane Doe', role: 'Co-founder & CTO', email: 'jane@example.com' },
  { name: 'Joe Doe', role: 'Co-founder & COO', email: 'joe@example.com' },
  { name: 'Jenny Doe', role: 'President', email: 'jenny@example.com' },
  { name: 'John Doe', role: 'Head of Design', email: 'john@example.com' },
  { name: 'James Doe', role: 'Head of Sales', email: 'james@example.com' },
]

/** Team member slots: circle image, name, role, email */
export function memberFields(index, regions = {}, member = null) {
  const n = index
  const m = member || DEFAULT_MEMBERS[(n - 1) % DEFAULT_MEMBERS.length]
  const {
    image = `cols 1-3, rows 1-3`,
    name = `cols 4-12, rows 1-2`,
    role = `cols 4-12, rows 2-3`,
    email = `cols 4-12, rows 3-4`,
  } = regions
  return [
    slot(`MEMBER_${n}_IMAGE`, image, 'image', null, { layer: 2, fit: 'cover' }),
    slot(`MEMBER_${n}_NAME`, name, 'heading', m.name, {
      layer: 10,
      typography: typo('heading', { fontSize: 18 }),
      max_lines: 1,
    }),
    slot(`MEMBER_${n}_ROLE`, role, 'caption', m.role, {
      layer: 10,
      typography: typo('caption'),
      max_lines: 1,
    }),
    slot(`MEMBER_${n}_EMAIL`, email, 'caption', m.email, {
      layer: 10,
      typography: typo('caption', { fontSize: 12 }),
      max_lines: 1,
    }),
  ]
}

/** Contact info block: address, phone, email */
export function contactInfoFields(startCol = 7, endCol = 11) {
  return [
    heading('HEADING', `cols ${startCol}-${endCol}, rows 2-3`, 'Contact me', {
      typography: typo('heading', { fontSize: 32 }),
    }),
    slot('CONTACT_ADDRESS_LABEL', `cols ${startCol}-${endCol}, rows 4-5`, 'caption', 'Address', {
      layer: 10,
      typography: typo('caption'),
    }),
    slot('CONTACT_ADDRESS', `cols ${startCol}-${endCol}, rows 5-6`, 'body', '123 Main Street\nCity, State 12345', {
      layer: 10,
      typography: typo('body', { fontSize: 14 }),
      max_lines: 3,
    }),
    slot('CONTACT_PHONE_LABEL', `cols ${startCol}-${endCol}, rows 6-7`, 'caption', 'Phone', {
      layer: 10,
      typography: typo('caption'),
    }),
    slot('CONTACT_PHONE', `cols ${startCol}-${endCol}, rows 7-8`, 'body', '+1 (555) 123-4567', {
      layer: 10,
      typography: typo('body', { fontSize: 14 }),
      max_lines: 1,
    }),
    slot('CONTACT_EMAIL_LABEL', `cols ${startCol}-${endCol}, rows 8-9`, 'caption', 'Email', {
      layer: 10,
      typography: typo('caption'),
    }),
    slot('CONTACT_EMAIL', `cols ${startCol}-${endCol}, rows 9-10`, 'body', 'hello@example.com', {
      layer: 10,
      typography: typo('body', { fontSize: 14 }),
      max_lines: 1,
    }),
  ]
}

/** Agenda column: heading + numbered items */
export function agendaColumn(index, colStart, colEnd, rowStart = 2) {
  const n = index
  const region = `cols ${colStart}-${colEnd}`
  const headingRow = rowStart
  const itemRows = [rowStart + 1, rowStart + 2, rowStart + 3, rowStart + 4]
  const items = [
    slot(`AGENDA_COL_${n}_ITEM_1`, `${region}, rows ${itemRows[0]}-${itemRows[0] + 1}`, 'body', `${n}.1 Opening remarks`, {
      layer: 10,
      typography: typo('body', { fontSize: 14 }),
      max_lines: 2,
    }),
    slot(`AGENDA_COL_${n}_ITEM_2`, `${region}, rows ${itemRows[1]}-${itemRows[1] + 1}`, 'body', `${n}.2 Key topic`, {
      layer: 10,
      typography: typo('body', { fontSize: 14 }),
      max_lines: 2,
    }),
    slot(`AGENDA_COL_${n}_ITEM_3`, `${region}, rows ${itemRows[2]}-${itemRows[2] + 1}`, 'body', `${n}.3 Discussion`, {
      layer: 10,
      typography: typo('body', { fontSize: 14 }),
      max_lines: 2,
    }),
    slot(`AGENDA_COL_${n}_ITEM_4`, `${region}, rows ${itemRows[3]}-${itemRows[3] + 1}`, 'body', `${n}.4 Q&A`, {
      layer: 10,
      typography: typo('body', { fontSize: 14 }),
      max_lines: 2,
    }),
  ]
  return [
    heading(`AGENDA_COL_${n}_HEADING`, `${region}, rows ${headingRow}-${headingRow + 1}`, n === 1 ? 'Morning' : n === 2 ? 'Afternoon' : 'Evening', {
      typography: typo('heading', { fontSize: 22 }),
    }),
    ...items,
  ]
}

/** Collect AI shape hints from a layout schema (for prompts / generation). */
export function collectShapeHintsFromLayout(schema) {
  const hints = []
  for (const s of schema?.slots || []) {
    if (s.shapeHint) {
      hints.push({ slotId: s.id, role: s.role, ...s.shapeHint })
    } else if (s.aiOnly && s.shape) {
      hints.push({ slotId: s.id, role: s.role, suggestedBehind: 'card', aiOnly: true })
    }
  }
  return hints
}
