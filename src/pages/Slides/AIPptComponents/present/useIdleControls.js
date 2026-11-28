import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Controls that show while the mouse moves and hide, with the cursor, once it has been still for
 * `timeoutMs` (Present plan, Phase 2.4). A tap shows them on touch screens. Key presses don't:
 * a clicker or the arrow keys shouldn't bring the toolbar over the slide.
 *
 * @returns {{ visible: boolean, poke: () => void, hold: (on: boolean) => void }}
 *   `hold(true)` keeps them up (pointer over the toolbar, or a toolbar button focused with Tab).
 */
export default function useIdleControls(rootRef, timeoutMs = 3000) {
  // Shown when Present opens, so people see where the controls are, then hidden.
  const [visible, setVisible] = useState(true)
  const timerRef = useRef(0)
  const holdRef = useRef(false)
  const lastPointRef = useRef(null)

  const schedule = useCallback(() => {
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      if (!holdRef.current) setVisible(false)
    }, timeoutMs)
  }, [timeoutMs])

  const poke = useCallback(() => {
    setVisible(true)
    schedule()
  }, [schedule])

  const hold = useCallback(
    (on) => {
      holdRef.current = on
      if (on) {
        window.clearTimeout(timerRef.current)
        setVisible(true)
      } else {
        schedule()
      }
    },
    [schedule]
  )

  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    const onMove = (e) => {
      // Some browsers send a mousemove without movement when the page under the pointer changes.
      const last = lastPointRef.current
      lastPointRef.current = { x: e.clientX, y: e.clientY }
      if (last && last.x === e.clientX && last.y === e.clientY) return
      poke()
    }
    root.addEventListener('pointermove', onMove)
    root.addEventListener('pointerdown', poke)
    schedule()
    return () => {
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerdown', poke)
      window.clearTimeout(timerRef.current)
    }
  }, [rootRef, poke, schedule])

  return { visible, poke, hold }
}
