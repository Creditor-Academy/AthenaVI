import { imageLabelsOnPage, describeExportError } from './canvasExport.js'

function dataUrlToBlob(dataUrl) {
  const [header, body] = String(dataUrl).split(',')
  const mime = /data:([^;]+)/.exec(header)?.[1] || 'application/octet-stream'
  const binary = atob(body)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

export function waitForImages(root) {
  const images = [...(root?.querySelectorAll?.('img') || [])]
  return Promise.all(
    images.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) {
            resolve()
            return
          }
          img.addEventListener('load', () => resolve(), { once: true })
          img.addEventListener('error', () => resolve(), { once: true })
        })
    )
  )
}

/** Draw one remote image. A tainted canvas means the host blocked the export. */
export function probeImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = 1
        canvas.height = 1
        canvas.getContext('2d').drawImage(img, 0, 0)
        canvas.toDataURL()
        resolve()
      } catch (error) {
        reject(error)
      }
    }
    img.onerror = () => reject(new Error('tainted'))
    img.src = url
  })
}

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

  const { toPng, toJpeg, toBlob } = await import('html-to-image')
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
    const blob = await toBlob(node, {
      ...common,
      type: 'image/webp',
      quality: 0.92,
      backgroundColor: transparent ? undefined : background || '#ffffff',
    })
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
