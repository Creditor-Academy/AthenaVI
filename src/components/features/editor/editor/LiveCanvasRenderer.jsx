import React, { useCallback, useRef } from 'react'
import { MdPerson, MdPhotoSizeSelectActual } from 'react-icons/md'

/**
 * COORDINATE SYSTEM
 * Clips use a 1280×720 virtual canvas.
 *   position.x / position.y in range 0–100 → treated as % of canvas
 *   size.width / size.height > 100 → pixels in 1280×720 space → convert to %
 */
const mapX = (val) => (typeof val === 'number' && val > 100 ? (val / 1280) * 100 : val ?? 0)
const mapY = (val) => (typeof val === 'number' && val > 100 ? (val / 720) * 100 : val ?? 0)
const mapW = (val) => typeof val === 'number' ? (val > 100 ? `${(val / 1280) * 100}%` : `${val}%`) : (val || 'auto')
const mapH = (val) => typeof val === 'number' ? (val > 100 ? `${(val / 720) * 100}%` : `${val}%`) : (val || 'auto')

/** Renders a single text clip */
const TextClip = ({ clip, isSelected, onSelect, onContentChange }) => {
  const divRef = useRef(null)

  const handleBlur = () => {
    if (divRef.current && onContentChange) {
      onContentChange(clip.id, divRef.current.innerText)
    }
  }

  const s = clip.style || {}

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(clip.id) }}
      style={{
        position: 'absolute',
        left: `${mapX(clip.position?.x)}%`,
        top: `${mapY(clip.position?.y)}%`,
        width: mapW(clip.size?.width),
        height: mapH(clip.size?.height),
        cursor: 'text',
        outline: isSelected ? '2px solid #1a73e8' : 'none',
        borderRadius: '4px',
        zIndex: isSelected ? 20 : 10,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: s.textAlign === 'left' ? 'flex-start' : (s.textAlign === 'right' ? 'flex-end' : 'center'),
      }}
    >
      {/* Hover/select highlight ring only (no dashed border by default) */}
      {isSelected && (
        <>
          {['top-left','top-right','bottom-left','bottom-right'].map(pos => (
            <div key={pos} style={{
              position: 'absolute',
              width: 10, height: 10,
              background: '#1a73e8',
              border: '2px solid white',
              borderRadius: 2,
              zIndex: 30,
              ...(pos.includes('top') ? { top: -5 } : { bottom: -5 }),
              ...(pos.includes('left') ? { left: -5 } : { right: -5 }),
            }} />
          ))}
        </>
      )}

      {/* Actual editable text */}
      <div
        ref={divRef}
        contentEditable={clip.editable !== false}
        suppressContentEditableWarning
        onBlur={handleBlur}
        style={{
          fontSize: `${(s.fontSize || 24) / 12.8}cqw`,
          fontWeight: s.fontWeight || '700',
          color: s.color || '#1a1b1c',
          textAlign: s.textAlign || 'left',
          textTransform: s.textTransform || 'none',
          lineHeight: s.lineHeight || 1.2,
          letterSpacing: s.letterSpacing || 'normal',
          background: s.backgroundColor || 'transparent',
          padding: s.padding ? s.padding : '0px',
          borderRadius: s.borderRadius ? s.borderRadius : '0px',
          boxShadow: s.boxShadow || 'none',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          outline: 'none',
          cursor: 'text',
          width: '100%',
          maxWidth: '100%',
          fontFamily: s.fontFamily || 'Inter, system-ui, sans-serif',
          margin: 0,
        }}
      >
        {clip.content}
      </div>
    </div>
  )
}

/** Renders a single image clip */
const ImageClip = ({ clip, isSelected, onSelect }) => (
  <div
    onClick={(e) => { e.stopPropagation(); onSelect(clip.id) }}
    style={{
      position: 'absolute',
      left: `${mapX(clip.position?.x)}%`,
      top: `${mapY(clip.position?.y)}%`,
      width: mapW(clip.size?.width),
      height: mapH(clip.size?.height),
      overflow: 'hidden',
      borderRadius: clip.style?.borderRadius || '12px',
      outline: isSelected ? '2px solid #1a73e8' : 'none',
      zIndex: isSelected ? 20 : 8,
      cursor: 'pointer',
      background: clip.src ? 'transparent' : 'rgba(0,0,0,0.04)',
    }}
  >
    {isSelected && (
      <>
        {['top-left','top-right','bottom-left','bottom-right'].map(pos => (
          <div key={pos} style={{
            position: 'absolute',
            width: 10, height: 10,
            background: '#1a73e8',
            border: '2px solid white',
            borderRadius: 2,
            zIndex: 30,
            ...(pos.includes('top') ? { top: -5 } : { bottom: -5 }),
            ...(pos.includes('left') ? { left: -5 } : { right: -5 }),
          }} />
        ))}
      </>
    )}
    {clip.src ? (
      <img
        src={clip.src}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    ) : (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 8,
        background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.08) 100%)',
      }}>
        <MdPhotoSizeSelectActual size={32} style={{ color: 'rgba(99,102,241,0.4)' }} />
        <span style={{ fontSize: 11, color: 'rgba(99,102,241,0.5)', fontWeight: 700, letterSpacing: '0.05em' }}>
          ADD IMAGE
        </span>
      </div>
    )}
  </div>
)

/** Renders a single avatar clip */
const AvatarClip = ({ clip, isSelected, onSelect }) => (
  <div
    onClick={(e) => { e.stopPropagation(); onSelect(clip.id) }}
    style={{
      position: 'absolute',
      left: `${mapX(clip.position?.x)}%`,
      top: `${mapY(clip.position?.y)}%`,
      width: mapW(clip.size?.width),
      height: mapH(clip.size?.height),
      borderRadius: '50%',
      overflow: 'hidden',
      outline: isSelected ? '2px solid #1a73e8' : 'none',
      zIndex: isSelected ? 20 : 9,
      cursor: 'pointer',
      background: clip.src
        ? 'transparent'
        : 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
    }}
  >
    {clip.src ? (
      <img
        src={clip.src}
        alt="Avatar"
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
      />
    ) : (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <MdPerson size={Math.min(48, (clip.size?.width || 120) / 2.5)} style={{ color: 'rgba(255,255,255,0.8)' }} />
      </div>
    )}
  </div>
)

/** Renders a shape / background rect */
const ShapeClip = ({ clip, isSelected, onSelect }) => (
  <div
    onClick={(e) => { e.stopPropagation(); onSelect(clip.id) }}
    style={{
      position: 'absolute',
      left: `${mapX(clip.position?.x)}%`,
      top: `${mapY(clip.position?.y)}%`,
      width: mapW(clip.size?.width),
      height: mapH(clip.size?.height),
      background: clip.style?.backgroundColor || clip.style?.background || 'rgba(0,0,0,0.06)',
      borderRadius: clip.style?.borderRadius || '0',
      border: isSelected ? '2px solid #1a73e8' : 'none',
      zIndex: isSelected ? 20 : 5,
      cursor: 'pointer',
    }}
  />
)

/**
 * Main renderer: takes a scene object (with a `clips` array),
 * a background definition, and renders the full live, editable canvas.
 *
 * Props:
 *   scene        – the active scene object from project.scenes
 *   selectedId   – currently selected clip id
 *   onSelectClip – callback(clipId)
 *   onContentChange – callback(clipId, newText) for text edits
 *   onDeselect   – called when canvas background is clicked
 */
const LiveCanvasRenderer = ({
  scene,
  selectedId,
  onSelectClip,
  onContentChange,
  onDeselect,
}) => {
  const clips = scene?.clips || []

  // Background style
  const bg = scene?.background?.value
  const bgImage = scene?.backgroundImage

  let backgroundStyle = {
    background: bg || '#f8fafc',
    backgroundImage: bg
      ? 'none'
      : bgImage
        ? `url(${bgImage})`
        : 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px)',
    backgroundSize: bgImage ? 'cover' : '28px 28px',
    backgroundPosition: 'center',
  }

  return (
    <div
      onClick={onDeselect}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        containerType: 'inline-size', // Vital for cqw scaling text sizes
        fontFamily: 'Inter, system-ui, sans-serif',
        ...backgroundStyle,
      }}
    >
      {/* Sort clips by zIndex/layer before render */}
      {[...clips]
        .sort((a, b) => (a.layer ?? 0) - (b.layer ?? 0))
        .map((clip) => {
          const isSelected = selectedId === clip.id

          if (clip.type === 'text') {
            return (
              <TextClip
                key={clip.id}
                clip={clip}
                isSelected={isSelected}
                onSelect={onSelectClip}
                onContentChange={onContentChange}
              />
            )
          }

          if (clip.type === 'image') {
            return (
              <ImageClip
                key={clip.id}
                clip={clip}
                isSelected={isSelected}
                onSelect={onSelectClip}
              />
            )
          }

          if (clip.type === 'avatar') {
            return (
              <AvatarClip
                key={clip.id}
                clip={clip}
                isSelected={isSelected}
                onSelect={onSelectClip}
              />
            )
          }

          if (clip.type === 'shape') {
            return (
              <ShapeClip
                key={clip.id}
                clip={clip}
                isSelected={isSelected}
                onSelect={onSelectClip}
              />
            )
          }

          return null
        })}

      {/* Empty state */}
      {clips.length === 0 && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 12,
          color: '#94a3b8',
        }}>
          <div style={{
            width: 80, height: 80,
            borderRadius: 20,
            border: '2px dashed #cbd5e1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MdPhotoSizeSelectActual size={36} style={{ color: '#cbd5e1' }} />
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Add a layout to begin</p>
          <p style={{ fontSize: 12, margin: 0, color: '#94a3b8' }}>
            Click the Layout button in the sidebar
          </p>
        </div>
      )}
    </div>
  )
}

export default LiveCanvasRenderer
