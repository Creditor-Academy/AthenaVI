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

function patchSlideGraphics(slide, cache) {
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
}

async function fetchGraphicIntoCache(id, cache) {
  if (cache.has(id)) return
  try {
    const data = await graphicsService.get(id)
    const graphic = data?.graphic || data
    if (graphic?.fileUrl) cache.set(id, graphic)
  } catch {
    /* unpublished or deleted asset */
  }
}

/**
 * Refresh graphic file URLs from the catalog (presigned S3 links expire).
 * By default hydrates one slide at a time so the editor can paint progressively.
 */
export async function hydrateSlidesGraphicElements(
  slides = [],
  { sequential = true, onSlideHydrated } = {}
) {
  if (!Array.isArray(slides) || !slides.length) return slides

  const cache = new Map()

  if (!sequential) {
    const ids = collectGraphicAssetIds(slides)
    if (!ids.length) return slides
    await Promise.all(ids.map((id) => fetchGraphicIntoCache(id, cache)))
    if (!cache.size) return slides
    return slides.map((slide) => patchSlideGraphics(slide, cache))
  }

  const result = []
  for (let i = 0; i < slides.length; i += 1) {
    const slide = slides[i]
    const ids = collectGraphicAssetIds([slide])
    // Sequential within the slide too — avoid bursting the graphics API.
    for (const id of ids) {
      // eslint-disable-next-line no-await-in-loop
      await fetchGraphicIntoCache(id, cache)
    }
    const next = patchSlideGraphics(slide, cache)
    result.push(next)
    onSlideHydrated?.(next, i, result)
  }
  return result
}
