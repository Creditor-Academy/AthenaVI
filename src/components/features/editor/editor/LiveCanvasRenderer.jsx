import React, { useRef, useState, useEffect, useCallback } from 'react'
import { MdPerson, MdPhotoSizeSelectActual, MdVideoLibrary, MdDragIndicator, MdOpenWith, MdHeight } from 'react-icons/md'

/**
 * COORDINATE SYSTEM
 * The virtual canvas is always 1920 × 1080 px.
 * All clip position.x / position.y / size.width / size.height are in these pixels.
 * The outer container is measured via ResizeObserver and displayScale = min(W/1920, H/1080).
 * Mouse events are divided by displayScale to convert back to virtual space.
 */

/* ─── Tiny transform-handle dot ─────────────────────────────────────── */
const ResizeHandle = ({ cursor, style, onMouseDown }) => (
  <div
    onMouseDown={onMouseDown}
    style={{
      position: 'absolute',
      width: 12, height: 12,
      background: '#1a73e8',
      border: '2px solid white',
      borderRadius: 3,
      zIndex: 50,
      cursor,
      boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
      ...style,
    }}
  />
)

/* ─── Position/Size Input HUD ──────────────────────────────────────── */
const ClipHUD = ({ clip, onPositionChange, onSizeChange }) => {
  const x = Math.round(clip.position?.x ?? 0)
  const y = Math.round(clip.position?.y ?? 0)
  const w = Math.round(clip.size?.width ?? 200)
  const h = Math.round(clip.size?.height ?? 120)

  const numInput = (label, value, onChange) => (
    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: 56, height: 24,
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 5,
          color: '#fff',
          fontSize: 11,
          fontWeight: 600,
          textAlign: 'center',
          outline: 'none',
          padding: '0 4px',
        }}
      />
    </label>
  )

  return (
    <div
      style={{
        position: 'absolute',
        top: -50,
        left: 0,
        display: 'flex',
        alignItems: 'flex-end',
        gap: 6,
        background: 'rgba(15,15,25,0.82)',
        backdropFilter: 'blur(12px)',
        borderRadius: 8,
        padding: '6px 10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.1)',
        zIndex: 60,
        whiteSpace: 'nowrap',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {numInput('X', x, (v) => onPositionChange(v, y))}
      {numInput('Y', y, (v) => onPositionChange(x, v))}
      <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,0.15)', margin: '0 2px' }} />
      {numInput('W', w, (v) => onSizeChange(v, h))}
      {numInput('H', h, (v) => onSizeChange(w, v))}
    </div>
  )
}

/* ─── Selection overlay (handles + HUD) drawn around every selected clip ─ */
const SelectionOverlay = ({ clip, displayScale, onUpdatePosition, onUpdateSize }) => {
  const dragRef = useRef(null)

  const startDrag = useCallback((e) => {
    e.stopPropagation()
    const startX = e.clientX
    const startY = e.clientY
    const origX = clip.position?.x ?? 0
    const origY = clip.position?.y ?? 0

    const onMove = (mv) => {
      const dx = (mv.clientX - startX) / displayScale
      const dy = (mv.clientY - startY) / displayScale
      onUpdatePosition(Math.round(origX + dx), Math.round(origY + dy))
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [clip, displayScale, onUpdatePosition])

  const startResize = useCallback((corner, e) => {
    e.stopPropagation()
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    const origW = clip.size?.width ?? 200
    const origH = clip.size?.height ?? 120
    const origX = clip.position?.x ?? 0
    const origY = clip.position?.y ?? 0

    const onMove = (mv) => {
      const dx = (mv.clientX - startX) / displayScale
      const dy = (mv.clientY - startY) / displayScale
      let newW = origW, newH = origH, newX = origX, newY = origY

      if (corner.includes('right'))  newW = Math.max(40, origW + dx)
      if (corner.includes('left'))   { newW = Math.max(40, origW - dx); newX = origX + (origW - newW) }
      if (corner.includes('bottom')) newH = Math.max(24, origH + dy)
      if (corner.includes('top'))    { newH = Math.max(24, origH - dy); newY = origY + (origH - newH) }

      onUpdateSize(Math.round(newW), Math.round(newH))
      if (corner.includes('left') || corner.includes('top')) {
        onUpdatePosition(Math.round(newX), Math.round(newY))
      }
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [clip, displayScale, onUpdatePosition, onUpdateSize])

  return (
    <>
      {/* Drag-to-move overlay (fill the element) */}
      <div
        ref={dragRef}
        onMouseDown={startDrag}
        style={{
          position: 'absolute', inset: 0,
          cursor: 'move',
          zIndex: 40,
        }}
      />
      {/* HUD above the element */}
      <ClipHUD
        clip={clip}
        onPositionChange={(x, y) => onUpdatePosition(x, y)}
        onSizeChange={(w, h) => onUpdateSize(w, h)}
      />
      {/* Corner handles */}
      <ResizeHandle cursor="nw-resize" style={{ top: -6, left: -6 }}   onMouseDown={(e) => startResize('top-left', e)} />
      <ResizeHandle cursor="ne-resize" style={{ top: -6, right: -6 }}  onMouseDown={(e) => startResize('top-right', e)} />
      <ResizeHandle cursor="sw-resize" style={{ bottom: -6, left: -6 }} onMouseDown={(e) => startResize('bottom-left', e)} />
      <ResizeHandle cursor="se-resize" style={{ bottom: -6, right: -6 }} onMouseDown={(e) => startResize('bottom-right', e)} />
      {/* Edge handles */}
      <ResizeHandle cursor="n-resize" style={{ top: -6, left: 'calc(50% - 6px)' }}   onMouseDown={(e) => startResize('top', e)} />
      <ResizeHandle cursor="s-resize" style={{ bottom: -6, left: 'calc(50% - 6px)' }} onMouseDown={(e) => startResize('bottom', e)} />
      <ResizeHandle cursor="w-resize" style={{ left: -6, top: 'calc(50% - 6px)' }}   onMouseDown={(e) => startResize('left', e)} />
      <ResizeHandle cursor="e-resize" style={{ right: -6, top: 'calc(50% - 6px)' }}  onMouseDown={(e) => startResize('right', e)} />
    </>
  )
}

/* ─── Clip wrappers ──────────────────────────────────────────────────── */

const clipBase = (clip, isSelected) => ({
  position: 'absolute',
  left: clip.position?.x ?? 0,
  top: clip.position?.y ?? 0,
  width: typeof clip.size?.width === 'number' ? clip.size.width : (clip.size?.width || 'auto'),
  height: typeof clip.size?.height === 'number' ? clip.size.height : (clip.size?.height || 'auto'),
  // Background clips sit behind all content; selected ones still get a faint outline
  zIndex: clip.isBackground ? (isSelected ? 2 : 0) : (isSelected ? 20 : 5),
  outline: isSelected
    ? (clip.isBackground ? '2px dashed rgba(26,115,232,0.6)' : '2px solid #1a73e8')
    : '2px solid transparent',
  outlineOffset: isSelected && clip.isBackground ? -2 : 1,
  boxSizing: 'border-box',
  cursor: isSelected ? (clip.isBackground ? 'default' : 'move') : 'pointer',
  transition: 'outline 0.1s',
})

const TextClip = ({ clip, isSelected, onSelect, onContentChange, displayScale, onUpdatePosition, onUpdateSize }) => {
  const divRef = useRef(null)
  const s = clip.style || {}

  const handleBlur = () => {
    if (divRef.current && onContentChange) {
      onContentChange(clip.id, divRef.current.innerText)
    }
  }

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(clip.id) }}
      style={{
        ...clipBase(clip, isSelected),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: s.textAlign === 'left' ? 'flex-start' : (s.textAlign === 'right' ? 'flex-end' : 'center'),
        borderRadius: 4,
        overflow: 'hidden',
        userSelect: isSelected ? 'text' : 'none',
      }}
    >
      {isSelected && (
        <SelectionOverlay
          clip={clip}
          displayScale={displayScale}
          onUpdatePosition={(x, y) => onUpdatePosition(clip.id, x, y)}
          onUpdateSize={(w, h) => onUpdateSize(clip.id, w, h)}
        />
      )}
      <div
        ref={divRef}
        contentEditable={isSelected && clip.editable !== false}
        suppressContentEditableWarning
        onBlur={handleBlur}
        onClick={(e) => isSelected && e.stopPropagation()}
        style={{
          fontSize: s.fontSize || 24,
          fontWeight: s.fontWeight || '700',
          color: s.color || '#1a1b1c',
          textAlign: s.textAlign || 'left',
          textTransform: s.textTransform || 'none',
          lineHeight: s.lineHeight || 1.2,
          letterSpacing: s.letterSpacing || 'normal',
          background: s.backgroundColor || 'transparent',
          padding: s.padding || '0px',
          borderRadius: s.borderRadius || '0px',
          boxShadow: s.boxShadow || 'none',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          outline: 'none',
          cursor: isSelected ? 'text' : 'pointer',
          width: '100%',
          maxWidth: '100%',
          fontFamily: s.fontFamily || 'Inter, system-ui, sans-serif',
          margin: 0,
          position: 'relative',
          zIndex: 1,
          pointerEvents: isSelected ? 'auto' : 'none',
        }}
      >
        {typeof clip.content === 'object' ? (clip.content.name || JSON.stringify(clip.content)) : clip.content}
      </div>
    </div>
  )
}

const buildCssFilter = (cf = {}) => {
  if (!cf || Object.keys(cf).length === 0) return undefined
  const parts = []
  if (cf.brightness  != null && cf.brightness  !== 1)   parts.push(`brightness(${cf.brightness})`)
  if (cf.contrast    != null && cf.contrast    !== 1)   parts.push(`contrast(${cf.contrast})`)
  if (cf.saturate    != null && cf.saturate    !== 1)   parts.push(`saturate(${cf.saturate})`)
  if (cf.blur        != null && cf.blur        !== 0)   parts.push(`blur(${cf.blur}px)`)
  if (cf.hueRotate   != null && cf.hueRotate   !== 0)   parts.push(`hue-rotate(${cf.hueRotate}deg)`)
  if (cf.sepia       != null && cf.sepia       !== 0)   parts.push(`sepia(${cf.sepia})`)
  if (cf.invert      != null && cf.invert      !== 0)   parts.push(`invert(${cf.invert})`)
  if (cf.grayscale   != null && cf.grayscale   !== 0)   parts.push(`grayscale(${cf.grayscale})`)
  return parts.length > 0 ? parts.join(' ') : undefined
}

const ImageClip = ({ clip, isSelected, onSelect, displayScale, onUpdatePosition, onUpdateSize }) => {
  const s   = clip.style || {}
  const cf  = clip.cssFilters || {}
  const flipX = s.scaleX === -1 ? -1 : 1
  const flipY = s.scaleY === -1 ? -1 : 1
  const flipTransform = (flipX !== 1 || flipY !== 1) ? `scale(${flipX}, ${flipY})` : undefined
  const cssFilter = buildCssFilter(cf)

  // Border: handle borderWidth/borderColor from panel OR legacy border string
  const borderStyle = s.borderWidth
    ? `${s.borderWidth} ${s.borderStyle || 'solid'} ${s.borderColor || '#000'}`
    : (s.border || 'none')

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(clip.id) }}
      style={{
        ...clipBase(clip, isSelected),
        overflow: 'hidden',
        borderRadius: s.borderRadius || '12px',
        border: borderStyle,
        boxShadow: s.boxShadow || 'none',
        background: clip.src ? 'transparent' : (s.backgroundColor || s.background || 'rgba(0,0,0,0.04)'),
        opacity: clip.opacity ?? 1,
        filter: cssFilter,
        transform: flipTransform ? `${flipTransform}` : undefined,
      }}
    >
      {isSelected && (
        <SelectionOverlay
          clip={clip}
          displayScale={displayScale}
          onUpdatePosition={(x, y) => onUpdatePosition(clip.id, x, y)}
          onUpdateSize={(w, h) => onUpdateSize(clip.id, w, h)}
        />
      )}
      {clip.src ? (
        <img
          src={clip.src}
          alt=""
          style={{
            width: '100%', height: '100%',
            objectFit: s.objectFit || 'cover',
            display: 'block',
            pointerEvents: 'none',
          }}
        />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.08) 100%)' }}>
          <MdPhotoSizeSelectActual size={32} style={{ color: 'rgba(99,102,241,0.4)', pointerEvents: 'none' }} />
          <span style={{ fontSize: 11, color: 'rgba(99,102,241,0.5)', fontWeight: 700, letterSpacing: '0.05em', pointerEvents: 'none' }}>ADD IMAGE</span>
        </div>
      )}
    </div>
  )
}

const AvatarClip = ({ clip, isSelected, onSelect, scene, displayScale, onUpdatePosition, onUpdateSize }) => {
  const isGeneratedAvatar = (clip.type === 'avatar' || clip.role === 'avatar') && scene?.generatedVideoUrl
  const src = isGeneratedAvatar ? scene.generatedVideoUrl : clip.src
  const isVideo = clip.type === 'video' || isGeneratedAvatar
  const s  = clip.style || {}
  const cf = clip.cssFilters || {}
  const cssFilter = buildCssFilter(cf)
  const flipX = s.scaleX === -1 ? -1 : 1
  const flipY = s.scaleY === -1 ? -1 : 1
  const flipTransform = (flipX !== 1 || flipY !== 1) ? `scale(${flipX}, ${flipY})` : undefined
  const borderStyle = s.borderWidth
    ? `${s.borderWidth} ${s.borderStyle || 'solid'} ${s.borderColor || '#7c3aed'}`
    : (s.border || 'none')

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(clip.id) }}
      style={{
        ...clipBase(clip, isSelected),
        borderRadius: s.borderRadius || '50%',
        border: borderStyle,
        boxShadow: s.boxShadow || 'none',
        overflow: 'hidden',
        background: src ? 'transparent' : (s.backgroundColor || s.background || 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)'),
        opacity: clip.opacity ?? 1,
        filter: cssFilter,
        transform: flipTransform,
      }}
    >
      {isSelected && (
        <SelectionOverlay
          clip={clip}
          displayScale={displayScale}
          onUpdatePosition={(x, y) => onUpdatePosition(clip.id, x, y)}
          onUpdateSize={(w, h) => onUpdateSize(clip.id, w, h)}
        />
      )}
      {src ? (
        isVideo ? (
          <video src={src} style={{ width: '100%', height: '100%', objectFit: s.objectFit || 'cover', display: 'block', pointerEvents: 'none' }} muted autoPlay loop playsInline />
        ) : (
          <img src={src} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: s.objectFit || 'contain', display: 'block', pointerEvents: 'none' }} />
        )
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MdPerson size={Math.min(48, (clip.size?.width || 120) / 2.5)} style={{ color: 'rgba(255,255,255,0.8)', pointerEvents: 'none' }} />
        </div>
      )}
    </div>
  )
}

const VideoClip = ({ clip, isSelected, onSelect, scene, displayScale, onUpdatePosition, onUpdateSize }) => {
  const isGeneratedAvatar = (clip.type === 'avatar' || clip.role === 'avatar') && scene?.generatedVideoUrl
  const src = isGeneratedAvatar ? scene.generatedVideoUrl : clip.src
  const isVideo = clip.type === 'video' || isGeneratedAvatar
  const s  = clip.style || {}
  const cf = clip.cssFilters || {}
  const cssFilter = buildCssFilter(cf)
  const flipX = s.scaleX === -1 ? -1 : 1
  const flipY = s.scaleY === -1 ? -1 : 1
  const flipTransform = (flipX !== 1 || flipY !== 1) ? `scale(${flipX}, ${flipY})` : undefined
  const borderStyle = s.borderWidth
    ? `${s.borderWidth} ${s.borderStyle || 'solid'} ${s.borderColor || '#000'}`
    : (s.border || 'none')
  const fitMode = s.objectFit || (clip.role === 'avatar' ? 'contain' : 'cover')

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(clip.id) }}
      style={{
        ...clipBase(clip, isSelected),
        overflow: 'hidden',
        borderRadius: s.borderRadius || (clip.role === 'avatar' ? '50%' : '16px'),
        border: borderStyle,
        boxShadow: s.boxShadow || 'none',
        background: src ? 'transparent' : (s.backgroundColor || s.background || 'rgba(0,0,0,0.04)'),
        opacity: clip.opacity ?? 1,
        filter: cssFilter,
        transform: flipTransform,
      }}
    >
      {isSelected && (
        <SelectionOverlay
          clip={clip}
          displayScale={displayScale}
          onUpdatePosition={(x, y) => onUpdatePosition(clip.id, x, y)}
          onUpdateSize={(w, h) => onUpdateSize(clip.id, w, h)}
        />
      )}
      {src ? (
        isVideo ? (
          <video src={src} style={{ width: '100%', height: '100%', objectFit: fitMode, display: 'block', pointerEvents: 'none' }} muted autoPlay loop playsInline />
        ) : (
          <img src={src} style={{ width: '100%', height: '100%', objectFit: fitMode, display: 'block', pointerEvents: 'none' }} alt="" />
        )
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.08) 100%)' }}>
          <MdVideoLibrary size={32} style={{ color: 'rgba(99,102,241,0.4)', pointerEvents: 'none' }} />
          <span style={{ fontSize: 11, color: 'rgba(99,102,241,0.5)', fontWeight: 700, letterSpacing: '0.05em', pointerEvents: 'none' }}>ADD VIDEO</span>
        </div>
      )}
    </div>
  )
}

const ShapeClip = ({ clip, isSelected, onSelect, displayScale, onUpdatePosition, onUpdateSize }) => (
  <div
    onClick={(e) => { e.stopPropagation(); onSelect(clip.id) }}
    style={{
      ...clipBase(clip, isSelected),
      background: clip.style?.backgroundColor || clip.style?.background || 'rgba(0,0,0,0.06)',
      borderRadius: clip.style?.borderRadius || '0',
      border: clip.style?.border || 'none',
      boxShadow: clip.style?.boxShadow || 'none',
    }}
  >
    {isSelected && (
      <SelectionOverlay
        clip={clip}
        displayScale={displayScale}
        onUpdatePosition={(x, y) => onUpdatePosition(clip.id, x, y)}
        onUpdateSize={(w, h) => onUpdateSize(clip.id, w, h)}
      />
    )}
  </div>
)

/* ─── Main Renderer ──────────────────────────────────────────────────── */
const LiveCanvasRenderer = ({
  scene,
  selectedId,
  onSelectClip,
  onContentChange,
  onDeselect,
  onUpdateLayerPosition,
  onUpdateLayerSize,
}) => {
  const containerRef = useRef(null)
  const [displayScale, setDisplayScale] = useState(1)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setDisplayScale(Math.min(width / 1920, height / 1080))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const clips = scene?.clips || []

  const bg = scene?.background?.value
  const bgImage = scene?.backgroundImage

  const backgroundStyle = {
    background: bg || '#f8fafc',
    backgroundImage: bg
      ? 'none'
      : bgImage
        ? `url(${bgImage})`
        : 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px)',
    backgroundSize: bgImage ? 'cover' : '28px 28px',
    backgroundPosition: 'center',
  }

  const handleUpdatePosition = useCallback((clipId, x, y) => {
    if (onUpdateLayerPosition) onUpdateLayerPosition(clipId, x, y)
  }, [onUpdateLayerPosition])

  const handleUpdateSize = useCallback((clipId, w, h) => {
    if (onUpdateLayerSize) onUpdateLayerSize(clipId, w, h)
  }, [onUpdateLayerSize])

  return (
    <div
      ref={containerRef}
      onClick={() => onDeselect && onDeselect()}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
        boxSizing: 'border-box',
        ...backgroundStyle,
      }}
    >
      {/* Fixed 1920×1080 virtual canvas, scaled to fit */}
      <div
        style={{
          width: 1920,
          height: 1080,
          position: 'absolute',
          top: 0,
          left: 0,
          transform: `scale(${displayScale})`,
          transformOrigin: 'top left',
        }}
      >
        {/* Sort: background clips first so they appear behind content clips */}
        {[...clips].sort((a, b) => (a.isBackground ? -1 : 0) - (b.isBackground ? -1 : 0)).map(clip => {
          const isSelected = selectedId === clip.id
          const sharedProps = {
            key: clip.id,
            clip,
            isSelected,
            onSelect: onSelectClip,
            displayScale,
            // Background clips cannot be dragged/resized (they fill the whole canvas)
            onUpdatePosition: clip.isBackground ? () => {} : handleUpdatePosition,
            onUpdateSize:     clip.isBackground ? () => {} : handleUpdateSize,
          }

          if (clip.type === 'text')   return <TextClip   {...sharedProps} onContentChange={onContentChange} />
          if (clip.type === 'image')  return <ImageClip  {...sharedProps} />
          if (clip.type === 'avatar') return <AvatarClip {...sharedProps} scene={scene} />
          if (clip.type === 'video')  return <VideoClip  {...sharedProps} scene={scene} />
          if (clip.type === 'shape')  return <ShapeClip  {...sharedProps} />
          return null
        })}
      </div>

      {/* Empty state */}
      {clips.length === 0 && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 12, color: '#94a3b8',
          pointerEvents: 'none',
        }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, border: '2px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MdPhotoSizeSelectActual size={36} style={{ color: '#cbd5e1' }} />
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Add a layout to begin</p>
          <p style={{ fontSize: 12, margin: 0, color: '#94a3b8' }}>Click the Layout button in the sidebar</p>
        </div>
      )}
    </div>
  )
}

export default LiveCanvasRenderer
