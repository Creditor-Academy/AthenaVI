/**
 * Make the ids inside an inline SVG unique to one element on the page.
 *
 * Inline SVGs share the document's id space: two slides using the same layout both define
 * e.g. <filter id="tciShadow">, and url(#tciShadow) always resolves to the first one. When the
 * slide holding that first copy is hidden (display:none), the other slide's filtered shapes
 * stop painting — a card background vanished from an exported PPTX that way.
 *
 * Every id="x" becomes id="<prefix>-x", and every reference to it (url(#x), href="#x",
 * xlink:href="#x") is rewritten to match. References to ids the SVG doesn't define are left
 * alone.
 */
export function scopeSvgIds(markup, prefix) {
  if (typeof markup !== 'string' || !markup.includes('id=') || !prefix) return markup
  const safe = String(prefix).replace(/[^A-Za-z0-9_-]/g, '')
  if (!safe) return markup
  const ids = new Set()
  for (const match of markup.matchAll(/\sid\s*=\s*(["'])([^"']+)\1/g)) ids.add(match[2])
  if (!ids.size) return markup
  const scoped = (id) => (ids.has(id) ? `${safe}-${id}` : id)
  return markup
    .replace(/(\sid\s*=\s*)(["'])([^"']+)\2/g, (_, lead, q, id) => `${lead}${q}${scoped(id)}${q}`)
    .replace(/url\(\s*(["']?)#([^"')\s]+)\1\s*\)/g, (_, q, id) => `url(${q}#${scoped(id)}${q})`)
    .replace(/((?:xlink:)?href\s*=\s*)(["'])#([^"']+)\2/g, (_, lead, q, id) => `${lead}${q}#${scoped(id)}${q}`)
}
