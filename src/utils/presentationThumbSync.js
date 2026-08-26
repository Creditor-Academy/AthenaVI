import presentationService from '../services/presentationService'
import {
  getSlideImage,
  extractSlidesFromPresentation,
} from './presentationHelpers'
import { resolvePresentationThumbnailUrl } from './workspaceLibrary'
import {
  clearMemoryThumbLoad,
  getCachedPresentationThumb,
  getMemoryThumbLoad,
  presentationThumbMemoryKey,
  setCachedPresentationThumb,
  setMemoryThumbLoad,
} from './presentationThumbCache'

function pickFirstSlideImage(slide, deck = null) {
  if (!slide) return null
  return (
    resolvePresentationThumbnailUrl({ ...(deck || {}), slides: [slide] }) ||
    getSlideImage(slide).url ||
    null
  )
}

/**
 * Resolve first-slide thumb for a presentation: memory → IndexedDB → network.
 * Persists image URL (and optional slide snapshot) for fast revisits.
 */
export async function resolvePresentationThumbPayload(item) {
  const workspaceId = item?.workspaceId
  const presentationId = item?.id
  if (!workspaceId || !presentationId) {
    return { imageUrl: null, slide: null, aspectRatio: item?.aspectRatio || '16:9' }
  }

  const updatedAt = item.lastModifiedAt || item.updatedAt || item.completedAt || null
  const catalogUrl = resolvePresentationThumbnailUrl(item)
  if (catalogUrl) {
    setCachedPresentationThumb({
      workspaceId,
      presentationId,
      imageUrl: catalogUrl,
      aspectRatio: item.aspectRatio || '16:9',
      updatedAt,
    }).catch(() => {})
    return { imageUrl: catalogUrl, slide: null, aspectRatio: item.aspectRatio || '16:9' }
  }

  const cached = await getCachedPresentationThumb(workspaceId, presentationId, updatedAt)
  if (cached?.imageUrl || cached?.slide) {
    return {
      imageUrl: cached.imageUrl || null,
      slide: cached.slide || null,
      aspectRatio: cached.aspectRatio || item.aspectRatio || '16:9',
    }
  }

  const memKey = presentationThumbMemoryKey(workspaceId, presentationId)
  const existing = getMemoryThumbLoad(memKey)
  if (existing) return existing

  const load = presentationService
    .getPresentation(workspaceId, presentationId)
    .then(async (deck) => {
      const slides = extractSlidesFromPresentation(deck)
      const slide = slides[0] || null
      const aspectRatio = deck?.aspectRatio || slide?.aspectRatio || item.aspectRatio || '16:9'
      if (!slide) {
        return { imageUrl: null, slide: null, aspectRatio }
      }
      const imageUrl = pickFirstSlideImage(slide, deck)
      const elements = slide?.elements?.elements || slide?.elements || []
      const hasCanvas = Array.isArray(elements) && elements.length > 0
      const payload = {
        imageUrl,
        slide: imageUrl || hasCanvas ? slide : null,
        aspectRatio,
      }

      await setCachedPresentationThumb({
        workspaceId,
        presentationId,
        imageUrl: payload.imageUrl,
        slide: payload.imageUrl ? null : payload.slide,
        aspectRatio,
        updatedAt: deck?.updatedAt || deck?.lastModifiedAt || updatedAt,
      })

      if (payload.imageUrl) {
        presentationService
          .updateThumbnail(workspaceId, presentationId, {
            thumbnailUrl: payload.imageUrl,
            slideId: slide.id,
          })
          .catch(() => {})
      }

      return payload
    })
    .catch((error) => {
      clearMemoryThumbLoad(memKey)
      throw error
    })

  setMemoryThumbLoad(memKey, load)
  return load
}

/**
 * Push first-slide cover into local cache + backend (editor / generate complete).
 */
export function syncPresentationThumbnailFromSlides({
  workspaceId,
  presentationId,
  slides = [],
  updatedAt = null,
  aspectRatio = '16:9',
} = {}) {
  if (!workspaceId || !presentationId) return
  const slide = Array.isArray(slides) && slides.length ? slides[0] : null
  const imageUrl = pickFirstSlideImage(slide)
  if (!imageUrl && !slide) return

  setCachedPresentationThumb({
    workspaceId,
    presentationId,
    imageUrl,
    slide: imageUrl ? null : slide,
    aspectRatio,
    updatedAt,
  }).catch(() => {})

  if (imageUrl) {
    presentationService
      .updateThumbnail(workspaceId, presentationId, {
        thumbnailUrl: imageUrl,
        slideId: slide?.id,
      })
      .catch(() => {})
  }
}
