import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react'
import { MdPerson, MdPhotoSizeSelectActual, MdVideoLibrary, MdDragIndicator, MdOpenWith, MdHeight } from 'react-icons/md'
import { getClipTextContent, isTextLayer, toFontSizeCss } from '../../../../utils/textClip'
import {
  getEntranceAnimation,
  getAnimatedTextContent,
} from '../../../../utils/clipAnimations'
import { buildLiveAnimStyle } from '../../../../utils/layerAnimationStyle'
import { useComputedEntranceState } from '../../../../hooks/useComputedEntranceState'
import {
  buildTextDisplayStyle,
  getTextShapeWrapperStyle,
  getTextShapeInnerStyle,
} from '../../../../utils/textEffects'
import { getClipZIndex, isBackgroundClip, sortClipsForRender } from '../../../../utils/editorLayerUtils'
import { resolveClipRect } from '../../../../utils/clipLayout'
import { resolveClipMediaSrc, isVideoMedia } from '../../../../utils/heygenVideo'
import { resolveAvatarDisplaySrc } from '../../../../utils/templateAvatarPreview'
import { formatLayerBorderCss } from '../../../../utils/layerBorderUtils'
import {
  canAcceptImageFill,
  parseCanvasDragData,
  resolveDropAssetId,
  resolveDropImageSrc,
} from '../../../../utils/editorDragDrop'
import { clientToComposition, compositionToClient } from '../../../../utils/editorPlacementUtils'
import { getClipTransformCenter } from '../../../../utils/canvasTransformUtils'
import CanvasGuidesOverlay from './CanvasGuidesOverlay'
import SelectionOverlay from './SelectionOverlay'
import SelectionQuickToolbar from './SelectionQuickToolbar'
import { PreviewModeProvider } from '../../../../contexts/PreviewModeContext'
import { measureTextContentSize } from '../../../../utils/canvasTransformUtils'
import './TextSidebarPanel.css'
import './SelectionQuickToolbar.css'

/**
 * COORDINATE SYSTEM
 * The virtual canvas is always 1920 × 1080 px.
 * All clip position.x / position.y / size.width / size.height are in these pixels.
 * The outer container is measured via ResizeObserver and displayScale = min(W/1920, H/1080).
 * Mouse events are divided by displayScale to convert back to virtual space.
 */

/* ─── Shared selection chrome for selected clips ─────────────────────── */
const ClipSelectionChrome = ({
  clip,
  clipType,
  displayScale,
  onUpdatePosition,
  onUpdateSize,
  onUpdateBounds,
  onUpdateTextFontSize,
  onUpdateRotation,
  onCommit,
  getRotationPivotClient,
  toolbarProps,
}) => (
  <>
    {toolbarProps && (
      <SelectionQuickToolbar clip={clip} {...toolbarProps} />
    )}
    <SelectionOverlay
      clip={clip}
      clipType={clipType}
      displayScale={displayScale}
      onUpdatePosition={onUpdatePosition}
      onUpdateSize={onUpdateSize}
      onUpdateBounds={onUpdateBounds}
      onUpdateTextFontSize={onUpdateTextFontSize}
      onUpdateRotation={onUpdateRotation}
      onCommit={onCommit}
      getRotationPivotClient={getRotationPivotClient}
    />
  </>
)

/* ─── Outer transform shell + inner visual clip ─────────────────────── */
const clipInnerShell = (style = {}) => ({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  boxSizing: 'border-box',
  ...style,
})

const ClipTransformShell = ({
  clip,
  onSelect,
  outerStyle,
  innerStyle,
  selectionChrome,
  children,
  className,
  onDragOver,
  onDragLeave,
  onDrop,
  clickOnly = false,
}) => (
  <div
    className={className}
    onMouseDown={clickOnly ? undefined : (e) => { e.stopPropagation(); onSelect(clip.id, e) }}
    onClick={(e) => { e.stopPropagation(); onSelect(clip.id, e) }}
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onDrop={onDrop}
    style={{ ...outerStyle, overflow: 'visible' }}
  >
    {selectionChrome}
    <div style={clipInnerShell(innerStyle)}>
      {children}
    </div>
  </div>
)

const clipBase = (clip, isSelected) => {
  const { position, size } = resolveClipRect(clip)
  return {
  position: 'absolute',
  left: position.x,
  top: position.y,
  width: typeof size.width === 'number' ? size.width : (size.width || 'auto'),
  height: typeof size.height === 'number' ? size.height : (size.height || 'auto'),
  transform: `rotate(${clip.rotation ?? 0}deg) scale(${clip.scale ?? 1})`,
  transformOrigin: 'top left',
  opacity: clip.opacity ?? 1,
  zIndex: getClipZIndex(clip),
  outline: isSelected
    ? (isBackgroundClip(clip) ? '2px dashed rgba(26,115,232,0.6)' : 'none')
    : '2px solid transparent',
  outlineOffset: isSelected && isBackgroundClip(clip) ? -2 : 1,
  boxSizing: 'border-box',
  cursor: isSelected ? (isBackgroundClip(clip) ? 'default' : 'move') : 'pointer',
  transition: 'outline 0.1s',
}
}

const TextClip = ({ clip, isSelected, onSelect, onContentChange, displayScale, onUpdatePosition, onUpdateSize, onUpdateBounds, onUpdateRotation, onCommit, getRotationPivotClient, toolbarProps, overlayMode = false }) => {
  const divRef = useRef(null)
  const measureRaf = useRef(null)
  const s = clip.style || {}
  const textLayout = resolveClipRect(clip)
  const { entrance, animState, progress: previewProgress } = useComputedEntranceState(clip)

  const syncTextSize = useCallback(() => {
    if (!divRef.current || overlayMode || clip._userPlaced) return
    const hasFill =
      !!(s.backgroundColor && s.backgroundColor !== 'transparent') ||
      !!(s.boxShadow && s.boxShadow !== 'none')
    const measured = measureTextContentSize(divRef.current, {
      paddingX: hasFill ? 24 : 8,
      paddingY: hasFill ? 20 : 4,
    })
    if (!measured) return
    const currentW = clip.size?.width ?? textLayout.size.width
    const width = clip._userPlaced ? currentW : Math.max(currentW, measured.width)
    const height = measured.height
    const curH = clip.size?.height ?? textLayout.size.height
    const curW = clip.size?.width ?? textLayout.size.width
    if (Math.abs(height - curH) > 2 || (!clip._userPlaced && Math.abs(width - curW) > 2)) {
      onUpdateSize(clip.id, Math.round(width), Math.round(height))
    }
  }, [clip.id, clip.size?.width, clip.size?.height, clip._userPlaced, s.backgroundColor, s.boxShadow, textLayout.size.width, textLayout.size.height, overlayMode, onUpdateSize])

  useLayoutEffect(() => {
    if (!isSelected && !clip._userPlaced) {
      syncTextSize()
    }
  }, [isSelected, clip._userPlaced, syncTextSize])

  useEffect(() => {
    if (!divRef.current || overlayMode) return undefined
    const el = divRef.current
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(measureRaf.current)
      measureRaf.current = requestAnimationFrame(syncTextSize)
    })
    ro.observe(el)
    return () => {
      ro.disconnect()
      cancelAnimationFrame(measureRaf.current)
    }
  }, [syncTextSize, overlayMode])

  const handleBlur = () => {
    if (divRef.current && onContentChange) {
      onContentChange(clip.id, divRef.current.innerText)
    }
    syncTextSize()
  }

  const handleInput = () => {
    cancelAnimationFrame(measureRaf.current)
    measureRaf.current = requestAnimationFrame(syncTextSize)
  }

  const displayStyle = buildTextDisplayStyle(s, clip.opacity ?? 1)
  const shapeWrap = getTextShapeWrapperStyle(s.textShape)
  const shapeInner = getTextShapeInnerStyle(s.textShape)

  const displayText =
    animState?.typewriterChars != null
      ? getAnimatedTextContent(clip, animState.typewriterChars, getClipTextContent)
      : getClipTextContent(clip)

  const previewVisible = animState ? animState.visible : true
  const transformParts = [
    animState ? `translate(${animState.translateX}px, ${animState.translateY}px)` : '',
    animState ? `scale(${animState.scale})` : '',
  ].filter(Boolean).join(' ')

  const textStyle = {
    ...displayStyle,
    fontSize: toFontSizeCss(textLayout.fontSize ?? s.fontSize, 24),
    outline: 'none',
    cursor: isSelected ? 'text' : 'pointer',
    width: '100%',
    maxWidth: '100%',
    position: 'relative',
    opacity: animState ? animState.opacity : displayStyle.opacity,
    transform: animState ? transformParts : undefined,
    filter: animState?.blur ? `blur(${animState.blur}px)` : displayStyle.filter,
    ...shapeInner,
  }

  const isBlockAnim = entrance?.type === 'block'
  const hasFill =
    !!(s.backgroundColor && s.backgroundColor !== 'transparent') ||
    !!(s.boxShadow && s.boxShadow !== 'none')

  return (
    <ClipTransformShell
      clip={clip}
      onSelect={onSelect}
      outerStyle={{
        ...clipBase(clip, isSelected),
        transform: `rotate(${clip.rotation ?? 0}deg)`,
        transformOrigin: 'top left',
        userSelect: isSelected && !overlayMode ? 'text' : 'none',
        opacity: overlayMode ? 0 : previewVisible ? 1 : 0,
      }}
      innerStyle={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: s.textAlign === 'left' ? 'flex-start' : (s.textAlign === 'right' ? 'flex-end' : 'center'),
        borderRadius: hasFill ? (s.borderRadius || '12px') : 4,
        backgroundColor: hasFill ? (s.backgroundColor || 'transparent') : undefined,
        boxShadow: hasFill ? (s.boxShadow || 'none') : undefined,
      }}
      selectionChrome={isSelected && !overlayMode ? (
        <ClipSelectionChrome
          clip={clip}
          clipType="text"
          displayScale={displayScale}
          onUpdatePosition={(x, y) => onUpdatePosition(clip.id, x, y)}
          onUpdateSize={(w, h) => onUpdateSize(clip.id, w, h)}
          onUpdateBounds={(x, y, w, h) => onUpdateBounds(clip.id, x, y, w, h)}
          onUpdateTextFontSize={(fontSize) => toolbarProps?.onUpdateStyle?.({ fontSize })}
          onUpdateRotation={(deg) => onUpdateRotation?.(clip.id, deg)}
          onCommit={onCommit}
          getRotationPivotClient={getRotationPivotClient}
          toolbarProps={toolbarProps}
        />
      ) : null}
    >
      <div style={{ width: '100%', flex: '1 1 auto', minHeight: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'stretch', ...shapeWrap }}>
        {isBlockAnim ? (
          <div
            className="text-live-block-wrap"
            style={{
              width: '100%',
              maxWidth: '100%',
              '--block-reveal': String(animState?.blockReveal ?? previewProgress ?? 1),
            }}
          >
            <div
              ref={divRef}
              contentEditable={isSelected && !overlayMode && clip.editable !== false}
              suppressContentEditableWarning
              onBlur={handleBlur}
              onInput={handleInput}
              onClick={(e) => isSelected && e.stopPropagation()}
              className="text-live-block-inner"
              style={textStyle}
            >
              {displayText}
            </div>
          </div>
        ) : (
          <div
            ref={divRef}
            contentEditable={isSelected && !overlayMode && clip.editable !== false}
            suppressContentEditableWarning
            onBlur={handleBlur}
            onInput={handleInput}
            onClick={(e) => isSelected && e.stopPropagation()}
            style={textStyle}
          >
            {displayText}
            {entrance?.type === 'typewriter' && previewProgress != null && previewProgress < 1 ? (
              <span
                className="tw-cursor"
                style={{
                  display: 'inline-block',
                  width: 2,
                  height: '0.85em',
                  background: s.color || '#7c3aed',
                  marginLeft: 2,
                  verticalAlign: 'text-bottom',
                }}
              />
            ) : null}
          </div>
        )}
      </div>
    </ClipTransformShell>
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

const ImageClip = ({ clip, isSelected, onSelect, displayScale, onUpdatePosition, onUpdateSize, onUpdateBounds, onUpdateRotation, onCommit, getRotationPivotClient, toolbarProps, overlayMode = false }) => {
  const s   = clip.style || {}
  const cf  = clip.cssFilters || {}
  const { animState } = useComputedEntranceState(clip)
  const flipX = s.scaleX === -1 ? -1 : 1
  const flipY = s.scaleY === -1 ? -1 : 1
  const flipTransform = (flipX !== 1 || flipY !== 1) ? `scale(${flipX}, ${flipY})` : undefined
  const cssFilter = buildCssFilter(cf)
  const src = resolveClipMediaSrc(clip)

  // Border: panel fields or legacy `border` shorthand from templates
  const borderStyle = formatLayerBorderCss(s)

  const animatedOuter = buildLiveAnimStyle(clipBase(clip, isSelected), clip, animState, {
    flipTransform,
    cssFilter,
    overlayMode,
    overflow: 'hidden',
    borderRadius: s.borderRadius || '12px',
    border: borderStyle,
    boxShadow: s.boxShadow || 'none',
    clipPath: s.clipPath || undefined,
    background: overlayMode ? 'transparent' : (src ? 'transparent' : (s.backgroundColor || s.background || 'rgba(0,0,0,0.04)')),
  })

  const selectionChrome = isSelected && !overlayMode ? (
    <ClipSelectionChrome
      clip={clip}
      clipType="media"
      displayScale={displayScale}
      onUpdatePosition={(x, y) => onUpdatePosition(clip.id, x, y)}
      onUpdateSize={(w, h) => onUpdateSize(clip.id, w, h)}
      onUpdateBounds={(x, y, w, h) => onUpdateBounds(clip.id, x, y, w, h)}
      onUpdateRotation={(deg) => onUpdateRotation?.(clip.id, deg)}
      onCommit={onCommit}
      getRotationPivotClient={getRotationPivotClient}
      toolbarProps={toolbarProps}
    />
  ) : null

  return (
    <ClipTransformShell
      clip={clip}
      onSelect={onSelect}
      outerStyle={animatedOuter}
      innerStyle={{
        borderRadius: s.borderRadius || '12px',
        border: borderStyle,
        boxShadow: s.boxShadow || 'none',
        clipPath: s.clipPath || undefined,
        background: overlayMode ? 'transparent' : (clip.src ? 'transparent' : (s.backgroundColor || s.background || 'rgba(0,0,0,0.04)')),
      }}
      selectionChrome={selectionChrome}
    >
      {src ? (
        !overlayMode ? (
        <img
          src={src}
          alt=""
          style={{
            width: '100%', height: '100%',
            objectFit: s.objectFit || (clip.role === 'icon' ? 'contain' : 'cover'),
            display: 'block',
            pointerEvents: 'none',
          }}
        />
        ) : null
      ) : !overlayMode ? (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.08) 100%)' }}>
          <MdPhotoSizeSelectActual size={32} style={{ color: 'rgba(99,102,241,0.4)', pointerEvents: 'none' }} />
          <span style={{ fontSize: 11, color: 'rgba(99,102,241,0.5)', fontWeight: 700, letterSpacing: '0.05em', pointerEvents: 'none' }}>ADD IMAGE</span>
        </div>
      ) : null}
    </ClipTransformShell>
  )
}

/** Static first-frame preview — does not auto-play while the timeline is paused. */
const PausedVideoPreview = ({ src, style }) => {
  const videoRef = useRef(null)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    el.pause()
    try {
      el.currentTime = 0
    } catch {
      // ignore seek errors before metadata loads
    }
  }, [src])

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      playsInline
      preload="metadata"
      style={style}
    />
  )
}

const AvatarClip = ({ clip, isSelected, onSelect, scene, displayScale, onUpdatePosition, onUpdateSize, onUpdateBounds, onUpdateRotation, onCommit, getRotationPivotClient, toolbarProps, overlayMode = false }) => {
  const playbackSrc = resolveClipMediaSrc(clip, scene)
  const displaySrc = playbackSrc || resolveAvatarDisplaySrc(clip, scene)
  const isVideo = isVideoMedia(clip, playbackSrc)
  const s  = clip.style || {}
  const cf = clip.cssFilters || {}
  const { animState } = useComputedEntranceState(clip)
  const cssFilter = buildCssFilter(cf)
  const flipX = s.scaleX === -1 ? -1 : 1
  const flipY = s.scaleY === -1 ? -1 : 1
  const flipTransform = (flipX !== 1 || flipY !== 1) ? `scale(${flipX}, ${flipY})` : undefined
  const isBg = isBackgroundClip(clip)
  const borderStyle = formatLayerBorderCss(s, '#7c3aed')

  const animatedOuter = buildLiveAnimStyle(clipBase(clip, isSelected), clip, animState, {
    flipTransform,
    cssFilter,
    overlayMode,
  })

  const avatarFit = s.objectFit || (isBg ? 'cover' : 'cover')
  const avatarMaskStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 'inherit',
    clipPath: s.clipPath || undefined,
    WebkitClipPath: s.clipPath || undefined,
    isolation: 'isolate',
    transform: 'translateZ(0)',
  }
  const selectionChrome = isSelected && !overlayMode ? (
    <ClipSelectionChrome
      clip={clip}
      clipType="media"
      displayScale={displayScale}
      onUpdatePosition={(x, y) => onUpdatePosition(clip.id, x, y)}
      onUpdateSize={(w, h) => onUpdateSize(clip.id, w, h)}
      onUpdateBounds={(x, y, w, h) => onUpdateBounds(clip.id, x, y, w, h)}
      onUpdateRotation={(deg) => onUpdateRotation?.(clip.id, deg)}
      onCommit={onCommit}
      getRotationPivotClient={getRotationPivotClient}
      toolbarProps={toolbarProps}
    />
  ) : null

  return (
    <ClipTransformShell
      clip={clip}
      onSelect={onSelect}
      clickOnly
      outerStyle={animatedOuter}
      innerStyle={{
        borderRadius: isBg ? '0' : (s.borderRadius || '50%'),
        border: borderStyle,
        boxShadow: s.boxShadow || 'none',
        background: overlayMode ? 'transparent' : (displaySrc ? 'transparent' : (s.backgroundColor || s.background || '#f5f5f4')),
      }}
      selectionChrome={selectionChrome}
    >
      {displaySrc ? (
        !overlayMode ? (
        <div style={avatarMaskStyle}>
          {isVideo && playbackSrc ? (
            <PausedVideoPreview
              src={playbackSrc}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: avatarFit,
                display: 'block',
                pointerEvents: 'none',
                borderRadius: 'inherit',
                clipPath: 'inherit',
                WebkitClipPath: 'inherit',
              }}
            />
          ) : (
            <img
              src={displaySrc}
              alt="Presenter"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: avatarFit,
                display: 'block',
                pointerEvents: 'none',
                borderRadius: 'inherit',
                clipPath: 'inherit',
                WebkitClipPath: 'inherit',
              }}
            />
          )}
        </div>
        ) : null
      ) : !overlayMode ? (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f4' }}>
          <MdPerson size={Math.min(48, (clip.size?.width || 120) / 2.5)} style={{ color: '#a8a29e', pointerEvents: 'none' }} />
        </div>
      ) : null}
    </ClipTransformShell>
  )
}

const VideoClip = ({ clip, isSelected, onSelect, scene, displayScale, onUpdatePosition, onUpdateSize, onUpdateBounds, onUpdateRotation, onCommit, getRotationPivotClient, toolbarProps, overlayMode = false }) => {
  const src = resolveClipMediaSrc(clip, scene)
  const isVideo = isVideoMedia(clip, src)
  const isAvatarLike = clip.role === 'avatar' || clip.type === 'avatar'
  const s  = clip.style || {}
  const cf = clip.cssFilters || {}
  const { animState } = useComputedEntranceState(clip)
  const cssFilter = buildCssFilter(cf)
  const flipX = s.scaleX === -1 ? -1 : 1
  const flipY = s.scaleY === -1 ? -1 : 1
  const flipTransform = (flipX !== 1 || flipY !== 1) ? `scale(${flipX}, ${flipY})` : undefined
  const borderStyle = formatLayerBorderCss(s)
  const isBg = isBackgroundClip(clip)
  const fitMode = s.objectFit || (isBg ? 'cover' : (isAvatarLike ? 'cover' : 'cover'))
  const avatarMaskStyle = isAvatarLike
    ? {
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        borderRadius: 'inherit',
        clipPath: s.clipPath || undefined,
        WebkitClipPath: s.clipPath || undefined,
        isolation: 'isolate',
        transform: 'translateZ(0)',
      }
    : null

  const animatedOuter = buildLiveAnimStyle(clipBase(clip, isSelected), clip, animState, {
    flipTransform,
    cssFilter,
    overlayMode,
  })

  const selectionChrome = isSelected && !overlayMode ? (
    <ClipSelectionChrome
      clip={clip}
      clipType="media"
      displayScale={displayScale}
      onUpdatePosition={(x, y) => onUpdatePosition(clip.id, x, y)}
      onUpdateSize={(w, h) => onUpdateSize(clip.id, w, h)}
      onUpdateBounds={(x, y, w, h) => onUpdateBounds(clip.id, x, y, w, h)}
      onUpdateRotation={(deg) => onUpdateRotation?.(clip.id, deg)}
      onCommit={onCommit}
      getRotationPivotClient={getRotationPivotClient}
      toolbarProps={toolbarProps}
    />
  ) : null

  return (
    <ClipTransformShell
      clip={clip}
      onSelect={onSelect}
      outerStyle={animatedOuter}
      innerStyle={{
        borderRadius: isBg ? '0' : (s.borderRadius || (clip.role === 'avatar' ? '50%' : '16px')),
        border: borderStyle,
        boxShadow: s.boxShadow || 'none',
        background: overlayMode ? 'transparent' : (src ? 'transparent' : (s.backgroundColor || s.background || 'rgba(0,0,0,0.04)')),
      }}
      selectionChrome={selectionChrome}
    >
      {src ? (
        !overlayMode ? (
        avatarMaskStyle ? (
          <div style={avatarMaskStyle}>
            {isVideo ? (
              <PausedVideoPreview
                src={src}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: fitMode,
                  display: 'block',
                  pointerEvents: 'none',
                  borderRadius: 'inherit',
                  clipPath: 'inherit',
                  WebkitClipPath: 'inherit',
                }}
              />
            ) : (
              <img
                src={src}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: fitMode,
                  display: 'block',
                  pointerEvents: 'none',
                  borderRadius: 'inherit',
                  clipPath: 'inherit',
                  WebkitClipPath: 'inherit',
                }}
                alt=""
              />
            )}
          </div>
        ) : isVideo ? (
          <PausedVideoPreview
            src={src}
            style={{ width: '100%', height: '100%', objectFit: fitMode, display: 'block', pointerEvents: 'none' }}
          />
        ) : (
          <img src={src} style={{ width: '100%', height: '100%', objectFit: fitMode, display: 'block', pointerEvents: 'none' }} alt="" />
        )
        ) : null
      ) : !overlayMode ? (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.08) 100%)' }}>
          <MdVideoLibrary size={32} style={{ color: 'rgba(99,102,241,0.4)', pointerEvents: 'none' }} />
          <span style={{ fontSize: 11, color: 'rgba(99,102,241,0.5)', fontWeight: 700, letterSpacing: '0.05em', pointerEvents: 'none' }}>ADD VIDEO</span>
        </div>
      ) : null}
    </ClipTransformShell>
  )
}

const ShapeClip = ({
  clip,
  isSelected,
  onSelect,
  displayScale,
  onUpdatePosition,
  onUpdateSize,
  onUpdateBounds,
  onUpdateRotation,
  onCommit,
  onFillShape,
  getRotationPivotClient,
  toolbarProps,
  overlayMode = false,
}) => {
  const [isDropTarget, setIsDropTarget] = useState(false)
  const { animState } = useComputedEntranceState(clip)
  const hasFill = !!clip.fillSrc
  const animatedOuter = buildLiveAnimStyle(clipBase(clip, isSelected), clip, animState, {
    overlayMode,
  })

  const acceptFill = canAcceptImageFill(clip) && onFillShape

  const handleDragOver = (e) => {
    if (!acceptFill) return
    const types = Array.from(e.dataTransfer?.types || [])
    const isImageDrag = types.includes('application/json') || types.includes('Files')
    if (!isImageDrag) return
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
    setIsDropTarget(true)
  }

  const handleDragLeave = (e) => {
    if (!acceptFill) return
    e.preventDefault()
    setIsDropTarget(false)
  }

  const handleDrop = (e) => {
    if (!acceptFill) return
    e.preventDefault()
    e.stopPropagation()
    setIsDropTarget(false)

    const data = parseCanvasDragData(e)
    if (data?.type === 'image') {
      const src = resolveDropImageSrc(data.content)
      if (src) {
        onFillShape(clip.id, src, resolveDropAssetId(data.content))
        onSelect(clip.id, e)
      }
      return
    }

    const file = e.dataTransfer.files?.[0]
    if (file?.type?.startsWith('image/')) {
      onFillShape(clip.id, URL.createObjectURL(file))
      onSelect(clip.id, e)
    }
  }

  const selectionChrome = isSelected && !overlayMode ? (
    <ClipSelectionChrome
      clip={clip}
      clipType="shape"
      displayScale={displayScale}
      onUpdatePosition={(x, y) => onUpdatePosition(clip.id, x, y)}
      onUpdateSize={(w, h) => onUpdateSize(clip.id, w, h)}
      onUpdateBounds={(x, y, w, h) => onUpdateBounds(clip.id, x, y, w, h)}
      onUpdateRotation={(deg) => onUpdateRotation?.(clip.id, deg)}
      onCommit={onCommit}
      getRotationPivotClient={getRotationPivotClient}
      toolbarProps={toolbarProps}
    />
  ) : null

  return (
    <ClipTransformShell
      clip={clip}
      onSelect={onSelect}
      className={isDropTarget ? 'shape-clip shape-clip--drop-target' : 'shape-clip'}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      outerStyle={animatedOuter}
      innerStyle={{
        background: overlayMode
          ? 'transparent'
          : hasFill
            ? 'transparent'
            : (clip.style?.backgroundColor || clip.style?.background || 'rgba(0,0,0,0.06)'),
        borderRadius: clip.style?.borderRadius || '0',
        border: formatLayerBorderCss(clip.style || {}),
        boxShadow: clip.style?.boxShadow || 'none',
        clipPath: clip.style?.clipPath || undefined,
      }}
      selectionChrome={selectionChrome}
    >
      {hasFill && (
        <img
          src={clip.fillSrc}
          alt=""
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: clip.fillObjectFit || 'cover',
            display: 'block',
            pointerEvents: 'none',
          }}
        />
      )}
      {isSelected && !overlayMode && !hasFill && clip.role === 'frame' && (
        <div className="shape-clip-drop-hint" aria-hidden>
          Drop image here
        </div>
      )}
    </ClipTransformShell>
  )
}

/* ─── Main Renderer ──────────────────────────────────────────────────── */
const LiveCanvasRenderer = ({
  scene,
  selectedId,
  selectedIds = [],
  onSelectClip,
  onContentChange,
  onDeselect,
  onUpdateLayerPosition,
  onCommitLayerPosition,
  onUpdateLayerSize,
  onUpdateLayerBounds,
  onUpdateLayerRotation,
  onUpdateLayerStyle,
  onUpdateLayer,
  onDuplicateLayer,
  onDeleteLayer,
  onMoveLayerOrder,
  onToggleLayerLock,
  onOpenLayerCrop,
  onFillShape,
  onCanvasDrop,
  showGuides = false,
  showPageGrid = false,
  showSafeZone = true,
  gridSize = 20,
  overlayMode = false,
  staticPreview = false,
  scaleMode = 'contain',
  compositionWidth = 1920,
  compositionHeight = 1080,
}) => {
  const containerRef = useRef(null)
  const compositionRef = useRef(null)
  const [displayScale, setDisplayScale] = useState(0.2)
  const [displayOffset, setDisplayOffset] = useState({ x: 0, y: 0 })

  const updateDisplayScale = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    if (width > 0 && height > 0) {
      const scaleX = width / compositionWidth
      const scaleY = height / compositionHeight
      const scale =
        scaleMode === 'cover'
          ? Math.max(scaleX, scaleY)
          : Math.min(scaleX, scaleY)
      setDisplayScale(scale)
      setDisplayOffset({
        x: (width - compositionWidth * scale) / 2,
        y: (height - compositionHeight * scale) / 2,
      })
    }
  }, [scaleMode, compositionWidth, compositionHeight])

  useLayoutEffect(() => {
    updateDisplayScale()
    const el = containerRef.current
    if (!el) return undefined
    const ro = new ResizeObserver(updateDisplayScale)
    ro.observe(el)
    return () => ro.disconnect()
  }, [updateDisplayScale])

  const clips = scene?.clips || []

  const bg = scene?.background?.value
  const bgImage = scene?.backgroundImage

  const backgroundStyle = (() => {
    if (overlayMode) {
      return { backgroundColor: 'transparent', backgroundImage: 'none' }
    }

    // Avoid mixing `background` shorthand with backgroundImage/Size/Position.
    if (bg) {
      const value = String(bg)
      const isGradient = value.includes('gradient(')
      return {
        backgroundColor: isGradient ? '#f8fafc' : value,
        backgroundImage: isGradient ? value : 'none',
        backgroundSize: isGradient ? 'cover' : '28px 28px',
        backgroundPosition: isGradient ? 'center' : 'center',
      }
    }

    return {
      backgroundColor: '#f8fafc',
      backgroundImage: bgImage
        ? `url(${bgImage})`
        : 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px)',
      backgroundSize: bgImage ? 'cover' : '28px 28px',
      backgroundPosition: 'center',
    }
  })()

  const handleUpdatePosition = useCallback((clipId, x, y) => {
    if (onUpdateLayerPosition) onUpdateLayerPosition(clipId, x, y)
  }, [onUpdateLayerPosition])

  const handleUpdateSize = useCallback((clipId, w, h) => {
    if (onUpdateLayerSize) onUpdateLayerSize(clipId, w, h)
  }, [onUpdateLayerSize])

  const handleUpdateBounds = useCallback((clipId, x, y, w, h) => {
    if (onUpdateLayerBounds) onUpdateLayerBounds(clipId, x, y, w, h)
  }, [onUpdateLayerBounds])

  const handleUpdateRotation = useCallback((clipId, rotation) => {
    if (onUpdateLayerRotation) onUpdateLayerRotation(clipId, rotation)
  }, [onUpdateLayerRotation])

  const handleGetRotationPivotClient = useCallback((clip) => {
    const layout = resolveClipRect(clip)
    const center = getClipTransformCenter(clip, layout)
    const el = containerRef.current
    if (!el) return null
    return compositionToClient(center.x, center.y, el, displayScale, displayOffset)
  }, [displayScale, displayOffset])

  const buildToolbarProps = useCallback((clip) => {
    if (!clip || clip.locked || clip.isBackground || isBackgroundClip(clip)) return null
    return {
      compositionWidth,
      compositionHeight,
      displayScale,
      compositionRef,
      onUpdateStyle: (styleUpdates) => onUpdateLayerStyle?.(clip.id, styleUpdates),
      onUpdateLayer: (updates) => onUpdateLayer?.(clip.id, updates),
      onDuplicate: () => onDuplicateLayer?.(clip.id),
      onDelete: () => onDeleteLayer?.(clip.id),
      onMoveLayerOrder: (dir) => onMoveLayerOrder?.(clip.id, dir),
      onToggleLock: (locked) => onToggleLayerLock?.(clip.id, locked),
      onOpenCrop: () => onOpenLayerCrop?.(clip.id),
    }
  }, [
    compositionWidth,
    compositionHeight,
    displayScale,
    onUpdateLayerStyle,
    onUpdateLayer,
    onDuplicateLayer,
    onDeleteLayer,
    onMoveLayerOrder,
    onToggleLayerLock,
    onOpenLayerCrop,
  ])

  const handleCompositionDragOver = useCallback((e) => {
    const types = Array.from(e.dataTransfer?.types || [])
    if (!types.includes('application/json') && !types.includes('Files')) return
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const handleCompositionDrop = useCallback((e) => {
    if (!onCanvasDrop) return
    e.preventDefault()
    e.stopPropagation()

    const { x, y } = clientToComposition(
      e.clientX,
      e.clientY,
      containerRef.current,
      displayScale,
      displayOffset,
      compositionWidth,
      compositionHeight
    )

    const data = parseCanvasDragData(e)
    if (data?.type) {
      onCanvasDrop({ ...data, x, y })
      return
    }

    const file = e.dataTransfer.files?.[0]
    if (file?.type?.startsWith('image/')) {
      onCanvasDrop({
        type: 'image',
        content: URL.createObjectURL(file),
        x,
        y,
        isBlob: true,
      })
    }
  }, [onCanvasDrop, displayScale, displayOffset, compositionWidth, compositionHeight])

  return (
    <PreviewModeProvider staticEntrance={staticPreview}>
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
      {/* Fixed composition virtual canvas, scaled to fit or cover */}
      <div
        ref={compositionRef}
        onDragOver={handleCompositionDragOver}
        onDrop={handleCompositionDrop}
        style={{
          width: compositionWidth,
          height: compositionHeight,
          position: 'absolute',
          top: 0,
          left: 0,
          transform: `translate(${displayOffset.x}px, ${displayOffset.y}px) scale(${displayScale})`,
          transformOrigin: 'top left',
        }}
      >
        {(showGuides || showPageGrid || showSafeZone) && (
          <CanvasGuidesOverlay
            width={compositionWidth}
            height={compositionHeight}
            showGrid={showGuides || showPageGrid}
            showSafeZone={showSafeZone}
            gridSize={gridSize}
          />
        )}
        {/* Background clips render first; higher layer numbers paint on top for hit-testing */}
        {sortClipsForRender(clips).map(clip => {
          const isSelected = selectedIds.includes(clip.id) || selectedId === clip.id
          const isLocked = !!clip.locked
          const selectionCount = selectedIds.length || (selectedId ? 1 : 0)
          const isSingleSelection = selectionCount <= 1
          const sharedProps = {
            clip,
            isSelected,
            onSelect: (id, e) => onSelectClip && onSelectClip(id, e),
            displayScale,
            onUpdatePosition: clip.isBackground || isLocked || isBackgroundClip(clip) ? () => {} : handleUpdatePosition,
            onUpdateSize: clip.isBackground || isLocked || isBackgroundClip(clip) ? () => {} : handleUpdateSize,
            onUpdateBounds: clip.isBackground || isLocked || isBackgroundClip(clip) ? () => {} : handleUpdateBounds,
            onUpdateRotation: clip.isBackground || isLocked || isBackgroundClip(clip) ? undefined : handleUpdateRotation,
            onCommit: onCommitLayerPosition,
            getRotationPivotClient: handleGetRotationPivotClient,
            toolbarProps: isSelected && !overlayMode && isSingleSelection ? buildToolbarProps(clip) : null,
            overlayMode,
          }

          if (clip.type === 'text' || isTextLayer(clip)) {
            return <TextClip key={clip.id} {...sharedProps} onContentChange={onContentChange} />
          }
          if (clip.type === 'image') return <ImageClip key={clip.id} {...sharedProps} />
          if (clip.type === 'avatar') return <AvatarClip key={clip.id} {...sharedProps} scene={scene} />
          if (clip.type === 'video') return <VideoClip key={clip.id} {...sharedProps} scene={scene} />
          if (clip.type === 'shape') return <ShapeClip key={clip.id} {...sharedProps} onFillShape={onFillShape} />
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
    </PreviewModeProvider>
  )
}

export default LiveCanvasRenderer
