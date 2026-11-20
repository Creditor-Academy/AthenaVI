/** Which pages, and which file, an export produces. No DOM. */

export const EXPORT_FORMATS = [
  { id: 'png', name: 'PNG Image', desc: 'Best for web and graphic design. Can be transparent.', mime: 'image/png', ext: '.png' },
  { id: 'jpeg', name: 'JPEG Image', desc: 'Smaller file. Always a solid background.', mime: 'image/jpeg', ext: '.jpg' },
  { id: 'webp', name: 'WebP Image', desc: 'Modern image. Can be transparent.', mime: 'image/webp', ext: '.webp' },
  { id: 'pdf', name: 'PDF', desc: 'One file, one page per design page, at the design size.', mime: 'application/pdf', ext: '.pdf' },
]

export const EXPORT_SCALES = [1, 2, 4]

export { zipStoredFiles } from '../../utils/export/zip.js'
import { pageImageRefs } from '../../utils/export/inlineImages.js'

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

/** http(s) pictures on a page (background and elements), so a failed load can name the file. */
export function imageLabelsOnPage(page) {
  return pageImageRefs(page)
}

/** The message for pictures that couldn't be loaded into the file (`[{ name }]`). */
export function describeBlockedImages(images = []) {
  const names = images.map((item) => item?.name).filter(Boolean)
  if (!names.length) {
    return "Couldn't load an image on this page, so nothing was saved. Export without it, or replace the image."
  }
  const shown = names.slice(0, 3).map((name) => `“${name}”`).join(', ')
  const more = names.length > 3 ? ` and ${names.length - 3} more` : ''
  const one = names.length === 1
  return `Couldn't load ${shown}${more}, so nothing was saved. Export without ${one ? 'it' : 'them'}, or replace ${one ? 'the image' : 'the images'}.`
}

export function describeExportError(error, images = []) {
  const text = String(error?.message || error || 'Export failed.')
  if (text.startsWith("Couldn't")) return text
  const blocked = /taint|cors|securityerror|cross-origin|blocked/i.test(text)
  if (!blocked) return text || 'Export failed.'
  return describeBlockedImages(images)
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
