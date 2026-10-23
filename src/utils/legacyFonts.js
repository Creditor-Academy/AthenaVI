/**
 * Built-in / previous font families shown alongside the Google Fonts catalog.
 * Keep in sync with legacy PPT + video editor lists.
 */

export const SYSTEM_FONT_FAMILIES = new Set([
  'arial',
  'helvetica',
  'georgia',
  'times new roman',
  'courier new',
  'monospace',
  'system-ui',
  'sans-serif',
  'serif',
  'cursive',
  'fantasy',
])

/** Previous picker options + brand-kit role defaults (family name only). */
export const BUILTIN_FONT_FAMILIES = [
  'Inter',
  'Arial',
  'Helvetica',
  'Georgia',
  'Times New Roman',
  'Courier New',
  'Montserrat',
  'Roboto',
  'Open Sans',
  'Poppins',
  'Lato',
  'Playfair Display',
  'Outfit',
  'Space Grotesk',
  'monospace',
]

export function isSystemFontFamily(family) {
  const name = String(family || '')
    .trim()
    .replace(/^["']|["']$/g, '')
    .toLowerCase()
  return SYSTEM_FONT_FAMILIES.has(name)
}

export function builtinFontEntries() {
  return BUILTIN_FONT_FAMILIES.map((family) => ({
    family,
    featured: true,
    category: isSystemFontFamily(family) ? 'system' : null,
    source: isSystemFontFamily(family) ? 'system' : 'builtin',
  }))
}

/** Prepend builtin fonts, then API fonts; dedupe by family (API wins on conflict). */
export function mergeBuiltinAndCatalogFonts(apiFonts = [], { builtins = null } = {}) {
  const builtinList = builtins || builtinFontEntries()
  const map = new Map()
  for (const font of builtinList) {
    map.set(String(font.family).toLowerCase(), font)
  }
  for (const font of apiFonts || []) {
    const family = font?.family
    if (!family) continue
    const key = String(family).toLowerCase()
    map.set(key, { ...(map.get(key) || {}), ...font, family })
  }

  const builtinKeys = new Set(builtinList.map((f) => String(f.family).toLowerCase()))
  const ordered = []
  for (const font of builtinList) {
    const entry = map.get(String(font.family).toLowerCase())
    if (entry) ordered.push(entry)
  }
  for (const font of apiFonts || []) {
    const key = String(font?.family || '').toLowerCase()
    if (!key || builtinKeys.has(key)) continue
    ordered.push(map.get(key) || font)
  }
  return ordered
}
