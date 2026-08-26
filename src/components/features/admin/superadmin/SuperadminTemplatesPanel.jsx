import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Search, Plus, X, LayoutTemplate, CheckCircle2, XCircle, Eye, GripVertical, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import superadminService, { SuperadminApiError } from '../../../../services/superadminService'
import { formatDate } from './superadminUtils'
import LayoutPolishedPreview, { getGridDims } from '../../../ppt/LayoutPolishedPreview'
import PackSlidePreview from '../../../ppt/PackSlidePreview'
import { buildLayoutSchemaMap, canPreviewDeckLayout, enrichLayoutSchemaForPreview, resolveSlideMediaFromPack } from '../../../../utils/deckLayoutRegistry'
import {
  DECK_LAYOUT_SLOT_ROLES,
  fixDeckLayoutSchemaRoles,
  getDeckLayoutStarter,
  listDeckLayoutStarters,
  validateDeckLayoutSchema,
} from '../../../../utils/deckLayoutSchema'
import { aspectRatioToCss, DECK_PACK_THEMES, resolveDeckPackTheme } from '../../../../utils/deckPackTheme'
import { parseRegion, regionToBox, SLOT_COLORS } from '../../../../utils/layoutPreviewUtils'
import '../../../../pages/AdminPortal/SuperadminPortal.css'

// ─── constants ────────────────────────────────────────────────────────────────

const TEMPLATE_TYPES = [
  { id: 'DECK_LAYOUT', label: 'Deck Layouts',  description: 'Single-slide layouts (grid + slots) used by the AI PPT editor' },
  { id: 'DECK_PACK',   label: 'Deck Packs',    description: 'Multi-slide branded packs referencing layouts + a theme' },
  { id: 'VIDEO_SCENE', label: 'Video Scenes',  description: 'Single video scene templates for the video project editor' },
  { id: 'VIDEO_PACK',  label: 'Video Packs',   description: 'Multi-scene video packs (snapshot-only, no AI)' },
]

/** Matches backend layoutCategories.js (Pitch-style gallery tabs). */
const LAYOUT_CATEGORIES = [
  { id: 'all', label: 'All', contentTypes: [] },
  {
    id: 'simple_slides',
    label: 'Simple slides',
    contentTypes: ['title', 'bullet_list', 'section_divider', 'image+text', 'comparison'],
  },
  { id: 'grid', label: 'Grid', contentTypes: ['grid'] },
  { id: 'charts_and_data', label: 'Charts and data', contentTypes: ['chart', 'stat'] },
  { id: 'timeline_and_plans', label: 'Timeline and project plans', contentTypes: ['timeline'] },
  { id: 'pricing', label: 'Pricing', contentTypes: ['pricing'] },
  { id: 'agenda', label: 'Agenda', contentTypes: ['agenda'] },
  { id: 'people_and_team', label: 'People and team', contentTypes: ['team'] },
  { id: 'quotes_and_testimonials', label: 'Quotes and testimonial', contentTypes: ['quote'] },
  { id: 'device_frames', label: 'Device frames', contentTypes: ['device_frames'] },
  { id: 'diagrams', label: 'Diagrams', contentTypes: ['diagram'] },
  { id: 'closing', label: 'Closing', contentTypes: ['closing'] },
]

const CONTENT_TYPE_LABELS = {
  title: 'Title',
  bullet_list: 'Bullet list',
  section_divider: 'Section divider',
  'image+text': 'Image + text',
  comparison: 'Comparison',
  grid: 'Grid',
  chart: 'Chart',
  stat: 'Stat',
  timeline: 'Timeline',
  pricing: 'Pricing',
  agenda: 'Agenda',
  team: 'Team',
  quote: 'Quote',
  device_frames: 'Device frames',
  diagram: 'Diagram',
  closing: 'Closing',
}

const CONTENT_TYPES = LAYOUT_CATEGORIES
  .filter((c) => c.id !== 'all')
  .flatMap((c) => c.contentTypes)

function contentTypeLabel(id) {
  if (!id) return ''
  return CONTENT_TYPE_LABELS[id] || String(id).replace(/_/g, ' ')
}

/** Map a layout/template row to a gallery category id (matches AddSlideModal + backend layoutCategories). */
function resolveLayoutCategoryId(entry = {}) {
  const ct = String(
    entry?.schema?.content_type
    || entry?.contentType
    || entry?.rawContentType
    || ''
  ).toLowerCase()
  const layoutId = String(
    entry?.schema?.layout_id
    || entry?.layoutId
    || entry?.variant
    || ''
  ).toLowerCase()

  if (ct === 'grid') return 'grid'
  if (ct === 'chart' || ct === 'stat') return 'charts_and_data'
  if (ct === 'timeline') return 'timeline_and_plans'
  if (ct === 'pricing' || layoutId.includes('pricing')) return 'pricing'
  if (ct === 'agenda') return 'agenda'
  if (ct === 'team') return 'people_and_team'
  if (ct === 'quote') return 'quotes_and_testimonials'
  if (ct === 'device_frames' || layoutId.startsWith('device_')) return 'device_frames'
  if (ct === 'diagram' || layoutId.startsWith('diagram_')) return 'diagrams'
  if (ct === 'closing') return 'closing'
  if (ct === 'comparison') return 'simple_slides'
  if (['title', 'bullet_list', 'section_divider', 'image+text', 'image_text'].includes(ct)) {
    return 'simple_slides'
  }
  return 'simple_slides'
}

function LayoutCategorySelect({ value, onChange, items, counts = {} }) {
  return (
    <select
      className="sa-select"
      aria-label="Layout category"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        height: 32,
        fontSize: '0.8rem',
        borderRadius: 8,
        minWidth: 168,
        maxWidth: 220,
        padding: '0 28px 0 10px',
        boxSizing: 'border-box',
      }}
    >
      {items.map((category) => {
        const count = counts[category.id]
        const suffix = typeof count === 'number' ? ` (${count})` : ''
        return (
          <option key={category.id} value={category.id}>
            {category.label}{suffix}
          </option>
        )
      })}
    </select>
  )
}

function ContentTypeSelect({ value, onChange, disabled, emptyLabel = '— select —' }) {
  return (
    <select
      className="sa-select"
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={{ width: '100%', boxSizing: 'border-box' }}
    >
      <option value="">{emptyLabel}</option>
      {LAYOUT_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
        <optgroup key={cat.id} label={cat.label}>
          {cat.contentTypes.map((ct) => (
            <option key={ct} value={ct}>{contentTypeLabel(ct)}</option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}

// All seeded themes — used for DECK_PACK themeId picker
const THEME_OPTIONS = [
  { id: 'midnight_blue',  label: 'Midnight Blue' },
  { id: 'clean_light',    label: 'Clean Light' },
  { id: 'forest_slate',   label: 'Forest Slate' },
  { id: 'warm_sand',      label: 'Warm Sand' },
  { id: 'charcoal_gold',  label: 'Charcoal Gold' },
  { id: 'ocean_mist',     label: 'Ocean Mist' },
  { id: 'violet_noir',    label: 'Violet Noir' },
  { id: 'paper_ink',      label: 'Paper Ink' },
  { id: 'sunset_coral',   label: 'Sunset Coral' },
  { id: 'mint_clinic',    label: 'Mint Clinic' },
]

const CONTENT_TYPE_PREFIXES = [
  ['title', 'title'],
  ['agenda', 'agenda'],
  ['bullet', 'bullet_list'],
  ['numbered', 'bullet_list'],
  ['policy', 'bullet_list'],
  ['achievement', 'stat'],
  ['comparison', 'comparison'],
  ['stat', 'stat'],
  ['quote', 'quote'],
  ['image', 'image+text'],
  ['timeline', 'timeline'],
  ['team', 'team'],
  ['chart', 'chart'],
  ['closing', 'closing'],
  ['section', 'section_divider'],
  ['grid', 'grid'],
  ['device', 'device_frames'],
  ['pricing', 'pricing'],
]

function guessContentTypeFromLayoutId(layoutId = '') {
  const id = String(layoutId).toLowerCase()
  for (const [prefix, type] of CONTENT_TYPE_PREFIXES) {
    if (id.startsWith(prefix)) return type
  }
  return 'bullet_list'
}

function resolveLayoutContentType(layoutSchema, layoutId) {
  return layoutSchema?.content_type
    || layoutSchema?.contentType
    || guessContentTypeFromLayoutId(layoutId)
}

function defaultPlaceholderForContentType(contentType) {
  switch (contentType) {
    case 'title':
      return { title: 'Presentation Title', subtitle: 'Tagline or company name' }
    case 'agenda':
      return { title: 'Agenda', bullets: ['Topic one', 'Topic two', 'Topic three'] }
    case 'section_divider':
      return { title: 'Section', subtitle: 'Chapter intro' }
    case 'stat':
      return {
        title: 'Key metrics',
        stats: [
          { value: '00%', label: 'Metric one' },
          { value: '00', label: 'Metric two' },
          { value: '0x', label: 'Metric three' },
        ],
      }
    case 'quote':
      return { title: '“A memorable quote goes here.”', subtitle: '— Speaker name' }
    case 'comparison':
      return {
        title: 'Comparison',
        left: { title: 'Option A', bullets: ['Pro one', 'Pro two'] },
        right: { title: 'Option B', bullets: ['Pro one', 'Pro two'] },
      }
    case 'timeline':
      return { title: 'Timeline', bullets: ['Phase 1', 'Phase 2', 'Phase 3'] }
    case 'team':
      return { title: 'Our team', bullets: ['Role one', 'Role two', 'Role three'] }
    case 'chart':
      return { title: 'Performance', subtitle: 'Chart caption' }
    case 'grid':
      return { title: 'Overview', bullets: ['Insight one', 'Insight two', 'Insight three'] }
    case 'image+text':
      return {
        title: 'Topic',
        bullets: ['Point one', 'Point two', 'Point three'],
        imagePrompt: 'Professional photo that supports the slide topic',
      }
    case 'closing':
      return { title: 'Thank You', subtitle: 'contact@company.com' }
    case 'bullet_list':
    default:
      return { title: 'Key Points', bullets: ['Point one', 'Point two', 'Point three'] }
  }
}

function defaultIntentForContentType(contentType) {
  const map = {
    title: 'Hook the audience with a strong opening statement',
    agenda: 'Signal structure with a crisp agenda',
    bullet_list: 'List the top 3–4 key points concisely',
    section_divider: 'Mark a clear chapter break',
    'image+text': 'Explain the idea with supporting visuals',
    comparison: 'Contrast two options side by side',
    grid: 'Show several related insights at a glance',
    chart: 'Make the trend or data easy to grasp',
    stat: 'Lead with credible traction metrics',
    timeline: 'Show progress or plan over time',
    team: 'Introduce the people behind the story',
    quote: 'Land a memorable line from a credible voice',
    closing: 'End with a clear call-to-action',
  }
  return map[contentType] || 'Advance the narrative clearly on this slide'
}

function defaultDesignTokensForContentType(contentType) {
  if (contentType === 'title' || contentType === 'closing' || contentType === 'section_divider') {
    return { backgroundStyle: 'gradient', accentPosition: 'bottom-bar', textContrast: 'high' }
  }
  if (contentType === 'image+text') {
    return { backgroundStyle: 'solid', accentPosition: 'none', imagePosition: 'left-half', textContrast: 'normal' }
  }
  return { backgroundStyle: 'solid', accentPosition: 'left-bar', textContrast: 'normal' }
}

function defaultGenerationHintsForContentType(contentType) {
  switch (contentType) {
    case 'title':
      return { maxTitleWords: 8, maxBodyWords: 20 }
    case 'agenda':
    case 'bullet_list':
      return { maxTitleWords: 6, maxBodyWords: 60, itemCountMin: 3, itemCountMax: 5 }
    case 'stat':
      return { maxTitleWords: 8, statFormat: 'percentage, dollar, or multiplier' }
    case 'image+text':
      return { maxTitleWords: 8, maxBodyWords: 40, imagePromptStyle: 'photo' }
    case 'closing':
      return { maxTitleWords: 6, maxBodyWords: 30 }
    default:
      return { maxTitleWords: 8, maxBodyWords: 50 }
  }
}

function buildPackSlideFromLayout({ layoutId, order, layoutSchema, existingSlide = null }) {
  if (existingSlide && existingSlide.layout_id === layoutId) {
    return {
      ...existingSlide,
      order,
      layout_id: layoutId,
      contentType: existingSlide.contentType || resolveLayoutContentType(layoutSchema, layoutId),
    }
  }
  const contentType = resolveLayoutContentType(layoutSchema, layoutId)
  const slide = {
    order,
    layout_id: layoutId,
    contentType,
    intent: defaultIntentForContentType(contentType),
    designTokens: defaultDesignTokensForContentType(contentType),
    generationHints: defaultGenerationHintsForContentType(contentType),
    placeholder: defaultPlaceholderForContentType(contentType),
  }
  if (contentType === 'image+text' && !slide.placeholder.imagePrompt) {
    slide.placeholder.imagePrompt = 'Professional photo that supports the slide topic'
  }
  return slide
}

function readLayoutIdsFromPackSchema(schemaStr) {
  const { ok, value } = parseJsonSafe(schemaStr)
  if (!ok || !Array.isArray(value?.slides)) return []
  return value.slides.map((s) => s?.layout_id).filter(Boolean).map(String)
}

function applyLayoutsToPackSchema(schemaStr, selectedLayoutIds, layoutSchemaMap = {}) {
  const parsed = parseJsonSafe(schemaStr)
  if (!parsed.ok) return { ok: false, error: parsed.error, schemaStr }
  const schema = { ...parsed.value }
  const existing = Array.isArray(schema.slides) ? schema.slides : []
  const usedIndexes = new Set()

  const slides = selectedLayoutIds.map((layoutId, index) => {
    const existingIdx = existing.findIndex(
      (s, j) => !usedIndexes.has(j) && String(s?.layout_id || '') === String(layoutId)
    )
    const existingSlide = existingIdx >= 0 ? existing[existingIdx] : null
    if (existingIdx >= 0) usedIndexes.add(existingIdx)
    return buildPackSlideFromLayout({
      layoutId,
      order: index + 1,
      layoutSchema: layoutSchemaMap[layoutId] || null,
      existingSlide,
    })
  })

  schema.slides = slides
  const whitelist = [...new Set(selectedLayoutIds)]
  schema.generationDefaults = {
    density: 'balanced',
    imageType: 'ai',
    imageStyle: 'photo',
    preferVisuals: true,
    slideOrder: 'fixed',
    contentDistribution: {
      maxConsecutiveBulletSlides: 2,
      requireStatSlide: false,
      requireImageSlide: true,
    },
    ...(schema.generationDefaults || {}),
    layoutWhitelist: whitelist,
  }
  if (schema.preview && typeof schema.preview === 'object') {
    schema.preview = { ...schema.preview, slideCount: slides.length }
  }
  return { ok: true, schemaStr: JSON.stringify(schema, null, 2) }
}

function buildLayoutCatalog(templates = []) {
  return (templates || [])
    .filter((t) => t?.schema?.layout_id || t?.schema?.layoutId)
    .map((t) => {
      const layoutId = String(t.schema.layout_id || t.schema.layoutId)
      return {
        id: t.id,
        layoutId,
        name: t.name || layoutId,
        contentType: t.contentType || t.schema.content_type || guessContentTypeFromLayoutId(layoutId),
        isActive: t.isActive !== false,
        schema: t.schema,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

function unwrapTemplateRows(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.templates)) return data.templates
  if (Array.isArray(data?.data)) return data.data
  return []
}

const DECK_LAYOUT_PLACEHOLDER = JSON.stringify({
  layout_id: 'grid_bento_three_v1',
  content_type: 'grid',
  schemaVersion: 2,
  grid: '12-col',
  shapePolicy: 'ai_decides',
  preview: { mode: 'grid_bento_three' },
  slots: [
    { id: 'IMAGE_1', region: 'cols 1-6, rows 1-5', role: 'image', layer: 2, fit: 'cover' },
    { id: 'IMAGE_2', region: 'cols 1-6, rows 6-10', role: 'image', layer: 2, fit: 'cover' },
    { id: 'IMAGE_3', region: 'cols 7-12, rows 1-10', role: 'image', layer: 2, fit: 'cover' },
  ],
}, null, 2)

const DECK_PACK_PLACEHOLDER_BASE = {
  schemaVersion: 2,
  pack_id: 'my_pack_midnight',
  themeId: 'midnight_blue',
  aspectRatio: '16:9',
  meta: {
    name: 'My Pack',
    description: 'Short description of this pack',
    useCase: 'General purpose',
    audience: 'Business professionals',
    tone: 'Professional, confident',
    industry: [],
  },
  narrative: {
    arc: 'problem → solution → outcome',
    summary: 'Describe the overall story arc so the AI knows how to distribute content across slides',
  },
  slides: [],
  generationDefaults: {
    density: 'balanced',
    imageType: 'ai',
    imageStyle: 'photo',
    preferVisuals: true,
    layoutWhitelist: [],
    slideOrder: 'fixed',
    contentDistribution: {
      maxConsecutiveBulletSlides: 2,
      requireStatSlide: false,
      requireImageSlide: true,
    },
  },
  preview: {
    label: 'My Pack',
    description: 'Brief description shown in the pack picker',
    tags: ['general'],
    slideCount: 0,
  },
}

/** Prefer title → mid content → closing from the live catalog; fill up to `take`. */
function pickDefaultLayoutIds(layoutCatalog = [], take = 3) {
  const active = (layoutCatalog || []).filter((l) => l?.layoutId && l.isActive !== false)
  if (!active.length) return []

  const unused = [...active]
  const takeOne = (predicate) => {
    const idx = unused.findIndex(predicate)
    if (idx < 0) return null
    const [item] = unused.splice(idx, 1)
    return item.layoutId
  }

  const picks = []
  const title = takeOne((l) => l.contentType === 'title')
  if (title) picks.push(title)

  const mid = takeOne((l) => !['title', 'closing'].includes(l.contentType))
  if (mid) picks.push(mid)

  const closing = takeOne((l) => l.contentType === 'closing')
  if (closing) picks.push(closing)

  for (const layout of unused) {
    if (picks.length >= take) break
    picks.push(layout.layoutId)
  }
  return picks.slice(0, take)
}

function buildDeckPackPlaceholder(layoutCatalog = []) {
  const baseStr = JSON.stringify(DECK_PACK_PLACEHOLDER_BASE, null, 2)
  const ids = pickDefaultLayoutIds(layoutCatalog, 3)
  if (!ids.length) return baseStr

  const schemaMap = {}
  for (const item of layoutCatalog) {
    if (item?.layoutId && item.schema) schemaMap[item.layoutId] = item.schema
  }
  const result = applyLayoutsToPackSchema(baseStr, ids, schemaMap)
  return result.ok ? result.schemaStr : baseStr
}

const DECK_PACK_PLACEHOLDER = JSON.stringify(DECK_PACK_PLACEHOLDER_BASE, null, 2)

const VIDEO_SCENE_PLACEHOLDER = JSON.stringify({
  version: 1,
  videoSettings: { fps: 30, width: 1920, height: 1080 },
  meta: {
    name: 'My Video Scene',
    description: 'Short description',
    useCase: 'intro',
    tone: 'professional',
  },
  scene: {
    durationInFrames: 150,
    background: { type: 'color', value: '#0B1220' },
    elements: [],
  },
}, null, 2)

const VIDEO_PACK_PLACEHOLDER = JSON.stringify({
  schemaVersion: 2,
  pack_id: 'my_video_pack',
  meta: {
    name: 'My Video Pack',
    description: 'Multi-scene video pack (snapshot-only, no AI)',
    useCase: 'onboarding',
  },
  videoSettings: { fps: 30, width: 1920, height: 1080 },
  scenes: [],
  preview: {
    label: 'My Video Pack',
    description: 'Brief description shown in the video picker',
  },
}, null, 2)

// Extract a human-readable title string from a slide placeholder (string or rich object)
function extractPlaceholderTitle(placeholder) {
  if (placeholder == null) return ''
  if (typeof placeholder === 'string') return placeholder
  if (typeof placeholder === 'object') {
    if (placeholder.title) return String(placeholder.title)
    if (placeholder.value) return String(placeholder.value)
    if (Array.isArray(placeholder.stats) && placeholder.stats[0]?.value) return placeholder.stats[0].value
    if (Array.isArray(placeholder.bullets) && placeholder.bullets[0]) return String(placeholder.bullets[0])
    const { imagePrompt: _skip, ...rest } = placeholder
    const first = Object.values(rest)[0]
    return first && typeof first === 'string' ? first : ''
  }
  return String(placeholder)
}

function schemaPlaceholder(type, layoutCatalog = []) {
  if (type === 'DECK_LAYOUT') return DECK_LAYOUT_PLACEHOLDER
  if (type === 'DECK_PACK')   return buildDeckPackPlaceholder(layoutCatalog)
  if (type === 'VIDEO_PACK')  return VIDEO_PACK_PLACEHOLDER
  return VIDEO_SCENE_PLACEHOLDER
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function parseJsonSafe(str) {
  try { return { ok: true, value: JSON.parse(str) } }
  catch (e) { return { ok: false, error: e.message } }
}

function readSchemaRootField(schemaStr, field) {
  const { ok, value } = parseJsonSafe(schemaStr)
  if (!ok || !value || typeof value !== 'object') return ''
  return value[field] ?? ''
}

function injectSchemaRootField(schemaStr, field, nextValue) {
  const { ok, value, error } = parseJsonSafe(schemaStr)
  if (!ok) return { ok: false, error, schemaStr }
  value[field] = nextValue
  return { ok: true, schemaStr: JSON.stringify(value, null, 2) }
}

function mergeTemplateWithSchemaStr(template, schemaStr) {
  const { ok, value } = parseJsonSafe(schemaStr)
  if (!ok) return template
  return { ...template, schema: value }
}

function DeckLayoutSchemaTools({ schemaStr, setSchemaStr, setName, setContentType, onError, disabled }) {
  const parsed = parseJsonSafe(schemaStr)
  const validation = parsed.ok ? validateDeckLayoutSchema(parsed.value) : null
  const starters = listDeckLayoutStarters()

  function applyStarter(starterId) {
    if (!starterId) return
    const full = getDeckLayoutStarter(starterId)
    if (!full) return
    setSchemaStr(JSON.stringify(full.schema, null, 2))
    if (full.suggestedName && setName) setName(full.suggestedName)
    if (full.contentType && setContentType) setContentType(full.contentType)
    onError?.('')
  }

  function fixRoles() {
    const { ok, value, error } = parseJsonSafe(schemaStr)
    if (!ok) {
      onError?.(`Schema is not valid JSON: ${error}`)
      return
    }
    const { schema, changes } = fixDeckLayoutSchemaRoles(value)
    setSchemaStr(JSON.stringify(schema, null, 2))
    if (changes.length) {
      onError?.(`Fixed roles: ${changes.map((c) => `${c.id || c.index} (${c.from} → ${c.to})`).join(', ')}`)
    } else {
      onError?.('')
    }
  }

  return (
    <div style={{ marginBottom: 12, padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'color-mix(in srgb, var(--primary) 6%, var(--bg-card))' }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Layout starter
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        <select
          className="sa-select"
          style={{ flex: '1 1 220px', minWidth: 180, fontSize: '0.8rem' }}
          defaultValue=""
          disabled={disabled}
          onChange={(e) => {
            applyStarter(e.target.value)
            e.target.value = ''
          }}
        >
          <option value="">Load a starter template…</option>
          {starters.map((s) => (
            <option key={s.id} value={s.id}>{s.label} ({s.layoutId})</option>
          ))}
        </select>
        <button type="button" className="sa-btn" disabled={disabled || !parsed.ok} onClick={fixRoles}>
          Fix invalid roles
        </button>
      </div>
      <p style={{ margin: '0 0 8px', fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
        Allowed roles: {DECK_LAYOUT_SLOT_ROLES.join(', ')}. Use <code style={{ fontSize: '0.7rem' }}>caption</code> not label, <code style={{ fontSize: '0.7rem' }}>decoration</code> not icon.
      </p>
      {parsed.ok && validation && !validation.ok && (
        <div style={{ fontSize: '0.72rem', color: '#f87171', lineHeight: 1.45 }}>
          {validation.errors.slice(0, 4).map((msg) => <div key={msg}>{msg}</div>)}
          {validation.errors.length > 4 && <div>…and {validation.errors.length - 4} more</div>}
        </div>
      )}
      {parsed.ok && validation?.ok && (
        <div style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 600 }}>✓ All slot roles valid for backend</div>
      )}
    </div>
  )
}

function DeckPackQuickSelects({ schemaStr, setSchemaStr, onError, themeLabel = 'THEME ID', ratioLabel = 'ASPECT RATIO' }) {
  const themeId = readSchemaRootField(schemaStr, 'themeId')
  const aspectRatio = readSchemaRootField(schemaStr, 'aspectRatio')

  function inject(field, nextValue) {
    const result = injectSchemaRootField(schemaStr, field, nextValue)
    if (!result.ok) {
      onError?.(`Cannot inject ${field} — schema JSON is invalid: ${result.error}`)
      return
    }
    setSchemaStr(result.schemaStr)
    onError?.('')
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
      <div>
        <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>{themeLabel}</label>
        <select
          className="sa-select"
          style={{ width: '100%', boxSizing: 'border-box', fontSize: '0.8rem' }}
          value={themeId}
          onChange={(e) => { if (e.target.value) inject('themeId', e.target.value) }}
        >
          <option value="">— no theme in schema —</option>
          {THEME_OPTIONS.map((t) => (
            <option key={t.id} value={t.id}>{t.label} ({t.id})</option>
          ))}
        </select>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>{ratioLabel}</label>
        <select
          className="sa-select"
          style={{ width: '100%', boxSizing: 'border-box', fontSize: '0.8rem' }}
          value={aspectRatio}
          onChange={(e) => { if (e.target.value) inject('aspectRatio', e.target.value) }}
        >
          <option value="">— no ratio in schema —</option>
          {['16:9', '4:3', '9:16'].map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

/** Compact summary in create/edit — opens a separate roomy picker modal. */
function DeckPackLayoutPicker({
  schemaStr,
  setSchemaStr,
  layoutCatalog = [],
  layoutSchemaMap = {},
  onError,
  disabled = false,
}) {
  const [open, setOpen] = useState(false)
  const selectedIds = readLayoutIdsFromPackSchema(schemaStr)

  const catalogById = useMemo(() => {
    const map = {}
    for (const item of layoutCatalog) map[item.layoutId] = item
    return map
  }, [layoutCatalog])

  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Slide layouts
          </p>
          <p style={{ margin: '3px 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {selectedIds.length
              ? `${selectedIds.length} slide${selectedIds.length === 1 ? '' : 's'} in schema`
              : 'No slides yet — open the picker to compose the pack'}
          </p>
        </div>
        <button
          type="button"
          className="sa-btn sa-btn--primary sa-btn--sm"
          disabled={disabled}
          onClick={() => setOpen(true)}
          style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <LayoutTemplate size={13} />
          {selectedIds.length ? 'Manage slides' : 'Choose layouts'}
        </button>
      </div>

      {selectedIds.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 72, overflow: 'hidden' }}>
          {selectedIds.slice(0, 8).map((layoutId, index) => {
            const meta = catalogById[layoutId]
            return (
              <span
                key={`${layoutId}-${index}`}
                title={layoutId}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  maxWidth: 180, padding: '4px 8px', borderRadius: 999,
                  border: '1px solid var(--border-color)',
                  background: 'color-mix(in srgb, var(--primary) 8%, var(--bg-card))',
                  fontSize: '0.7rem', color: 'var(--text-main)',
                }}
              >
                <span style={{
                  width: 16, height: 16, borderRadius: 999, flexShrink: 0,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.6rem', fontWeight: 700,
                  background: 'color-mix(in srgb, var(--primary) 20%, transparent)',
                  color: 'var(--primary)',
                }}>
                  {index + 1}
                </span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                  {meta?.name || layoutId}
                </span>
              </span>
            )
          })}
          {selectedIds.length > 8 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', padding: '4px 8px', borderRadius: 999,
              fontSize: '0.7rem', color: 'var(--text-muted)', border: '1px dashed var(--border-color)',
            }}>
              +{selectedIds.length - 8} more
            </span>
          )}
        </div>
      )}

      {open && (
        <DeckPackLayoutPickerModal
          schemaStr={schemaStr}
          setSchemaStr={setSchemaStr}
          layoutCatalog={layoutCatalog}
          layoutSchemaMap={layoutSchemaMap}
          onError={onError}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}

/** Full-screen-ish two-column picker — keeps the create modal short. */
function DeckPackLayoutPickerModal({
  schemaStr,
  setSchemaStr,
  layoutCatalog = [],
  layoutSchemaMap = {},
  onError,
  onClose,
}) {
  const [draftIds, setDraftIds] = useState(() => readLayoutIdsFromPackSchema(schemaStr))
  const [query, setQuery] = useState('')
  const [layoutCategory, setLayoutCategory] = useState('all')
  const [localCatalog, setLocalCatalog] = useState(layoutCatalog)
  const [catalogLoading, setCatalogLoading] = useState(layoutCatalog.length === 0)
  const [catalogError, setCatalogError] = useState('')
  const [applyError, setApplyError] = useState('')
  const [dragIndex, setDragIndex] = useState(null)
  const [overIndex, setOverIndex] = useState(null)
  const [showPackPreview, setShowPackPreview] = useState(false)
  const [previewLayout, setPreviewLayout] = useState(null)

  useEffect(() => {
    if (layoutCatalog.length) {
      setLocalCatalog(layoutCatalog)
      setCatalogLoading(false)
      setCatalogError('')
    }
  }, [layoutCatalog])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setCatalogLoading(true)
      setCatalogError('')
      try {
        const data = await superadminService.listTemplates({ type: 'DECK_LAYOUT' })
        if (cancelled) return
        const next = buildLayoutCatalog(unwrapTemplateRows(data))
        setLocalCatalog(next)
        if (!next.length) setCatalogError('No deck layouts returned from the API.')
      } catch (err) {
        if (!cancelled) {
          setCatalogError(err instanceof SuperadminApiError ? err.message : 'Failed to load layouts')
          if (!layoutCatalog.length) setLocalCatalog([])
        }
      } finally {
        if (!cancelled) setCatalogLoading(false)
      }
    })()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      // Nested previews handle their own Escape; don't close compose under them.
      if (showPackPreview || previewLayout) return
      onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, showPackPreview, previewLayout])

  const mergedSchemaMap = useMemo(() => {
    const map = { ...layoutSchemaMap }
    for (const item of localCatalog) {
      if (item.layoutId && item.schema) map[item.layoutId] = item.schema
    }
    return map
  }, [layoutSchemaMap, localCatalog])

  const previewPackSchema = useMemo(() => {
    if (!draftIds.length) return null
    const result = applyLayoutsToPackSchema(schemaStr, draftIds, mergedSchemaMap)
    if (!result.ok) return null
    const parsed = parseJsonSafe(result.schemaStr)
    return parsed.ok ? parsed.value : null
  }, [schemaStr, draftIds, mergedSchemaMap])

  const catalogById = useMemo(() => {
    const map = {}
    for (const item of localCatalog) map[item.layoutId] = item
    return map
  }, [localCatalog])

  const activeLayouts = useMemo(
    () => localCatalog.filter((l) => l.isActive !== false),
    [localCatalog]
  )

  const layoutCategoryCounts = useMemo(() => {
    const out = { all: activeLayouts.length }
    for (const layout of activeLayouts) {
      const cat = resolveLayoutCategoryId(layout)
      out[cat] = (out[cat] || 0) + 1
    }
    return out
  }, [activeLayouts])

  const filteredLayouts = useMemo(() => {
    const q = query.trim().toLowerCase()
    return activeLayouts.filter((l) => {
      if (layoutCategory !== 'all' && resolveLayoutCategoryId(l) !== layoutCategory) return false
      if (!q) return true
      return (
        l.name.toLowerCase().includes(q)
        || l.layoutId.toLowerCase().includes(q)
        || contentTypeLabel(l.contentType).toLowerCase().includes(q)
      )
    })
  }, [activeLayouts, query, layoutCategory])

  function reorderDraft(fromIndex, toIndex) {
    if (fromIndex == null || toIndex == null || fromIndex === toIndex) return
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= draftIds.length || toIndex >= draftIds.length) return
    setDraftIds((prev) => {
      const copy = [...prev]
      const [item] = copy.splice(fromIndex, 1)
      copy.splice(toIndex, 0, item)
      return copy
    })
  }

  function handleApply() {
    const result = applyLayoutsToPackSchema(schemaStr, draftIds, mergedSchemaMap)
    if (!result.ok) {
      setApplyError(`Cannot update slides — schema JSON is invalid: ${result.error}`)
      onError?.(`Cannot update slides — schema JSON is invalid: ${result.error}`)
      return
    }
    setSchemaStr(result.schemaStr)
    onError?.('')
    onClose()
  }

  function handlePreviewPack() {
    if (!draftIds.length) {
      setApplyError('Add at least one layout to preview the full pack.')
      return
    }
    if (!previewPackSchema?.slides?.length) {
      setApplyError('Cannot build pack preview — fix schema JSON first.')
      return
    }
    setApplyError('')
    setShowPackPreview(true)
  }

  const packName = previewPackSchema?.meta?.name
    || previewPackSchema?.pack_id
    || readSchemaRootField(schemaStr, 'pack_id')
    || 'Pack preview'

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1400,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(4px)', padding: 16,
      }}
    >
      <div style={{
        width: 'min(980px, 96vw)', height: 'min(720px, 90vh)',
        background: 'var(--bg-card)', borderRadius: 14,
        border: '1px solid var(--border-color)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          padding: '14px 18px', borderBottom: '1px solid var(--border-color)', flexShrink: 0,
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Compose pack slides</h3>
            <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Add layouts in order, then apply — updates <code style={{ fontSize: '0.72rem' }}>slides[]</code> and whitelist
            </p>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.05fr)', gap: 0 }}>
          {/* Catalog */}
          <div style={{
            minHeight: 0, display: 'flex', flexDirection: 'column',
            borderRight: '1px solid var(--border-color)', padding: 14,
          }}>
            <p style={{ margin: '0 0 8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Layout catalog
            </p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '1 1 140px' }}>
                <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="sa-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search layouts…"
                  style={{ width: '100%', boxSizing: 'border-box', paddingLeft: 28, fontSize: '0.78rem', height: 34 }}
                />
              </div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <LayoutCategorySelect
                value={layoutCategory}
                onChange={setLayoutCategory}
                items={LAYOUT_CATEGORIES}
                counts={layoutCategoryCounts}
              />
            </div>
            <div className="sa-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {catalogLoading ? (
                <span style={{ padding: 10, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Loading layouts…</span>
              ) : catalogError && activeLayouts.length === 0 ? (
                <span style={{ padding: 10, fontSize: '0.75rem', color: '#f87171' }}>{catalogError}</span>
              ) : activeLayouts.length === 0 ? (
                <span style={{ padding: 10, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  No active deck layouts found. Create layouts first.
                </span>
              ) : filteredLayouts.length === 0 ? (
                <span style={{ padding: 10, fontSize: '0.75rem', color: 'var(--text-muted)' }}>No layouts match this filter.</span>
              ) : filteredLayouts.map((layout) => {
                const layoutSchema = layout.schema || mergedSchemaMap[layout.layoutId] || null
                const canPreview = Array.isArray(layoutSchema?.slots) && layoutSchema.slots.length > 0
                return (
                  <div
                    key={layout.id || layout.layoutId}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '6px 6px 6px 10px', borderRadius: 8,
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-card)', color: 'var(--text-main)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setDraftIds((prev) => [...prev, layout.layoutId])}
                      title="Add to pack"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left',
                        flex: 1, minWidth: 0, padding: '2px 0',
                        border: 'none', background: 'transparent', color: 'inherit', cursor: 'pointer',
                      }}
                    >
                      <Plus size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{layout.name}</div>
                        <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {layout.layoutId} · {contentTypeLabel(layout.contentType)}
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      className="sa-btn sa-btn--ghost sa-btn--sm"
                      disabled={!canPreview}
                      title={canPreview ? 'Preview layout' : 'No slots to preview'}
                      onClick={() => {
                        if (!canPreview) return
                        setPreviewLayout({
                          schema: layoutSchema,
                          name: layout.name || layout.layoutId,
                        })
                      }}
                      style={{
                        padding: 6, flexShrink: 0, opacity: canPreview ? 1 : 0.35,
                        color: 'var(--text-muted)',
                      }}
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Selected order */}
          <div style={{ minHeight: 0, display: 'flex', flexDirection: 'column', padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Pack order ({draftIds.length})
                </p>
                {draftIds.length > 1 && (
                  <p style={{ margin: '2px 0 0', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    Drag the handle to rearrange
                  </p>
                )}
              </div>
              {draftIds.length > 0 && (
                <button type="button" className="sa-btn sa-btn--ghost sa-btn--sm" onClick={() => setDraftIds([])}>
                  Clear all
                </button>
              )}
            </div>
            <div className="sa-scroll" style={{
              flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6,
              padding: 8, borderRadius: 8,
              border: '1px dashed color-mix(in srgb, var(--border-color) 80%, transparent)',
              background: 'color-mix(in srgb, var(--bg-card) 50%, transparent)',
            }}>
              {draftIds.length === 0 ? (
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: 8 }}>
                  Click layouts on the left to build the slide sequence.
                </span>
              ) : draftIds.map((layoutId, index) => {
                const meta = catalogById[layoutId]
                const isDragging = dragIndex === index
                const isOver = overIndex === index && dragIndex !== null && dragIndex !== index
                return (
                  <div
                    key={`${layoutId}-${index}`}
                    draggable
                    onDragStart={(e) => {
                      setDragIndex(index)
                      setOverIndex(index)
                      e.dataTransfer.effectAllowed = 'move'
                      e.dataTransfer.setData('text/plain', String(index))
                      try { e.dataTransfer.setData('application/x-pack-slide-index', String(index)) } catch { /* ignore */ }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.dataTransfer.dropEffect = 'move'
                      if (overIndex !== index) setOverIndex(index)
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault()
                      setOverIndex(index)
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      const raw = e.dataTransfer.getData('application/x-pack-slide-index')
                        || e.dataTransfer.getData('text/plain')
                      const from = Number.parseInt(raw, 10)
                      const fromIndex = Number.isFinite(from) ? from : dragIndex
                      reorderDraft(fromIndex, index)
                      setDragIndex(null)
                      setOverIndex(null)
                    }}
                    onDragEnd={() => {
                      setDragIndex(null)
                      setOverIndex(null)
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '7px 9px', borderRadius: 8,
                      border: `1px solid ${isOver ? 'var(--primary)' : 'var(--border-color)'}`,
                      background: isDragging
                        ? 'color-mix(in srgb, var(--primary) 12%, var(--bg-card))'
                        : isOver
                          ? 'color-mix(in srgb, var(--primary) 8%, var(--bg-card))'
                          : 'var(--bg-card)',
                      opacity: isDragging ? 0.72 : 1,
                      boxShadow: isOver ? 'inset 0 0 0 1px color-mix(in srgb, var(--primary) 45%, transparent)' : 'none',
                      cursor: 'grab',
                      userSelect: 'none',
                    }}
                  >
                    <span
                      title="Drag to reorder"
                      style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-muted)', flexShrink: 0, cursor: 'grab', padding: '2px 0',
                      }}
                    >
                      <GripVertical size={15} />
                    </span>
                    <span style={{
                      width: 22, height: 22, borderRadius: 999, flexShrink: 0,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.68rem', fontWeight: 700,
                      background: 'color-mix(in srgb, var(--primary) 18%, transparent)',
                      color: 'var(--primary)',
                    }}>
                      {index + 1}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {meta?.name || layoutId}
                      </div>
                      <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {layoutId}
                        {meta?.contentType ? ` · ${contentTypeLabel(meta.contentType)}` : ''}
                        {!meta ? ' · not in catalog' : ''}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="sa-btn sa-btn--ghost sa-btn--sm"
                      onClick={() => setDraftIds((prev) => prev.filter((_, i) => i !== index))}
                      onMouseDown={(e) => e.stopPropagation()}
                      title="Remove"
                      style={{ padding: 4, color: '#f87171', flexShrink: 0, cursor: 'pointer' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          padding: '12px 18px', borderTop: '1px solid var(--border-color)', flexShrink: 0,
        }}>
          <div style={{ fontSize: '0.75rem', color: applyError ? '#f87171' : 'var(--text-muted)' }}>
            {applyError || 'Changes apply to the schema JSON when you confirm.'}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="sa-btn" onClick={onClose}>Cancel</button>
            <button
              type="button"
              className="sa-btn"
              onClick={handlePreviewPack}
              disabled={!draftIds.length}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              title={draftIds.length ? 'Preview the full pack slide sequence' : 'Add layouts first'}
            >
              <Eye size={14} /> Preview pack
            </button>
            <button type="button" className="sa-btn sa-btn--primary" onClick={handleApply}>
              Apply {draftIds.length} slide{draftIds.length === 1 ? '' : 's'}
            </button>
          </div>
        </div>
      </div>

      {showPackPreview && previewPackSchema?.slides?.length > 0 && (
        <DeckPackSlideModal
          slides={previewPackSchema.slides}
          theme={resolveDeckPackTheme(previewPackSchema.themeId)}
          themeId={previewPackSchema.themeId}
          aspectRatio={previewPackSchema.aspectRatio ?? '16:9'}
          packName={packName}
          previewImageUrl={null}
          media={[]}
          layoutSchemaMap={mergedSchemaMap}
          initialSlide={0}
          zIndex={1500}
          onClose={() => setShowPackPreview(false)}
        />
      )}

      {previewLayout && (() => {
        const enriched = enrichLayoutSchemaForPreview(previewLayout.schema)
        const slots = Array.isArray(enriched?.slots) ? enriched.slots : []
        const dims = getGridDims(slots)
        return (
          <DeckLayoutModal
            schema={enriched}
            layoutName={previewLayout.name}
            slots={slots}
            hasSlots={slots.length > 0}
            COLS={dims.COLS}
            ROWS={dims.ROWS}
            zIndex={1500}
            onClose={() => setPreviewLayout(null)}
          />
        )
      })()}
    </div>,
    document.body
  )
}

function ActiveBadge({ active }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 999, fontSize: '0.6875rem', fontWeight: 600,
      background: active
        ? 'color-mix(in srgb, #22c55e 15%, transparent)'
        : 'color-mix(in srgb, var(--text-muted) 12%, transparent)',
      border: `1px solid ${active
        ? 'color-mix(in srgb, #22c55e 35%, var(--border-color))'
        : 'var(--border-color)'}`,
      color: active ? '#4ade80' : 'var(--text-muted)',
    }}>
      {active
        ? <CheckCircle2 size={10} strokeWidth={2.5} />
        : <XCircle size={10} strokeWidth={2.5} />}
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

function TypePill({ type }) {
  const colors = {
    DECK_LAYOUT: { bg: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)' },
    DECK_PACK:   { bg: 'color-mix(in srgb, #a855f7 15%, transparent)',         color: '#c084fc' },
    VIDEO_SCENE: { bg: 'color-mix(in srgb, #f59e0b 15%, transparent)',         color: '#fbbf24' },
    VIDEO_PACK:  { bg: 'color-mix(in srgb, #f97316 15%, transparent)',         color: '#fb923c' },
  }
  const c = colors[type] || colors.DECK_LAYOUT
  const labels = { DECK_LAYOUT: 'Layout', DECK_PACK: 'Pack', VIDEO_SCENE: 'Scene', VIDEO_PACK: 'Video Pack' }
  return (
    <span style={{
      padding: '1px 7px', borderRadius: 999, fontSize: '0.6rem', fontWeight: 700,
      letterSpacing: '0.05em', textTransform: 'uppercase',
      background: c.bg, color: c.color,
    }}>
      {labels[type] ?? type}
    </span>
  )
}

// ─── JSON editor with validation feedback ─────────────────────────────────────

function JsonEditor({ value, onChange, placeholder, disabled, label }) {
  const parsed = parseJsonSafe(value)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{label}</label>
          {value.trim() && (
            <span style={{
              fontSize: '0.65rem', fontWeight: 600,
              color: parsed.ok ? '#4ade80' : '#f87171',
            }}>
              {parsed.ok ? '✓ valid JSON' : `✗ ${parsed.error}`}
            </span>
          )}
        </div>
      )}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        rows={14}
        spellCheck={false}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '10px 12px', borderRadius: 8,
          border: `1px solid ${value.trim() && !parsed.ok
            ? 'color-mix(in srgb, #ef4444 45%, var(--border-color))'
            : 'color-mix(in srgb, var(--text-muted) 35%, var(--border-color))'}`,
          background: 'var(--bg-card)', color: 'var(--text-main)',
          fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: 1.5,
          resize: 'vertical', transition: 'border-color 0.15s',
        }}
      />
    </div>
  )
}

// ─── Create modal ─────────────────────────────────────────────────────────────

function CreateModal({ onClose, onCreated, defaultType, prefill, layoutSchemaMap = {}, layoutCatalog = [] }) {
  const resolvedType = prefill?.type || defaultType || 'DECK_LAYOUT'
  const [type, setType]             = useState(resolvedType)
  const [name, setName]             = useState(prefill ? `${prefill.name} (copy)` : '')
  const [contentType, setContentType] = useState(prefill?.contentType || '')
  const [variant, setVariant]       = useState(prefill?.variant || '')
  const [isActive, setIsActive]     = useState(true)
  const [schemaStr, setSchemaStr]   = useState(() =>
    prefill?.schema
      ? JSON.stringify(prefill.schema, null, 2)
      : schemaPlaceholder(resolvedType, layoutCatalog)
  )
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [step, setStep]             = useState('details') // details | media
  const [createdTemplate, setCreatedTemplate] = useState(null)
  const [finishing, setFinishing]   = useState(false)
  const seededPackRef = useRef(false)

  // Reset / seed schema when type changes (skip when duplicating)
  useEffect(() => {
    if (prefill) return
    seededPackRef.current = false
    if (type === 'DECK_PACK') {
      setSchemaStr(schemaPlaceholder('DECK_PACK', layoutCatalog))
      if (layoutCatalog.length) seededPackRef.current = true
      return
    }
    setSchemaStr(schemaPlaceholder(type))
  }, [type]) // eslint-disable-line react-hooks/exhaustive-deps

  // When catalog loads after opening DECK_PACK create, seed real layouts once
  useEffect(() => {
    if (prefill || type !== 'DECK_PACK' || seededPackRef.current) return
    if (!layoutCatalog.length) return
    setSchemaStr(buildDeckPackPlaceholder(layoutCatalog))
    seededPackRef.current = true
  }, [layoutCatalog, type, prefill])

  function handlePreview() {
    setError('')
    const { ok, value, error: jsonErr } = parseJsonSafe(schemaStr)
    if (!ok) { setError(`Schema is not valid JSON: ${jsonErr}`); return }
    if (type === 'DECK_LAYOUT' && !Array.isArray(value?.slots)) {
      setError('Layout schema must include a slots array to preview')
      return
    }
    if (type === 'DECK_LAYOUT') {
      const roleCheck = validateDeckLayoutSchema(value)
      if (!roleCheck.ok) {
        setError(roleCheck.errors[0] || 'Invalid layout schema')
        return
      }
    }
    setShowPreview(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const { ok, value, error: jsonErr } = parseJsonSafe(schemaStr)
    if (!ok) { setError(`Schema is not valid JSON: ${jsonErr}`); return }
    if (!name.trim()) { setError('Name is required'); return }
    if (type === 'DECK_LAYOUT') {
      const roleCheck = validateDeckLayoutSchema(value)
      if (!roleCheck.ok) {
        setError(roleCheck.errors.join(' · '))
        return
      }
    }
    if (type === 'DECK_PACK') {
      const slideIds = (Array.isArray(value?.slides) ? value.slides : [])
        .map((s) => s?.layout_id)
        .filter(Boolean)
      if (!slideIds.length) {
        setError('Add at least one slide layout (Choose layouts) before creating this pack.')
        return
      }
    }
    setLoading(true)
    try {
      const created = await superadminService.createTemplate({
        type, name: name.trim(),
        contentType: (type === 'DECK_PACK' || type === 'VIDEO_PACK') ? (type === 'DECK_PACK' ? 'pack' : 'video_pack') : (contentType.trim() || undefined),
        variant: variant.trim() || undefined,
        isActive, schema: value,
      })
      const template = created.template ?? created
      // Packs need an id before media upload — continue in-modal instead of closing.
      if (type === 'DECK_PACK' || type === 'VIDEO_PACK') {
        setCreatedTemplate(template)
        setStep('media')
        onCreated?.(created, { keepOpen: true })
      } else {
        onCreated?.(created)
      }
    } catch (err) {
      setError(err instanceof SuperadminApiError ? err.message : 'Failed to create template')
    } finally {
      setLoading(false)
    }
  }

  async function handleFinishMedia() {
    if (!createdTemplate?.id) {
      onClose?.()
      return
    }
    setFinishing(true)
    try {
      const data = await superadminService.getTemplate(createdTemplate.id)
      onCreated?.({ template: data.template ?? data }, { keepOpen: false })
    } catch {
      onCreated?.({ template: createdTemplate }, { keepOpen: false })
    } finally {
      setFinishing(false)
    }
  }

  const previewParsed = parseJsonSafe(schemaStr)
  const previewSchema = previewParsed.ok ? previewParsed.value : null
  const enrichedPreviewSchema = previewSchema ? enrichLayoutSchemaForPreview(previewSchema) : null
  const previewSlots = Array.isArray(enrichedPreviewSchema?.slots) ? enrichedPreviewSchema.slots : []
  const previewDims = getGridDims(previewSlots)
  const createdSlideCount = Array.isArray(createdTemplate?.schema?.slides)
    ? createdTemplate.schema.slides.length
    : (Array.isArray(previewSchema?.slides) ? previewSchema.slides.length : 0)
  const supportsCreateMedia = type === 'DECK_PACK' || type === 'VIDEO_PACK'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        width: step === 'media' ? 'min(1120px, 96vw)' : 'min(680px, 95vw)', maxHeight: '90vh',
        background: 'var(--bg-card)', borderRadius: 14,
        border: '1px solid var(--border-color)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid var(--border-color)', flexShrink: 0,
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
              {step === 'media'
                ? 'Upload pack media'
                : (prefill ? 'Duplicate template' : 'Create template')}
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {step === 'media'
                ? `"${createdTemplate?.name || name}" is created — add slide photos / picker thumbnail, then finish`
                : (prefill ? `Duplicating "${prefill.name}" — edit before saving` : 'Add a new layout, pack, or video scene to the platform catalog')}
            </p>
          </div>
          <button type="button" onClick={step === 'media' ? handleFinishMedia : onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {step === 'media' && createdTemplate?.id ? (
          <>
            <div className="sa-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
              <div style={{ padding: '12px 16px 0' }}>
                <div style={{
                  display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
                  padding: '10px 12px', borderRadius: 8, marginBottom: 4,
                  border: '1px solid color-mix(in srgb, #22c55e 30%, var(--border-color))',
                  background: 'color-mix(in srgb, #22c55e 8%, transparent)',
                  fontSize: '0.78rem', color: 'var(--text-main)',
                }}>
                  <CheckCircle2 size={14} style={{ color: '#4ade80', flexShrink: 0 }} />
                  Template saved. Map photos with <code style={{ fontSize: '0.72rem' }}>slide:N</code>
                  {createdSlideCount ? ` (this pack has ${createdSlideCount} slides)` : ''}.
                  Use kind <code style={{ fontSize: '0.72rem' }}>preview</code> for the picker thumb.
                </div>
              </div>
              <TemplateMediaTab
                templateId={createdTemplate.id}
                templateType={createdTemplate.type || type}
                slideCount={createdSlideCount}
                template={createdTemplate}
                layoutSchemaMap={layoutSchemaMap}
              />
            </div>
            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap',
              padding: '14px 20px', borderTop: '1px solid var(--border-color)', flexShrink: 0,
            }}>
              <button type="button" className="sa-btn sa-btn--primary" onClick={handleFinishMedia} disabled={finishing}>
                {finishing ? <><span className="sa-spinner" style={{ width: 14, height: 14 }} /> Finishing…</> : 'Done'}
              </button>
            </div>
          </>
        ) : (
        <>
        {/* scrollable body */}
        <form onSubmit={handleSubmit} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px' }}>
          {error && <div className="sa-alert sa-alert--error" style={{ marginBottom: 16 }}>{error}</div>}
          {supportsCreateMedia && (
            <div style={{
              marginBottom: 16, padding: '10px 12px', borderRadius: 8, fontSize: '0.75rem', lineHeight: 1.5,
              border: '1px solid color-mix(in srgb, var(--primary) 25%, var(--border-color))',
              background: 'color-mix(in srgb, var(--primary) 6%, transparent)', color: 'var(--text-muted)',
            }}>
              After you create this pack you’ll stay here to upload media (slide photos + preview thumb) — no need to reopen the template.
            </div>
          )}

          {/* type tabs */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>TYPE</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TEMPLATE_TYPES.map(t => (
                <button key={t.id} type="button"
                  onClick={() => setType(t.id)}
                  style={{
                    padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                    border: `1px solid ${type === t.id ? 'var(--primary)' : 'var(--border-color)'}`,
                    background: type === t.id
                      ? 'color-mix(in srgb, var(--primary) 15%, transparent)'
                      : 'var(--bg-card)',
                    color: type === t.id ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: type === t.id ? 700 : 500, fontSize: '0.8125rem',
                    transition: 'all 0.15s',
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
            <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {TEMPLATE_TYPES.find(t => t.id === type)?.description}
            </p>
          </div>

          {/* name */}
          <div className="sa-field" style={{ marginBottom: 14 }}>
            <label>NAME *</label>
            <input className="sa-input" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Title Centered v2" required disabled={loading}
              style={{ width: '100%', boxSizing: 'border-box' }} />
          </div>

          {/* contentType + variant — only for DECK_LAYOUT */}
          {type === 'DECK_LAYOUT' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div className="sa-field">
                <label>CONTENT TYPE</label>
                <ContentTypeSelect
                  value={contentType}
                  onChange={e => {
                    const next = e.target.value
                    setContentType(next)
                    if (!next) return
                    try {
                      const p = JSON.parse(schemaStr)
                      p.content_type = next
                      setSchemaStr(JSON.stringify(p, null, 2))
                    } catch { /* ignore invalid JSON while typing */ }
                  }}
                  disabled={loading}
                />
              </div>
              <div className="sa-field">
                <label>VARIANT</label>
                <input className="sa-input" value={variant} onChange={e => setVariant(e.target.value)}
                  placeholder="e.g. v1, v2" disabled={loading}
                  style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
            </div>
          )}
          {/* variant (pack_id alias) for DECK_PACK / VIDEO_PACK */}
          {(type === 'DECK_PACK' || type === 'VIDEO_PACK') && (
            <div className="sa-field" style={{ marginBottom: 14 }}>
              <label>{type === 'VIDEO_PACK' ? 'PACK ID / VARIANT' : 'PACK ID / VARIANT'}</label>
              <input className="sa-input" value={variant} onChange={e => setVariant(e.target.value)}
                placeholder={type === 'VIDEO_PACK' ? 'e.g. onboarding_video_v1' : 'e.g. corp_pitch_midnight'} disabled={loading}
                style={{ width: '100%', boxSizing: 'border-box' }} />
              <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Should match <code>schema.pack_id</code>.
              </p>
            </div>
          )}

          {/* active toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <button type="button" onClick={() => setIsActive(v => !v)}
              style={{
                width: 38, height: 22, borderRadius: 999, border: 'none', cursor: 'pointer',
                background: isActive ? 'var(--primary)' : 'var(--border-color)',
                position: 'relative', transition: 'background 0.2s', flexShrink: 0,
              }}>
              <span style={{
                position: 'absolute', top: 3, left: isActive ? 18 : 3,
                width: 16, height: 16, borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s',
              }} />
            </button>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-main)', fontWeight: 600 }}>
              Active {!isActive && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(inactive — won't appear in workspace pickers)</span>}
            </span>
          </div>

          {/* DECK_PACK quick helpers */}
          {(type === 'DECK_PACK' || type === 'VIDEO_PACK') && (
            <div style={{ padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'color-mix(in srgb, var(--bg-card) 60%, transparent)', marginBottom: 4 }}>
              <p style={{ margin: '0 0 10px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quick helpers — set inside schema JSON</p>
              {type === 'DECK_PACK' && (
                <>
                  <DeckPackQuickSelects schemaStr={schemaStr} setSchemaStr={setSchemaStr} onError={setError} />
                  <DeckPackLayoutPicker
                    schemaStr={schemaStr}
                    setSchemaStr={setSchemaStr}
                    layoutCatalog={layoutCatalog}
                    layoutSchemaMap={layoutSchemaMap}
                    onError={setError}
                    disabled={loading}
                  />
                </>
              )}
              {type === 'VIDEO_PACK' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>VIDEO SETTINGS FPS</label>
                  <select className="sa-select" style={{ width: '50%', boxSizing: 'border-box', fontSize: '0.8rem' }} defaultValue=""
                    onChange={e => { if (!e.target.value) return; try { const p = JSON.parse(schemaStr); p.videoSettings = { ...(p.videoSettings ?? { width: 1920, height: 1080 }), fps: Number(e.target.value) }; setSchemaStr(JSON.stringify(p, null, 2)) } catch {} }}>
                    <option value="">— inject fps —</option>
                    {[24, 25, 30, 60].map(v => <option key={v} value={v}>{v} fps</option>)}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* schema */}
          {type === 'DECK_LAYOUT' && (
            <DeckLayoutSchemaTools
              schemaStr={schemaStr}
              setSchemaStr={setSchemaStr}
              setName={setName}
              setContentType={setContentType}
              onError={setError}
              disabled={loading}
            />
          )}
          <JsonEditor label="SCHEMA (JSON) *" value={schemaStr} onChange={setSchemaStr}
            placeholder={schemaPlaceholder(type)} disabled={loading} />

          {/* live mini preview for layouts while editing */}
          {type === 'DECK_LAYOUT' && previewParsed.ok && previewSlots.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>LIVE PREVIEW</label>
                <button type="button" className="sa-btn" onClick={handlePreview}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', padding: '4px 10px' }}>
                  <Eye size={13} /> Open full preview
                </button>
              </div>
              <div style={{
                borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border-color)',
                maxWidth: 420,
              }}>
                <LayoutPolishedPreview slots={previewSlots} schema={enrichedPreviewSchema} />
              </div>
            </div>
          )}

          {/* footer actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
            <button type="button" className="sa-btn" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="button" className="sa-btn" onClick={handlePreview} disabled={loading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Eye size={14} /> Preview
            </button>
            <button type="submit" className="sa-btn sa-btn--primary" disabled={loading}>
              {loading
                ? <><span className="sa-spinner" style={{ width: 14, height: 14 }} /> {prefill ? 'Duplicating…' : 'Creating…'}</>
                : (prefill
                  ? 'Save duplicate'
                  : (supportsCreateMedia ? 'Create & upload media' : 'Create template'))}
            </button>
          </div>
        </form>
        </>
        )}
      </div>

      {step === 'details' && showPreview && type === 'DECK_LAYOUT' && enrichedPreviewSchema && (
        <DeckLayoutModal
          schema={{ ...enrichedPreviewSchema, content_type: enrichedPreviewSchema.content_type || contentType || undefined }}
          layoutName={name.trim() || enrichedPreviewSchema.layout_id || 'Untitled layout'}
          slots={previewSlots}
          hasSlots={previewSlots.length > 0}
          COLS={previewDims.COLS}
          ROWS={previewDims.ROWS}
          onClose={() => setShowPreview(false)}
        />
      )}
      {step === 'details' && showPreview && type === 'DECK_PACK' && previewSchema && (
        <DeckPackSlideModal
          slides={previewSchema.slides ?? []}
          theme={resolveDeckPackTheme(previewSchema.themeId)}
          themeId={previewSchema.themeId}
          aspectRatio={previewSchema.aspectRatio ?? '16:9'}
          packName={name.trim() || previewSchema.meta?.name || previewSchema.pack_id || 'Untitled pack'}
          previewImageUrl={null}
          media={[]}
          layoutSchemaMap={layoutSchemaMap}
          initialSlide={0}
          onClose={() => setShowPreview(false)}
        />
      )}
      {step === 'details' && showPreview && type === 'VIDEO_SCENE' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1200, background: 'rgba(0,0,0,0.88)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }} onClick={e => { if (e.target === e.currentTarget) setShowPreview(false) }}>
          <div style={{
            width: 'min(560px, 95vw)', background: 'var(--bg-card)', borderRadius: 14,
            border: '1px solid var(--border-color)', padding: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Video scene preview</h3>
              <button type="button" onClick={() => setShowPreview(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Schema is valid. Full video-scene rendering is available after save from the template detail view.
            </p>
            <pre style={{
              marginTop: 12, maxHeight: 280, overflow: 'auto', padding: 12, borderRadius: 8,
              background: 'color-mix(in srgb, var(--bg-card) 40%, #0a0f1e)', fontSize: '0.72rem',
              color: 'var(--text-main)',
            }}>{JSON.stringify(previewSchema, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Deck Layout canvas (wireframe / slot authoring) ─────────────────────────

function DeckLayoutCanvas({ COLS, ROWS, slots, hasSlots, large, light }) {
  const bg = light ? 'var(--bg-card)' : (large ? '#0c1424' : 'color-mix(in srgb, var(--bg-card) 30%, #0a0f1e)')
  const gridStroke = light ? 'var(--border-color)' : 'white'
  const gridOpacity = light ? 0.6 : (large ? 0.08 : 0.12)
  const labelColor = light ? 'var(--text-muted)' : (large ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.2)')
  const emptyColor = light ? 'var(--text-muted)' : 'rgba(255,255,255,0.25)'

  return (
    <div style={{
      position: 'relative', width: '100%', aspectRatio: '16/9',
      background: bg, overflow: 'hidden',
      border: light ? '1px solid var(--border-color)' : 'none',
      borderRadius: light ? 8 : 0,
    }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: gridOpacity }}>
        {Array.from({ length: COLS - 1 }, (_, i) => (
          <line key={`c${i}`} x1={`${((i + 1) / COLS) * 100}%`} y1="0" x2={`${((i + 1) / COLS) * 100}%`} y2="100%" stroke={gridStroke} strokeWidth="1" />
        ))}
        {Array.from({ length: ROWS - 1 }, (_, i) => (
          <line key={`r${i}`} x1="0" y1={`${((i + 1) / ROWS) * 100}%`} x2="100%" y2={`${((i + 1) / ROWS) * 100}%`} stroke={gridStroke} strokeWidth="1" />
        ))}
      </svg>
      {large && (
        <>
          {Array.from({ length: COLS }, (_, i) => (
            <span key={`cl${i}`} style={{ position: 'absolute', top: 4, left: `${((i + 0.5) / COLS) * 100}%`, transform: 'translateX(-50%)', fontSize: '0.55rem', color: labelColor, fontFamily: 'monospace', pointerEvents: 'none' }}>{i + 1}</span>
          ))}
          {Array.from({ length: ROWS }, (_, i) => (
            <span key={`rl${i}`} style={{ position: 'absolute', left: 4, top: `${((i + 0.5) / ROWS) * 100}%`, transform: 'translateY(-50%)', fontSize: '0.55rem', color: labelColor, fontFamily: 'monospace', pointerEvents: 'none' }}>{i + 1}</span>
          ))}
        </>
      )}
      {!hasSlots && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: emptyColor, fontSize: large ? '1rem' : '0.75rem' }}>
          No slots defined
        </div>
      )}
      {slots.map((slot, i) => {
        const reg = parseRegion(slot.region)
        if (!reg) return null
        const color = SLOT_COLORS[i % SLOT_COLORS.length]
        const box = regionToBox(reg, COLS, ROWS, 0)

        if (light) {
          // Clean light style — grey boxes with role label as placeholder text
          return (
            <div key={slot.id ?? i} style={{
              position: 'absolute', left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%`, height: `${box.h}%`,
              background: 'color-mix(in srgb, var(--border-color) 40%, transparent)',
              border: '1.5px solid color-mix(in srgb, var(--border-color) 80%, transparent)',
              borderRadius: large ? 8 : 4,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', gap: 4, padding: '4px 6px',
            }}>
              {slot.role ? (
                <span style={{ fontSize: large ? '0.7rem' : 'clamp(0.35rem, 1vw, 0.55rem)', fontWeight: 500, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90%' }}>
                  {slot.placeholder_text || slot.role}
                </span>
              ) : (
                <span style={{ fontSize: large ? '0.65rem' : 'clamp(0.3rem, 0.9vw, 0.5rem)', fontWeight: 600, color: 'var(--text-muted)', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90%' }}>
                  {slot.id}
                </span>
              )}
            </div>
          )
        }

        return (
          <div key={slot.id ?? i} style={{
            position: 'absolute', left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%`, height: `${box.h}%`,
            background: color.fill, border: `${large ? 2 : 1.5}px solid ${color.stroke}`,
            borderRadius: large ? 6 : 3,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', gap: large ? 6 : 2,
          }}>
            <span style={{
              fontSize: large ? '0.85rem' : 'clamp(0.4rem, 1.2vw, 0.65rem)',
              fontWeight: 700, color: color.text, textTransform: 'uppercase',
              letterSpacing: '0.05em', padding: large ? '3px 10px' : '1px 4px',
              borderRadius: 4, background: 'rgba(0,0,0,0.4)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90%',
            }}>
              {slot.id}
            </span>
            {large && slot.region && (
              <span style={{ fontSize: '0.65rem', color: color.text, opacity: 0.55, fontFamily: 'monospace' }}>
                {slot.region}
              </span>
            )}
            {large && slot.max_lines && (
              <span style={{ fontSize: '0.6rem', color: color.text, opacity: 0.4 }}>
                max {slot.max_lines} lines
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function LayoutModeToggle({ mode, onChange }) {
  const options = [
    { id: 'polished', label: 'Preview' },
    { id: 'wireframe', label: 'Slots' },
  ]
  return (
    <div style={{ display: 'inline-flex', padding: 3, borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', gap: 2 }}>
      {options.map(opt => (
        <button key={opt.id} type="button" onClick={() => onChange(opt.id)}
          style={{
            padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
            fontSize: '0.72rem', fontWeight: 700,
            background: mode === opt.id ? 'rgba(255,255,255,0.16)' : 'transparent',
            color: mode === opt.id ? '#fff' : 'rgba(255,255,255,0.45)',
          }}>
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ─── Deck Layout full-screen modal ───────────────────────────────────────────

function DeckLayoutModal({ schema, layoutName, slots, hasSlots, COLS, ROWS, onClose, initialMode = 'polished', zIndex = 1200 }) {
  const [mode, setMode] = useState(initialMode)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const dims = COLS && ROWS ? { COLS, ROWS } : getGridDims(slots)
  const previewSchema = enrichLayoutSchemaForPreview(schema)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex,
      background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column',
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0, gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', minWidth: 0 }}>
          <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{layoutName || 'Layout preview'}</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>· {slots.length} slots</span>
          {schema?.content_type && (
            <span style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.35)', color: '#818cf8', fontSize: '0.7rem', fontWeight: 700 }}>
              {contentTypeLabel(schema.content_type)}
            </span>
          )}
          <LayoutModeToggle mode={mode} onChange={setMode} />
        </div>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <X size={15} />
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 20px' }}>
        <div style={{ width: '100%', maxWidth: 900, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: '100%',
            aspectRatio: '16/9',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: mode === 'polished'
              ? '0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.12)'
              : '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.25)',
          }}>
            {mode === 'polished'
              ? <LayoutPolishedPreview slots={slots} schema={previewSchema} large fill />
              : <DeckLayoutCanvas COLS={dims.COLS} ROWS={dims.ROWS} slots={slots} hasSlots={hasSlots} large />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ padding: '3px 10px', borderRadius: 99, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {contentTypeLabel(schema?.content_type) || 'layout'}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontFamily: 'monospace' }}>
              {schema?.layout_id ?? ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function DeckLayoutPreview({ schema, layoutName }) {
  const [showModal, setShowModal] = useState(false)
  const previewSchema = enrichLayoutSchemaForPreview(schema)
  const slots = previewSchema?.slots ?? schema?.slots ?? []
  const hasSlots = slots.length > 0
  const { COLS, ROWS } = getGridDims(slots)

  return (
    <>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        {[['Layout ID', schema?.layout_id], ['Grid', schema?.grid], ['Content type', contentTypeLabel(schema?.content_type) || schema?.content_type]]
          .filter(([, v]) => v)
          .map(([label, val]) => (
            <div key={label} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'monospace' }}>{val}</div>
            </div>
          ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <button type="button" onClick={() => setShowModal(true)}
          style={{
            cursor: 'pointer', border: '1px solid var(--border-color)', padding: 0, background: 'none',
            width: '100%', maxWidth: 420, display: 'block',
            borderRadius: 10, overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.18)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)' }}>
          <LayoutPolishedPreview slots={slots} schema={previewSchema} />
        </button>
        <button className="sa-btn sa-btn--primary" style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => setShowModal(true)}>
          <Eye size={14} /> Preview layout
        </button>
      </div>

      {hasSlots && (
        <div>
          <p style={{ margin: '0 0 8px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Slots ({slots.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, border: '1px solid var(--border-color)', borderRadius: 10, overflow: 'hidden' }}>
            {slots.map((slot, i) => {
              const color = SLOT_COLORS[i % SLOT_COLORS.length]
              return (
                <div key={slot.id ?? i} style={{ display: 'grid', gridTemplateColumns: '14px 1fr auto', alignItems: 'center', gap: 10, padding: '9px 14px', borderBottom: i < slots.length - 1 ? '1px solid var(--border-color)' : 'none', background: 'var(--bg-card)' }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, background: color.fill, border: `1.5px solid ${color.stroke}`, flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{slot.id}</span>
                    {slot.max_lines && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 8 }}>max {slot.max_lines} lines</span>}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{slot.region}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {showModal && <DeckLayoutModal schema={previewSchema} layoutName={layoutName} slots={slots} hasSlots={hasSlots} COLS={COLS} ROWS={ROWS} onClose={() => setShowModal(false)} />}
    </>
  )
}

// ─── Slide card renderer (used in both thumbnail strip and modal) ─────────────

function SlideCard({ theme, slide, index, ph, icon, imageUrl, media, large, aspectRatio = '16:9', layoutSchemaMap = {} }) {
  if (slide?.layout_id && canPreviewDeckLayout({ layoutId: slide.layout_id, layoutSchemaMap })) {
    const slideOrder = slide?.order ?? index + 1
    const resolved = media?.length ? resolveSlideMediaFromPack(media, slideOrder) : { imageUrl: imageUrl || '' }
    return (
      <PackSlidePreview
        slide={slide}
        index={index}
        large={large}
        theme={theme}
        aspectRatio={aspectRatio}
        layoutSchemaMap={layoutSchemaMap}
        badgeColor={theme.accent}
        imageUrl={resolved.imageUrl || ''}
        imageUrls={resolved.imageUrls}
        media={media}
      />
    )
  }

  const ct = slide.contentType ?? ''
  const isTitle      = ct === 'title'
  const isBullet     = ct === 'bullet_list' || ct === 'agenda'
  const isStat       = ct === 'stat'
  const isQuote      = ct === 'quote'
  const isImage      = ct === 'image+text'
  const isClosing    = ct === 'closing'
  const isDivider    = ct === 'section_divider'
  const isTeam       = ct === 'team'
  const isTimeline   = ct === 'timeline'
  const isComparison = ct === 'comparison'
  const isChart      = ct === 'chart'

  const pl = (typeof slide.placeholder === 'object' && slide.placeholder) ? slide.placeholder : {}
  const phSubtitle = pl.subtitle  ? String(pl.subtitle)  : ''
  const phCta      = pl.cta       ? String(pl.cta)       : ''
  const phContact  = pl.contact   ? String(pl.contact)   : (pl.note ? String(pl.note) : '')
  const phStats    = Array.isArray(pl.stats)   ? pl.stats.slice(0, 3)   : []
  const phItems    = Array.isArray(pl.items)   ? pl.items.slice(0, 5)   : (Array.isArray(pl.bullets) ? pl.bullets.slice(0, 5) : [])
  const phMembers  = Array.isArray(pl.members) ? pl.members.slice(0, 4) : []
  const phChartData = Array.isArray(pl.series?.[0]?.data) ? pl.series[0].data : []
  const phLabels   = Array.isArray(pl.labels) ? pl.labels : []
  const phQuote    = pl.quote  ? String(pl.quote)  : ''
  const phAuthor   = pl.author ? String(pl.author) : ''

  const dt = slide.designTokens ?? {}
  const imageOnRight = dt.imagePosition === 'right-half'

  const fs = large ? 1 : 0.37
  const lh = large ? '1.4' : '1.2'

  return (
    <div style={{
      width: '100%', aspectRatio: aspectRatioToCss(aspectRatio),
      background: theme.bg, position: 'relative', overflow: 'hidden',
      fontFamily: 'system-ui, sans-serif',
    }}>
      {/* top accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: large ? 6 : 2.5, background: theme.accent }} />
      {/* slide number badge */}
      <div style={{
        position: 'absolute', top: large ? 14 : 5, right: large ? 14 : 5,
        padding: large ? '3px 9px' : '1px 4px',
        borderRadius: 99, background: `${theme.accent}22`,
        border: `1px solid ${theme.accent}55`,
        fontSize: large ? '0.7rem' : '0.28rem', fontWeight: 700, color: theme.accent,
      }}>
        {slide.order ?? index + 1}
      </div>

      {/* ── Title slide ── */}
      {isTitle && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: `${large ? 40 : 16}% ${large ? 12 : 10}%`, gap: large ? 12 : 4 }}>
          {imageUrl && (
            <img src={imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.35 }}
              onError={e => { e.currentTarget.style.display = 'none' }} />
          )}
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: large ? 12 : 4, width: '100%' }}>
            <div style={{ width: '55%', height: large ? 4 : 1.5, background: theme.accent, borderRadius: 99, marginBottom: large ? 8 : 2 }} />
            <div style={{ fontSize: `${fs * 3.8}rem`, fontWeight: 800, color: theme.text, textAlign: 'center', lineHeight: lh, maxWidth: '80%' }}>{ph || 'Presentation Title'}</div>
            <div style={{ fontSize: `${fs * 1.8}rem`, color: theme.text, opacity: 0.5, textAlign: 'center', marginTop: large ? 4 : 1 }}>{phSubtitle || 'Subtitle'}</div>
            <div style={{ width: '30%', height: large ? 3 : 1, background: theme.accent, opacity: 0.4, borderRadius: 99, marginTop: large ? 12 : 3 }} />
          </div>
        </div>
      )}

      {/* ── Bullet / Agenda ── */}
      {isBullet && (
        <div style={{ position: 'absolute', inset: 0, padding: `${large ? 8 : 16}% ${large ? 6 : 8}%`, display: 'flex', flexDirection: 'column', gap: large ? 10 : 3 }}>
          <div style={{ fontSize: `${fs * 2.2}rem`, fontWeight: 700, color: theme.text, marginBottom: large ? 8 : 2, borderBottom: `${large ? 2 : 0.8}px solid ${theme.accent}44`, paddingBottom: large ? 6 : 2 }}>{ph || 'Key Points'}</div>
          {phItems.length > 0
            ? phItems.map((item, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: large ? 8 : 3 }}>
                  <div style={{ width: large ? 6 : 2.5, height: large ? 6 : 2.5, borderRadius: '50%', background: theme.accent, opacity: 0.8, flexShrink: 0 }} />
                  <div style={{ fontSize: `${fs * 1.6}rem`, color: theme.text, opacity: 0.85, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item}</div>
                </div>
              ))
            : [0.9, 0.7, 0.6, 0.5].map((op, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: large ? 8 : 3 }}>
                  <div style={{ width: large ? 6 : 2.5, height: large ? 6 : 2.5, borderRadius: '50%', background: theme.accent, opacity: op, flexShrink: 0 }} />
                  <div style={{ height: large ? 10 : 4, borderRadius: 2, background: theme.text, opacity: op * 0.4, width: `${55 + j * 8}%` }} />
                </div>
              ))
          }
        </div>
      )}

      {/* ── Stat ── */}
      {isStat && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: large ? 8 : 3, padding: `${large ? 6 : 10}%` }}>
          {/* title above stats */}
          {large && ph && (
            <div style={{ fontSize: `${fs * 1.9}rem`, fontWeight: 700, color: theme.text, marginBottom: large ? 4 : 0, textAlign: 'center' }}>{ph}</div>
          )}
          {phStats.length > 0 ? (
            large ? (
              <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end' }}>
                {phStats.map((s, j) => (
                  <div key={j} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: `${fs * (j === 0 ? 5.5 : 4)}rem`, fontWeight: 900, color: theme.accent, lineHeight: 1 }}>{s.value ?? '—'}</div>
                    <div style={{ fontSize: `${fs * 1.4}rem`, color: theme.text, opacity: 0.55 }}>{s.label ?? ''}</div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div style={{ fontSize: `${fs * 6}rem`, fontWeight: 900, color: theme.accent, lineHeight: 1 }}>{phStats[0]?.value ?? '—'}</div>
                <div style={{ fontSize: `${fs * 1.8}rem`, color: theme.text, opacity: 0.6 }}>{phStats[0]?.label || ph || 'Metric'}</div>
              </>
            )
          ) : (
            <>
              <div style={{ fontSize: `${fs * 6}rem`, fontWeight: 900, color: theme.accent, lineHeight: 1 }}>—</div>
              <div style={{ fontSize: `${fs * 1.8}rem`, color: theme.text, opacity: 0.6 }}>{ph || 'Key metric'}</div>
            </>
          )}
          <div style={{ display: 'flex', gap: large ? 12 : 4, marginTop: large ? 6 : 2 }}>
            {[1, 2, 3].map(j => (
              <div key={j} style={{ width: large ? 64 : 22, height: large ? 10 : 3.5, borderRadius: 2, background: theme.accent, opacity: 0.3 + j * 0.2 }} />
            ))}
          </div>
        </div>
      )}

      {/* ── Quote ── */}
      {isQuote && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: `${large ? 10 : 15}%`, gap: large ? 10 : 3 }}>
          <div style={{ fontSize: `${fs * 7}rem`, color: theme.accent, opacity: 0.25, lineHeight: 0.8, alignSelf: 'flex-start' }}>"</div>
          <div style={{ fontSize: `${fs * 2.2}rem`, fontStyle: 'italic', color: theme.text, opacity: 0.85, textAlign: 'center', lineHeight: lh }}>{phQuote || ph || 'An inspiring quote goes here.'}</div>
          <div style={{ width: large ? 40 : 14, height: large ? 3 : 1, background: theme.accent, borderRadius: 99 }} />
          <div style={{ fontSize: `${fs * 1.5}rem`, color: theme.text, opacity: 0.5 }}>{phAuthor ? `— ${phAuthor}` : '— Author Name'}</div>
        </div>
      )}

      {/* ── Image + text ── */}
      {isImage && (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div style={{
            order: imageOnRight ? 2 : 1,
            background: imageUrl ? 'transparent' : `${theme.accent}18`,
            borderLeft: imageOnRight ? `${large ? 2 : 0.8}px solid ${theme.accent}33` : 'none',
            borderRight: imageOnRight ? 'none' : `${large ? 2 : 0.8}px solid ${theme.accent}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', position: 'relative',
          }}>
            {imageUrl
              ? <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }} />
              : null}
            <div style={{ position: imageUrl ? 'absolute' : 'relative', inset: imageUrl ? 0 : undefined, display: imageUrl ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: `${theme.accent}18` }}>
              <div style={{ fontSize: `${fs * 5}rem`, opacity: 0.3 }}>🖼</div>
            </div>
          </div>
          <div style={{ order: imageOnRight ? 1 : 2, padding: `${large ? 8 : 12}%`, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: large ? 8 : 3 }}>
            <div style={{ fontSize: `${fs * 2.2}rem`, fontWeight: 700, color: theme.text }}>{ph || 'Caption'}</div>
            {large && phSubtitle
              ? <div style={{ fontSize: `${fs * 1.5}rem`, color: theme.text, opacity: 0.65, lineHeight: lh }}>{phSubtitle}</div>
              : [0.55, 0.4, 0.35].map((op, j) => <div key={j} style={{ height: large ? 8 : 3, borderRadius: 2, background: theme.text, opacity: op, width: `${80 - j * 15}%` }} />)
            }
          </div>
        </div>
      )}

      {/* ── Closing ── */}
      {isClosing && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: large ? 10 : 3 }}>
          {/* title is the main heading; cta is the call-to-action label */}
          <div style={{ fontSize: `${fs * 3}rem`, fontWeight: 800, color: theme.text }}>{ph || 'Thank You'}</div>
          {large && phSubtitle && <div style={{ fontSize: `${fs * 1.6}rem`, color: theme.text, opacity: 0.55, textAlign: 'center' }}>{phSubtitle}</div>}
          <div style={{ width: '40%', height: large ? 3 : 1, background: theme.accent, borderRadius: 99 }} />
          {phCta && <div style={{ fontSize: `${fs * 1.8}rem`, fontWeight: 700, color: theme.accent, textAlign: 'center' }}>{phCta}</div>}
          <div style={{ fontSize: `${fs * 1.4}rem`, color: theme.text, opacity: 0.5 }}>{phContact || 'contact@company.com'}</div>
        </div>
      )}

      {/* ── Section divider ── */}
      {isDivider && (
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${theme.accent}22, ${theme.surface ?? theme.bg})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: large ? 8 : 3 }}>
          <div style={{ width: '60%', height: large ? 3 : 1.2, background: theme.accent, borderRadius: 99 }} />
          <div style={{ fontSize: `${fs * 2.8}rem`, fontWeight: 700, color: theme.text, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{ph || 'Section'}</div>
          {large && phSubtitle && <div style={{ fontSize: `${fs * 1.5}rem`, color: theme.text, opacity: 0.5, textAlign: 'center' }}>{phSubtitle}</div>}
          <div style={{ width: '30%', height: large ? 2 : 0.8, background: theme.accent, opacity: 0.4, borderRadius: 99 }} />
        </div>
      )}

      {/* ── Team ── */}
      {isTeam && (
        <div style={{ position: 'absolute', inset: 0, padding: `${large ? 6 : 10}%`, display: 'flex', flexDirection: 'column', gap: large ? 10 : 3 }}>
          <div style={{ fontSize: `${fs * 2}rem`, fontWeight: 700, color: theme.text, borderBottom: `${large ? 2 : 0.8}px solid ${theme.accent}44`, paddingBottom: large ? 6 : 2 }}>{ph || 'Our Team'}</div>
          <div style={{ display: 'flex', gap: large ? 14 : 5, flex: 1, alignItems: 'center' }}>
            {(phMembers.length > 0 ? phMembers : [{}, {}, {}, {}]).map((m, j) => (
              <div key={j} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: large ? 6 : 2 }}>
                <div style={{ width: large ? 52 : 18, height: large ? 52 : 18, borderRadius: '50%', background: `${theme.accent}33`, border: `${large ? 2 : 0.8}px solid ${theme.accent}66`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {large && m.name && <span style={{ fontSize: '0.6rem', fontWeight: 700, color: theme.accent }}>{m.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</span>}
                </div>
                {large && m.name
                  ? <div style={{ fontSize: `${fs * 1.3}rem`, fontWeight: 600, color: theme.text, textAlign: 'center' }}>{m.name}</div>
                  : <div style={{ width: '80%', height: large ? 8 : 3, borderRadius: 2, background: theme.text, opacity: 0.4 }} />}
                {large && m.role
                  ? <div style={{ fontSize: `${fs * 1.1}rem`, color: theme.text, opacity: 0.5, textAlign: 'center' }}>{m.role}</div>
                  : <div style={{ width: '60%', height: large ? 6 : 2, borderRadius: 2, background: theme.text, opacity: 0.25 }} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Comparison ── */}
      {isComparison && (
        <div style={{ position: 'absolute', inset: 0, padding: `${large ? 6 : 10}%`, display: 'flex', flexDirection: 'column', gap: large ? 8 : 3 }}>
          <div>
            <div style={{ fontSize: `${fs * 2}rem`, fontWeight: 700, color: theme.text, marginBottom: large ? 2 : 1 }}>{ph || 'Comparison'}</div>
            {large && phSubtitle && <div style={{ fontSize: `${fs * 1.4}rem`, color: theme.text, opacity: 0.5, marginBottom: large ? 4 : 0 }}>{phSubtitle}</div>}
          </div>
          <div style={{ display: 'flex', gap: large ? 12 : 4, flex: 1 }}>
            {(() => {
              // Try to get structured comparison data from various placeholder shapes
              const hasSides   = Array.isArray(pl.sides)   && pl.sides.length >= 2
              const hasBefore  = pl.before  != null
              const hasAfter   = pl.after   != null
              const hasOptions = Array.isArray(pl.options) && pl.options.length >= 2

              const sides = hasSides ? pl.sides.slice(0, 2)
                : hasOptions ? pl.options.slice(0, 2)
                : hasBefore || hasAfter
                  ? [
                      { label: pl.before_label || 'Before', items: Array.isArray(pl.before)  ? pl.before  : typeof pl.before  === 'string' ? [pl.before]  : [] },
                      { label: pl.after_label  || 'After',  items: Array.isArray(pl.after)   ? pl.after   : typeof pl.after   === 'string' ? [pl.after]   : [] },
                    ]
                  // No structured data — use left/right labels from title or generic
                  : [
                      { label: 'Before', items: [] },
                      { label: 'After',  items: [] },
                    ]

              return sides.map((side, j) => {
                const label = side.label || side.title || side.name || (j === 0 ? 'Before' : 'After')
                const items = Array.isArray(side.items) ? side.items : (Array.isArray(side.bullets) ? side.bullets : [])
                return (
                  <div key={j} style={{ flex: 1, padding: large ? 12 : 4, borderRadius: large ? 8 : 3, background: j === 0 ? `${theme.accent}15` : `${theme.surface ?? theme.bg}`, border: `${large ? 1.5 : 0.6}px solid ${theme.accent}${j === 0 ? '55' : '22'}`, display: 'flex', flexDirection: 'column', gap: large ? 6 : 2 }}>
                    <div style={{ fontSize: `${fs * 1.8}rem`, fontWeight: 700, color: j === 0 ? theme.accent : theme.text, opacity: j === 0 ? 1 : 0.6 }}>{label}</div>
                    {large && items.length > 0
                      ? items.slice(0, 3).map((item, k) => (
                          <div key={k} style={{ fontSize: `${fs * 1.3}rem`, color: theme.text, opacity: 0.75, lineHeight: 1.4 }}>{typeof item === 'string' ? item : item.label ?? item.text ?? String(item)}</div>
                        ))
                      : large
                        ? <div style={{ fontSize: `${fs * 1.2}rem`, color: theme.text, opacity: 0.3, fontStyle: 'italic', marginTop: 4 }}>—</div>
                        : [0.5, 0.4].map((op, k) => <div key={k} style={{ height: 2.5, borderRadius: 2, background: theme.text, opacity: op, width: `${85 - k * 15}%` }} />)
                    }
                  </div>
                )
              })
            })()}
          </div>
        </div>
      )}

      {/* ── Timeline ── */}
      {isTimeline && (
        <div style={{ position: 'absolute', inset: 0, padding: `${large ? 6 : 10}%`, display: 'flex', flexDirection: 'column', gap: large ? 8 : 3 }}>
          <div>
            <div style={{ fontSize: `${fs * 2}rem`, fontWeight: 700, color: theme.text }}>{ph || 'Timeline'}</div>
            {large && phSubtitle && <div style={{ fontSize: `${fs * 1.4}rem`, color: theme.text, opacity: 0.5, marginTop: 2 }}>{phSubtitle}</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, flex: 1, position: 'relative', paddingTop: large ? 12 : 4 }}>
            <div style={{ position: 'absolute', left: 0, right: 0, height: large ? 3 : 1, top: '50%', background: theme.accent, opacity: 0.4 }} />
            {(phLabels.length > 0 ? phLabels : [1, 2, 3, 4]).map((label, j) => (
              <div key={j} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: large ? 8 : 3, position: 'relative' }}>
                <div style={{ width: large ? 16 : 6, height: large ? 16 : 6, borderRadius: '50%', background: theme.accent, border: `${large ? 3 : 1.2}px solid ${theme.bg}`, zIndex: 1 }} />
                {large
                  ? <div style={{ fontSize: `${fs * 1.3}rem`, color: theme.text, opacity: 0.6, textAlign: 'center' }}>{label}</div>
                  : <div style={{ width: '70%', height: 2.5, borderRadius: 2, background: theme.text, opacity: 0.35 }} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Chart ── */}
      {isChart && (
        <div style={{ position: 'absolute', inset: 0, padding: `${large ? 6 : 10}%`, display: 'flex', flexDirection: 'column', gap: large ? 8 : 3 }}>
          <div style={{ fontSize: `${fs * 2}rem`, fontWeight: 700, color: theme.text }}>{ph || 'Data Chart'}</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: large ? 8 : 3, padding: `0 ${large ? 8 : 4}%` }}>
            {(() => {
              const data = phChartData.length > 0 ? phChartData : [65, 85, 50, 90, 70, 80]
              const max = Math.max(...data, 1)
              return data.map((val, j) => (
                <div key={j} style={{ flex: 1, height: `${Math.round((val / max) * 100)}%`, borderRadius: `${large ? 4 : 2}px ${large ? 4 : 2}px 0 0`, background: `linear-gradient(to top, ${theme.accent}, ${theme.accent}88)`, opacity: 0.7 + (j % 2) * 0.3 }} />
              ))
            })()}
          </div>
          <div style={{ height: large ? 2 : 0.8, background: theme.text, opacity: 0.2 }} />
          {large && phLabels.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-around', padding: `0 ${large ? 8 : 4}%` }}>
              {phLabels.map((l, j) => <span key={j} style={{ fontSize: '0.65rem', color: theme.text, opacity: 0.5, textAlign: 'center' }}>{l}</span>)}
            </div>
          )}
        </div>
      )}

      {/* ── Fallback for unlisted types ── */}
      {!isTitle && !isBullet && !isStat && !isQuote && !isImage && !isClosing && !isDivider && !isTeam && !isTimeline && !isComparison && !isChart && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: large ? 8 : 3 }}>
          <div style={{ fontSize: `${fs * 4}rem`, opacity: 0.2 }}>{icon}</div>
          <div style={{ fontSize: `${fs * 2}rem`, color: theme.text, opacity: 0.4 }}>{ct}</div>
        </div>
      )}
    </div>
  )
}


// ─── Full-screen deck pack modal ──────────────────────────────────────────────

// ─── Full-screen deck pack modal — PPT style ──────────────────────────────────

function DeckPackSlideModal({ slides, theme, themeId, aspectRatio = '16:9', packName, previewImageUrl, media, layoutSchemaMap = {}, initialSlide, zIndex = 1200, onClose }) {
  const [current, setCurrent] = useState(initialSlide ?? 0)
  const mainRef   = useRef(null)
  const stripRefs = useRef([])
  const slideRefs = useRef([])

  // Esc to close
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // When active slide changes: scroll the thumbnail into view in the strip
  useEffect(() => {
    stripRefs.current[current]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [current])

  // Click thumbnail → scroll main area to that slide
  function goTo(i) {
    setCurrent(i)
    slideRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // IntersectionObserver — update active thumbnail as user scrolls main area
  useEffect(() => {
    if (!mainRef.current) return
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const idx = Number(e.target.dataset.idx)
            if (!isNaN(idx)) setCurrent(idx)
          }
        })
      },
      { root: mainRef.current, threshold: 0.5 }
    )
    slideRefs.current.forEach(el => el && obs.observe(el))
    return () => obs.disconnect()
  }, [slides.length])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex,
      background: '#111', display: 'flex', flexDirection: 'column',
    }}>
      {/* ── top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0, background: '#181818',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {previewImageUrl
            ? (
              <div style={{ width: 36, height: 20, borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }}>
                <img src={previewImageUrl} alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={e => { e.currentTarget.parentElement.style.display = 'none'; e.currentTarget.parentElement.nextSibling.style.display = 'flex' }} />
              </div>
            ) : null}
          <div style={{ display: previewImageUrl ? 'none' : 'flex', gap: 4 }}>
            {[theme.bg, theme.surface, theme.accent].map((c, i) => (
              <div key={i} style={{ width: 13, height: 13, borderRadius: 3, background: c, border: '1px solid rgba(255,255,255,0.15)' }} />
            ))}
          </div>
          <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.875rem' }}>{packName}</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>· {slides.length} slides</span>
          {themeId && (
            <span style={{
              color: theme.accent, fontSize: '0.68rem', fontWeight: 700,
              padding: '2px 7px', borderRadius: 99,
              background: `${theme.accent}22`, border: `1px solid ${theme.accent}44`,
              textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>
              {String(themeId).replace(/_/g, ' ')}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>
            {current + 1} / {slides.length}
          </span>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', width: 28, height: 28, borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* ── body: left strip + right main ── */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>

        {/* LEFT: slide filmstrip — vertical scroll */}
        <div style={{
          width: 160, flexShrink: 0, overflowY: 'auto', overflowX: 'hidden',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          background: '#161616', padding: '10px 8px',
          display: 'flex', flexDirection: 'column', gap: 8,
          scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) transparent',
        }}>
          {slides.map((s, i) => {
            const sct = s.contentType ?? 'slide'
            const sph = extractPlaceholderTitle(s.placeholder)
            const sicon = CONTENT_TYPE_ICONS[sct] ?? '▣'
            const isActive = i === current
            const slideOrder = s.order ?? (i + 1)
            const imageUrl = Array.isArray(media)
              ? (media.find(m => m.slotHint === `slide:${slideOrder}`)?.url
                ?? media.find(m => m.kind === 'photo' && m.slotHint === 'image')?.url
                ?? null)
              : null
            return (
              <div key={i} ref={el => { stripRefs.current[i] = el }}>
                <button type="button" onClick={() => goTo(i)} style={{
                  width: '100%', padding: 0, border: `2px solid ${isActive ? theme.accent : 'transparent'}`,
                  borderRadius: 7, overflow: 'hidden', cursor: 'pointer', background: 'none',
                  outline: 'none', transition: 'border-color 0.15s',
                  boxShadow: isActive ? `0 0 0 1px ${theme.accent}44` : 'none',
                }}>
                  <SlideCard theme={theme} slide={s} index={i} ph={sph} icon={sicon} imageUrl={imageUrl} media={media} large={false} aspectRatio={aspectRatio} layoutSchemaMap={layoutSchemaMap} />
                </button>
                <div style={{
                  marginTop: 4, fontSize: '0.6rem', fontWeight: 600, textAlign: 'center',
                  color: isActive ? theme.accent : 'rgba(255,255,255,0.3)',
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                  transition: 'color 0.15s',
                }}>
                  {i + 1} · {sct}
                </div>
              </div>
            )
          })}
        </div>

        {/* RIGHT: all slides scrollable — PPT-style */}
        <div ref={mainRef} style={{
          flex: 1, minWidth: 0, overflowY: 'auto', overflowX: 'hidden',
          padding: '32px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32,
          background: '#111',
          scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) transparent',
        }}>
          {slides.map((s, i) => {
            const sct = s.contentType ?? 'slide'
            const sph = extractPlaceholderTitle(s.placeholder)
            const sicon = CONTENT_TYPE_ICONS[sct] ?? '▣'
            const slideOrder = s.order ?? (i + 1)
            const imageUrl = Array.isArray(media)
              ? (media.find(m => m.slotHint === `slide:${slideOrder}`)?.url
                ?? media.find(m => m.kind === 'photo' && m.slotHint === 'image')?.url
                ?? null)
              : null
            return (
              <div key={i} ref={el => { slideRefs.current[i] = el }} data-idx={i}
                style={{ width: '100%', maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* slide number */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace', minWidth: 20 }}>{i + 1}</span>
                  <div style={{ height: 1, flex: 1, background: 'rgba(255,255,255,0.06)' }} />
                  <span style={{ padding: '2px 8px', borderRadius: 99, background: `${theme.accent}18`, border: `1px solid ${theme.accent}33`, color: theme.accent, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{sct}</span>
                  {s.layout_id && <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>{s.layout_id}</span>}
                </div>
                {/* the slide itself */}
                <div style={{
                  width: '100%', borderRadius: 10, overflow: 'hidden',
                  boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${i === current ? theme.accent + '55' : 'rgba(255,255,255,0.06)'}`,
                  transition: 'box-shadow 0.2s',
                }}>
                  <SlideCard theme={theme} slide={s} index={i} ph={sph} icon={sicon} imageUrl={imageUrl} media={media} large={true} aspectRatio={aspectRatio} layoutSchemaMap={layoutSchemaMap} />
                </div>
              </div>
            )
          })}
          {/* bottom breathing room */}
          <div style={{ height: 40 }} />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

const THEME_COLORS = DECK_PACK_THEMES

const CONTENT_TYPE_ICONS = {
  title: '🎯', agenda: '📋', bullet_list: '•', comparison: '⚖️',
  stat: '📊', quote: '💬', 'image+text': '🖼', timeline: '⏱',
  team: '👥', chart: '📈', closing: '✅', section_divider: '—',
}

function DeckPackPreview({ schema, packName, previewImageUrl, media, layoutSchemaMap = {} }) {
  const slides = schema?.slides ?? []
  const theme = resolveDeckPackTheme(schema?.themeId)
  const aspectRatio = schema?.aspectRatio ?? '16:9'
  const cssAspect = aspectRatioToCss(aspectRatio)
  const [showModal, setShowModal] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)

  return (
    <>
      {/* ── preview image thumbnail or color fallback ── */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ margin: '0 0 8px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pack thumbnail</p>
        <div style={{ width: '100%', maxWidth: 320, aspectRatio: cssAspect, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', position: 'relative' }}>
          {previewImageUrl ? (
            <img src={previewImageUrl} alt={packName || 'Pack preview'}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }} />
          ) : null}
          <div style={{ display: previewImageUrl ? 'none' : 'flex', width: '100%', height: '100%', position: previewImageUrl ? 'absolute' : 'relative', inset: 0, alignItems: 'center', justifyContent: 'center', background: schema?.preview?.color ? `linear-gradient(135deg, ${schema.preview.color}cc, ${theme.bg})` : `linear-gradient(135deg, ${theme.bg}, ${theme.surface ?? theme.bg})`, flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 6 }}>{[theme.bg, theme.surface, theme.accent].map((c, i) => (<div key={i} style={{ width: 18, height: 18, borderRadius: 4, background: c, border: '1px solid rgba(255,255,255,0.2)' }} />))}</div>
            <span style={{ fontSize: '0.7rem', color: theme.text, opacity: 0.5, fontFamily: 'monospace' }}>{schema?.themeId ?? 'no theme'} · no image</span>
          </div>
        </div>
      </div>

      {/* ── meta row ── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'stretch', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, background: theme.bg, border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 2px 16px rgba(0,0,0,0.4)' }}>
          <div style={{ display: 'flex', gap: 5 }}>
            {[theme.bg, theme.surface, theme.accent, theme.text].map((c, i) => (
              <div key={i} style={{ width: 20, height: 20, borderRadius: 5, background: c, border: '1px solid rgba(255,255,255,0.18)' }} />
            ))}
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: theme.text, fontFamily: 'monospace' }}>{schema?.themeId ?? 'No theme'}</span>
        </div>
        {[['Pack ID', schema?.pack_id], ['Aspect', schema?.aspectRatio ?? '16:9'], ['Slides', slides.length], ['Use case', schema?.meta?.useCase ?? schema?.meta?.use_case]]
          .filter(([, v]) => v)
          .map(([label, val]) => (
            <div key={label} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'monospace' }}>{val}</div>
            </div>
          ))}
        {schema?.preview?.accentColor && (
          <div style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 6 }}>Accent</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: schema.preview.accentColor, border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-main)' }}>{schema.preview.accentColor}</span>
            </div>
          </div>
        )}
      </div>
      {Array.isArray(schema?.preview?.tags) && schema.preview.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {schema.preview.tags.map(tag => (
            <span key={tag} style={{ padding: '2px 8px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 600, background: `${theme.accent}15`, border: `1px solid ${theme.accent}33`, color: theme.accent }}>{tag}</span>
          ))}
        </div>
      )}
      {schema?.narrative?.summary && (
        <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginRight: 8, fontStyle: 'normal' }}>Arc</span>
          {schema.narrative.arc && <span style={{ marginRight: 8, color: 'var(--text-main)', fontStyle: 'normal', fontSize: '0.75rem', fontWeight: 600 }}>{schema.narrative.arc}</span>}
          {schema.narrative.summary}
        </div>
      )}

      {/* ── thumbnail strip + open modal button ── */}
      {slides.length > 0 ? (
        <>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
            {slides.map((slide, i) => {
              const ct = slide.contentType ?? 'slide'
              const icon = CONTENT_TYPE_ICONS[ct] ?? '▣'
              const ph = extractPlaceholderTitle(slide.placeholder)
              const slideOrder = slide.order ?? (i + 1)
              const slideImageUrl = Array.isArray(media)
                ? (media.find(m => m.slotHint === `slide:${slideOrder}`)?.url
                  ?? media.find(m => m.kind === 'photo' && m.slotHint === 'image')?.url
                  ?? null)
                : null
              return (
                <button key={i} type="button" onClick={() => { setActiveSlide(i); setShowModal(true) }}
                  style={{ flexShrink: 0, width: 140, cursor: 'pointer', border: `2px solid ${theme.accent}55`, borderRadius: 10, overflow: 'hidden', background: 'none', padding: 0, boxShadow: '0 4px 16px rgba(0,0,0,0.35)', transition: 'transform 0.15s, box-shadow 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.5), 0 0 0 2px ${theme.accent}` }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.35)' }}>
                  <SlideCard theme={theme} slide={slide} index={i} ph={ph} icon={icon} imageUrl={slideImageUrl} media={media} large={false} aspectRatio={aspectRatio} layoutSchemaMap={layoutSchemaMap} />
                </button>
              )
            })}
          </div>
          <button className="sa-btn sa-btn--primary" style={{ alignSelf: 'flex-start', marginTop: 4 }}
            onClick={() => { setActiveSlide(0); setShowModal(true) }}>
            ▶ Preview all slides
          </button>
        </>
      ) : (
        <div className="sa-empty"><p>No slides defined in this pack.</p></div>
      )}

      {/* ── full modal ── */}
      {showModal && (
        <DeckPackSlideModal
          slides={slides} theme={theme}
          themeId={schema?.themeId}
          aspectRatio={aspectRatio}
          packName={packName ?? schema?.pack_id ?? 'Pack'}
          previewImageUrl={previewImageUrl}
          media={media}
          layoutSchemaMap={layoutSchemaMap}
          initialSlide={activeSlide}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

function VideoScenePreview({ schema }) {
  const scene = schema?.scene ?? {}
  const vs = schema?.videoSettings ?? {}
  const meta = schema?.meta ?? {}
  const elements = scene.elements ?? []
  const bg = scene.background

  const bgStyle = bg?.type === 'color'
    ? { background: bg.value ?? '#0f172a' }
    : bg?.type === 'gradient'
      ? { background: `linear-gradient(135deg, ${bg.from ?? '#0f172a'}, ${bg.to ?? '#1e3a5f'})` }
      : { background: '#0f172a' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* meta info */}
      {(meta.name || meta.description || meta.useCase) && (
        <div style={{ padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {meta.name && <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{meta.name}</div>}
          {meta.description && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{meta.description}</div>}
          {(meta.useCase || meta.tone) && (
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              {meta.useCase && <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' }}>{meta.useCase}</span>}
              {meta.tone && <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: 'color-mix(in srgb, var(--text-muted) 12%, transparent)', color: 'var(--text-muted)' }}>{meta.tone}</span>}
            </div>
          )}
        </div>
      )}

      {/* canvas preview */}
      <div>
        <p style={{ margin: '0 0 10px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Scene canvas</p>
        <div style={{
          width: '100%', maxWidth: 420, aspectRatio: '16/9',
          ...bgStyle, borderRadius: 10,
          border: '1px solid var(--border-color)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          {elements.length === 0 && (
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>Empty scene</span>
          )}
          {elements.slice(0, 6).map((el, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: el.x != null ? `${(el.x / (vs.width ?? 1920)) * 100}%` : `${10 + i * 8}%`,
              top:  el.y != null ? `${(el.y / (vs.height ?? 1080)) * 100}%` : `${10 + i * 10}%`,
              width: el.width  != null ? `${(el.width  / (vs.width  ?? 1920)) * 100}%` : '20%',
              height: el.height != null ? `${(el.height / (vs.height ?? 1080)) * 100}%` : '12%',
              background: SLOT_COLORS[i % SLOT_COLORS.length].fill,
              border: `1px solid ${SLOT_COLORS[i % SLOT_COLORS.length].stroke}`,
              borderRadius: 3,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '0.55rem', color: SLOT_COLORS[i % SLOT_COLORS.length].text, fontWeight: 700, textTransform: 'uppercase' }}>
                {el.type ?? 'el'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* technical meta */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {[
          ['FPS', vs.fps ?? 30],
          ['Width', vs.width ?? 1920],
          ['Height', vs.height ?? 1080],
          ['Duration', scene.durationInFrames ? `${scene.durationInFrames} frames` : '—'],
          ['Background', bg?.type ?? '—'],
          ['Elements', elements.length],
        ].map(([label, val]) => (
          <div key={label} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{String(val)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function VideoPackPreview({ schema }) {
  const meta = schema?.meta ?? {}
  const scenes = Array.isArray(schema?.scenes) ? schema.scenes : []
  const vs = schema?.videoSettings ?? {}
  const preview = schema?.preview ?? {}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* meta */}
      <div style={{ padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{preview.label || meta.name || 'Video Pack'}</div>
        {(preview.description || meta.description) && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{preview.description || meta.description}</div>}
        {meta.useCase && <span style={{ alignSelf: 'flex-start', fontSize: '0.65rem', fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: 'color-mix(in srgb, #f97316 12%, transparent)', color: '#fb923c' }}>{meta.useCase}</span>}
      </div>

      {/* stats */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {[
          ['Pack ID', schema?.pack_id],
          ['Scenes', scenes.length || '—'],
          ['FPS', vs.fps ?? 30],
          ['Resolution', vs.width ? `${vs.width}×${vs.height}` : '1920×1080'],
        ].filter(([, v]) => v).map(([label, val]) => (
          <div key={label} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, fontFamily: 'monospace' }}>{String(val)}</div>
          </div>
        ))}
      </div>

      {/* scenes list */}
      {scenes.length > 0 && (
        <div>
          <p style={{ margin: '0 0 8px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Scenes ({scenes.length})</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, border: '1px solid var(--border-color)', borderRadius: 10, overflow: 'hidden' }}>
            {scenes.slice(0, 12).map((sc, i) => {
              const scBg = sc.scene?.background
              const bgColor = scBg?.type === 'color' ? scBg.value : scBg?.from ?? '#0f172a'
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: i < scenes.length - 1 ? '1px solid var(--border-color)' : 'none', background: 'var(--bg-card)' }}>
                  <div style={{ width: 32, height: 18, borderRadius: 4, background: bgColor, flexShrink: 0, border: '1px solid var(--border-color)' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {sc.name || `Scene ${i + 1}`}
                    </div>
                    {sc.scene?.durationInFrames && (
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{sc.scene.durationInFrames} frames</div>
                    )}
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', flexShrink: 0 }}>{(sc.scene?.elements ?? []).length} el</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {scenes.length === 0 && (
        <div style={{ padding: '28px 20px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: 10, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          No scenes defined. Use canvas publish to create a VIDEO_PACK from a project.
        </div>
      )}
    </div>
  )
}

// Derive the preview image URL from a template object.
// Backend sets previewImageUrl top-level when kind:'preview' media exists,
// or preview.imageUrl / preview.thumbnailUrl aliases, or media[].
// Text-first packs (consulting, executive) return null → show color swatch.
function getTemplatePreviewUrl(template) {
  if (!template) return null
  if (template.previewImageUrl) return template.previewImageUrl
  if (template.preview?.imageUrl) return template.preview.imageUrl
  if (template.preview?.thumbnailUrl) return template.preview.thumbnailUrl
  if (template.schema?.preview?.imageUrl) return template.schema.preview.imageUrl
  if (template.schema?.preview?.thumbnailUrl) return template.schema.preview.thumbnailUrl
  const media = Array.isArray(template.media) ? template.media : []
  return (
    media.find(m => m.kind === 'preview')?.url ??
    media.find(m => m.kind === 'photo')?.url ??
    null
  )
}

function TemplateVisualPreview({ template, layoutSchemaMap = {} }) {
  const schema = template.schema ?? {}
  const previewImageUrl = getTemplatePreviewUrl(template)
  const media = Array.isArray(template.media) ? template.media : []
  if (template.type === 'DECK_LAYOUT') return <DeckLayoutPreview schema={schema} layoutName={template.name} />
  if (template.type === 'DECK_PACK')   return <DeckPackPreview schema={schema} packName={template.name} previewImageUrl={previewImageUrl} media={media} layoutSchemaMap={layoutSchemaMap} />
  if (template.type === 'VIDEO_PACK')  return <VideoPackPreview schema={schema} />
  return <VideoScenePreview schema={schema} />
}

// ─── Preview modal dispatcher ─────────────────────────────────────────────────

function PreviewModal({ template, layoutSchemaMap = {}, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const schema = template.schema ?? {}

  // DECK_LAYOUT and VIDEO_SCENE use their own full-screen modals internally,
  // so we just render TemplateVisualPreview inside a wrapper modal for DECK_PACK.
  // For DECK_LAYOUT / VIDEO_SCENE the modals are self-contained — open them directly.
  if (template.type === 'DECK_LAYOUT') {
    const slots = schema?.slots ?? []
    const { COLS, ROWS } = getGridDims(slots)
    return (
      <DeckLayoutModal
        schema={schema}
        layoutName={template.name}
        slots={slots}
        hasSlots={slots.length > 0}
        COLS={COLS}
        ROWS={ROWS}
        onClose={onClose}
      />
    )
  }

  if (template.type === 'DECK_PACK') {
    const theme = resolveDeckPackTheme(schema?.themeId)
    const slides = schema?.slides ?? []
    return (
      <DeckPackSlideModal
        slides={slides}
        theme={theme}
        themeId={schema?.themeId}
        aspectRatio={schema?.aspectRatio ?? '16:9'}
        packName={template.name}
        previewImageUrl={getTemplatePreviewUrl(template)}
        media={Array.isArray(template.media) ? template.media : []}
        layoutSchemaMap={layoutSchemaMap}
        initialSlide={0}
        onClose={onClose}
      />
    )
  }

  // VIDEO_SCENE — wrap in a simple full-screen modal
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1200,
      background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column',
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
        <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{template.name}</span>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={16} />
        </button>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '32px 40px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 760 }}>
          <VideoScenePreview schema={schema} />
        </div>
      </div>
    </div>
  )
}

// ─── Template media tab ──────────────────────────────────────────────────────

const KIND_COLORS = {
  photo:   { bg: 'color-mix(in srgb, #3b82f6 15%, transparent)', color: '#60a5fa', label: 'Photo' },
  preview: { bg: 'color-mix(in srgb, #a855f7 15%, transparent)', color: '#c084fc', label: 'Preview' },
  graphic: { bg: 'color-mix(in srgb, #f59e0b 15%, transparent)', color: '#fbbf24', label: 'Graphic' },
}

function TemplateMediaTab({
  templateId,
  templateType,
  slideCount = 0,
  template = null,
  layoutSchemaMap = {},
}) {
  const [media, setMedia]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [uploading, setUploading]   = useState(false)
  const [uploadErr, setUploadErr]   = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const fileInputRef                = useRef(null)
  const [upKind, setUpKind]         = useState('photo')
  const [upSlotHint, setUpSlotHint] = useState(
    templateType === 'VIDEO_PACK' || templateType === 'VIDEO_SCENE' ? 'scene:1' : (slideCount > 0 ? 'slide:1' : '')
  )
  const [upName, setUpName]         = useState('')
  const [upFile, setUpFile]         = useState(null)
  const [upPreviewUrl, setUpPreviewUrl] = useState('')
  const [previewSlideIdx, setPreviewSlideIdx] = useState(0)
  const [stripStart, setStripStart] = useState(0)
  const STRIP_VISIBLE = 4
  const isVideoTemplate = templateType === 'VIDEO_PACK' || templateType === 'VIDEO_SCENE'
  const slotPrefix = isVideoTemplate ? 'scene' : 'slide'
  const slides = Array.isArray(template?.schema?.slides) ? template.schema.slides : []
  const packTheme = resolveDeckPackTheme(template?.schema?.themeId)
  const aspectRatio = template?.schema?.aspectRatio ?? '16:9'
  const showPackPreview = templateType === 'DECK_PACK' && slides.length > 0
  const resolvedSlideCount = slideCount || slides.length
  const slotOptions = resolvedSlideCount > 0
    ? Array.from({ length: resolvedSlideCount }, (_, i) => `${slotPrefix}:${i + 1}`)
    : []

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const data = await superadminService.listTemplateMedia(templateId)
      setMedia(data.media ?? data ?? [])
    } catch (err) {
      setError(err instanceof SuperadminApiError ? err.message : 'Failed to load media')
    } finally { setLoading(false) }
  }, [templateId])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!upFile) {
      setUpPreviewUrl('')
      return undefined
    }
    const url = URL.createObjectURL(upFile)
    setUpPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [upFile])

  useEffect(() => {
    if (previewSlideIdx >= slides.length) setPreviewSlideIdx(0)
  }, [slides.length, previewSlideIdx])

  useEffect(() => {
    const maxStart = Math.max(0, slides.length - STRIP_VISIBLE)
    setStripStart((start) => {
      if (previewSlideIdx < start) return Math.max(0, previewSlideIdx)
      if (previewSlideIdx >= start + STRIP_VISIBLE) {
        return Math.min(maxStart, previewSlideIdx - STRIP_VISIBLE + 1)
      }
      return Math.min(start, maxStart)
    })
  }, [previewSlideIdx, slides.length])

  function clearSelectedFile() {
    setUpFile(null)
    setUpPreviewUrl('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function pickFile(file) {
    if (!file) {
      clearSelectedFile()
      return
    }
    if (!String(file.type || '').startsWith('image/')) {
      setUploadErr('Please choose an image file (JPEG, PNG, WebP, or SVG).')
      return
    }
    setUploadErr('')
    setUpFile(file)
  }

  function mediaUrlForSlide(order) {
    return media.find((m) => m.slotHint === `slide:${order}`)?.url
      ?? media.find((m) => m.kind === 'photo' && m.slotHint === 'image')?.url
      ?? ''
  }

  function selectSlideForMedia(index) {
    const slide = slides[index]
    if (!slide) return
    const order = slide.order ?? (index + 1)
    setPreviewSlideIdx(index)
    setUpKind('photo')
    setUpSlotHint(`slide:${order}`)
    setUploadErr('')
  }

  async function handleUpload(e) {
    e.preventDefault()
    if (!upFile) { setUploadErr('Select a file first'); return }
    setUploadErr(''); setUploading(true)
    const resolvedSlot = upKind === 'preview'
      ? 'preview'
      : (upSlotHint.trim() || undefined)
    try {
      await superadminService.uploadTemplateMedia(templateId, {
        file: upFile, kind: upKind,
        slotHint: resolvedSlot,
        name: upName.trim() || undefined,
      })
      await load()
      clearSelectedFile()
      setUpName('')
      if (resolvedSlot && /^slide:(\d+)$/.test(resolvedSlot)) {
        const n = Number(resolvedSlot.split(':')[1])
        const idx = slides.findIndex((s, i) => (s.order ?? i + 1) === n)
        if (idx >= 0) setPreviewSlideIdx(idx)
      }
      if (slotOptions.length > 0) {
        setUpSlotHint(upKind === 'preview' ? 'preview' : (resolvedSlot || `${slotPrefix}:1`))
      } else {
        setUpSlotHint('')
      }
    } catch (err) {
      setUploadErr(err instanceof SuperadminApiError ? err.message : 'Upload failed')
    } finally { setUploading(false) }
  }

  async function handleDelete(mediaId) {
    setDeletingId(mediaId)
    try {
      await superadminService.deleteTemplateMedia(templateId, mediaId)
      setMedia(prev => prev.filter(m => m.id !== mediaId))
    } catch (err) {
      setError(err instanceof SuperadminApiError ? err.message : 'Delete failed')
    } finally { setDeletingId(null) }
  }

  const activeSlide = slides[previewSlideIdx]
  const activeOrder = activeSlide ? (activeSlide.order ?? previewSlideIdx + 1) : 1
  const activeImageUrl = mediaUrlForSlide(activeOrder)
  const activeHasMedia = Boolean(activeImageUrl)

  const uploadPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
      <div style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid color-mix(in srgb, var(--primary) 25%, var(--border-color))', background: 'color-mix(in srgb, var(--primary) 6%, transparent)', fontSize: '0.77rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--text-main)' }}>Template media</strong> — baked photos injected into image elements on pack clone.
        Use <code style={{ fontSize: '0.72rem', background: 'color-mix(in srgb, var(--primary) 10%, transparent)', padding: '1px 4px', borderRadius: 3 }}>slotHint: slide:N</code> to map to a specific slide.
        Use <code style={{ fontSize: '0.72rem', background: 'color-mix(in srgb, var(--primary) 10%, transparent)', padding: '1px 4px', borderRadius: 3 }}>kind: preview</code> for the pack picker thumbnail.
        {showPackPreview && (
          <> Click a slide on the right to target it, then upload again to replace.</>
        )}
      </div>

      <form onSubmit={handleUpload} style={{ padding: '14px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Upload media</p>
        {uploadErr && <div className="sa-alert sa-alert--error">{uploadErr}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>KIND *</label>
            <select
              className="sa-select"
              value={upKind}
              onChange={(e) => {
                const next = e.target.value
                setUpKind(next)
                if (next === 'preview') setUpSlotHint('preview')
                else if (!upSlotHint || upSlotHint === 'preview') {
                  setUpSlotHint(slotOptions[0] || `${slotPrefix}:1`)
                }
              }}
              disabled={uploading}
              style={{ width: '100%', boxSizing: 'border-box' }}
            >
              <option value="photo">photo — slide image</option>
              <option value="preview">preview — pack thumbnail</option>
              <option value="graphic">graphic — decoration</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>SLOT HINT</label>
            {slotOptions.length > 0 ? (
              <select
                className="sa-select"
                value={upSlotHint}
                onChange={(e) => setUpSlotHint(e.target.value)}
                disabled={uploading || upKind === 'preview'}
                style={{ width: '100%', boxSizing: 'border-box' }}
              >
                <option value="preview">preview — picker thumb</option>
                {slotOptions.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
                <option value="">custom / none</option>
              </select>
            ) : (
              <input
                className="sa-input"
                value={upSlotHint}
                onChange={(e) => setUpSlotHint(e.target.value)}
                placeholder={isVideoTemplate ? 'e.g. scene:1' : 'e.g. slide:1'}
                disabled={uploading}
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            )}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>NAME</label>
            <input className="sa-input" value={upName} onChange={e => setUpName(e.target.value)} placeholder="optional label" disabled={uploading} style={{ width: '100%', boxSizing: 'border-box' }} />
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          disabled={uploading}
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          style={{ display: 'none' }}
        />

        <div
          role="button"
          tabIndex={0}
          onClick={() => !uploading && fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (!uploading && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault()
              fileInputRef.current?.click()
            }
          }}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
          onDrop={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (uploading) return
            pickFile(e.dataTransfer.files?.[0] ?? null)
          }}
          style={{
            position: 'relative',
            borderRadius: 10,
            overflow: 'hidden',
            border: `1.5px dashed ${upFile ? 'color-mix(in srgb, var(--primary) 45%, var(--border-color))' : 'var(--border-color)'}`,
            background: upFile
              ? 'color-mix(in srgb, var(--primary) 5%, var(--bg-card))'
              : 'color-mix(in srgb, var(--border-color) 18%, transparent)',
            cursor: uploading ? 'not-allowed' : 'pointer',
            minHeight: 168,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {upFile && upPreviewUrl ? (
            <>
              <img
                src={upPreviewUrl}
                alt={upFile.name || 'Selected media preview'}
                style={{ width: '100%', height: 200, objectFit: 'contain', display: 'block', background: 'color-mix(in srgb, var(--border-color) 25%, transparent)' }}
              />
              <button
                type="button"
                title="Clear selection"
                disabled={uploading}
                onClick={(e) => { e.stopPropagation(); clearSelectedFile() }}
                style={{
                  position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(0,0,0,0.55)',
                  color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={14} />
              </button>
              <div style={{
                position: 'absolute', left: 0, right: 0, bottom: 0,
                padding: '8px 10px',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.65))',
                color: '#fff', fontSize: '0.72rem',
                display: 'flex', justifyContent: 'space-between', gap: 8,
              }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{upFile.name}</span>
                <span style={{ flexShrink: 0, opacity: 0.85 }}>{(upFile.size / 1024).toFixed(0)} KB</span>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '28px 16px', color: 'var(--text-muted)' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, margin: '0 auto 10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                color: 'var(--primary)',
              }}>
                <Plus size={18} />
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>Choose image from device</div>
              <div style={{ fontSize: '0.72rem', marginTop: 4 }}>Click or drop a JPEG / PNG / WebP here to preview before upload</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          {upFile && (
            <button type="button" className="sa-btn" onClick={clearSelectedFile} disabled={uploading}>
              Clear
            </button>
          )}
          <button type="submit" className="sa-btn sa-btn--primary" disabled={uploading || !upFile} style={{ flexShrink: 0 }}>
            {uploading ? <><span className="sa-spinner" style={{ width: 13, height: 13 }} /> Uploading…</> : '↑ Upload'}
          </button>
        </div>
      </form>

      <div>
        <p style={{ margin: '0 0 10px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Media {media.length > 0 && `(${media.length})`}
        </p>
        {error && <div className="sa-alert sa-alert--error" style={{ marginBottom: 10 }}>{error}</div>}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
            {[1, 2, 3].map(i => <div key={i} style={{ aspectRatio: '16/9', borderRadius: 8, background: 'var(--border-color)', opacity: 0.3 }} />)}
          </div>
        ) : media.length === 0 ? (
          <div style={{ padding: '28px 20px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: 10, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No media uploaded yet. Upload photos to enable real images on pack clone.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
            {media.map(m => {
              const kc = KIND_COLORS[m.kind] ?? KIND_COLORS.photo
              const isDeleting = deletingId === m.id
              const slideMatch = typeof m.slotHint === 'string' ? m.slotHint.match(/^slide:(\d+)$/) : null
              return (
                <div key={m.id} style={{ borderRadius: 10, border: '1px solid var(--border-color)', overflow: 'hidden', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column' }}>
                  <div
                    style={{ aspectRatio: '16/9', background: 'color-mix(in srgb, var(--border-color) 30%, transparent)', position: 'relative', overflow: 'hidden', cursor: slideMatch ? 'pointer' : 'default' }}
                    onClick={() => {
                      if (!slideMatch || !showPackPreview) return
                      const n = Number(slideMatch[1])
                      const idx = slides.findIndex((s, i) => (s.order ?? i + 1) === n)
                      if (idx >= 0) selectSlideForMedia(idx)
                    }}
                  >
                    {m.url ? (
                      <img src={m.url} alt={m.name || m.kind} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={e => { e.currentTarget.style.display = 'none' }} />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', opacity: 0.2 }}>🖼</div>
                    )}
                    <span style={{ position: 'absolute', top: 5, left: 5, padding: '1px 6px', borderRadius: 4, fontSize: '0.58rem', fontWeight: 700, background: 'rgba(0,0,0,0.65)', color: kc.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kc.label}</span>
                    <button type="button" disabled={isDeleting} onClick={(e) => { e.stopPropagation(); handleDelete(m.id) }}
                      style={{ position: 'absolute', top: 5, right: 5, width: 22, height: 22, borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.55)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, opacity: isDeleting ? 0.5 : 1 }} title="Delete">
                      {isDeleting ? '…' : '✕'}
                    </button>
                  </div>
                  <div style={{ padding: '6px 8px' }}>
                    {m.name && <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>}
                    {m.slotHint && <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 1 }}>{m.slotHint}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )

  if (!showPackPreview) {
    return <div style={{ padding: '16px' }}>{uploadPanel}</div>
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 0.95fr)',
      gap: 16,
      padding: '16px',
      alignItems: 'start',
    }}>
      {uploadPanel}
      <div style={{
        position: 'sticky',
        top: 0,
        borderRadius: 12,
        border: '1px solid var(--border-color)',
        background: 'var(--bg-card)',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        minWidth: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Slide preview
          </p>
          <span style={{
            fontSize: '0.68rem',
            color: activeHasMedia ? '#4ade80' : 'var(--text-muted)',
            fontWeight: 600,
          }}>
            {activeHasMedia ? `slide:${activeOrder} · image set` : `slide:${activeOrder} · no image`}
          </span>
        </div>
        <div style={{
          borderRadius: 10,
          overflow: 'hidden',
          border: `1px solid ${packTheme.accent}44`,
          boxShadow: `0 0 0 1px ${packTheme.accent}22`,
        }}>
          {activeSlide ? (
            <SlideCard
              theme={packTheme}
              slide={activeSlide}
              index={previewSlideIdx}
              ph={extractPlaceholderTitle(activeSlide.placeholder)}
              icon={CONTENT_TYPE_ICONS[activeSlide.contentType] ?? '▣'}
              imageUrl={activeImageUrl}
              media={media}
              large
              aspectRatio={aspectRatio}
              layoutSchemaMap={layoutSchemaMap}
            />
          ) : (
            <div style={{ aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              No slides
            </div>
          )}
        </div>
        <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
          Select a slide below to target uploads. Re-upload to the same <code style={{ fontSize: '0.68rem' }}>slide:N</code> to replace the image.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            aria-label="Previous slides"
            disabled={stripStart <= 0}
            onClick={() => setStripStart((s) => Math.max(0, s - STRIP_VISIBLE))}
            style={{
              width: 28, height: 56, flexShrink: 0, borderRadius: 8, cursor: stripStart <= 0 ? 'default' : 'pointer',
              border: '1px solid var(--border-color)', background: 'var(--bg-card)',
              color: stripStart <= 0 ? 'var(--text-muted)' : 'var(--text-main)',
              opacity: stripStart <= 0 ? 0.4 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <div style={{
            flex: 1,
            minWidth: 0,
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(STRIP_VISIBLE, slides.length)}, minmax(0, 1fr))`,
            gap: 8,
          }}>
            {slides.slice(stripStart, stripStart + STRIP_VISIBLE).map((s, offset) => {
              const i = stripStart + offset
              const order = s.order ?? (i + 1)
              const imgUrl = mediaUrlForSlide(order)
              const isActive = i === previewSlideIdx
              const sct = s.contentType ?? 'slide'
              return (
                <button
                  key={`${order}-${s.layout_id || i}`}
                  type="button"
                  onClick={() => selectSlideForMedia(i)}
                  style={{
                    padding: 0,
                    border: `2px solid ${isActive ? packTheme.accent : 'transparent'}`,
                    borderRadius: 8,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: 'none',
                    textAlign: 'left',
                    boxShadow: isActive ? `0 0 0 1px ${packTheme.accent}44` : 'none',
                  }}
                >
                  <SlideCard
                    theme={packTheme}
                    slide={s}
                    index={i}
                    ph={extractPlaceholderTitle(s.placeholder)}
                    icon={CONTENT_TYPE_ICONS[sct] ?? '▣'}
                    imageUrl={imgUrl}
                    media={media}
                    large={false}
                    aspectRatio={aspectRatio}
                    layoutSchemaMap={layoutSchemaMap}
                  />
                  <div style={{
                    padding: '4px 6px',
                    fontSize: '0.58rem',
                    fontWeight: 700,
                    color: isActive ? packTheme.accent : 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    background: 'color-mix(in srgb, var(--bg-card) 80%, transparent)',
                  }}>
                    {order} · {imgUrl ? 'img' : 'empty'}
                  </div>
                </button>
              )
            })}
          </div>
          <button
            type="button"
            aria-label="Next slides"
            disabled={stripStart + STRIP_VISIBLE >= slides.length}
            onClick={() => setStripStart((s) => Math.min(Math.max(0, slides.length - STRIP_VISIBLE), s + STRIP_VISIBLE))}
            style={{
              width: 28, height: 56, flexShrink: 0, borderRadius: 8,
              cursor: stripStart + STRIP_VISIBLE >= slides.length ? 'default' : 'pointer',
              border: '1px solid var(--border-color)', background: 'var(--bg-card)',
              color: stripStart + STRIP_VISIBLE >= slides.length ? 'var(--text-muted)' : 'var(--text-main)',
              opacity: stripStart + STRIP_VISIBLE >= slides.length ? 0.4 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
        {slides.length > STRIP_VISIBLE && (
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            {stripStart + 1}–{Math.min(stripStart + STRIP_VISIBLE, slides.length)} of {slides.length}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Detail / edit panel ──────────────────────────────────────────────────────

function TemplateDetail({ template, onUpdated, onClose, onDuplicate, layoutSchemaMap = {}, layoutCatalog = [] }) {
  const [name, setName]             = useState(template.name || '')
  const [contentType, setContentType] = useState(template.contentType || '')
  const [variant, setVariant]       = useState(template.variant || '')
  const [isActive, setIsActive]     = useState(template.isActive ?? true)
  const [schemaStr, setSchemaStr]   = useState(
    template.schema ? JSON.stringify(template.schema, null, 2) : ''
  )
  const [saving, setSaving]   = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [saveErr, setSaveErr] = useState('')
  const [activeTab, setActiveTab] = useState('edit')
  const [showPreview, setShowPreview] = useState(false)

  async function handleSave(e) {
    e.preventDefault()
    setSaveErr(''); setSaveMsg('')
    const { ok, value, error: jsonErr } = parseJsonSafe(schemaStr)
    if (!ok) { setSaveErr(`Schema is not valid JSON: ${jsonErr}`); return }
    if (template.type === 'DECK_LAYOUT') {
      const roleCheck = validateDeckLayoutSchema(value)
      if (!roleCheck.ok) {
        setSaveErr(roleCheck.errors.join(' · '))
        return
      }
    }
    setSaving(true)
    try {
      const updated = await superadminService.updateTemplate(template.id, {
        name: name.trim(),
        contentType: contentType.trim() || undefined,
        variant: variant.trim() || undefined,
        isActive, schema: value,
      })
      setSaveMsg('Saved'); onUpdated(updated.template ?? updated)
      setTimeout(() => setSaveMsg(''), 2500)
    } catch (err) {
      setSaveErr(err instanceof SuperadminApiError ? err.message : 'Failed to save')
    } finally { setSaving(false) }
  }

  const schemaValid = parseJsonSafe(schemaStr)

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
      {/* compact header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderBottom: '1px solid var(--border-color)', flexShrink: 0, gap: 12 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{template.name}</span>
            <TypePill type={template.type} />
            <ActiveBadge active={template.isActive} />
            {template.version > 1 && (
              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', opacity: 0.6 }}>v{template.version}</span>
            )}
          </div>
          <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.7 }}>
            {[template.contentType, template.variant].filter(Boolean).join(' · ')}
            {(template.contentType || template.variant) && '  ·  '}
            {formatDate(template.createdAt)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button className="sa-btn sa-btn--ghost sa-btn--sm" onClick={() => setShowPreview(true)}>▶ Preview</button>
          {onDuplicate && (
            <button className="sa-btn sa-btn--ghost sa-btn--sm" title="Duplicate this template" onClick={() => onDuplicate(template)}>⧉ Duplicate</button>
          )}
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'flex' }}><X size={15} /></button>
        </div>
      </div>

      {/* underline tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', padding: '0 16px', flexShrink: 0 }}>
        {[
          { id: 'edit',  label: 'Edit' },
          { id: 'media', label: 'Media', onlyFor: ['DECK_PACK'] },
          { id: 'json',  label: 'Raw JSON' },
        ]
          .filter(t => !t.onlyFor || t.onlyFor.includes(template.type))
          .map(t => (
            <button key={t.id} type="button" onClick={() => setActiveTab(t.id)} style={{
              padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: '0.8rem', fontWeight: 600, marginBottom: -1,
              color: activeTab === t.id ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
              transition: 'color 0.12s',
            }}>{t.label}</button>
          ))
        }
      </div>

      {/* content */}
      <div className="sa-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: activeTab === 'media' ? 0 : '16px' }}>

        {activeTab === 'media' && (
          <TemplateMediaTab
            templateId={template.id}
            templateType={template.type}
            slideCount={Array.isArray(template.schema?.slides) ? template.schema.slides.length : 0}
            template={template}
            layoutSchemaMap={layoutSchemaMap}
          />
        )}

        {activeTab === 'edit' && (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {saveErr && <div className="sa-alert sa-alert--error">{saveErr}</div>}
            {saveMsg && <div className="sa-alert sa-alert--success">{saveMsg}</div>}

            {/* name + active toggle in one row */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Name</label>
                <input className="sa-input" value={name} onChange={e => setName(e.target.value)} disabled={saving} style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, paddingBottom: 5, flexShrink: 0 }}>
                <button type="button" onClick={() => setIsActive(v => !v)} disabled={saving} style={{ width: 34, height: 19, borderRadius: 999, border: 'none', cursor: 'pointer', background: isActive ? 'var(--primary)' : 'color-mix(in srgb, var(--text-muted) 30%, var(--border-color))', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <span style={{ position: 'absolute', top: 2, left: isActive ? 16 : 2, width: 15, height: 15, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                </button>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: isActive ? 'var(--primary)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>

            {/* content type + variant for DECK_LAYOUT */}
            {template.type === 'DECK_LAYOUT' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Content type</label>
                  <ContentTypeSelect
                    value={contentType}
                    onChange={e => setContentType(e.target.value)}
                    disabled={saving}
                    emptyLabel="— none —"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Variant</label>
                  <input className="sa-input" value={variant} onChange={e => setVariant(e.target.value)} disabled={saving} style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
              </div>
            )}
            {/* pack id / variant for DECK_PACK / VIDEO_PACK */}
            {(template.type === 'DECK_PACK' || template.type === 'VIDEO_PACK') && (
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Pack ID / Variant</label>
                <input className="sa-input" value={variant} onChange={e => setVariant(e.target.value)} disabled={saving} style={{ width: '100%', boxSizing: 'border-box' }}
                  placeholder={template.type === 'VIDEO_PACK' ? 'e.g. onboarding_video_v1' : 'e.g. corp_pitch_midnight'} />
              </div>
            )}

            {/* DECK_PACK / VIDEO_PACK quick helpers */}
            {(template.type === 'DECK_PACK' || template.type === 'VIDEO_PACK') && (
              <div style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'color-mix(in srgb, var(--bg-card) 60%, transparent)' }}>
                <p style={{ margin: '0 0 8px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quick helpers</p>
                {template.type === 'DECK_PACK' && (
                  <>
                    <DeckPackQuickSelects
                      schemaStr={schemaStr}
                      setSchemaStr={setSchemaStr}
                      onError={(msg) => { if (msg) setSaveErr(msg); else setSaveErr('') }}
                      themeLabel="Inject themeId"
                      ratioLabel="Inject aspectRatio"
                    />
                    <DeckPackLayoutPicker
                      schemaStr={schemaStr}
                      setSchemaStr={setSchemaStr}
                      layoutCatalog={layoutCatalog}
                      layoutSchemaMap={layoutSchemaMap}
                      onError={(msg) => { if (msg) setSaveErr(msg); else setSaveErr('') }}
                      disabled={saving}
                    />
                  </>
                )}
                {template.type === 'VIDEO_PACK' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 3 }}>Inject FPS</label>
                    <select className="sa-select" style={{ width: '50%', boxSizing: 'border-box', fontSize: '0.78rem' }} defaultValue=""
                      onChange={e => { if (!e.target.value) return; try { const p = JSON.parse(schemaStr); p.videoSettings = { ...(p.videoSettings ?? { width: 1920, height: 1080 }), fps: Number(e.target.value) }; setSchemaStr(JSON.stringify(p, null, 2)) } catch {} }}>
                      <option value="">— inject fps —</option>
                      {[24, 25, 30, 60].map(v => <option key={v} value={v}>{v} fps</option>)}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* schema */}
            {template.type === 'DECK_LAYOUT' && (
              <DeckLayoutSchemaTools
                schemaStr={schemaStr}
                setSchemaStr={setSchemaStr}
                setName={setName}
                setContentType={setContentType}
                onError={(msg) => { if (msg) setSaveErr(msg); else setSaveErr('') }}
                disabled={saving}
              />
            )}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Schema (JSON)</label>
                {schemaStr.trim() && <span style={{ fontSize: '0.68rem', fontWeight: 600, color: schemaValid.ok ? '#4ade80' : '#f87171' }}>{schemaValid.ok ? '✓ valid' : '✗ invalid'}</span>}
              </div>
              <textarea value={schemaStr} onChange={e => setSchemaStr(e.target.value)} disabled={saving} rows={12} spellCheck={false}
                style={{ width: '100%', boxSizing: 'border-box', padding: '9px 11px', borderRadius: 8, fontFamily: 'monospace', fontSize: '0.77rem', lineHeight: 1.5, background: 'color-mix(in srgb, var(--bg-card) 50%, transparent)', border: `1px solid ${schemaStr.trim() && !schemaValid.ok ? 'color-mix(in srgb, #ef4444 45%, var(--border-color))' : 'var(--border-color)'}`, color: 'var(--text-main)', resize: 'vertical', transition: 'border-color 0.15s' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="sa-btn sa-btn--primary" disabled={saving}>
                {saving ? <><span className="sa-spinner" style={{ width: 13, height: 13 }} /> Saving…</> : 'Save changes'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'json' && (
          <pre style={{ margin: 0, padding: '12px', borderRadius: 8, background: 'color-mix(in srgb, var(--bg-card) 60%, transparent)', border: '1px solid var(--border-color)', fontFamily: 'monospace', fontSize: '0.77rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {template.schema ? JSON.stringify(template.schema, null, 2) : '(no schema)'}
          </pre>
        )}
      </div>

      {showPreview && (
        <PreviewModal
          template={mergeTemplateWithSchemaStr(template, schemaStr)}
          layoutSchemaMap={layoutSchemaMap}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  )
}

// ─── Inline pack slide viewer (used inside the centered preview modal) ───────
// Same filmstrip + scrollable slides as DeckPackSlideModal but rendered inline.

function InlinePackSlideViewer({ template, layoutSchemaMap = {} }) {
  const schema   = template.schema ?? {}
  const slides   = schema.slides ?? []
  const theme = resolveDeckPackTheme(schema.themeId)
  const aspectRatio = schema.aspectRatio ?? '16:9'
  const media    = Array.isArray(template.media) ? template.media : []

  const [current, setCurrent] = useState(0)
  const mainRef   = useRef(null)
  const stripRefs = useRef([])
  const slideRefs = useRef([])

  useEffect(() => {
    stripRefs.current[current]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [current])

  function goTo(i) {
    setCurrent(i)
    slideRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    if (!mainRef.current) return
    const obs = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) { const idx = Number(e.target.dataset.idx); if (!isNaN(idx)) setCurrent(idx) } }) },
      { root: mainRef.current, threshold: 0.5 }
    )
    slideRefs.current.forEach(el => el && obs.observe(el))
    return () => obs.disconnect()
  }, [slides.length])

  if (slides.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>
        No slides defined in this pack.
      </div>
    )
  }

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden', background: 'var(--bg-main, #0d1117)' }}>
      {/* LEFT: filmstrip */}
      <div style={{
        width: 150, flexShrink: 0, overflowY: 'auto', overflowX: 'hidden',
        borderRight: '1px solid var(--border-color)',
        background: 'color-mix(in srgb, var(--bg-card) 70%, transparent)',
        padding: '10px 8px',
        display: 'flex', flexDirection: 'column', gap: 8,
        scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) transparent',
      }}>
        {slides.map((s, i) => {
          const sct      = s.contentType ?? 'slide'
          const sph      = extractPlaceholderTitle(s.placeholder)
          const sicon    = CONTENT_TYPE_ICONS[sct] ?? '▣'
          const isActive = i === current
          const order    = s.order ?? (i + 1)
          const imgUrl   = media.find(m => m.slotHint === `slide:${order}`)?.url
            ?? media.find(m => m.kind === 'photo' && m.slotHint === 'image')?.url
            ?? null
          return (
            <div key={i} ref={el => { stripRefs.current[i] = el }}>
              <button type="button" onClick={() => goTo(i)} style={{
                width: '100%', padding: 0, border: `2px solid ${isActive ? theme.accent : 'transparent'}`,
                borderRadius: 7, overflow: 'hidden', cursor: 'pointer', background: 'none',
                outline: 'none', transition: 'border-color 0.15s',
                boxShadow: isActive ? `0 0 0 1px ${theme.accent}44` : 'none',
              }}>
                <SlideCard theme={theme} slide={s} index={i} ph={sph} icon={sicon} imageUrl={imgUrl} media={media} large={false} aspectRatio={aspectRatio} layoutSchemaMap={layoutSchemaMap} />
              </button>
              <div style={{ marginTop: 4, fontSize: '0.58rem', fontWeight: 600, textAlign: 'center', color: isActive ? theme.accent : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', transition: 'color 0.15s' }}>
                {i + 1} · {sct}
              </div>
            </div>
          )
        })}
      </div>

      {/* RIGHT: main scroll */}
      <div ref={mainRef} style={{
        flex: 1, minWidth: 0, overflowY: 'auto', overflowX: 'hidden',
        padding: '24px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28,
        background: 'var(--bg-main, color-mix(in srgb, var(--bg-card) 40%, #0d1117))',
        scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) transparent',
      }}>
        {slides.map((s, i) => {
          const sct   = s.contentType ?? 'slide'
          const sph   = extractPlaceholderTitle(s.placeholder)
          const sicon = CONTENT_TYPE_ICONS[sct] ?? '▣'
          const order = s.order ?? (i + 1)
          const imgUrl = media.find(m => m.slotHint === `slide:${order}`)?.url
            ?? media.find(m => m.kind === 'photo' && m.slotHint === 'image')?.url
            ?? null
          return (
            <div key={i} ref={el => { slideRefs.current[i] = el }} data-idx={i}
              style={{ width: '100%', maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* slide label row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', opacity: 0.5, fontFamily: 'monospace', minWidth: 18 }}>{i + 1}</span>
                <div style={{ height: 1, flex: 1, background: 'var(--border-color)' }} />
                <span style={{ padding: '2px 7px', borderRadius: 99, background: `${theme.accent}18`, border: `1px solid ${theme.accent}33`, color: theme.accent, fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{sct}</span>
                {s.layout_id && <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', opacity: 0.5, fontFamily: 'monospace' }}>{s.layout_id}</span>}
              </div>
              {/* slide */}
              <div style={{
                width: '100%', borderRadius: 10, overflow: 'hidden',
                boxShadow: `0 4px 20px rgba(0,0,0,0.12), 0 0 0 1px ${i === current ? theme.accent + '55' : 'var(--border-color)'}`,
                transition: 'box-shadow 0.2s',
              }}>
                <SlideCard theme={theme} slide={s} index={i} ph={sph} icon={sicon} imageUrl={imgUrl} media={media} large={true} aspectRatio={aspectRatio} layoutSchemaMap={layoutSchemaMap} />
              </div>
            </div>
          )
        })}
        <div style={{ height: 32 }} />
      </div>
    </div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export default function SuperadminTemplatesPanel() {
  const [activeType, setActiveType]     = useState('DECK_LAYOUT')
  const [templates, setTemplates]       = useState([])
  const [loading, setLoading]           = useState(false)
  const [listError, setListError]       = useState('')
  const [search, setSearch]             = useState('')
  const [searchInput, setSearchInput]   = useState('')
  const [filterActive, setFilterActive] = useState('all')
  const [layoutCategory, setLayoutCategory] = useState('all')
  const searchTimer = useRef(null)
  const [selected, setSelected]         = useState(null)
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [showCreate, setShowCreate]     = useState(false)
  const [duplicatePrefill, setDuplicatePrefill] = useState(null)
  const [layoutSchemaMap, setLayoutSchemaMap] = useState({})
  const [layoutCatalog, setLayoutCatalog] = useState([])

  const openPreview = useCallback(async (template) => {
    if (!template?.id) return
    setPreviewTemplate(template)
    try {
      const fresh = await superadminService.getTemplate(template.id)
      if (fresh?.id) setPreviewTemplate(fresh)
    } catch {
      // Keep list payload if refresh fails
    }
  }, [])

  const fetchList = useCallback(async (type, activeFilter) => {
    setLoading(true); setListError('')
    try {
      const params = { type }
      if (activeFilter === 'active')   params.isActive = true
      if (activeFilter === 'inactive') params.isActive = false
      const data = await superadminService.listTemplates(params)
      const rows = unwrapTemplateRows(data)
      setTemplates(rows)
    } catch (err) {
      setListError(err instanceof SuperadminApiError ? err.message : 'Failed to load templates')
      setTemplates([])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { setSelected(null); fetchList(activeType, filterActive) }, [activeType, filterActive, fetchList])

  useEffect(() => {
    if (activeType !== 'DECK_LAYOUT') setLayoutCategory('all')
  }, [activeType])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await superadminService.listTemplates({ type: 'DECK_LAYOUT' })
        if (cancelled) return
        const rows = unwrapTemplateRows(data)
        setLayoutSchemaMap(buildLayoutSchemaMap(rows))
        setLayoutCatalog(buildLayoutCatalog(rows))
      } catch {
        if (!cancelled) {
          // Keep any catalog already populated; picker also self-loads.
        }
      }
    })()
    return () => { cancelled = true }
  }, [])

  // When browsing Deck Layouts, keep pack-picker catalog in sync with the visible list.
  useEffect(() => {
    if (activeType !== 'DECK_LAYOUT' || !templates.length) return
    const rows = templates.filter((t) => t.type === 'DECK_LAYOUT' || t.schema?.layout_id)
    if (!rows.length) return
    setLayoutSchemaMap((prev) => ({ ...prev, ...buildLayoutSchemaMap(rows) }))
    setLayoutCatalog(buildLayoutCatalog(rows))
  }, [activeType, templates])

  function handleSearchInput(e) {
    const v = e.target.value; setSearchInput(v)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => setSearch(v), 280)
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return templates.filter((t) => {
      if (q) {
        const matchesSearch =
          t.name?.toLowerCase().includes(q)
          || t.contentType?.toLowerCase().includes(q)
          || t.variant?.toLowerCase().includes(q)
          || t.schema?.layout_id?.toLowerCase().includes(q)
          || t.schema?.pack_id?.toLowerCase().includes(q)
        if (!matchesSearch) return false
      }
      if (activeType === 'DECK_LAYOUT' && layoutCategory !== 'all') {
        return resolveLayoutCategoryId(t) === layoutCategory
      }
      return true
    })
  }, [templates, search, activeType, layoutCategory])

  const layoutCategoryCounts = useMemo(() => {
    if (activeType !== 'DECK_LAYOUT') return {}
    const deckLayouts = templates.filter((t) => t.type === 'DECK_LAYOUT' || t.schema?.layout_id)
    const out = { all: deckLayouts.length }
    for (const template of deckLayouts) {
      const cat = resolveLayoutCategoryId(template)
      out[cat] = (out[cat] || 0) + 1
    }
    return out
  }, [templates, activeType])

  async function handleQuickToggle(e, t) {
    e.stopPropagation()
    try {
      const updated = await superadminService.updateTemplate(t.id, { isActive: !t.isActive })
      const tpl = updated.template ?? updated
      setTemplates(prev => prev.map(x => x.id === tpl.id ? tpl : x))
      if (selected?.id === tpl.id) setSelected(tpl)
    } catch { /* silent */ }
  }

  function upsertLayoutCatalogEntry(template) {
    if (template?.type !== 'DECK_LAYOUT' || !template.schema?.layout_id) return
    const entry = buildLayoutCatalog([template])[0]
    if (!entry) return
    setLayoutSchemaMap((prev) => ({
      ...prev,
      [entry.layoutId]: template.schema,
    }))
    setLayoutCatalog((prev) => {
      const rest = prev.filter((l) => l.layoutId !== entry.layoutId && l.id !== entry.id)
      return [...rest, entry].sort((a, b) => a.name.localeCompare(b.name))
    })
  }

  function handleCreated(created, { keepOpen = false } = {}) {
    const template = created.template ?? created
    if (template.type === activeType) {
      setTemplates((prev) => {
        const rest = prev.filter((t) => t.id !== template.id)
        return [template, ...rest]
      })
    }
    upsertLayoutCatalogEntry(template)
    if (!keepOpen) {
      setShowCreate(false)
      setDuplicatePrefill(null)
      setSelected(null)
    }
  }
  function handleUpdated(updated) {
    setTemplates(prev => prev.map(t => t.id === updated.id ? updated : t)); setSelected(updated)
    upsertLayoutCatalogEntry(updated)
  }

  return (
    <div className="sa-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <style>{`.template-card:hover .card-hover-actions { opacity: 1 !important; pointer-events: auto !important; } .card-hover-actions { pointer-events: none; } .template-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06) !important; transform: translateY(-1px); } .template-card:active { transform: translateY(0); }`}</style>

      {/* ── topbar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px 0', gap: 16, flexShrink: 0 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Templates</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manage deck layouts, packs, and video scenes for workspace pickers</p>
        </div>
        <button className="sa-btn sa-btn--primary" onClick={() => setShowCreate(true)} style={{ flexShrink: 0, height: 36, paddingLeft: 14, paddingRight: 14 }}>
          <Plus size={14} strokeWidth={2.5} /> New template
        </button>
      </div>

      {/* ── toolbar: type tabs + search + filters ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', marginTop: 16, borderBottom: '1px solid var(--border-color)', flexShrink: 0, gap: 12 }}>
        {/* type tabs */}
        <div style={{ display: 'flex', gap: 0 }}>
          {TEMPLATE_TYPES.map(t => (
            <button key={t.id} type="button" onClick={() => setActiveType(t.id)} style={{
              padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: 600, marginBottom: -1, whiteSpace: 'nowrap',
              color: activeType === t.id ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeType === t.id ? '2px solid var(--primary)' : '2px solid transparent',
              transition: 'color 0.12s',
            }}>
              {t.label}
              {activeType === t.id && filtered.length > 0 && (
                <span style={{ marginLeft: 6, fontSize: '0.68rem', fontWeight: 700, padding: '1px 6px', borderRadius: 99, background: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)' }}>{filtered.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* search + category + status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input className="sa-input" placeholder="Search templates…" value={searchInput} onChange={handleSearchInput}
              style={{ width: 200, boxSizing: 'border-box', height: 32, paddingLeft: 30, fontSize: '0.8rem', borderRadius: 8 }} />
          </div>
          {activeType === 'DECK_LAYOUT' && (
            <LayoutCategorySelect
              value={layoutCategory}
              onChange={setLayoutCategory}
              items={LAYOUT_CATEGORIES}
              counts={layoutCategoryCounts}
            />
          )}
          <select
            className="sa-select"
            aria-label="Status"
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            style={{ height: 32, fontSize: '0.8rem', borderRadius: 8, minWidth: 128, padding: '0 28px 0 10px', boxSizing: 'border-box' }}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* ── card grid ── */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 24px 24px' }}>
        {listError && <div className="sa-alert sa-alert--error" style={{ marginBottom: 16 }}>{listError}</div>}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 12, border: '1px solid var(--border-color)', overflow: 'hidden', background: 'var(--bg-card)' }}>
                <div style={{ aspectRatio: '16/9', background: 'color-mix(in srgb, var(--border-color) 50%, transparent)', opacity: 0.4 }} />
                <div style={{ padding: '12px' }}>
                  <div style={{ height: 12, borderRadius: 4, background: 'var(--border-color)', opacity: 0.5, marginBottom: 6, width: '65%' }} />
                  <div style={{ height: 9, borderRadius: 4, background: 'var(--border-color)', opacity: 0.3, width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <LayoutTemplate size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.2 }} />
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>
              {search
                ? `No results for "${search}"`
                : activeType === 'DECK_LAYOUT' && layoutCategory !== 'all'
                  ? `No layouts in "${LAYOUT_CATEGORIES.find((c) => c.id === layoutCategory)?.label || layoutCategory}"`
                  : 'No templates yet'}
            </p>
            <p style={{ margin: '6px 0 16px', fontSize: '0.8rem', opacity: 0.7 }}>{TEMPLATE_TYPES.find(t => t.id === activeType)?.description}</p>
            {!search && (
              <button className="sa-btn sa-btn--primary" onClick={() => setShowCreate(true)}>
                <Plus size={14} /> Create first template
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {filtered.map(t => {
              const previewUrl = getTemplatePreviewUrl(t)
              const fallbackColor = t.schema?.preview?.color
              const tc = t.schema?.themeId ? resolveDeckPackTheme(t.schema.themeId) : null
              const isSelected = selected?.id === t.id
              return (
                <div
                  key={t.id}
                  role="button"
                  tabIndex={0}
                  className="template-card"
                  onClick={() => setSelected(t)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelected(t)
                    }
                  }}
                  style={{
                    textAlign: 'left',
                    border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                    borderRadius: 14, overflow: 'hidden', background: 'var(--bg-card)',
                    cursor: 'pointer', padding: 0, transition: 'all 0.18s',
                    boxShadow: isSelected
                      ? `0 0 0 3px color-mix(in srgb, var(--primary) 18%, transparent), 0 4px 16px rgba(0,0,0,0.08)`
                      : '0 1px 3px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  {/* thumbnail */}
                  <div style={{ aspectRatio: aspectRatioToCss(t.schema?.aspectRatio ?? '16:9'), position: 'relative', overflow: 'hidden', background: 'var(--bg-card)' }}>
                    {t.type === 'DECK_LAYOUT' ? (
                      <LayoutPolishedPreview
                        schema={enrichLayoutSchemaForPreview(t.schema)}
                        slots={t.schema?.slots ?? []}
                        fill
                      />
                    ) : (
                      // ── Pack / Video Scene: themed gradient ──
                      <>
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: tc
                            ? `linear-gradient(140deg, ${tc.bg} 0%, ${tc.surface ?? tc.bg} 55%, ${tc.accent}30 100%)`
                            : fallbackColor
                              ? `linear-gradient(140deg, ${fallbackColor}dd 0%, ${fallbackColor}44 100%)`
                              : t.type === 'VIDEO_PACK'
                                ? 'linear-gradient(140deg, #0f172a, #1e293b)'
                                : t.type === 'VIDEO_SCENE'
                                  ? 'linear-gradient(140deg, #0f0f1a, #1a1a2e)'
                                  : 'linear-gradient(140deg, color-mix(in srgb, var(--primary) 5%, var(--bg-card)), color-mix(in srgb, var(--primary) 12%, var(--bg-card)))',
                        }} />
                        {/* accent bottom stripe */}
                        {tc && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: tc.accent, opacity: 0.9 }} />}
                        {/* content: palette + label */}
                        {tc && (
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', padding: '12px 12px 16px' }}>
                            {/* palette row top */}
                            <div style={{ display: 'flex', gap: 5 }}>
                              {[tc.accent, tc.text, tc.surface ?? tc.bg].map((c, i) => (
                                <div key={i} style={{
                                  width: i === 0 ? 12 : 8, height: i === 0 ? 12 : 8,
                                  borderRadius: '50%', background: c,
                                  border: '1.5px solid rgba(255,255,255,0.2)',
                                  boxShadow: i === 0 ? `0 0 8px ${c}99` : 'none',
                                }} />
                              ))}
                            </div>
                            {/* theme name bottom */}
                            {t.schema?.themeId && (
                              <span style={{ fontSize: '0.53rem', fontWeight: 600, color: tc.text, opacity: 0.4, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                                {t.schema.themeId.replace(/_/g, ' ')}
                              </span>
                            )}
                          </div>
                        )}
                      </>
                    )}
                    {/* slide count badge for packs */}
                    {t.type === 'DECK_PACK' && t.schema?.slides?.length > 0 && (
                      <div style={{ position: 'absolute', bottom: 10, left: 10, padding: '2px 7px', borderRadius: 5, fontSize: '0.62rem', fontWeight: 700, background: 'rgba(0,0,0,0.45)', color: '#fff', backdropFilter: 'blur(4px)', letterSpacing: '0.02em' }}>
                        {t.schema.slides.length} slides
                      </div>
                    )}
                    {t.type === 'VIDEO_PACK' && Array.isArray(t.schema?.scenes) && t.schema.scenes.length > 0 && (
                      <div style={{ position: 'absolute', bottom: 10, left: 10, padding: '2px 7px', borderRadius: 5, fontSize: '0.62rem', fontWeight: 700, background: 'rgba(0,0,0,0.45)', color: '#fff', backdropFilter: 'blur(4px)', letterSpacing: '0.02em' }}>
                        {t.schema.scenes.length} scenes
                      </div>
                    )}
                    {t.type === 'VIDEO_SCENE' && t.schema?.scene?.durationInFrames && (
                      <div style={{ position: 'absolute', bottom: 10, left: 10, padding: '2px 7px', borderRadius: 5, fontSize: '0.62rem', fontWeight: 700, background: 'rgba(0,0,0,0.45)', color: '#fff', backdropFilter: 'blur(4px)' }}>
                        {t.schema.scene.durationInFrames}f
                      </div>
                    )}
                    {/* media count */}
                    {t.type !== 'VIDEO_SCENE' && Array.isArray(t.media) && t.media.length > 0 && (
                      <div style={{ position: 'absolute', bottom: 10, right: 10, padding: '2px 7px', borderRadius: 5, fontSize: '0.62rem', fontWeight: 700, background: 'rgba(0,0,0,0.45)', color: '#fff', backdropFilter: 'blur(4px)' }}>
                        {t.media.length} media
                      </div>
                    )}
                    {/* hover overlay with action icons */}
                    <div className="card-hover-actions" style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0.45)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      opacity: 0, transition: 'opacity 0.18s',
                    }}>
                      <button type="button"
                        title="Preview"
                        onClick={e => { e.stopPropagation(); openPreview(t) }}
                        style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', cursor: 'pointer', color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)' }}
                      >▶</button>
                      <button type="button"
                        title="Edit"
                        onClick={e => { e.stopPropagation(); setSelected(t) }}
                        style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', cursor: 'pointer', color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)' }}
                      >✎</button>
                    </div>
                  </div>

                  {/* card footer — clean, no buttons */}
                  <div style={{
                    padding: '10px 12px 11px',
                    borderTop: tc ? `2px solid ${tc.accent}30` : '1px solid var(--border-color)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{t.name}</div>
                      {/* tiny active dot toggle */}
                      <button type="button" title={t.isActive ? 'Deactivate' : 'Activate'}
                        onClick={e => handleQuickToggle(e, t)}
                        style={{
                          flexShrink: 0, width: 8, height: 8, borderRadius: '50%', border: 'none',
                          background: t.isActive ? '#4ade80' : 'color-mix(in srgb, var(--text-muted) 40%, transparent)',
                          cursor: 'pointer', transition: 'all 0.15s', padding: 0,
                          boxShadow: t.isActive ? '0 0 0 2px color-mix(in srgb, #22c55e 20%, transparent)' : 'none',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.schema?.pack_id || t.schema?.layout_id || t.variant || t.contentType || formatDate(t.createdAt)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── detail drawer (slides up from bottom / overlays as full-width panel) ── */}
      {selected && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)',
          display: 'flex', alignItems: 'flex-end',
        }} onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}>
          <div style={{
            width: '100%', height: '82vh',
            background: 'var(--bg-card)', borderRadius: '16px 16px 0 0',
            border: '1px solid var(--border-color)', borderBottom: 'none',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 -12px 48px rgba(0,0,0,0.3)',
          }}>
            {/* drag handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px', flexShrink: 0 }}>
              <div style={{ width: 36, height: 4, borderRadius: 99, background: 'var(--border-color)' }} />
            </div>
            <TemplateDetail
              key={selected.id}
              template={selected}
              layoutSchemaMap={layoutSchemaMap}
              layoutCatalog={layoutCatalog}
              onUpdated={handleUpdated}
              onClose={() => setSelected(null)}
              onDuplicate={t => { setDuplicatePrefill(t); setShowCreate(true) }}
            />
          </div>
        </div>
      )}

      {(showCreate || duplicatePrefill) && (
        <CreateModal
          defaultType={activeType}
          prefill={duplicatePrefill}
          layoutSchemaMap={layoutSchemaMap}
          layoutCatalog={layoutCatalog}
          onClose={() => { setShowCreate(false); setDuplicatePrefill(null) }}
          onCreated={handleCreated}
        />
      )}

      {/* ── preview modal ── */}
      {previewTemplate && (
        previewTemplate.type === 'DECK_LAYOUT' ? (
          // Reuse the full DeckLayoutModal — already has Preview + Slots tabs
          <DeckLayoutModal
            schema={previewTemplate.schema ?? {}}
            layoutName={previewTemplate.name}
            slots={previewTemplate.schema?.slots ?? []}
            hasSlots={(previewTemplate.schema?.slots ?? []).length > 0}
            {...getGridDims(previewTemplate.schema?.slots ?? [])}
            onClose={() => setPreviewTemplate(null)}
          />
        ) : (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 500,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }} onClick={e => { if (e.target === e.currentTarget) setPreviewTemplate(null) }}>
          <div style={{
            width: '100%',
            maxWidth: previewTemplate.type === 'DECK_PACK' ? 1100 : 900,
            height: previewTemplate.type === 'DECK_PACK' ? '88vh' : 'auto',
            maxHeight: '90vh',
            background: 'var(--bg-card)',
            borderRadius: 14,
            border: '1px solid var(--border-color)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            {/* modal header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-color)',
              flexShrink: 0,
              background: 'var(--bg-card)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {previewTemplate.type === 'DECK_PACK' && (() => {
                  const tc = previewTemplate.schema?.themeId
                    ? resolveDeckPackTheme(previewTemplate.schema.themeId)
                    : null
                  return tc
                    ? <div style={{ display: 'flex', gap: 3 }}>
                        {[tc.accent, tc.text, tc.bg].map((c, i) => (
                          <div key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: c, border: '1px solid var(--border-color)' }} />
                        ))}
                      </div>
                    : null
                })()}
                <TypePill type={previewTemplate.type} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{previewTemplate.name}</span>
                <ActiveBadge active={previewTemplate.isActive} />
                {previewTemplate.version > 1 && (
                  <span style={{ fontSize: '0.63rem', color: 'var(--text-muted)' }}>v{previewTemplate.version}</span>
                )}
                {previewTemplate.type === 'DECK_PACK' && previewTemplate.schema?.slides?.length > 0 && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>· {previewTemplate.schema.slides.length} slides</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="sa-btn sa-btn--ghost sa-btn--sm"
                  onClick={() => { setPreviewTemplate(null); setSelected(previewTemplate) }}>
                  ✎ Edit
                </button>
                <button onClick={() => setPreviewTemplate(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px 6px', borderRadius: 6, display: 'flex', alignItems: 'center' }}>
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* modal body */}
            {previewTemplate.type === 'DECK_PACK' ? (
              <InlinePackSlideViewer template={previewTemplate} layoutSchemaMap={layoutSchemaMap} />
            ) : (
              <div className="sa-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px' }}>
                <TemplateVisualPreview template={previewTemplate} layoutSchemaMap={layoutSchemaMap} />
              </div>
            )}
          </div>
        </div>
        )
      )}
    </div>
  )
}

