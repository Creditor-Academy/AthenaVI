import PptCanvasElement from '../pages/Slides/AIPptComponents/PptCanvasElement'
import { EDITOR_STAGE_WIDTH } from '../utils/slideStageElements'
import { resolveSlideStageBackground } from '../utils/presentationHelpers'
import SlideMockFallback from '../pages/Slides/AIPptComponents/SlideMockFallback'
import './exportSlide.css'

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
 * One slide at the editor's stage width (900px), exactly as the editor and Present lay it out,
 * so fit-to-box text shrinks to the same size it has in the editor. Used by the export render
 * page, by slide images made in the browser, and by the export dialog's thumbnails.
 */
export default function ExportSlide({ slide, stage, themeVisual, fontVars, transparent = false }) {
  const palette = themeVisual?.palette || null
  const { canvas, elements } = stage
  const stageHeight = (EDITOR_STAGE_WIDTH * canvas.height) / canvas.width
  const background = transparent ? {} : resolveSlideStageBackground(slide, themeVisual?.inner || '#fff', palette)

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
        // A slide with no elements: the same layout the editor shows.
        <SlideMockFallback slide={slide} themeVisual={themeVisual} />
      )}
    </section>
  )
}
