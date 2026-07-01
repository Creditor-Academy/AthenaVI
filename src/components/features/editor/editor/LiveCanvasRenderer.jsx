import React, { useRef, useState, useEffect, useLayoutEffect, useCallback, useMemo } from 'react'
import { MdPerson, MdPhotoSizeSelectActual, MdVideoLibrary, MdDragIndicator, MdOpenWith, MdHeight } from 'react-icons/md'
import { getClipTextContent, isTextLayer, toFontSizeCss } from '../../../../utils/textClip'
import { getTextClips } from '../../../../utils/textCanvasTransform'
import { buildLiveAnimStyle } from '../../../../utils/layerAnimationStyle'
import { useComputedEntranceState } from '../../../../hooks/useComputedEntranceState'
import {
  buildTextDisplayStyle,
  getTextShapeWrapperStyle,
  getTextShapeInnerStyle,
} from '../../../../utils/textEffects'
import { getClipZIndex, isBackgroundClip, isResizableBackgroundClip, sortClipsForRender } from '../../../../utils/editorLayerUtils'
import { getRootClips, getGroupChildren, isGroupClip } from '../../../../utils/editorGroupUtils'
import { buildClipTransform } from '../../../../utils/clipTransformUtils'
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
import TextSelectionOverlay from './TextSelectionOverlay'
import TextClipEditor from './TextClipEditor'
import TextSmartGuidesOverlay from './TextSmartGuidesOverlay'
import TextMarqueeOverlay from './TextMarqueeOverlay'
import MultiSelectionOverlay from './MultiSelectionOverlay'
import { PreviewModeProvider } from '../../../../contexts/PreviewModeContext'
import { measureTextContentSize } from '../../../../utils/canvasTransformUtils'
import './TextSidebarPanel.css'
import './TextSelectionOverlay.css'

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
}) => (
  <>
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
  const { transform, transformOrigin } = buildClipTransform(clip)
  return {
  position: 'absolute',
  left: position.x,
  top: position.y,
  width: typeof size.width === 'number' ? size.width : (size.width || 'auto'),
  height: typeof size.height === 'number' ? size.height : (size.height || 'auto'),
  transform,
  transformOrigin,
  opacity: clip.opacity ?? 1,
  zIndex: isSelected ? 9999 : getClipZIndex(clip),
  outline: isSelected
    ? (isBackgroundClip(clip) ? '2px dashed rgba(26,115,232,0.6)' : 'none')
    : '2px solid transparent',
  outlineOffset: isSelected && isBackgroundClip(clip) ? -2 : 1,
  boxSizing: 'border-box',
  cursor: isSelected ? (isResizableBackgroundClip(clip) ? 'nwse-resize' : isBackgroundClip(clip) ? 'default' : 'move') : 'pointer',
  transition: 'outline 0.1s',
}
}

const applyEphemeralStyle = (base, clip, ephemeral) => {
  if (!ephemeral || ephemeral.clipId !== clip.id) return base
  const next = { ...base }
  if (ephemeral.x != null) next.left = ephemeral.x
  if (ephemeral.y != null) next.top = ephemeral.y
  if (ephemeral.width != null) next.width = ephemeral.width
  if (ephemeral.height != null) next.height = ephemeral.height
  if (ephemeral.rotation != null) {
    const { transform, transformOrigin } = buildClipTransform({ ...clip, rotation: ephemeral.rotation })
    next.transform = transform
    next.transformOrigin = transformOrigin
  }
  return next
}

const TextClip = React.memo(({
  clip,
  isSelected,
  isMultiSelected,
  isEditing,
  isHovered,
  onSelect,
  onContentChange,
  displayScale,
  onUpdatePosition,
  onUpdateSize,
  onUpdateBounds,
  onUpdateRotation,
  onCommit,
  getRotationPivotClient,
  onUpdateLayerStyle,
  overlayMode = false,
  ephemeralTransform,
  otherTextClips,
  compositionWidth,
  compositionHeight,
  snapToGrid,
  gridSize,
  onEnterEdit,
  onHover,
  onGuidesChange,
  onDragBadgeChange,
  onEphemeralChange,
}) => {
  const divRef = useRef(null)
  const s = clip.style || {}
  const { entrance, animState, progress: previewProgress } = useComputedEntranceState(clip)
  const shapeWrap = getTextShapeWrapperStyle(s.textShape)

  const isBlockAnim = entrance?.type === 'block'
  const hasFill =
    !!(s.backgroundColor && s.backgroundColor !== 'transparent') ||
    !!(s.boxShadow && s.boxShadow !== 'none')

  const showTextChrome = isSelected && !overlayMode && !isEditing && !isMultiSelected

  const outerBase = applyEphemeralStyle(
    {
      ...clipBase(clip, isSelected),
      userSelect: isEditing ? 'text' : 'none',
      opacity: overlayMode ? 0 : animState ? (animState.visible ? 1 : 0) : 1,
    },
    clip,
    ephemeralTransform
  )

  if (isHovered && !isSelected && !overlayMode) {
    outerBase.outline = '1px dashed rgba(99, 102, 241, 0.55)'
  }

  const fontSizeOverride =
    ephemeralTransform?.clipId === clip.id && ephemeralTransform.fontSize != null
      ? ephemeralTransform.fontSize
      : null

  return (
    <ClipTransformShell
      clip={clip}
      onSelect={onSelect}
      outerStyle={outerBase}
      innerStyle={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: s.textAlign === 'left' ? 'flex-start' : (s.textAlign === 'right' ? 'flex-end' : 'center'),
        borderRadius: hasFill ? (s.borderRadius || '12px') : 4,
        backgroundColor: hasFill ? (s.backgroundColor || 'transparent') : undefined,
        boxShadow: hasFill ? (s.boxShadow || 'none') : undefined,
      }}
      selectionChrome={
        showTextChrome ? (
          <TextSelectionOverlay
            clip={clip}
            displayScale={displayScale}
            compositionWidth={compositionWidth}
            compositionHeight={compositionHeight}
            otherTextClips={otherTextClips}
            isEditing={isEditing}
            snapToGrid={snapToGrid}
            gridSize={gridSize}
            onUpdatePosition={(x, y) => onUpdatePosition(clip.id, x, y)}
            onUpdateBounds={(x, y, w, h) => onUpdateBounds(clip.id, x, y, w, h)}
            onUpdateTextFontSize={
              onUpdateLayerStyle
                ? (fontSize) => onUpdateLayerStyle(clip.id, { fontSize })
                : undefined
            }
            onUpdateRotation={(deg) => onUpdateRotation?.(clip.id, deg)}
            onCommit={onCommit}
            onEphemeralChange={onEphemeralChange}
            onGuidesChange={onGuidesChange}
            onDragBadgeChange={onDragBadgeChange}
            getRotationPivotClient={getRotationPivotClient}
          />
        ) : null
      }
    >
      <div
        style={{
          width: '100%',
          flex: '1 1 auto',
          minHeight: 0,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'stretch',
          ...shapeWrap,
          ...(fontSizeOverride != null
            ? { fontSize: toFontSizeCss(fontSizeOverride, 24) }
            : {}),
        }}
        onPointerEnter={() => onHover?.(clip.id)}
        onPointerLeave={() => onHover?.(null)}
      >
        {isBlockAnim ? (
          <div
            className="text-live-block-wrap"
            style={{
              width: '100%',
              maxWidth: '100%',
              '--block-reveal': String(animState?.blockReveal ?? previewProgress ?? 1),
            }}
          >
            <TextClipEditor
              clip={clip}
              isEditing={isEditing}
              isSelected={isSelected}
              overlayMode={overlayMode}
              onContentChange={onContentChange}
              onUpdateSize={onUpdateSize}
              onEnterEdit={onEnterEdit}
              onExitEdit={() => onEnterEdit?.(null)}
              divRef={divRef}
            />
          </div>
        ) : (
          <TextClipEditor
            clip={clip}
            isEditing={isEditing}
            isSelected={isSelected}
            overlayMode={overlayMode}
            onContentChange={onContentChange}
            onUpdateSize={onUpdateSize}
            onEnterEdit={onEnterEdit}
            onExitEdit={() => onEnterEdit?.(null)}
            divRef={divRef}
          />
        )}
      </div>
    </ClipTransformShell>
  )
})

TextClip.displayName = 'TextClip'

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

const ImageClip = ({ clip, isSelected, onSelect, displayScale, onUpdatePosition, onUpdateSize, onUpdateBounds, onUpdateRotation, onCommit, getRotationPivotClient, overlayMode = false }) => {
  const s   = clip.style || {}
  const cf  = clip.cssFilters || {}
  const { animState } = useComputedEntranceState(clip)
  const cssFilter = buildCssFilter(cf)
  const src = resolveClipMediaSrc(clip)

  // Border: panel fields or legacy `border` shorthand from templates
  const borderStyle = formatLayerBorderCss(s)

  const animatedOuter = buildLiveAnimStyle(clipBase(clip, isSelected), clip, animState, {
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

const AvatarClip = ({ clip, isSelected, onSelect, scene, displayScale, onUpdatePosition, onUpdateSize, onUpdateBounds, onUpdateRotation, onCommit, getRotationPivotClient, overlayMode = false }) => {
  const playbackSrc = resolveClipMediaSrc(clip, scene)
  const displaySrc = playbackSrc || resolveAvatarDisplaySrc(clip, scene)
  const isVideo = isVideoMedia(clip, playbackSrc)
  const s  = clip.style || {}
  const cf = clip.cssFilters || {}
  const { animState } = useComputedEntranceState(clip)
  const cssFilter = buildCssFilter(cf)
  const isBg = isBackgroundClip(clip)
  const borderStyle = formatLayerBorderCss(s, '#7c3aed')

  const animatedOuter = buildLiveAnimStyle(clipBase(clip, isSelected), clip, animState, {
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

const VideoClip = ({ clip, isSelected, onSelect, scene, displayScale, onUpdatePosition, onUpdateSize, onUpdateBounds, onUpdateRotation, onCommit, getRotationPivotClient, overlayMode = false }) => {
  const src = resolveClipMediaSrc(clip, scene)
  const isVideo = isVideoMedia(clip, src)
  const isAvatarLike = clip.role === 'avatar' || clip.type === 'avatar'
  const s  = clip.style || {}
  const cf = clip.cssFilters || {}
  const { animState } = useComputedEntranceState(clip)
  const cssFilter = buildCssFilter(cf)
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

/** Render a child clip inside a group (local coordinates). */
const GroupChildRenderer = ({
  child,
  scene,
  allClips,
  overlayMode,
  onSelectGroup,
}) => {
  const { transform, transformOrigin } = buildClipTransform(child)
  const w = child.size?.width ?? 100
  const h = child.size?.height ?? 100
  const shellStyle = {
    position: 'absolute',
    left: child.position?.x ?? 0,
    top: child.position?.y ?? 0,
    width: w,
    height: h,
    transform,
    transformOrigin,
    pointerEvents: 'auto',
    cursor: 'pointer',
  }

  const selectGroup = (e) => {
    e.stopPropagation()
    const group = allClips.find((c) => isGroupClip(c) && (c.childIds || []).includes(child.id))
    if (group) onSelectGroup(group.id, e)
  }

  if (child.type === 'text' || isTextLayer(child)) {
    const s = child.style || {}
    return (
      <div onClick={selectGroup} onMouseDown={selectGroup} style={shellStyle}>
        <div style={{ width: '100%', height: '100%', overflow: 'hidden', fontSize: s.fontSize, color: s.color }}>
          {getClipTextContent(child)}
        </div>
      </div>
    )
  }
  if (child.type === 'image') {
    const src = resolveClipMediaSrc(child)
    const s = child.style || {}
    return (
      <div onClick={selectGroup} onMouseDown={selectGroup} style={{ ...shellStyle, overflow: 'hidden', borderRadius: s.borderRadius || '12px' }}>
        {src ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: s.objectFit || 'cover', pointerEvents: 'none' }} /> : null}
      </div>
    )
  }
  if (child.type === 'avatar' || child.type === 'video') {
    const playbackSrc = resolveClipMediaSrc(child, scene)
    const displaySrc = child.type === 'avatar' ? (playbackSrc || resolveAvatarDisplaySrc(child, scene)) : playbackSrc
    const s = child.style || {}
    return (
      <div onClick={selectGroup} onMouseDown={selectGroup} style={{ ...shellStyle, overflow: 'hidden', borderRadius: s.borderRadius || '16px' }}>
        {displaySrc ? (
          isVideoMedia(child, playbackSrc) ? (
            <PausedVideoPreview src={playbackSrc} style={{ width: '100%', height: '100%', objectFit: s.objectFit || 'cover', pointerEvents: 'none' }} />
          ) : (
            <img src={displaySrc} alt="" style={{ width: '100%', height: '100%', objectFit: s.objectFit || 'cover', pointerEvents: 'none' }} />
          )
        ) : null}
      </div>
    )
  }
  if (child.type === 'shape') {
    const s = child.style || {}
    return (
      <div
        onClick={selectGroup}
        onMouseDown={selectGroup}
        style={{
          ...shellStyle,
          background: child.fillSrc ? 'transparent' : (s.backgroundColor || s.background || 'rgba(0,0,0,0.06)'),
          borderRadius: s.borderRadius || '0',
          clipPath: s.clipPath,
          overflow: 'hidden',
        }}
      >
        {child.fillSrc ? (
          <img src={child.fillSrc} alt="" style={{ width: '100%', height: '100%', objectFit: child.fillObjectFit || 'cover', pointerEvents: 'none' }} />
        ) : null}
      </div>
    )
  }
  return null
}

const GroupClip = ({
  clip,
  scene,
  allClips,
  isSelected,
  onSelect,
  displayScale,
  onUpdatePosition,
  onUpdateSize,
  onUpdateBounds,
  onUpdateRotation,
  onCommit,
  getRotationPivotClient,
  overlayMode = false,
}) => {
  const children = getGroupChildren(allClips, clip)
  const { animState } = useComputedEntranceState(clip)
  const animatedOuter = buildLiveAnimStyle(clipBase(clip, isSelected), clip, animState, { overlayMode })

  const selectionChrome = isSelected && !overlayMode ? (
    <ClipSelectionChrome
      clip={clip}
      clipType="default"
      displayScale={displayScale}
      onUpdatePosition={(x, y) => onUpdatePosition(clip.id, x, y)}
      onUpdateSize={(w, h) => onUpdateSize(clip.id, w, h)}
      onUpdateBounds={(x, y, w, h) => onUpdateBounds(clip.id, x, y, w, h)}
      onUpdateRotation={(deg) => onUpdateRotation?.(clip.id, deg)}
      onCommit={onCommit}
      getRotationPivotClient={getRotationPivotClient}
    />
  ) : null

  return (
    <ClipTransformShell
      clip={clip}
      onSelect={onSelect}
      outerStyle={animatedOuter}
      innerStyle={{ position: 'relative', width: '100%', height: '100%', overflow: 'visible' }}
      selectionChrome={selectionChrome}
    >
      {children.map((child) => (
        <GroupChildRenderer
          key={child.id}
          child={child}
          scene={scene}
          allClips={allClips}
          overlayMode={overlayMode}
          onSelectGroup={onSelect}
        />
      ))}
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
  onUpdateClipFields,
  showGuides = false,
  showPageGrid = false,
  showSafeZone = false,
  gridSize = 20,
  snapToGrid = true,
  overlayMode = false,
  staticPreview = false,
  scaleMode = 'contain',
  compositionWidth = 1920,
  compositionHeight = 1080,
  zoomLevel = 100,
  textEditClipId = null,
  onEnterTextEdit,
  onHoverTextClip,
  hoverTextClipId = null,
  onSelectTextIds,
  smartGuides = [],
  onSmartGuidesChange,
  marqueeRect = null,
  onMarqueeChange,
  dragBadge = null,
  onDragBadgeChange,
  ephemeralTransform = null,
  onEphemeralTransformChange,
}) => {
  const containerRef = useRef(null)
  const compositionRef = useRef(null)
  const [displayScale, setDisplayScale] = useState(0.2)
  const [displayOffset, setDisplayOffset] = useState({ x: 0, y: 0 })

  const zoomFactor = (zoomLevel || 100) / 100

  const updateDisplayScale = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    if (width > 0 && height > 0) {
      const scaleX = width / compositionWidth
      const scaleY = height / compositionHeight
      const baseScale =
        scaleMode === 'cover'
          ? Math.max(scaleX, scaleY)
          : Math.min(scaleX, scaleY)
      const scale = baseScale * zoomFactor
      setDisplayScale(scale)
      setDisplayOffset({
        x: (width - compositionWidth * scale) / 2,
        y: (height - compositionHeight * scale) / 2,
      })
    }
  }, [scaleMode, compositionWidth, compositionHeight, zoomFactor])

  useLayoutEffect(() => {
    updateDisplayScale()
    const el = containerRef.current
    if (!el) return undefined
    const ro = new ResizeObserver(updateDisplayScale)
    ro.observe(el)
    return () => ro.disconnect()
  }, [updateDisplayScale])

  const clips = scene?.clips || []
  const rootClips = getRootClips(clips)
  const textClips = useMemo(() => getTextClips(clips), [clips])
  const selectedTextIds = selectedIds.filter((id) => textClips.some((c) => c.id === id))
  const isMultiTextSelection = selectedTextIds.length >= 2

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
      onClick={() => {
        if (textEditClipId && onEnterTextEdit) {
          onEnterTextEdit(null)
        }
        onDeselect && onDeselect()
      }}
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
        {!overlayMode && (
          <TextMarqueeOverlay
            compositionRef={compositionRef}
            displayScale={displayScale}
            displayOffset={displayOffset}
            clips={clips}
            onSelectTextIds={onSelectTextIds}
            onMarqueeChange={onMarqueeChange}
            onDeselect={onDeselect}
          />
        )}
        <TextSmartGuidesOverlay guides={smartGuides} displayScale={displayScale} />
        {marqueeRect && (
          <div
            className="text-marquee-rect"
            style={{
              position: 'absolute',
              left: marqueeRect.x,
              top: marqueeRect.y,
              width: marqueeRect.width,
              height: marqueeRect.height,
              border: '1px solid var(--primary)',
              background: 'rgba(99, 102, 241, 0.08)',
              pointerEvents: 'none',
              zIndex: 44,
            }}
          />
        )}
        {dragBadge && (
          <div
            className="text-canvas-drag-badge"
            style={{ left: '50%', bottom: 24, transform: 'translateX(-50%)' }}
          >
            {dragBadge.x != null
              ? `X: ${dragBadge.x}  Y: ${dragBadge.y}`
              : `W: ${dragBadge.w}  H: ${dragBadge.h}`}
          </div>
        )}
        {/* Background clips render first; higher layer numbers paint on top for hit-testing */}
        {sortClipsForRender(rootClips).map(clip => {
          const isSelected = selectedIds.includes(clip.id) || selectedId === clip.id
          const isLocked = !!clip.locked
          const selectionCount = selectedIds.length || (selectedId ? 1 : 0)
          const isSingleSelection = selectionCount <= 1
          const isResizableBg = isResizableBackgroundClip(clip)
          // For avatar backgrounds: resize is permitted but position is locked to (0,0)
          const bgResizeBounds = isResizableBg
            ? (clipId, _x, _y, w, h) => handleUpdateBounds(clipId, 0, 0, w, h)
            : null
          const sharedProps = {
            clip,
            isSelected,
            onSelect: (id, e) => onSelectClip && onSelectClip(id, e),
            displayScale,
            // Avatar backgrounds can be resized in-place; position + rotation remain locked
            onUpdatePosition: isLocked || isBackgroundClip(clip) ? () => {} : handleUpdatePosition,
            onUpdateSize: isLocked ? () => {} : (isResizableBg || !isBackgroundClip(clip)) ? handleUpdateSize : () => {},
            onUpdateBounds: isLocked ? () => {} : isResizableBg ? bgResizeBounds : isBackgroundClip(clip) ? () => {} : handleUpdateBounds,
            onUpdateRotation: isLocked || isBackgroundClip(clip) ? undefined : handleUpdateRotation,
            onCommit: onCommitLayerPosition,
            getRotationPivotClient: handleGetRotationPivotClient,
            onUpdateLayerStyle,
            overlayMode,
          }

          if (clip.type === 'text' || isTextLayer(clip)) {
            return (
              <TextClip
                key={clip.id}
                clip={clip}
                isSelected={isSelected}
                isMultiSelected={isMultiTextSelection && isSelected}
                isEditing={textEditClipId === clip.id}
                isHovered={hoverTextClipId === clip.id}
                onSelect={(id, e) => onSelectClip && onSelectClip(id, e)}
                onContentChange={onContentChange}
                displayScale={displayScale}
                onUpdatePosition={handleUpdatePosition}
                onUpdateSize={handleUpdateSize}
                onUpdateBounds={handleUpdateBounds}
                onUpdateRotation={handleUpdateRotation}
                onCommit={onCommitLayerPosition}
                getRotationPivotClient={handleGetRotationPivotClient}
                onUpdateLayerStyle={onUpdateLayerStyle}
                overlayMode={overlayMode}
                ephemeralTransform={ephemeralTransform}
                otherTextClips={textClips}
                compositionWidth={compositionWidth}
                compositionHeight={compositionHeight}
                snapToGrid={snapToGrid}
                gridSize={gridSize}
                onEnterEdit={onEnterTextEdit}
                onHover={onHoverTextClip}
                onGuidesChange={onSmartGuidesChange}
                onDragBadgeChange={onDragBadgeChange}
                onEphemeralChange={onEphemeralTransformChange}
              />
            )
          }
          if (clip.type === 'image') return <ImageClip key={clip.id} {...sharedProps} />
          if (clip.type === 'avatar') return <AvatarClip key={clip.id} {...sharedProps} scene={scene} />
          if (clip.type === 'video') return <VideoClip key={clip.id} {...sharedProps} scene={scene} />
          if (clip.type === 'shape') return <ShapeClip key={clip.id} {...sharedProps} onFillShape={onFillShape} />
          if (isGroupClip(clip)) {
            return (
              <GroupClip
                key={clip.id}
                {...sharedProps}
                scene={scene}
                allClips={clips}
              />
            )
          }
          return null
        })}
        {!overlayMode && isMultiTextSelection && onUpdateClipFields && !textEditClipId && (
          <MultiSelectionOverlay
            clips={clips}
            selectedIds={selectedTextIds}
            displayScale={displayScale}
            onUpdateClip={onUpdateClipFields}
            onCommit={onCommitLayerPosition}
            getRotationPivotClient={handleGetRotationPivotClient}
          />
        )}
        {!overlayMode && selectedIds.length >= 2 && onUpdateClipFields && !isMultiTextSelection && (
          <MultiSelectionOverlay
            clips={clips}
            selectedIds={selectedIds}
            displayScale={displayScale}
            onUpdateClip={onUpdateClipFields}
            onCommit={onCommitLayerPosition}
            getRotationPivotClient={handleGetRotationPivotClient}
          />
        )}
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
