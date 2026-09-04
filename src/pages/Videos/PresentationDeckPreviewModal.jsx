import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  MdChevronLeft,
  MdChevronRight,
  MdClose,
  MdDownload,
  MdEdit,
  MdPresentToAll,
} from 'react-icons/md'
import presentationService from '../../services/presentationService'
import ExportPresentationModal from '../Slides/AIPptComponents/ExportPresentationModal'
import './PresentationDeckPreviewModal.css'

const MAX_POLL_MS = 60_000
const DEFAULT_POLL_MS = 1200

function sortSlides(slides) {
  return [...(slides || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

function aspectBoxRatio(aspectRatio) {
  const raw = String(aspectRatio || '16:9')
  const [w, h] = raw.split(':').map(Number)
  if (w > 0 && h > 0) return `${w} / ${h}`
  return '16 / 9'
}

function statusLabel(status) {
  const s = String(status || '').toUpperCase()
  if (s === 'READY') return 'Ready'
  if (s === 'PARTIAL') return 'Generating…'
  if (s === 'PENDING') return 'Preparing…'
  return s || '—'
}

function isNetworkDown(err) {
  const msg = String(err?.message || err || '')
  return /failed to fetch|networkerror|econnrefused|network/i.test(msg)
}

function cardFallbackUrl(item) {
  return item?.thumbnailUrl || item?.thumbnail || ''
}

export default function PresentationDeckPreviewModal({
  item,
  onClose,
  onEdit,
}) {
  const workspaceId = item?.workspaceId
  const presentationId = item?.id || item?._id
  const titleFallback = item?.title || item?.name || 'Presentation'

  const [deck, setDeck] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [exportOpen, setExportOpen] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [pollTimedOut, setPollTimedOut] = useState(false)

  const etagRef = useRef(null)
  const pollStartedAtRef = useRef(0)
  const lastPollMsRef = useRef(0)
  const lastStatusRef = useRef('PENDING')
  const filmstripRef = useRef(null)
  const activeThumbRef = useRef(null)
  const loadedUrlsRef = useRef(new Set())

  const slides = useMemo(() => sortSlides(deck?.slides), [deck?.slides])
  const activeSlide = slides[activeIndex] || null
  const aspectRatio = deck?.aspectRatio || item?.aspectRatio || '16:9'
  const previewStatus = deck?.previewStatus || 'PENDING'
  const stillGenerating = previewStatus === 'PENDING' || previewStatus === 'PARTIAL'
  const readyCount = Number(deck?.readyCount) || slides.filter((s) => s.previewImageUrl).length
  const provisionalUrl = cardFallbackUrl(item)

  // Preload slide images in background so main stage switching is instant
  useEffect(() => {
    if (!slides || !slides.length) return
    slides.forEach((slide) => {
      const url = slide?.previewImageUrl
      if (url && !loadedUrlsRef.current.has(url)) {
        const img = new Image()
        img.onload = () => loadedUrlsRef.current.add(url)
        img.src = url
        if (img.complete) loadedUrlsRef.current.add(url)
      }
    })
  }, [slides])

  const goTo = useCallback(
    (index) => {
      if (!slides.length) return
      const next = Math.max(0, Math.min(slides.length - 1, index))
      const targetUrl = slides[next]?.previewImageUrl
      setActiveIndex(next)
      if (targetUrl && loadedUrlsRef.current.has(targetUrl)) {
        setImgLoaded(true)
      } else {
        setImgLoaded(false)
      }
    },
    [slides]
  )

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo])
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo])

  const applyPreviewPayload = useCallback((payload) => {
    if (!payload || payload.notModified) return
    setDeck(payload)
    setError('')
    setLoading(false)
    lastStatusRef.current = String(payload.previewStatus || '').toUpperCase() || 'READY'
    lastPollMsRef.current = Number(payload.nextPollMs) || 0
    setActiveIndex((prev) => {
      const count = Array.isArray(payload.slides) ? payload.slides.length : 0
      if (count === 0) return 0
      return Math.min(prev, count - 1)
    })
  }, [])

  const shouldContinuePolling = useCallback((payload) => {
    const elapsed = Date.now() - pollStartedAtRef.current
    if (elapsed >= MAX_POLL_MS) {
      setPollTimedOut(true)
      return false
    }
    if (payload && !payload.notModified) {
      const status = String(payload.previewStatus || '').toUpperCase()
      const nextPoll = Number(payload.nextPollMs)
      if (Number.isFinite(nextPoll) && nextPoll > 0) return true
      return status === 'PENDING' || status === 'PARTIAL'
    }
    const status = lastStatusRef.current
    return (
      lastPollMsRef.current > 0 ||
      status === 'PENDING' ||
      status === 'PARTIAL'
    )
  }, [])

  const pollDelayFor = useCallback((payload) => {
    if (payload && !payload.notModified) {
      const nextPoll = Number(payload.nextPollMs)
      if (Number.isFinite(nextPoll) && nextPoll > 0) return nextPoll
    }
    if (lastPollMsRef.current > 0) return lastPollMsRef.current
    return DEFAULT_POLL_MS
  }, [])

  const fetchPreview = useCallback(async () => {
    if (!workspaceId || !presentationId) {
      setError('Missing presentation id')
      setLoading(false)
      return null
    }
    try {
      const payload = await presentationService.getPresentationPreview(
        workspaceId,
        presentationId,
        { etag: etagRef.current }
      )
      if (payload?.etag) etagRef.current = payload.etag
      if (!payload?.notModified) applyPreviewPayload(payload)
      return payload
    } catch (err) {
      const message = isNetworkDown(err)
        ? 'API is unreachable. Start the backend on port 9000, then retry.'
        : err?.message || 'Could not load deck preview'
      setError(message)
      setLoading(false)
      return null
    }
  }, [workspaceId, presentationId, applyPreviewPayload])

  useEffect(() => {
    let cancelled = false
    let timer = null
    etagRef.current = null
    pollStartedAtRef.current = Date.now()
    lastPollMsRef.current = 0
    lastStatusRef.current = 'PENDING'
    setLoading(true)
    setError('')
    setDeck(null)
    setActiveIndex(0)
    setImgLoaded(false)
    setPollTimedOut(false)

    const schedule = (ms) => {
      if (cancelled) return
      timer = window.setTimeout(async () => {
        if (cancelled) return
        const payload = await fetchPreview()
        if (cancelled || !payload) return
        if (shouldContinuePolling(payload)) {
          schedule(pollDelayFor(payload))
        }
      }, ms)
    }

    ;(async () => {
      const payload = await fetchPreview()
      if (cancelled || !payload) return
      if (shouldContinuePolling(payload)) {
        schedule(pollDelayFor(payload))
      }
    })()

    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount per presentation
  }, [workspaceId, presentationId, fetchPreview, shouldContinuePolling, pollDelayFor])

  useEffect(() => {
    const onKey = (e) => {
      if (exportOpen) return
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose?.()
        return
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [exportOpen, onClose, goPrev, goNext])

  useEffect(() => {
    activeThumbRef.current?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    })
  }, [activeIndex])

  const handleEdit = () => {
    onEdit?.(item)
    onClose?.()
  }

  const slideCount = deck?.slideCount ?? slides.length
  // Always show a JPEG when we have one — never hide it behind PENDING status.
  const mainUrl = activeSlide?.previewImageUrl || (!deck ? provisionalUrl : null) || null
  const waitingForFirstSnapshot = Boolean(deck) && !mainUrl && stillGenerating && !pollTimedOut
  const showFailedState = Boolean(deck) && !mainUrl && (pollTimedOut || !stillGenerating)

  return (
    <>
      <div
        className="deck-preview-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${titleFallback} preview`}
      >
        <div className="deck-preview-backdrop" onClick={onClose} />

        <div className="deck-preview-shell">
          <header className="deck-preview-header">
            <div className="deck-preview-header-meta">
              <div className="deck-preview-titles">
                <div className="deck-preview-title-row">
                  <h2>{deck?.title || titleFallback}</h2>
                  <span className="deck-preview-badge">Presentation</span>
                </div>
                <p>
                  {slideCount ? `${slideCount} slide${slideCount === 1 ? '' : 's'}` : '—'}
                  <span aria-hidden>·</span>
                  {statusLabel(previewStatus)}
                  <span aria-hidden>·</span>
                  {aspectRatio}
                </p>
              </div>
            </div>

            <div className="deck-preview-header-actions">
              <button
                type="button"
                className="deck-preview-btn deck-preview-btn--ghost"
                onClick={() => setExportOpen(true)}
                disabled={!workspaceId || !presentationId}
              >
                <MdDownload size={18} />
                Download
              </button>
              <button
                type="button"
                className="deck-preview-btn deck-preview-btn--primary"
                onClick={handleEdit}
              >
                <MdEdit size={18} />
                Edit
              </button>
              <button
                type="button"
                className="deck-preview-icon-btn"
                onClick={onClose}
                aria-label="Close preview"
              >
                <MdClose size={22} />
              </button>
            </div>
          </header>

          <div className="deck-preview-body">
            <aside className="deck-preview-filmstrip" aria-label="Slides">
              <div className="deck-preview-filmstrip-head">
                <span>Slides</span>
                <span>{slides.length || slideCount || 0}</span>
              </div>
              <div className="deck-preview-filmstrip-list" ref={filmstripRef}>
                {loading && !slides.length
                  ? Array.from({ length: Math.min(6, item?.slideCount || 4) }).map((_, i) => (
                      <div key={`skel-${i}`} className="deck-preview-thumb is-skeleton" />
                    ))
                  : null}

                {slides.map((slide, index) => {
                  const url = slide.previewImageUrl
                  const pending = !url
                  const active = index === activeIndex
                  return (
                    <button
                      key={slide.id || index}
                      type="button"
                      ref={active ? activeThumbRef : null}
                      className={`deck-preview-thumb ${active ? 'is-active' : ''} ${
                        pending ? 'is-pending' : ''
                      }`}
                      onClick={() => goTo(index)}
                      aria-label={`Slide ${index + 1}${slide.title ? `: ${slide.title}` : ''}`}
                      aria-current={active ? 'true' : undefined}
                    >
                      <span className="deck-preview-thumb-num">{index + 1}</span>
                      <span
                        className="deck-preview-thumb-frame"
                        style={{ aspectRatio: aspectBoxRatio(aspectRatio) }}
                      >
                        {pending ? (
                          <span className="deck-preview-thumb-placeholder">
                            <span className="deck-preview-shimmer" />
                          </span>
                        ) : (
                          <img
                            src={url}
                            alt=""
                            draggable={false}
                            loading="lazy"
                            onLoad={() => {
                              if (url) loadedUrlsRef.current.add(url)
                            }}
                          />
                        )}
                      </span>
                    </button>
                  )
                })}

                {!loading && !slides.length ? (
                  <p className="deck-preview-filmstrip-empty">No slides yet</p>
                ) : null}
              </div>
            </aside>

            <section className="deck-preview-stage-wrap">
              <div className="deck-preview-stage">
                {loading && !deck && !provisionalUrl ? (
                  <div className="deck-preview-placeholder">
                    <div className="deck-preview-shimmer" />
                    <p>Loading deck preview…</p>
                  </div>
                ) : error && !deck && !provisionalUrl ? (
                  <div className="deck-preview-placeholder">
                    <MdPresentToAll size={48} />
                    <p>{error}</p>
                    <button type="button" className="deck-preview-btn deck-preview-btn--ghost" onClick={fetchPreview}>
                      Retry
                    </button>
                  </div>
                ) : waitingForFirstSnapshot ? (
                  <div className="deck-preview-placeholder is-pending">
                    <div className="deck-preview-shimmer" />
                    <p>
                      {readyCount > 0
                        ? `Rendered ${readyCount} of ${slideCount || slides.length} slides…`
                        : 'Rendering first slide snapshot…'}
                    </p>
                    <span className="deck-preview-hint">This usually takes a few seconds</span>
                  </div>
                ) : showFailedState ? (
                  <div className="deck-preview-placeholder">
                    <MdPresentToAll size={48} />
                    <p>
                      {error ||
                        (pollTimedOut
                          ? 'Snapshots are still generating. Open the editor, or retry in a moment.'
                          : 'Preview not ready for this slide yet')}
                    </p>
                    <div className="deck-preview-placeholder-actions">
                      <button
                        type="button"
                        className="deck-preview-btn deck-preview-btn--ghost"
                        onClick={() => {
                          setPollTimedOut(false)
                          pollStartedAtRef.current = Date.now()
                          fetchPreview()
                        }}
                      >
                        Retry
                      </button>
                      <button
                        type="button"
                        className="deck-preview-btn deck-preview-btn--primary"
                        onClick={handleEdit}
                      >
                        <MdEdit size={16} />
                        Edit
                      </button>
                    </div>
                  </div>
                ) : (
                  <img
                    key={mainUrl}
                    src={mainUrl}
                    alt={activeSlide?.title || `Slide ${activeIndex + 1}`}
                    className={`deck-preview-main-img ${imgLoaded ? 'is-ready' : ''}`}
                    style={{ aspectRatio: aspectBoxRatio(aspectRatio) }}
                    draggable={false}
                    onLoad={() => {
                      if (mainUrl) loadedUrlsRef.current.add(mainUrl)
                      setImgLoaded(true)
                    }}
                    ref={(imgNode) => {
                      if (imgNode && imgNode.complete && imgNode.naturalWidth > 0) {
                        if (mainUrl) loadedUrlsRef.current.add(mainUrl)
                        setImgLoaded(true)
                      }
                    }}
                  />
                )}

                {slides.length > 1 ? (
                  <>
                    <button
                      type="button"
                      className="deck-preview-nav deck-preview-nav--prev"
                      onClick={goPrev}
                      disabled={activeIndex <= 0}
                      aria-label="Previous slide"
                    >
                      <MdChevronLeft size={28} />
                    </button>
                    <button
                      type="button"
                      className="deck-preview-nav deck-preview-nav--next"
                      onClick={goNext}
                      disabled={activeIndex >= slides.length - 1}
                      aria-label="Next slide"
                    >
                      <MdChevronRight size={28} />
                    </button>
                  </>
                ) : null}
              </div>

              <footer className="deck-preview-footer">
                <span className="deck-preview-counter">
                  {slides.length ? `${activeIndex + 1} / ${slides.length}` : '0 / 0'}
                </span>
                <span className="deck-preview-slide-title">
                  {activeSlide?.title || (slides.length ? `Slide ${activeIndex + 1}` : '')}
                </span>
                {stillGenerating && !pollTimedOut ? (
                  <span className="deck-preview-live-pill">
                    {readyCount > 0
                      ? `${readyCount}/${slideCount || slides.length} ready`
                      : 'Updating previews'}
                  </span>
                ) : null}
                {error && deck ? <span className="deck-preview-live-pill is-warn">{error}</span> : null}
              </footer>
            </section>
          </div>
        </div>
      </div>

      {exportOpen ? (
        <ExportPresentationModal
          workspaceId={workspaceId}
          presentationId={presentationId}
          title={deck?.title || titleFallback}
          onClose={() => setExportOpen(false)}
        />
      ) : null}
    </>
  )
}
