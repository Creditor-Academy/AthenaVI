import { useEffect, useMemo, useState } from 'react'
import {
  Sparkles,
  Image as ImageIcon,
  Check,
  ArrowRight,
  LayoutTemplate,
  Palette,
  FileText,
  ImagePlus,
  Wand2,
  Layers,
  Coins,
  Clock,
} from 'lucide-react'
import presentationService from '../../../services/presentationService'
import {
  extractSlidesFromPresentation,
  getSlideImage,
} from '../../../utils/presentationHelpers'
import { getDeckLayoutSchema } from '../../../utils/deckLayoutRegistry'
import { contentPlainText } from '../../../utils/pptTextContent'
import { parseRegion, getGridDims, regionToBox } from '../../../utils/layoutPreviewUtils'
import CanvasElementsPreview from '../../../components/ppt/CanvasElementsPreview'
import LayoutPolishedPreview from '../../../components/ppt/LayoutPolishedPreview'

const SETUP_STEPS = [
  { label: 'Layout', text: 'Drafting presentation layout…', icon: LayoutTemplate },
  { label: 'Theme', text: 'Applying base theme and colors…', icon: Palette },
  { label: 'Content', text: 'Generating slide intelligence…', icon: FileText },
  { label: 'Visuals', text: 'Sourcing visual media…', icon: ImagePlus },
  { label: 'Polish', text: 'Polishing final presentation…', icon: Wand2 },
]

/** Timer-driven steps stop here until real slide progress arrives. */
const TIMER_STEP_CAP = 2
const VISUALS_STEP = 3
const POLISH_STEP = 4

const SLIDE_DWELL_MS = 4500

function formatEta(seconds) {
  const sec = Math.round(Number(seconds))
  if (!Number.isFinite(sec)) return null
  if (sec <= 0) return 'Almost done'
  if (sec < 60) return `~${sec}s`
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return s ? `~${m}m ${s}s` : `~${m}m`
}

function formatCredits(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n.toLocaleString() : null
}

const SLIDE_TILE_STATUS = {
  READY: { className: 'ready', label: 'ready' },
  FAILED: { className: 'failed', label: 'failed' },
  GENERATING: { className: 'generating', label: 'generating' },
  PENDING: { className: 'pending', label: 'waiting' },
}

function GenerationStageStepper({ activeIndex }) {
  return (
    <ol className="aig-gen-stepper">
      {SETUP_STEPS.map((step, i) => {
        const state = i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'pending'
        const Icon = step.icon
        return (
          <li key={step.label} className={`aig-gen-step aig-gen-step--${state}`}>
            <span className="aig-gen-step-dot" aria-hidden>
              {state === 'done' ? <Check size={14} strokeWidth={3} /> : <Icon size={14} />}
            </span>
            <span className="aig-gen-step-label">{step.label}</span>
            <span className="aig-sr-only">{state === 'done' ? ' (done)' : state === 'active' ? ' (in progress)' : ''}</span>
          </li>
        )
      })}
    </ol>
  )
}

function SlideProgressTiles({ slides, readyCount, totalCount }) {
  const pct = totalCount ? Math.round((readyCount / totalCount) * 100) : 0
  return (
    <section className="aig-gen-slides" aria-label="Slide progress">
      <div className="aig-gen-slides-head">
        <span className="aig-gen-section-label">Slides</span>
        <span className="aig-gen-slides-count">
          <strong>{readyCount}</strong> / {totalCount}
        </span>
      </div>
      <div className="aig-gen-bar" aria-hidden>
        <div className="aig-gen-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <ul className="aig-gen-tiles">
        {slides.map((slide, i) => {
          const meta = SLIDE_TILE_STATUS[slide.status] || SLIDE_TILE_STATUS.PENDING
          return (
            <li
              key={slide.id}
              className={`aig-gen-tile aig-gen-tile--${meta.className}`}
              aria-label={`Slide ${i + 1}: ${meta.label}`}
              title={`Slide ${i + 1}: ${meta.label}`}
            >
              {meta.className === 'ready' ? <Check size={12} strokeWidth={3} aria-hidden /> : <span aria-hidden>{i + 1}</span>}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function GenerationStatCards({ readyCount, totalCount, credits, eta }) {
  const stats = [
    totalCount > 0 && { key: 'slides', icon: Layers, value: `${readyCount} of ${totalCount}`, label: 'Slides ready' },
    credits != null && { key: 'credits', icon: Coins, value: credits, label: 'Credits used' },
    eta != null && { key: 'eta', icon: Clock, value: eta, label: 'Time left' },
  ].filter(Boolean)
  if (!stats.length) return null
  return (
    <div className="aig-gen-stats">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.key} className="aig-gen-stat">
            <span className="aig-gen-stat-icon" aria-hidden>
              <Icon size={18} />
            </span>
            <div className="aig-gen-stat-body">
              <span className="aig-gen-stat-value">{stat.value}</span>
              <span className="aig-gen-stat-label">{stat.label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function mapPresentationSlides(presentationData, outlineSlides = []) {
  const slides = extractSlidesFromPresentation(presentationData)
  return slides.map((slide, i) => {
    const image = getSlideImage(slide)
    const outline = outlineSlides[i] || {}
    const hasElements = Boolean(slide?.elements?.elements?.length)
    return {
      id: slide.id || i + 1,
      title: slide.title || outline.title || `Slide ${i + 1}`,
      description: Array.isArray(slide.description)
        ? slide.description.filter(Boolean).join(' · ') || outline.summary || 'Slide ready'
        : String(slide.description || outline.summary || 'Slide ready'),
      img: image.url,
      imageNone: image.intentionallyNone,
      imageError: image.error,
      slideStatus: String(slide.status || 'READY').toUpperCase(),
      layoutId: slide.layoutId || outline.layoutId || null,
      elements: hasElements ? slide.elements : null,
      backgroundColor: slide.backgroundColor,
      slideDoc: hasElements ? slide : null,
    }
  })
}

const TYPE_CHAR_MS = 36
const CURSOR_BLINK_MS = 500
const TYPE_CURSOR = '▍'
const TITLE_ROLES = new Set(['title', 'heading', 'headline'])
const TITLE_SLOT_IDS = new Set(['HEADING', 'TITLE', 'MAIN_TITLE'])

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)

/** "chart_donut_context_v1" → "Chart Donut Context" */
function humanizeLayoutId(layoutId) {
  return String(layoutId || '')
    .replace(/_v\d+$/i, '')
    .split('_')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/**
 * The slide's heading element: slot id → exact title text → role → largest text.
 * Slot id leads because card titles also carry role "heading".
 */
function findTitleElementId(elements = [], title = '') {
  const texts = elements.filter((el) => el && (el.type === 'text' || el.type === 'textbox'))
  if (!texts.length) return null
  const wanted = String(title || '').trim()
  const bySlot = texts.find((el) => TITLE_SLOT_IDS.has(String(el.slotId || '').toUpperCase()))
  if (bySlot) return bySlot.id
  if (wanted) {
    const byText = texts.find((el) => contentPlainText(el.content).trim() === wanted)
    if (byText) return byText.id
  }
  const byRole = texts.find((el) => TITLE_ROLES.has(String(el.role || '').toLowerCase()))
  if (byRole) return byRole.id
  const largest = texts.reduce((best, el) =>
    (Number(el.content?.fontSize) || 0) > (Number(best.content?.fontSize) || 0) ? el : best
  )
  return largest.id
}

/** Shallow clone of a slide doc with one text element's copy replaced (style/placement kept). */
function withTitleText(slideDoc, elementId, text) {
  const doc = slideDoc?.elements
  if (!doc?.elements?.length || !elementId) return slideDoc
  return {
    ...slideDoc,
    elements: {
      ...doc,
      elements: doc.elements.map((el) =>
        el.id === elementId
          ? { ...el, content: { ...el.content, text, runs: undefined, html: undefined } }
          : el
      ),
    },
  }
}

/** Percent box of the schema's heading slot, for overlaying the typed title on SVG previews. */
function headingSlotBox(schema) {
  const slots = Array.isArray(schema?.slots) ? schema.slots : []
  const slot =
    slots.find((s) => TITLE_SLOT_IDS.has(String(s.id || '').toUpperCase())) ||
    slots.find((s) => String(s.role || '').toLowerCase() === 'heading')
  const reg = slot ? parseRegion(slot.region) : null
  if (!reg) return null
  const { COLS, ROWS } = getGridDims(slots)
  return regionToBox(reg, COLS, ROWS, 1)
}

function RealtimeLayoutStage({ slide, status, titleOverride }) {
  const schema = slide?.layoutId ? getDeckLayoutSchema(slide.layoutId) : null
  const hasCanvas = Boolean(slide?.slideDoc?.elements?.elements?.length)
  const showImageFallback = !hasCanvas && !schema?.slots?.length

  const titleElementId = useMemo(
    () => (hasCanvas ? findTitleElementId(slide.slideDoc.elements.elements, slide.title) : null),
    [hasCanvas, slide]
  )
  const canvasSlide = useMemo(() => {
    if (!hasCanvas) return null
    if (titleOverride == null || !titleElementId) return slide.slideDoc
    return withTitleText(slide.slideDoc, titleElementId, titleOverride)
  }, [hasCanvas, slide, titleElementId, titleOverride])
  const overlayBox = useMemo(() => (hasCanvas ? null : headingSlotBox(schema)), [hasCanvas, schema])

  // Non-canvas previews have no editable heading — overlay the title (full once complete).
  const overlayTitle = titleOverride ?? slide?.title ?? ''

  return (
    <div className="aig-realtime-layout-stage">
      {hasCanvas && <CanvasElementsPreview slide={canvasSlide} fill className="aig-realtime-layout-preview" />}
      {!hasCanvas && schema?.slots?.length > 0 && (
        <>
          <LayoutPolishedPreview schema={schema} slots={schema.slots} large fill className="aig-realtime-layout-preview" />
          {overlayTitle && (
            <div
              className="aig-realtime-title-overlay"
              style={
                overlayBox
                  ? { left: `${overlayBox.x}%`, top: `${overlayBox.y}%`, width: `${overlayBox.w}%`, minHeight: `${overlayBox.h}%` }
                  : { left: '6%', top: '6%', width: '70%' }
              }
            >
              {overlayTitle}
            </div>
          )}
        </>
      )}
      {showImageFallback && (
        <div className="aig-realtime-media aig-realtime-media--fill">
          {status === 'active' && !slide?.img && (
            <div className="aig-skeleton-loader">
              <ImageIcon size={32} color="#94a3b8" className="aig-pulse-icon" />
              <span>Generating visual…</span>
            </div>
          )}
          {slide?.img && <img src={slide.img} alt="" className="aig-realtime-img fade-in" />}
          {overlayTitle && <div className="aig-realtime-title-scrim">{overlayTitle}</div>}
        </div>
      )}
    </div>
  )
}

function RealtimeSlideCard({ slide, status }) {
  const title = slide?.title || 'Slide'
  const isActive = status === 'active'
  const isComplete = status === 'prev' || status === 'done'
  const [reduceMotion] = useState(prefersReducedMotion)
  const [typedTitle, setTypedTitle] = useState('')
  const [cursorOn, setCursorOn] = useState(true)

  useEffect(() => {
    // Reduced motion renders the full title directly (see titleOverride) — no typing timers.
    if (!isActive || reduceMotion) return undefined
    let i = 0
    let titleTimer
    const start = window.setTimeout(() => {
      setTypedTitle('')
      titleTimer = setInterval(() => {
        i += 1
        setTypedTitle(title.substring(0, i))
        if (i >= title.length) clearInterval(titleTimer)
      }, TYPE_CHAR_MS)
    }, 0)
    return () => {
      clearTimeout(start)
      clearInterval(titleTimer)
    }
  }, [isActive, title, reduceMotion])

  useEffect(() => {
    if (!isActive || reduceMotion) return undefined
    const blink = setInterval(() => setCursorOn((on) => !on), CURSOR_BLINK_MS)
    return () => clearInterval(blink)
  }, [isActive, reduceMotion])

  // active: typed text + cursor · upcoming: blank heading · complete: real slide copy.
  let titleOverride = null
  if (isActive) {
    const typing = typedTitle.length < title.length
    titleOverride = reduceMotion ? title : `${typedTitle}${typing || cursorOn ? TYPE_CURSOR : ''}`
  } else if (!isComplete) {
    titleOverride = ''
  }

  return (
    <div
      className={`aig-realtime-slide-card aig-realtime-slide-card--layout pos-${status === 'done' ? 'prev' : status}`}
      aria-hidden={!isActive}
      aria-label={isActive ? `Slide: ${title}` : undefined}
    >
      <RealtimeLayoutStage slide={slide} status={status} titleOverride={titleOverride} />
      {isActive && slide?.layoutId && (
        <span className="aig-realtime-layout-badge">{humanizeLayoutId(slide.layoutId)}</span>
      )}
    </div>
  )
}

export default function AIPptGenerating({
  workspaceId,
  presentationId,
  expectedSlideCount,
  outlineSlides = [],
  onComplete,
  onError,
}) {
  // 'setup' while API generates · 'slides' reveal after READY · done when carousel finishes
  const [phase, setPhase] = useState('setup')
  const [setupProgress, setSetupProgress] = useState(0)
  const [setupStepIndex, setSetupStepIndex] = useState(0)
  const [statusPayload, setStatusPayload] = useState(null)
  const [revealSlides, setRevealSlides] = useState([])
  const [slideIndex, setSlideIndex] = useState(0)
  const [revealFinished, setRevealFinished] = useState(false)
  const [pollError, setPollError] = useState('')

  const progressPct = useMemo(() => {
    const apiPct = Number(statusPayload?.progress ?? statusPayload?.percent)
    if (!Number.isNaN(apiPct) && apiPct >= 0) {
      return Math.min(99, Math.max(0, Math.round(apiPct)))
    }
    return Math.min(99, Math.round(setupProgress))
  }, [statusPayload, setupProgress])

  const readyCount = useMemo(() => {
    const list = statusPayload?.slides || []
    return list.filter((s) => String(s.status || '').toUpperCase() === 'READY').length
  }, [statusPayload])

  const totalCount = useMemo(() => {
    const list = statusPayload?.slides || []
    return list.length || Number(expectedSlideCount) || 0
  }, [statusPayload, expectedSlideCount])

  const tileSlides = useMemo(() => {
    const list = statusPayload?.slides || []
    if (list.length) {
      return [...list]
        .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
        .map((s, i) => ({ id: s.id || i, status: String(s.status || 'PENDING').toUpperCase() }))
    }
    return Array.from({ length: totalCount }, (_, i) => ({ id: `pending-${i}`, status: 'PENDING' }))
  }, [statusPayload, totalCount])

  // Stage reflects real slide progress; the timer only animates the early, pre-slide steps.
  const stageIndex = useMemo(() => {
    const terminal = tileSlides.filter((s) => s.status === 'READY' || s.status === 'FAILED').length
    if (phase !== 'setup' || (totalCount > 0 && terminal >= totalCount && statusPayload)) return POLISH_STEP
    if (readyCount > 0) return VISUALS_STEP
    return Math.min(TIMER_STEP_CAP, setupStepIndex)
  }, [phase, tileSlides, totalCount, statusPayload, readyCount, setupStepIndex])

  // Soft % animation while waiting for API progress ticks
  useEffect(() => {
    if (phase !== 'setup') return undefined
    let currentStep = 0
    const interval = setInterval(() => {
      setSetupProgress((p) => {
        const next = Math.min(90, p + 2)
        if (next % 18 === 0 && currentStep < TIMER_STEP_CAP) {
          currentStep += 1
          setSetupStepIndex(currentStep)
        }
        return next
      })
    }, 160)
    return () => clearInterval(interval)
  }, [phase])

  // Poll until READY — stay on % page the whole time
  useEffect(() => {
    if (!workspaceId || !presentationId) {
      onError?.('Missing presentation id — cannot track generation.')
      return undefined
    }

    let cancelled = false

    presentationService
      .pollUntilReady(workspaceId, presentationId, {
        intervalMs: 2000,
        onProgress: (status) => {
          if (cancelled) return
          setStatusPayload(status)
          const pct = Number(status?.progress ?? status?.percent)
          if (!Number.isNaN(pct) && pct > 0) {
            setSetupProgress(Math.min(99, pct))
          }
          // Stay on setup phase — do NOT flip to slides mid-generation
        },
      })
      .then(async (finalStatus) => {
        if (cancelled) return
        setStatusPayload(finalStatus)
        setSetupProgress(100)

        try {
          const presentation = await presentationService.getPresentation(
            workspaceId,
            presentationId
          )
          if (cancelled) return
          const mapped = mapPresentationSlides(presentation, outlineSlides)
          setRevealSlides(
            mapped.length
              ? mapped
              : Array.from({ length: Number(expectedSlideCount) || 5 }, (_, i) => ({
                  id: i + 1,
                  title: `Slide ${i + 1}`,
                  description: 'Slide ready',
                  img: null,
                  slideStatus: 'READY',
                }))
          )
        } catch {
          if (cancelled) return
          // Fallback: status slides only (may lack images)
          const raw = finalStatus?.slides || []
          setRevealSlides(
            raw.map((slide, i) => ({
              id: slide.id || i + 1,
              title: slide.title || slide.topic || outlineSlides[i]?.title || `Slide ${i + 1}`,
              description: slide.summary || slide.contentType || 'Slide ready',
              img:
                slide.thumbnailUrl ||
                slide.imageUrl ||
                slide.imageRef?.url ||
                null,
              slideStatus: String(slide.status || 'READY').toUpperCase(),
              layoutId: slide.layoutId || outlineSlides[i]?.layoutId || null,
              elements: null,
              slideDoc: null,
            }))
          )
        }

        if (!cancelled) {
          setSlideIndex(0)
          setRevealFinished(false)
          setPhase('slides')
        }
      })
      .catch((error) => {
        if (cancelled) return
        setPollError(error.message || 'Generation failed')
        onError?.(error.message || 'Generation failed')
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, presentationId])

  // After READY: type through slides one by one
  useEffect(() => {
    if (phase !== 'slides' || !revealSlides.length || revealFinished) return undefined

    if (slideIndex >= revealSlides.length - 1) {
      const timer = setTimeout(() => setRevealFinished(true), SLIDE_DWELL_MS)
      return () => clearTimeout(timer)
    }

    const timer = setTimeout(() => {
      setSlideIndex((prev) => prev + 1)
    }, SLIDE_DWELL_MS)

    return () => clearTimeout(timer)
  }, [phase, slideIndex, revealSlides.length, revealFinished])

  return (
    <main className="aig-main-fullscreen aig-main-center">
      {phase === 'setup' && (
        <div
          className="aig-generating-screen aig-gen-card fade-in"
          role="progressbar"
          aria-label="Building your presentation"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPct}
        >
          <div className="aig-liquid-loader-wrapper aig-gen-loader">
            <div className="aig-liquid-loader">
              <div className="aig-liquid-fill" style={{ top: `${100 - progressPct}%` }}></div>
              <div className="aig-liquid-percent">{progressPct}%</div>
            </div>
          </div>

          <div className="aig-gen-heading">
            <h2 className="aig-generating-title">Building your presentation</h2>
            <p className="aig-gen-stage-chip" aria-live="polite">
              {(() => {
                const StageIcon = SETUP_STEPS[stageIndex].icon
                return <StageIcon size={16} className="aig-pulse-icon" aria-hidden />
              })()}
              <span key={stageIndex} className="fade-in">{SETUP_STEPS[stageIndex].text}</span>
            </p>
          </div>

          <GenerationStageStepper activeIndex={stageIndex} />

          {totalCount > 0 && (
            <SlideProgressTiles slides={tileSlides} readyCount={readyCount} totalCount={totalCount} />
          )}

          <GenerationStatCards
            readyCount={readyCount}
            totalCount={totalCount}
            credits={formatCredits(statusPayload?.creditsChargedSoFar)}
            eta={statusPayload?.etaSeconds != null ? formatEta(statusPayload.etaSeconds) : null}
          />

          {pollError && <p className="aig-flow-error">{pollError}</p>}
        </div>
      )}

      {phase === 'slides' && (
        <div className="aig-realtime-gen-container fade-in">
          <div className="aig-realtime-header fade-in">
            <Sparkles size={24} className="aig-pulse-icon" />
            <h3>
              {revealFinished
                ? 'Presentation Complete!'
                : `AI is writing Slide ${Math.min(slideIndex + 1, revealSlides.length)}…`}
            </h3>
            {statusPayload?.creditsChargedSoFar != null && (
              <span className="aig-credit-estimate-hint">
                {statusPayload.creditsChargedSoFar} credits so far
              </span>
            )}
          </div>

          <div className="aig-realtime-carousel-wrapper">
            {revealSlides.map((slide, i) => {
              let status = 'hidden'
              if (revealFinished && i === revealSlides.length - 1) status = 'done'
              else if (i === slideIndex) status = 'active'
              else if (i === slideIndex - 1) status = 'prev'
              else if (i === slideIndex + 1) status = 'next'
              return <RealtimeSlideCard key={slide.id} slide={slide} status={status} />
            })}
          </div>

          <div className="aig-mini-slides-tray fade-in">
            {revealSlides.map((slide, i) => {
              const done = revealFinished || i < slideIndex
              const active = i === slideIndex && !revealFinished
              return (
                <div
                  key={slide.id}
                  className={`aig-mini-slide ${
                    active ? 'active' : done ? 'completed' : 'pending'
                  }`}
                >
                  <span className="aig-mini-slide-num">{i + 1}</span>
                  {done && <Check size={12} className="aig-mini-check" />}
                </div>
              )
            })}
          </div>

          {revealFinished && (
            <div className="aig-redirect-action fade-in">
              <button className="aig-btn-magic" onClick={() => onComplete(statusPayload)}>
                Go to Editor <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
