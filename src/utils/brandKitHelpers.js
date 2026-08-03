/** Empty Brand Kit `data` matching the backend integration shape. */
export function emptyBrandKitData() {
  return {
    colors: [
      { id: 'c1', name: 'Background', hex: '#0B1220' },
      { id: 'c2', name: 'Primary', hex: '#3B82F6' },
      { id: 'c3', name: 'Text', hex: '#F8FAFC' },
    ],
    colorRoles: {
      bg: 'c1',
      text: 'c3',
      primary: 'c2',
      secondary: 'c2',
      muted: 'c3',
      accent: 'c2',
    },
    fonts: {
      heading: { fontPairingId: null, family: null },
      body: { fontPairingId: null, family: null },
      tertiary: { fontPairingId: null, family: null },
    },
    voice: {
      tone: '',
      audience: '',
      dos: [],
      donts: [],
      vocabulary: [],
    },
    chartStyles: { colorIds: [] },
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

/**
 * Client-side validation before create/update.
 * Returns an error string or null if ok.
 */
export function validateBrandKitData(data) {
  const colors = data?.colors || []
  if (colors.length < 2 || colors.length > 32) {
    return 'Brand kit needs between 2 and 32 colors'
  }
  for (const c of colors) {
    if (!c?.id || !c?.name?.trim()) return 'Each color needs an id and name'
    if (!isValidHex(c.hex)) return `Invalid hex for "${c.name || c.id}" (use #RGB or #RRGGBB)`
  }
  const ids = new Set(colors.map((c) => c.id))
  const roles = data?.colorRoles || {}
  for (const key of ['bg', 'text', 'primary']) {
    if (!roles[key] || !ids.has(roles[key])) {
      return `Color role "${key}" must reference a color in the kit`
    }
  }
  for (const key of ['secondary', 'accent', 'muted']) {
    if (roles[key] && !ids.has(roles[key])) {
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
  return (list || []).map(normalizeBrandKitSummary)
}

export function normalizeBrandKitSummary(kit) {
  if (!kit) return null
  return {
    id: kit.id || kit._id,
    name: kit.name || 'Untitled Brand Kit',
    isDefault: Boolean(kit.isDefault),
    mediaCount: kit.mediaCount ?? kit.media?.length ?? 0,
    updatedAt: kit.updatedAt || kit.updated_at || kit.editedAt || null,
    data: kit.data || null,
    media: kit.media || [],
  }
}

export function normalizeBrandKitDetail(payload) {
  const root = payload?.data ?? payload
  const kit = root?.brandKit || root?.kit || root
  if (!kit) return null
  const summary = normalizeBrandKitSummary(kit)
  return {
    ...summary,
    data: {
      ...emptyBrandKitData(),
      ...(kit.data || {}),
      colorRoles: {
        ...emptyBrandKitData().colorRoles,
        ...(kit.data?.colorRoles || {}),
      },
      fonts: {
        ...emptyBrandKitData().fonts,
        ...(kit.data?.fonts || {}),
      },
      voice: {
        ...emptyBrandKitData().voice,
        ...(kit.data?.voice || {}),
      },
      chartStyles: {
        colorIds: kit.data?.chartStyles?.colorIds || [],
      },
    },
    media: Array.isArray(kit.media) ? kit.media : [],
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

export const LOGO_ROLES = ['primary', 'secondary', 'icon', 'light', 'dark']
export const MEDIA_KINDS = ['logo', 'photo', 'graphic']
