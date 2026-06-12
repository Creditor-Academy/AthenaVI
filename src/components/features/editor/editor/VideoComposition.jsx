import React from 'react'
import {
  useCurrentFrame,
  spring,
  interpolate,
  useVideoConfig,
  Audio,
  Video,
  Img,
  OffthreadVideo,
  Sequence,
} from 'remotion'
import {
    MdPerson,
    MdAddCircleOutline,
    MdPhotoSizeSelectActual,
    MdVideoLibrary
} from 'react-icons/md'
import { getClipTextContent, isTextLayer } from '../../../../utils/textClip'
import { pixelRectToPercent, resolveClipRect } from '../../../../utils/clipLayout'
import { getClipZIndex, isBackgroundClip, sortClipsForRender } from '../../../../utils/editorLayerUtils'
import { resolveClipMediaSrc, isVideoMedia, isAvatarClip, clipHasHeygenAudio } from '../../../../utils/heygenVideo'
import { resolveAvatarDisplaySrc } from '../../../../utils/templateAvatarPreview'
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
import {
  getSceneStartFrames,
  resolveSceneLayersAtFrame,
} from '../../../../utils/sceneTransitionRender'
import './TextSidebarPanel.css'

/**
 * Scene-local video synced to the global composition timeline.
 * Sequence `from` must include the scene's global start frame — not just clip offset.
 */
function ClipSequenceVideo({ src, clip, scene, sceneStartFrame, fps, style, audioEnabled = true }) {
  const clipStartSec = clip.startTime || 0
  const clipEndSec = clip.endTime ?? scene.duration ?? 5
  const clipStart = Math.floor(clipStartSec * fps)
  const clipDuration = Math.max(1, Math.floor((clipEndSec - clipStartSec) * fps))
  const globalFrom = sceneStartFrame + clipStart

  const carriesHeygenAudio = clipHasHeygenAudio(clip, scene)
  const useOffthread =
    typeof src === 'string' &&
    /^https?:\/\//i.test(src) &&
    !/\/api\/workspaces\//i.test(src)
  const VideoTag = useOffthread ? OffthreadVideo : Video
  const avatarVolume = carriesHeygenAudio && audioEnabled ? 1 : 0

  return (
    <Sequence from={globalFrom} durationInFrames={clipDuration} layout="none">
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

function SceneFrame({ scene, frameInScene, sceneStartFrame, fps, audioEnabled = true }) {
  const backgroundStyle = getSceneBackgroundStyle(scene)
  const hasBgClip = (scene.clips || []).some((c) => isBackgroundClip(c) && resolveClipMediaSrc(c, scene))

  const heygenAudioClipId = React.useMemo(() => {
    if (!audioEnabled) return null
    const clips = scene.clips || []
    const avatar = clips.find((c) => isAvatarClip(c) && clipHasHeygenAudio(c, scene))
    if (avatar) return avatar.id
    const bg = clips.find((c) => isBackgroundClip(c) && clipHasHeygenAudio(c, scene))
    if (bg) return bg.id
    return clips.find((c) => clipHasHeygenAudio(c, scene))?.id ?? null
  }, [scene, audioEnabled])

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
          const bgObjectFit = clip.style?.objectFit || 'cover'
          return (
            <div
              key={clip.id}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                overflow: 'hidden',
                pointerEvents: 'none',
                opacity: clip.opacity ?? 1,
              }}
            >
              {src ? (
                isVideo ? (
                  <ClipSequenceVideo
                    src={src}
                    clip={clip}
                    scene={scene}
                    sceneStartFrame={sceneStartFrame}
                    fps={fps}
                    audioEnabled={audioEnabled && heygenAudioClipId === clip.id}
                    style={{ width: '100%', height: '100%', objectFit: bgObjectFit }}
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
        const layout = resolveClipRect(clip)
        const rect = pixelRectToPercent(layout.position, layout.size)
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
          overflow: isText ? 'hidden' : undefined,
          boxSizing: 'border-box',
        }

        if (isText) {
          const s = clip.style || {}
          const resolvedFontSize = layout.fontSize
          const textStyle = buildTextDisplayStyle(s, clip.opacity ?? 1)
          const shapeWrap = getTextShapeWrapperStyle(s.textShape)
          const shapeInner = getTextShapeInnerStyle(s.textShape)
          const entranceType = getEntranceAnimation(clip)?.type
          const isBlockAnim = entranceType === 'block'
          const hasFill =
            !!(s.backgroundColor && s.backgroundColor !== 'transparent') ||
            !!(s.boxShadow && s.boxShadow !== 'none')
          const textInner = (
            <div style={{
              ...textStyle,
              fontSize: `${resolvedFontSize}px`,
              width: '100%',
              maxWidth: '100%',
              overflow: 'hidden',
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
            <div key={clip.id} style={{
              ...style,
              borderRadius: hasFill ? (s.borderRadius || '12px') : style.borderRadius,
              backgroundColor: hasFill ? (s.backgroundColor || 'transparent') : undefined,
              boxShadow: hasFill ? (s.boxShadow || 'none') : undefined,
            }}>
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
          const isAvatar = isAvatarClip(clip)
          const playbackSrc = resolveClipMediaSrc(clip, scene)
          const src = isAvatar ? (playbackSrc || resolveAvatarDisplaySrc(clip, scene)) : playbackSrc
          const isVideo = isVideoMedia(clip, playbackSrc)
          const isBg = isBackgroundClip(clip)
          const w = typeof clip.size?.width === 'number' ? clip.size.width : 0
          const h = typeof clip.size?.height === 'number' ? clip.size.height : 0
          const avatarRound = isAvatar && !isVideo && !isBg && w > 0 && h > 0 && Math.abs(w - h) < 40
          const isIcon = clip.role === 'icon'
          const borderRadius = isBg ? '0' : (clip.style?.borderRadius || (isAvatar ? '50%' : '16px'))
          const objectFit =
            clip.style?.objectFit || clip.objectFit || (isAvatar || isIcon ? 'contain' : 'cover')

          return (
            <div key={clip.id} style={{
              ...style,
              border: clip.style?.border || 'none',
              borderRadius: avatarRound ? '50%' : borderRadius,
              background: src ? 'transparent' : 'rgba(0,0,0,0.03)',
              overflow: 'hidden',
              clipPath: clip.style?.clipPath,
              boxShadow: clip.style?.boxShadow || 'none',
            }}>
              {src ? (
                isVideo ? (
                  <ClipSequenceVideo
                    src={src}
                    clip={clip}
                    scene={scene}
                    sceneStartFrame={sceneStartFrame}
                    fps={fps}
                    audioEnabled={audioEnabled && heygenAudioClipId === clip.id}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit,
                    }}
                  />
                ) : (
                  <img
                    src={src}
                    style={{ width: '100%', height: '100%', objectFit }}
                    alt=""
                  />
                )
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  {isAvatar ? (
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
          const hasFill = !!clip.fillSrc
          return (
            <div
              key={clip.id}
              style={{
                ...style,
                overflow: 'hidden',
                border: shapeStyle.border || 'none',
                borderRadius: shapeStyle.borderRadius || '0',
                background: hasFill
                  ? 'transparent'
                  : (shapeStyle.background || shapeStyle.backgroundColor || 'rgba(99, 102, 241, 0.85)'),
                clipPath: shapeStyle.clipPath,
                boxShadow: shapeStyle.boxShadow || 'none',
              }}
            >
              {hasFill && (
                <Img
                  src={clip.fillSrc}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: clip.fillObjectFit || 'cover',
                    display: 'block',
                  }}
                />
              )}
            </div>
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
    const sceneStartFrames = React.useMemo(
      () => getSceneStartFrames(scenes || [], fps),
      [scenes, fps]
    )

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

            {layers.map((layer, index) => {
              const sceneKey = layer.scene.id || layer.scene.sceneId
              const sceneStartFrame = sceneStartFrames.get(sceneKey) ?? 0
              return (
                <div
                  key={`${sceneKey || index}-${index}`}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    overflow: 'hidden',
                  opacity: layer.opacity,
                  transform: `translate(${layer.translateX}px, ${layer.translateY}px) scale(${layer.scale})`,
                  filter: layer.filter,
                  clipPath: layer.clipPath,
                  zIndex: index,
                  }}
                >
                  <SceneFrame
                    scene={layer.scene}
                    frameInScene={layer.frameInScene}
                    sceneStartFrame={sceneStartFrame}
                    fps={fps}
                    audioEnabled={index === layers.length - 1}
                  />
                </div>
              )
            })}
        </div>
    )
}

export default VideoComposition
