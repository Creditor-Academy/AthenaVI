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
} from 'remotion'
import {
    MdPerson,
    MdAddCircleOutline,
    MdPhotoSizeSelectActual,
    MdVideoLibrary
} from 'react-icons/md'
import { getClipTextContent, isTextLayer, parseFontSize } from '../../../../utils/textClip'
import { getClipZIndex, sortClipsForRender } from '../../../../utils/editorLayerUtils'
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
function ClipSequenceVideo({ src, clip, scene, frameInScene, fps, style, audioEnabled = true }) {
  const clipStartSec = clip.startTime || 0
  const clipEndSec = clip.endTime ?? scene.duration ?? 5
  const clipStart = Math.floor(clipStartSec * fps)
  const clipDuration = Math.max(1, Math.floor((clipEndSec - clipStartSec) * fps))

  if (frameInScene < clipStart || frameInScene >= clipStart + clipDuration) {
    return null
  }

  const isAvatar = isAvatarClip(clip)
  const useOffthread =
    typeof src === 'string' &&
    /^https?:\/\//i.test(src) &&
    !/\/api\/workspaces\//i.test(src)
  const VideoTag = useOffthread ? OffthreadVideo : Video
  const avatarVolume = isAvatar && audioEnabled ? 1 : 0

  return (
    <Sequence from={clipStart} durationInFrames={clipDuration} layout="none">
      <VideoTag
        src={src}
        style={style}
        volume={avatarVolume}
        muted={avatarVolume === 0}
      />
    </Sequence>
  )
}

function getSceneBackgroundStyle(scene) {
  let backgroundStyle = {
    position: 'absolute',
    inset: 0,
    backgroundColor: '#ffffff',
    backgroundImage: 'radial-gradient(#e5e7eb 1.5px, transparent 1.5px)',
    backgroundSize: '32px 32px',
    zIndex: 0,
  }

  if (scene.backgroundImage) {
    backgroundStyle = {
      ...backgroundStyle,
      backgroundImage: `url(${scene.backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  } else if (scene.background?.value) {
    const value = String(scene.background.value)
    const isGradient = value.includes('gradient(')
    backgroundStyle = {
      ...backgroundStyle,
      backgroundColor: isGradient ? '#ffffff' : value,
      backgroundImage: isGradient ? value : 'none',
      backgroundSize: isGradient ? 'cover' : backgroundStyle.backgroundSize,
      backgroundPosition: isGradient ? 'center' : backgroundStyle.backgroundPosition,
    }
  }

  return backgroundStyle
}

function SceneFrame({ scene, frameInScene, fps, audioEnabled = true }) {
  const backgroundStyle = getSceneBackgroundStyle(scene)

  return (
    <>
      <div style={backgroundStyle} />
      {sortClipsForRender(scene.clips || []).map((clip) => {
        const clipStart = (clip.startTime || 0) * fps
        const clipDuration = ((clip.endTime || scene.duration || 5) - (clip.startTime || 0)) * fps
        if (frameInScene < clipStart || frameInScene >= clipStart + clipDuration) return null

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

        if (animState) {
          if (!animState.visible) return null
          opacity = animState.opacity
          scale = animState.scale
          translateX = animState.translateX
          translateY = animState.translateY
          blurPx = animState.blur
        } else {
          const animProgress = spring({
            frame: frameInClip,
            fps,
            config: { damping: 14, stiffness: 100 },
          })
          opacity = interpolate(animProgress, [0, 1], [0, 1]) * (clip.opacity ?? 1)
          scale = interpolate(animProgress, [0, 1], [0.95, 1])
        }

        const rect = pixelRectToPercent(clip.position, clip.size)
        const style = {
          position: 'absolute',
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          transform: `translate(${translateX}px, ${translateY}px) rotate(${(clip.rotation ?? 0) + animRotation}deg) scale(${scale * (clip.scale || 1)})`,
          transformOrigin: 'top left',
          zIndex: getClipZIndex(clip, false),
          opacity,
          filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
          display: 'flex',
          flexDirection: 'column',
          alignItems: clip.style?.textAlign === 'left' ? 'flex-start' : (clip.style?.textAlign === 'right' ? 'flex-end' : 'center'),
          justifyContent: 'center',
          pointerEvents: 'none',
        }

        if (clip.type === 'text' || isTextLayer(clip)) {
          const textStyle = buildTextDisplayStyle(clip.style || {}, clip.opacity ?? 1)
          const shapeWrap = getTextShapeWrapperStyle(clip.style?.textShape)
          const shapeInner = getTextShapeInnerStyle(clip.style?.textShape)
          const entranceType = getEntranceAnimation(clip)?.type
          const isBlockAnim = entranceType === 'block'
          const textInner = (
            <div style={{
              ...textStyle,
              fontSize: `${parseFontSize(clip.style?.fontSize, 48)}px`,
              width: '100%',
              maxWidth: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: clip.style?.textAlign === 'left' ? 'flex-start' : (clip.style?.textAlign === 'right' ? 'flex-end' : 'center'),
              outline: 'none',
              margin: 0,
              position: 'relative',
              zIndex: 1,
              ...shapeInner,
            }}>
              {getAnimatedTextContent(clip, animState?.typewriterChars ?? null, getClipTextContent)}
            </div>
          )
          return (
            <div key={clip.id} style={style}>
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', ...shapeWrap }}>
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

          return (
            <div key={clip.id} style={{
              ...style,
              border: 'none',
              borderRadius: isAvatarClip(clip) ? '50%' : '16px',
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
                    audioEnabled={audioEnabled}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: clip.style?.objectFit || clip.objectFit || (clip.role === 'avatar' ? 'contain' : 'cover'),
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
                <SceneFrame
                  scene={layer.scene}
                  frameInScene={layer.frameInScene}
                  fps={fps}
                  audioEnabled={index === layers.length - 1}
                />
              </div>
            ))}
        </div>
    )
}

export default VideoComposition
