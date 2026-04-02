import React from 'react'
import { useCurrentFrame, spring, interpolate, useVideoConfig, Audio } from 'remotion'
import {
    MdPerson,
    MdAutoAwesome,
    MdPlayCircleFilled,
    MdAddCircleOutline,
    MdPhotoSizeSelectActual
} from 'react-icons/md'

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

                // MAPPING COORDINATES
                const mapValX = (val) => (typeof val === 'number' && val > 100) ? (val / 1280) * 100 : (val || 0);
                const mapValY = (val) => (typeof val === 'number' && val > 100) ? (val / 720) * 100 : (val || 0);
                
                const posX = mapValX(clip.position?.x);
                const posY = mapValY(clip.position?.y);
                
                const getW = (w) => (typeof w === 'number' && w > 100) ? `${(w / 12.8)}%` : (typeof w === 'number' ? `${w}%` : (w || 'auto'));
                const getH = (h) => (typeof h === 'number' && h > 100) ? `${(h / 7.2)}%` : (typeof h === 'number' ? `${h}%` : (h || 'auto'));

                const animProgress = spring({
                    frame: frameInScene - clipStart,
                    fps,
                    config: { damping: 14, stiffness: 100 }
                })
                const opacity = interpolate(animProgress, [0, 1], [0, 1]);
                const scale = interpolate(animProgress, [0, 1], [0.95, 1]);

                const style = {
                    position: 'absolute',
                    left: `${posX}%`,
                    top: `${posY}%`,
                    width: getW(clip.size?.width),
                    height: getH(clip.size?.height),
                    transform: `scale(${scale * zoomFactor * (clip.scale || 1)})`,
                    zIndex: 10 + (clip.layer || index),
                    opacity: opacity * (clip.opacity ?? 1),
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none'
                }

                if (clip.type === 'text') {
                    return (
                        <div key={clip.id} style={style}>
                            <div style={{
                                fontSize: `${clip.style?.fontSize || 48}px`,
                                fontWeight: clip.style?.fontWeight || '700',
                                color: (clip.style?.color && clip.style.color !== '#ffffff') ? clip.style.color : '#1a1b1c',
                                textAlign: clip.style?.textAlign || 'center',
                                width: clip.style?.width || 'auto',
                                border: '1px dashed #ced4da',
                                background: 'rgba(255,255,255,0.8)',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                whiteSpace: 'pre-wrap',
                                lineHeight: '1.2'
                            }}>
                                {clip.content}
                            </div>
                        </div>
                    )
                }

                if (clip.type === 'image' || clip.type === 'avatar') {
                    return (
                        <div key={clip.id} style={{
                            ...style,
                            border: '2px dashed #adb5bd',
                            borderRadius: '16px',
                            background: '#f8f9fa',
                            overflow: 'hidden'
                        }}>
                            {clip.src ? (
                                <img src={clip.src} style={{ width: '100%', height: '100%', objectFit: clip.type === 'avatar' ? 'contain' : 'cover' }} alt="" />
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                    {clip.type === 'avatar' ? (
                                        <MdPerson size={48} color="#adb5bd" style={{ opacity: 0.5 }} />
                                    ) : (
                                        <MdPhotoSizeSelectActual size={48} color="#adb5bd" style={{ opacity: 0.5 }} />
                                    )}
                                    <span style={{ fontSize: '11px', color: '#adb5bd', marginTop: '12px', fontWeight: '800', letterSpacing: '0.1em' }}>
                                        {clip.type.toUpperCase()} PLACEHOLDER
                                    </span>
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
