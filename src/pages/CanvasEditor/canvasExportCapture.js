import { dataUrlToBlob, waitForImages } from '../../utils/export/capture.js'
import { inlinePageImages, pageWithoutImages } from '../../utils/export/inlineImages.js'
import { buildUrl, getAuthHeaders } from '../../config/api'

export { waitForImages }

/** Our API's copy of an image (backend /api/media/image), when its host refuses the browser. */
export const exportImageProxy = {
  url: (imageUrl) => buildUrl(`/api/media/image?url=${encodeURIComponent(imageUrl)}`),
  headers: () => {
    const headers = { ...getAuthHeaders() }
    delete headers['Content-Type']
    return headers
  },
}

/**
 * The pages to draw, with every picture downloaded fresh (inlineImages.js) so a copy the browser
 * cached without CORS headers can't block the export. Resolves `{ pages, blocked }`; `blocked`
 * lists pictures that couldn't be loaded on any page. With `skipBlocked`, those are left out of
 * the pages (the user chose "Export without them").
 */
export async function preparePagesForExport(pages, { skipBlocked = false, proxy = exportImageProxy, fetchImpl } = {}) {
  const cache = new Map()
  const ready = []
  const blocked = []
  for (const page of pages) {
    const result = await inlinePageImages(page, { proxy, cache, ...(fetchImpl ? { fetchImpl } : {}) })
    ready.push(result.page)
    for (const item of result.blocked) {
      if (!blocked.some((b) => b.url === item.url)) blocked.push(item)
    }
  }
  if (skipBlocked && blocked.length) {
    const skip = new Set(blocked.map((item) => item.url))
    return { pages: ready.map((page) => pageWithoutImages(page, skip)), blocked }
  }
  return { pages: ready, blocked }
}

/**
 * Rasterize an offscreen page node. Does not touch the live stage.
 * `format` is png, jpeg, or webp. PDF callers capture png at scale 1.
 */
export async function captureExportNode(node, { format = 'png', scale = 1, background, transparent = false } = {}) {
  if (!node) throw new Error('Nothing to export.')
  if (document.fonts?.ready) await document.fonts.ready
  await waitForImages(node)

  const { toPng, toJpeg, toCanvas } = await import('html-to-image')
  const pixelRatio = scale === 4 ? 4 : scale === 2 ? 2 : 1
  // Pictures are already data URLs (preparePagesForExport). Cache-busting would only add a
  // query to the few remaining addresses (fonts), and it breaks presigned links.
  const common = { pixelRatio, cacheBust: false, skipFonts: false }

  if (format === 'jpeg') {
    const dataUrl = await toJpeg(node, {
      ...common,
      quality: 0.92,
      backgroundColor: background || '#ffffff',
    })
    return dataUrlToBlob(dataUrl)
  }

  if (format === 'webp') {
    // html-to-image's toBlob ignores `type` and always returns a PNG, so encode the canvas here.
    const canvas = await toCanvas(node, {
      ...common,
      backgroundColor: transparent ? undefined : background || '#ffffff',
    })
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.92))
    if (!blob) throw new Error('This browser could not build a WebP file.')
    if (blob.type && blob.type !== 'image/webp') {
      throw new Error('This browser cannot export WebP.')
    }
    return blob
  }

  const dataUrl = await toPng(node, {
    ...common,
    backgroundColor: transparent ? undefined : background || '#ffffff',
  })
  return dataUrlToBlob(dataUrl)
}
