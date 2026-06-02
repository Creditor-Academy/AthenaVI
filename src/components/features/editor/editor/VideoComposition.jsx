import React from 'react'
import { useCurrentFrame, spring, interpolate, useVideoConfig, Audio, Video } from 'remotion'
import {
    MdPerson,
    MdAutoAwesome,
    MdPlayCircleFilled,
    MdAddCircleOutline,
    MdPhotoSizeSelectActual,
    MdVideoLibrary
} from 'react-icons/md'
import { getClipTextContent, isTextLayer, parseFontSize, toFontSizeCss } from '../../../../utils/textClip'

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

const VideoComposition = ({ scenes, bgMusic, bgMusicVolume = 0.3, onAddScene }) => {
    const frame = useCurrentFrame()
    const { fps } = useVideoConfig()
    const scenesList = scenes || []

    // BLUEPRINT DASHBOARD (LIGHT THEME)
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
                fontFamily: 'Inter, sans-serif'
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
                    marginBottom: '24px'
                }}>
                    <MdAddCircleOutline size={48} style={{ color: '#dadce0' }} />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 8px 0' }}>Blank Canvas</h2>
                <p style={{ fontSize: '14px', color: '#5f6368', margin: 0 }}>Add a layout to begin your design</p>
                
                <button 
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
                        pointerEvents: 'auto'
                    }}
                >
                    + Add New Scene
                </button>
            </div>
        )
    }

    let totalFramesSoFar = 0
    let currentScene = scenesList[0]
    let frameInScene = frame

    for (let i = 0; i < scenesList.length; i++) {
        const scene = scenesList[i]
        const sceneFrames = Math.max((scene.duration || 8) * 30, 1)
        if (frame < totalFramesSoFar + sceneFrames) {
            currentScene = scene
            frameInScene = frame - totalFramesSoFar
            break
        }
        totalFramesSoFar += sceneFrames
        if (i === scenesList.length - 1) {
            currentScene = scene
            frameInScene = frame - (totalFramesSoFar - sceneFrames)
        }
    }

    const sceneDurationFrames = (currentScene.duration || 8) * 30
    const zoomFactor = interpolate(frameInScene, [0, sceneDurationFrames], [1, 1.05])

    // USER-DRIVEN BACKGROUND (Defaults to Blueprint White if not set)
    let backgroundStyle = {
        position: 'absolute',
        inset: 0,
        backgroundColor: '#ffffff',
        backgroundImage: 'radial-gradient(#e5e7eb 1.5px, transparent 1.5px)',
        backgroundSize: '32px 32px',
        zIndex: 0
    }
    
    if (currentScene.backgroundImage) {
        backgroundStyle = { ...backgroundStyle, backgroundImage: `url(${currentScene.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    } else if (currentScene.background?.value) {
        backgroundStyle = { ...backgroundStyle, background: currentScene.background.value, backgroundImage: 'none' }
    }

    return (
        <div style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            fontFamily: 'Inter, sans-serif'
        }}>
            {bgMusic && <Audio src={bgMusic} volume={bgMusicVolume} placeholder={null} />}

            {/* BACKGROUND LAYER */}
            <div style={backgroundStyle} />

            {/* RENDER CLIPS (NO COLOR - Blueprint Logic) */}
            {(currentScene.clips || []).map((clip, index) => {
                const clipStart = (clip.startTime || 0) * 30
                const clipDuration = ((clip.endTime || 5) - (clip.startTime || 0)) * 30
                if (frameInScene < clipStart || frameInScene >= clipStart + clipDuration) return null

                // Map 1920×1080 pixel layout to composition percentages
                const rect = pixelRectToPercent(clip.position, clip.size);
                
                const animProgress = spring({
                    frame: frameInScene - clipStart,
                    fps,
                    config: { damping: 14, stiffness: 100 }
                })
                const opacity = interpolate(animProgress, [0, 1], [0, 1]);
                const scale = interpolate(animProgress, [0, 1], [0.95, 1]);

                const style = {
                    position: 'absolute',
                    left: rect.left,
                    top: rect.top,
                    width: rect.width,
                    height: rect.height,
                    transform: `rotate(${clip.rotation ?? 0}deg) scale(${scale * zoomFactor * (clip.scale || 1)})`,
                    transformOrigin: 'top left',
                    zIndex: 10 + (clip.layer || index),
                    opacity: opacity * (clip.opacity ?? 1),
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: clip.style?.textAlign === 'left' ? 'flex-start' : (clip.style?.textAlign === 'right' ? 'flex-end' : 'center'),
                    justifyContent: 'center',
                    pointerEvents: 'none'
                }

                if (clip.type === 'text' || isTextLayer(clip)) {
                    return (
                        <div key={clip.id} style={style}>
                            <div style={{
                                fontSize: `${parseFontSize(clip.style?.fontSize, 48)}px`,
                                fontWeight: clip.style?.fontWeight || '700',
                                color: clip.style?.color || '#1a1b1c',
                                textAlign: clip.style?.textAlign || 'center',
                                width: '100%',
                                maxWidth: '100%',
                                border: 'none',
                                background: clip.style?.backgroundColor || 'transparent',
                                padding: clip.style?.padding ? clip.style.padding : '0px',
                                borderRadius: clip.style?.borderRadius ? clip.style.borderRadius : '0px',
                                boxShadow: clip.style?.boxShadow || 'none',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                lineHeight: clip.style?.lineHeight || '1.2',
                                letterSpacing: clip.style?.letterSpacing || 'normal',
                                textTransform: clip.style?.textTransform || 'none',
                                fontStyle: clip.style?.fontStyle || 'normal',
                                textDecoration: clip.style?.textDecoration || 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: clip.style?.textAlign === 'left' ? 'flex-start' : (clip.style?.textAlign === 'right' ? 'flex-end' : 'center'),
                                outline: 'none',
                                fontFamily: clip.style?.fontFamily || 'Inter, system-ui, sans-serif',
                                margin: 0,
                            }}>
                                {getClipTextContent(clip)}
                            </div>
                        </div>
                    )
                }

                if (clip.type === 'image' || clip.type === 'avatar' || clip.type === 'video') {
                    const isGeneratedAvatar = (clip.type === 'avatar' || clip.role === 'avatar') && currentScene.generatedVideoUrl;
                    const src = isGeneratedAvatar ? currentScene.generatedVideoUrl : clip.src;
                    const isVideo = clip.type === 'video' || isGeneratedAvatar;

                    return (
                        <div key={clip.id} style={{
                            ...style,
                            border: 'none',
                            borderRadius: (clip.type === 'avatar' || clip.role === 'avatar') ? '50%' : '16px',
                            background: src ? 'transparent' : 'rgba(0,0,0,0.03)',
                            overflow: 'hidden'
                        }}>
                            {src ? (
                                isVideo ? (
                                    <Video 
                                        src={src} 
                                        style={{ width: '100%', height: '100%', objectFit: clip.role === 'avatar' ? 'contain' : 'cover' }} 
                                    />
                                ) : (
                                    <img src={src} style={{ width: '100%', height: '100%', objectFit: clip.role === 'avatar' ? 'contain' : 'cover' }} alt="" />
                                )
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                    {clip.type === 'avatar' ? (
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
                    return <div key={clip.id} style={{ ...style, border: '1px solid #ccc', background: 'rgba(0,0,0,0.02)' }} />
                }

                return null
            })}
        </div>
    )
}

export default VideoComposition
