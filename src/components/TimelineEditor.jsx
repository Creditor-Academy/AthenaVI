import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
    MdVideoLibrary,
    MdMusicNote,
    MdAdd,
    MdContentCut,
    MdContentCopy,
    MdContentPaste,
    MdDelete,
    MdTimer,
    MdAspectRatio,
    MdZoomIn,
    MdZoomOut,
    MdPhotoLibrary,
    MdDragIndicator,
    MdPlayArrow,
    MdPause,
    MdStop
} from 'react-icons/md'

const TimelineEditor = ({
    scenes,
    bgMusic,
    activeSceneId,
    currentTime,
    isPlaying,
    onSeek,
    onSelectScene,
    onUpdateScene,
    onAddScene,
    onDeleteScene,
    onReorderScenes,
    onPlayPause,
    onStop,
    totalDuration,
    onDeleteLayer,
    onDeleteMusic,
    musicDuration,
    onMusicDurationChange
}) => {
    const [zoom, setZoom] = useState(60)
    const [draggedSceneId, setDraggedSceneId] = useState(null)
    const [dragOverSceneId, setDragOverSceneId] = useState(null)
    const scrollContainerRef = useRef(null)
    const isDraggingPlayhead = useRef(false)
    const isDraggingMusicTrim = useRef(false)

    // Auto-scroll during playback
    useEffect(() => {
        if (isPlaying && scrollContainerRef.current) {
            const container = scrollContainerRef.current
            const playheadPosition = currentTime * zoom
            const containerWidth = container.clientWidth
            const scrollLeft = container.scrollLeft

            // Keep playhead in view with some padding
            if (playheadPosition > scrollLeft + containerWidth - 100) {
                container.scrollTo({
                    left: playheadPosition - containerWidth + 150,
                    behavior: 'smooth'
                })
            } else if (playheadPosition < scrollLeft + 50) {
                container.scrollTo({
                    left: Math.max(0, playheadPosition - 50),
                    behavior: 'smooth'
                })
            }
        }
    }, [currentTime, isPlaying, zoom])

    // Scrubbing logic
    const handleTimelineAction = (clientX) => {
        if (!scrollContainerRef.current) return
        const rect = scrollContainerRef.current.getBoundingClientRect()
        const x = clientX - rect.left + scrollContainerRef.current.scrollLeft
        const time = Math.max(0, Math.min(x / zoom, totalDuration))
        onSeek(time)
    }

    const handleMouseDown = (e) => {
        if (e.target.closest('.playhead-head') || e.target.closest('.timeline-ruler')) {
            isDraggingPlayhead.current = true
            handleTimelineAction(e.clientX)
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
        } else if (e.target.closest('.music-trim-handle')) {
            isDraggingMusicTrim.current = true
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
        }
    }

    const handleMouseMove = (e) => {
        if (isDraggingPlayhead.current) {
            handleTimelineAction(e.clientX)
        } else if (isDraggingMusicTrim.current) {
            const rect = scrollContainerRef.current.getBoundingClientRect()
            const x = e.clientX - rect.left + scrollContainerRef.current.scrollLeft
            const newDuration = Math.max(1, Math.min(x / zoom, totalDuration))
            if (onMusicDurationChange) onMusicDurationChange(newDuration)
        }
    }

    const handleMouseUp = () => {
        isDraggingPlayhead.current = false
        isDraggingMusicTrim.current = false
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
    }

    // Drag and Drop reordering logic
    const onDragStart = (e, id) => {
        setDraggedSceneId(id)
        e.dataTransfer.effectAllowed = 'move'
        // Set a transparent drag image
        const img = new Image()
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
        e.dataTransfer.setDragImage(img, 0, 0)
    }

    const onDragOver = (e, id) => {
        e.preventDefault()
        if (id !== draggedSceneId) {
            setDragOverSceneId(id)
        }
    }

    const onDrop = (e, targetId) => {
        e.preventDefault()
        if (draggedSceneId && draggedSceneId !== targetId) {
            const draggedIdx = scenes.findIndex(s => s.id === draggedSceneId)
            const targetIdx = scenes.findIndex(s => s.id === targetId)

            const newScenes = [...scenes]
            const [removed] = newScenes.splice(draggedIdx, 1)
            newScenes.splice(targetIdx, 0, removed)

            if (onReorderScenes) {
                onReorderScenes(newScenes)
            }
        }
        setDraggedSceneId(null)
        setDragOverSceneId(null)
    }

    return (
        <div className="timeline-editor-root">
            <style>{`
        .timeline-editor-root {
          background: transparent;
          height: 100%;
          display: flex;
          flex-direction: column;
          color: var(--text-main);
          font-family: var(--font-family);
        }

        .timeline-toolbar {
          padding: 8px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          background: var(--bg-card);
          border-bottom: 1px solid var(--border-color);
          height: 64px;
          flex-shrink: 0;
        }

        .timeline-container {
          display: grid;
          grid-template-columns: 160px 1fr;
          overflow: hidden;
          flex: 1;
          border-bottom: 1px solid var(--border-color);
        }

        .timeline-labels {
          background: var(--bg-card);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          box-shadow: 2px 0 8px rgba(0,0,0,0.02);
          z-index: 40;
        }

        .track-label {
          height: 80px;
          display: flex;
          align-items: center;
          padding: 0 16px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border-color);
          box-sizing: border-box;
          transition: all 0.2s;
        }

        .track-label-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          background: var(--bg-surface);
          color: var(--text-muted);
        }

        .track-label.small {
          height: 40px;
        }

        .track-label.active {
          color: var(--text-main);
          background: var(--bg-card);
          font-weight: 500;
        }

        .timeline-viewport {
          position: relative;
          overflow-x: scroll;
          overflow-y: hidden;
          background: var(--bg-surface);
          cursor: crosshair;
          scrollbar-width: thin;
          scrollbar-color: var(--border-color) transparent;
        }

        .timeline-ruler {
          height: 28px;
          background: var(--bg-card);
          position: sticky;
          top: 0;
          z-index: 30;
          border-bottom: 1px solid var(--border-color);
          box-sizing: border-box;
        }

        .ruler-second {
          position: absolute;
          border-left: 1px solid #dadce0;
          height: 100%;
          padding-left: 4px;
          font-size: 10px;
          color: #80868b;
          font-family: monospace;
        }

        .clip-track {
          height: 80px;
          position: relative;
          border-bottom: 1px solid var(--border-color);
          box-sizing: border-box;
          display: flex;
          align-items: center;
        }

        .clip-track.small {
          height: 48px;
          border-bottom: 1px solid var(--border-color);
        }

        .music-track {
           height: 48px;
           border-bottom: 1px solid var(--border-color);
           position: relative;
           display: flex;
           align-items: center;
        }

        .music-clip {
          position: absolute;
          height: 32px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          border-radius: 8px;
          color: #065f46;
          font-size: 12px;
          display: flex;
          align-items: center;
          padding: 0 12px;
          font-weight: 500;
        }

        .canva-clip {
          position: absolute;
          height: 60px;
          background: var(--bg-card);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          cursor: grab;
          display: flex;
          align-items: center;
          overflow: hidden;
          transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15);
        }

        .canva-clip.active {
          border-color: var(--primary);
          background: var(--bg-surface);
          box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.1), 0 2px 4px 0 rgba(0, 0, 0, 0.3), 0 4px 12px 4px rgba(0, 0, 0, 0.15);
        }

        .canva-clip.drag-over {
          background: #f1f3f4;
          transform: scale(1.02);
        }

        .clip-thumb {
          width: 80px;
          height: 100%;
          background: var(--bg-surface);
          flex-shrink: 0;
          position: relative;
        }

        .clip-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 1;
        }

        .clip-info {
          padding: 8px 12px;
          flex: 1;
          min-width: 0;
        }

        .clip-name {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-main);
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        .clip-meta {
          font-size: 10px;
          color: #80868b;
          margin-top: 2px;
        }

        .playhead {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--primary);
          z-index: 100;
          pointer-events: none;
        }

        .playhead-head {
          position: absolute;
          top: 0;
          left: -7px;
          width: 14px;
          height: 14px;
          background: var(--primary);
          border-radius: 50%;
          cursor: grab;
          pointer-events: auto;
          box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15);
        }

        .playhead-head:active { cursor: grabbing; }

        .time-display {
          background: var(--bg-card);
          padding: 6px 12px;
          border-radius: 8px;
          color: var(--text-main);
          font-family: monospace;
          font-size: 13px;
          border: 1px solid var(--border-color);
          font-weight: 500;
        }

        .toolbar-btn {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 13px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .toolbar-btn:hover {
          color: var(--text-main);
          background: var(--bg-surface);
          border-color: var(--border-color);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .layer-item {
          position: absolute;
          height: 32px;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 10px;
          font-size: 11px;
          color: var(--primary);
          font-weight: 500;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          transition: all 0.2s;
        }

        .layer-item:hover {
          background: #d2e3fc;
          transform: translateY(-1px);
        }

        .delete-clip-btn {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: none;
          background: rgba(0, 0, 0, 0.1);
          color: #5f6368;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 8px;
          cursor: pointer;
          font-size: 14px;
          line-height: 1;
          transition: all 0.2s;
        }

        .delete-clip-btn:hover {
          background: var(--delete-red);
          color: white;
        }

        .music-clip {
          position: absolute;
          height: 32px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          border-radius: 8px;
          color: #065f46;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .music-clip:hover {
          background: #d1fae5;
        }

        .music-trim-handle {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 8px;
          background: #34d399;
          cursor: ew-resize;
          border-radius: 0 8px 8px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .music-trim-handle:hover {
          width: 12px;
          background: #10b981;
        }

        .music-trim-handle::after {
          content: "";
          width: 2px;
          height: 12px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 1px;
        }
      `}</style>

            <div className="timeline-toolbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button className="toolbar-btn" title="Stop" onClick={onStop}>
                        <MdStop size={18} />
                    </button>
                    <button className="toolbar-btn" title="Play/Pause" onClick={onPlayPause}>
                        {isPlaying ? <MdPause size={18} /> : <MdPlayArrow size={18} />}
                    </button>
                    <div className="time-display" style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        {Math.floor(currentTime / 60).toString().padStart(2, '0')}:
                        {Math.floor(currentTime % 60).toString().padStart(2, '0')} /
                        {Math.floor(totalDuration / 60).toString().padStart(2, '0')}:
                        {Math.floor(totalDuration % 60).toString().padStart(2, '0')}
                    </div>
                </div>

                <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }} />

                <button className="toolbar-btn" onClick={onAddScene}>
                    <MdAdd size={20} />
                    <span>Add Page</span>
                </button>
                <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }} />
                <button className="toolbar-btn" title="Delete" onClick={() => onDeleteScene(activeSceneId)}>
                    <MdDelete size={18} />
                </button>

                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="zoom-controls" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-surface)', borderRadius: '20px', padding: '0 10px' }}>
                        <MdZoomOut size={14} color="var(--text-muted)" />
                        <input
                            type="range"
                            min="20"
                            max="150"
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            style={{ width: '80px', margin: '0 8px' }}
                        />
                        <MdZoomIn size={14} color="var(--text-muted)" />
                    </div>
                </div>
            </div>

            <div className="timeline-container" style={{ borderTop: '1px solid var(--border-color)' }}>
                <div className="timeline-labels">
                    <div style={{
                        height: '28px',
                        backgroundColor: 'var(--bg-card)',
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <MdDragIndicator color="var(--border-color)" />
                    </div>
                    <div className="track-label active">
                        <div className="track-label-icon" style={{ background: 'var(--bg-surface)', color: 'var(--primary)' }}>
                            <MdVideoLibrary size={18} />
                        </div>
                        Main Scenes
                    </div>
                    <div className="track-label small" style={{ height: '48px' }}>
                        <div className="track-label-icon" style={{ background: 'var(--bg-surface)', color: '#ef4444', width: '24px', height: '24px' }}>
                            <MdPhotoLibrary size={14} />
                        </div>
                        Overlays
                    </div>
                    <div className="track-label small" style={{ height: '48px' }}>
                        <div className="track-label-icon" style={{ background: 'var(--bg-surface)', color: '#10b981', width: '24px', height: '24px' }}>
                            <MdMusicNote size={14} />
                        </div>
                        Audio Track
                    </div>
                </div>

                <div
                    className="timeline-viewport"
                    ref={scrollContainerRef}
                    onMouseDown={handleMouseDown}
                >
                    <div className="timeline-ruler" style={{ width: `${totalDuration * zoom + 500}px` }}>
                        {Array.from({ length: Math.ceil(totalDuration) + 10 }).map((_, i) => (
                            <div key={i} className="ruler-second" style={{ left: `${i * zoom}px` }}>
                                {i}s
                            </div>
                        ))}
                    </div>

                    <div className="timeline-tracks" style={{ width: `${totalDuration * zoom + 500}px` }}>
                        {/* Main Track */}
                        <div className="clip-track">
                            {scenes.map((scene, index) => {
                                const prevDuration = scenes.slice(0, index).reduce((sum, s) => sum + (s.duration || 8), 0)
                                return (
                                    <div
                                        key={scene.id}
                                        draggable
                                        onDragStart={(e) => onDragStart(e, scene.id)}
                                        onDragOver={(e) => onDragOver(e, scene.id)}
                                        onDrop={(e) => onDrop(e, scene.id)}
                                        className={`canva-clip ${scene.id === activeSceneId ? 'active' : ''} ${dragOverSceneId === scene.id ? 'drag-over' : ''}`}
                                        style={{
                                            left: `${prevDuration * zoom}px`,
                                            width: `${(scene.duration || 8) * zoom}px`
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onSelectScene(scene.id)
                                            onSeek(prevDuration)
                                        }}
                                    >
                                        <div className="clip-thumb">
                                            <img src={scene.avatar} alt="" />
                                            <div style={{ position: 'absolute', top: 4, left: 4, background: 'var(--bg-card)', borderRadius: '4px', padding: '2px 4px', fontSize: '9px', color: 'var(--text-main)', fontWeight: '600' }}>
                                                {index + 1}
                                            </div>
                                        </div>
                                        <div className="clip-info">
                                            <div className="clip-name">{scene.titleText || 'Untitled'}</div>
                                            <div className="clip-meta">{(scene.duration || 8).toFixed(1)}s</div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Overlays Track */}
                        <div className="clip-track small">
                            {scenes.map((scene, index) => {
                                const prevDuration = scenes.slice(0, index).reduce((sum, s) => sum + (s.duration || 8), 0)
                                return (scene.layers || []).map(layer => (
                                    <div
                                        key={layer.id}
                                        className="layer-item"
                                        style={{
                                            position: 'absolute',
                                            left: `${(prevDuration + (layer.start || 0)) * zoom}px`,
                                            width: `${(layer.duration || scene.duration) * zoom}px`,
                                            top: '4px'
                                        }}
                                        onClick={() => onSeek(prevDuration + (layer.start || 0))}
                                    >
                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {layer.type} overlay
                                        </span>
                                        <button
                                            className="delete-clip-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteLayer(scene.id, layer.id);
                                            }}
                                            title="Delete overlay"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))
                            })}
                        </div>

                        <div className="music-track">
                            {bgMusic && (
                                <div
                                    className="music-clip"
                                    style={{
                                        left: 0,
                                        width: `${musicDuration * zoom}px`
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                                        <MdMusicNote size={14} style={{ marginRight: 8 }} />
                                        <span>Background Music</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <button
                                            className="delete-clip-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteMusic();
                                            }}
                                            title="Remove music"
                                            style={{ marginRight: '12px' }}
                                        >
                                            ×
                                        </button>
                                        <div className="music-trim-handle" title="Adjust duration" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div
                            className="playhead"
                            style={{
                                left: `${currentTime * zoom}px`,
                                transition: isPlaying ? 'left 0.1s linear' : 'left 0.1s ease-out'
                            }}
                        >
                            <div className="playhead-head" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TimelineEditor
