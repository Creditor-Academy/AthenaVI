import React from 'react'
import {
    MdPerson,
    MdAutoAwesome,
    MdPhotoSizeSelectActual
} from 'react-icons/md'

const StaticPreview = ({ scene, isThumbnail = true }) => {
    // BLUEPRINT STYLE: ALWAYS WHITE/GREY GRID FOR LAYOUTS
    const backgroundStyle = {
        backgroundColor: '#ffffff',
        backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
        backgroundSize: '16px 16px',
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        border: isThumbnail ? '1px solid #eee' : 'none'
    }

    const clips = scene.clips || []

    return (
        <div style={backgroundStyle}>
            {clips.map((clip, index) => {
                // Map the 1920x1080 professional coordinate system to the preview
                const mapX = (x) => typeof x === 'number' && x > 100 ? (x / 19.2) : (x || 0);
                const mapY = (y) => typeof y === 'number' && y > 100 ? (y / 10.8) : (y || 0);
                
                const widthVal = clip.size?.width ? `${(clip.size.width / 19.2)}%` : (clip.type === 'image' ? '30%' : 'auto');
                const heightVal = clip.size?.height ? `${(clip.size.height / 10.8)}%` : (clip.type === 'image' ? '30%' : 'auto');

                const style = {
                    position: 'absolute',
                    left: `${mapX(clip.position?.x)}%`,
                    top: `${mapY(clip.position?.y)}%`,
                    width: widthVal,
                    height: heightVal,
                    zIndex: clip.layer || index,
                    opacity: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    transform: 'translate(-50%, -50%)',
                    transformOrigin: 'center center',
                    boxSizing: 'border-box'
                }

                if (clip.type === 'text') {
                    return (
                        <div key={clip.id} style={style}>
                            <div style={{
                                fontSize: `${(clip.style?.fontSize || 32) * (isThumbnail ? 0.35 : 1)}px`,
                                fontWeight: clip.style?.fontWeight || '700',
                                color: '#1a1b1c',
                                textAlign: clip.style?.textAlign || 'center',
                                border: '1px dashed #ced4da',
                                padding: isThumbnail ? '2px 4px' : '8px 16px',
                                background: '#f8f9fa',
                                borderRadius: '4px',
                                whiteSpace: 'pre-wrap',
                                width: clip.style?.width ? (typeof clip.style.width === 'string' ? `calc(${clip.style.width} * 0.5)` : '100%') : 'auto'
                            }}>
                                {isThumbnail ? 'TEMPLATE TEXT' : clip.content}
                            </div>
                        </div>
                    )
                }

                if (clip.type === 'image') {
                    return (
                        <div key={clip.id} style={{
                            ...style,
                            border: '1.5px dashed #adb5bd',
                            borderRadius: '8px',
                            background: '#f1f3f5'
                        }}>
                             <MdPhotoSizeSelectActual size={isThumbnail ? 16 : 32} color="#adb5bd" />
                             <span style={{ fontSize: isThumbnail ? '6px' : '10px', color: '#adb5bd', marginTop: '4px', fontWeight: 'bold' }}>IMAGE SLOT</span>
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

export default StaticPreview
