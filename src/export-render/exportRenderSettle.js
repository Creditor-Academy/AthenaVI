/**
 * Wait until an export page is fully drawn, and read back what the editor renderer decided
 * (fit-to-box font sizes) so PPTX export can match it.
 */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function frames(count = 1) {
  return new Promise((resolve) => {
    let left = Math.max(1, count)
    const tick = () => {
      left -= 1
      if (left <= 0) resolve()
      else requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
}

const withTimeout = (promise, ms) => Promise.race([promise, sleep(ms).then(() => 'timeout')])

/** Font stylesheets (Google Fonts links) must load before their faces can start loading. */
function waitForStylesheets(timeoutMs) {
  const links = [...document.querySelectorAll('link[rel="stylesheet"]')]
  return withTimeout(
    Promise.all(
      links.map((link) =>
        link.sheet
          ? null
          : new Promise((resolve) => {
              link.addEventListener('load', resolve, { once: true })
              link.addEventListener('error', resolve, { once: true })
            })
      )
    ),
    timeoutMs
  )
}

function loadUrl(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve({ url, ok: true })
    img.onerror = () => resolve({ url, ok: false })
    img.src = url
  })
}

function waitForImg(img) {
  const src = img.currentSrc || img.src
  const done = () =>
    img.naturalWidth > 0
      ? (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(() => ({ url: src, ok: true }))
      : { url: src, ok: false }
  if (img.complete) return Promise.resolve(done())
  return new Promise((resolve) => {
    img.addEventListener('load', () => resolve(done()), { once: true })
    img.addEventListener('error', () => resolve({ url: src, ok: false }), { once: true })
  })
}

/** Every picture on the page: <img>, SVG <image>, and CSS background images. */
async function waitForImages(root, timeoutMs) {
  if (!root) return []
  const jobs = [...root.querySelectorAll('img')].filter((img) => img.src).map(waitForImg)
  const urls = new Set()
  root.querySelectorAll('image').forEach((node) => {
    const href = node.getAttribute('href') || node.getAttribute('xlink:href')
    if (href && !href.startsWith('data:')) urls.add(href)
  })
  root.querySelectorAll('*').forEach((node) => {
    const bg = getComputedStyle(node).backgroundImage
    if (!bg || bg === 'none') return
    for (const match of bg.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
      if (!match[1].startsWith('data:')) urls.add(match[1])
    }
  })
  urls.forEach((url) => jobs.push(loadUrl(url)))
  const results = await withTimeout(Promise.all(jobs), timeoutMs)
  if (results === 'timeout') return [{ url: '(timed out waiting for images)', ok: false }]
  return results.filter((r) => r && !r.ok).map((r) => r.url)
}

function fontSizes(root) {
  return [...(root?.querySelectorAll('.ppt-text-display') || [])]
    .map((node) => node.style.fontSize || '')
    .join('|')
}

/**
 * Resolves when fonts, images and fit-to-box text have settled.
 * @returns {Promise<{ failedImages: string[], ms: number }>}
 */
export async function settleExportPage(root, { timeoutMs = 60_000 } = {}) {
  const started = Date.now()
  const left = () => Math.max(1_000, timeoutMs - (Date.now() - started))

  await frames(2)
  await waitForStylesheets(Math.min(15_000, left()))
  await frames(1)
  if (document.fonts?.ready) await withTimeout(document.fonts.ready, Math.min(15_000, left()))
  const failedImages = await waitForImages(root, left())
  if (document.fonts?.ready) await withTimeout(document.fonts.ready, Math.min(10_000, left()))

  // Fit-to-box shrinks text in layout effects and again once fonts load: wait until the
  // rendered sizes stop changing.
  let previous = null
  for (let i = 0; i < 20 && Date.now() - started < timeoutMs; i += 1) {
    await frames(2)
    await sleep(60)
    const current = fontSizes(root)
    if (current === previous) break
    previous = current
  }
  return { failedImages, ms: Date.now() - started }
}

function findSlide(root, slideId) {
  return [...(root?.querySelectorAll('.export-slide') || [])].find((n) => n.dataset.slideId === slideId) || null
}

/** Undo isolateForCapture. */
export function releaseCapture(root) {
  if (!root) return
  root.classList.remove('export-isolating', 'export-isolating--element')
  root.querySelectorAll('[data-isolated]').forEach((n) => n.removeAttribute('data-isolated'))
}

/**
 * Show only one element (transparent around it) or only a slide's background, so the backend
 * can capture it as a picture for PPTX. Returns the area to capture, in page px and in slide
 * canvas px, or null if it isn't drawn.
 * @param {{ slideId: string, elementId?: string, margin?: number }} target  margin: stage px
 *   added around an element (room for shadows / glows drawn past its box)
 */
export async function isolateForCapture(root, target = {}) {
  const area = isolateNow(root, target)
  if (!area) return null
  // Showing a slide again (other slides are display:none while isolating) makes Chrome decode
  // its images again, asynchronously: without waiting, a filtered SVG card background
  // captured blank on slide 33 of a 40-slide deck.
  const slideNode = findSlide(root, target.slideId)
  await Promise.all(
    [...slideNode.querySelectorAll('img')].map((img) => (img.decode ? img.decode().catch(() => {}) : null))
  )
  await frames(2)
  return area
}

function isolateNow(root, { slideId, elementId = null, margin = 0 } = {}) {
  releaseCapture(root)
  const slideNode = findSlide(root, slideId)
  if (!slideNode) return null
  const frame = elementId
    ? [...slideNode.querySelectorAll('[data-export-el]')].find((n) => n.dataset.exportEl === elementId)
    : null
  if (elementId && !frame) return null

  root.classList.add('export-isolating')
  if (frame) root.classList.add('export-isolating--element')
  slideNode.setAttribute('data-isolated', '')
  if (frame) frame.setAttribute('data-isolated', '')

  const slideRect = slideNode.getBoundingClientRect()
  let rect = slideRect
  if (frame) {
    const r = frame.getBoundingClientRect()
    const m = Math.max(0, Number(margin) || 0)
    const left = Math.max(slideRect.left, r.left - m)
    const top = Math.max(slideRect.top, r.top - m)
    const right = Math.min(slideRect.right, r.right + m)
    const bottom = Math.min(slideRect.bottom, r.bottom + m)
    if (right - left < 1 || bottom - top < 1) {
      releaseCapture(root)
      return null
    }
    rect = { left, top, width: right - left, height: bottom - top }
  }
  const toCanvas = Number(slideNode.dataset.canvasWidth) / slideRect.width
  return {
    clip: { x: rect.left + window.scrollX, y: rect.top + window.scrollY, width: rect.width, height: rect.height },
    box: {
      x: (rect.left - slideRect.left) * toCanvas,
      y: (rect.top - slideRect.top) * toCanvas,
      width: rect.width * toCanvas,
      height: rect.height * toCanvas,
    },
  }
}

/** `rgb(r, g, b)` / `rgba(…)` → `#RRGGBB` (alpha dropped); null if it isn't a colour. */
export function rgbToHex(value) {
  const m = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i.exec(String(value || ''))
  if (!m) return null
  return `#${[m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('').toUpperCase()}`
}

/** The first family of a computed `font-family` list, unquoted (null for generic families). */
export function primaryFontFamily(value) {
  const name = String(value || '')
    .split(',')[0]
    .replace(/["']/g, '')
    .trim()
  if (!name || /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|inherit)$/i.test(name)) return null
  return name
}

/**
 * Text as the editor drew it: the fitted font size (editor stage px, the unit of
 * content.fontSize), its colour and font family (the theme font for its role once CSS
 * variables resolve), and whether it still overflows its box.
 * @returns {Record<string, Record<string, { fontSize: number, color: string, fontFamily: string|null, overflow: boolean, runs: object[] }>>}
 */
export function measureTextElements(root) {
  const out = {}
  root?.querySelectorAll('.export-slide').forEach((slideNode) => {
    const elements = {}
    slideNode.querySelectorAll('[data-export-el]').forEach((frame) => {
      const text = frame.querySelector('.ppt-text-display')
      if (!text) return
      const style = getComputedStyle(text)
      const fontSize = parseFloat(style.fontSize)
      if (!Number.isFinite(fontSize)) return
      elements[frame.dataset.exportEl] = {
        fontSize: Math.round(fontSize * 100) / 100,
        // The ink the editor drew (after theme / contrast adjustments), as #RRGGBB.
        color: rgbToHex(style.color),
        // The font it was drawn in, so PowerPoint gets the same one (and it is embedded).
        fontFamily: primaryFontFamily(style.fontFamily),
        overflow: text.scrollHeight > frame.clientHeight + 1,
        // Rich text: each run as drawn (its own colour is contrast-adjusted by the editor too).
        runs: [...text.querySelectorAll('.ppt-rich-text > span, .ppt-rich-text > a')].map((node) => {
          const s = getComputedStyle(node)
          return {
            text: node.textContent || '',
            color: rgbToHex(s.color),
            fontFamily: primaryFontFamily(s.fontFamily),
            bold: Number(s.fontWeight) >= 600,
            italic: s.fontStyle === 'italic',
          }
        }),
      }
    })
    out[slideNode.dataset.slideId] = elements
  })
  return out
}

function alphaOf(value) {
  const m = /rgba?\(\s*\d+[,\s]+\d+[,\s]+\d+(?:[,\s/]+([\d.]+%?))?/i.exec(String(value || ''))
  if (!m) return 0
  if (m[1] == null) return 1
  return m[1].endsWith('%') ? parseFloat(m[1]) / 100 : parseFloat(m[1])
}

/** A solid colour with some opacity, as #RRGGBB; null for transparent. */
function paintedHex(value) {
  return alphaOf(value) > 0.05 ? rgbToHex(value) : null
}

const round2 = (n) => Math.round(n * 100) / 100

/**
 * Tables as the editor drew them (sizes in editor stage px), so PPTX can rebuild them as
 * native tables that look the same: the table box inside the element, column widths, row
 * heights, and each cell's text, fill, ink, font, alignment, padding and borders.
 */
export function measureTables(root) {
  const out = {}
  root?.querySelectorAll('.export-slide').forEach((slideNode) => {
    const tables = {}
    slideNode.querySelectorAll('[data-export-el]').forEach((frame) => {
      const table = frame.querySelector('table')
      if (!table) return
      const f = frame.getBoundingClientRect()
      const t = table.getBoundingClientRect()
      const rows = [...table.rows]
      if (!rows.length) return
      const tableBg = paintedHex(getComputedStyle(table).backgroundColor)
      // The card the editor draws the table on (background, border, rounded corners).
      const wrap = table.closest('.aig-canvas-table')
      const ws = wrap ? getComputedStyle(wrap) : null
      tables[frame.dataset.exportEl] = {
        card: ws
          ? {
              bg: paintedHex(ws.backgroundColor),
              alpha: round2(alphaOf(ws.backgroundColor)),
              border: { w: round2(parseFloat(ws.borderTopWidth) || 0), color: ws.borderTopStyle === 'none' ? null : paintedHex(ws.borderTopColor), alpha: round2(alphaOf(ws.borderTopColor)) },
              radius: round2(parseFloat(ws.borderTopLeftRadius) || 0),
            }
          : null,
        table: { x: round2(t.left - f.left), y: round2(t.top - f.top), w: round2(t.width), h: round2(t.height) },
        cols: [...rows[0].cells].map((cell) => round2(cell.getBoundingClientRect().width)),
        rows: rows.map((row) => round2(row.getBoundingClientRect().height)),
        cells: rows.map((row) => {
          const rowBg = paintedHex(getComputedStyle(row).backgroundColor)
          return [...row.cells].map((cell) => {
            const s = getComputedStyle(cell)
            const side = (name) => ({
              w: round2(parseFloat(s[`border${name}Width`]) || 0),
              color: s[`border${name}Style`] === 'none' ? null : paintedHex(s[`border${name}Color`]),
            })
            return {
              text: cell.textContent || '',
              colSpan: cell.colSpan || 1,
              bg: paintedHex(s.backgroundColor) || rowBg || tableBg,
              color: rgbToHex(s.color),
              fontSize: round2(parseFloat(s.fontSize) || 12),
              fontWeight: Number(s.fontWeight) || 400,
              italic: s.fontStyle === 'italic',
              fontFamily: String(s.fontFamily || '').split(',')[0].replace(/["']/g, '').trim() || null,
              align: s.textAlign === 'start' ? 'left' : s.textAlign === 'end' ? 'right' : s.textAlign,
              valign: s.verticalAlign,
              pad: [s.paddingTop, s.paddingRight, s.paddingBottom, s.paddingLeft].map((v) => round2(parseFloat(v) || 0)),
              border: [side('Top'), side('Right'), side('Bottom'), side('Left')],
            }
          })
        }),
      }
    })
    out[slideNode.dataset.slideId] = tables
  })
  return out
}
