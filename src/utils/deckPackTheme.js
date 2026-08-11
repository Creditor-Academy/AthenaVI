/** Seeded deck-pack theme palette — keyed by schema.themeId */
export const DECK_PACK_THEMES = {
  midnight_blue: { bg: '#0B1220', surface: '#1e2a4a', accent: '#3b82f6', text: '#f8fafc' },
  clean_light: { bg: '#ffffff', surface: '#f1f5f9', accent: '#6366f1', text: '#0f172a' },
  forest_slate: { bg: '#1a2e1a', surface: '#2d4a2d', accent: '#22c55e', text: '#f0fdf4' },
  warm_sand: { bg: '#faf7f0', surface: '#f5efe0', accent: '#d97706', text: '#1c1917' },
  charcoal_gold: { bg: '#1c1c1c', surface: '#2a2a2a', accent: '#d4af37', text: '#f5f5f5' },
  ocean_mist: { bg: '#0d2137', surface: '#1a3a5c', accent: '#0ea5e9', text: '#e0f2fe' },
  violet_noir: { bg: '#0f0a1e', surface: '#1e1040', accent: '#a855f7', text: '#f5f3ff' },
  paper_ink: { bg: '#fefce8', surface: '#fef9c3', accent: '#374151', text: '#111827' },
  sunset_coral: { bg: '#fff1ee', surface: '#fde8e4', accent: '#f43f5e', text: '#1c0a09' },
  mint_clinic: { bg: '#f0fdf4', surface: '#dcfce7', accent: '#10b981', text: '#052e16' },
}

export function resolveDeckPackTheme(themeId) {
  const key = String(themeId || '')
    .trim()
    .replace(/-/g, '_')
  if (!key) return DECK_PACK_THEMES.clean_light
  return DECK_PACK_THEMES[key] ?? DECK_PACK_THEMES.clean_light
}

/** "16:9" → "16/9" for CSS aspect-ratio */
export function aspectRatioToCss(aspectRatio = '16:9') {
  const parts = String(aspectRatio || '16:9')
    .split(':')
    .map((part) => parseInt(part.trim(), 10))
  if (parts.length !== 2 || !parts[0] || !parts[1]) return '16/9'
  return `${parts[0]}/${parts[1]}`
}

/** CSS variables for LayoutPolishedPreview when rendering inside a deck pack */
export function deckPackThemeToCssVars(theme) {
  if (!theme) return {}
  const surface = theme.surface ?? theme.bg
  const muted = theme.muted ?? `color-mix(in srgb, ${theme.text} 58%, transparent)`
  return {
    '--preview-bg': theme.bg,
    '--preview-surface': surface,
    '--preview-card': surface,
    '--preview-text': theme.text,
    '--preview-muted': muted,
    '--preview-accent': theme.accent,
    '--preview-accent-soft': `${theme.accent}18`,
    '--preview-accent-border': `${theme.accent}55`,
    '--preview-image-bg': `color-mix(in srgb, ${theme.text} 10%, ${theme.bg})`,
    '--preview-bar': `color-mix(in srgb, ${theme.text} 45%, transparent)`,
    '--preview-icon': `color-mix(in srgb, ${theme.text} 35%, transparent)`,
    '--bg-card': theme.bg,
    '--text-main': theme.text,
    '--text-muted': muted,
  }
}
