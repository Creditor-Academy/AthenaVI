import { imageLabelsOnPage, describeExportError } from './canvasExport.js'
import { dataUrlToBlob, probeImage, waitForImages } from '../../utils/export/capture.js'

export { probeImage, waitForImages }

export async function blockedImagesOnPage(page) {
  const blocked = []
  for (const image of imageLabelsOnPage(page)) {
    try {
      // Sequential so a failure names the image that failed, in order.
      // eslint-disable-next-line no-await-in-loop
      await probeImage(image.url)
    } catch {
      blocked.push(image)
    }
  }
  return blocked
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
  const common = { pixelRatio, cacheBust: true, skipFonts: false }

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

export async function assertPageIsExportable(page) {
  const blocked = await blockedImagesOnPage(page)
  if (blocked.length) {
    throw new Error(describeExportError(new Error('tainted'), blocked))
  }
}
