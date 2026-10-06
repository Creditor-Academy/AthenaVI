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
import { ensureFontCssUrl } from '../../utils/googleFonts'
import {
  captureNodeToJpegBlob,
  stashPreviewHandoff,
} from '../../utils/deckPreviewCapture'
import ExportPresentationModal from '../Slides/AIPptComponents/ExportPresentationModal'
import DeckLiveSlideStage, { resolvePreviewThemeVisual } from './DeckLiveSlideStage'
import './PresentationDeckPreviewModal.css'

const PAGE_LIMIT = 8

/** In-memory preview cache so re-open can send If-None-Match and keep slides. */
const previewCache = new Map()

function sortSlides(slides) {
  return [...(slides || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

function mergeSlides(existing, incoming) {
  const map = new Map()
  for (const s of existing || []) {
    if (s?.id) map.set(s.id, s)
  }
  for (const s of incoming || []) {
    if (s?.id) map.set(s.id, s)
  }
  return sortSlides([...map.values()])
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
  if (s === 'GENERATING') return 'Generating…'
  if (s === 'FAILED') return 'Failed'
  return s || '—'
}

function isNetworkDown(err) {
  const msg = String(err?.message || err || '')
  return /failed to fetch|networkerror|econnrefused|network/i.test(msg)
}

function FilmstripThumb({
  slide,
  index,
  active,
  aspectRatio,
  themeVisual,
  fontsReady,
  onSelect,
  buttonRef,
}) {
  const hostRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = hostRef.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return undefined
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setVisible(true)
      },
      { root: null, rootMargin: '120px 0px', threshold: 0.01 }
    )
    io.observe(node)
    return () => io.disconnect()
  }, [])

  return (
    <button
      ref={(node) => {
        hostRef.current = node
        if (typeof buttonRef === 'function') buttonRef(node)
        else if (buttonRef) buttonRef.current = node
      }}
      type="button"
      className={`deck-preview-thumb ${active ? 'is-active' : ''} ${
        !slide || !fontsReady ? 'is-pending' : ''
      }`}
      onClick={() => onSelect(index)}
      aria-label={`Slide ${index + 1}${slide?.title ? `: ${slide.title}` : ''}`}
      aria-current={active ? 'true' : undefined}
    >
      <span className="deck-preview-thumb-num">{index + 1}</span>
      <span
        className="deck-preview-thumb-frame"
        style={{ aspectRatio: aspectBoxRatio(aspectRatio) }}
      >
        {slide && fontsReady && visible ? (
          <DeckLiveSlideStage
            slide={slide}
            themeVisual={themeVisual}
            aspectRatio={aspectRatio}
            className="deck-preview-thumb-live"
          />
        ) : (
          <span className="deck-preview-thumb-placeholder">
            <span className="deck-preview-shimmer" />
          </span>
        )}
      </span>
    </button>
  )
}

export default function PresentationDeckPreviewModal({ item, onClose, onEdit }) {
  const workspaceId = item?.workspaceId
  const presentationId = item?.id || item?._id
  const titleFallback = item?.title || item?.name || 'Presentation'
  const cacheKey = `${workspaceId || ''}:${presentationId || ''}`

  const [meta, setMeta] = useState(() => previewCache.get(cacheKey)?.meta || null)
  const [slides, setSlides] = useState(() => previewCache.get(cacheKey)?.slides || [])
  const [loading, setLoading] = useState(!previewCache.get(cacheKey)?.slides?.length)
  const [error, setError] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [exportOpen, setExportOpen] = useState(false)
  const [fontsReady, setFontsReady] = useState(false)
  const [mainReady, setMainReady] = useState(false)

  const etagRef = useRef(previewCache.get(cacheKey)?.etag || null)
  const nextOffsetRef = useRef(null)
  const pagingRef = useRef(false)
  const coverAttemptedRef = useRef(false)
  const coverStaleRef = useRef(false)
  const slideOneHostRef = useRef(null)
  const activeThumbRef = useRef(null)
  const pollTimerRef = useRef(null)
  const deckRef = useRef(null)

  const aspectRatio = meta?.aspectRatio || item?.aspectRatio || '16:9'
  const themeVisual = useMemo(
    () => resolvePreviewThemeVisual(meta?.themeTokens, meta?.themeTokens?.wizardColorThemeId),
    [meta?.themeTokens]
  )
  const activeSlide = slides[activeIndex] || null
  const slideCount = meta?.slideCount ?? slides.length
  const deckStatus = String(meta?.status || '').toUpperCase()
  const stillGenerating = deckStatus === 'GENERATING'

  const persistCache = useCallback(
    (nextMeta, nextSlides, etag) => {
      if (!cacheKey) return
      previewCache.set(cacheKey, {
        meta: nextMeta,
        slides: nextSlides,
        etag: etag || etagRef.current,
      })
    },
    [cacheKey]
  )

  const applyPage = useCallback(
    (payload, { replace = false } = {}) => {
      if (!payload || payload.notModified) return
      const nextMeta = {
        id: payload.id,
        title: payload.title,
        status: payload.status,
        aspectRatio: payload.aspectRatio || '16:9',
        locale: payload.locale,
        themeTokens: payload.themeTokens || null,
        fontCssUrl: payload.fontCssUrl || null,
        contentUpdatedAt: payload.contentUpdatedAt,
        slideCount: payload.slideCount,
        coverStale: Boolean(payload.coverStale),
        nextPollMs: Number(payload.nextPollMs) || 0,
      }
      coverStaleRef.current = nextMeta.coverStale
      setMeta(nextMeta)
      setSlides((prev) => {
        const merged = replace
          ? sortSlides(payload.slides || [])
          : mergeSlides(prev, payload.slides || [])
        persistCache(nextMeta, merged, payload.etag)
        deckRef.current = { ...nextMeta, slides: merged }
        return merged
      })
      setError('')
      setLoading(false)
      nextOffsetRef.current =
        payload.nextOffset == null || payload.nextOffset === undefined
          ? null
          : Number(payload.nextOffset)
      setActiveIndex((prev) => {
        const count = Math.max(
          Number(payload.slideCount) || 0,
          (payload.slides || []).length
        )
        if (!count) return 0
        return Math.min(prev, Math.max(0, count - 1))
      })
    },
    [persistCache]
  )

  const waitForFonts = useCallback(async (fontCssUrl, themeTokens) => {
    if (fontCssUrl) ensureFontCssUrl(fontCssUrl)
    try {
      if (document.fonts?.ready) {
        await Promise.race([
          document.fonts.ready,
          new Promise((r) => setTimeout(r, 2500)),
        ])
      } else {
        await new Promise((r) => setTimeout(r, 120))
      }
    } catch {
      /* ignore */
    }
    // themeTokens unused — fontCssUrl is the deck stylesheet
    void themeTokens
    setFontsReady(true)
  }, [])

  const fetchPage = useCallback(
    async ({ offset = 0, limit = PAGE_LIMIT, etag } = {}) => {
      if (!workspaceId || !presentationId) {
        setError('Missing presentation id')
        setLoading(false)
        return null
      }
      try {
        const payload = await presentationService.getPresentationPreview(
          workspaceId,
          presentationId,
          { etag, offset, limit }
        )
        if (payload?.etag) etagRef.current = payload.etag
        return payload
      } catch (err) {
        const message = isNetworkDown(err)
          ? 'API is unreachable. Start the backend on port 9000, then retry.'
          : err?.message || 'Could not load deck preview'
        setError(message)
        setLoading(false)
        return null
      }
    },
    [workspaceId, presentationId]
  )

  const pageRemaining = useCallback(async () => {
    if (pagingRef.current) return
    pagingRef.current = true
    try {
      while (nextOffsetRef.current != null) {
        const offset = nextOffsetRef.current
        // eslint-disable-next-line no-await-in-loop
        const payload = await fetchPage({ offset, limit: PAGE_LIMIT })
        if (!payload || payload.notModified) break
        applyPage(payload)
        if (payload.nextOffset == null) {
          nextOffsetRef.current = null
          break
        }
        if (Number(payload.nextOffset) === offset) {
          nextOffsetRef.current = null
          break
        }
      }
    } finally {
      pagingRef.current = false
    }
  }, [fetchPage, applyPage])

  const loadInitial = useCallback(async () => {
    setLoading(true)
    setError('')
    setFontsReady(false)
    setMainReady(false)
    coverAttemptedRef.current = false

    const cached = previewCache.get(cacheKey)
    const payload = await fetchPage({
      offset: 0,
      limit: PAGE_LIMIT,
      etag: etagRef.current || cached?.etag || null,
    })
    if (!payload) return

    if (payload.notModified) {
      if (cached?.slides?.length) {
        setMeta(cached.meta)
        setSlides(cached.slides)
        deckRef.current = { ...cached.meta, slides: cached.slides }
        coverStaleRef.current = Boolean(cached.meta?.coverStale)
        setLoading(false)
        await waitForFonts(cached.meta?.fontCssUrl, cached.meta?.themeTokens)
        // If deck is generating, still poll
        if ((cached.meta?.nextPollMs || 0) > 0) {
          /* polling effect handles */
        }
        return
      }
      // 304 with empty cache — refetch without etag
      const fresh = await fetchPage({ offset: 0, limit: PAGE_LIMIT })
      if (!fresh || fresh.notModified) {
        setLoading(false)
        return
      }
      applyPage(fresh, { replace: true })
      await waitForFonts(fresh.fontCssUrl, fresh.themeTokens)
      pageRemaining()
      return
    }

    applyPage(payload, { replace: true })
    await waitForFonts(payload.fontCssUrl, payload.themeTokens)
    pageRemaining()
  }, [cacheKey, fetchPage, applyPage, waitForFonts, pageRemaining])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (cancelled) return
      await loadInitial()
    })()
    return () => {
      cancelled = true
      if (pollTimerRef.current) {
        window.clearTimeout(pollTimerRef.current)
        pollTimerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- remount per presentation
  }, [workspaceId, presentationId])

  // Poll only while the deck is still GENERATING (nextPollMs > 0).
  useEffect(() => {
    const nextPoll = Number(meta?.nextPollMs) || 0
    if (nextPoll <= 0) return undefined

    let cancelled = false
    const schedule = (ms) => {
      pollTimerRef.current = window.setTimeout(async () => {
        if (cancelled) return
        const payload = await fetchPage({ offset: 0, limit: PAGE_LIMIT })
        if (cancelled) return
        if (!payload || payload.notModified) {
          schedule(nextPoll)
          return
        }
        applyPage(payload, { replace: true })
        await waitForFonts(payload.fontCssUrl, payload.themeTokens)
        const again = Number(payload.nextPollMs) || 0
        if (again > 0) schedule(again)
        if (payload.nextOffset != null) pageRemaining()
      }, ms)
    }
    schedule(nextPoll)
    return () => {
      cancelled = true
      if (pollTimerRef.current) {
        window.clearTimeout(pollTimerRef.current)
        pollTimerRef.current = null
      }
    }
  }, [meta?.nextPollMs, fetchPage, applyPage, waitForFonts, pageRemaining])

  const slide0 = slides.find((s) => (s.order ?? 0) === 0) || slides[0] || null
  const needsCoverCapture = Boolean(meta?.coverStale) && Boolean(slide0)

  // Cover capture — once per modal open when coverStale, after slide 1 is on screen.
  useEffect(() => {
    if (!fontsReady || !mainReady) return
    if (!needsCoverCapture || coverAttemptedRef.current) return
    if (!workspaceId || !presentationId) return
    const node = slideOneHostRef.current
    if (!node) return

    coverAttemptedRef.current = true
    ;(async () => {
      try {
        const blob = await captureNodeToJpegBlob(node, { quality: 0.82, pixelRatio: 1 })
        if (!blob) return
        await presentationService.uploadThumbnailImage(workspaceId, presentationId, blob)
      } catch {
        /* fire-and-forget */
      }
    })()
  }, [fontsReady, mainReady, needsCoverCapture, workspaceId, presentationId])

  const goTo = useCallback(
    (index) => {
      const total = Math.max(slideCount, slides.length)
      if (!total) return
      setActiveIndex(Math.max(0, Math.min(total - 1, index)))
    },
    [slideCount, slides.length]
  )

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo])
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo])

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
    const handoff = deckRef.current || {
      ...meta,
      slides,
    }
    stashPreviewHandoff(presentationId, handoff)
    onEdit?.({
      ...item,
      id: presentationId,
      workspaceId,
      previewDeck: handoff,
    })
    onClose?.()
  }

  const filmstripSlots = Math.max(slideCount || 0, slides.length)
  const onMainRendered = useCallback(() => setMainReady(true), [])

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
                  <h2>{meta?.title || titleFallback}</h2>
                  <span className="deck-preview-badge">Presentation</span>
                </div>
                <p>
                  {slideCount ? `${slideCount} slide${slideCount === 1 ? '' : 's'}` : '—'}
                  <span aria-hidden>·</span>
                  {statusLabel(deckStatus || meta?.status)}
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
                <span>{filmstripSlots || 0}</span>
              </div>
              <div className="deck-preview-filmstrip-list">
                {loading && !slides.length
                  ? Array.from({ length: Math.min(6, item?.slideCount || 4) }).map((_, i) => (
                      <div key={`skel-${i}`} className="deck-preview-thumb is-skeleton" />
                    ))
                  : null}

                {Array.from({ length: filmstripSlots }).map((_, index) => {
                  const slide = slides[index] || null
                  const active = index === activeIndex
                  return (
                    <FilmstripThumb
                      key={slide?.id || `slot-${index}`}
                      slide={slide}
                      index={index}
                      active={active}
                      aspectRatio={aspectRatio}
                      themeVisual={themeVisual}
                      fontsReady={fontsReady}
                      onSelect={goTo}
                      buttonRef={active ? activeThumbRef : null}
                    />
                  )
                })}

                {!loading && !filmstripSlots ? (
                  <p className="deck-preview-filmstrip-empty">No slides yet</p>
                ) : null}
              </div>
            </aside>

            <section className="deck-preview-stage-wrap">
              <div className="deck-preview-stage">
                {loading && !slides.length ? (
                  <div className="deck-preview-placeholder">
                    <div className="deck-preview-shimmer" />
                    <p>Loading deck preview…</p>
                  </div>
                ) : error && !slides.length ? (
                  <div className="deck-preview-placeholder">
                    <MdPresentToAll size={48} />
                    <p>{error}</p>
                    <button
                      type="button"
                      className="deck-preview-btn deck-preview-btn--ghost"
                      onClick={loadInitial}
                    >
                      Retry
                    </button>
                  </div>
                ) : !fontsReady ? (
                  <div className="deck-preview-placeholder">
                    <div className="deck-preview-shimmer" />
                    <p>Preparing fonts…</p>
                  </div>
                ) : !activeSlide ? (
                  <div className="deck-preview-placeholder">
                    <div className="deck-preview-shimmer" />
                    <p>{stillGenerating ? 'Generating slides…' : 'Loading slide…'}</p>
                  </div>
                ) : (
                  <div
                    className="deck-preview-live-frame"
                    style={{ aspectRatio: aspectBoxRatio(aspectRatio) }}
                  >
                    <DeckLiveSlideStage
                      key={activeSlide.id || activeIndex}
                      slide={activeSlide}
                      themeVisual={themeVisual}
                      aspectRatio={aspectRatio}
                      className="deck-preview-main-live"
                      onRendered={
                        !needsCoverCapture || activeSlide?.id === slide0?.id
                          ? onMainRendered
                          : undefined
                      }
                      stageRef={
                        activeSlide?.id === slide0?.id ? slideOneHostRef : undefined
                      }
                    />
                  </div>
                )}

                {needsCoverCapture &&
                fontsReady &&
                slide0 &&
                activeSlide?.id !== slide0.id ? (
                  <div className="deck-preview-cover-capture" aria-hidden="true">
                    <DeckLiveSlideStage
                      slide={slide0}
                      themeVisual={themeVisual}
                      aspectRatio={aspectRatio}
                      stageRef={slideOneHostRef}
                      onRendered={onMainRendered}
                    />
                  </div>
                ) : null}

                {slides.length > 1 || filmstripSlots > 1 ? (
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
                      disabled={activeIndex >= filmstripSlots - 1}
                      aria-label="Next slide"
                    >
                      <MdChevronRight size={28} />
                    </button>
                  </>
                ) : null}
              </div>

              <footer className="deck-preview-footer">
                <span className="deck-preview-counter">
                  {filmstripSlots ? `${activeIndex + 1} / ${filmstripSlots}` : '0 / 0'}
                </span>
                <span className="deck-preview-slide-title">
                  {activeSlide?.title || (filmstripSlots ? `Slide ${activeIndex + 1}` : '')}
                </span>
                {stillGenerating ? (
                  <span className="deck-preview-live-pill">Generating</span>
                ) : null}
                {error && slides.length ? (
                  <span className="deck-preview-live-pill is-warn">{error}</span>
                ) : null}
              </footer>
            </section>
          </div>
        </div>
      </div>

      {exportOpen ? (
        <ExportPresentationModal
          workspaceId={workspaceId}
          presentationId={presentationId}
          title={meta?.title || titleFallback}
          onClose={() => setExportOpen(false)}
        />
      ) : null}
    </>
  )
}
