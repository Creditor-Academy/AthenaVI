/** Overlay chrome that must not steal clicks from the image underneath. */
export function isPptHitThroughElement(el) {
  if (!el || typeof el !== 'object') return false
  if (el.content?.hitThrough === true || el.content?.pointerEvents === 'none') return true
  if (String(el.role || '').toLowerCase() === 'design_overlay') return true
  const slot = String(el.slotId || '').toUpperCase()
  return /^(OVERLAY_SCRIM|OVERLAY_CARD|IMAGE_CARD_BG)$/.test(slot)
}
