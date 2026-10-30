import PptCanvasElement from '../Slides/AIPptComponents/PptCanvasElement'
import { resolveFillCss } from '../../utils/presentationHelpers'
import { contentUsesInnerClipOrMask, overflowPaintStyle } from '../../utils/canvasOverflowUtils'

const PALETTE = {
  bg: '#FFFFFF',
  surface: '#F5F7FA',
  text: '#172033',
  title: '#172033',
  accent: '#2563EB',
}

function pageFill(page, transparent) {
  if (transparent) {
    return { backgroundColor: 'transparent', backgroundImage: 'none' }
  }
  const bg = page?.background
  const fillCss = bg && typeof bg === 'object' ? resolveFillCss(bg, PALETTE) : bg || '#FFFFFF'
  const isGradient = typeof fillCss === 'string' && fillCss.includes('gradient(')
  return {
    backgroundColor: isGradient ? 'transparent' : fillCss,
    backgroundImage: page?.backgroundImage
      ? isGradient
        ? `url(${page.backgroundImage}), ${fillCss}`
        : `url(${page.backgroundImage})`
      : isGradient
        ? fillCss
        : undefined,
    backgroundSize: page?.backgroundImageFit || 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }
}

function elementFrameStyle(element, page) {
  const placement = element.placement || {}
  const width = page.width || 1
  const height = page.height || 1
  const rotation = Number(placement.rotation) || 0
  return {
    position: 'absolute',
    left: `${((placement.x || 0) / width) * 100}%`,
    top: `${((placement.y || 0) / height) * 100}%`,
    width: `${((placement.width || 100) / width) * 100}%`,
    height: `${((placement.height || 40) / height) * 100}%`,
    transform: rotation ? `rotate(${rotation}deg)` : undefined,
    transformOrigin: 'center center',
    opacity: placement.opacity != null ? placement.opacity : 1,
    zIndex: element.layer || 0,
    pointerEvents: 'none',
    ...overflowPaintStyle({
      x: placement.x,
      y: placement.y,
      width: placement.width,
      height: placement.height,
      rotation: placement.rotation,
      canvasW: width,
      canvasH: height,
      selected: false,
      editing: false,
      skipOverflowMask: contentUsesInnerClipOrMask(element.content),
    }),
  }
}

/**
 * One page, off the live stage: no selection, guides, or grid.
 * html-to-image needs the node in the document, so it sits off-screen.
 */
export default function CanvasExportFrame({ page, transparent = false, frameRef }) {
  if (!page) return null
  const width = page.width || 1080
  const height = page.height || 1080
  const elements = [...(page.elements || [])].sort((a, b) => (a.layer || 0) - (b.layer || 0))

  return (
    <div
      className="canvas-export-frame"
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: -100000,
        top: 0,
        width,
        height,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <div
        ref={frameRef}
        style={{
          position: 'relative',
          width,
          height,
          overflow: 'hidden',
          ...pageFill(page, transparent),
        }}
      >
        {elements.map((element) => (
          <div key={element.id} style={elementFrameStyle(element, page)}>
            <PptCanvasElement
              el={element}
              palette={PALETTE}
              canvasW={width}
              selected={false}
              editable={false}
              editingText={false}
              showEmptyTextHint={false}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
