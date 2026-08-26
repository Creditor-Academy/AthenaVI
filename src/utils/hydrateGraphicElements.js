import graphicsService from '../services/graphicsService'

function collectGraphicAssetIds(slides = []) {
  const ids = new Set()
  for (const slide of slides) {
    for (const el of slide?.elements?.elements || []) {
      if (el?.type !== 'graphic') continue
      const c = el.content || {}
      const id = c.assetId != null ? String(c.assetId) : ''
      // SVGL logos use remote URLs (svgl:*) — do not resolve via Graphics Library API
      if (!id || id.startsWith('svgl:')) continue
      ids.add(id)
    }
  }
  return [...ids]
}

function patchGraphicContent(content, graphic) {
  if (!graphic) return content
  return {
    ...content,
    src: graphic.fileUrl || content.src,
    url: graphic.fileUrl || content.url,
    previewUrl: graphic.previewUrl || content.previewUrl,
    s3Key: graphic.s3Key || content.s3Key,
    colorMode: content.colorMode || graphic.colorMode,
    alt: content.alt || graphic.name,
  }
}

/**
 * Refresh graphic file URLs from the catalog (presigned S3 links expire).
 * Always re-fetches when assetId is present so previews stay valid.
 */
export async function hydrateSlidesGraphicElements(slides = []) {
  const ids = collectGraphicAssetIds(slides)
  if (!ids.length) return slides

  const cache = new Map()
  await Promise.all(
    ids.map(async (id) => {
      try {
        const data = await graphicsService.get(id)
        const graphic = data?.graphic || data
        if (graphic?.fileUrl) cache.set(id, graphic)
      } catch {
        /* unpublished or deleted asset */
      }
    })
  )

  if (!cache.size) return slides

  return slides.map((slide) => {
    const elements = slide?.elements?.elements
    if (!Array.isArray(elements) || !elements.some((el) => el?.type === 'graphic')) return slide

    let changed = false
    const nextElements = elements.map((el) => {
      if (el?.type !== 'graphic') return el
      const c = el.content || {}
      if (!c.assetId) return el
      const graphic = cache.get(String(c.assetId))
      if (!graphic) return el
      changed = true
      return { ...el, content: patchGraphicContent(c, graphic) }
    })

    if (!changed) return slide
    return {
      ...slide,
      elements: {
        ...(slide.elements || {}),
        elements: nextElements,
      },
    }
  })
}
