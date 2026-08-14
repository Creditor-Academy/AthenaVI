/**
 * Load Google Font stylesheets for canvas / editor rendering.
 */

export function ensureGoogleFontLoaded(fontFamily) {
  if (typeof document === 'undefined') return
  if (!fontFamily) return
  const cleanName = String(fontFamily).trim().replace(/['"]/g, '')
  if (!cleanName || ['sans-serif', 'serif', 'monospace', 'system-ui'].includes(cleanName.toLowerCase())) {
    return
  }
  const id = `google-font-${cleanName.replace(/\s+/g, '-').toLowerCase()}`
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(cleanName)}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap`
  document.head.appendChild(link)
}

export function ensureThemeFontsLoaded(themeTokens) {
  const fonts = themeTokens?.fonts
  if (!fonts) return
  ;[fonts.heading, fonts.subheading, fonts.body, fonts.tertiary]
    .filter(Boolean)
    .forEach(ensureGoogleFontLoaded)
}

export function themeFontFamilies(themeTokens) {
  const fonts = themeTokens?.fonts || {}
  return {
    headerFont: fonts.heading || fonts.subheading || 'Inter',
    bodyFont: fonts.body || fonts.subheading || fonts.heading || 'Inter',
  }
}
