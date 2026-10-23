import { buildWizardThemeTokens } from './presentationHelpers'
import { enforceAppearancePalette } from './themeAppearance'

function hexToRgbTriplet(hex) {
  if (!hex || typeof hex !== 'string') return '59, 130, 246'
  const raw = hex.trim().replace(/^#/, '')
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(raw)) return '59, 130, 246'
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  if ([r, g, b].some((n) => Number.isNaN(n))) return '59, 130, 246'
  return `${r}, ${g}, ${b}`
}

/**
 * Scoped CSS variables for Blueprint outline cards from wizard color theme.
 */
export function buildBlueprintThemeStyle(colorThemeId, colorThemes = []) {
  const tokens = enforceAppearancePalette(buildWizardThemeTokens(colorThemeId, colorThemes) || {})
  const palette = tokens?.palette || {}
  const appearance = tokens.appearance === 'dark' ? 'dark' : 'light'
  const primary = palette.primary || '#3B82F6'

  return {
    appearance,
    style: {
      '--blueprint-primary': primary,
      '--blueprint-secondary': palette.secondary || primary,
      '--blueprint-accent': palette.accent || palette.secondary || primary,
      /* Deck swatch only — cards stay white with standard page typography */
      '--blueprint-bg': palette.bg || '#F8FAFC',
      '--blueprint-surface': palette.surface || palette.bg || '#F8FAFC',
      '--blueprint-text': '#0F172A',
      '--blueprint-muted': '#64748B',
      '--blueprint-card-bg': '#FFFFFF',
      '--blueprint-border': 'rgba(226, 232, 240, 0.95)',
      '--blueprint-primary-rgb': hexToRgbTriplet(primary),
    },
    palette,
  }
}

export function blueprintCardClassName(_appearance) {
  return 'aig-outline-card'
}

export function resolveBlueprintThemeLabel(colorThemeId, colorThemes = []) {
  const raw = String(colorThemeId || '').trim()
  if (!raw) return null
  const normalized = raw.replace(/_/g, '-')
  const hit = (Array.isArray(colorThemes) ? colorThemes : []).find(
    (t) =>
      String(t.id || '').trim() === raw ||
      String(t.id || '').trim() === normalized ||
      String(t.id || '').trim().replace(/_/g, '-') === normalized
  )
  return hit?.name || null
}
