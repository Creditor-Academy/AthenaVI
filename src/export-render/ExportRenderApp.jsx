import { useEffect, useMemo, useRef, useState } from 'react'
import PptCanvasElement from '../pages/Slides/AIPptComponents/PptCanvasElement'
import { EDITOR_STAGE_WIDTH, resolveStageElements } from '../utils/slideStageElements'
import {
  extractSlidesFromPresentation,
  getSlideImage,
  resolveCanvasSize,
  resolveSlideStageBackground,
} from '../utils/presentationHelpers'
import { rethemeSlidesGraphicElements } from '../utils/rethemeGraphicElements'
import { resolveThemeVisual } from '../utils/pptThemeVisual'
import {
  collectSlideFontFamilies,
  ensureElementFontsLoaded,
  ensureFontCssUrl,
  ensureThemeFontsLoaded,
  themeFontFamilies,
} from '../utils/googleFonts'
import {
  isolateForCapture,
  measureTables,
  measureTextElements,
  releaseCapture,
  settleExportPage,
} from './exportRenderSettle'

/**
 * Bumped when the page's contract with the backend changes (payload, measure() output).
 * The backend refuses a renderer older than the version it needs.
 */
export const EXPORT_RENDERER_VERSION = 1

/**
 * Same frame the editor / Present put around each element: %-positioned on the slide, rotated
 * about its centre, layered by `layer`.
 */
function ExportElement({ el, palette, canvas }) {
  const p = el.placement || {}
  const rotation = Number(p.rotation) || 0
  return (
    <div
      data-export-el={el.id}
      style={{
        position: 'absolute',
        left: `${((p.x || 0) / canvas.width) * 100}%`,
        top: `${((p.y || 0) / canvas.height) * 100}%`,
        width: `${((p.width || 100) / canvas.width) * 100}%`,
        height: `${((p.height || 40) / canvas.height) * 100}%`,
        opacity: p.opacity != null ? p.opacity : 1,
        zIndex: el.layer || 0,
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        transformOrigin: 'center center',
      }}
    >
      <PptCanvasElement
        el={el}
        palette={palette}
        editable={false}
        showEmptyTextHint={false}
        canvasW={canvas.width}
      />
    </div>
  )
}

/**
 * The elements the editor draws on a slide: after slide normalisation, re-theming, layout
 * finishing (custom chart layouts), and without the ones it doesn't paint (background
 * elements, ghost rings, stray scrims). Groups draw nothing themselves.
 */
function stageElementsOf(slide, aspectRatio, palette) {
  const canvas = resolveCanvasSize(slide, aspectRatio)
  return { canvas, elements: resolveStageElements(slide, canvas, palette).filter((el) => el.type !== 'group') }
}

/**
 * One slide at the editor's stage width (900px), exactly as the editor and Present lay it out,
 * so fit-to-box text shrinks to the same size it has in the editor.
 */
function ExportSlide({ slide, stage, themeVisual, fontVars }) {
  const palette = themeVisual?.palette || null
  const { canvas, elements } = stage
  const stageHeight = (EDITOR_STAGE_WIDTH * canvas.height) / canvas.width
  const background = resolveSlideStageBackground(slide, themeVisual?.inner || '#fff', palette)
  const fallbackImage = elements.length ? null : getSlideImage(slide).url

  return (
    <section
      className="export-slide"
      data-slide-id={slide.id}
      data-canvas-width={canvas.width}
      data-canvas-height={canvas.height}
      style={{
        width: EDITOR_STAGE_WIDTH,
        height: stageHeight,
        ...background,
        ...fontVars,
        color: themeVisual?.body,
      }}
    >
      {elements.length ? (
        elements.map((el) => <ExportElement key={el.id} el={el} palette={palette} canvas={canvas} />)
      ) : (
        <div className="export-slide-fallback">
          <h1 style={{ color: themeVisual?.title }}>{slide?.title || slide?.content?.title || ''}</h1>
          {fallbackImage ? <img src={fallbackImage} alt="" /> : null}
        </div>
      )}
    </section>
  )
}

function prepareDeck(payload) {
  const deck = payload?.deck || {}
  const aspectRatio = deck.aspectRatio || '16:9'
  const themeTokens = deck.themeTokens || null
  let slides = extractSlidesFromPresentation({ deck: { ...deck, aspectRatio } })
  slides = rethemeSlidesGraphicElements(slides, themeTokens)
  const wanted = Array.isArray(payload?.slideIds) && payload.slideIds.length ? new Set(payload.slideIds) : null
  if (wanted) slides = slides.filter((s) => wanted.has(s.id))
  const themeVisual = resolveThemeVisual(themeTokens?.wizardColorThemeId || deck.theme, themeTokens)
  const { headerFont, bodyFont } = themeFontFamilies(themeTokens)
  // Resolved once per job: layout finishing mints new element ids on every run, so the slides
  // drawn, measured and handed to the backend (stageSlides) must all share this one result.
  const palette = themeVisual?.palette || null
  const stages = Object.fromEntries(slides.map((slide) => [slide.id, stageElementsOf(slide, aspectRatio, palette)]))
  return {
    aspectRatio,
    slides,
    stages,
    themeTokens,
    fontCssUrl: deck.fontCssUrl || null,
    themeVisual,
    fontVars: {
      '--ppt-font-heading': `"${headerFont}", sans-serif`,
      '--ppt-font-body': `"${bodyFont}", sans-serif`,
    },
  }
}

export default function ExportRenderApp() {
  const [job, setJob] = useState(null)
  const pendingRef = useRef(null)
  const rootRef = useRef(null)
  const jobRef = useRef(null)
  useEffect(() => {
    jobRef.current = job
  }, [job])

  useEffect(() => {
    window.__athenaExport = {
      version: EXPORT_RENDERER_VERSION,
      ready: false,
      /**
       * Draw the deck. Resolves once fonts, images and fit-to-box text have settled, with the
       * slides drawn (stage size + canvas size) and anything that failed to load.
       */
      render(payload) {
        window.__athenaExport.ready = false
        return new Promise((resolve, reject) => {
          try {
            const prepared = prepareDeck(payload)
            pendingRef.current = { resolve, reject, timeoutMs: Number(payload?.timeoutMs) || 60_000 }
            setJob({ ...prepared, key: Date.now() })
          } catch (err) {
            reject(err)
          }
        })
      },
      /** Fitted font size (editor stage px), colour and overflow of every text element, by slide. */
      measure() {
        return measureTextElements(rootRef.current)
      },
      /**
       * The elements drawn on each slide (canvas px placements, content as rendered), so PPTX is
       * built from what the editor shows rather than the raw saved elements.
       */
      stageSlides() {
        const current = jobRef.current
        if (!current) return {}
        const out = {}
        for (const slide of current.slides) {
          const { canvas, elements } = current.stages[slide.id]
          out[slide.id] = JSON.parse(JSON.stringify({ canvas, elements }))
        }
        return out
      },
      /** Tables as drawn (cells, sizes, colours, borders), by slide — for native PPTX tables. */
      measureTables() {
        return measureTables(rootRef.current)
      },
      /** Show only one element, or only a slide's background, for a picture capture. */
      isolate(target) {
        return isolateForCapture(rootRef.current, target)
      },
      release() {
        releaseCapture(rootRef.current)
      },
    }
    window.__athenaExport.loaded = true
  }, [])

  // Load the deck's fonts the same way the editor does.
  useEffect(() => {
    if (!job) return
    if (job.fontCssUrl) ensureFontCssUrl(job.fontCssUrl)
    else ensureThemeFontsLoaded(job.themeTokens)
    ensureElementFontsLoaded(collectSlideFontFamilies(job.slides))
  }, [job])

  useEffect(() => {
    if (!job || !pendingRef.current) return
    const pending = pendingRef.current
    pendingRef.current = null
    let cancelled = false
    settleExportPage(rootRef.current, { timeoutMs: pending.timeoutMs })
      .then((result) => {
        if (cancelled) return
        window.__athenaExport.ready = true
        const slides = [...rootRef.current.querySelectorAll('.export-slide')].map((node) => ({
          id: node.dataset.slideId,
          stageWidth: node.offsetWidth,
          stageHeight: node.offsetHeight,
          canvasWidth: Number(node.dataset.canvasWidth),
          canvasHeight: Number(node.dataset.canvasHeight),
        }))
        pending.resolve({ version: EXPORT_RENDERER_VERSION, slides, ...result })
      })
      .catch((err) => pending.reject(err))
    return () => {
      cancelled = true
    }
  }, [job])

  const slides = useMemo(() => job?.slides || [], [job])

  return (
    <div ref={rootRef} key={job?.key || 'empty'}>
      {slides.map((slide) => (
        <ExportSlide
          key={slide.id}
          slide={slide}
          stage={job.stages[slide.id]}
          themeVisual={job.themeVisual}
          fontVars={job.fontVars}
        />
      ))}
    </div>
  )
}
