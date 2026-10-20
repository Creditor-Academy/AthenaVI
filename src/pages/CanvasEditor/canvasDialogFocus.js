import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Elements that can be tabbed to inside a dialog root. */
export function focusableIn(root) {
  if (!root?.querySelectorAll) return []
  return [...root.querySelectorAll(FOCUSABLE)].filter((el) => {
    if (el.disabled || el.getAttribute('aria-hidden') === 'true') return false
    return el.tabIndex >= 0
  })
}

/**
 * Next element for a Tab press. Focus outside the list wraps to the first
 * (or the last, with Shift).
 */
export function tabTarget(items, current, shift) {
  if (!items?.length) return null
  const index = items.indexOf(current)
  if (index === -1) return shift ? items[items.length - 1] : items[0]
  const next = index + (shift ? -1 : 1)
  if (next < 0) return items[items.length - 1]
  if (next >= items.length) return items[0]
  return items[next]
}

/**
 * Trap Tab inside `rootRef`, close on Escape, and restore the control that
 * opened the dialog. `onEscape` may be omitted while a save or export is in
 * flight: Escape is still swallowed so it does not also clear the canvas.
 */
export function useCanvasDialogFocus(rootRef, { onEscape, active = true, initialFocusRef } = {}) {
  const onEscapeRef = useRef(onEscape)
  onEscapeRef.current = onEscape
  const initialFocus = useRef(initialFocusRef)
  initialFocus.current = initialFocusRef

  useEffect(() => {
    if (!active) return undefined
    const root = rootRef.current
    if (!root) return undefined
    const previous = document.activeElement
    const preferred = initialFocus.current?.current
    if (preferred && !preferred.disabled && root.contains(preferred)) {
      preferred.focus()
    } else if (!root.contains(document.activeElement)) {
      if (root.tabIndex < 0) root.tabIndex = -1
      root.focus()
      if (document.activeElement !== root) focusableIn(root)[0]?.focus()
    }

    const onKey = (event) => {
      if (!root.isConnected) return
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        onEscapeRef.current?.()
        return
      }
      if (event.key !== 'Tab') return
      const list = focusableIn(root)
      if (!list.length) {
        event.preventDefault()
        return
      }
      const next = tabTarget(list, document.activeElement, event.shiftKey)
      if (!next) return
      event.preventDefault()
      next.focus()
    }

    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      if (
        previous &&
        previous !== document.body &&
        typeof previous.focus === 'function' &&
        document.contains(previous)
      ) {
        previous.focus()
      }
    }
  }, [active, rootRef])
}
