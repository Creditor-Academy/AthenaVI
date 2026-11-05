import { THEMES } from '../constants/pptWizardThemes'
import { buildWizardThemeTokens, toApiThemeId } from './presentationHelpers'
import { enforceAppearancePalette } from './themeAppearance'

const DEFAULT_SLIDE_BG = '#FFFFFF'

/**
 * The deck's colours as the editor paints them (palette, title / body ink, background).
 * Shared by the editor and the export renderer so an export uses exactly the editor's palette.
 */
export function resolveThemeVisual(themeId, themeTokens) {
  const enforced = themeTokens?.palette ? enforceAppearancePalette(themeTokens) : themeTokens
  const palette = enforced?.palette
  if (palette?.bg || palette?.primary || palette?.text) {
    const bg = palette.bg || palette.surface || DEFAULT_SLIDE_BG
    const primary = palette.primary || '#3B82F6'
    const secondary = palette.secondary || primary
    const text = palette.text || (enforced?.appearance === 'dark' ? '#F8FAFC' : '#0F172A')
    const muted = palette.muted || '#64748B'
    const colorRoles = themeTokens?.colorRoles || palette?.colorRoles || null
    const paletteWithRoles = {
      ...(colorRoles ? { ...palette, colorRoles } : palette),
      appearance: enforced?.appearance,
    }
    return {
      id: 'themeTokens',
      name: themeTokens?.brand?.name || 'Brand Kit',
      outer: bg,
      inner: bg,
      title: text,
      body: muted,
      primary,
      secondary,
      accent: palette.accent || secondary,
      background: bg,
      palette: paletteWithRoles,
      appearance: enforced?.appearance,
    }
  }
  const id = String(themeTokens?.wizardColorThemeId || themeId || '')
  const fallback = THEMES.find((t) => t.id === id || toApiThemeId(t.id) === id) || THEMES[0]
  const builtTokens = buildWizardThemeTokens(fallback.id, THEMES)
  const fallbackPalette = builtTokens?.palette || null
  const bg = fallback.background || fallbackPalette?.bg || DEFAULT_SLIDE_BG
  return {
    ...fallback,
    outer: bg,
    inner: bg,
    background: bg,
    palette: fallbackPalette,
  }
}
