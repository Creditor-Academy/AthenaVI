import { useEffect, useRef, useState } from 'react'
import { getEmbedIframeUrl } from '../PptChartRenderer'
import ExternalLinkHoverLayer from '../ExternalLinkHoverLayer'
import PptCanvasElement from '../PptCanvasElement'
import { EDITOR_STAGE_WIDTH } from '../../../../utils/slideStageElements'

/**
 * One element of the slide, drawn by the editor's own renderer (PptCanvasElement) inside the
 * same %-positioned frame the editor uses, so the presented slide matches the edited one.
 */
function PresentElement({ el, palette, canvasW, canvasH, spotlit, dimmed, selectable, onSelect }) {
  // Only wired once spotlight is already on — lets the presenter jump straight to another block.
  const canSelect = selectable && el.type !== 'embed' && el.type !== 'link'
  const interactive = canSelect
    ? {
        className: 'ppt-present-el-hit',
        onClick: (e) => {
          e.stopPropagation()
          onSelect?.(el.id)
        },
      }
    : {}

  const p = el.placement || {}
  const rotation = Number(p.rotation) || 0
  const transformParts = [rotation ? `rotate(${rotation}deg)` : '', spotlit ? 'scale(1.06)' : ''].filter(Boolean)
  const baseOpacity = p.opacity != null ? p.opacity : 1
  const style = {
    position: 'absolute',
    left: `${((p.x || 0) / canvasW) * 100}%`,
    top: `${((p.y || 0) / canvasH) * 100}%`,
    width: `${((p.width || 100) / canvasW) * 100}%`,
    height: `${((p.height || 40) / canvasH) * 100}%`,
    opacity: dimmed ? baseOpacity * 0.18 : baseOpacity,
    zIndex: spotlit ? 500 : el.layer || 0,
    transform: transformParts.length ? transformParts.join(' ') : undefined,
    transformOrigin: 'center center',
    transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease, filter 0.3s ease',
    filter: dimmed ? 'saturate(0.7) blur(0.3px)' : undefined,
    outline: spotlit ? '2px solid #60a5fa' : undefined,
    outlineOffset: spotlit ? 6 : undefined,
    boxShadow: spotlit ? '0 12px 40px rgba(0,0,0,0.35)' : undefined,
    borderRadius: spotlit ? 6 : undefined,
  }

  // Embeds play in a slideshow (the editor only shows a card for them).
  if (el.type === 'embed' || el.type === 'link') {
    const c = el.content || {}
    const iframeUrl = getEmbedIframeUrl(c)
    if (iframeUrl) {
      return (
        <ExternalLinkHoverLayer content={c} style={style}>
          <iframe
            src={iframeUrl}
            title={c.title || 'Embed'}
            style={{ width: '100%', height: '100%', border: 'none', borderRadius: c.borderRadius ?? 8 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </ExternalLinkHoverLayer>
      )
    }
  }

  return (
    <div {...interactive} style={style}>
      <PptCanvasElement
        el={el}
        palette={palette}
        editable={false}
        showEmptyTextHint={false}
        canvasW={canvasW}
        followLinks
      />
    </div>
  )
}

/**
 * Lays the slide out at the editor's stage width and scales it to the slide box as one piece,
 * so every font, padding and position keeps exactly the proportions it has in the editor.
 */
function ScaledPlane({ canvas, planeStyle, children }) {
  const hostRef = useRef(null)
  const [scale, setScale] = useState(0)
  const stageHeight = (EDITOR_STAGE_WIDTH * canvas.height) / canvas.width

  useEffect(() => {
    const node = hostRef.current
    if (!node) return undefined
    const update = () => {
      const width = node.clientWidth || 0
      const height = node.clientHeight || 0
      if (!width || !height) return
      setScale(Math.min(width / EDITOR_STAGE_WIDTH, height / stageHeight))
    }
    update()
    // Browsers without ResizeObserver (older Safari) still follow window resizes.
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update)
      return () => window.removeEventListener('resize', update)
    }
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [stageHeight])

  return (
    <div ref={hostRef} className="ppt-present-stage-host">
      <div
        className="ppt-present-stage-plane"
        data-present-stage=""
        style={{
          ...planeStyle,
          width: EDITOR_STAGE_WIDTH,
          height: stageHeight,
          transform: `scale(${scale || 0.0001})`,
          visibility: scale ? 'visible' : 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * One slide, as large as its box allows, letterboxed to the slide's shape (16:9, 4:3…).
 * No buttons and no text of its own: every view of a show (audience, presenter's current and
 * next slide, the slide grid) draws slides with this.
 *
 * @param {object} props
 * @param {object} props.slide
 * @param {number} props.index  the slide's position (data-present-index, for the Present harness)
 * @param {object} props.layout  slideLayout(slide, …) from ./slideLayout
 * @param {{ id: string, reverse: boolean, tick: number }} [props.motion]  transition to play
 * @param {string|null} [props.spotlightId]  the block in spotlight, if any
 * @param {(id: string) => void} [props.onSelectBlock]  click on a block while spotlight is on
 * @param {() => void} [props.onSlideClick]  click on the slide outside any block
 */
export default function SlideshowStage({
  slide,
  index,
  layout,
  themeVisual,
  fontVars,
  motion = null,
  spotlightId = null,
  onSelectBlock,
  onSlideClick,
  onTouchStart,
  onTouchEnd,
}) {
  const { canvas, palette, elements, showFallback, fallbackImage, background } = layout
  const transitionClass =
    motion && motion.tick > 0 && motion.id !== 'none'
      ? `ppt-present-stage--${motion.id}${motion.reverse ? ' is-reverse' : ''}`
      : ''
  const planeStyle = { ...fontVars, color: themeVisual?.body }

  return (
    <div
      // A new key restarts the transition. It also rebuilds the slide (one blank frame): Phase 3.
      key={motion?.tick ?? 0}
      className={`ppt-present-stage ${transitionClass} ${spotlightId ? 'is-spotlit' : ''}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="ppt-present-slide"
        data-present-slide=""
        data-present-index={index}
        style={{
          ...background,
          aspectRatio: `${canvas.width} / ${canvas.height}`,
          '--ppt-present-ratio': canvas.width / canvas.height,
        }}
        onClick={onSlideClick}
      >
        {elements.length ? (
          <ScaledPlane canvas={canvas} planeStyle={planeStyle}>
            {elements.map((el) => (
              <PresentElement
                key={el.id}
                el={el}
                palette={palette}
                canvasW={canvas.width}
                canvasH={canvas.height}
                spotlit={spotlightId === el.id}
                dimmed={Boolean(spotlightId) && spotlightId !== el.id}
                selectable={Boolean(spotlightId)}
                onSelect={onSelectBlock}
              />
            ))}
          </ScaledPlane>
        ) : showFallback ? (
          <div className="ppt-present-fallback">
            <h1 style={{ color: themeVisual?.title }}>{slide?.title}</h1>
            {fallbackImage && <img src={fallbackImage} alt="" />}
          </div>
        ) : (
          <ScaledPlane canvas={canvas} planeStyle={planeStyle} />
        )}
      </div>
    </div>
  )
}
