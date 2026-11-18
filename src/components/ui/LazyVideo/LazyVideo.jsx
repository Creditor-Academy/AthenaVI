import { useEffect, useRef, useState } from 'react'

/**
 * A muted, looping background video that downloads nothing until it is needed.
 *
 * - `active` given: plays while it is true (e.g. a dropdown that is open).
 * - otherwise: plays while it is on screen (or within `rootMargin` of it), pauses when it leaves.
 *
 * preload="none" + no autoplay means a video below the fold or in a closed menu costs no bandwidth.
 */
export default function LazyVideo({ src, active, rootMargin = '200px', children, ...props }) {
  const ref = useRef(null)
  // Without IntersectionObserver (very old browsers) just play.
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    if (active !== undefined) return undefined
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin })
    observer.observe(el)
    return () => observer.disconnect()
  }, [active, rootMargin])

  const shouldPlay = active ?? inView

  useEffect(() => {
    const video = ref.current
    if (!video) return
    if (shouldPlay) video.play().catch(() => {})
    else if (!video.paused) video.pause()
  }, [shouldPlay])

  return (
    <video ref={ref} src={src} preload="none" muted loop playsInline {...props}>
      {children}
    </video>
  )
}
