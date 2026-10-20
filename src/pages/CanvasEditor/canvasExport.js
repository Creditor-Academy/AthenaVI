/** Which pages, and which file, an export produces. No DOM. */

export const EXPORT_FORMATS = [
  { id: 'png', name: 'PNG Image', desc: 'Best for web and graphic design. Can be transparent.', mime: 'image/png', ext: '.png' },
  { id: 'jpeg', name: 'JPEG Image', desc: 'Smaller file. Always a solid background.', mime: 'image/jpeg', ext: '.jpg' },
  { id: 'webp', name: 'WebP Image', desc: 'Modern image. Can be transparent.', mime: 'image/webp', ext: '.webp' },
  { id: 'pdf', name: 'PDF', desc: 'One file, one page per design page, at the design size.', mime: 'application/pdf', ext: '.pdf' },
]

export const EXPORT_SCALES = [1, 2, 4]

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

function crc32(bytes) {
  let c = 0xffffffff
  for (let i = 0; i < bytes.length; i += 1) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function u16(view, offset, value) {
  view.setUint16(offset, value, true)
}

function u32(view, offset, value) {
  view.setUint32(offset, value, true)
}

/** Uncompressed zip. Several raster pages download as one file. */
export function zipStoredFiles(files) {
  const encoded = files.map((file) => ({
    name: new TextEncoder().encode(file.name),
    data: file.bytes instanceof Uint8Array ? file.bytes : new Uint8Array(file.bytes),
  }))
  encoded.forEach((file) => {
    file.crc = crc32(file.data)
  })

  let localSize = 0
  encoded.forEach((file) => {
    localSize += 30 + file.name.length + file.data.length
  })
  let centralSize = 0
  encoded.forEach((file) => {
    centralSize += 46 + file.name.length
  })

  const out = new Uint8Array(localSize + centralSize + 22)
  const view = new DataView(out.buffer)
  let offset = 0
  const localOffsets = []

  encoded.forEach((file) => {
    localOffsets.push(offset)
    u32(view, offset, 0x04034b50)
    u16(view, offset + 4, 20)
    u16(view, offset + 8, 0)
    u32(view, offset + 14, file.crc)
    u32(view, offset + 18, file.data.length)
    u32(view, offset + 22, file.data.length)
    u16(view, offset + 26, file.name.length)
    out.set(file.name, offset + 30)
    out.set(file.data, offset + 30 + file.name.length)
    offset += 30 + file.name.length + file.data.length
  })

  const centralStart = offset
  encoded.forEach((file, index) => {
    u32(view, offset, 0x02014b50)
    u16(view, offset + 4, 20)
    u16(view, offset + 6, 20)
    u32(view, offset + 16, file.crc)
    u32(view, offset + 20, file.data.length)
    u32(view, offset + 24, file.data.length)
    u16(view, offset + 28, file.name.length)
    u32(view, offset + 42, localOffsets[index])
    out.set(file.name, offset + 46)
    offset += 46 + file.name.length
  })

  u32(view, offset, 0x06054b50)
  u16(view, offset + 8, encoded.length)
  u16(view, offset + 10, encoded.length)
  u32(view, offset + 12, centralSize)
  u32(view, offset + 16, centralStart)
  return out
}

export function slugTitle(title) {
  const slug = String(title || 'design')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return slug || 'design'
}

export function exportFileName(title, { ext, width, height, pageNumber, pageCount } = {}) {
  const pageBit = pageCount > 1 && pageNumber ? `-page-${pageNumber}` : ''
  const sizeBit = width && height ? `-${width}x${height}` : ''
  return `${slugTitle(title)}${pageBit}${sizeBit}${ext || ''}`
}

/**
 * Pages to export. `rangeStart` and `rangeEnd` are 1-based and inclusive.
 * Returns `{ pages, error }`.
 */
export function pagesForExport(canvases, { scope = 'current', activeIndex = 0, rangeStart = 1, rangeEnd = 1 } = {}) {
  const pages = Array.isArray(canvases) ? canvases : []
  if (!pages.length) return { pages: [], error: 'This design has no pages to export.' }
  if (scope === 'all') return { pages, error: null }
  if (scope === 'range') {
    const start = Number(rangeStart)
    const end = Number(rangeEnd)
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end > pages.length || start > end) {
      return { pages: [], error: `Enter a page range from 1 to ${pages.length}.` }
    }
    return { pages: pages.slice(start - 1, end), error: null }
  }
  const index = pages[activeIndex] ? activeIndex : 0
  return { pages: [pages[index]], error: null }
}

function imageFileName(url) {
  try {
    const path = new URL(url, 'https://design.local').pathname
    const base = decodeURIComponent(path.split('/').filter(Boolean).pop() || '')
    return base || 'image'
  } catch {
    return 'image'
  }
}

/** http(s) images on a page, so a CORS failure can name the file. */
export function imageLabelsOnPage(page) {
  const found = []
  const push = (url) => {
    if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) return
    if (found.some((item) => item.url === url)) return
    found.push({ url, name: imageFileName(url) })
  }
  push(page?.backgroundImage)
  for (const element of page?.elements || []) {
    const content = element?.content || {}
    push(content.url)
    push(content.src)
    push(content.imageUrl)
  }
  return found
}

export function describeExportError(error, images = []) {
  const text = String(error?.message || error || 'Export failed.')
  if (text.startsWith("Couldn't draw")) return text
  const blocked = /taint|cors|securityerror|cross-origin|blocked/i.test(text)
  if (!blocked) return text || 'Export failed.'
  const names = images.map((item) => item?.name).filter(Boolean).slice(0, 3)
  if (!names.length) {
    return "Couldn't draw an image into the file. The image host blocked it, so nothing was saved."
  }
  const listed = names.map((name) => `“${name}”`).join(', ')
  return `Couldn't draw ${listed}. The image host blocked it, so nothing was saved.`
}

function pdfOrientation(width, height) {
  return width >= height ? 'landscape' : 'portrait'
}

/** PDF page box matches the design's pixel width and height. Raster scale does not apply. */
export async function buildDesignPdf(pages) {
  if (!pages?.length) throw new Error('This design has no pages to export.')
  const { jsPDF } = await import('jspdf')
  const first = pages[0]
  const doc = new jsPDF({
    unit: 'pt',
    format: [first.width, first.height],
    orientation: pdfOrientation(first.width, first.height),
    compress: true,
  })
  pages.forEach((page, index) => {
    if (index > 0) doc.addPage([page.width, page.height], pdfOrientation(page.width, page.height))
    doc.addImage(page.dataUrl, 'PNG', 0, 0, page.width, page.height)
  })
  return doc.output('blob')
}
