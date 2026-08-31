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
    transformOrigin: 'center center',
    opacity: opacity != null ? opacity : 1,
    zIndex: layer || 0,
  }
}

function contentBounds(elements, canvasW, canvasH) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const el of elements || []) {
    const p = el.placement || {}
    if (p.opacity === 0) continue
    const x = Number(p.x) || 0
    const y = Number(p.y) || 0
    const w = Number(p.width) || 0
    const h = Number(p.height) || 0
    if (w < 8 && h < 8) continue
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x + w)
    maxY = Math.max(maxY, y + h)
  }
  if (!Number.isFinite(minX)) return { x: 0, y: 0, w: canvasW, h: canvasH }
  const padX = Math.max(32, (maxX - minX) * 0.05)
  const padY = Math.max(32, (maxY - minY) * 0.05)
  const x = Math.max(0, minX - padX)
  const y = Math.max(0, minY - padY)
  return {
    x,
    y,
    w: Math.max(1, Math.min(canvasW - x, maxX + padX - x)),
    h: Math.max(1, Math.min(canvasH - y, maxY + padY - y)),
  }
}

/** Thumbnails shrink 1920px type to ~1px; bump labels so they still paint. */
function boostMinimapElement(el) {
  if (!el || (el.type !== 'text' && el.type !== 'textbox')) return el
  const fs = Number(el.content?.fontSize) || 16
  const k = fs < 20 ? 1.85 : fs < 30 ? 1.45 : 1.15
  const p = el.placement || {}
  return {
    ...el,
    placement: {
      ...p,
      height: Math.round(Math.max(p.height || 36, fs * k * 1.25)),
    },
    content: {
      ...el.content,
      fontSize: Math.round(fs * k),
      lineHeight: 1.15,
    },
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

  const bounds = contentBounds(elements, canvas.width, canvas.height)
  const boundsKey = `${bounds.x},${bounds.y},${bounds.w},${bounds.h},${elements.length}`

  useEffect(() => {
    const node = hostRef.current
    if (!node) return undefined

    const update = () => {
      const width = node.clientWidth || 1
      const height = node.clientHeight || 1
      const scale = Math.min(width / bounds.w, height / bounds.h)
      const scaledW = bounds.w * scale
      const scaledH = bounds.h * scale
      setTransform({
        scale,
        x: (width - scaledW) / 2 - bounds.x * scale,
        y: (height - scaledH) / 2 - bounds.y * scale,
      })
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [canvas.width, canvas.height, boundsKey, bounds.w, bounds.h, bounds.x, bounds.y])

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
            const previewEl = boostMinimapElement(el)
            const p = previewEl.placement || {}
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
                  <PptCanvasElement
                    el={previewEl}
                    palette={palette}
                    editable={false}
                    showEmptyTextHint
                    canvasW={canvas.width}
                  />
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
