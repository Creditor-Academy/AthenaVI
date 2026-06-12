import { useCallback, useEffect, useRef } from 'react'

/**
 * Pointer drag to resize a panel. `onDelta` receives a positive value when the panel grows.
 * @param {'x' | 'y'} axis - x = horizontal drag (width), y = vertical drag (height)
 */
export function useDragResize({ axis, onDelta, onDragEnd, enabled = true }) {
  const dragging = useRef(false)
  const lastPointer = useRef({ x: 0, y: 0 })

  const onPointerDown = useCallback(
    (e) => {
      if (!enabled) return
      e.preventDefault()
      e.stopPropagation()
      dragging.current = true
      lastPointer.current = { x: e.clientX, y: e.clientY }
      document.body.style.cursor = axis === 'x' ? 'col-resize' : 'row-resize'
      document.body.style.userSelect = 'none'
      if (e.currentTarget?.setPointerCapture) {
        e.currentTarget.setPointerCapture(e.pointerId)
      }
    },
    [enabled, axis]
  )

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return
      const dx = e.clientX - lastPointer.current.x
      const dy = e.clientY - lastPointer.current.y
      lastPointer.current = { x: e.clientX, y: e.clientY }
      if (axis === 'x') onDelta(-dx)
      else onDelta(-dy)
    }

    const onUp = () => {
      if (!dragging.current) return
      dragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      onDragEnd?.()
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [axis, onDelta, onDragEnd])

  return { onPointerDown }
}

export function readStoredPanelSize(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    const n = parseInt(raw, 10)
    return Number.isFinite(n) ? n : fallback
  } catch {
    return fallback
  }
}

export function writeStoredPanelSize(key, value) {
  try {
    localStorage.setItem(key, String(Math.round(value)))
  } catch {
    // ignore quota / private mode
  }
}
