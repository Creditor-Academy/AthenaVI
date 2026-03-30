import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
    MdVideoLibrary,
    MdMusicNote,
    MdAdd,
    MdDelete,
    MdZoomIn,
    MdZoomOut,
    MdUndo,
    MdRedo,
    MdPlayArrow,
    MdPause,
    MdStop,
    MdSkipNext,
    MdSkipPrevious,
    MdFastForward,
    MdFastRewind
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
          /* =====================================================
             PREMIUM TIMELINE STYLING
             ===================================================== */
          /* =====================================================
             ULTRACLEAN WHITE TIMELINE (REF-MATCHED)
             ===================================================== */
          .timeline-editor-root {
            background: var(--bg-main);
            height: 100%;
            display: flex;
            flex-direction: column;
            color: var(--text-main);
            font-family: 'Inter', system-ui, sans-serif;
            border-top: 1px solid var(--border-color);
          }

          .timeline-toolbar {
            padding: 0 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: var(--bg-card);
            border-bottom: 1px solid var(--border-color);
            height: 64px;
            flex-shrink: 0;
          }

          .toolbar-section {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .timeline-container {
            display: grid;
            grid-template-columns: 200px 1fr;
            overflow: hidden;
            flex: 1;
            background: var(--bg-card);
          }

          .timeline-labels {
            background: var(--bg-card);
            border-right: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            padding-top: 40px; /* Offset for ruler */
          }

          .track-label {
            height: 100px;
            display: flex;
            align-items: center;
            padding: 0 20px;
            font-size: 11px;
            font-weight: 700;
            color: var(--text-main);
            letter-spacing: 0.8px;
            text-transform: uppercase;
          }

          .track-label-icon {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            background: var(--bg-surface);
            color: var(--text-muted);
          }

          .timeline-viewport {
            position: relative;
            overflow-x: scroll;
            overflow-y: hidden;
            background: var(--bg-surface);
            scrollbar-width: thin;
          }

          .timeline-ruler {
            height: 40px;
            background: var(--bg-card);
            position: sticky;
            top: 0;
            z-index: 50;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: flex-end;
            pointer-events: none; /* Let clicks pass through to viewport for scrubbing */
          }

          .ruler-tick {
            position: absolute;
            height: 8px;
            width: 1px;
            background: #ddd;
            bottom: 0;
          }

          .ruler-tick.major {
            height: 14px;
            background: #999;
          }

          .ruler-label {
            position: absolute;
            bottom: 18px;
            font-size: 10px;
            color: var(--text-muted);
            font-family: 'JetBrains Mono', monospace;
            transform: translateX(-50%);
          }

          .canva-clip {
            position: absolute;
            height: 80px;
            background: rgba(0,0,0,0.85); /* Cinematic Black */
            border-radius: 16px;
            border: 2px solid transparent;
            cursor: grab;
            display: flex;
            align-items: center;
            overflow: hidden;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            margin-top: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }

          .canva-clip.active {
            border-color: #d4ff3f; /* Neon/Yellow accent from ref */
            box-shadow: 0 0 20px rgba(212, 255, 63, 0.3);
          }

          .clip-thumb {
            width: 120px;
            height: 100%;
            border-right: 1px solid rgba(255,255,255,0.1);
          }

          .clip-info {
            padding: 0 15px;
            color: #fff;
          }

          .clip-name {
            font-size: 13px;
            font-weight: 500;
            letter-spacing: -0.2px;
          }

          .clip-meta {
            font-size: 11px;
            opacity: 0.6;
            margin-top: 4px;
          }

          .playhead {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 2px;
            background: #d4ff3f;
            z-index: 100;
            pointer-events: none;
          }

          .playhead-tooltip {
            position: absolute;
            top: -12px;
            left: 50%;
            transform: translateX(-50%);
            background: #d4ff3f;
            color: #000;
            padding: 4px 10px;
            border-radius: 20px;
            font-family: 'JetBrains Mono', monospace;
            font-weight: 800;
            font-size: 12px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
            white-space: nowrap;
          }

          .playhead-head {
            position: absolute;
            top: 24px;
            left: -5px;
            width: 12px;
            height: 12px;
            background: #d4ff3f;
            border-radius: 50%;
            border: 2px solid #fff;
          }

          .music-track {
            height: 60px;
            display: flex;
            align-items: center;
          }

          .music-clip {
            position: absolute;
            height: 2px;
            background: #d4ff3f;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .music-node {
            width: 8px;
            height: 8px;
            background: #d4ff3f;
            border: 1px solid #fff;
            border-radius: 1px;
          }

          .toolbar-btn {
            background: var(--bg-surface);
            border: none;
            color: var(--text-main);
            width: 36px;
            height: 36px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
          }

          .toolbar-btn:hover {
            background: var(--border-color);
            transform: scale(1.05);
          }

          .toolbar-btn.primary {
            width: 48px;
            height: 48px;
            background: var(--bg-surface);
            color: var(--text-main);
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          }

          .music-clip {
              background: linear-gradient(90deg, #065f46 0%, #047857 100%);
              border: 1px solid #059669;
              color: #fff;
              border-radius: 6px;
              height: 36px;
              margin-top: 6px;
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

        .timeline-empty-state {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-card);
            z-index: 60;
        }

        .empty-state-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px;
            border: 2px dashed var(--border-color);
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: var(--bg-surface);
            max-width: 400px;
            text-align: center;
        }

        .empty-state-card:hover {
            border-color: var(--primary);
            background: var(--bg-card);
            transform: translateY(-4px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.05);
        }

        .empty-add-btn {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: var(--primary);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
            transition: transform 0.3s;
        }

        .empty-state-card:hover .empty-add-btn {
            transform: rotate(90deg) scale(1.1);
        }

        .empty-state-card h3 {
            margin: 0 0 8px 0;
            color: var(--text-main);
            font-size: 18px;
            font-weight: 700;
        }

        .empty-state-card p {
            margin: 0 0 12px 0;
            color: var(--text-muted);
            font-size: 14px;
        }

        .empty-hint {
            font-size: 12px;
            font-weight: 700;
            color: var(--primary);
            background: rgba(var(--primary-rgb), 0.1);
            padding: 4px 12px;
            border-radius: 20px;
            text-transform: uppercase;
        }
      `}</style>

            <div className="timeline-toolbar">
                <div className="toolbar-section">
                    <button className="toolbar-btn" title="Undo"><MdUndo /></button>
                    <button className="toolbar-btn" title="Redo"><MdRedo /></button>
                </div>

                <div className="toolbar-section">
                    <button className="toolbar-btn" title="Rewind"><MdFastRewind /></button>
                    <button className="toolbar-btn" title="Previous"><MdSkipPrevious /></button>
                    <button className="toolbar-btn primary" onClick={onPlayPause}>
                        {isPlaying ? <MdPause size={24} /> : <MdPlayArrow size={24} />}
                    </button>
                    <button className="toolbar-btn" title="Next"><MdSkipNext /></button>
                    <button className="toolbar-btn" title="Fast Forward"><MdFastForward /></button>
                </div>

                <div className="toolbar-section">
                   <button className="toolbar-btn" onClick={onAddScene} title="Add Scene"><MdAdd size={20} /></button>
                   <button className="toolbar-btn" title="Delete" onClick={() => onDeleteScene(activeSceneId)}><MdDelete size={18} /></button>
                </div>
            </div>

            <div className="timeline-container">
                <div className="timeline-labels">
                    <div className="track-label">
                        <div className="track-label-icon"><MdVideoLibrary size={18} /></div>
                        Scenes
                    </div>
                    <div className="track-label" style={{ height: '60px' }}>
                        <div className="track-label-icon"><MdMusicNote size={18} /></div>
                        Audio
                    </div>
                </div>

                <div
                    className="timeline-viewport"
                    ref={scrollContainerRef}
                    onMouseDown={handleMouseDown}
                >
                    <div className="timeline-ruler" style={{ width: `${totalDuration * zoom + 500}px` }}>
                        {Array.from({ length: Math.ceil(totalDuration) * 2 + 10 }).map((_, i) => {
                            const time = i * 0.5;
                            const isMajor = i % 2 === 0;
                            return (
                                <div 
                                    key={i} 
                                    className={`ruler-tick ${isMajor ? 'major' : ''}`} 
                                    style={{ left: `${time * zoom}px` }}
                                >
                                    {isMajor && <span className="ruler-label">{time.toFixed(1)}s</span>}
                                </div>
                            )
                        })}
                    </div>

                    <div className="timeline-tracks" style={{ width: `${Math.max(totalDuration, 60) * zoom + 500}px` }}>
                        {scenes.length === 0 ? (
                            <div className="timeline-empty-state">
                                <div className="empty-state-card" onClick={onAddScene}>
                                    <div className="empty-add-btn">
                                        <MdAdd size={32} />
                                    </div>
                                    <h3>Start Your Masterpiece</h3>
                                    <p>Select a scene template to begin your story</p>
                                    <div className="empty-hint">Scenes always start from 0:00</div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Main Track */}
                                <div className="clip-track" style={{ height: '100px' }}>
                                    {scenes.map((scene, index) => {
                                        const prevDuration = scenes.slice(0, index).reduce((sum, s) => sum + (s.duration || 8), 0)
                                        return (
                                            <div
                                                key={scene.id}
                                                draggable
                                                className={`canva-clip ${scene.id === activeSceneId ? 'active' : ''}`}
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
                                                    <img src={scene.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                                <div className="clip-info">
                                                    <div className="clip-name">{scene.titleText || 'Untitled'}</div>
                                                    <div className="clip-meta">{(scene.duration || 8).toFixed(1)}s</div>
                                                </div>
                                            </div>
                                        )
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
                                            <div className="music-node" style={{ position: 'absolute', left: 0 }} />
                                            {Array.from({ length: Math.floor(musicDuration / 2) }).map((_, i) => (
                                                <div key={i} className="music-node" style={{ position: 'absolute', left: `${(i + 1) * 2 * zoom}px` }} />
                                            ))}
                                            <div className="music-node" style={{ position: 'absolute', right: 0 }} />
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
                                    <div className="playhead-tooltip">
                                        {Math.floor(currentTime / 60).toString().padStart(2, '0')}:
                                        {Math.floor(currentTime % 60).toString().padStart(2, '0')}
                                    </div>
                                    <div className="playhead-head" />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TimelineEditor
