/** Empty Brand Kit `data` matching backend BRAND_KIT handoff shape. */
export function emptyBrandKitData() {
  return {
    meta: {
      tagline: '',
      industry: null,
      guidelineProjectId: null,
    },
    colors: [
      { id: 'c1', name: 'Primary (Light)', hex: '#3B82F6' },
      { id: 'c2', name: 'Background (Light)', hex: '#F8FAFC' },
      { id: 'c3', name: 'Text (Light)', hex: '#0F172A' },
      { id: 'c4', name: 'Background (Dark)', hex: '#0F172A' },
      { id: 'c5', name: 'Primary (Dark)', hex: '#60A5FA' },
      { id: 'c6', name: 'Text (Dark)', hex: '#F8FAFC' },
    ],
    colorRoles: {
      bg: 'c2',
      text: 'c3',
      primary: 'c1',
      secondary: 'c1',
      muted: 'c3',
      bgDark: 'c4',
      textDark: 'c6',
      primaryDark: 'c5',
    },
    fonts: {
      heading: {
        fontPairingId: null,
        family: 'Outfit',
        weight: 700,
        sizePx: 40,
        lineHeight: 1.2,
      },
      subheading: {
        fontPairingId: null,
        family: 'Space Grotesk',
        weight: 600,
        sizePx: 20,
        lineHeight: 1.4,
      },
      body: {
        fontPairingId: null,
        family: 'Inter',
        weight: 400,
        sizePx: 14,
        lineHeight: 1.6,
      },
    },
    voice: {
      tone: '',
      audience: '',
      dos: [],
      donts: [],
      vocabulary: [],
    },
    usage: {
      logoClearSpace: '1.5x cap height',
      logoMinSizePx: 24,
      doNot: [],
    },
    chartStyles: { colorIds: ['c1', 'c5'] },
    imageStyle: '',
  }
}

const HEX_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/

export function isValidHex(hex) {
  return HEX_RE.test(String(hex || '').trim())
}

export function newColorId(existing = []) {
  const used = new Set((existing || []).map((c) => c.id))
  let i = 1
  while (used.has(`c${i}`)) i += 1
  return `c${i}`
}

function parseSizePx(value, fallback = 16) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const raw = String(value || '').trim()
  if (!raw) return fallback
  const n = Number.parseFloat(raw.replace(/px$/i, ''))
  return Number.isFinite(n) ? n : fallback
}

function parseWeight(value, fallback = 400) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function parseLineHeight(value, fallback = 1.4) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const raw = String(value || '').trim()
  if (!raw) return fallback
  if (raw.endsWith('px')) {
    const px = Number.parseFloat(raw)
    return Number.isFinite(px) ? Number((px / 16).toFixed(2)) : fallback
  }
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) ? n : fallback
}

/** Normalize one font role to backend-compatible fields (keeps UI-friendly aliases). */
export function normalizeFontRole(role = {}, defaults = {}) {
  const sizePx = parseSizePx(role.sizePx ?? role.size, defaults.sizePx ?? 16)
  const weight = parseWeight(role.weight, defaults.weight ?? 400)
  const lineHeight = parseLineHeight(role.lineHeight, defaults.lineHeight ?? 1.4)
  return {
    fontPairingId: role.fontPairingId ?? defaults.fontPairingId ?? null,
    family: role.family || defaults.family || null,
    weight,
    sizePx,
    lineHeight,
    // UI aliases used by existing tabs
    size: `${sizePx}px`,
  }
}

export function normalizeBrandKitData(data = {}) {
  const empty = emptyBrandKitData()
  const fontsIn = data.fonts || {}
  const colors = Array.isArray(data.colors) && data.colors.length ? data.colors : empty.colors
  const colorRoles = reconcileColorRoles(colors, {
    ...empty.colorRoles,
    ...(data.colorRoles || {}),
  })
  return {
    ...empty,
    ...data,
    meta: {
      ...empty.meta,
      ...(data.meta || {}),
      tagline: data.meta?.tagline ?? data.tagline ?? '',
    },
    colors,
    colorRoles,
    fonts: {
      heading: normalizeFontRole(fontsIn.heading, empty.fonts.heading),
      subheading: normalizeFontRole(
        fontsIn.subheading || fontsIn.tertiary,
        empty.fonts.subheading
      ),
      body: normalizeFontRole(fontsIn.body, empty.fonts.body),
    },
    voice: {
      ...empty.voice,
      ...(data.voice || {}),
      dos: Array.isArray(data.voice?.dos) ? data.voice.dos : [],
      donts: Array.isArray(data.voice?.donts) ? data.voice.donts : [],
      vocabulary: Array.isArray(data.voice?.vocabulary) ? data.voice.vocabulary : [],
    },
    usage: {
      ...empty.usage,
      ...(data.usage || {}),
      doNot: Array.isArray(data.usage?.doNot) ? data.usage.doNot : [],
    },
    chartStyles: {
      colorIds: Array.isArray(data.chartStyles?.colorIds)
        ? data.chartStyles.colorIds.filter((id) => colors.some((c) => c.id === id))
        : empty.chartStyles.colorIds.filter((id) => colors.some((c) => c.id === id)),
    },
    imageStyle: data.imageStyle || '',
  }
}

/**
 * Keep colorRoles pointing at real color ids.
 * Required roles fall back to first palette entries; optional broken refs are dropped.
 */
export function reconcileColorRoles(colors = [], roles = {}) {
  const ids = (colors || []).map((c) => c?.id).filter(Boolean)
  const has = (id) => id && ids.includes(id)
  const pick = (...candidates) => candidates.find((id) => has(id)) || ids[0] || null

  const next = { ...(roles || {}) }
  const required = {
    primary: pick(next.primary, ids[0]),
    bg: pick(next.bg, ids[1], ids[0]),
    text: pick(next.text, ids[2], ids[0]),
  }
  Object.assign(next, required)

  for (const key of ['secondary', 'muted', 'bgDark', 'textDark', 'primaryDark', 'accent']) {
    if (next[key] && !has(next[key])) {
      if (key === 'secondary' || key === 'muted' || key === 'accent') {
        next[key] = pick(required.primary, required.text)
      } else if (key === 'bgDark') {
        next[key] = pick(ids[3], required.text, required.bg)
      } else if (key === 'textDark') {
        next[key] = pick(ids[5], required.bg, required.text)
      } else if (key === 'primaryDark') {
        next[key] = pick(ids[4], required.primary)
      } else {
        delete next[key]
      }
    }
  }

  // Drop any leftover role that still doesn't resolve
  Object.keys(next).forEach((key) => {
    if (next[key] && !has(next[key])) delete next[key]
  })

  return next
}

/** Payload-ready data for POST/PATCH (full object; strips UI-only aliases). */
export function toBrandKitApiData(data) {
  const normalized = normalizeBrandKitData(data)
  const mapFont = (role) => ({
    fontPairingId: role.fontPairingId || null,
    family: role.family || null,
    weight: parseWeight(role.weight, 400),
    sizePx: parseSizePx(role.sizePx ?? role.size, 16),
    lineHeight: parseLineHeight(role.lineHeight, 1.4),
  })
  return {
    meta: {
      tagline: normalized.meta?.tagline || '',
      industry: normalized.meta?.industry ?? null,
      guidelineProjectId: normalized.meta?.guidelineProjectId || null,
    },
    colors: (normalized.colors || []).map((c) => ({
      id: c.id,
      name: c.name,
      hex: String(c.hex || '').trim(),
    })),
    colorRoles: { ...normalized.colorRoles },
    fonts: {
      heading: mapFont(normalized.fonts.heading),
      subheading: mapFont(normalized.fonts.subheading),
      body: mapFont(normalized.fonts.body),
    },
    voice: {
      tone: normalized.voice?.tone || '',
      audience: normalized.voice?.audience || '',
      dos: normalized.voice?.dos || [],
      donts: normalized.voice?.donts || [],
      vocabulary: normalized.voice?.vocabulary || [],
    },
    usage: {
      logoClearSpace: normalized.usage?.logoClearSpace || '1.5x cap height',
      logoMinSizePx: Number(normalized.usage?.logoMinSizePx) || 24,
      doNot: normalized.usage?.doNot || [],
    },
    chartStyles: {
      colorIds: normalized.chartStyles?.colorIds || [],
    },
    imageStyle: normalized.imageStyle || '',
  }
}

/**
 * Client-side validation before create/update.
 * Returns an error string or null if ok.
 */
export function validateBrandKitData(data) {
  const colors = data?.colors || []
  if (colors.length < 2 || colors.length > 32) {
    return 'Brand kit needs between 2 and 32 colors'
  }
  const seen = new Set()
  for (const c of colors) {
    if (!c?.id || !String(c?.name || '').trim()) return 'Each color needs an id and name'
    if (seen.has(c.id)) return `Duplicate color id "${c.id}"`
    seen.add(c.id)
    if (!isValidHex(c.hex)) return `Invalid hex for "${c.name || c.id}" (use #RGB or #RRGGBB)`
  }
  const roles = data?.colorRoles || {}
  for (const key of ['bg', 'text', 'primary']) {
    if (!roles[key] || !seen.has(roles[key])) {
      return `Color role "${key}" must reference a color in the kit`
    }
  }
  for (const key of ['secondary', 'muted', 'bgDark', 'textDark', 'primaryDark', 'accent']) {
    if (roles[key] && !seen.has(roles[key])) {
      return `Color role "${key}" must reference a color in the kit`
    }
  }
  return null
}

export function normalizeBrandKitList(payload) {
  const root = payload?.data ?? payload
  const list = Array.isArray(root)
    ? root
    : root?.brandKits || root?.items || root?.kits || []
  return (list || []).map(normalizeBrandKitSummary).filter(Boolean)
}

export function normalizeBrandKitSummary(kit) {
  if (!kit) return null
  return {
    id: kit.id || kit._id,
    name: kit.name || 'Untitled Brand Kit',
    isDefault: Boolean(kit.isDefault),
    mediaCount: kit.mediaCount ?? kit.media?.length ?? 0,
    updatedAt: kit.updatedAt || kit.updated_at || kit.editedAt || null,
    data: kit.data ? normalizeBrandKitData(kit.data) : null,
    media: Array.isArray(kit.media) ? kit.media : [],
  }
}

export function normalizeBrandKitDetail(payload) {
  const root = payload?.data ?? payload
  const kit = root?.brandKit || root?.kit || root
  if (!kit || (!kit.id && !kit._id && !kit.name && !kit.data)) return null
  const summary = normalizeBrandKitSummary(kit)
  return {
    ...summary,
    data: normalizeBrandKitData(kit.data || {}),
    media: Array.isArray(kit.media) ? kit.media : [],
  }
}

export function normalizeHealth(payload) {
  const root = payload?.data ?? payload
  const health = root?.health || root
  if (!health || typeof health !== 'object') {
    return {
      score: 0,
      label: 'Needs work',
      checks: [],
      missing: [],
      guidelineProjectId: null,
    }
  }
  const score = Number(health.score) || 0
  return {
    score,
    label:
      health.label ||
      (score >= 90
        ? 'Excellent Consistency'
        : score >= 75
          ? 'Good Consistency'
          : score >= 50
            ? 'Fair Consistency'
            : 'Needs work'),
    checks: Array.isArray(health.checks) ? health.checks : [],
    missing: Array.isArray(health.missing) ? health.missing : [],
    guidelineProjectId: health.guidelineProjectId || null,
  }
}

export function formatRelativeTime(iso) {
  if (!iso) return ''
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ''
  const diff = Date.now() - t
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return 'Just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} minute${min === 1 ? '' : 's'} ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`
  const days = Math.floor(hr / 24)
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`
  return new Date(iso).toLocaleDateString()
}

export function canWriteBrandKits(role) {
  const r = String(role || '').toUpperCase()
  return r === 'OWNER' || r === 'ADMIN'
}

export const LOGO_ROLES = [
  'primary',
  'secondary',
  'icon',
  'light',
  'dark',
  'light-mode',
  'dark-mode',
  'with-name-below',
  'with-name-adjacent',
  'black',
  'white',
]

/** Canonical UI cards for the Logos studio tab (API may use aliases). */
export const LOGO_VARIANT_CARDS = [
  {
    role: 'primary',
    label: 'Primary Logo',
    desc: 'Primary brand mark for general use on neutral backgrounds.',
    darkCanvas: false,
  },
  {
    role: 'light',
    label: 'Light Mode',
    desc: 'Optimised for use on light / white backgrounds.',
    darkCanvas: false,
  },
  {
    role: 'dark',
    label: 'Dark Mode',
    desc: 'Optimised for use on dark / black backgrounds.',
    darkCanvas: true,
  },
  {
    role: 'with-name-below',
    label: 'With Name Below',
    desc: 'Mark stacked above the brand wordmark.',
    darkCanvas: false,
  },
  {
    role: 'with-name-adjacent',
    label: 'With Name Adjacent',
    desc: 'Mark and wordmark side-by-side (horizontal lockup).',
    darkCanvas: false,
  },
  {
    role: 'black',
    label: 'Black / Monochrome',
    desc: 'Single-colour black version for light backgrounds and print.',
    darkCanvas: false,
  },
  {
    role: 'white',
    label: 'White / Reversed',
    desc: 'Single-colour white version for dark backgrounds and overlays.',
    darkCanvas: true,
  },
]

/** Roles requested from AI logo-variants apply (wordmarks are composed client-side). */
export const LOGO_VARIANT_APPLY_ROLES = ['light', 'dark', 'black', 'white']

/** Roles composed on the client from the primary mark + kit typography. */
export const LOGO_WORDMARK_ROLES = ['with-name-below', 'with-name-adjacent']

/**
 * Normalize logo role aliases so UI cards match API media.
 * primary ↔ main, light ↔ light-mode, dark ↔ dark-mode
 */
export function normalizeLogoRole(role) {
  const r = String(role || '')
    .trim()
    .toLowerCase()
  if (r === 'main') return 'primary'
  if (r === 'light-mode') return 'light'
  if (r === 'dark-mode') return 'dark'
  return r
}

export function logoRolesMatch(a, b) {
  return normalizeLogoRole(a) === normalizeLogoRole(b)
}

export function findLogoMedia(mediaList, role) {
  const list = Array.isArray(mediaList) ? mediaList : []
  return list.find((m) => {
    const kind = String(m.kind || m.type || '').toLowerCase()
    if (kind && kind !== 'logo') return false
    return logoRolesMatch(m.role || m.name, role)
  })
}

export const MEDIA_KINDS = ['logo', 'photo', 'graphic', 'mockup']

export const MOCKUP_CATEGORY_ORDER = ['desk', 'apparel', 'digital', 'packaging', 'signage']

export const MOCKUP_CATEGORY_LABELS = {
  desk: 'Desk',
  apparel: 'Apparel',
  digital: 'Digital',
  packaging: 'Packaging',
  signage: 'Signage',
}

/** Dispatch so header / billing widgets refresh Athena Credits. */
export function refreshEditorCredits() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('editor-credits-refresh'))
}
