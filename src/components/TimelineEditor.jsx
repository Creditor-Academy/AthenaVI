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
    MdDragIndicator
} from 'react-icons/md'

const TimelineEditor = ({
    scenes,
    activeSceneId,
    currentTime,
    isPlaying,
    onSeek,
    onSelectScene,
    onUpdateScene,
    onAddScene,
    onDeleteScene,
    onReorderScenes
}) => {
    const [zoom, setZoom] = useState(60)
    const [draggedSceneId, setDraggedSceneId] = useState(null)
    const [dragOverSceneId, setDragOverSceneId] = useState(null)
    const scrollContainerRef = useRef(null)
    const isDraggingPlayhead = useRef(false)

    const totalDuration = useMemo(() => {
        return scenes.reduce((sum, s) => sum + (s.duration || 8), 0)
    }, [scenes])

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
        }
    }

    const handleMouseMove = (e) => {
        if (isDraggingPlayhead.current) {
            handleTimelineAction(e.clientX)
        }
    }

    const handleMouseUp = () => {
        isDraggingPlayhead.current = false
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
          background: #0f0f0f;
          height: 100%;
          display: grid;
          grid-template-rows: 48px 1fr;
          border-top: 1px solid #222;
          color: #fff;
          font-family: 'Inter', sans-serif;
        }

        .timeline-toolbar {
          padding: 0 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          background: #181818;
          border-bottom: 1px solid #222;
        }

        .timeline-container {
          display: grid;
          grid-template-columns: 200px 1fr;
          overflow: hidden;
        }

        .timeline-labels {
          background: #121212;
          border-right: 1px solid #222;
          display: flex;
          flex-direction: column;
        }

        .track-label {
          height: 80px;
          display: flex;
          align-items: center;
          padding: 0 16px;
          font-size: 13px;
          color: #aaa;
          border-bottom: 1px solid #222;
        }

        .track-label.active {
          color: #fff;
          background: #1a1a1a;
        }

        .timeline-viewport {
          position: relative;
          overflow-x: auto;
          overflow-y: hidden;
          background: #080808;
          cursor: crosshair;
          scrollbar-width: thin;
          scrollbar-color: #333 transparent;
        }

        .timeline-ruler {
          height: 28px;
          background: #121212;
          position: sticky;
          top: 0;
          z-index: 30;
          border-bottom: 1px solid #333;
        }

        .ruler-second {
          position: absolute;
          border-left: 1px solid #444;
          height: 100%;
          padding-left: 4px;
          font-size: 10px;
          color: #666;
          font-family: monospace;
        }

        .clip-track {
          height: 80px;
          position: relative;
          border-bottom: 1px solid #222;
        }

        .canva-clip {
          position: absolute;
          height: 64px;
          background: #2a2a2a;
          border-radius: 8px;
          border: 2px solid transparent;
          cursor: grab;
          display: flex;
          align-items: center;
          overflow: hidden;
          transition: transform 0.2s, border-color 0.2s;
        }

        .canva-clip.active {
          border-color: #0088ff;
          box-shadow: 0 0 15px rgba(0, 136, 256, 0.3);
        }

        .canva-clip.drag-over {
          background: #3a3a3a;
          transform: scale(1.02);
        }

        .clip-thumb {
          width: 80px;
          height: 100%;
          background: #000;
          flex-shrink: 0;
          position: relative;
        }

        .clip-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.8;
        }

        .clip-info {
          padding: 8px 12px;
          flex: 1;
          min-width: 0;
        }

        .clip-name {
          font-size: 12px;
          font-weight: 600;
          color: #fff;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        .clip-meta {
          font-size: 10px;
          color: #888;
          margin-top: 2px;
        }

        .playhead {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #ff4d4d;
          z-index: 100;
          pointer-events: none;
        }

        .playhead-head {
          position: absolute;
          top: 0;
          left: -7px;
          width: 14px;
          height: 14px;
          background: #ff4d4d;
          border-radius: 2px;
          cursor: grab;
          pointer-events: auto;
          box-shadow: 0 2px 5px rgba(0,0,0,0.5);
        }

        .playhead-head:active { cursor: grabbing; }

        .time-display {
          background: #000;
          padding: 4px 12px;
          border-radius: 6px;
          color: #00ff00;
          font-family: monospace;
          font-size: 14px;
          border: 1px solid #333;
        }

        .toolbar-btn {
          background: transparent;
          border: none;
          color: #aaa;
          padding: 8px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
          font-size: 13px;
        }

        .toolbar-btn:hover {
          color: #fff;
          background: #333;
        }

        .layer-item {
          position: absolute;
          height: 32px;
          background: #1b4332;
          border: 1px solid #2d6a4f;
          border-radius: 6px;
          display: flex;
          align-items: center;
          padding: 0 10px;
          font-size: 11px;
          color: #d8f3dc;
        }
      `}</style>

            <div className="timeline-toolbar">
                <button className="toolbar-btn" onClick={onAddScene}>
                    <MdAdd size={20} />
                    <span>Add Page</span>
                </button>
                <div style={{ width: '1px', height: '24px', background: '#333' }} />
                <button className="toolbar-btn" title="Delete" onClick={() => onDeleteScene(activeSceneId)}>
                    <MdDelete size={18} />
                </button>

                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="zoom-controls" style={{ display: 'flex', alignItems: 'center', background: '#000', borderRadius: '20px', padding: '0 10px' }}>
                        <MdZoomOut size={14} color="#666" />
                        <input
                            type="range"
                            min="20"
                            max="150"
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            style={{ width: '80px', margin: '0 8px' }}
                        />
                        <MdZoomIn size={14} color="#666" />
                    </div>
                    <div className="time-display">
                        {Math.floor(currentTime / 60).toString().padStart(2, '0')}:
                        {Math.floor(currentTime % 60).toString().padStart(2, '0')}.
                        {Math.floor((currentTime % 1) * 30).toString().padStart(2, '0')}
                    </div>
                </div>
            </div>

            <div className="timeline-container">
                <div className="timeline-labels">
                    <div className="track-label active">
                        <MdVideoLibrary style={{ marginRight: '10px' }} />
                        Main Scenes
                    </div>
                    <div className="track-label">
                        <MdPhotoLibrary style={{ marginRight: '10px' }} />
                        Overlays
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
                                            <div style={{ position: 'absolute', top: 4, left: 4, background: 'rgba(0,0,0,0.5)', borderRadius: '4px', padding: '2px 4px', fontSize: '9px' }}>
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
                        <div className="clip-track" style={{ height: '50px' }}>
                            {scenes.map((scene, index) => {
                                const prevDuration = scenes.slice(0, index).reduce((sum, s) => sum + (s.duration || 8), 0)
                                return (scene.layers || []).map(layer => (
                                    <div
                                        key={layer.id}
                                        className="layer-item"
                                        style={{
                                            left: `${(prevDuration + (layer.start || 0)) * zoom}px`,
                                            width: `${(layer.duration || scene.duration) * zoom}px`
                                        }}
                                    >
                                        {layer.type} overlay
                                    </div>
                                ))
                            })}
                        </div>

                        <div
                            className="playhead"
                            style={{
                                left: `${currentTime * zoom}px`,
                                transition: isPlaying ? 'none' : 'left 0.1s ease-out'
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
