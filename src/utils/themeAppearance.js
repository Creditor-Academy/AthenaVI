const APPEARANCE_LUM_THRESHOLD = 0.35
const SAFE_BG_BY_APPEARANCE = {
  light: { bg: '#FFFFFF', surface: '#F8FAFC' },
  dark: { bg: '#0B1220', surface: '#121A2B' },
}
const SAFE_INK_BY_APPEARANCE = {
  light: {
    text: '#0F172A',
    muted: '#64748B',
    heading: '#0F172A',
    textOnImage: '#FFFFFF',
  },
  dark: {
    text: '#F8FAFC',
    muted: '#94A3B8',
    heading: '#F8FAFC',
    textOnImage: '#FFFFFF',
  },
}

export function relativeLuminanceHex(hex) {
  if (!hex || typeof hex !== 'string') return null
  const raw = hex.trim().replace(/^#/, '')
  if (raw.length !== 6 && raw.length !== 3) return null
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw
  const r = parseInt(full.slice(0, 2), 16) / 255
  const g = parseInt(full.slice(2, 4), 16) / 255
  const b = parseInt(full.slice(4, 6), 16) / 255
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

export function inkMatchesAppearance(hex, appearance) {
  const lum = relativeLuminanceHex(hex)
  if (lum == null) return true
  if (appearance === 'dark') return lum >= APPEARANCE_LUM_THRESHOLD
  return lum < APPEARANCE_LUM_THRESHOLD
}

/** Light vs dark slide from explicit appearance or canvas background. */
export function resolveSlideAppearance(palette = {}) {
  if (palette.appearance === 'light' || palette.appearance === 'dark') return palette.appearance
  return appearanceFromThemeBg(palette.bg || palette.surface || palette.background || '#FFFFFF')
}

/**
 * Remap ink that clashes with deck appearance (e.g. white on light slides).
 * Returns null when caller should try a theme token (accent/primary).
 */
export function coerceInkHexForAppearance(hex, appearance, { colorRole } = {}) {
  if (!hex || (appearance !== 'light' && appearance !== 'dark')) return hex
  if (inkMatchesAppearance(hex, appearance)) return hex
  const safe = SAFE_INK_BY_APPEARANCE[appearance] || SAFE_INK_BY_APPEARANCE.light
  const role = String(colorRole || '').toLowerCase()
  if (/muted|textonimagemuted/.test(role)) return safe.muted
  if (/accent|primary|secondary/.test(role)) return null
  if (/textonimage|onimage/.test(role) && appearance === 'light') return safe.text
  return safe.text
}

export function safeInkHexForAppearance(appearance, role = 'text') {
  const safe = SAFE_INK_BY_APPEARANCE[appearance] || SAFE_INK_BY_APPEARANCE.light
  if (/muted/.test(String(role).toLowerCase())) return safe.muted
  return safe.text
}

function luminanceMatchesAppearance(hex, appearance) {
  const lum = relativeLuminanceHex(hex)
  if (lum == null) return true
  if (appearance === 'dark') return lum < APPEARANCE_LUM_THRESHOLD
  return lum >= APPEARANCE_LUM_THRESHOLD
}

export function appearanceFromThemeBg(hex) {
  const lum = relativeLuminanceHex(hex)
  if (lum == null) return 'light'
  return lum < APPEARANCE_LUM_THRESHOLD ? 'dark' : 'light'
}

/** Match backend theme.service — keep slide ink readable for light/dark decks. */
export function enforceAppearancePalette(themeTokens) {
  if (!themeTokens?.palette || typeof themeTokens.palette !== 'object') return themeTokens
  const appearance =
    themeTokens.appearance === 'dark' || themeTokens.appearance === 'light'
      ? themeTokens.appearance
      : appearanceFromThemeBg(themeTokens.palette.bg)

  let palette = { ...themeTokens.palette }
  if (appearance === 'dark' && themeTokens.paletteDark && typeof themeTokens.paletteDark === 'object') {
    palette = {
      ...palette,
      ...themeTokens.paletteDark,
      primary: themeTokens.paletteDark.primary || palette.primary,
      secondary: themeTokens.paletteDark.secondary || palette.secondary,
      accent: themeTokens.paletteDark.accent || palette.accent,
    }
  }

  const safeBg = SAFE_BG_BY_APPEARANCE[appearance] || SAFE_BG_BY_APPEARANCE.light
  const safeInk = SAFE_INK_BY_APPEARANCE[appearance] || SAFE_INK_BY_APPEARANCE.light

  for (const key of ['bg', 'surface']) {
    if (!palette[key] || !luminanceMatchesAppearance(palette[key], appearance)) {
      palette[key] = safeBg[key] || safeBg.bg
    }
  }
  for (const key of ['text', 'muted', 'heading']) {
    if (!palette[key] || !inkMatchesAppearance(palette[key], appearance)) {
      palette[key] = safeInk[key]
    }
  }
  if (!palette.textOnImage || !inkMatchesAppearance(palette.textOnImage, 'dark')) {
    palette.textOnImage = SAFE_INK_BY_APPEARANCE.dark.textOnImage
  }
  if (!palette.cardBg || !luminanceMatchesAppearance(palette.cardBg, appearance)) {
    palette.cardBg = appearance === 'dark' ? '#1E293B' : '#F1F5F9'
  }
  if (!palette.body || !inkMatchesAppearance(palette.body, appearance)) {
    palette.body = safeInk.muted
  }

  return { ...themeTokens, appearance, palette }
}
