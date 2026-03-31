import React from 'react'
import { useCurrentFrame, spring, interpolate, useVideoConfig, Audio } from 'remotion'
import {
    MdPerson,
    MdCheckCircle,
    MdCompareArrows,
    MdAutoAwesome,
} from 'react-icons/md'

const VideoComposition = ({ scenes, bgMusic, bgMusicVolume = 0.3 }) => {
    const frame = useCurrentFrame()
    const { fps } = useVideoConfig()
    const scenesList = scenes || []

    if (scenesList.length === 0) {
        return (
            <div style={{ 
                flex: 1, 
                backgroundColor: '#f8f9fa', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#9ba1a6',
                fontFamily: 'Inter, sans-serif'
            }}>
                <div style={{ 
                    width: '120px', 
                    height: '120px', 
                    backgroundColor: '#ffffff', 
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.03)'
                }}>
                    <MdAutoAwesome size={48} style={{ color: '#dadce0' }} />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#3c4043', margin: '0 0 8px 0' }}>Empty Canvas</h2>
                <p style={{ fontSize: '14px', margin: 0, opacity: 0.8 }}>Add a template or asset to start creating</p>
            </div>
        )
    }

    // Find current scene
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
    const transitionType = currentScene.transition || 'fade'
    const transitionFrames = 15

    // Determine scene index for transition logic
    let sceneIndex = 0
    let _frameCtr = 0
    for (let si = 0; si < scenesList.length; si++) {
        const sf = Math.max((scenesList[si].duration || 8) * 30, 1)
        if (frame < _frameCtr + sf) { sceneIndex = si; break }
        _frameCtr += sf
    }

    // Scene container is ALWAYS fully visible — no screen-level opacity fade
    // This ensures content is visible at time 0 and when scrubbing
    let containerOpacity = 1
    let xOffset = 0
    let containerScale = 1
    let blur = 0

    // Only apply scene-level entrance transitions for scenes AFTER the first one (during playback)
    if (sceneIndex > 0 && frameInScene < transitionFrames) {
        const progress = frameInScene / transitionFrames
        if (transitionType === 'fade') {
            containerOpacity = Math.max(0.3, progress)
        } else if (transitionType === 'slide') {
            xOffset = (1 - progress) * 60
        } else if (transitionType === 'zoom') {
            containerScale = 0.9 + progress * 0.1
        } else if (transitionType === 'blur') {
            blur = (1 - progress) * 6
        }
    }
    // Exit transition — subtle for scene-to-scene crossfade
    if (sceneIndex < scenesList.length - 1 && frameInScene > sceneDurationFrames - transitionFrames) {
        const progress = (sceneDurationFrames - frameInScene) / transitionFrames
        if (transitionType === 'fade') {
            containerOpacity = Math.max(0.3, progress)
        } else if (transitionType === 'slide') {
            xOffset = (progress - 1) * 60
        } else if (transitionType === 'zoom') {
            containerScale = 1 + (1 - progress) * 0.1
        } else if (transitionType === 'blur') {
            blur = (1 - progress) * 6
        }
    }

    // Element-level spring animations (staggered entrance per element)
    // Remapped so content is ALWAYS visible (starts at 0.9+) with subtle polish animation
    const rawEntrance = spring({
        frame: frameInScene,
        fps,
        config: { damping: 14, stiffness: 100 }
    })
    const entrance = interpolate(rawEntrance, [0, 1], [0.92, 1])

    const rawTitleEntrance = spring({
        frame: Math.max(0, frameInScene - 3),
        fps,
        config: { damping: 12 }
    })
    const titleEntrance = interpolate(rawTitleEntrance, [0, 1], [0.88, 1])

    const rawSubtitleEntrance = spring({
        frame: Math.max(0, frameInScene - 6),
        fps,
        config: { damping: 12 }
    })
    const subtitleEntrance = interpolate(rawSubtitleEntrance, [0, 1], [0.85, 1])

    const zoomFactor = interpolate(
        frameInScene,
        [0, sceneDurationFrames],
        [1, 1.05]
    )

    const titleStyle = {
        fontSize: 64,
        color: '#000000',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '700',
        textAlign: 'left',
        ...(currentScene.titleStyle || {})
    }

    const subtitleStyle = {
        fontSize: 32,
        color: '#333333',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '400',
        textAlign: 'left',
        ...(currentScene.subtitleStyle || {})
    }

    const fullWidthLayouts = ['quote']
    const isFullWidth = fullWidthLayouts.includes(currentScene.layout)

    return (
        <div style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            opacity: containerOpacity,
            backgroundColor: currentScene.backgroundColor || '#ffffff',
            transform: `translateX(${xOffset}px) scale(${containerScale})`,
            filter: blur > 0 ? `blur(${blur}px)` : 'none'
        }}>
            {/* AUDIO: Background Music */}
            {bgMusic && (
                <Audio
                    src={bgMusic}
                    volume={bgMusicVolume}
                    placeholder={null}
                />
            )}

            {/* BASE LAYER: Background Image/Video (Full Screen) */}
            {currentScene.backgroundImage && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 1
                }}>
                    <img
                        src={currentScene.backgroundImage}
                        alt="Background"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transform: `scale(${zoomFactor})`
                        }}
                    />
                </div>
            )}

            {/* LAYER 1: Additional B-roll/Overlay/Text Layers from Media Library */}
            {(currentScene.layers || []).map(layer => {
                const layerStart = (layer.start || 0) * 30
                const layerDuration = (layer.duration || currentScene.duration) * 30
                if (frameInScene < layerStart || frameInScene >= layerStart + layerDuration) return null

                return (
                    <div key={layer.id} style={{
                        position: 'absolute',
                        left: `${layer.x !== undefined ? layer.x : 0}%`,
                        top: `${layer.y !== undefined ? layer.y : 0}%`,
                        width: `${layer.width || (layer.type === 'text' ? 'auto' : '100%')}`,
                        height: `${layer.height || (layer.type === 'text' ? 'auto' : '100%')}`,
                        transform: `scale(${zoomFactor * (layer.scale || 1)})`,
                        zIndex: 5,
                        pointerEvents: 'none',
                        opacity: layer.opacity !== undefined ? layer.opacity : 1,
                        filter: `blur(${layer.blur || 0}px) brightness(${layer.brightness !== undefined ? layer.brightness : 1}) contrast(${layer.contrast !== undefined ? layer.contrast : 1}) saturate(${layer.saturation !== undefined ? layer.saturation : 1})`
                    }}>
                        {layer.type === 'image' && <img src={layer.content} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        {layer.type === 'video' && <video src={layer.content} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay muted loop />}
                        {layer.type === 'text' && (
                            <div style={{
                                fontSize: '48px',
                                fontWeight: '700',
                                color: layer.color || '#ffffff',
                                fontFamily: layer.fontFamily || 'Inter',
                                textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                            }}>
                                {layer.content}
                            </div>
                        )}
                    </div>
                )
            })}

            {/* OVERLAY LAYER: Text and Avatar Content */}
            <div style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 100,
                padding: '0 80px'
            }}>
                <div style={{
                    width: '100%',
                    height: '100%',
                    maxWidth: '1200px',
                    display: 'flex',
                    flexDirection: isFullWidth ? 'column-reverse' : (currentScene.layout === 'split-left' ? 'row-reverse' : 'row'),
                    alignItems: 'center',
                    justifyContent: isFullWidth ? 'center' : 'space-between',
                    gap: isFullWidth ? '30px' : '60px',
                    position: 'relative',
                    transform: `translateY(${(1 - entrance) * 30}px) scale(${interpolate(entrance, [0, 1], [0.95, 1])})`,
                    opacity: entrance,
                    textAlign: currentScene.layout === 'centered' || currentScene.layout === 'quote' ? 'center' : 'left'
                }}>
                    {/* Main Content Area */}
                    <div style={{
                        flex: '1',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: isFullWidth ? 'center' : (currentScene.layout === 'centered' ? 'center' : (currentScene.layout === 'split-left' ? 'flex-end' : 'flex-start')),
                        gap: '24px',
                        maxWidth: isFullWidth ? '1000px' : '650px',
                        textAlign: (isFullWidth || titleStyle.textAlign === 'center') ? 'center' : (currentScene.layout === 'split-left' ? 'right' : 'left')
                    }}>
                        {/* Title */}
                        <h1 style={{
                            fontSize: `${currentScene.layout === 'quote' ? 80 : (titleStyle.fontSize || 64)}px`,
                            fontWeight: titleStyle.fontWeight || '700',
                            margin: '0',
                            lineHeight: '1.2',
                            color: titleStyle.color || '#000000',
                            fontFamily: titleStyle.fontFamily || 'inherit',
                            transform: `translateY(${(1 - titleEntrance) * 20}px)`,
                            opacity: titleEntrance,
                            textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                            fontStyle: currentScene.layout === 'quote' ? 'italic' : 'normal'
                        }}>
                            {currentScene?.titleText || 'Insert your video title here'}
                        </h1>

                        {/* Subtitle / Author */}
                        <h2 style={{
                            fontSize: `${subtitleStyle.fontSize || 32}px`,
                            fontWeight: subtitleStyle.fontWeight || '400',
                            margin: '0',
                            lineHeight: '1.4',
                            color: subtitleStyle.color || '#333333',
                            fontFamily: subtitleStyle.fontFamily || 'inherit',
                            transform: `translateY(${(1 - subtitleEntrance) * 15}px)`,
                            opacity: subtitleEntrance,
                            textShadow: '0 1px 5px rgba(0,0,0,0.05)'
                        }}>
                            {currentScene.layout === 'quote' && '— '}{currentScene?.subtitleText || 'Add sub-headline here'}
                        </h2>

                        {/* Layout Specific Content: Bullets */}
                        {currentScene.layout === 'bullets' && (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                                marginTop: '12px',
                                width: '100%',
                                alignItems: titleStyle.textAlign === 'center' ? 'center' : 'flex-start'
                            }}>
                                {[1, 2, 3].map(i => currentScene[`bullet${i}`] && (
                                    <div key={i} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        transform: `translateX(${(1 - entrance) * -30 * i}px)`,
                                        opacity: entrance
                                    }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: '#0066cc',
                                            display: 'grid',
                                            placeItems: 'center',
                                            color: '#fff',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            flexShrink: 0
                                        }}>{i}</div>
                                        <div style={{ fontSize: '20px', color: '#444' }}>{currentScene[`bullet${i}`]}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Layout Specific Content: Stats */}
                        {currentScene.layout === 'stats' && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '40px',
                                marginTop: '20px'
                            }}>
                                {[1, 2].map(i => currentScene[`stat${i}_value`] && (
                                    <div key={i} style={{
                                        textAlign: 'center',
                                        transform: `scale(${entrance})`,
                                        opacity: entrance
                                    }}>
                                        <div style={{
                                            fontSize: '56px',
                                            fontWeight: '800',
                                            color: '#0066cc',
                                            lineHeight: '1'
                                        }}>{currentScene[`stat${i}_value`]}</div>
                                        <div style={{
                                            fontSize: '16px',
                                            color: '#666',
                                            marginTop: '8px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px'
                                        }}>{currentScene[`stat${i}_label`]}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Layout Specific Content: Steps */}
                        {currentScene.layout === 'steps' && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                gap: '20px',
                                marginTop: '12px',
                                position: 'relative',
                                padding: '0 20px'
                            }}>
                                {/* Connector line */}
                                <div style={{
                                    position: 'absolute',
                                    top: '25px',
                                    left: '60px',
                                    right: '60px',
                                    height: '2px',
                                    borderTop: '2px dashed #0066cc',
                                    opacity: 0.3,
                                    zIndex: 0
                                }} />
                                {[1, 2, 3].map(i => currentScene[`step${i}`] && (
                                    <div key={i} style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '12px',
                                        flex: 1,
                                        position: 'relative',
                                        zIndex: 1,
                                        transform: `translateY(${(1 - entrance) * 20 * i}px)`,
                                        opacity: entrance
                                    }}>
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '50%',
                                            background: '#fff',
                                            border: '3px solid #0066cc',
                                            display: 'grid',
                                            placeItems: 'center',
                                            color: '#0066cc',
                                            fontSize: '20px',
                                            fontWeight: '800',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}>{i}</div>
                                        <div style={{
                                            fontSize: '18px',
                                            fontWeight: '600',
                                            color: '#333',
                                            textAlign: 'center'
                                        }}>{currentScene[`step${i}`]}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Layout Specific Content: Grid */}
                        {currentScene.layout === 'grid' && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '24px',
                                marginTop: '12px',
                                width: '100%'
                            }}>
                                {[1, 2, 3, 4].map(i => currentScene[`feat${i}`] && (
                                    <div key={i} style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        padding: '24px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        transform: `translate(${(i % 2 === 0 ? 1 : -1) * (1 - entrance) * 30}px, ${Math.floor((i - 1) / 2) * (1 - entrance) * 30}px)`,
                                        opacity: entrance
                                    }}>
                                        <div style={{ color: '#0066cc', fontSize: '24px' }}><MdCheckCircle /></div>
                                        <div style={{ fontSize: '18px', fontWeight: '500', color: '#444' }}>{currentScene[`feat${i}`]}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Layout Specific Content: Comparison */}
                        {currentScene.layout === 'comparison' && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'stretch',
                                gap: '4px',
                                marginTop: '20px',
                                width: '100%',
                                background: '#eee',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                border: '2px solid #ddd'
                            }}>
                                <div style={{
                                    flex: 1,
                                    padding: '30px',
                                    background: '#f9f9f9',
                                    textAlign: 'center',
                                    transform: `translateX(${(1 - entrance) * -50}px)`,
                                    opacity: entrance
                                }}>
                                    <div style={{ color: '#888', marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase' }}>Legacy</div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#555' }}>{currentScene.leftItem}</div>
                                </div>
                                <div style={{
                                    width: '60px',
                                    background: '#0066cc',
                                    display: 'grid',
                                    placeItems: 'center',
                                    color: '#fff',
                                    fontSize: '32px',
                                    zIndex: 1,
                                    transform: `scale(${entrance})`
                                }}>
                                    <MdCompareArrows />
                                </div>
                                <div style={{
                                    flex: 1,
                                    padding: '30px',
                                    background: '#fff',
                                    textAlign: 'center',
                                    transform: `translateX(${(1 - entrance) * 50}px)`,
                                    opacity: entrance
                                }}>
                                    <div style={{ color: '#0066cc', marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase' }}>Modern</div>
                                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#0066cc' }}>{currentScene.rightItem}</div>
                                </div>
                            </div>
                        )}

                        {/* Layout Specific Content: Highlight */}
                        {currentScene.layout === 'highlight' && (
                            <div style={{
                                marginTop: '30px',
                                padding: '40px',
                                background: 'rgba(0,102,204,0.05)',
                                borderRadius: '24px',
                                borderLeft: '8px solid #0066cc',
                                width: '100%',
                                transform: `translateX(${(1 - entrance) * -40}px)`,
                                opacity: entrance,
                                boxShadow: '0 10px 40px rgba(0,102,204,0.1)'
                            }}>
                                <div style={{ fontSize: '36px', fontWeight: '800', color: '#0066cc', lineHeight: '1.2' }}>
                                    {currentScene.highlightText}
                                </div>
                            </div>
                        )}

                        {/* Layout Specific Content: Testimonial */}
                        {currentScene.layout === 'testimonial' && (
                            <div style={{
                                marginTop: '30px',
                                padding: '40px',
                                background: '#fff',
                                borderRadius: '24px',
                                width: '100%',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                                position: 'relative',
                                transform: `rotate(${(1 - entrance) * -5}deg) scale(${entrance})`,
                                opacity: entrance,
                                border: '1px solid #eee'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '-20px',
                                    left: '40px',
                                    width: '40px',
                                    height: '40px',
                                    background: '#0066cc',
                                    borderRadius: '10px',
                                    display: 'grid',
                                    placeItems: 'center',
                                    color: '#fff',
                                    fontSize: '24px'
                                }}>“</div>
                                <div style={{
                                    fontSize: '22px',
                                    lineHeight: '1.6',
                                    color: '#444',
                                    fontStyle: 'italic',
                                    marginBottom: '24px'
                                }}>
                                    {currentScene.testimonialText}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eee', flexShrink: 0, overflow: 'hidden' }}>
                                        {currentScene.avatar ? (
                                            <img src={currentScene.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <MdPerson size={32} style={{ margin: '8px', color: '#999' }} />
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 'bold', color: '#111' }}>{currentScene.author}</div>
                                        <div style={{ fontSize: '14px', color: '#666' }}>{currentScene.role}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Layout Specific Content: CTA */}
                        {currentScene.layout === 'cta' && (
                            <div style={{
                                marginTop: '40px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: titleStyle.textAlign === 'center' ? 'center' : 'flex-start',
                                gap: '24px',
                                width: '100%'
                            }}>
                                <div style={{
                                    padding: '16px 40px',
                                    background: 'linear-gradient(135deg, #0066cc 0%, #004499 100%)',
                                    borderRadius: '50px',
                                    color: '#fff',
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    boxShadow: '0 10px 20px rgba(0,102,204,0.3)',
                                    cursor: 'pointer',
                                    transform: `scale(${entrance})`,
                                    opacity: entrance
                                }}>
                                    Visit Our Website
                                </div>
                                <div style={{
                                    fontSize: '20px',
                                    color: '#0066cc',
                                    fontWeight: '600',
                                    letterSpacing: '1px',
                                    background: 'rgba(0,102,204,0.1)',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    transform: `translateY(${(1 - entrance) * 20}px)`,
                                    opacity: entrance
                                }}>
                                    {currentScene.website}
                                </div>
                            </div>
                        )}

                        {/* Layout Specific Content: Three Column */}
                        {currentScene.layout === 'three-col' && (
                            <div style={{
                                display: 'flex',
                                gap: '24px',
                                marginTop: '20px',
                                width: '100%'
                            }}>
                                {[1, 2, 3].map(i => currentScene[`col${i}_title`] && (
                                    <div key={i} style={{
                                        flex: 1,
                                        background: '#f9f9f9',
                                        borderRadius: '16px',
                                        padding: '24px',
                                        textAlign: 'center',
                                        transform: `translateY(${(1 - entrance) * 30 * i}px)`,
                                        opacity: entrance,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                    }}>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0066cc', marginBottom: '12px' }}>{currentScene[`col${i}_title`]}</div>
                                        <div style={{ fontSize: '16px', color: '#666', lineHeight: '1.5' }}>{currentScene[`col${i}_content`]}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Layout Specific Content: Ranked List */}
                        {currentScene.layout === 'ranked-list' && (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                                marginTop: '20px',
                                width: '100%'
                            }}>
                                {[1, 2, 3].map(i => currentScene[`rank${i}`] && (
                                    <div key={i} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '20px',
                                        background: i === 1 ? 'linear-gradient(135deg, #fff9e6 0%, #ffecbd 100%)' : '#f9f9f9',
                                        padding: '20px',
                                        borderRadius: '12px',
                                        border: i === 1 ? '2px solid #ffd700' : '1px solid #eee',
                                        transform: `translateX(${(1 - entrance) * -30 * i}px)`,
                                        opacity: entrance,
                                        boxShadow: i === 1 ? '0 8px 20px rgba(255,215,0,0.2)' : '0 2px 8px rgba(0,0,0,0.05)'
                                    }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '8px',
                                            background: i === 1 ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' : 'linear-gradient(135deg, #0066cc 0%, #004499 100%)',
                                            color: i === 1 ? '#5c4000' : '#fff',
                                            display: 'grid',
                                            placeItems: 'center',
                                            fontSize: '24px',
                                            fontWeight: 'bold',
                                            flexShrink: 0,
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                        }}>#{i}</div>
                                        <div style={{ fontSize: '20px', color: '#333', flex: 1, fontWeight: '500' }}>{currentScene[`rank${i}`]}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Layout Specific Content: Breaking News */}
                        {currentScene.layout === 'breaking-news' && (
                            <div style={{
                                marginTop: '30px',
                                width: '100%',
                                background: 'linear-gradient(135deg, #cc0000 0%, #990000 100%)',
                                color: '#fff',
                                padding: '30px',
                                borderRadius: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                                transform: `translateX(${(1 - entrance) * -50}px)`,
                                opacity: entrance,
                                boxShadow: '0 10px 30px rgba(204,0,0,0.3)'
                            }}>
                                <div style={{
                                    background: '#fff',
                                    color: '#cc0000',
                                    fontSize: '14px',
                                    fontWeight: '900',
                                    padding: '6px 16px',
                                    alignSelf: 'flex-start',
                                    borderRadius: '4px',
                                    letterSpacing: '1px'
                                }}>{currentScene.newsCategory || 'BREAKING'}</div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', lineHeight: '1.3' }}>{currentScene.subtitleText}</div>
                            </div>
                        )}

                        {/* Layout Specific Content: Caption */}
                        {currentScene.layout === 'caption' && (
                            <div style={{
                                marginTop: '30px',
                                width: '100%',
                                borderTop: '4px solid #000',
                                paddingTop: '20px',
                                transform: `translateY(${(1 - entrance) * 20}px)`,
                                opacity: entrance
                            }}>
                                <div style={{ fontSize: '18px', color: '#666', fontStyle: 'italic', lineHeight: '1.5' }}>
                                    {currentScene.captionText || 'Image caption here'}
                                </div>
                            </div>
                        )}

                        {/* Layout Specific Content: Code Snippet */}
                        {currentScene.layout === 'code' && (
                            <div style={{
                                marginTop: '30px',
                                width: '100%',
                                background: '#f8f9fa',
                                borderRadius: '16px',
                                padding: '24px',
                                border: '1px solid #dadce0',
                                transform: `scale(${entrance})`,
                                opacity: entrance,
                                boxShadow: '0 2px 4px 0 rgba(60, 64, 67, 0.3), 0 4px 12px 4px rgba(60, 64, 67, 0.15)'
                            }}>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }} />
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }} />
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }} />
                                </div>
                                <div style={{ height: '8px', background: '#4ec9b0', width: '70%', marginBottom: '8px', borderRadius: '2px' }} />
                                <div style={{ height: '8px', background: '#ce9178', width: '90%', marginBottom: '8px', borderRadius: '2px' }} />
                                <div style={{ height: '8px', background: '#dcdcaa', width: '60%', marginBottom: '8px', borderRadius: '2px' }} />
                                <div style={{ height: '8px', background: '#569cd6', width: '80%', borderRadius: '2px' }} />
                            </div>
                        )}

                        {/* Layout Specific Content: Definition */}
                        {currentScene.layout === 'definition' && (
                            <div style={{
                                marginTop: '30px',
                                width: '100%',
                                background: 'linear-gradient(135deg, #fffaf0 0%, #fff5e6 100%)',
                                borderRadius: '16px',
                                padding: '32px',
                                borderLeft: '8px solid #d4a373',
                                transform: `translateX(${(1 - entrance) * -40}px)`,
                                opacity: entrance,
                                boxShadow: '0 8px 24px rgba(212,163,115,0.15)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px' }}>
                                    <div style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: 'Georgia, serif', color: '#333' }}>
                                        {currentScene.titleText}
                                    </div>
                                    <div style={{ fontSize: '18px', fontStyle: 'italic', color: '#888' }}>
                                        {currentScene.pronunciation || 'noun'}
                                    </div>
                                </div>
                                <div style={{ fontSize: '20px', color: '#555', lineHeight: '1.6' }}>
                                    {currentScene.definition}
                                </div>
                            </div>
                        )}

                        {/* Layout Specific Content: Quiz */}
                        {currentScene.layout === 'quiz' && (
                            <div style={{
                                marginTop: '20px',
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px'
                            }}>
                                {[1, 2, 3].map(i => currentScene[`opt${i}`] && (
                                    <div key={i} style={{
                                        padding: '20px',
                                        borderRadius: '12px',
                                        border: i.toString() === currentScene.correctOpt ? '3px solid #00c853' : '2px solid #eee',
                                        background: i.toString() === currentScene.correctOpt ? '#e8f5e9' : '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        fontSize: '20px',
                                        transform: `translateX(${(1 - entrance) * -30 * i}px)`,
                                        opacity: entrance,
                                        boxShadow: i.toString() === currentScene.correctOpt ? '0 4px 16px rgba(0,200,83,0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            border: '2px solid #ccc',
                                            display: 'grid',
                                            placeItems: 'center',
                                            fontSize: '18px',
                                            background: i.toString() === currentScene.correctOpt ? '#00c853' : 'transparent',
                                            color: i.toString() === currentScene.correctOpt ? '#fff' : '#666',
                                            fontWeight: 'bold',
                                            flexShrink: 0
                                        }}>{String.fromCharCode(64 + i)}</div>
                                        <div style={{ flex: 1 }}>{currentScene[`opt${i}`]}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Layout Specific Content: Pro Tip */}
                        {currentScene.layout === 'tip' && (
                            <div style={{
                                marginTop: '30px',
                                width: '100%',
                                background: 'linear-gradient(135deg, #fff9e6 0%, #ffecbd 100%)',
                                border: '3px solid #ffca28',
                                borderRadius: '16px',
                                padding: '32px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '16px',
                                textAlign: 'center',
                                transform: `scale(${entrance})`,
                                opacity: entrance,
                                boxShadow: '0 10px 30px rgba(255,202,40,0.2)'
                            }}>
                                <div style={{ fontSize: '48px' }}>💡</div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#5c4000', textTransform: 'uppercase', letterSpacing: '2px' }}>
                                    PRO TIP
                                </div>
                                <div style={{ fontSize: '22px', color: '#5c4000', fontStyle: 'italic', lineHeight: '1.5', maxWidth: '500px' }}>
                                    "{currentScene.tipContent}"
                                </div>
                            </div>
                        )}

                        {/* Logo Placeholder */}
                        {currentScene.layout !== 'quote' && (
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                backgroundColor: '#f0f0f0',
                                border: '2px dashed #cccccc',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginTop: '8px',
                                fontSize: '10px',
                                color: '#999999',
                                fontWeight: '600',
                                textAlign: 'center',
                                padding: '8px',
                                transform: `scale(${entrance})`,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}>
                                YOUR LOGO
                            </div>
                        )}
                    </div>

                    {/* Right Side / Top - Avatar Display */}
                    {(currentScene?.avatar || !isFullWidth) && (
                        <div style={{
                            flex: '0 0 auto',
                            width: (isFullWidth || currentScene.layout === 'centered') ? '300px' : '450px',
                            height: (isFullWidth || currentScene.layout === 'centered') ? '300px' : '600px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            transform: `scale(${interpolate(entrance, [0, 1], [0.8, 1])})`,
                            filter: `blur(${(1 - entrance) * 20}px) drop-shadow(0 4px 30px rgba(0,0,0,0.25))`
                        }}>
                            {currentScene?.avatar ? (
                                <img
                                    src={currentScene.avatar}
                                    alt="Avatar"
                                    onError={(e) => {
                                        console.log('Avatar image failed to load:', currentScene.avatar)
                                        e.target.style.display = 'none'
                                        e.target.nextSibling.style.display = 'flex'
                                    }}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        objectPosition: 'center bottom',
                                        borderRadius: (isFullWidth || currentScene.layout === 'centered') ? '50%' : '20px',
                                        background: (isFullWidth || currentScene.layout === 'centered') ? 'rgba(255,255,255,0.1)' : 'transparent',
                                        border: (isFullWidth || currentScene.layout === 'centered') ? '6px solid #fff' : 'none',
                                        boxShadow: (isFullWidth || currentScene.layout === 'centered') ? '0 12px 40px rgba(0,0,0,0.2)' : 'none'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: '#f5f5f5',
                                    borderRadius: (isFullWidth || currentScene.layout === 'centered') ? '50%' : '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px dashed #cccccc'
                                }}>
                                    <MdPerson size={(isFullWidth || currentScene.layout === 'centered') ? 100 : 160} color="#999999" />
                                </div>
                            )}
                            {/* Fallback placeholder when avatar fails to load */}
                            <div style={{
                                display: 'none',
                                width: '100%',
                                height: '100%',
                                backgroundColor: '#f5f5f5',
                                borderRadius: (isFullWidth || currentScene.layout === 'centered') ? '50%' : '12px',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px dashed #cccccc'
                            }}>
                                <MdPerson size={(isFullWidth || currentScene.layout === 'centered') ? 80 : 120} color="#999999" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default VideoComposition
