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
        // Height of all the text and of its box (stage px): PPTX grows the box to the text.
        contentHeight: Math.round(text.scrollHeight * 100) / 100,
        frameHeight: Math.round(frame.clientHeight * 100) / 100,
        // Rich text: each run as drawn (its own colour is contrast-adjusted by the editor too).
        runs: [...text.querySelectorAll('.ppt-rich-text > span, .ppt-rich-text > a')].map((node) => {
          const s = getComputedStyle(node)
          return {
            text: node.textContent || '',
            color: rgbToHex(s.color),
            fontFamily: primaryFontFamily(s.fontFamily),
            bold: Number(s.fontWeight) >= 600,
            italic: s.fontStyle === 'italic',
            // Drawn size (stage px): a run can be bigger or smaller than the rest.
            fontSize: Math.round(parseFloat(s.fontSize) * 100) / 100,
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

/** A computed corner radius (`12px`, `50%`, `50% 60%`) as [horizontal, vertical] px of a w × h box. */
function cornerRadius(value, w, h) {
  const parts = String(value || '0').trim().split(/\s+/)
  const len = (v, ref) => (String(v).endsWith('%') ? (parseFloat(v) / 100) * ref : parseFloat(v) || 0)
  return [round2(len(parts[0], w)), round2(len(parts[1] ?? parts[0], h))]
}

/**
 * Shapes and picture frames as drawn, for native PPTX geometry: the box size, its corner radii
 * and border (a CSS border sits inside the box), its clip-path, and for line shapes where the
 * line runs. Sizes are stage px.
 * @returns {Record<string, Record<string, object>>} by slide, then element id
 */
export function measureShapes(root) {
  const out = {}
  root?.querySelectorAll('.export-slide').forEach((slideNode) => {
    const shapes = {}
    slideNode.querySelectorAll('[data-export-el]').forEach((frame) => {
      const node = frame.querySelector('[data-export-shape]')
      if (!node) return
      const s = getComputedStyle(node)
      const w = node.offsetWidth
      const h = node.offsetHeight
      const kind = node.dataset.exportShape
      const entry = {
        kind,
        w,
        h,
        frameW: frame.offsetWidth,
        frameH: frame.offsetHeight,
        borderWidth: round2(parseFloat(s.borderTopWidth) || 0),
        borderStyle: s.borderTopStyle,
        borderColor: paintedHex(s.borderTopColor),
        // The clip-path the editor drew with (library shapes keep it in the library, not the element).
        clipPath: node.dataset.exportClip || (s.clipPath && s.clipPath !== 'none' ? s.clipPath : null),
      }
      if (kind === 'line') {
        // Where the line runs, in 0–1 of the frame (offsets are layout px, unaffected by rotation).
        const fh = frame.offsetHeight || 1
        const fw = frame.offsetWidth || 1
        let top = 0
        let left = 0
        for (let n = node; n && n !== frame; n = n.offsetParent) {
          top += n.offsetTop
          left += n.offsetLeft
        }
        entry.line = {
          y: round2((top + entry.borderWidth / 2) / fh),
          x0: round2(left / fw),
          x1: round2((left + w) / fw),
        }
      } else {
        entry.radii = [s.borderTopLeftRadius, s.borderTopRightRadius, s.borderBottomRightRadius, s.borderBottomLeftRadius].map(
          (v) => cornerRadius(v, w, h)
        )
      }
      shapes[frame.dataset.exportEl] = entry
    })
    out[slideNode.dataset.slideId] = shapes
  })
  return out
}

/** Opacity of a node including its ancestors up to `stop`. */
function effectiveOpacity(node, stop) {
  let alpha = 1
  for (let n = node; n && n !== stop; n = n.parentElement) alpha *= Number(getComputedStyle(n).opacity)
  return round2(alpha)
}

/**
 * A slide with no elements, as drawn (SlideMockFallback): each part's box in canvas px, and its
 * text style. PPTX rebuilds it from this so it matches the editor.
 * @returns {Record<string, object>} by slide id; slides with elements are left out
 */
export function measureFallback(root) {
  const out = {}
  root?.querySelectorAll('.export-slide').forEach((slideNode) => {
    const mock = slideNode.querySelector('[data-export-fallback="slide"]')
    if (!mock) return
    const slideRect = slideNode.getBoundingClientRect()
    const toCanvas = Number(slideNode.dataset.canvasWidth) / (slideRect.width || 1)
    const box = (node) => {
      const r = node.getBoundingClientRect()
      return {
        x: round2((r.left - slideRect.left) * toCanvas),
        y: round2((r.top - slideRect.top) * toCanvas),
        width: round2(r.width * toCanvas),
        height: round2(r.height * toCanvas),
      }
    }
    const text = (node) => {
      const s = getComputedStyle(node)
      return {
        text: (node.textContent || '').trim(),
        box: box(node),
        fontSize: round2(parseFloat(s.fontSize)),
        lineHeight: round2(parseFloat(s.lineHeight) || parseFloat(s.fontSize) * 1.2),
        bold: Number(s.fontWeight) >= 600,
        color: rgbToHex(s.color),
        opacity: effectiveOpacity(node, slideNode),
        fontFamily: primaryFontFamily(s.fontFamily),
        marginBottom: round2(parseFloat(s.marginBottom) || 0),
      }
    }
    const part = (name) => mock.querySelector(`[data-export-fallback="${name}"]`)
    const items = [...mock.querySelectorAll('[data-export-fallback="item"]')]
    const visual = part('visual')
    const image = part('image')
    const visualStyle = visual ? getComputedStyle(visual) : null
    out[slideNode.dataset.slideId] = {
      title: part('title') ? text(part('title')) : null,
      body: part('body') ? text(part('body')) : null,
      paragraph: part('paragraph') ? text(part('paragraph')) : null,
      list: items.length
        ? { box: box(items[0].parentElement), indent: round2(parseFloat(getComputedStyle(items[0].parentElement).paddingLeft) || 0), items: items.map(text) }
        : null,
      visual: visual
        ? {
            box: box(visual),
            borderColor: rgbToHex(visualStyle.borderTopColor),
            borderWidth: round2(parseFloat(visualStyle.borderTopWidth) || 0),
            borderStyle: visualStyle.borderTopStyle,
            radius: round2(parseFloat(visualStyle.borderTopLeftRadius) || 0),
            opacity: effectiveOpacity(visual, slideNode),
          }
        : null,
      image: image
        ? {
            box: box(image),
            radius: round2(parseFloat(getComputedStyle(image).borderTopLeftRadius) || 0),
            opacity: effectiveOpacity(image, slideNode),
          }
        : null,
    }
  })
  return out
}
