import { getPptUnionBounds } from './pptGroupUtils'

/**
 * Align selected elements to each other (2+) or to the slide canvas (1).
 * Moving a group also shifts its children by the same delta.
 */
export function alignPptElements(
  elements = [],
  selectedIds = [],
  alignment,
  canvas = { width: 1920, height: 1080 }
) {
  const idSet = new Set((selectedIds || []).filter(Boolean))
  const targets = elements.filter((el) => idSet.has(el.id) && !el.locked)
  if (!targets.length) return elements

  const canvasW = canvas.width || 1920
  const canvasH = canvas.height || 1080
  const bounds =
    targets.length >= 2
      ? getPptUnionBounds(targets)
      : { x: 0, y: 0, width: canvasW, height: canvasH }

  const deltas = {}
  for (const el of targets) {
    const p = el.placement || {}
    const w = p.width || 100
    const h = p.height || 40
    let x = p.x || 0
    let y = p.y || 0
    switch (alignment) {
      case 'left':
        x = bounds.x
        break
      case 'center':
        x = bounds.x + (bounds.width - w) / 2
        break
      case 'right':
        x = bounds.x + bounds.width - w
        break
      case 'top':
        y = bounds.y
        break
      case 'middle':
        y = bounds.y + (bounds.height - h) / 2
        break
      case 'bottom':
        y = bounds.y + bounds.height - h
        break
      default:
        break
    }
    deltas[el.id] = {
      dx: Math.round(x) - (p.x || 0),
      dy: Math.round(y) - (p.y || 0),
    }
  }

  return elements.map((el) => {
    const delta = deltas[el.id] || (el.groupId ? deltas[el.groupId] : null)
    if (!delta || (!delta.dx && !delta.dy)) return el
    const p = el.placement || {}
    return {
      ...el,
      placement: {
        ...p,
        x: Math.round((p.x || 0) + delta.dx),
        y: Math.round((p.y || 0) + delta.dy),
      },
    }
  })
}
