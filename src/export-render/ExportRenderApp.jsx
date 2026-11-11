import { useEffect, useMemo, useRef, useState } from 'react'
import {
  collectSlideFontFamilies,
  ensureElementFontsLoaded,
  ensureFontCssUrl,
  ensureThemeFontsLoaded,
} from '../utils/googleFonts'
import ExportSlide from './ExportSlide'
import { prepareDeck } from './exportDeck'
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
 * 2: `transparent` in the render payload leaves slide backgrounds out (transparent PNG).
 */
export const EXPORT_RENDERER_VERSION = 2

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
          transparent={job.transparent}
        />
      ))}
    </div>
  )
}
