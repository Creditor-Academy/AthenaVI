import {
  getSlideImage,
  showsSlideFallback,
  resolveCanvasSize,
  resolveSlideStageBackground,
} from '../../../../utils/presentationHelpers'
import { resolveStageElements } from '../../../../utils/slideStageElements'

/**
 * What a slide shows in a slideshow: its canvas, the elements the editor draws (groups only frame
 * their children and draw nothing), its background, and the title / picture placeholder for a
 * slide that never had a canvas (B-3).
 */
export function slideLayout(slide, aspectRatio, themeVisual) {
  const canvas = resolveCanvasSize(slide, aspectRatio)
  const palette = themeVisual?.palette || null
  const elements = resolveStageElements(slide, canvas, palette).filter((el) => el.type !== 'group')
  const showFallback = elements.length === 0 && showsSlideFallback(slide)
  return {
    canvas,
    palette,
    elements,
    showFallback,
    fallbackImage: showFallback ? getSlideImage(slide).url : null,
    // The background photo is drawn as a layer by resolveStageElements (E-4a).
    background: resolveSlideStageBackground(slide, themeVisual?.inner || '#fff', palette, { photoLayer: true }),
  }
}
