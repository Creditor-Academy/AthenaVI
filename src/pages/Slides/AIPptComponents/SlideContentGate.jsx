import { useEffect, useRef, useState } from 'react'
import { enqueueSlideLoad } from '../../../utils/slideLoadQueue'
import { preloadSlideMedia, slideMediaSignature } from '../../../utils/slideMediaLoader'

function slideGraphicsPending(slide) {
  for (const el of slide?.elements?.elements || []) {
    if (el?.type !== 'graphic') continue
    const c = el.content || {}
    const id = c.assetId != null ? String(c.assetId) : ''
    if (!id || id.startsWith('svgl:')) continue
    if (!(c.src || c.url || c.fileUrl || c.previewUrl)) return true
  }
  return false
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Mounts slide content near the viewport (or immediately when prioritized),
 * waits until media is ready, then reveals the slide as a unit.
 */
export default function SlideContentGate({
  slide,
  priority = false,
  rootMargin = '240px 0px',
  children,
  className = '',
}) {
  const hostRef = useRef(null)
  const revealedRef = useRef(false)
  const slideRef = useRef(slide)
  slideRef.current = slide
  const [inView, setInView] = useState(Boolean(priority))
  const [mounted, setMounted] = useState(Boolean(priority))
  const [ready, setReady] = useState(false)
  const signature = slideMediaSignature(slide)

  useEffect(() => {
    if (priority) {
      setInView(true)
      setMounted(true)
      return undefined
    }
    const node = hostRef.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      setMounted(true)
      return undefined
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true)
          setMounted(true)
        }
      },
      { root: null, rootMargin, threshold: 0.01 }
    )
    io.observe(node)
    return () => io.disconnect()
  }, [priority, rootMargin, slide?.id])

  useEffect(() => {
    if (!mounted && !inView) return undefined
    let cancelled = false

    const work = async () => {
      const waitStart = Date.now()
      while (
        slideGraphicsPending(slideRef.current) &&
        !cancelled &&
        Date.now() - waitStart < 8000
      ) {
        // eslint-disable-next-line no-await-in-loop
        await sleep(40)
      }
      if (cancelled) return
      try {
        await preloadSlideMedia(slideRef.current)
      } catch {
        /* fail-open */
      }
      if (cancelled) return
      revealedRef.current = true
      setReady(true)
    }

    // Only hide content on the first reveal for this slide instance.
    // Later signature updates (hydrated graphic URLs) refresh assets in place.
    if (!revealedRef.current) {
      setReady(false)
    }

    const failOpen = setTimeout(() => {
      if (!cancelled) {
        revealedRef.current = true
        setReady(true)
      }
    }, 12000)

    if (priority) {
      work()
    } else {
      enqueueSlideLoad(work)
    }

    return () => {
      cancelled = true
      clearTimeout(failOpen)
    }
  }, [mounted, inView, priority, signature])

  return (
    <div
      ref={hostRef}
      className={`ppt-slide-content-gate ${ready ? 'is-ready' : 'is-loading'} ${className}`.trim()}
      data-slide-ready={ready ? '1' : '0'}
    >
      {!ready && (
        <div className="ppt-slide-content-gate__skeleton" aria-hidden="true">
          <div className="ppt-slide-content-gate__shimmer" />
        </div>
      )}
      {mounted && ready ? (
        <div className="ppt-slide-content-gate__body">{children}</div>
      ) : null}
    </div>
  )
}
