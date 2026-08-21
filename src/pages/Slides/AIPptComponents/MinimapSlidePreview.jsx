import { memo, useEffect, useRef, useState } from 'react'
import PackSlidePreview from '../../../components/ppt/PackSlidePreview'
import PptCanvasElement from './PptCanvasElement'
import { resolveLayoutSchemaById } from '../../../utils/deckLayoutRegistry'
import {
  getSlideImage,
  isSlideBackgroundElement,
  resolveCanvasSize,
  resolveSlideStageBackground,
} from '../../../utils/presentationHelpers'
import { shouldPaintElement } from '../../../utils/canvasRenderDebug'

function placementFrameStyle(p, canvasW, canvasH, { layer = 0, rotation = 0, opacity = 1 } = {}) {
  return {
    position: 'absolute',
    left: `${((p.x || 0) / canvasW) * 100}%`,
    top: `${((p.y || 0) / canvasH) * 100}%`,
    width: `${((p.width || 100) / canvasW) * 100}%`,
    height: `${((p.height || 40) / canvasH) * 100}%`,
    transform: rotation ? `rotate(${rotation}deg)` : undefined,
    opacity: opacity != null ? opacity : 1,
    zIndex: layer || 0,
  }
}

function MinimapSlidePreview({
  slide,
  themeVisual,
  themeId,
  aspectRatio = '16:9',
  fallbackBg = '#ffffff',
  layoutSchemaMap = {},
}) {
  const hostRef = useRef(null)
  const [transform, setTransform] = useState({ scale: 0.08, x: 0, y: 0 })

  const canvas = resolveCanvasSize(slide, aspectRatio)
  const slideBgStyle = resolveSlideStageBackground(slide, fallbackBg, themeVisual?.palette)
  const elements = (slide?.elements?.elements || []).filter(
    (el) =>
      !isSlideBackgroundElement(el, slide) &&
      shouldPaintElement(el, slide, canvas.width, canvas.height)
  )
  const hasElements = elements.length > 0
  const layoutId = slide?.layoutId || slide?.layout_id || null
  const layoutSchema = layoutId ? resolveLayoutSchemaById(layoutId, layoutSchemaMap) : null
  const fallbackImage = hasElements ? null : getSlideImage(slide).url
  const palette = themeVisual?.palette || null

  useEffect(() => {
    const node = hostRef.current
    if (!node) return undefined

    const update = () => {
      const width = node.clientWidth || 1
      const height = node.clientHeight || 1
      const scale = Math.min(width / canvas.width, height / canvas.height)
      const scaledW = canvas.width * scale
      const scaledH = canvas.height * scale
      setTransform({
        scale,
        x: Math.max(0, (width - scaledW) / 2),
        y: Math.max(0, (height - scaledH) / 2),
      })
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [canvas.width, canvas.height])

  if (!hasElements && layoutSchema) {
    return (
      <div ref={hostRef} className="aig-minimap-preview-host">
        <PackSlidePreview
          slide={{
            ...slide,
            layout_id: layoutId,
            content: slide?.content || {},
          }}
          layoutSchema={layoutSchema}
          layoutSchemaMap={layoutSchemaMap}
          themeId={themeId || themeVisual?.themeId || themeVisual?.id}
          aspectRatio={aspectRatio}
          fill
          showBadge={false}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    )
  }

  return (
    <div ref={hostRef} className="aig-minimap-preview-host">
      <div
        className="aig-minimap-preview-stage"
        style={{
          width: canvas.width,
          height: canvas.height,
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          ...slideBgStyle,
          color: themeVisual?.body,
        }}
      >
        {hasElements ? (
          elements.map((el, i) => {
            const p = el.placement || {}
            return (
              <div
                key={el.id || `minimap-el-${i}`}
                className="aig-minimap-preview-el"
                style={placementFrameStyle(p, canvas.width, canvas.height, {
                  layer: el.layer,
                  rotation: p.rotation,
                  opacity: p.opacity,
                })}
              >
                <PptCanvasElement el={el} palette={palette} editable={false} />
              </div>
            )
          })
        ) : (
          <div className="aig-slide-mock aig-minimap-preview-mock">
            <h1 className="aig-slide-mock-title" style={{ color: themeVisual?.title }}>
              {slide?.title || slide?.content?.title || ''}
            </h1>
            <div className="aig-slide-mock-text" style={{ color: themeVisual?.body }}>
              {Array.isArray(slide?.description) ? (
                <ul style={{ paddingLeft: 32, margin: 0 }}>
                  {slide.description.map((pt, i) => (
                    <li key={i} style={{ marginBottom: 12 }}>
                      {pt}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: 0 }}>{slide?.description || slide?.content?.summary || ''}</p>
              )}
            </div>
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

export default memo(MinimapSlidePreview)
