/** Shared pointer capture drag helper for canvas interactions. */

export function attachPointerDrag(e, onMove, onEnd) {
  const target = e.currentTarget;
  if (target.setPointerCapture) {
    target.setPointerCapture(e.pointerId);
  }

  const handleMove = (mv) => {
    if (mv.pointerId !== e.pointerId) return;
    onMove(mv);
  };

  const handleUp = (mv) => {
    if (mv.pointerId !== e.pointerId) return;
    window.removeEventListener('pointermove', handleMove);
    window.removeEventListener('pointerup', handleUp);
    window.removeEventListener('pointercancel', handleUp);
    if (target.releasePointerCapture) {
      try {
        target.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
    onEnd?.(mv);
  };

  window.addEventListener('pointermove', handleMove);
  window.addEventListener('pointerup', handleUp);
  window.addEventListener('pointercancel', handleUp);
}

export function bindPointerDrag(onPointerDown) {
  return (e) => {
    e.stopPropagation();
    e.preventDefault();
    onPointerDown(e);
  };
}

export const DRAG_THRESHOLD_PX = 4;

export function exceedsDragThreshold(startX, startY, clientX, clientY) {
  const dx = clientX - startX;
  const dy = clientY - startY;
  return Math.hypot(dx, dy) >= DRAG_THRESHOLD_PX;
}
