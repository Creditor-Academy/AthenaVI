/**
 * Theme-derived step colors for process_* diagram layouts (replaces their fixed rainbow palettes).
 * Mirrors AthenaVI_backend/src/modules/presentation/diagrams/processThemeColors.js.
 */
import { buildPremiumChartColors } from './chartContentNormalize.js'

/** Former hardcoded step palettes — saved elements carrying these are re-themed on recompile. */
export const LEGACY_PROCESS_STEP_COLORS = new Set(
  [
    '#2C3E50', '#2563EB', '#0D9488', '#16A34A', '#EAB308', '#EA580C', '#DC2626', '#E15537',
    '#E08E1A', '#659765', '#29A2CC', '#F5A623', '#FF793F', '#E84393', '#00CEC9', '#0984E3',
    '#6C5CE7', '#00B894', '#EE3B3B', '#FB8C00', '#38BDF8', '#54B2C8', '#E85B4E', '#4E637D',
    '#EAB327', '#80B58E', '#9333EA', '#F59E0B', '#D97706', '#BE185D',
  ].map((c) => c.toLowerCase())
)

export function isLegacyProcessColor(color) {
  return typeof color === 'string' && LEGACY_PROCESS_STEP_COLORS.has(color.trim().toLowerCase())
}

/** First candidate that is a real (user/theme) color — legacy rainbow defaults are ignored. */
export function customProcessColor(...candidates) {
  return candidates.find((c) => typeof c === 'string' && c.trim() && !isLegacyProcessColor(c)) || null
}

/** `count` step colors from brand chart colors when set, else a primary/secondary/accent family. */
export function processStepColors(palette, count = 5) {
  const theme = palette && typeof palette === 'object' ? palette : {}
  const n = Math.max(1, Number(count) || 5)
  const brand = theme.chartColors || theme.brandChartColors
  const family =
    Array.isArray(brand) && brand.length >= 2 ? brand : buildPremiumChartColors(theme, Math.max(n, 2))
  return Array.from({ length: n }, (_, i) => family[i % family.length])
}

/** Recolor computed step geometries in place with the theme family. */
export function themeProcessSteps(steps, palette = {}) {
  if (!Array.isArray(steps) || !steps.length) return steps
  const colors = processStepColors(palette, steps.length)
  steps.forEach((step, i) => {
    if (step) step.color = colors[i]
  })
  return steps
}
