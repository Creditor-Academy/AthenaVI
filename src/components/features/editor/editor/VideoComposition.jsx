import React from 'react'
import {
  useCurrentFrame,
  spring,
  interpolate,
  useVideoConfig,
  Audio,
  Video,
  OffthreadVideo,
  Sequence,
  Freeze,
} from 'remotion'
import {
    MdPerson,
    MdAddCircleOutline,
    MdPhotoSizeSelectActual,
    MdVideoLibrary
} from 'react-icons/md'
import { getClipTextContent, isTextLayer, resolveTextClipRect } from '../../../../utils/textClip'
import { getClipZIndex, isBackgroundClip, sortClipsForRender } from '../../../../utils/editorLayerUtils'
import { resolveClipMediaSrc, isVideoMedia, isAvatarClip } from '../../../../utils/heygenVideo'
import {
  computeClipAnimationState,
  getAnimatedTextContent,
  getEntranceAnimation,
} from '../../../../utils/clipAnimations'
import {
  buildTextDisplayStyle,
  getTextShapeWrapperStyle,
  getTextShapeInnerStyle,
} from '../../../../utils/textEffects'
import { resolveSceneLayersAtFrame } from '../../../../utils/sceneTransitionRender'
import './TextSidebarPanel.css'

export const COMPOSITION_W = 1920
export const COMPOSITION_H = 1080

/** Map editor pixel coords (1920×1080) to % for Remotion composition */
export function pixelRectToPercent(position = {}, size = {}) {
  const x = Number(position.x ?? 0)
  const y = Number(position.y ?? 0)
  const width = size.width ?? 'auto'
  const height = size.height ?? 'auto'

  return {
    left: `${(x / COMPOSITION_W) * 100}%`,
    top: `${(y / COMPOSITION_H) * 100}%`,
    width: typeof width === 'number' ? `${(width / COMPOSITION_W) * 100}%` : width,
    height: typeof height === 'number' ? `${(height / COMPOSITION_H) * 100}%` : height,
  };
}

/** Scene-local video synced to timeline (HeyGen avatar + clip timing). */
function ClipSequenceVideo({ src, clip, scene, frameInScene, fps, style }) {
  const clipStartSec = clip.startTime || 0
  const clipEndSec = clip.endTime ?? scene.duration ?? 5
  const clipStart = Math.floor(clipStartSec * fps)
  const clipDuration = Math.max(1, Math.floor((clipEndSec - clipStartSec) * fps))

  if (frameInScene < clipStart || frameInScene >= clipStart + clipDuration) {
    return null
  }

  const useOffthread =
    typeof src === 'string' &&
    /^https?:\/\//i.test(src) &&
    !/\/api\/workspaces\//i.test(src)
  const VideoTag = useOffthread ? OffthreadVideo : Video
  const isAvatar = isAvatarClip(clip)

  return (
    <Sequence from={clipStart} durationInFrames={clipDuration} layout="none">
      <VideoTag
        src={src}
        style={style}
        volume={isAvatar ? 1 : 0}
        muted={!isAvatar}
      />
    </Sequence>
  )
}

function getSceneBackgroundStyle(scene) {
  const bg = scene?.background?.value
  const bgImage = scene?.backgroundImage

  if (bgImage) {
    return {
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      backgroundColor: '#f8fafc',
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }

  if (bg) {
    const value = String(bg)
    const isGradient = value.includes('gradient(')
    return {
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      backgroundColor: isGradient ? '#f8fafc' : value,
      backgroundImage: isGradient ? value : 'none',
      backgroundSize: isGradient ? 'cover' : '28px 28px',
      backgroundPosition: 'center',
    }
  }

  return {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    backgroundColor: '#f8fafc',
    backgroundImage: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px)',
    backgroundSize: '28px 28px',
    backgroundPosition: 'center',
  }
}

function SceneFrame({ scene, fps }) {
  const frameInScene = useCurrentFrame()
  const backgroundStyle = getSceneBackgroundStyle(scene)
  const hasBgClip = (scene.clips || []).some((c) => isBackgroundClip(c) && resolveClipMediaSrc(c, scene))

  return (
    <>
      {!hasBgClip && <div style={backgroundStyle} />}
      {sortClipsForRender(scene.clips || []).map((clip) => {
        const clipStart = (clip.startTime || 0) * fps
        const clipDuration = ((clip.endTime || scene.duration || 5) - (clip.startTime || 0)) * fps
        if (frameInScene < clipStart || frameInScene >= clipStart + clipDuration) return null

        if (isBackgroundClip(clip)) {
          const src = resolveClipMediaSrc(clip, scene)
          const isVideo = isVideoMedia(clip, src)
          return (
            <div
              key={clip.id}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                overflow: 'hidden',
                pointerEvents: 'none',
              }}
            >
              {src ? (
                isVideo ? (
                  <ClipSequenceVideo
                    src={src}
                    clip={clip}
                    scene={scene}
                    frameInScene={frameInScene}
                    fps={fps}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <img
                    src={src}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                )
              ) : null}
            </div>
          )
        }

        const frameInClip = frameInScene - clipStart
        const hasCustomAnim = !!getEntranceAnimation(clip)
        const animState = hasCustomAnim
          ? computeClipAnimationState(frameInClip, fps, clip)
          : null

        let opacity
        let scale
        let translateX = 0
        let translateY = 0
        let blurPx = 0
        const animRotation = animState?.rotation ?? 0

        const startsAtSceneOpen = (clip.startTime || 0) < 0.02

        if (animState) {
          if (!animState.visible) return null
          opacity = animState.opacity
          scale = animState.scale
          translateX = animState.translateX
          translateY = animState.translateY
          blurPx = animState.blur
        } else if (startsAtSceneOpen) {
          opacity = clip.opacity ?? 1
          scale = clip.scale ?? 1
        } else {
          const animProgress = spring({
            frame: frameInClip,
            fps,
            config: { damping: 14, stiffness: 100 },
          })
          opacity = interpolate(animProgress, [0, 1], [0, 1]) * (clip.opacity ?? 1)
          scale = interpolate(animProgress, [0, 1], [0.95, 1])
        }

        const isText = clip.type === 'text' || isTextLayer(clip)
        const textLayout = isText ? resolveTextClipRect(clip) : null
        const pos = textLayout?.position ?? clip.position ?? { x: 0, y: 0 }
        const size = textLayout?.size ?? clip.size ?? { width: 400, height: 400 }
        const rect = pixelRectToPercent(pos, size)
        const clipScale = scale * (clip.scale || 1)
        const style = {
          position: 'absolute',
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          transform: `translate(${translateX}px, ${translateY}px) rotate(${(clip.rotation ?? 0) + animRotation}deg) scale(${clipScale})`,
          transformOrigin: 'top left',
          zIndex: getClipZIndex(clip, false),
          opacity,
          filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
          display: 'flex',
          flexDirection: 'column',
          alignItems: clip.style?.textAlign === 'left' ? 'flex-start' : (clip.style?.textAlign === 'right' ? 'flex-end' : 'center'),
          justifyContent: 'center',
          pointerEvents: 'none',
          overflow: isText ? 'hidden' : undefined,
          boxSizing: 'border-box',
        }

        if (isText) {
          const { fontSize: resolvedFontSize } = textLayout
          const textStyle = buildTextDisplayStyle(clip.style || {}, clip.opacity ?? 1)
          const shapeWrap = getTextShapeWrapperStyle(clip.style?.textShape)
          const shapeInner = getTextShapeInnerStyle(clip.style?.textShape)
          const entranceType = getEntranceAnimation(clip)?.type
          const isBlockAnim = entranceType === 'block'
          const textInner = (
            <div style={{
              ...textStyle,
              fontSize: `${resolvedFontSize}px`,
              width: '100%',
              maxWidth: '100%',
              height: '100%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: clip.style?.textAlign === 'left' ? 'flex-start' : (clip.style?.textAlign === 'right' ? 'flex-end' : 'center'),
              outline: 'none',
              margin: 0,
              position: 'relative',
              zIndex: 1,
              boxSizing: 'border-box',
              ...shapeInner,
            }}>
              {getAnimatedTextContent(clip, animState?.typewriterChars ?? null, getClipTextContent)}
            </div>
          )
          return (
            <div key={clip.id} style={style}>
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...shapeWrap }}>
                {isBlockAnim ? (
                  <div
                    className="text-live-block-wrap"
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      ['--block-reveal']: animState?.blockReveal ?? 1,
                    }}
                  >
                    {textInner}
                  </div>
                ) : textInner}
              </div>
            </div>
          )
        }

        if (clip.type === 'image' || clip.type === 'avatar' || clip.type === 'video') {
          const src = resolveClipMediaSrc(clip, scene)
          const isVideo = isVideoMedia(clip, src)
          const w = typeof clip.size?.width === 'number' ? clip.size.width : 0
          const h = typeof clip.size?.height === 'number' ? clip.size.height : 0
          const avatarRound =
            isAvatarClip(clip) && !isVideo && w > 0 && h > 0 && Math.abs(w - h) < 40

          return (
            <div key={clip.id} style={{
              ...style,
              border: 'none',
              borderRadius: avatarRound ? '50%' : isAvatarClip(clip) ? '12px' : '16px',
              background: src ? 'transparent' : 'rgba(0,0,0,0.03)',
              overflow: 'hidden',
            }}>
              {src ? (
                isVideo ? (
                  <ClipSequenceVideo
                    src={src}
                    clip={clip}
                    scene={scene}
                    frameInScene={frameInScene}
                    fps={fps}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: clip.objectFit || (clip.role === 'avatar' ? 'contain' : 'cover'),
                    }}
                  />
                ) : (
                  <img src={src} style={{ width: '100%', height: '100%', objectFit: clip.role === 'avatar' ? 'contain' : 'cover' }} alt="" />
                )
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  {isAvatarClip(clip) ? (
                    <MdPerson size={Math.min(64, (clip.size?.width || 128) / 2)} color="rgba(0,0,0,0.1)" />
                  ) : clip.type === 'video' ? (
                    <MdVideoLibrary size={Math.min(64, (clip.size?.width || 128) / 2)} color="rgba(0,0,0,0.1)" />
                  ) : (
                    <MdPhotoSizeSelectActual size={Math.min(64, (clip.size?.width || 128) / 2)} color="rgba(0,0,0,0.1)" />
                  )}
                </div>
              )}
            </div>
          )
        }

        if (clip.type === 'shape') {
          const shapeStyle = clip.style || {}
          return (
            <div
              key={clip.id}
              style={{
                ...style,
                border: shapeStyle.border || 'none',
                borderRadius: shapeStyle.borderRadius || '0',
                background: shapeStyle.background || shapeStyle.backgroundColor || 'rgba(99, 102, 241, 0.85)',
                clipPath: shapeStyle.clipPath,
                boxShadow: shapeStyle.boxShadow || 'none',
              }}
            />
          )
        }

        return null
      })}
    </>
  )
}

const VideoComposition = ({ scenes, bgMusic, bgMusicVolume = 0.3, onAddScene }) => {
    const frame = useCurrentFrame()
    const { fps } = useVideoConfig()
    const scenesList = scenes || []

    if (!scenesList || scenesList.length === 0) {
        return (
            <div style={{
                flex: 1,
                backgroundColor: '#ffffff',
                backgroundImage: 'radial-gradient(#e5e7eb 1.5px, transparent 1.5px)',
                backgroundSize: '32px 32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3c4043',
                fontFamily: 'Inter, sans-serif',
            }}>
                <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '30px',
                    background: '#ffffff',
                    border: '2px dashed #dadce0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px',
                }}>
                    <MdAddCircleOutline size={48} style={{ color: '#dadce0' }} />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 8px 0' }}>Blank Canvas</h2>
                <p style={{ fontSize: '14px', color: '#5f6368', margin: 0 }}>Add a layout to begin your design</p>
                <button
                    type="button"
                    onClick={() => onAddScene?.()}
                    style={{
                        marginTop: '32px',
                        padding: '10px 24px',
                        background: '#1a73e8',
                        color: '#ffffff',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '14px',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(26, 115, 232, 0.2)',
                        pointerEvents: 'auto',
                    }}
                >
                    + Add New Scene
                </button>
            </div>
        )
    }

    const layers = resolveSceneLayersAtFrame(scenesList, frame, fps)

    return (
        <div style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            fontFamily: 'Inter, sans-serif',
        }}>
            {bgMusic && <Audio src={bgMusic} volume={bgMusicVolume} placeholder={null} />}

            {layers.map((layer, index) => (
              <div
                key={`${layer.scene.id || index}-${index}`}
                style={{
                  position: 'absolute',
                  inset: 0,
                  overflow: 'hidden',
                  opacity: layer.opacity,
                  transform: `translate(${layer.translateX}px, ${layer.translateY}px) scale(${layer.scale})`,
                  filter: layer.filter,
                  zIndex: index,
                }}
              >
                <Freeze frame={layer.frameInScene}>
                  <SceneFrame scene={layer.scene} fps={fps} />
                </Freeze>
              </div>
            ))}
        </div>
    )
}

export default VideoComposition
