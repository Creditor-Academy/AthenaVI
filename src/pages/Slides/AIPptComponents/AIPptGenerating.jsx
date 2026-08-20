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
} from 'lucide-react'
import presentationService from '../../../services/presentationService'
import {
  extractSlidesFromPresentation,
  getSlideImage,
} from '../../../utils/presentationHelpers'
import { getDeckLayoutSchema } from '../../../utils/deckLayoutRegistry'
import CanvasElementsPreview from '../../../components/ppt/CanvasElementsPreview'
import LayoutPolishedPreview from '../../../components/ppt/LayoutPolishedPreview'

const SETUP_STEPS = [
  { text: 'Drafting presentation layout…', icon: LayoutTemplate },
  { text: 'Applying base theme and colors…', icon: Palette },
  { text: 'Generating slide intelligence…', icon: FileText },
  { text: 'Sourcing visual media…', icon: ImagePlus },
  { text: 'Polishing final presentation…', icon: Wand2 },
]

const SLIDE_DWELL_MS = 4500

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

function RealtimeLayoutStage({ slide, status }) {
  const schema = slide?.layoutId ? getDeckLayoutSchema(slide.layoutId) : null
  const hasCanvas = Boolean(slide?.slideDoc?.elements?.elements?.length)
  const showImageFallback = !hasCanvas && !schema?.slots?.length

  return (
    <div className="aig-realtime-layout-stage">
      {hasCanvas && (
        <CanvasElementsPreview slide={slide.slideDoc} fill className="aig-realtime-layout-preview" />
      )}
      {!hasCanvas && schema?.slots?.length > 0 && (
        <LayoutPolishedPreview schema={schema} slots={schema.slots} large fill className="aig-realtime-layout-preview" />
      )}
      {showImageFallback && (
        <div className="aig-realtime-media aig-realtime-media--fill">
          {status === 'active' && !slide?.img && (
            <div className="aig-skeleton-loader">
              <ImageIcon size={32} color="#94a3b8" className="aig-pulse-icon" />
              <span>Generating visual…</span>
            </div>
          )}
          {slide?.img && (
            <img src={slide.img} alt="" className="aig-realtime-img fade-in" />
          )}
          {!slide?.img && status !== 'active' && (
            <div className="aig-skeleton-loader">
              <Check size={28} color="#22c55e" />
              <span>{slide?.layoutId ? slide.layoutId.replace(/_/g, ' ') : 'Slide ready'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RealtimeSlideCard({ slide, status }) {
  const [typedTitle, setTypedTitle] = useState('')
  const title = slide?.title || 'Slide'
  const isActive = status === 'active'
  const isComplete = status === 'prev' || status === 'done'
  const displayTitle = isComplete ? title : typedTitle

  useEffect(() => {
    if (!isActive) return undefined
    let i = 0
    let titleTimer
    const start = window.setTimeout(() => {
      setTypedTitle('')
      titleTimer = setInterval(() => {
        i += 1
        setTypedTitle(title.substring(0, i))
        if (i >= title.length) clearInterval(titleTimer)
      }, 36)
    }, 0)
    return () => {
      clearTimeout(start)
      clearInterval(titleTimer)
    }
  }, [isActive, title])

  return (
    <div className={`aig-realtime-slide-card aig-realtime-slide-card--layout pos-${status === 'done' ? 'prev' : status}`}>
      <RealtimeLayoutStage slide={slide} status={status} />
      <div className="aig-realtime-caption">
        <h1 className="aig-realtime-title aig-realtime-title--caption">
          {displayTitle}
          {isActive && <span className="aig-type-cursor"></span>}
        </h1>
        {slide?.layoutId && (
          <p className="aig-realtime-layout-id">{String(slide.layoutId).replace(/_/g, ' ')}</p>
        )}
      </div>
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

  // Soft % animation while waiting for API progress ticks
  useEffect(() => {
    if (phase !== 'setup') return undefined
    let currentStep = 0
    const interval = setInterval(() => {
      setSetupProgress((p) => {
        const next = Math.min(90, p + 2)
        if (next % 18 === 0 && currentStep < SETUP_STEPS.length - 1) {
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
            const step = Math.min(
              SETUP_STEPS.length - 1,
              Math.floor((pct / 100) * SETUP_STEPS.length)
            )
            setSetupStepIndex(step)
          }
          // Stay on setup phase — do NOT flip to slides mid-generation
        },
      })
      .then(async (finalStatus) => {
        if (cancelled) return
        setStatusPayload(finalStatus)
        setSetupProgress(100)
        setSetupStepIndex(SETUP_STEPS.length - 1)

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
        <div className="aig-generating-screen fade-in">
          <div className="aig-liquid-loader-wrapper">
            <div className="aig-liquid-loader">
              <div className="aig-liquid-fill" style={{ top: `${100 - progressPct}%` }}></div>
              <div className="aig-liquid-percent">{progressPct}%</div>
            </div>
          </div>
          <h2 className="aig-generating-title" style={{ marginTop: '32px' }}>
            Building your presentation
          </h2>
          <p className="aig-generating-text fade-in" key={setupStepIndex} style={{ marginTop: '12px' }}>
            {SETUP_STEPS[setupStepIndex].text}
          </p>
          {totalCount > 0 && (
            <p className="aig-generating-text" style={{ opacity: 0.7, marginTop: 8 }}>
              {readyCount} of {totalCount} slides ready
            </p>
          )}
          {statusPayload?.creditsChargedSoFar != null && (
            <p className="aig-credit-estimate-hint" style={{ marginTop: 8 }}>
              {statusPayload.creditsChargedSoFar} credits so far
            </p>
          )}
          {statusPayload?.etaSeconds != null && (
            <p className="aig-generating-text" style={{ opacity: 0.7 }}>
              ETA ~{statusPayload.etaSeconds}s
            </p>
          )}
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
