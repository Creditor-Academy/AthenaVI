import React from 'react'
import {
    MdPerson,
    MdCheckCircle,
    MdCompareArrows,
} from 'react-icons/md'

const StaticPreview = ({ scene }) => {
    // Default styles if not provided
    const titleStyle = scene.titleStyle || {
        fontSize: 42,
        color: '#000000',
        fontFamily: 'system-ui',
        fontWeight: '700',
        textAlign: 'left'
    }

    const subtitleStyle = scene.subtitleStyle || {
        fontSize: 22,
        color: '#333333',
        fontFamily: 'system-ui',
        fontWeight: '400',
        textAlign: 'left'
    }

    return (
        <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: scene.backgroundColor || '#ffffff',
            color: '#000000',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            padding: '20px 30px',
            boxSizing: 'border-box'
        }}>
            {/* BACKGROUND LAYERS */}
            {(scene.layers || []).filter(l => l.type === 'image' || l.type === 'video').map(layer => {
                return (
                    <div key={layer.id} style={{
                        position: 'absolute',
                        left: `${layer.x || 0}px`,
                        top: `${layer.y || 0}px`,
                        width: `${layer.width || '100%'}`,
                        height: `${layer.height || '100%'}`,
                        transform: `scale(${layer.scale || 1})`,
                        zIndex: 1,
                        pointerEvents: 'none'
                    }}>
                        {layer.type === 'image' && <img src={layer.content} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        {layer.type === 'video' && <div style={{ width: '100%', height: '100%', background: '#000' }} />}
                    </div>
                )
            })}

            {/* Main Content Container */}
            <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: scene.layout === 'split-left' ? 'row-reverse' : (scene.layout === 'centered' || scene.layout === 'quote' ? 'column-reverse' : 'row'),
                alignItems: 'center',
                justifyContent: scene.layout === 'centered' || scene.layout === 'quote' ? 'center' : 'space-between',
                gap: '20px',
                position: 'relative',
                maxWidth: '100%',
                zIndex: 2,
                textAlign: scene.layout === 'centered' || scene.layout === 'quote' ? 'center' : 'left'
            }}>
                {/* Main Content Area */}
                <div style={{
                    flex: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: (scene.layout === 'centered' || scene.layout === 'quote') ? 'center' : (scene.layout === 'split-left' ? 'flex-end' : 'flex-start'),
                    gap: '10px',
                    minWidth: '0',
                    zIndex: 10,
                    position: 'relative',
                    textAlign: (scene.layout === 'centered' || scene.layout === 'quote' || titleStyle.textAlign === 'center') ? 'center' : (scene.layout === 'split-left' ? 'right' : 'left')
                }}>
                    {/* Title */}
                    <h1 style={{
                        fontSize: `clamp(16px, 3.5vw, ${scene.layout === 'quote' ? 32 : (titleStyle.fontSize || 42)}px)`,
                        fontWeight: titleStyle.fontWeight || '700',
                        margin: '0',
                        lineHeight: '1.2',
                        color: titleStyle.color || '#000000',
                        fontFamily: titleStyle.fontFamily || 'system-ui, -apple-system, sans-serif',
                        wordWrap: 'break-word',
                        width: '100%',
                        fontStyle: scene.layout === 'quote' ? 'italic' : 'normal'
                    }}>
                        {scene?.titleText || 'Insert your video title here'}
                    </h1>

                    {/* Subtitle / Author */}
                    <h2 style={{
                        fontSize: `clamp(10px, 2vw, ${subtitleStyle.fontSize || 22}px)`,
                        fontWeight: subtitleStyle.fontWeight || '400',
                        margin: '0',
                        lineHeight: '1.4',
                        color: subtitleStyle.color || '#333333',
                        fontFamily: subtitleStyle.fontFamily || 'system-ui, -apple-system, sans-serif',
                        wordWrap: 'break-word',
                        width: '100%'
                    }}>
                        {scene.layout === 'quote' && '— '}{scene?.subtitleText || 'Add sub-headline here'}
                    </h2>

                    {/* Layout Specific: Bullets (Compact for Static Preview) */}
                    {scene.layout === 'bullets' && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            marginTop: '4px',
                            width: '100%',
                            alignItems: titleStyle.textAlign === 'center' ? 'center' : 'flex-start'
                        }}>
                            {[1, 2, 3].map(i => scene[`bullet${i}`] && (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#0066cc', display: 'grid', placeItems: 'center', color: '#fff', fontSize: '8px' }}>{i}</div>
                                    <div style={{ fontSize: '10px', color: '#444' }}>{scene[`bullet${i}`]}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Layout Specific: Stats (Compact for Static Preview) */}
                    {scene.layout === 'stats' && (
                        <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                            {[1, 2].map(i => scene[`stat${i}_value`] && (
                                <div key={i} style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#0066cc', lineHeight: '1' }}>{scene[`stat${i}_value`]}</div>
                                    <div style={{ fontSize: '8px', color: '#666', textTransform: 'uppercase' }}>{scene[`stat${i}_label`]}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Layout Specific: Steps (Compact for Static Preview) */}
                    {scene.layout === 'steps' && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '100%',
                            gap: '10px',
                            marginTop: '4px',
                            position: 'relative'
                        }}>
                            {[1, 2, 3].map(i => scene[`step${i}`] && (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
                                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1px solid #0066cc', display: 'grid', placeItems: 'center', color: '#0066cc', fontSize: '7px', fontWeight: 'bold', background: '#fff' }}>{i}</div>
                                    <div style={{ fontSize: '6px', color: '#333', textAlign: 'center' }}>{scene[`step${i}`]}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Layout Specific: Grid (Compact for Static Preview) */}
                    {scene.layout === 'grid' && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '8px',
                            marginTop: '8px',
                            width: '100%'
                        }}>
                            {[1, 2, 3, 4].map(i => scene[`feat${i}`] && (
                                <div key={i} style={{
                                    background: 'rgba(0,102,204,0.05)',
                                    padding: '6px',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    <div style={{ color: '#0066cc', fontSize: '10px' }}><MdCheckCircle /></div>
                                    <div style={{ fontSize: '8px', color: '#444' }}>{scene[`feat${i}`]}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Layout Specific: Comparison (Compact for Static Preview) */}
                    {scene.layout === 'comparison' && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                            marginTop: '10px',
                            width: '100%',
                            background: '#eee',
                            borderRadius: '8px',
                            overflow: 'hidden'
                        }}>
                            <div style={{ flex: 1, padding: '10px', background: '#f9f9f9', textAlign: 'center', fontSize: '10px', fontWeight: 'bold' }}>{scene.leftItem}</div>
                            <div style={{ width: '20px', background: '#0066cc', display: 'grid', placeItems: 'center', color: '#fff', fontSize: '12px' }}><MdCompareArrows /></div>
                            <div style={{ flex: 1, padding: '10px', background: '#fff', textAlign: 'center', fontSize: '10px', fontWeight: 'bold', color: '#0066cc' }}>{scene.rightItem}</div>
                        </div>
                    )}

                    {/* Layout Specific: Highlight (Compact for Static Preview) */}
                    {scene.layout === 'highlight' && (
                        <div style={{
                            marginTop: '10px',
                            padding: '10px',
                            background: 'rgba(0,102,204,0.05)',
                            borderRadius: '8px',
                            borderLeft: '4px solid #0066cc',
                            width: '100%'
                        }}>
                            <div style={{ fontSize: '14px', fontWeight: '800', color: '#0066cc' }}>
                                {scene.highlightText}
                            </div>
                        </div>
                    )}

                    {/* Layout Specific: Testimonial (Compact for Static Preview) */}
                    {scene.layout === 'testimonial' && (
                        <div style={{
                            marginTop: '10px',
                            padding: '10px',
                            background: '#fff',
                            borderRadius: '8px',
                            width: '100%',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            border: '1px solid #eee'
                        }}>
                            <div style={{ fontSize: '10px', lineHeight: '1.4', color: '#444', fontStyle: 'italic', marginBottom: '8px' }}>
                                "{scene.testimonialText?.substring(0, 60)}..."
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#eee' }} />
                                <div style={{ fontSize: '8px', fontWeight: 'bold' }}>{scene.author}</div>
                            </div>
                        </div>
                    )}

                    {/* Layout Specific: CTA (Compact for Static Preview) */}
                    {scene.layout === 'cta' && (
                        <div style={{
                            marginTop: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: titleStyle.textAlign === 'center' ? 'center' : 'flex-start',
                            gap: '8px'
                        }}>
                            <div style={{
                                padding: '6px 16px',
                                background: '#0066cc',
                                borderRadius: '20px',
                                color: '#fff',
                                fontSize: '10px',
                                fontWeight: 'bold'
                            }}>
                                Action
                            </div>
                            <div style={{ fontSize: '8px', color: '#0066cc', fontWeight: 'bold' }}>{scene.website}</div>
                        </div>
                    )}

                    {/* Logo Placeholder */}
                    {scene.layout !== 'quote' && (
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: '#f0f0f0',
                            border: '1px dashed #cccccc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: '4px',
                            fontSize: '6px',
                            color: '#999999',
                            fontWeight: '600',
                            textAlign: 'center',
                            padding: '4px',
                            flexShrink: 0
                        }}>
                            LOGO
                        </div>
                    )}
                </div>

                {/* Right Side - Avatar Display */}
                {scene.layout !== 'quote' && (
                    <div style={{
                        flex: '0 0 auto',
                        width: scene.layout === 'centered' ? '80px' : 'clamp(140px, 20vw, 220px)',
                        height: scene.layout === 'centered' ? '80px' : 'clamp(180px, 30vh, 280px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        zIndex: 10
                    }}>
                        {scene?.avatar ? (
                            <img
                                src={scene.avatar}
                                alt="Avatar"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    objectPosition: 'center',
                                    display: 'block',
                                    borderRadius: scene.layout === 'centered' ? '50%' : '0',
                                    border: scene.layout === 'centered' ? '2px solid #fff' : 'none'
                                }}
                            />
                        ) : (
                            <div style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: '#f5f5f5',
                                borderRadius: scene.layout === 'centered' ? '50%' : '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px dashed #cccccc'
                            }}>
                                <MdPerson size={scene.layout === 'centered' ? 40 : 60} color="#999999" />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default StaticPreview
