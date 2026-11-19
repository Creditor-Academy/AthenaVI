import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { finishCropSession, loadNaturalSize, startCropSession } from '../../../utils/imageCropSession'
import { notify } from '../../../utils/appDialog'

/**
 * State for cropping an image on the design. `onApply(id, { crop, placement })` saves the
 * result (only called when something changed).
 */
export default function useImageCropSession({ onApply }) {
  const [session, setSession] = useState(null)
  const sessionRef = useRef(null)
  const onApplyRef = useRef(onApply)
  useLayoutEffect(() => {
    sessionRef.current = session
    onApplyRef.current = onApply
  })
  const startingRef = useRef(null)

  const done = useCallback(() => {
    const s = sessionRef.current
    if (!s) return
    sessionRef.current = null
    setSession(null)
    const result = finishCropSession(s)
    if (result.changed) onApplyRef.current?.(s.id, result)
  }, [])

  const cancel = useCallback(() => {
    sessionRef.current = null
    setSession(null)
  }, [])

  /** Start cropping `id` (its box and content, and the photo's address). */
  const begin = useCallback(
    async ({ id, src, box, content }) => {
      if (!id || !src || !box) return
      if (sessionRef.current?.id === id) return
      if (sessionRef.current) done()
      startingRef.current = id
      try {
        const natural = await loadNaturalSize(src)
        if (startingRef.current !== id) return
        const next = startCropSession({ id, src, box, content: content || {}, natural })
        sessionRef.current = next
        setSession(next)
      } catch {
        notify('This image couldn’t be loaded for cropping. Try again in a moment.')
      } finally {
        if (startingRef.current === id) startingRef.current = null
      }
    },
    [done]
  )

  const update = useCallback((next) => {
    sessionRef.current = next
    setSession(next)
  }, [])

  return { session, begin, update, done, cancel }
}
