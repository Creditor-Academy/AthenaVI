/**
 * Font CSS for slide images made in the browser.
 *
 * html-to-image draws a slide as an SVG image, which can only use fonts embedded in it. Left to
 * itself it missed fonts named in a font stack (a Nunito heading drew in a fallback) and
 * embedded every weight and language subset of others (about 4 MB per slide). Here the faces are
 * picked from what the slide actually draws: its families, weights, styles and characters, and
 * each font file is downloaded once and reused.
 */

const FONT_FILE_CACHE = new Map()

function unquote(value) {
  return String(value || '').trim().replace(/^["']|["']$/g, '').trim()
}

/** The first family in a CSS font-family list, lower-cased. */
export function primaryFamily(value) {
  return unquote(String(value || '').split(',')[0]).toLowerCase()
}

/**
 * Code point ranges of a unicode-range value (`U+0000-00FF, U+0131, U+4??`).
 * @returns {Array<[number, number]>} empty = every character
 */
export function parseUnicodeRange(value) {
  const out = []
  for (const part of String(value || '').split(',')) {
    const token = part.trim().toUpperCase().replace(/^U\+/, '')
    if (!token) continue
    if (token.includes('?')) {
      out.push([parseInt(token.replace(/\?/g, '0'), 16), parseInt(token.replace(/\?/g, 'F'), 16)])
    } else if (token.includes('-')) {
      const [a, b] = token.split('-')
      out.push([parseInt(a, 16), parseInt(b, 16)])
    } else {
      const n = parseInt(token, 16)
      out.push([n, n])
    }
  }
  return out.filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b))
}

export function rangeCovers(ranges, codePoints) {
  if (!ranges.length) return true
  for (const cp of codePoints) {
    for (const [a, b] of ranges) if (cp >= a && cp <= b) return true
  }
  return false
}

/** `400`, `bold`, `300 700` → [min, max]. */
export function weightRange(value) {
  const words = String(value || '400').trim().toLowerCase().split(/\s+/)
  const num = (w) => (w === 'bold' ? 700 : w === 'normal' ? 400 : Number(w))
  const a = num(words[0])
  const b = words[1] != null ? num(words[1]) : a
  return [Number.isFinite(a) ? a : 400, Number.isFinite(b) ? b : 400]
}

/**
 * The faces a slide needs, from @font-face descriptors.
 * @param {Array<{ family: string, style: string, weight: string, unicodeRange: string, src: string }>} faces
 * @param {Map<string, Set<number>>} usedWeights  family (lower case) → weights drawn
 * @param {Set<number>} codePoints  characters drawn
 */
export function pickFontFaces(faces, usedWeights, codePoints) {
  const picked = []
  const byFamily = new Map()
  for (const face of faces) {
    const family = primaryFamily(face.family)
    if (!usedWeights.has(family)) continue
    if (!rangeCovers(parseUnicodeRange(face.unicodeRange), codePoints)) continue
    if (!byFamily.has(family)) byFamily.set(family, [])
    byFamily.get(family).push(face)
  }
  for (const [family, list] of byFamily) {
    const wanted = new Set()
    for (const w of usedWeights.get(family)) {
      // The face the browser picks: one covering the weight, else the nearest lighter and
      // heavier ones (both kept, so whichever the browser chooses is there).
      const ranges = list.map((f) => weightRange(f.weight))
      if (ranges.some(([a, b]) => w >= a && w <= b)) {
        ranges.forEach(([a, b], i) => w >= a && w <= b && wanted.add(i))
        continue
      }
      let lighter = -1
      let heavier = -1
      ranges.forEach(([a, b], i) => {
        if (b < w && (lighter < 0 || b > ranges[lighter][1])) lighter = i
        if (a > w && (heavier < 0 || a < ranges[heavier][0])) heavier = i
      })
      if (lighter >= 0) wanted.add(lighter)
      if (heavier >= 0) wanted.add(heavier)
    }
    list.forEach((face, i) => wanted.has(i) && picked.push(face))
  }
  return picked
}

/** Families (lower case) → weights, and the characters, drawn in a node (incl. ::before / ::after). */
export function fontsUsedIn(node) {
  const usedWeights = new Map()
  const codePoints = new Set()
  const addText = (text) => {
    for (const ch of String(text || '')) {
      codePoints.add(ch.codePointAt(0))
      // text-transform can draw the other case.
      for (const alt of [ch.toUpperCase(), ch.toLowerCase()]) codePoints.add(alt.codePointAt(0))
    }
  }
  const addFont = (style) => {
    const family = primaryFamily(style.fontFamily)
    if (!family) return
    if (!usedWeights.has(family)) usedWeights.set(family, new Set())
    usedWeights.get(family).add(Number(style.fontWeight) || 400)
  }
  addText(node.textContent)
  for (const el of [node, ...node.querySelectorAll('*')]) {
    addFont(getComputedStyle(el))
    for (const pseudo of ['::before', '::after', '::marker']) {
      const ps = getComputedStyle(el, pseudo)
      const content = ps.content
      if (content && content !== 'none' && content !== 'normal') {
        addText(content.replace(/^["']|["']$/g, ''))
        addFont(ps)
      }
    }
  }
  return { usedWeights, codePoints }
}

function fontFacesOfSheet(sheet, baseUrl) {
  const faces = []
  for (const rule of sheet.cssRules || []) {
    if (rule.type !== 5 /* CSSRule.FONT_FACE_RULE */) continue
    const s = rule.style
    const src = s.getPropertyValue('src')
    const match = src.match(/url\(\s*["']?([^"')]+)["']?\s*\)/)
    if (!match) continue
    let url = match[1]
    try {
      url = new URL(url, baseUrl).href
    } catch {
      continue
    }
    faces.push({
      family: s.getPropertyValue('font-family'),
      style: s.getPropertyValue('font-style') || 'normal',
      weight: s.getPropertyValue('font-weight') || '400',
      unicodeRange: s.getPropertyValue('unicode-range'),
      src: url,
      format: (src.match(/format\(\s*["']?([^"')]+)["']?\s*\)/) || [])[1] || '',
    })
  }
  return faces
}

/**
 * Every @font-face on the page. Same-origin sheets are read directly; Google Fonts sheets
 * (cross-origin, so their rules can't be read) are fetched and parsed.
 */
export async function pageFontFaces(fetchCss = (url) => fetch(url).then((r) => (r.ok ? r.text() : ''))) {
  const faces = []
  const remote = []
  for (const sheet of document.styleSheets) {
    let rules = null
    try {
      rules = sheet.cssRules
    } catch {
      rules = null
    }
    if (rules) faces.push(...fontFacesOfSheet(sheet, sheet.href || document.baseURI))
    else if (sheet.href) remote.push(sheet.href)
  }
  await Promise.all(
    [...new Set(remote)].map(async (href) => {
      try {
        const css = await fetchCss(href)
        const parsed = new CSSStyleSheet()
        parsed.replaceSync(css)
        faces.push(...fontFacesOfSheet(parsed, href))
      } catch {
        /* a font sheet that can't be read: its text falls back, as it would in the editor */
      }
    })
  )
  return faces
}

function fontFileDataUrl(url) {
  if (!FONT_FILE_CACHE.has(url)) {
    const job = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Font ${res.status}`)
        return res.blob()
      })
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result)
            reader.onerror = () => reject(reader.error)
            reader.readAsDataURL(blob)
          })
      )
      .catch((err) => {
        FONT_FILE_CACHE.delete(url)
        throw err
      })
    FONT_FILE_CACHE.set(url, job)
  }
  return FONT_FILE_CACHE.get(url)
}

/**
 * @font-face CSS (font files inlined) for the fonts a drawn slide uses.
 * @param {Element} node
 * @param {object[]} faces  pageFontFaces()
 */
export async function fontEmbedCssFor(node, faces) {
  const { usedWeights, codePoints } = fontsUsedIn(node)
  const picked = pickFontFaces(faces, usedWeights, codePoints)
  const blocks = await Promise.all(
    picked.map(async (face) => {
      try {
        const data = await fontFileDataUrl(face.src)
        const format = face.format ? ` format("${face.format}")` : ''
        return [
          '@font-face {',
          `font-family: ${face.family};`,
          `font-style: ${face.style};`,
          `font-weight: ${face.weight};`,
          face.unicodeRange ? `unicode-range: ${face.unicodeRange};` : '',
          `src: url(${data})${format};`,
          'font-display: block;',
          '}',
        ].join('')
      } catch {
        return ''
      }
    })
  )
  return blocks.filter(Boolean).join('\n')
}
