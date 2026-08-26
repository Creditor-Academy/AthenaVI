import { useEffect, useRef, useState } from 'react'
import CanvasElementsPreview from './CanvasElementsPreview.jsx'
import DefaultProjectThumbnail from '../features/workspace/workspace/DefaultProjectThumbnail.jsx'
import { resolvePresentationThumbnailUrl } from '../../utils/workspaceLibrary.js'
import { resolvePresentationThumbPayload } from '../../utils/presentationThumbSync.js'
import { setCachedPresentationThumb } from '../../utils/presentationThumbCache.js'

/**
 * Stable presentation card media:
 * - IndexedDB + memory cache
 * - Does not clear a resolved thumb when the parent list re-renders
 * - Cross-fades into image / slide preview (no placeholder blink loop)
 */
export default function PresentationCardThumb({
  item,
  title = '',
  imageClassName = 'work-card-image-bg',
  hostClassName = 'work-card-ppt-thumb-host',
  canvasClassName = 'work-card-ppt-thumb-canvas',
}) {
  const presentationId = item?.id || ''
  const workspaceId = item?.workspaceId || ''
  const catalogUrl = resolvePresentationThumbnailUrl(item)

  const hostRef = useRef(null)
  const loadedForIdRef = useRef('')
  const requestIdRef = useRef(0)

  const [visible, setVisible] = useState(Boolean(catalogUrl))
  const [imageUrl, setImageUrl] = useState(catalogUrl || null)
  const [imageReady, setImageReady] = useState(Boolean(catalogUrl))
  const [slide, setSlide] = useState(null)
  const [aspectRatio, setAspectRatio] = useState(item?.aspectRatio || '16:9')
  const [failed, setFailed] = useState(false)
  const [ignoreCatalogUrl, setIgnoreCatalogUrl] = useState(false)

  // Reset only when the presentation identity changes — not on every list refresh.
  useEffect(() => {
    loadedForIdRef.current = ''
    requestIdRef.current += 1
    setIgnoreCatalogUrl(false)
    setFailed(false)
    setSlide(null)
    setAspectRatio(item?.aspectRatio || '16:9')
    setImageUrl(catalogUrl || null)
    setImageReady(Boolean(catalogUrl))
    setVisible(Boolean(catalogUrl))
  }, [presentationId]) // eslint-disable-line react-hooks/exhaustive-deps -- intentional: identity-only reset

  // Adopt a catalog URL if it appears later, without wiping an already-resolved thumb.
  useEffect(() => {
    if (!catalogUrl || ignoreCatalogUrl) return
    setImageUrl((prev) => prev || catalogUrl)
    if (workspaceId && presentationId) {
      setCachedPresentationThumb({
        workspaceId,
        presentationId,
        imageUrl: catalogUrl,
        aspectRatio: item?.aspectRatio || '16:9',
        updatedAt: item?.lastModifiedAt || item?.updatedAt || item?.completedAt || null,
      }).catch(() => {})
    }
  }, [
    catalogUrl,
    ignoreCatalogUrl,
    workspaceId,
    presentationId,
    item?.aspectRatio,
    item?.lastModifiedAt,
    item?.updatedAt,
    item?.completedAt,
  ])

  useEffect(() => {
    if (imageUrl || slide) return undefined
    const node = hostRef.current
    if (!node) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setVisible(true)
      },
      { rootMargin: '180px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [imageUrl, slide, presentationId])

  useEffect(() => {
    if (!visible || imageUrl || slide || failed) return undefined
    if (!workspaceId || !presentationId) {
      setFailed(true)
      return undefined
    }
    if (loadedForIdRef.current === presentationId) return undefined

    const requestId = ++requestIdRef.current
    let cancelled = false
    const snapshot = item

    resolvePresentationThumbPayload(snapshot)
      .then((result) => {
        if (cancelled || requestId !== requestIdRef.current) return
        loadedForIdRef.current = presentationId
        setAspectRatio(result.aspectRatio || snapshot?.aspectRatio || '16:9')
        if (result.imageUrl) {
          setImageReady(false)
          setImageUrl(result.imageUrl)
          return
        }
        if (result.slide) {
          setSlide(result.slide)
          return
        }
        setFailed(true)
      })
      .catch(() => {
        if (!cancelled && requestId === requestIdRef.current) setFailed(true)
      })

    return () => {
      cancelled = true
    }
    // Intentionally omit `item` — parent list refreshes must not restart a settled load.
  }, [visible, imageUrl, slide, failed, workspaceId, presentationId])

  useEffect(() => {
    if (!imageUrl) return undefined
    let cancelled = false
    const probe = new Image()
    const markReady = () => {
      if (!cancelled) setImageReady(true)
    }
    probe.onload = markReady
    probe.src = imageUrl
    if (probe.complete && probe.naturalWidth > 0) markReady()
    return () => {
      cancelled = true
    }
  }, [imageUrl])

  const showPlaceholder = (!imageUrl || !imageReady) && !slide

  return (
    <div ref={hostRef} className={hostClassName} aria-hidden>
      {showPlaceholder ? (
        <DefaultProjectThumbnail title={title} category="ppt" showLabel={false} />
      ) : null}

      {imageUrl ? (
        <img
          key={imageUrl}
          src={imageUrl}
          alt=""
          className={`${imageClassName} ppt-thumb-fade ${imageReady ? 'is-ready' : ''}`}
          loading="eager"
          decoding="async"
          draggable={false}
          onLoad={() => setImageReady(true)}
          onError={() => {
            setImageReady(false)
            setImageUrl(null)
            setIgnoreCatalogUrl(true)
            loadedForIdRef.current = ''
            setVisible(true)
          }}
        />
      ) : null}

      {slide && !imageUrl ? (
        <div className="ppt-thumb-slide-wrap ppt-thumb-fade is-ready">
          <CanvasElementsPreview
            slide={slide}
            aspectRatio={aspectRatio}
            fill
            className={canvasClassName}
          />
        </div>
      ) : null}
    </div>
  )
}
