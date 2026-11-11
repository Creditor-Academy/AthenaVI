/**
 * Slide images made in the browser (PNG / JPEG export without a server job).
 *
 * Each slide is drawn off-screen by ExportSlide, the same component the server's export page
 * uses, then captured with html-to-image at the chosen size. Every picture on a slide is
 * fetched first: html-to-image has to read pictures to put them in the image, and a host that
 * doesn't allow that (CORS) would leave a hole. When that happens the capture stops with
 * BlockedImageError and the caller exports on the server instead.
 */
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import '../pages/Slides/AIPptGenerator.css'
import '../pages/Slides/AIPptComponents/pptEditorExtras.css'
import {
  collectSlideFontFamilies,
  ensureElementFontsLoaded,
  ensureFontCssUrl,
  ensureThemeFontsLoaded,
} from '../utils/googleFonts'
import { EDITOR_STAGE_WIDTH } from '../utils/slideStageElements'
import { imagePixelSize } from '../utils/export/slideSelection'
import ExportSlide from './ExportSlide'
import { prepareDeck } from './exportDeck'
import { settleExportPage } from './exportRenderSettle'
import { fontEmbedCssFor, pageFontFaces } from './fontEmbed'

export class BlockedImageError extends Error {
  constructor(urls = []) {
    super("Some pictures can't be read by the browser.")
    this.name = 'BlockedImageError'
    this.urls = urls
  }
}

/** The same request html-to-image makes for each picture. */
const FETCH_INIT = { cache: 'no-cache' }

/** Every http(s) picture a drawn slide uses: <img>, SVG <image>, CSS backgrounds and masks. */
export function imageUrlsIn(node) {
  const urls = new Set()
  const add = (value) => {
    const url = String(value || '').trim()
    if (/^https?:\/\//i.test(url)) urls.add(url)
  }
  node.querySelectorAll('img').forEach((img) => add(img.currentSrc || img.src))
  node.querySelectorAll('image').forEach((img) =>
    add(img.href?.baseVal || img.getAttribute('href') || img.getAttribute('xlink:href'))
  )
  for (const el of [node, ...node.querySelectorAll('*')]) {
    const style = getComputedStyle(el)
    for (const value of [style.backgroundImage, style.maskImage, style.webkitMaskImage]) {
      if (!value || value === 'none') continue
      for (const match of value.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) add(match[1])
    }
  }
  return [...urls]
}

function readable(url, checks) {
  if (!checks.has(url)) {
    checks.set(
      url,
      fetch(url, FETCH_INIT)
        .then((res) => res.ok)
        .catch(() => false)
    )
  }
  return checks.get(url)
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('The browser could not encode the image.'))),
      type,
      quality
    )
  })
}

const FONT_SIZE_ATTR = 'data-export-font-size'

/** Put an exact font size back into an element's inline style string. */
export function withFontSize(style, size) {
  const rest = String(style || '')
    .split(';')
    .filter((decl) => decl.trim() && !/^\s*font-size\s*:/i.test(decl))
    .join(';')
  return `${rest}${rest ? '; ' : ''}font-size: ${size};`
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('The slide could not be drawn.'))
    img.src = src
  })
}

/**
 * Draw a slide node to a canvas of exactly width × height.
 *
 * html-to-image copies each element's computed style, but rounds every font size down and
 * subtracts 0.1px (40.32px → 39.9px), which undoes the editor's fit-to-box sizes and re-wraps
 * text. The exact sizes ride along as an attribute and are put back in the SVG before it is
 * drawn.
 */
async function drawNode(node, { width, height, background, htmlToImage, options }) {
  const stamped = []
  for (const el of [node, ...node.querySelectorAll('*')]) {
    const size = getComputedStyle(el).fontSize
    if (size && size.endsWith('px')) {
      el.setAttribute(FONT_SIZE_ATTR, size)
      stamped.push(el)
    }
  }
  let svgUrl
  try {
    svgUrl = await htmlToImage.toSvg(node, options)
  } finally {
    stamped.forEach((el) => el.removeAttribute(FONT_SIZE_ATTR))
  }
  const svgText = decodeURIComponent(svgUrl.slice(svgUrl.indexOf(',') + 1))
  const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml')
  if (doc.querySelector('parsererror')) throw new Error('The slide could not be drawn.')
  doc.querySelectorAll(`[${FONT_SIZE_ATTR}]`).forEach((el) => {
    el.setAttribute('style', withFontSize(el.getAttribute('style'), el.getAttribute(FONT_SIZE_ATTR)))
    el.removeAttribute(FONT_SIZE_ATTR)
  })
  const fixed = new XMLSerializer().serializeToString(doc)
  const img = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(fixed)}`)
  if (img.decode) await img.decode().catch(() => {})
  // Embedded fonts in an SVG image can paint a frame late: give it one.
  await new Promise((resolve) => requestAnimationFrame(() => resolve()))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (background) {
    ctx.fillStyle = background
    ctx.fillRect(0, 0, width, height)
  }
  ctx.drawImage(img, 0, 0, width, height)
  return canvas
}

/**
 * @param {object} opts
 * @param {object} opts.deck  the saved deck (getPresentation shape: { aspectRatio, themeTokens, slides })
 * @param {string[] | null} opts.slideIds  null = every slide
 * @param {'png' | 'jpeg'} opts.format
 * @param {1 | 2 | 3} opts.scale  1 = the canvas size (1920×1080 for 16:9)
 * @param {number} opts.quality  JPEG quality, 60–100
 * @param {boolean} opts.transparent  PNG only: leave the slide background out
 * @param {(p: { done: number, total: number }) => void} [opts.onProgress]
 * @param {() => boolean} [opts.isCancelled]
 * @returns {Promise<Array<{ slideId: string, position: number, blob: Blob, width: number, height: number }>>}
 *   position: the slide's place in the whole deck (1-based), for file names.
 */
export async function captureSlidesInBrowser({
  deck,
  slideIds = null,
  format = 'png',
  scale = 1,
  quality = 90,
  transparent = false,
  onProgress,
  isCancelled,
  timeoutMs = 60_000,
}) {
  const type = format === 'jpeg' ? 'jpeg' : 'png'
  const clear = type === 'png' && Boolean(transparent)
  // Place in the whole deck (file names), by `order` as the server numbers them.
  const ordered = [...(deck?.slides || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const position = new Map(ordered.map((s, i) => [s.id, i + 1]))
  const prepared = prepareDeck({ deck, slideIds, transparent: clear })
  if (!prepared.slides.length) throw new Error('No slides to export.')

  // The deck's fonts, loaded the same way the editor and the export page load them.
  if (prepared.fontCssUrl) ensureFontCssUrl(prepared.fontCssUrl)
  else ensureThemeFontsLoaded(prepared.themeTokens)
  ensureElementFontsLoaded(collectSlideFontFamilies(prepared.slides))

  const htmlToImage = await import('html-to-image')
  const host = document.createElement('div')
  host.className = 'export-browser-host'
  host.setAttribute('aria-hidden', 'true')
  Object.assign(host.style, {
    position: 'fixed',
    left: '-20000px',
    top: '0',
    width: `${EDITOR_STAGE_WIDTH}px`,
    pointerEvents: 'none',
  })
  document.body.appendChild(host)
  const root = createRoot(host)
  const checks = new Map()
  const images = []
  // Read once the deck's font sheets are on the page (after the first slide settles).
  let faces = null

  try {
    for (let i = 0; i < prepared.slides.length; i += 1) {
      if (isCancelled?.()) throw new Error('Export cancelled.')
      const slide = prepared.slides[i]
      const stage = prepared.stages[slide.id]
      flushSync(() => {
        root.render(
          <ExportSlide
            key={slide.id}
            slide={slide}
            stage={stage}
            themeVisual={prepared.themeVisual}
            fontVars={prepared.fontVars}
            transparent={clear}
          />
        )
      })
      const settled = await settleExportPage(host, { timeoutMs })
      const node = host.querySelector('.export-slide')
      if (!node) throw new Error(`Slide ${i + 1} was not drawn.`)

      const urls = imageUrlsIn(node)
      const results = await Promise.all(urls.map((url) => readable(url, checks)))
      const blocked = urls.filter((_, n) => !results[n])
      if (blocked.length || settled.failedImages?.length) {
        throw new BlockedImageError([...blocked, ...(settled.failedImages || [])])
      }

      if (!faces) faces = await pageFontFaces()
      const fontEmbedCSS = await fontEmbedCssFor(node, faces)

      const { width, height } = imagePixelSize(stage.canvas, scale)
      const canvas = await drawNode(node, {
        width,
        height,
        background: type === 'jpeg' ? '#ffffff' : null,
        htmlToImage,
        options: {
          width: EDITOR_STAGE_WIDTH,
          height: node.offsetHeight,
          cacheBust: false,
          includeQueryParams: true,
          fetchRequestInit: FETCH_INIT,
          fontEmbedCSS,
        },
      })
      const blob = await canvasToBlob(
        canvas,
        type === 'jpeg' ? 'image/jpeg' : 'image/png',
        type === 'jpeg' ? Math.min(1, Math.max(0.6, Number(quality) / 100 || 0.9)) : undefined
      )
      images.push({ slideId: slide.id, position: position.get(slide.id) || i + 1, blob, width, height })
      onProgress?.({ done: i + 1, total: prepared.slides.length })
    }
    return images
  } finally {
    root.unmount()
    host.remove()
  }
}
