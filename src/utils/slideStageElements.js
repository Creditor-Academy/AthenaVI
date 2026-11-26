import { isSlideBackgroundElement, slideBackgroundPhotoElement } from './presentationHelpers'
import { shouldPaintElement } from './canvasRenderDebug'
import { finalizeChartShapes } from './chartShapeFinalize'
import { syncPptGroupBounds } from './pptGroupUtils'

/**
 * Width (px) the editor lays a slide out at. Font sizes, padding and radii are stored as px
 * at this width — the exporter scales them the same way (backend FONT_REF_WIDTH = 900).
 * Anything that shows a slide must lay it out at this width and scale the whole stage, or
 * text comes out a different size relative to the slide than in the editor.
 */
export const EDITOR_STAGE_WIDTH = 900

/**
 * The elements a slide stage paints, prepared exactly as the editor does: group frames fitted
 * to their children, the background image element left out, and custom chart layouts
 * finalized. Shared by the editor stage and Present so both show the same slide.
 */
/**
 * The background photo as a full-slide layer under everything (E-4a): the photo element itself,
 * so its filters, effects, fit, flips and crop show. Not interactive (`backgroundLayer`); it is
 * selected and edited through the photo element (click on the slide, Design → Background photo).
 */
function backgroundPhotoLayer(slide, canvas) {
  const photo = slideBackgroundPhotoElement(slide)
  if (!photo) return []
  return [
    {
      ...photo,
      id: `bg-layer-${photo.id}`,
      sourceElementId: photo.id,
      backgroundLayer: true,
      locked: true,
      groupId: undefined,
      layer: -1,
      placement: {
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height,
        rotation: 0,
        opacity: photo.placement?.opacity ?? 1,
      },
      content: { ...photo.content, fit: photo.content?.fit || 'cover' },
    },
  ]
}

export function resolveStageElements(slide, canvas, palette) {
  return [...backgroundPhotoLayer(slide, canvas), ...resolveForegroundElements(slide, canvas, palette)]
}

function resolveForegroundElements(slide, canvas, palette) {
  const rawElements = syncPptGroupBounds(slide?.elements?.elements || []).filter(
    (el) =>
      !isSlideBackgroundElement(el, slide) &&
      shouldPaintElement(el, slide, canvas.width, canvas.height)
  )
  const layoutKey = String(slide?.layoutId || slide?.layout_id || '').toLowerCase()
  const isCustomChart =
    layoutKey.includes('chart_exponential_desc') ||
    layoutKey.includes('chart_with_description') ||
    layoutKey.includes('chart_donut_context') ||
    rawElements.some(
      (e) =>
        e.slotId === 'EXPO_CARD_BG' ||
        e.slotId === 'CHART_CARD_BG' ||
        e.slotId === 'LINE_CHART' ||
        e.slotId === 'EXPO_STAT' ||
        String(e.slotId || '').startsWith('CDC_')
    )
  if (!isCustomChart) return rawElements
  return finalizeChartShapes(
    rawElements,
    {
      layout_id:
        slide?.layoutId ||
        slide?.layout_id ||
        (layoutKey.includes('with_description')
          ? 'chart_with_description_v1'
          : layoutKey.includes('donut_context')
            ? 'chart_donut_context_v1'
            : 'chart_exponential_desc_v1'),
    },
    palette,
    canvas
  )
}
