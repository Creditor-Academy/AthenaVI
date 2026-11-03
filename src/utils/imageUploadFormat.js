/**
 * Uploads accept JPEG, PNG and WebP only (client and server). Images downloaded from the web
 * are often GIF, AVIF, BMP, SVG or `.jfif`, or arrive without a MIME type at all — those were
 * rejected (or sent as application/octet-stream and refused by the server). This turns any
 * image the browser can draw into an uploadable file, and relabels JPEG/PNG/WebP files whose
 * type is missing or non-standard.
 */

const UPLOADABLE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const TYPE_ALIASES = {
  'image/jpg': 'image/jpeg',
  'image/pjpeg': 'image/jpeg',
  'image/x-png': 'image/png',
}
const EXTENSION_TYPES = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  jpe: 'image/jpeg',
  jfif: 'image/jpeg',
  pjpeg: 'image/jpeg',
  pjp: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}
const CONVERTIBLE_EXTENSIONS = new Set([
  'gif', 'avif', 'apng', 'bmp', 'dib', 'svg', 'ico', 'cur', 'tif', 'tiff', 'heic', 'heif',
])
const MAX_SIDE = 6000
const SVG_TARGET_SIDE = 1600

export function fileExtension(name) {
  const match = /\.([a-z0-9]+)$/i.exec(String(name || ''))
  return match ? match[1].toLowerCase() : ''
}

/** True for anything that is (or claims to be) an image: by MIME type or by file extension. */
export function isImageFile(file) {
  if (!file) return false
  const type = String(file.type || '').toLowerCase()
  if (type.startsWith('image/')) return true
  const ext = fileExtension(file.name)
  return Boolean(EXTENSION_TYPES[ext]) || CONVERTIBLE_EXTENSIONS.has(ext)
}

function baseName(name, fallback = 'image') {
  const raw = String(name || '').replace(/\.[a-z0-9]+$/i, '').trim()
  return raw || fallback
}

function relabel(file, type) {
  const ext = type === 'image/jpeg' ? 'jpg' : type.split('/')[1]
  const keepName = fileExtension(file.name) === ext || (ext === 'jpg' && fileExtension(file.name) === 'jpeg')
  const name = keepName ? file.name : `${baseName(file.name)}.${ext}`
  return new File([file], name, { type, lastModified: file.lastModified })
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('decode failed'))
    img.src = url
  })
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    try {
      canvas.toBlob((blob) => resolve(blob), type, quality)
    } catch {
      resolve(null)
    }
  })
}

function formatLabel(file) {
  const ext = fileExtension(file.name)
  if (ext) return ext.toUpperCase()
  const sub = String(file.type || '').split('/')[1]
  return sub ? sub.toUpperCase() : 'this'
}

async function convertImageFile(file) {
  const url = URL.createObjectURL(file)
  try {
    let img
    try {
      img = await loadImage(url)
    } catch {
      throw new Error(
        `${formatLabel(file)} images can't be used here. Save the picture as JPEG or PNG and try again.`
      )
    }
    const isSvg = String(file.type).includes('svg') || fileExtension(file.name) === 'svg'
    let width = img.naturalWidth || 0
    let height = img.naturalHeight || 0
    if (!width || !height) {
      // An SVG without width/height has no intrinsic size.
      width = SVG_TARGET_SIDE
      height = SVG_TARGET_SIDE
    }
    const longest = Math.max(width, height)
    const target = isSvg ? Math.min(MAX_SIDE, Math.max(SVG_TARGET_SIDE, longest)) : Math.min(MAX_SIDE, longest)
    const scale = target / longest
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(width * scale))
    canvas.height = Math.max(1, Math.round(height * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('This image could not be prepared for upload. Try a JPEG or PNG.')
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    // WebP keeps transparency and stays small; a browser that can't encode WebP returns PNG.
    let blob = await canvasToBlob(canvas, 'image/webp', 0.92)
    if (!blob || !UPLOADABLE_TYPES.has(blob.type)) blob = await canvasToBlob(canvas, 'image/png')
    if (!blob) throw new Error('This image could not be prepared for upload. Try a JPEG or PNG.')
    const ext = blob.type === 'image/png' ? 'png' : 'webp'
    return new File([blob], `${baseName(file.name)}.${ext}`, { type: blob.type, lastModified: file.lastModified })
  } finally {
    URL.revokeObjectURL(url)
  }
}

/**
 * Returns a file the upload endpoints accept. Non-image files (video, audio) and files that are
 * already JPEG/PNG/WebP come back unchanged.
 */
export async function prepareImageForUpload(file) {
  if (!file) return file
  const type = String(file.type || '').toLowerCase()
  if (UPLOADABLE_TYPES.has(type)) return file
  const ext = fileExtension(file.name)
  const alias =
    TYPE_ALIASES[type] ||
    (!type || type === 'application/octet-stream' ? EXTENSION_TYPES[ext] : null)
  if (alias) return relabel(file, alias)
  if (!isImageFile(file)) return file
  if (typeof document === 'undefined' || typeof URL?.createObjectURL !== 'function') return file
  return convertImageFile(file)
}

const SHRINK_STEPS = [
  { side: 2560, quality: 0.86 },
  { side: 1920, quality: 0.8 },
  { side: 1600, quality: 0.75 },
]

/**
 * A smaller copy of a JPEG/PNG/WebP image, used when the server (or a proxy in front of it)
 * refuses the original as too large. Steps down until it fits `maxBytes`; null when the
 * image can't be read or made smaller.
 */
export async function shrinkImageForUpload(file, { maxBytes = 950 * 1024 } = {}) {
  if (!file || typeof document === 'undefined' || typeof URL?.createObjectURL !== 'function') return null
  if (!UPLOADABLE_TYPES.has(String(file.type || '').toLowerCase())) return null
  const url = URL.createObjectURL(file)
  try {
    const img = await loadImage(url)
    const width = img.naturalWidth || 0
    const height = img.naturalHeight || 0
    if (!width || !height) return null
    let best = null
    for (const step of SHRINK_STEPS) {
      const scale = Math.min(1, step.side / Math.max(width, height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(width * scale))
      canvas.height = Math.max(1, Math.round(height * scale))
      const ctx = canvas.getContext('2d')
      if (!ctx) return null
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      let blob = await canvasToBlob(canvas, 'image/webp', step.quality)
      if (!blob || !UPLOADABLE_TYPES.has(blob.type)) blob = await canvasToBlob(canvas, 'image/jpeg', step.quality)
      if (!blob) continue
      best = blob
      if (blob.size <= maxBytes) break
    }
    if (!best || best.size >= file.size) return null
    const ext = best.type === 'image/webp' ? 'webp' : 'jpg'
    return new File([best], `${baseName(file.name)}.${ext}`, { type: best.type, lastModified: file.lastModified })
  } catch {
    return null
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** Natural size of an image file (for placing it), or null when it can't be read. */
export async function readImageSize(file) {
  if (!file || typeof URL?.createObjectURL !== 'function') return null
  const url = URL.createObjectURL(file)
  try {
    const img = await loadImage(url)
    const width = img.naturalWidth || 0
    const height = img.naturalHeight || 0
    return width && height ? { width, height } : null
  } catch {
    return null
  } finally {
    URL.revokeObjectURL(url)
  }
}

/**
 * Placement for a new image on a page: natural aspect ratio, at most 60% of the page, centred
 * on `center` (canvas units) or on the page, and kept inside the page.
 */
export function imagePlacementForPage(size, page, center = null) {
  const pageW = Number(page?.width) || 1280
  const pageH = Number(page?.height) || 720
  const natW = Number(size?.width) || pageW * 0.4
  const natH = Number(size?.height) || pageH * 0.4
  const scale = Math.min(1, (pageW * 0.6) / natW, (pageH * 0.6) / natH)
  const width = Math.max(20, Math.round(natW * scale))
  const height = Math.max(20, Math.round(natH * scale))
  const cx = center && Number.isFinite(center.x) ? center.x : pageW / 2
  const cy = center && Number.isFinite(center.y) ? center.y : pageH / 2
  const x = Math.round(Math.min(Math.max(0, cx - width / 2), Math.max(0, pageW - width)))
  const y = Math.round(Math.min(Math.max(0, cy - height / 2), Math.max(0, pageH - height)))
  return { x, y, width, height, rotation: 0, opacity: 1 }
}

/** Image files in a paste/drop DataTransfer. */
export function imageFilesFromDataTransfer(data) {
  if (!data) return []
  const files = Array.from(data.files || []).filter(isImageFile)
  if (files.length) return files
  return Array.from(data.items || [])
    .filter((item) => item.kind === 'file')
    .map((item) => item.getAsFile())
    .filter((file) => file && isImageFile(file))
}
