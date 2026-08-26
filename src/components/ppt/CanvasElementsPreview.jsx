import { memo, useEffect, useRef, useState } from 'react'
import PptCanvasElement from '../../pages/Slides/AIPptComponents/PptCanvasElement'
import {
  isSlideBackgroundElement,
  resolveCanvasSize,
  resolveSlideStageBackground,
} from '../../utils/presentationHelpers'
import { shouldPaintElement } from '../../utils/canvasRenderDebug'

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

function CanvasElementsPreview({
  slide,
  themeVisual,
  aspectRatio = '16:9',
  fallbackBg = '#ffffff',
  palette = null,
  fill = false,
  className,
  style,
}) {
  const hostRef = useRef(null)
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 })

  const canvas = resolveCanvasSize(slide, aspectRatio)
  const resolvedPalette = palette || themeVisual?.palette || null
  const slideBgStyle = resolveSlideStageBackground(slide, fallbackBg, resolvedPalette)
  const elementsDoc = slide?.elements || {}
  const elements = (elementsDoc.elements || []).filter(
    (el) =>
      !isSlideBackgroundElement(el, slide) &&
      shouldPaintElement(el, slide, canvas.width, canvas.height)
  )

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

  if (!elements.length) return null

  const frameStyle = fill
    ? { width: '100%', height: '100%', aspectRatio: 'unset', minHeight: 0 }
    : { width: '100%', aspectRatio: `${canvas.width}/${canvas.height}` }

  return (
    <div
      ref={hostRef}
      className={className}
      style={{
        ...frameStyle,
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: transform.x,
          top: transform.y,
          width: canvas.width,
          height: canvas.height,
          transform: `scale(${transform.scale})`,
          transformOrigin: 'top left',
          containerType: 'inline-size',
          ...slideBgStyle,
          color: themeVisual?.body,
        }}
      >
        {elements.map((el, i) => {
          const p = el.placement || {}
          const frame = placementFrameStyle(p, canvas.width, canvas.height, {
            layer: el.layer,
            rotation: p.rotation,
            opacity: p.opacity,
          })

          return (
            <div key={el.id || `canvas-el-${i}`} style={frame}>
              <PptCanvasElement
                el={el}
                palette={resolvedPalette}
                editable={false}
                canvasW={canvas.width}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default memo(CanvasElementsPreview)
