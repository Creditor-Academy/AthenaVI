import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2, PencilLine, Presentation } from 'lucide-react'
import presentationService from '../../../services/presentationService'
import { fetchLayoutSchemaMap } from '../../../utils/layoutCanvasService'
import {
  extractSlidesFromPresentation,
  toApiThemeId,
  buildWizardThemeTokens,
} from '../../../utils/presentationHelpers'
import { THEMES } from '../../../constants/pptWizardThemes'
import MinimapSlidePreview from './MinimapSlidePreview'
import './PptHistoryPreview.css'

function readDeckStatus(data) {
  return String(
    data?.deck?.status ||
      data?.status ||
      data?.presentation?.deck?.status ||
      data?.presentation?.status ||
      data?.deckStatus ||
      ''
  ).toUpperCase()
}

function resolveThemeVisual(themeId, themeTokens) {
  const palette = themeTokens?.palette
  if (palette?.bg || palette?.primary || palette?.text) {
    const bg = palette.bg || palette.surface || '#FFFFFF'
    const primary = palette.primary || '#3B82F6'
    const secondary = palette.secondary || primary
    const text = palette.text || '#0F172A'
    const muted = palette.muted || '#64748B'
    return {
      id: 'themeTokens',
      themeId: themeTokens?.wizardColorThemeId || themeId,
      title: text,
      body: muted,
      background: bg,
      palette,
    }
  }

  const id = String(themeTokens?.wizardColorThemeId || themeId || '')
  const fallback = THEMES.find((t) => t.id === id || toApiThemeId(t.id) === id) || THEMES[0]
  const builtTokens = buildWizardThemeTokens(fallback.id, THEMES)
  const fallbackPalette = builtTokens?.palette || null
  const bg = fallback.background || fallbackPalette?.bg || '#FFFFFF'
  return {
    ...fallback,
    themeId: fallback.id,
    background: bg,
    palette: fallbackPalette,
  }
}

export default function PptHistoryPreview({
  workspaceId,
  presentationId,
  folderId = null,
  title: titleHint = '',
  themeId: themeHint = '',
  onEdit,
}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deckStatus, setDeckStatus] = useState('')
  const [title, setTitle] = useState(titleHint || 'Untitled Presentation')
  const [slides, setSlides] = useState([])
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [themeTokens, setThemeTokens] = useState(null)
  const [layoutSchemaMap, setLayoutSchemaMap] = useState({})
  const [selectedIndex, setSelectedIndex] = useState(0)

  const loadDeck = useCallback(async () => {
    if (!workspaceId || !presentationId) return
    setLoading(true)
    setError('')
    try {
      const [data, schemas] = await Promise.all([
        presentationService.getPresentation(workspaceId, presentationId),
        fetchLayoutSchemaMap(workspaceId),
      ])

      const nextSlides = extractSlidesFromPresentation(data)
      const nextAspect =
        data?.aspectRatio ||
        data?.deck?.aspectRatio ||
        data?.presentation?.aspectRatio ||
        '16:9'
      const tokens =
        data?.deck?.themeTokens ||
        data?.themeTokens ||
        data?.presentation?.deck?.themeTokens ||
        null

      setSlides(nextSlides)
      setAspectRatio(nextAspect === '9:16' ? '16:9' : nextAspect)
      setThemeTokens(tokens)
      setLayoutSchemaMap(schemas || {})
      setDeckStatus(readDeckStatus(data) || (nextSlides.length ? 'READY' : 'DRAFT'))
      setTitle(
        data?.title ||
          data?.presentation?.title ||
          data?.deck?.title ||
          titleHint ||
          'Untitled Presentation'
      )
      setSelectedIndex(0)
    } catch (err) {
      console.error('[PptHistoryPreview] Failed to load presentation:', err)
      setSlides([])
      setError(err?.message || 'Could not load this presentation.')
    } finally {
      setLoading(false)
    }
  }, [workspaceId, presentationId, titleHint])

  useEffect(() => {
    loadDeck()
  }, [loadDeck])

  useEffect(() => {
    if (deckStatus !== 'GENERATING' || !workspaceId || !presentationId) return undefined
    let cancelled = false
    ;(async () => {
      try {
        await presentationService.pollUntilReady(workspaceId, presentationId, {
          intervalMs: 2000,
        })
        if (!cancelled) loadDeck()
      } catch (err) {
        if (!cancelled) {
          setDeckStatus('FAILED')
          setError(err?.message || 'Presentation generation failed.')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [deckStatus, workspaceId, presentationId, loadDeck])

  const themeVisual = useMemo(
    () => resolveThemeVisual(themeHint || themeTokens?.wizardColorThemeId, themeTokens),
    [themeHint, themeTokens]
  )

  const currentSlide = slides[selectedIndex] || null
  const canBrowse = slides.length > 1
  const isGenerating = deckStatus === 'GENERATING'
  const isDraft = deckStatus === 'DRAFT' || deckStatus === 'OUTLINE'
  const isFailed = deckStatus === 'FAILED'
  const showStage = Boolean(currentSlide) && !isGenerating

  const goTo = useCallback((index) => {
    setSelectedIndex((prev) => {
      if (!slides.length) return prev
      return Math.max(0, Math.min(slides.length - 1, index))
    })
  }, [slides.length])

  useEffect(() => {
    const handleKey = (event) => {
      const tag = event.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || event.target?.isContentEditable) return
      if (event.key === 'ArrowLeft') goTo(selectedIndex - 1)
      if (event.key === 'ArrowRight') goTo(selectedIndex + 1)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [goTo, selectedIndex])

  const handleEdit = () => {
    onEdit?.({
      outline: slides,
      config: {
        title,
        theme: themeHint || themeVisual?.themeId || themeVisual?.id || 'petrol',
        workspaceId,
        presentationId,
      },
      workspaceId,
      presentationId,
      folderId,
    })
  }

  return (
    <main className="aig-preview-page">
      <div className="aig-preview-shell">
        <header className="aig-preview-head">
          <div className="aig-preview-head-copy">
            <p className="aig-preview-kicker">Preview</p>
            <h1>{title}</h1>
            <p className="aig-preview-meta">
              {slides.length
                ? `${slides.length} slide${slides.length === 1 ? '' : 's'}`
                : 'No slides yet'}
              {deckStatus && deckStatus !== 'READY' ? ` · ${deckStatus}` : ''}
            </p>
          </div>
          <button
            type="button"
            className="aig-preview-edit"
            onClick={handleEdit}
            disabled={loading || !workspaceId || !presentationId}
          >
            <PencilLine size={16} />
            Edit
          </button>
        </header>

        <div className="aig-preview-stage-wrap">
          {canBrowse && (
            <button
              type="button"
              className="aig-preview-nav aig-preview-nav--prev"
              onClick={() => goTo(selectedIndex - 1)}
              disabled={selectedIndex <= 0}
              aria-label="Previous slide"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          <div
            className="aig-preview-stage"
            style={{ aspectRatio: aspectRatio.replace(':', ' / ') }}
          >
            {loading && (
              <div className="aig-preview-state">
                <Loader2 size={22} className="aig-preview-spin" />
                Loading presentation…
              </div>
            )}

            {!loading && error && !showStage && (
              <div className="aig-preview-state aig-preview-state--error">
                <p>{error}</p>
                <button type="button" onClick={loadDeck}>
                  Retry
                </button>
              </div>
            )}

            {!loading && isGenerating && (
              <div className="aig-preview-state">
                <Loader2 size={22} className="aig-preview-spin" />
                This deck is still generating. Preview will appear when it’s ready.
              </div>
            )}

            {!loading && !error && isDraft && !slides.length && (
              <div className="aig-preview-state">
                <Presentation size={22} />
                This deck hasn’t been generated yet.
              </div>
            )}

            {!loading && isFailed && !showStage && (
              <div className="aig-preview-state aig-preview-state--error">
                <p>{error || 'Generation failed for this presentation.'}</p>
                <button type="button" onClick={loadDeck}>
                  Retry
                </button>
              </div>
            )}

            {!loading && !isGenerating && !slides.length && !error && !isDraft && (
              <div className="aig-preview-state">No slides in this presentation.</div>
            )}

            {showStage && (
              <MinimapSlidePreview
                slide={currentSlide}
                themeVisual={themeVisual}
                themeId={themeVisual?.themeId || themeVisual?.id}
                aspectRatio={aspectRatio}
                fallbackBg={themeVisual?.background || '#ffffff'}
                layoutSchemaMap={layoutSchemaMap}
              />
            )}
          </div>

          {canBrowse && (
            <button
              type="button"
              className="aig-preview-nav aig-preview-nav--next"
              onClick={() => goTo(selectedIndex + 1)}
              disabled={selectedIndex >= slides.length - 1}
              aria-label="Next slide"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        {slides.length > 0 && !isGenerating && (
          <div className="aig-preview-filmstrip" role="list">
            {slides.map((slide, index) => (
              <button
                key={slide.id || index}
                type="button"
                role="listitem"
                className={`aig-preview-thumb ${index === selectedIndex ? 'is-active' : ''}`}
                onClick={() => setSelectedIndex(index)}
                aria-label={`Slide ${index + 1}`}
              >
                <span className="aig-preview-thumb-num">{index + 1}</span>
                <span className="aig-preview-thumb-stage">
                  <MinimapSlidePreview
                    slide={slide}
                    themeVisual={themeVisual}
                    themeId={themeVisual?.themeId || themeVisual?.id}
                    aspectRatio={aspectRatio}
                    fallbackBg={themeVisual?.background || '#ffffff'}
                    layoutSchemaMap={layoutSchemaMap}
                  />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
