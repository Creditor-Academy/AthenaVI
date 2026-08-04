import { useCallback, useEffect, useRef, useState } from 'react'
import { Search, Plus, X, LayoutTemplate, CheckCircle2, XCircle } from 'lucide-react'
import superadminService, { SuperadminApiError } from '../../../../services/superadminService'
import { formatDate } from './superadminUtils'
import '../../../../pages/AdminPortal/SuperadminPortal.css'

// ─── constants ────────────────────────────────────────────────────────────────

const TEMPLATE_TYPES = [
  { id: 'DECK_LAYOUT', label: 'Deck Layouts', description: 'Single-slide layouts (grid + slots) used by the AI PPT editor' },
  { id: 'DECK_PACK',   label: 'Deck Packs',   description: 'Multi-slide branded packs referencing layouts + a theme' },
  { id: 'VIDEO_SCENE', label: 'Video Scenes',  description: 'Video editor scene templates for the video project editor' },
]

const CONTENT_TYPES = [
  'title', 'agenda', 'bullet_list', 'comparison', 'stat', 'quote',
  'image+text', 'timeline', 'team', 'chart', 'closing', 'section_divider',
]

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

// All 39 seeded layout ids — used as autocomplete hints in DECK_PACK slide list
const SEEDED_LAYOUT_IDS = [
  'title_centered_v1', 'title_left_accent_v2', 'title_hero_image_v3',
  'agenda_numbered_v1', 'agenda_two_column_v2', 'agenda_side_image_v3',
  'bullet_list_classic_v1', 'bullet_list_dense_v2', 'bullet_list_cards_v3',
  'numbered_four_up_v1', 'policy_numbered_split_v1', 'achievement_three_up_v1',
  'comparison_side_by_side_v1', 'comparison_pros_cons_v2', 'comparison_table_v3',
  'stat_big_number_v1', 'stat_three_up_v2', 'stat_with_context_v3',
  'quote_centered_v1', 'quote_portrait_v2', 'quote_banner_v3',
  'image_text_split_v1', 'image_text_split_v2', 'image_text_overlay_v3',
  'timeline_horizontal_v1', 'timeline_vertical_v2', 'timeline_alternating_v3',
  'team_grid_four_v1', 'team_featured_lead_v2', 'team_row_v3',
  'chart_full_width_v1', 'chart_with_callouts_v2', 'chart_compact_v3',
  'closing_centered_cta_v1', 'closing_contact_v2', 'closing_thank_you_image_v3',
  'section_divider_centered_v1', 'section_divider_numbered_v2', 'section_divider_band_v3',
]

const DECK_LAYOUT_PLACEHOLDER = JSON.stringify({
  layout_id: 'my_layout_v1',
  content_type: 'title',
  grid: '12-col',
  slots: [
    { id: 'title',    region: 'cols 2-11, rows 4-7', max_lines: 3, role: 'heading' },
    { id: 'subtitle', region: 'cols 2-11, rows 8-9',  max_lines: 2, role: 'subheading' },
  ],
}, null, 2)

const DECK_PACK_PLACEHOLDER = JSON.stringify({
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
  slides: [
    {
      order: 1,
      layout_id: 'title_centered_v1',
      contentType: 'title',
      intent: 'Hook the audience with a strong opening statement',
      designTokens: {
        backgroundStyle: 'gradient',
        accentPosition: 'bottom-bar',
        overlayOpacity: 0.4,
        textContrast: 'high',
      },
      generationHints: { maxTitleWords: 8, maxBodyWords: 20 },
      placeholder: { title: 'Presentation Title', subtitle: 'Tagline or company name' },
    },
    {
      order: 2,
      layout_id: 'bullet_list_classic_v1',
      contentType: 'bullet_list',
      intent: 'List the top 3-4 key points concisely',
      designTokens: { backgroundStyle: 'solid', accentPosition: 'left-bar' },
      generationHints: { maxTitleWords: 6, maxBodyWords: 60, itemCountMin: 3, itemCountMax: 4 },
      placeholder: { title: 'Key Points', bullets: ['Point one', 'Point two', 'Point three'] },
    },
    {
      order: 3,
      layout_id: 'closing_centered_cta_v1',
      contentType: 'closing',
      intent: 'End with a clear call-to-action',
      designTokens: { backgroundStyle: 'gradient', accentPosition: 'top-bar' },
      generationHints: { maxTitleWords: 6, maxBodyWords: 30 },
      placeholder: { title: 'Thank You', subtitle: 'contact@company.com' },
    },
  ],
  generationDefaults: {
    density: 'balanced',
    imageType: 'ai',
    imageStyle: 'photo',
    preferVisuals: true,
    layoutWhitelist: ['title_centered_v1', 'bullet_list_classic_v1', 'closing_centered_cta_v1'],
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
  },
}, null, 2)

const VIDEO_SCENE_PLACEHOLDER = JSON.stringify({
  version: 1,
  videoSettings: { fps: 30, width: 1920, height: 1080 },
  scene: {
    durationInFrames: 150,
    background: { type: 'color', value: '#0B1220' },
    elements: [],
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

function schemaPlaceholder(type) {
  if (type === 'DECK_LAYOUT') return DECK_LAYOUT_PLACEHOLDER
  if (type === 'DECK_PACK')   return DECK_PACK_PLACEHOLDER
  return VIDEO_SCENE_PLACEHOLDER
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function parseJsonSafe(str) {
  try { return { ok: true, value: JSON.parse(str) } }
  catch (e) { return { ok: false, error: e.message } }
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
  }
  const c = colors[type] || colors.DECK_LAYOUT
  return (
    <span style={{
      padding: '1px 7px', borderRadius: 999, fontSize: '0.6rem', fontWeight: 700,
      letterSpacing: '0.05em', textTransform: 'uppercase',
      background: c.bg, color: c.color,
    }}>
      {type === 'DECK_LAYOUT' ? 'Layout' : type === 'DECK_PACK' ? 'Pack' : 'Video'}
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

function CreateModal({ onClose, onCreated, defaultType, prefill }) {
  const resolvedType = prefill?.type || defaultType || 'DECK_LAYOUT'
  const [type, setType]             = useState(resolvedType)
  const [name, setName]             = useState(prefill ? `${prefill.name} (copy)` : '')
  const [contentType, setContentType] = useState(prefill?.contentType || '')
  const [variant, setVariant]       = useState(prefill?.variant || '')
  const [isActive, setIsActive]     = useState(true)
  const [schemaStr, setSchemaStr]   = useState(() =>
    prefill?.schema ? JSON.stringify(prefill.schema, null, 2) : schemaPlaceholder(resolvedType)
  )
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  // swap placeholder when type changes — only if not a duplicate
  useEffect(() => { if (!prefill) setSchemaStr(schemaPlaceholder(type)) }, [type]) // eslint-disable-line

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const { ok, value, error: jsonErr } = parseJsonSafe(schemaStr)
    if (!ok) { setError(`Schema is not valid JSON: ${jsonErr}`); return }
    if (!name.trim()) { setError('Name is required'); return }
    setLoading(true)
    try {
      const created = await superadminService.createTemplate({
        type, name: name.trim(),
        contentType: type === 'DECK_PACK' ? 'pack' : (contentType.trim() || undefined),
        variant: variant.trim() || undefined,
        isActive, schema: value,
      })
      onCreated(created)
    } catch (err) {
      setError(err instanceof SuperadminApiError ? err.message : 'Failed to create template')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        width: 'min(680px, 95vw)', maxHeight: '90vh',
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
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{prefill ? 'Duplicate template' : 'Create template'}</h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {prefill ? `Duplicating "${prefill.name}" — edit before saving` : 'Add a new layout, pack, or video scene to the platform catalog'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* scrollable body */}
        <form onSubmit={handleSubmit} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px' }}>
          {error && <div className="sa-alert sa-alert--error" style={{ marginBottom: 16 }}>{error}</div>}

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
                <select className="sa-select" value={contentType} onChange={e => setContentType(e.target.value)}
                  disabled={loading} style={{ width: '100%', boxSizing: 'border-box' }}>
                  <option value="">— select —</option>
                  {CONTENT_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="sa-field">
                <label>VARIANT</label>
                <input className="sa-input" value={variant} onChange={e => setVariant(e.target.value)}
                  placeholder="e.g. v1, v2" disabled={loading}
                  style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
            </div>
          )}
          {/* variant (pack_id alias) for DECK_PACK */}
          {type === 'DECK_PACK' && (
            <div className="sa-field" style={{ marginBottom: 14 }}>
              <label>PACK ID / VARIANT</label>
              <input className="sa-input" value={variant} onChange={e => setVariant(e.target.value)}
                placeholder="e.g. corp_pitch_midnight" disabled={loading}
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
          {type === 'DECK_PACK' && (
            <div style={{ padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'color-mix(in srgb, var(--bg-card) 60%, transparent)', marginBottom: 4 }}>
              <p style={{ margin: '0 0 10px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quick helpers — set inside schema JSON</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>THEME ID</label>
                  <select className="sa-select" style={{ width: '100%', boxSizing: 'border-box', fontSize: '0.8rem' }} defaultValue=""
                    onChange={e => { if (!e.target.value) return; try { const p = JSON.parse(schemaStr); p.themeId = e.target.value; setSchemaStr(JSON.stringify(p, null, 2)) } catch {} }}>
                    <option value="">— pick to inject into schema —</option>
                    {THEME_OPTIONS.map(t => <option key={t.id} value={t.id}>{t.label} ({t.id})</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>ASPECT RATIO</label>
                  <select className="sa-select" style={{ width: '100%', boxSizing: 'border-box', fontSize: '0.8rem' }} defaultValue=""
                    onChange={e => { if (!e.target.value) return; try { const p = JSON.parse(schemaStr); p.aspectRatio = e.target.value; setSchemaStr(JSON.stringify(p, null, 2)) } catch {} }}>
                    <option value="">— pick to inject —</option>
                    {['16:9', '4:3', '9:16'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <details style={{ marginTop: 10 }}>
                <summary style={{ fontSize: '0.7rem', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>39 seeded layout_ids reference</summary>
                <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: '3px 6px' }}>
                  {SEEDED_LAYOUT_IDS.map(id => (
                    <span key={id} style={{ fontSize: '0.63rem', fontFamily: 'monospace', color: 'var(--text-muted)', background: 'color-mix(in srgb, var(--border-color) 40%, transparent)', padding: '1px 5px', borderRadius: 4 }}>{id}</span>
                  ))}
                </div>
              </details>
            </div>
          )}

          {/* schema */}
          <JsonEditor label="SCHEMA (JSON) *" value={schemaStr} onChange={setSchemaStr}
            placeholder={schemaPlaceholder(type)} disabled={loading} />

          {/* footer actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button type="button" className="sa-btn" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="sa-btn sa-btn--primary" disabled={loading}>
              {loading ? <><span className="sa-spinner" style={{ width: 14, height: 14 }} /> {prefill ? 'Duplicating…' : 'Creating…'}</> : (prefill ? 'Save duplicate' : 'Create template')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Visual preview components ───────────────────────────────────────────────

// Parse "cols 2-11, rows 4-7" → { c1, c2, r1, r2 }
function parseRegion(region) {
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

// Slot colour palette — consistent per slot id
const SLOT_COLORS = [
  { fill: 'rgba(99,102,241,0.18)',  stroke: 'rgba(99,102,241,0.7)',  text: '#818cf8' },
  { fill: 'rgba(34,197,94,0.15)',   stroke: 'rgba(34,197,94,0.65)',  text: '#4ade80' },
  { fill: 'rgba(251,191,36,0.15)',  stroke: 'rgba(251,191,36,0.65)', text: '#fbbf24' },
  { fill: 'rgba(236,72,153,0.15)',  stroke: 'rgba(236,72,153,0.65)', text: '#f472b6' },
  { fill: 'rgba(14,165,233,0.15)',  stroke: 'rgba(14,165,233,0.65)', text: '#38bdf8' },
  { fill: 'rgba(168,85,247,0.15)',  stroke: 'rgba(168,85,247,0.65)', text: '#c084fc' },
]

// ─── Deck Layout canvas (shared by thumbnail + modal) ────────────────────────

function DeckLayoutCanvas({ schema, COLS, ROWS, slots, hasSlots, large }) {
  return (
    <div style={{
      position: 'relative', width: '100%', aspectRatio: '16/9',
      background: large ? '#0c1424' : 'color-mix(in srgb, var(--bg-card) 30%, #0a0f1e)',
      overflow: 'hidden',
    }}>
      {/* grid guide lines */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: large ? 0.08 : 0.12 }}>
        {Array.from({ length: COLS - 1 }, (_, i) => (
          <line key={`c${i}`} x1={`${((i + 1) / COLS) * 100}%`} y1="0" x2={`${((i + 1) / COLS) * 100}%`} y2="100%" stroke="white" strokeWidth="1" />
        ))}
        {Array.from({ length: ROWS - 1 }, (_, i) => (
          <line key={`r${i}`} x1="0" y1={`${((i + 1) / ROWS) * 100}%`} x2="100%" y2={`${((i + 1) / ROWS) * 100}%`} stroke="white" strokeWidth="1" />
        ))}
      </svg>
      {/* col/row number labels when large */}
      {large && (
        <>
          {Array.from({ length: COLS }, (_, i) => (
            <span key={`cl${i}`} style={{ position: 'absolute', top: 4, left: `${((i + 0.5) / COLS) * 100}%`, transform: 'translateX(-50%)', fontSize: '0.55rem', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', pointerEvents: 'none' }}>{i + 1}</span>
          ))}
          {Array.from({ length: ROWS }, (_, i) => (
            <span key={`rl${i}`} style={{ position: 'absolute', left: 4, top: `${((i + 0.5) / ROWS) * 100}%`, transform: 'translateY(-50%)', fontSize: '0.55rem', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', pointerEvents: 'none' }}>{i + 1}</span>
          ))}
        </>
      )}
      {!hasSlots && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.25)', fontSize: large ? '1rem' : '0.75rem' }}>
          No slots defined
        </div>
      )}
      {slots.map((slot, i) => {
        const reg = parseRegion(slot.region)
        if (!reg) return null
        const color = SLOT_COLORS[i % SLOT_COLORS.length]
        const x = ((reg.c1 - 1) / COLS) * 100
        const y = ((reg.r1 - 1) / ROWS) * 100
        const w = ((reg.c2 - reg.c1 + 1) / COLS) * 100
        const h = ((reg.r2 - reg.r1 + 1) / ROWS) * 100
        return (
          <div key={slot.id ?? i} style={{
            position: 'absolute', left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`,
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

// ─── Deck Layout full-screen modal ───────────────────────────────────────────

function DeckLayoutModal({ schema, layoutName, slots, hasSlots, COLS, ROWS, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1200,
      background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column',
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>

      {/* ── top bar — same style as DeckPackSlideModal ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* slot colour swatches as identity instead of theme swatches */}
          <div style={{ display: 'flex', gap: 4 }}>
            {slots.slice(0, 4).map((_, i) => (
              <div key={i} style={{ width: 14, height: 14, borderRadius: 4, background: SLOT_COLORS[i % SLOT_COLORS.length].fill, border: `1px solid ${SLOT_COLORS[i % SLOT_COLORS.length].stroke}` }} />
            ))}
          </div>
          <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{layoutName}</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>· {slots.length} slots</span>
          {schema?.content_type && (
            <span style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.35)', color: '#818cf8', fontSize: '0.7rem', fontWeight: 700 }}>
              {schema.content_type}
            </span>
          )}
          {schema?.grid && (
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontFamily: 'monospace' }}>{schema.grid}</span>
          )}
        </div>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={15} />
        </button>
      </div>

      {/* ── main: big centered slide canvas ── */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 20px' }}>
        <div style={{ width: '100%', maxWidth: 900, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {/* slide */}
          <div style={{
            width: '100%', borderRadius: 12, overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.25)',
          }}>
            <DeckLayoutCanvas schema={schema} COLS={COLS} ROWS={ROWS} slots={slots} hasSlots={hasSlots} large />
          </div>
          {/* layout id badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ padding: '3px 10px', borderRadius: 99, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {schema?.content_type ?? 'layout'}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontFamily: 'monospace' }}>
              {schema?.layout_id ?? ''}
            </span>
          </div>
        </div>
      </div>

      {/* ── slot legend strip removed — canvas only ── */}
    </div>
  )
}

function DeckLayoutPreview({ schema, layoutName }) {
  const [showModal, setShowModal] = useState(false)
  const COLS = 12
  const ROWS = 10
  const slots = schema?.slots ?? []
  const hasSlots = slots.length > 0

  return (
    <>
      {/* ── meta pills ── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        {[['Layout ID', schema?.layout_id], ['Grid', schema?.grid], ['Content type', schema?.content_type]]
          .filter(([, v]) => v)
          .map(([label, val]) => (
            <div key={label} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'monospace' }}>{val}</div>
            </div>
          ))}
      </div>

      {/* ── thumbnail + open button ── */}
      <div style={{ marginBottom: 16 }}>
        <button type="button" onClick={() => setShowModal(true)}
          style={{
            cursor: 'pointer', border: 'none', padding: 0, background: 'none',
            width: '100%', maxWidth: 380, display: 'block',
            borderRadius: 10, overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.55)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)' }}>
          <DeckLayoutCanvas schema={schema} COLS={COLS} ROWS={ROWS} slots={slots} hasSlots={hasSlots} />
        </button>
        <button className="sa-btn sa-btn--primary" style={{ marginTop: 12 }} onClick={() => setShowModal(true)}>
          ▶ Preview layout
        </button>
      </div>

      {/* ── slot legend ── */}
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

      {showModal && <DeckLayoutModal schema={schema} layoutName={layoutName} slots={slots} hasSlots={hasSlots} COLS={COLS} ROWS={ROWS} onClose={() => setShowModal(false)} />}
    </>
  )
}

// ─── Slide card renderer (used in both thumbnail strip and modal) ─────────────

function SlideCard({ theme, slide, index, ph, icon, imageUrl, large }) {
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
      width: '100%', aspectRatio: '16/9',
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
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: large ? 8 : 3 }}>
          {phStats.length > 0 ? (
            large ? (
              <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end' }}>
                {phStats.map((s, j) => (
                  <div key={j} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: `${fs * (j === 0 ? 6 : 4.5)}rem`, fontWeight: 900, color: theme.accent, lineHeight: 1 }}>{s.value ?? '—'}</div>
                    <div style={{ fontSize: `${fs * 1.5}rem`, color: theme.text, opacity: 0.55 }}>{s.label ?? ''}</div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div style={{ fontSize: `${fs * 6}rem`, fontWeight: 900, color: theme.accent, lineHeight: 1 }}>{phStats[0]?.value ?? '—'}</div>
                <div style={{ fontSize: `${fs * 1.8}rem`, color: theme.text, opacity: 0.6 }}>{ph || phStats[0]?.label || 'Metric'}</div>
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
            {[0.55, 0.4, 0.35].map((op, j) => <div key={j} style={{ height: large ? 8 : 3, borderRadius: 2, background: theme.text, opacity: op, width: `${80 - j * 15}%` }} />)}
          </div>
        </div>
      )}

      {/* ── Closing ── */}
      {isClosing && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: large ? 10 : 3 }}>
          <div style={{ fontSize: `${fs * 3}rem`, fontWeight: 800, color: theme.text }}>{phCta || ph || 'Thank You'}</div>
          <div style={{ width: '40%', height: large ? 3 : 1, background: theme.accent, borderRadius: 99 }} />
          <div style={{ fontSize: `${fs * 1.6}rem`, color: theme.accent }}>{phContact || 'contact@company.com'}</div>
        </div>
      )}

      {/* ── Section divider ── */}
      {isDivider && (
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${theme.accent}22, ${theme.surface ?? theme.bg})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: large ? 8 : 3 }}>
          <div style={{ width: '60%', height: large ? 3 : 1.2, background: theme.accent, borderRadius: 99 }} />
          <div style={{ fontSize: `${fs * 2.8}rem`, fontWeight: 700, color: theme.text, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{ph || 'Section'}</div>
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
          <div style={{ fontSize: `${fs * 2}rem`, fontWeight: 700, color: theme.text, marginBottom: large ? 4 : 1 }}>{ph || 'Comparison'}</div>
          <div style={{ display: 'flex', gap: large ? 12 : 4, flex: 1 }}>
            {['Option A', 'Option B'].map((opt, j) => (
              <div key={j} style={{ flex: 1, padding: large ? 12 : 4, borderRadius: large ? 8 : 3, background: j === 0 ? `${theme.accent}15` : `${theme.surface ?? theme.bg}`, border: `${large ? 1.5 : 0.6}px solid ${theme.accent}${j === 0 ? '55' : '22'}`, display: 'flex', flexDirection: 'column', gap: large ? 6 : 2 }}>
                <div style={{ fontSize: `${fs * 1.8}rem`, fontWeight: 700, color: j === 0 ? theme.accent : theme.text, opacity: j === 0 ? 1 : 0.6 }}>{opt}</div>
                {[0.5, 0.4, 0.35].map((op, k) => <div key={k} style={{ height: large ? 7 : 2.5, borderRadius: 2, background: theme.text, opacity: op, width: '90%' }} />)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Timeline ── */}
      {isTimeline && (
        <div style={{ position: 'absolute', inset: 0, padding: `${large ? 6 : 10}%`, display: 'flex', flexDirection: 'column', gap: large ? 8 : 3 }}>
          <div style={{ fontSize: `${fs * 2}rem`, fontWeight: 700, color: theme.text }}>{ph || 'Timeline'}</div>
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

function DeckPackSlideModal({ slides, theme, packName, previewImageUrl, media, initialSlide, onClose }) {
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
      position: 'fixed', inset: 0, zIndex: 1200,
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
                  <SlideCard theme={theme} slide={s} index={i} ph={sph} icon={sicon} imageUrl={imageUrl} large={false} />
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
                  <SlideCard theme={theme} slide={s} index={i} ph={sph} icon={sicon} imageUrl={imageUrl} large={true} />
                </div>
                {/* intent / AI brief if present */}
                {(s.intent || s.generationHints?.imagePromptStyle) && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 12px', borderRadius: 7, background: `${theme.accent}0f`, border: `1px solid ${theme.accent}22` }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: theme.accent, opacity: 0.7, paddingTop: 1, flexShrink: 0 }}>AI Intent</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
                      {s.intent && <span style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', lineHeight: 1.5 }}>{s.intent}</span>}
                      {s.generationHints?.imagePromptStyle && (
                        <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ opacity: 0.5 }}>🖼</span> {s.generationHints.imagePromptStyle}
                        </span>
                      )}
                    </div>
                  </div>
                )}
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

const THEME_COLORS = {
  midnight_blue: { bg: '#0B1220', surface: '#1e2a4a', accent: '#3b82f6', text: '#f8fafc' },
  clean_light:   { bg: '#ffffff', surface: '#f1f5f9', accent: '#6366f1', text: '#0f172a' },
  forest_slate:  { bg: '#1a2e1a', surface: '#2d4a2d', accent: '#22c55e', text: '#f0fdf4' },
  warm_sand:     { bg: '#faf7f0', surface: '#f5efe0', accent: '#d97706', text: '#1c1917' },
  charcoal_gold: { bg: '#1c1c1c', surface: '#2a2a2a', accent: '#d4af37', text: '#f5f5f5' },
  ocean_mist:    { bg: '#0d2137', surface: '#1a3a5c', accent: '#0ea5e9', text: '#e0f2fe' },
  violet_noir:   { bg: '#0f0a1e', surface: '#1e1040', accent: '#a855f7', text: '#f5f3ff' },
  paper_ink:     { bg: '#fefce8', surface: '#fef9c3', accent: '#374151', text: '#111827' },
  sunset_coral:  { bg: '#fff1ee', surface: '#fde8e4', accent: '#f43f5e', text: '#1c0a09' },
  mint_clinic:   { bg: '#f0fdf4', surface: '#dcfce7', accent: '#10b981', text: '#052e16' },
}

const CONTENT_TYPE_ICONS = {
  title: '🎯', agenda: '📋', bullet_list: '•', comparison: '⚖️',
  stat: '📊', quote: '💬', 'image+text': '🖼', timeline: '⏱',
  team: '👥', chart: '📈', closing: '✅', section_divider: '—',
}

function DeckPackPreview({ schema, packName, previewImageUrl, media }) {
  const slides = schema?.slides ?? []
  const theme = THEME_COLORS[schema?.themeId] ?? THEME_COLORS.midnight_blue
  const [showModal, setShowModal] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)

  return (
    <>
      {/* ── preview image thumbnail or color fallback ── */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ margin: '0 0 8px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pack thumbnail</p>
        <div style={{ width: '100%', maxWidth: 320, aspectRatio: '16/9', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', position: 'relative' }}>
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
                  <SlideCard theme={theme} slide={slide} index={i} ph={ph} icon={icon} imageUrl={slideImageUrl} large={false} />
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
          packName={packName ?? schema?.pack_id ?? 'Pack'}
          previewImageUrl={previewImageUrl}
          media={media}
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
  const elements = scene.elements ?? []
  const bg = scene.background

  const bgStyle = bg?.type === 'color'
    ? { background: bg.value ?? '#0f172a' }
    : bg?.type === 'gradient'
      ? { background: `linear-gradient(135deg, ${bg.from ?? '#0f172a'}, ${bg.to ?? '#1e3a5f'})` }
      : { background: '#0f172a' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* canvas preview */}
      <div>
        <p style={{ margin: '0 0 10px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Scene canvas
        </p>
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

      {/* meta */}
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

function TemplateVisualPreview({ template }) {
  const schema = template.schema ?? {}
  const previewImageUrl = getTemplatePreviewUrl(template)
  const media = Array.isArray(template.media) ? template.media : []
  if (template.type === 'DECK_LAYOUT') return <DeckLayoutPreview schema={schema} layoutName={template.name} />
  if (template.type === 'DECK_PACK')   return <DeckPackPreview schema={schema} packName={template.name} previewImageUrl={previewImageUrl} media={media} />
  return <VideoScenePreview schema={schema} />
}

// ─── Preview modal dispatcher ─────────────────────────────────────────────────

function PreviewModal({ template, onClose }) {
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
    const COLS = 12, ROWS = 10
    const slots = schema?.slots ?? []
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
    const theme = THEME_COLORS[schema?.themeId] ?? THEME_COLORS.midnight_blue
    const slides = schema?.slides ?? []
    return (
      <DeckPackSlideModal
        slides={slides}
        theme={theme}
        packName={template.name}
        previewImageUrl={getTemplatePreviewUrl(template)}
        media={Array.isArray(template.media) ? template.media : []}
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

function TemplateMediaTab({ templateId }) {
  const [media, setMedia]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [uploading, setUploading]   = useState(false)
  const [uploadErr, setUploadErr]   = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const fileInputRef                = useRef(null)
  const [upKind, setUpKind]         = useState('photo')
  const [upSlotHint, setUpSlotHint] = useState('')
  const [upName, setUpName]         = useState('')
  const [upFile, setUpFile]         = useState(null)

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

  async function handleUpload(e) {
    e.preventDefault()
    if (!upFile) { setUploadErr('Select a file first'); return }
    setUploadErr(''); setUploading(true)
    try {
      await superadminService.uploadTemplateMedia(templateId, {
        file: upFile, kind: upKind,
        slotHint: upSlotHint.trim() || undefined,
        name: upName.trim() || undefined,
      })
      await load()
      setUpFile(null); setUpSlotHint(''); setUpName('')
      if (fileInputRef.current) fileInputRef.current.value = ''
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '16px' }}>
      <div style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid color-mix(in srgb, var(--primary) 25%, var(--border-color))', background: 'color-mix(in srgb, var(--primary) 6%, transparent)', fontSize: '0.77rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--text-main)' }}>Template media</strong> — baked photos injected into image elements on pack clone.
        Use <code style={{ fontSize: '0.72rem', background: 'color-mix(in srgb, var(--primary) 10%, transparent)', padding: '1px 4px', borderRadius: 3 }}>slotHint: slide:N</code> to map to a specific slide.
        Use <code style={{ fontSize: '0.72rem', background: 'color-mix(in srgb, var(--primary) 10%, transparent)', padding: '1px 4px', borderRadius: 3 }}>kind: preview</code> for the pack picker thumbnail.
      </div>

      <form onSubmit={handleUpload} style={{ padding: '14px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Upload media</p>
        {uploadErr && <div className="sa-alert sa-alert--error">{uploadErr}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>KIND *</label>
            <select className="sa-select" value={upKind} onChange={e => setUpKind(e.target.value)} disabled={uploading} style={{ width: '100%', boxSizing: 'border-box' }}>
              <option value="photo">photo — slide image</option>
              <option value="preview">preview — pack thumbnail</option>
              <option value="graphic">graphic — decoration</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>SLOT HINT</label>
            <input className="sa-input" value={upSlotHint} onChange={e => setUpSlotHint(e.target.value)} placeholder="e.g. slide:1" disabled={uploading} style={{ width: '100%', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>NAME</label>
            <input className="sa-input" value={upName} onChange={e => setUpName(e.target.value)} placeholder="optional label" disabled={uploading} style={{ width: '100%', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" disabled={uploading}
            onChange={e => setUpFile(e.target.files?.[0] ?? null)} style={{ flex: 1, fontSize: '0.78rem', color: 'var(--text-main)' }} />
          <button type="submit" className="sa-btn sa-btn--primary" disabled={uploading || !upFile} style={{ flexShrink: 0 }}>
            {uploading ? <><span className="sa-spinner" style={{ width: 13, height: 13 }} /> Uploading…</> : '↑ Upload'}
          </button>
        </div>
        {upFile && <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>{upFile.name} · {(upFile.size / 1024).toFixed(0)} KB</p>}
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
              return (
                <div key={m.id} style={{ borderRadius: 10, border: '1px solid var(--border-color)', overflow: 'hidden', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ aspectRatio: '16/9', background: 'color-mix(in srgb, var(--border-color) 30%, transparent)', position: 'relative', overflow: 'hidden' }}>
                    {m.url ? (
                      <img src={m.url} alt={m.name || m.kind} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={e => { e.currentTarget.style.display = 'none' }} />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', opacity: 0.2 }}>🖼</div>
                    )}
                    <span style={{ position: 'absolute', top: 5, left: 5, padding: '1px 6px', borderRadius: 4, fontSize: '0.58rem', fontWeight: 700, background: 'rgba(0,0,0,0.65)', color: kc.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kc.label}</span>
                    <button type="button" disabled={isDeleting} onClick={() => handleDelete(m.id)}
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
}

// ─── Detail / edit panel ──────────────────────────────────────────────────────

function TemplateDetail({ template, onUpdated, onClose, onDuplicate }) {
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
          { id: 'media', label: 'Media', onlyFor: ['DECK_PACK', 'DECK_LAYOUT'] },
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
          <TemplateMediaTab templateId={template.id} templateType={template.type} />
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
                  <select className="sa-select" value={contentType} onChange={e => setContentType(e.target.value)} disabled={saving} style={{ width: '100%', boxSizing: 'border-box' }}>
                    <option value="">— none —</option>
                    {CONTENT_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Variant</label>
                  <input className="sa-input" value={variant} onChange={e => setVariant(e.target.value)} disabled={saving} style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
              </div>
            )}
            {/* pack id / variant for DECK_PACK */}
            {template.type === 'DECK_PACK' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Pack ID / Variant</label>
                <input className="sa-input" value={variant} onChange={e => setVariant(e.target.value)} disabled={saving} style={{ width: '100%', boxSizing: 'border-box' }} placeholder="e.g. corp_pitch_midnight" />
              </div>
            )}

            {/* DECK_PACK quick helpers */}
            {template.type === 'DECK_PACK' && (
              <div style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'color-mix(in srgb, var(--bg-card) 60%, transparent)' }}>
                <p style={{ margin: '0 0 8px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quick helpers</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 3 }}>Inject themeId</label>
                    <select className="sa-select" style={{ width: '100%', boxSizing: 'border-box', fontSize: '0.78rem' }} defaultValue=""
                      onChange={e => { if (!e.target.value) return; try { const p = JSON.parse(schemaStr); p.themeId = e.target.value; setSchemaStr(JSON.stringify(p, null, 2)) } catch {} }}>
                      <option value="">— select theme —</option>
                      {THEME_OPTIONS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 3 }}>Inject aspectRatio</label>
                    <select className="sa-select" style={{ width: '100%', boxSizing: 'border-box', fontSize: '0.78rem' }} defaultValue=""
                      onChange={e => { if (!e.target.value) return; try { const p = JSON.parse(schemaStr); p.aspectRatio = e.target.value; setSchemaStr(JSON.stringify(p, null, 2)) } catch {} }}>
                      <option value="">— select —</option>
                      {['16:9', '4:3', '9:16'].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
                <details>
                  <summary style={{ fontSize: '0.68rem', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>39 seeded layout_ids</summary>
                  <div style={{ marginTop: 5, display: 'flex', flexWrap: 'wrap', gap: '2px 5px' }}>
                    {SEEDED_LAYOUT_IDS.map(id => (
                      <span key={id} style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'var(--text-muted)', background: 'color-mix(in srgb, var(--border-color) 40%, transparent)', padding: '1px 4px', borderRadius: 3 }}>{id}</span>
                    ))}
                  </div>
                </details>
              </div>
            )}

            {/* schema */}
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

      {showPreview && <PreviewModal template={template} onClose={() => setShowPreview(false)} />}
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
  const searchTimer = useRef(null)
  const [selected, setSelected]         = useState(null)
  const [showCreate, setShowCreate]     = useState(false)
  const [duplicatePrefill, setDuplicatePrefill] = useState(null)

  const fetchList = useCallback(async (type, activeFilter) => {
    setLoading(true); setListError('')
    try {
      const params = { type }
      if (activeFilter === 'active')   params.isActive = true
      if (activeFilter === 'inactive') params.isActive = false
      const data = await superadminService.listTemplates(params)
      const rows = data.templates ?? data.data ?? (Array.isArray(data) ? data : [])
      setTemplates(rows)
    } catch (err) {
      setListError(err instanceof SuperadminApiError ? err.message : 'Failed to load templates')
      setTemplates([])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { setSelected(null); fetchList(activeType, filterActive) }, [activeType, filterActive, fetchList])

  function handleSearchInput(e) {
    const v = e.target.value; setSearchInput(v)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => setSearch(v), 280)
  }

  const filtered = search.trim()
    ? templates.filter(t =>
        t.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.contentType?.toLowerCase().includes(search.toLowerCase()) ||
        t.variant?.toLowerCase().includes(search.toLowerCase()) ||
        t.schema?.layout_id?.toLowerCase().includes(search.toLowerCase()) ||
        t.schema?.pack_id?.toLowerCase().includes(search.toLowerCase()))
    : templates

  async function handleQuickToggle(e, t) {
    e.stopPropagation()
    try {
      const updated = await superadminService.updateTemplate(t.id, { isActive: !t.isActive })
      const tpl = updated.template ?? updated
      setTemplates(prev => prev.map(x => x.id === tpl.id ? tpl : x))
      if (selected?.id === tpl.id) setSelected(tpl)
    } catch { /* silent */ }
  }

  function handleCreated(created) {
    setShowCreate(false); setDuplicatePrefill(null)
    const template = created.template ?? created
    if (template.type === activeType) { setTemplates(prev => [template, ...prev]); setSelected(template) }
  }
  function handleUpdated(updated) {
    setTemplates(prev => prev.map(t => t.id === updated.id ? updated : t)); setSelected(updated)
  }

  return (
    <div className="sa-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

      {/* ── topbar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 0', gap: 16, flexShrink: 0 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Templates</h2>
          <p style={{ margin: '3px 0 0', fontSize: '0.79rem', color: 'var(--text-muted)' }}>Deck layouts, packs, and video scenes for workspace pickers</p>
        </div>
        <button className="sa-btn sa-btn--primary" onClick={() => setShowCreate(true)} style={{ flexShrink: 0 }}>
          <Plus size={14} strokeWidth={2.5} /> New template
        </button>
      </div>

      {/* ── underline type tabs ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', padding: '0 20px', marginTop: 16, flexShrink: 0 }}>
        {TEMPLATE_TYPES.map(t => (
          <button key={t.id} type="button" onClick={() => setActiveType(t.id)} style={{
            padding: '8px 14px', border: 'none', background: 'none', cursor: 'pointer',
            fontSize: '0.83rem', fontWeight: 600, marginBottom: -1, whiteSpace: 'nowrap',
            color: activeType === t.id ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeType === t.id ? '2px solid var(--primary)' : '2px solid transparent',
            transition: 'color 0.12s',
          }}>
            {t.label}
            {activeType === t.id && filtered.length > 0 && <span style={{ marginLeft: 5, fontSize: '0.67rem', fontWeight: 700, opacity: 0.55 }}>{filtered.length}</span>}
          </button>
        ))}
      </div>

      {/* ── split ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 14, padding: '14px 20px 20px', flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* left list */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, border: '1px solid var(--border-color)', borderRadius: 10, overflow: 'hidden', background: 'var(--bg-card)' }}>
          <div style={{ padding: '7px 7px 0', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
            <div style={{ position: 'relative', marginBottom: 6 }}>
              <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input className="sa-input" placeholder="Search…" value={searchInput} onChange={handleSearchInput}
                style={{ width: '100%', boxSizing: 'border-box', height: 30, paddingLeft: 28, fontSize: '0.79rem', borderRadius: 6 }} />
            </div>
            <div style={{ display: 'flex', gap: 4, paddingBottom: 7 }}>
              {[['all', 'All'], ['active', 'Active'], ['inactive', 'Inactive']].map(([val, label]) => (
                <button key={val} type="button" onClick={() => setFilterActive(val)} style={{
                  padding: '2px 9px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer', border: 'none',
                  background: filterActive === val
                    ? (val === 'active' ? 'color-mix(in srgb, #22c55e 18%, transparent)' : val === 'inactive' ? 'color-mix(in srgb, var(--text-muted) 15%, transparent)' : 'color-mix(in srgb, var(--primary) 15%, transparent)')
                    : 'transparent',
                  color: filterActive === val
                    ? (val === 'active' ? '#4ade80' : val === 'inactive' ? 'var(--text-muted)' : 'var(--primary)')
                    : 'var(--text-muted)',
                  outline: filterActive === val ? `1px solid ${val === 'active' ? '#4ade8044' : val === 'inactive' ? 'var(--border-color)' : 'color-mix(in srgb, var(--primary) 35%, transparent)'}` : 'none',
                }}>{label}</button>
              ))}
            </div>
          </div>

          {listError && <div className="sa-alert sa-alert--error" style={{ margin: '7px', flexShrink: 0 }}>{listError}</div>}

          <ul className="sa-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', margin: 0, padding: 0, listStyle: 'none' }}>
            {loading
              ? Array.from({ length: 7 }).map((_, i) => (
                  <li key={i} style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ height: 11, borderRadius: 3, background: 'var(--border-color)', opacity: 0.45, marginBottom: 5, width: '72%' }} />
                    <div style={{ height: 8, borderRadius: 3, background: 'var(--border-color)', opacity: 0.27, width: '42%' }} />
                  </li>
                ))
              : filtered.length === 0
                ? (
                  <li style={{ padding: '36px 14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.79rem' }}>
                    <LayoutTemplate size={26} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.25 }} />
                    {search ? 'No results' : 'No templates yet'}
                    {!search && <div style={{ marginTop: 8 }}><button className="sa-btn sa-btn--ghost sa-btn--sm" onClick={() => setShowCreate(true)}><Plus size={12} /> Create</button></div>}
                  </li>
                )
                : filtered.map(t => (
                  <li key={t.id}>
                    <button type="button" onClick={() => setSelected(t)} style={{
                      width: '100%', textAlign: 'left', border: 'none', padding: '9px 12px',
                      background: selected?.id === t.id ? 'linear-gradient(90deg, color-mix(in srgb, var(--primary) 10%, transparent), transparent)' : 'transparent',
                      boxShadow: selected?.id === t.id ? 'inset 3px 0 0 var(--primary)' : 'none',
                      cursor: 'pointer', borderBottom: '1px solid var(--border-color)', transition: 'background 0.1s',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        {/* preview thumbnail for DECK_PACK */}
                        {t.type === 'DECK_PACK' && (() => {
                          const url = getTemplatePreviewUrl(t)
                          const fallbackColor = t.schema?.preview?.color
                          const tc = THEME_COLORS[t.schema?.themeId]
                          return (
                            <div style={{ width: 28, height: 16, borderRadius: 3, overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border-color)' }}>
                              {url
                                ? <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                    onError={e => { e.currentTarget.style.display = 'none' }} />
                                : <div style={{ width: '100%', height: '100%', background: fallbackColor ?? (tc ? tc.bg : 'var(--border-color)') }} />
                              }
                            </div>
                          )
                        })()}
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-main)' }}>{t.name}</span>
                        {t.version > 1 && <span style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-muted)', opacity: 0.6, flexShrink: 0 }}>v{t.version}</span>}
                        {/* quick active toggle */}
                        <button type="button" title={t.isActive ? 'Deactivate' : 'Activate'} onClick={e => handleQuickToggle(e, t)}
                          style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 6, border: `1px solid ${t.isActive ? 'color-mix(in srgb, #22c55e 35%, var(--border-color))' : 'var(--border-color)'}`, background: t.isActive ? 'color-mix(in srgb, #22c55e 12%, transparent)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.isActive ? '#4ade80' : 'var(--border-color)', display: 'block' }} />
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: '0.69rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                          {[t.contentType, t.variant].filter(Boolean).join(' · ') || formatDate(t.createdAt)}
                        </span>
                        {t.type !== 'VIDEO_SCENE' && Array.isArray(t.media) && t.media.length > 0 && (
                          <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '1px 5px', borderRadius: 4, background: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)', flexShrink: 0 }}>
                            {t.media.length} media
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                ))
            }
          </ul>

          {filtered.length > 0 && (
            <div style={{ padding: '5px 12px', borderTop: '1px solid var(--border-color)', flexShrink: 0, fontSize: '0.68rem', color: 'var(--text-muted)', opacity: 0.7 }}>
              {filtered.length} template{filtered.length !== 1 ? 's' : ''}{search && ` matching "${search}"`}
            </div>
          )}
        </div>

        {/* right detail */}
        {selected
          ? <TemplateDetail key={selected.id} template={selected} onUpdated={handleUpdated} onClose={() => setSelected(null)} onDuplicate={t => { setDuplicatePrefill(t); setShowCreate(true) }} />
          : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-color)', borderRadius: 10 }}>
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <LayoutTemplate size={30} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.2 }} />
                <p style={{ margin: 0, fontSize: '0.8rem' }}>Select a template to edit</p>
                <p style={{ margin: '4px 0 0', fontSize: '0.72rem', opacity: 0.6 }}>{TEMPLATE_TYPES.find(t => t.id === activeType)?.description}</p>
              </div>
            </div>
          )
        }
      </div>

      {(showCreate || duplicatePrefill) && (
        <CreateModal
          defaultType={activeType}
          prefill={duplicatePrefill}
          onClose={() => { setShowCreate(false); setDuplicatePrefill(null) }}
          onCreated={handleCreated}
        />
      )}
    </div>
  )
}

