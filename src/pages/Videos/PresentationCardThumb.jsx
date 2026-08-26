import { useEffect, useRef, useState } from 'react'
import CanvasElementsPreview from '../../components/ppt/CanvasElementsPreview.jsx'
import DefaultProjectThumbnail from '../../components/features/workspace/workspace/DefaultProjectThumbnail.jsx'
import { resolvePresentationThumbnailUrl } from '../../utils/workspaceLibrary.js'
import { resolvePresentationThumbPayload } from '../../utils/presentationThumbSync.js'
import { setCachedPresentationThumb } from '../../utils/presentationThumbCache.js'

/**
 * Presentation card media with IndexedDB + memory cache.
 * Prefer catalog thumbnailUrl; otherwise restore cached first-slide image/snapshot,
 * then network-fetch once and persist for future visits.
 */
export default function PresentationCardThumb({ item, title = '' }) {
  const catalogUrl = resolvePresentationThumbnailUrl(item)
  const hostRef = useRef(null)
  const [ignoreCatalogUrl, setIgnoreCatalogUrl] = useState(false)
  const directUrl = ignoreCatalogUrl ? null : catalogUrl
  const [visible, setVisible] = useState(Boolean(directUrl))
  const [imageUrl, setImageUrl] = useState(directUrl)
  const [slide, setSlide] = useState(null)
  const [aspectRatio, setAspectRatio] = useState(item?.aspectRatio || '16:9')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setIgnoreCatalogUrl(false)
    setImageUrl(catalogUrl)
    setSlide(null)
    setFailed(false)
    setVisible(Boolean(catalogUrl))
  }, [catalogUrl, item?.id])

  useEffect(() => {
    if (!catalogUrl || !item?.workspaceId || !item?.id) return
    setCachedPresentationThumb({
      workspaceId: item.workspaceId,
      presentationId: item.id,
      imageUrl: catalogUrl,
      aspectRatio: item.aspectRatio || '16:9',
      updatedAt: item.lastModifiedAt || item.updatedAt || item.completedAt || null,
    }).catch(() => {})
  }, [
    catalogUrl,
    item?.workspaceId,
    item?.id,
    item?.aspectRatio,
    item?.lastModifiedAt,
    item?.updatedAt,
    item?.completedAt,
  ])

  useEffect(() => {
    if (directUrl) return undefined
    const node = hostRef.current
    if (!node) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setVisible(true)
      },
      { rootMargin: '160px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [directUrl, item?.id])

  useEffect(() => {
    if (directUrl || imageUrl || slide || !visible) return undefined
    if (!item?.workspaceId || !item?.id) {
      setFailed(true)
      return undefined
    }

    let cancelled = false
    resolvePresentationThumbPayload(item)
      .then((result) => {
        if (cancelled) return
        setAspectRatio(result.aspectRatio || item?.aspectRatio || '16:9')
        if (result.imageUrl) {
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
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
    }
  }, [
    directUrl,
    imageUrl,
    slide,
    visible,
    item?.id,
    item?.workspaceId,
    item?.aspectRatio,
    item?.lastModifiedAt,
    item?.updatedAt,
    item?.completedAt,
    item?.thumbnailUrl,
    item?.thumbnail,
  ])

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className="work-card-image-bg"
        loading="lazy"
        decoding="async"
        draggable={false}
        onError={() => {
          setImageUrl(null)
          setIgnoreCatalogUrl(true)
          setVisible(true)
        }}
      />
    )
  }

  if (slide) {
    return (
      <div className="work-card-ppt-thumb-host" aria-hidden>
        <CanvasElementsPreview
          slide={slide}
          aspectRatio={aspectRatio}
          fill
          className="work-card-ppt-thumb-canvas"
        />
      </div>
    )
  }

  return (
    <div ref={hostRef} className="work-card-ppt-thumb-host" aria-hidden>
      <DefaultProjectThumbnail title={title} category="ppt" showLabel={false} />
      {!failed && visible ? <span className="work-card-ppt-thumb-loading" /> : null}
    </div>
  )
}
