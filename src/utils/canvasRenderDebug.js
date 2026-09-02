/**
 * DEV-only Canvas paint helpers for grey-slab / overlay debugging.
 * Enable: localStorage.setItem('DEBUG_CANVAS_ELEMENTS', '1')
 */

export function isCanvasDebugEnabled() {
  if (typeof import.meta !== 'undefined' && import.meta.env?.PROD) return false
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem('DEBUG_CANVAS_ELEMENTS') === '1'
  } catch {
    return false
  }
}

function elementHasImageUrl(el) {
  const c = el?.content || {}
  return Boolean(c.url || c.src || c.thumbnailUrl || c.previewUrl)
}

/**
 * Full-slide scrims are only valid over near-full-bleed photos.
 * Split heroes (half-width) must NOT trigger a full-slide dark veil —
 * that paints the uncovered half as a solid grey slab.
 */
export function slideHasFullBleedOverlayImage(slide, canvasW = 1920, canvasH = 1080) {
  const elements = slide?.elements?.elements || []
  const cw = slide?.elements?.canvas?.width || canvasW
  const ch = slide?.elements?.canvas?.height || canvasH
  const minArea = cw * ch * 0.7

  return elements.some((el) => {
    if (el?.type !== 'image' || !elementHasImageUrl(el)) return false
    const slotId = String(el.slotId || '').toUpperCase()
    const role = String(el.role || '').toLowerCase()
    if (slotId === 'BACKGROUND_IMAGE' || role === 'background' || el.content?.useAsBackground) {
      return true
    }
    const p = el.placement || {}
    return (p.width || 0) * (p.height || 0) >= minArea
  })
}

export function isOverlayScrimElement(el) {
  if (!el) return false
  const role = String(el.role || '').toLowerCase()
  const slotId = String(el.slotId || '').toUpperCase()
  return role === 'design_overlay' || slotId === 'OVERLAY_SCRIM'
}

/** Empty leftover slots from cycle-ring compile (bodies, numbers, 1×1 ghosts). */
export function isCycleRingGhostElement(el, slide) {
  if (!el) return false
  const p = el.placement || {}
  if ((p.opacity ?? 1) === 0) return true
  const sid = String(el.slotId || '').toUpperCase()
  const layoutId = String(slide?.layoutId || slide?.layout_id || '').toLowerCase()
  const siblings = slide?.elements?.elements || []
  const isRing =
    (layoutId.includes('cycle') && layoutId.includes('ring')) ||
    siblings.some((e) => /^CYCLE_(LEAD_|DIAMOND|SEG_5)/i.test(String(e.slotId || '')))
  if (!isRing) return false
  if ((Number(p.width) || 0) <= 2 && (Number(p.height) || 0) <= 2) return true
  if (/^CYCLE_(CENTER|NUM_)/.test(sid)) return true
  if (/^Q[1-5]_BODY$/.test(sid)) return true
  return false
}

/** Drop full-slide scrims when there is no full-bleed image to darken. */
export function shouldPaintElement(el, slide, canvasW, canvasH) {
  if (!el) return false
  if (isCycleRingGhostElement(el, slide)) return false
  if (isOverlayScrimElement(el) && !slideHasFullBleedOverlayImage(slide, canvasW, canvasH)) {
    return false
  }
  return true
}

export function logCanvasGreySuspects(slide, { canvasW = 1920, canvasH = 1080, label = 'slide' } = {}) {
  if (!isCanvasDebugEnabled()) return
  const elements = slide?.elements?.elements || []
  const area = canvasW * canvasH
  const suspects = elements
    .map((el) => {
      const p = el.placement || {}
      const w = p.width || 0
      const h = p.height || 0
      const elArea = w * h
      const fill = el.content?.fill
      const url = el.content?.url || el.content?.src
      return {
        id: el.id,
        slotId: el.slotId,
        type: el.type,
        role: el.role,
        layer: el.layer,
        x: p.x,
        y: p.y,
        width: w,
        height: h,
        areaRatio: area ? elArea / area : 0,
        fill,
        opacity: el.content?.opacity ?? p.opacity,
        hasUrl: Boolean(url),
        edgeFade: el.content?.edgeFade || null,
      }
    })
    .filter(
      (row) =>
        row.areaRatio >= 0.35 ||
        isOverlayScrimElement(row) ||
        (row.type === 'image' && !row.hasUrl) ||
        String(row.role || '').toLowerCase() === 'design_bg'
    )

  // eslint-disable-next-line no-console
  console.info('[DEBUG_CANVAS_ELEMENTS]', label, {
    slideId: slide?.id,
    layoutId: slide?.layoutId || slide?.layout_id,
    backgroundColor: slide?.backgroundColor || slide?.elements?.backgroundColor,
    hasFullBleedOverlayImage: slideHasFullBleedOverlayImage(slide, canvasW, canvasH),
    suspects,
  })
}
