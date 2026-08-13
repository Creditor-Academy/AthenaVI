/** Seeded deck-pack theme palette — synced with backend themes/catalog.json v2 */
export const DECK_PACK_THEMES = {
  midnight_blue: {
    bg: '#0B1220',
    surface: '#121A2B',
    primary: '#3B82F6',
    accent: '#60A5FA',
    text: '#F8FAFC',
    muted: '#94A3B8',
    cardBg: 'rgba(255,255,255,0.05)',
    textOnImage: '#FFFFFF',
    textOnImageMuted: 'rgba(255,255,255,0.85)',
    overlayScrim: 'rgba(0,0,0,0.5)',
    appearance: 'dark',
  },
  clean_light: {
    bg: '#FFFFFF',
    surface: '#F8FAFC',
    primary: '#2563EB',
    accent: '#3B82F6',
    text: '#0F172A',
    muted: '#64748B',
    cardBg: 'rgba(15,23,42,0.03)',
    textOnImage: '#FFFFFF',
    textOnImageMuted: 'rgba(255,255,255,0.85)',
    overlayScrim: 'rgba(0,0,0,0.45)',
    appearance: 'light',
  },
  forest_slate: {
    bg: '#0F1A14',
    surface: '#16241C',
    primary: '#34D399',
    accent: '#6EE7B7',
    text: '#ECFDF5',
    muted: '#86A899',
    cardBg: 'rgba(255,255,255,0.05)',
    textOnImage: '#FFFFFF',
    textOnImageMuted: 'rgba(255,255,255,0.85)',
    overlayScrim: 'rgba(0,0,0,0.5)',
    appearance: 'dark',
  },
  warm_sand: {
    bg: '#FFFBF5',
    surface: '#FFF7ED',
    primary: '#C2410C',
    accent: '#EA580C',
    text: '#1C1917',
    muted: '#78716C',
    cardBg: 'rgba(28,25,23,0.04)',
    textOnImage: '#FFFFFF',
    textOnImageMuted: 'rgba(255,255,255,0.85)',
    overlayScrim: 'rgba(0,0,0,0.45)',
    appearance: 'light',
  },
  charcoal_gold: {
    bg: '#111111',
    surface: '#1A1A1A',
    primary: '#D4AF37',
    accent: '#E8C872',
    text: '#FAFAFA',
    muted: '#A3A3A3',
    cardBg: 'rgba(255,255,255,0.05)',
    textOnImage: '#FFFFFF',
    textOnImageMuted: 'rgba(255,255,255,0.85)',
    overlayScrim: 'rgba(0,0,0,0.5)',
    appearance: 'dark',
  },
  ocean_mist: {
    bg: '#F0F9FF',
    surface: '#E0F2FE',
    primary: '#0369A1',
    accent: '#0EA5E9',
    text: '#0C4A6E',
    muted: '#64748B',
    cardBg: 'rgba(3,105,161,0.06)',
    textOnImage: '#FFFFFF',
    textOnImageMuted: 'rgba(255,255,255,0.85)',
    overlayScrim: 'rgba(0,0,0,0.45)',
    appearance: 'light',
  },
  violet_noir: {
    bg: '#0C0A14',
    surface: '#161225',
    primary: '#A78BFA',
    accent: '#C4B5FD',
    text: '#F5F3FF',
    muted: '#A5A0B8',
    cardBg: 'rgba(255,255,255,0.05)',
    textOnImage: '#FFFFFF',
    textOnImageMuted: 'rgba(255,255,255,0.85)',
    overlayScrim: 'rgba(0,0,0,0.5)',
    appearance: 'dark',
  },
  paper_ink: {
    bg: '#FAFAF9',
    surface: '#F5F5F4',
    primary: '#18181B',
    accent: '#3F3F46',
    text: '#09090B',
    muted: '#71717A',
    cardBg: 'rgba(9,9,11,0.03)',
    textOnImage: '#FFFFFF',
    textOnImageMuted: 'rgba(255,255,255,0.85)',
    overlayScrim: 'rgba(0,0,0,0.45)',
    appearance: 'light',
  },
  sunset_coral: {
    bg: '#1A0F12',
    surface: '#2A151C',
    primary: '#FB7185',
    accent: '#FDA4AF',
    text: '#FFF1F2',
    muted: '#C4A4AB',
    cardBg: 'rgba(255,255,255,0.05)',
    textOnImage: '#FFFFFF',
    textOnImageMuted: 'rgba(255,255,255,0.85)',
    overlayScrim: 'rgba(0,0,0,0.5)',
    appearance: 'dark',
  },
  mint_clinic: {
    bg: '#F7FFFB',
    surface: '#ECFDF5',
    primary: '#059669',
    accent: '#10B981',
    text: '#064E3B',
    muted: '#6B7280',
    cardBg: 'rgba(5,150,105,0.06)',
    textOnImage: '#FFFFFF',
    textOnImageMuted: 'rgba(255,255,255,0.85)',
    overlayScrim: 'rgba(0,0,0,0.45)',
    appearance: 'light',
  },
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
  const cardBg = theme.cardBg ?? surface
  return {
    '--preview-bg': theme.bg,
    '--preview-surface': surface,
    '--preview-card': cardBg,
    '--preview-text': theme.text,
    '--preview-muted': muted,
    '--preview-accent': theme.accent,
    '--preview-accent-soft': `${theme.accent}18`,
    '--preview-accent-border': `${theme.accent}55`,
    '--preview-image-bg': `color-mix(in srgb, ${theme.text} 10%, ${theme.bg})`,
    '--preview-bar': `color-mix(in srgb, ${theme.text} 45%, transparent)`,
    '--preview-icon': `color-mix(in srgb, ${theme.text} 35%, transparent)`,
    '--preview-text-on-image': theme.textOnImage ?? '#FFFFFF',
    '--preview-text-on-image-muted': theme.textOnImageMuted ?? 'rgba(255,255,255,0.85)',
    '--preview-overlay-scrim': theme.overlayScrim ?? 'rgba(0,0,0,0.45)',
    '--bg-card': theme.bg,
    '--text-main': theme.text,
    '--text-muted': muted,
  }
}
