import { useEffect, useMemo, useRef, useState } from 'react'
import PptCanvasElement from '../Slides/AIPptComponents/PptCanvasElement'
import {
  DEFAULT_SLIDE_BG,
  getSlideImage,
  isSlideBackgroundElement,
  resolveCanvasSize,
  resolveSlideStageBackground,
  toApiThemeId,
  buildWizardThemeTokens,
} from '../../utils/presentationHelpers'
import { shouldPaintElement } from '../../utils/canvasRenderDebug'
import { THEMES } from '../../constants/pptWizardThemes'
import { coercePlainText } from '../../utils/pptTextContent'

export function resolvePreviewThemeVisual(themeTokens, themeId) {
  const palette = themeTokens?.palette
  if (palette?.bg || palette?.primary || palette?.text) {
    const bg = palette.bg || palette.surface || DEFAULT_SLIDE_BG
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
  const bg = fallback.background || fallbackPalette?.bg || DEFAULT_SLIDE_BG
  return {
    ...fallback,
    themeId: fallback.id,
    background: bg,
    palette: fallbackPalette,
  }
}

function placementFrameStyle(p, canvasW, canvasH, { layer = 0, rotation = 0, opacity = 1 } = {}) {
  return {
    position: 'absolute',
    left: `${((p.x || 0) / canvasW) * 100}%`,
    top: `${((p.y || 0) / canvasH) * 100}%`,
    width: `${((p.width || 100) / canvasW) * 100}%`,
    height: `${((p.height || 40) / canvasH) * 100}%`,
    transform: rotation ? `rotate(${rotation}deg)` : undefined,
    transformOrigin: 'center center',
    opacity: opacity != null ? opacity : 1,
    zIndex: layer || 0,
  }
}

/**
 * Read-only slide stage: same elements as the editor, scaled as one plane
 * (transform: scale from canvas.width) — never per-element.
 */
export default function DeckLiveSlideStage({
  slide,
  themeVisual,
  aspectRatio = '16:9',
  className = '',
  stageRef = null,
  onRendered = null,
}) {
  const hostRef = useRef(null)
  const [scale, setScale] = useState(0.2)

  const canvas = useMemo(
    () => resolveCanvasSize(slide, aspectRatio),
    [slide, aspectRatio]
  )
  const palette = themeVisual?.palette || null
  const slideBgStyle = resolveSlideStageBackground(
    slide,
    themeVisual?.background || themeVisual?.palette?.bg || DEFAULT_SLIDE_BG,
    palette
  )
  const elements = (slide?.elements?.elements || []).filter(
    (el) =>
      !isSlideBackgroundElement(el, slide) &&
      shouldPaintElement(el, slide, canvas.width, canvas.height)
  )
  const hasElements = elements.length > 0
  const fallbackImage = hasElements ? null : getSlideImage(slide).url

  useEffect(() => {
    const node = hostRef.current
    if (!node) return undefined
    const update = () => {
      const width = node.clientWidth || 1
      setScale(width / Math.max(1, canvas.width))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(node)
    return () => ro.disconnect()
  }, [canvas.width])

  useEffect(() => {
    if (!onRendered) return undefined
    let cancelled = false
    const notify = () => {
      if (!cancelled) onRendered()
    }
    // Allow images/fonts a brief beat after mount before cover capture.
    const t = window.setTimeout(notify, 320)
    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
  }, [onRendered, slide?.id])

  const setRefs = (node) => {
    hostRef.current = node
    if (typeof stageRef === 'function') stageRef(node)
    else if (stageRef) stageRef.current = node
  }

  return (
    <div
      ref={setRefs}
      className={`deck-live-slide-host ${className}`.trim()}
      style={{
        width: '100%',
        aspectRatio: `${canvas.width} / ${canvas.height}`,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        className="deck-live-slide-stage"
        style={{
          width: canvas.width,
          height: canvas.height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          pointerEvents: 'none',
          ...slideBgStyle,
          color: themeVisual?.body,
          position: 'relative',
        }}
      >
        {hasElements ? (
          elements.map((el, i) => {
            const p = el.placement || {}
            return (
              <div
                key={el.id || `deck-live-el-${i}`}
                style={placementFrameStyle(p, canvas.width, canvas.height, {
                  layer: el.layer,
                  rotation: p.rotation,
                  opacity: p.opacity,
                })}
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
          })
        ) : (
          <div className="aig-slide-mock" style={{ width: '100%', height: '100%' }}>
            <h1 className="aig-slide-mock-title" style={{ color: themeVisual?.title }}>
              {coercePlainText(slide?.title || slide?.content?.title)}
            </h1>
            {Array.isArray(slide?.description) && slide.description.length ? (
              <div className="aig-slide-mock-text" style={{ color: themeVisual?.body }}>
                <ul style={{ paddingLeft: 32, margin: 0 }}>
                  {slide.description.map((pt, i) => (
                    <li key={i} style={{ marginBottom: 12 }}>
                      {coercePlainText(pt)}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {fallbackImage ? (
              <div className="aig-slide-mock-visual">
                <img src={fallbackImage} alt="" className="aig-slide-mock-image" />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
