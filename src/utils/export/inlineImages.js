/**
 * Images for an in-browser export (Canvas PNG / JPG / WebP / PDF).
 *
 * A browser only lets an export read an image when the image host sends CORS headers. The
 * editor first shows each picture with a plain <img>; S3 answers that request without CORS
 * headers and the browser caches it. A later CORS request for the same address is then served
 * from that cache and refused ("the image host blocked it"), even though the bucket allows our
 * site. So before drawing, each image is downloaded again here — bypassing the cache — and the
 * page is drawn from those copies (data URLs). When the host still refuses (no CORS for this
 * origin, e.g. a dev or staging site), the copy comes through our API (/api/media/image).
 * Images that can't be loaded either way are reported, so the user can export without them.
 */

/** Element fields that hold a picture's address. */
const IMAGE_KEYS = ['url', 'src', 'imageUrl', 'thumbnailUrl', 'previewUrl', 'screenUrl']
/** Types whose `url` / `src` is not a picture (a web page, a video, a sound). */
const NOT_A_PICTURE_URL = new Set(['embed', 'link', 'video', 'audio'])
const PICTURE_ELEMENT_TYPES = new Set(['image', 'icon'])

const isRemote = (value) => typeof value === 'string' && /^https?:\/\//i.test(value)

function keysFor(element) {
  return NOT_A_PICTURE_URL.has(element?.type) ? IMAGE_KEYS.filter((k) => k !== 'url' && k !== 'src') : IMAGE_KEYS
}

/** File name shown to the user for an image address. */
export function imageNameOf(url) {
  try {
    const path = new URL(url, 'https://design.local').pathname
    return decodeURIComponent(path.split('/').filter(Boolean).pop() || '') || 'image'
  } catch {
    return 'image'
  }
}

/** Every remote picture on a page (background and elements), once each: `[{ url, name }]`. */
export function pageImageRefs(page) {
  const found = []
  const add = (url) => {
    if (isRemote(url) && !found.some((item) => item.url === url)) found.push({ url, name: imageNameOf(url) })
  }
  add(page?.backgroundImage)
  for (const element of page?.elements || []) {
    const content = element?.content || {}
    for (const key of keysFor(element)) add(content[key])
  }
  return found
}

/** A copy of the page with each picture address passed through `swap(url)`. */
function mapPageImages(page, swap) {
  if (!page) return page
  const next = { ...page }
  if (isRemote(page.backgroundImage)) next.backgroundImage = swap(page.backgroundImage)
  next.elements = (page.elements || []).map((element) => {
    const content = element?.content
    if (!content) return element
    let changed = null
    for (const key of keysFor(element)) {
      if (!isRemote(content[key])) continue
      const value = swap(content[key])
      if (value !== content[key]) {
        changed = changed || { ...content }
        changed[key] = value
      }
    }
    return changed ? { ...element, content: changed } : element
  })
  return next
}

/** The page with each address in `replacements` (Map url → new url) swapped. */
export function replacePageImages(page, replacements) {
  return mapPageImages(page, (url) => (replacements.has(url) ? replacements.get(url) : url))
}

/**
 * The page without the given pictures: a picture element whose image is missing is left out
 * (rather than drawn as an empty placeholder), and so is a missing background image.
 */
export function pageWithoutImages(page, urls) {
  const skip = urls instanceof Set ? urls : new Set(urls || [])
  if (!page || !skip.size) return page
  const elements = (page.elements || []).filter((element) => {
    if (!PICTURE_ELEMENT_TYPES.has(element?.type)) return true
    const refs = keysFor(element).map((k) => element.content?.[k]).filter(isRemote)
    return !refs.length || refs.some((url) => !skip.has(url))
  })
  const next = mapPageImages({ ...page, elements }, (url) => (skip.has(url) ? '' : url))
  if (skip.has(page.backgroundImage)) delete next.backgroundImage
  return next
}

/** Image type from the first bytes (stored files are sometimes labelled octet-stream). */
function sniffImageType(bytes) {
  const b = bytes
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png'
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg'
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return 'image/gif'
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45) return 'image/webp'
  const head = String.fromCharCode(...b.subarray(0, 256)).trimStart().toLowerCase()
  if (head.startsWith('<svg') || (head.startsWith('<?xml') && head.includes('<svg'))) return 'image/svg+xml'
  return null
}

/** A downloaded picture as a data URL, or null when it isn't a picture. */
async function blobToImageDataUrl(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer())
  if (!bytes.length) return null
  const declared = String(blob.type || '').split(';')[0].toLowerCase()
  const type = declared.startsWith('image/') ? declared : sniffImageType(bytes)
  if (!type) return null
  let binary = ''
  const CHUNK = 0x8000
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK))
  }
  return `data:${type};base64,${btoa(binary)}`
}

/**
 * One picture as a data URL: straight from its host (bypassing the browser cache), else through
 * `proxy` (our API). Throws when neither works.
 * @param {string} url
 * @param {{ fetchImpl?: typeof fetch, proxy?: { url: (u: string) => string, headers?: () => object } | null }} [opts]
 */
export async function loadImageDataUrl(url, { fetchImpl = fetch, proxy = null } = {}) {
  try {
    const res = await fetchImpl(url, { mode: 'cors', cache: 'no-store', credentials: 'omit' })
    if (res.ok) {
      const dataUrl = await blobToImageDataUrl(await res.blob())
      if (dataUrl) return dataUrl
    }
  } catch {
    // CORS refused or network error: try our API below.
  }
  if (proxy?.url) {
    const res = await fetchImpl(proxy.url(url), { headers: proxy.headers?.() || {}, cache: 'no-store' })
    if (res.ok) {
      const dataUrl = await blobToImageDataUrl(await res.blob())
      if (dataUrl) return dataUrl
    }
  }
  throw new Error(`Couldn't load ${imageNameOf(url)}`)
}

/**
 * Download every picture on `page` (4 at a time). Resolves `{ page, blocked }`: the page with
 * its pictures as data URLs, and the pictures that couldn't be loaded (`[{ url, name }]`),
 * which are left as they were.
 */
export async function inlinePageImages(page, { fetchImpl = fetch, proxy = null, concurrency = 4, cache = null } = {}) {
  const refs = pageImageRefs(page)
  const replacements = new Map()
  const blocked = []
  let next = 0
  const worker = async () => {
    while (next < refs.length) {
      const ref = refs[next]
      next += 1
      try {
        let dataUrl = cache?.get(ref.url)
        if (!dataUrl) {
          dataUrl = await loadImageDataUrl(ref.url, { fetchImpl, proxy })
          cache?.set(ref.url, dataUrl)
        }
        replacements.set(ref.url, dataUrl)
      } catch {
        blocked.push(ref)
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, refs.length) }, worker))
  // Report in page order, so the message names images as the user sees them.
  blocked.sort((a, b) => refs.indexOf(a) - refs.indexOf(b))
  return { page: replacePageImages(page, replacements), blocked }
}
