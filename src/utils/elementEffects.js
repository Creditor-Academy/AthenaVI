/**
 * Effects for any slide element: shapes, images, icons, charts, tables, groups…
 * Stored on `content.effect` as `{ type, ...settings }`. Sizes are px at the editor's
 * 900px-wide stage (like font sizes), so a stage laid out wider passes a `scale`.
 *
 * Drawn with CSS `filter: drop-shadow(...)`, which follows the element's visible outline
 * (a circle's shadow is round, a transparent PNG's shadow follows the picture).
 * Text boxes have their own text effects (content.textEffect); these also apply to them when
 * set on a group they belong to.
 */
import { resolveFillCss } from './presentationHelpers'

export const ELEMENT_EFFECT_OPTIONS = [
  { id: 'none', label: 'None' },
  { id: 'shadow', label: 'Shadow' },
  { id: 'lift', label: 'Lift' },
  { id: 'glow', label: 'Glow' },
  { id: 'outline', label: 'Outline' },
  { id: 'echo', label: 'Echo' },
  { id: 'neon', label: 'Neon' },
  { id: 'glitch', label: 'Glitch' },
  { id: 'blur', label: 'Blur' },
]

/** Settings each effect starts with (and falls back to for anything missing). */
export const ELEMENT_EFFECT_DEFAULTS = {
  shadow: { offset: 8, angle: 45, blur: 12, color: '#000000', transparency: 60 },
  lift: { intensity: 50 },
  glow: { size: 14, color: '#FACC15' },
  outline: { thickness: 3, color: '#111827' },
  echo: { offset: 6, color: '#6366F1' },
  neon: { intensity: 70, color: '#EC4899' },
  glitch: { offset: 4 },
  blur: { amount: 4 },
}

/** Slider ranges, shared by the panel and the clamping below. */
export const ELEMENT_EFFECT_RANGES = {
  offset: [0, 40],
  angle: [0, 360],
  blur: [0, 40],
  transparency: [0, 100],
  intensity: [0, 100],
  size: [1, 40],
  thickness: [1, 12],
  amount: [1, 20],
}

const clamp = (value, [min, max], fallback) => {
  const n = Number(value)
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback
}

/** The element's effect with every setting filled in, or null for none / unknown. */
export function normalizeElementEffect(effect) {
  if (!effect || typeof effect !== 'object') return null
  const type = String(effect.type || '').toLowerCase()
  const defaults = ELEMENT_EFFECT_DEFAULTS[type]
  if (!defaults) return null
  const out = { type }
  for (const [key, fallback] of Object.entries(defaults)) {
    if (key === 'color') {
      out.color = typeof effect.color === 'string' && effect.color.trim() ? effect.color.trim() : fallback
    } else {
      out[key] = clamp(effect[key], ELEMENT_EFFECT_RANGES[key], fallback)
    }
  }
  return out
}

export function hasElementEffect(content) {
  return Boolean(normalizeElementEffect(content?.effect))
}

/** Concrete CSS colour (palette tokens / fills resolved), with `alpha` applied when it is hex. */
export function effectColor(color, palette, alpha = 1) {
  const raw = String(color || '').trim()
  const css = /^(#|rgb|hsl)/i.test(raw) ? raw : resolveFillCss(raw, palette || {}, '#000000')
  const solid = typeof css === 'string' && !css.includes('gradient(') ? css : '#000000'
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(solid)
  if (!hex || alpha >= 1) return solid
  const h = hex[1].length === 3 ? hex[1].replace(/./g, (c) => c + c) : hex[1]
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${Number(alpha.toFixed(3))})`
}

const px = (n) => `${Math.round(n * 100) / 100}px`
const drop = (x, y, blur, color) => `drop-shadow(${px(x)} ${px(y)} ${px(blur)} ${color})`

/**
 * CSS `filter` for the element's effect, or undefined.
 * @param {object} content element content (reads `content.effect`)
 * @param {{ palette?: object, scale?: number }} [opts] scale: stage width / 900
 */
export function elementEffectFilter(content, { palette, scale = 1 } = {}) {
  const fx = normalizeElementEffect(content?.effect)
  if (!fx) return undefined
  const k = Number(scale) > 0 ? Number(scale) : 1
  switch (fx.type) {
    case 'shadow': {
      const rad = (fx.angle * Math.PI) / 180
      const color = effectColor(fx.color, palette, 1 - fx.transparency / 100)
      return drop(Math.cos(rad) * fx.offset * k, Math.sin(rad) * fx.offset * k, fx.blur * k, color)
    }
    case 'lift': {
      const i = fx.intensity / 100
      const b1 = (4 + i * 8) * k
      const b2 = (10 + i * 22) * k
      return [
        drop(0, b1 / 2, b1, `rgba(0, 0, 0, ${(0.18 + i * 0.3).toFixed(2)})`),
        drop(0, b2 / 2, b2, `rgba(0, 0, 0, ${(0.08 + i * 0.22).toFixed(2)})`),
      ].join(' ')
    }
    case 'glow': {
      const color = effectColor(fx.color, palette)
      return [drop(0, 0, fx.size * k, color), drop(0, 0, (fx.size / 2) * k, color)].join(' ')
    }
    case 'outline': {
      // Each shadow also copies the ones before it, so four hard shadows grow a solid border.
      const t = fx.thickness * k
      const color = effectColor(fx.color, palette)
      return [drop(t, 0, 0, color), drop(-t, 0, 0, color), drop(0, t, 0, color), drop(0, -t, 0, color)].join(' ')
    }
    case 'echo': {
      // Repeated copies fade: each one is a shadow of a half-transparent copy.
      const o = fx.offset * k
      const color = effectColor(fx.color, palette, 0.55)
      return [drop(o, o, 0, color), drop(o, o, 0, color), drop(o, o, 0, color)].join(' ')
    }
    case 'neon': {
      const i = fx.intensity / 100
      const color = effectColor(fx.color, palette)
      return [
        drop(0, 0, (2 + i * 3) * k, color),
        drop(0, 0, (6 + i * 8) * k, color),
        drop(0, 0, (12 + i * 18) * k, color),
      ].join(' ')
    }
    case 'glitch': {
      const o = fx.offset * k
      return [drop(-o, 0, 0, 'rgba(0, 255, 255, 0.85)'), drop(o, o / 2, 0, 'rgba(255, 0, 255, 0.85)')].join(' ')
    }
    case 'blur':
      return `blur(${px(fx.amount * k)})`
    default:
      return undefined
  }
}

/** Patch for `content`: switch to `type` (keeping that effect's settings when re-picked). */
export function withElementEffectType(content = {}, type) {
  // null, not a deleted key: the editors merge content patches into what is there.
  if (!type || type === 'none' || !ELEMENT_EFFECT_DEFAULTS[type]) return { ...content, effect: null }
  const current = content.effect && typeof content.effect === 'object' ? content.effect : null
  const kept = current?.type === type ? current : {}
  return { ...content, effect: { ...ELEMENT_EFFECT_DEFAULTS[type], ...kept, type } }
}

/** Patch for `content`: change settings of the current effect. */
export function withElementEffectSettings(content = {}, settings = {}) {
  const fx = normalizeElementEffect(content.effect)
  if (!fx) return content
  return { ...content, effect: { ...content.effect, ...settings, type: fx.type } }
}

/**
 * A group draws nothing itself: an effect set on it goes to the elements inside.
 * Returns `{ [childId]: nextContent }` when `nextContent` changes the group's effect, else {}.
 */
export function groupEffectChildPatches(elements = [], group, nextContent = {}) {
  if (group?.type !== 'group' || !Array.isArray(group.childIds)) return {}
  const before = JSON.stringify(group.content?.effect ?? null)
  const after = JSON.stringify(nextContent?.effect ?? null)
  if (before === after) return {}
  const ids = new Set(group.childIds)
  const out = {}
  for (const child of elements) {
    if (!ids.has(child.id) || child.locked) continue
    out[child.id] = { ...(child.content || {}), effect: nextContent.effect ? { ...nextContent.effect } : null }
  }
  return out
}
