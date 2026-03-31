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
    MdFastRewind,
    MdKeyboardArrowUp,
    MdKeyboardArrowDown,
    MdContentCopy
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
    onMusicDurationChange,
    onSelectLayer
}) => {
    const [zoom, setZoom] = useState(60)
    const [draggedSceneId, setDraggedSceneId] = useState(null)
    const [dragOverSceneId, setDragOverSceneId] = useState(null)
    const scrollContainerRef = useRef(null)
    const labelsRef = useRef(null)
    const isDraggingPlayhead = useRef(false)
    const isDraggingMusicTrim = useRef(false)

    // Layer drag/resize states using refs to fix closure issues
    const draggingLayerRef = useRef(null)
    const resizingLayerRef = useRef(null)
    const resizeSideRef = useRef(null)

    // Calculate active scene derived data
    const { activeScene, activeSceneStart } = useMemo(() => {
        const idx = scenes.findIndex(s => s.id === activeSceneId)
        if (idx === -1) return { activeScene: null, activeSceneStart: 0 }
        const activeSceneStart = scenes.slice(0, idx).reduce((sum, s) => sum + (s.duration || 8), 0)
        return { activeScene: scenes[idx], activeSceneStart }
    }, [scenes, activeSceneId])

    const stateRef = useRef({ zoom, activeSceneStart, activeScene, totalDuration })
    useEffect(() => {
        stateRef.current = { zoom, activeSceneStart, activeScene, totalDuration }
    })

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
        if (!scrollContainerRef.current) return
        const { zoom, activeSceneStart, activeScene, totalDuration } = stateRef.current
        const rect = scrollContainerRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left + scrollContainerRef.current.scrollLeft
        
        if (isDraggingPlayhead.current) {
            const time = Math.max(0, Math.min(x / zoom, totalDuration))
            onSeek(time)
        } else if (isDraggingMusicTrim.current) {
            const newDuration = Math.max(1, Math.min(x / zoom, totalDuration))
            if (onMusicDurationChange) onMusicDurationChange(newDuration)
        } else if (resizingLayerRef.current) {
            const timeAtCursor = Math.max(0, (x / zoom) - activeSceneStart)
            const layer = resizingLayerRef.current.layer
            if (resizeSideRef.current === 'right') {
                const newDuration = Math.max(0.5, timeAtCursor - layer.start)
                updateLayerWithState(layer.id, { duration: newDuration }, activeScene)
            } else if (resizeSideRef.current === 'left') {
                const end = layer.start + (layer.duration || activeScene?.duration || 8)
                const newStart = Math.min(timeAtCursor, end - 0.5)
                const newDuration = end - newStart
                updateLayerWithState(layer.id, { start: newStart, duration: newDuration }, activeScene)
            }
        } else if (draggingLayerRef.current) {
            const timeAtCursor = Math.max(0, (x / zoom) - activeSceneStart - draggingLayerRef.current.offsetX)
            updateLayerWithState(draggingLayerRef.current.layer.id, { start: timeAtCursor }, activeScene)
        }
    }

    const updateLayerWithState = (layerId, updates, currentActiveScene) => {
        if (!currentActiveScene) return
        const newLayers = currentActiveScene.layers.map(l => 
            l.id === layerId ? { ...l, ...updates } : l
        )
        onUpdateScene(currentActiveScene.id, { layers: newLayers })
    }

    const handleMouseUp = () => {
        isDraggingPlayhead.current = false
        isDraggingMusicTrim.current = false
        draggingLayerRef.current = null
        resizingLayerRef.current = null
        resizeSideRef.current = null
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
    }

    const updateLayer = (layerId, updates) => {
        if (!activeScene) return
        const newLayers = activeScene.layers.map(l => 
            l.id === layerId ? { ...l, ...updates } : l
        )
        onUpdateScene(activeScene.id, { layers: newLayers })
    }

    const handleViewportScroll = (e) => {
        if (labelsRef.current && labelsRef.current.scrollTop !== e.target.scrollTop) {
            labelsRef.current.scrollTop = e.target.scrollTop;
        }
    }

    const handleLabelsScroll = (e) => {
        if (scrollContainerRef.current && scrollContainerRef.current.scrollTop !== e.target.scrollTop) {
            scrollContainerRef.current.scrollTop = e.target.scrollTop;
        }
    }

    const startLayerDrag = (e, layer) => {
        e.stopPropagation()
        const rect = scrollContainerRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left + scrollContainerRef.current.scrollLeft
        const timeAtCursor = (x / zoom) - activeSceneStart
        draggingLayerRef.current = { layer, offsetX: timeAtCursor - (layer.start || 0) }
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
    }

    const startLayerResize = (e, layer, side) => {
        e.stopPropagation()
        resizingLayerRef.current = { layer }
        resizeSideRef.current = side
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
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

    const moveLayerUp = (e, index) => {
        e.stopPropagation()
        if (index === 0) return
        const newLayers = [...activeScene.layers]
        const temp = newLayers[index - 1]
        newLayers[index - 1] = newLayers[index]
        newLayers[index] = temp
        onUpdateScene(activeScene.id, { layers: newLayers })
    }

    const moveLayerDown = (e, index) => {
        e.stopPropagation()
        if (index === activeScene.layers.length - 1) return
        const newLayers = [...activeScene.layers]
        const temp = newLayers[index + 1]
        newLayers[index + 1] = newLayers[index]
        newLayers[index] = temp
        onUpdateScene(activeScene.id, { layers: newLayers })
    }

    const duplicateLayer = (e, layer) => {
        e.stopPropagation()
        const newLayer = { ...layer, id: `layer-${Date.now()}`, y: (layer.y || 0) + 5, x: (layer.x || 0) + 5 }
        onUpdateScene(activeScene.id, { layers: [...activeScene.layers, newLayer] })
    }

    return (
        <div className="timeline-editor-root">
            <style>{`
          /* =====================================================
             PREMIUM TIMELINE STYLING (THEME-AWARE)
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
            padding: 0 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: var(--bg-card);
            border-bottom: 1px solid var(--border-color);
            height: 48px;
            flex-shrink: 0;
          }

          .toolbar-section {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .timeline-container {
            display: grid;
            grid-template-columns: 180px 1fr;
            overflow-y: auto;
            overflow-x: hidden;
            flex: 1;
            background: var(--bg-main);
          }

          .timeline-labels {
            background: var(--bg-card);
            border-right: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            padding-top: 24px;
            overflow-y: scroll;
            scrollbar-width: none;
          }
          
          .timeline-labels::-webkit-scrollbar {
            display: none;
          }

          .track-label {
            height: 50px;
            display: flex;
            align-items: center;
            padding: 0 16px;
            font-size: 11px;
            font-weight: 500;
            color: var(--text-muted);
            letter-spacing: 0.5px;
          }

          .track-label-icon {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 10px;
            color: var(--text-muted);
          }

          .timeline-viewport {
            position: relative;
            overflow-x: scroll;
            overflow-y: scroll;
            background: var(--bg-main);
            scrollbar-width: thin;
            scrollbar-color: var(--border-color) transparent;
          }

          .timeline-ruler {
            height: 24px;
            background: var(--bg-card);
            position: sticky;
            top: 0;
            z-index: 50;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: flex-end;
            pointer-events: none;
          }

          .ruler-tick {
            position: absolute;
            height: 4px;
            width: 1px;
            background: var(--border-color);
            bottom: 0;
          }

          .ruler-tick.major {
            height: 8px;
            background: var(--text-muted);
          }

          .ruler-label {
            position: absolute;
            bottom: 10px;
            font-size: 10px;
            color: var(--text-muted);
            font-family: 'JetBrains Mono', monospace;
            transform: translateX(-50%);
          }

          .canva-clip {
            position: absolute;
            height: 46px;
            background: #2b3648;
            border-radius: 4px;
            border: 1px solid #3b465a;
            cursor: grab;
            display: flex;
            align-items: center;
            overflow: hidden;
            transition: all 0.1s;
            margin-top: 2px;
          }

          .canva-clip.active {
            border: 2px solid #facc15;
            z-index: 10;
          }

          .canva-clip.drag-over {
            border: 2px dashed #facc15;
            opacity: 0.8;
          }

          .clip-thumb {
            width: 40px;
            height: 100%;
            background: #1f2937;
            background-size: cover;
            background-position: center;
            border-right: 1px solid rgba(255,255,255,0.1);
          }

          .clip-info {
            padding: 0 10px;
            color: #f3f4f6;
            display: flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
          }

          .clip-name {
            font-size: 12px;
            font-weight: 500;
          }

          .clip-trim-handle {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 12px;
            cursor: ew-resize;
            display: none;
            align-items: center;
            justify-content: center;
            background: #facc15;
            z-index: 15;
          }
          
          .canva-clip.active .clip-trim-handle {
             display: flex;
          }

          .clip-trim-handle.left { left: 0; border-radius: 4px 0 0 4px; }
          .clip-trim-handle.right { right: 0; border-radius: 0 4px 4px 0; }
          
          .clip-trim-handle::after {
            content: "";
            width: 2px;
            height: 12px;
            background: rgba(0,0,0,0.5);
            border-radius: 2px;
          }

          .clip-meta {
            display: none;
          }

          .playhead {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 1px;
            background: #e5e7eb;
            z-index: 100;
            pointer-events: none;
            box-shadow: 0 0 4px rgba(255,255,255,0.2);
          }

          .playhead-head {
            position: absolute;
            top: 0px;
            left: -6px;
            width: 13px;
            height: 16px;
            background: #d1d5db;
            border-radius: 2px;
            border-bottom-left-radius: 6px;
            border-bottom-right-radius: 6px;
            pointer-events: auto;
            cursor: grab;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .playhead-head::after {
             content: "";
             width: 5px;
             height: 2px;
             background: #4b5563;
             border-radius: 1px;
          }

          .playhead-tooltip {
            display: none;
          }

          .toolbar-btn {
            background: transparent;
            border: none;
            color: #9ca3af;
            width: 32px;
            height: 32px;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.1s;
          }

          .toolbar-btn:hover {
            background: #2a2e39;
            color: #fff;
          }

          .toolbar-btn.primary {
            width: 36px;
            height: 36px;
            background: #2a2e39;
            color: #fff;
          }

          .music-clip {
              background: linear-gradient(90deg, #065f46 0%, #047857 100%);
              border: 1px solid #059669;
              color: #fff;
              border-radius: 6px;
              height: 36px;
              margin-top: 6px;
              display: flex;
              align-items: center;
              padding: 0 10px;
              position: absolute;
          }

          .clip-track {
            height: 50px;
            display: flex;
            align-items: center;
            position: relative;
            background: var(--bg-main);
          }

          .music-track {
            height: 50px;
            display: flex;
            align-items: center;
            position: relative;
            background: var(--bg-main);
          }

          .layer-track {
            height: 38px;
            display: flex;
            align-items: center;
            position: relative;
            background: var(--bg-main);
          }

        .layer-clip {
            position: absolute;
            height: 28px;
            background: #581c87;
            border: 1px solid #7e22ce;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 10px;
            color: #fff;
            font-size: 12px;
            overflow: hidden;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            font-weight: 500;
        }

        .layer-clip:hover {
            border-color: #a855f7;
        }

        .layer-clip-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            background: rgba(255,255,255,0.1);
            border-radius: 4px;
            margin-right: 8px;
            flex-shrink: 0;
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

        .timeline-empty-state {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-main);
            z-index: 60;
        }

        .empty-state-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px;
            border: 1px dashed var(--border-color);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
            background: var(--bg-card);
        }

        .empty-state-card:hover {
            border-color: var(--primary);
            background: var(--bg-surface);
        }

        .empty-add-btn {
            width: 48px;
            height: 48px;
            background: var(--primary);
            color: #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
            transition: transform 0.2s;
        }

        .empty-state-card:hover .empty-add-btn {
            transform: scale(1.05);
        }

        .empty-state-card h3 {
            margin: 0 0 8px 0;
            color: var(--text-main);
            font-size: 16px;
            font-weight: 500;
        }

        .empty-state-card p {
            margin: 0 0 12px 0;
            color: var(--text-muted);
            font-size: 13px;
        }

        .empty-hint {
            font-size: 11px;
            color: #9ca3af;
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
                    <button className="toolbar-btn" title="Zoom Out" onClick={() => setZoom(z => Math.max(10, z - 10))}><MdZoomOut /></button>
                    <button className="toolbar-btn" title="Zoom In" onClick={() => setZoom(z => Math.min(200, z + 10))}><MdZoomIn /></button>
                </div>

                <div className="toolbar-section">
                   <button className="toolbar-btn" onClick={onAddScene} title="Add Scene"><MdAdd size={20} /></button>
                   <button className="toolbar-btn" title="Delete" onClick={() => onDeleteScene(activeSceneId)}><MdDelete size={18} /></button>
                </div>
            </div>

            <div className="timeline-container">
                <div className="timeline-labels" ref={labelsRef} onScroll={handleLabelsScroll}>
                    {/* Layer Tracks (Rendered ABOVE Scenes) */}
                    {(() => {
                        const currentActiveScene = scenes.find(s => s.id === activeSceneId);
                        return currentActiveScene?.layers?.map((layer, idx) => (
                            <div key={`layer-label-${layer.id}`} className="track-label" style={{ height: '38px', justifyContent: 'space-between', paddingRight: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', maxWidth: '80%' }}>
                                    <div className="track-label-icon" style={{width: 16, height: 16, fontSize: 10}}><MdContentCopy size={12}/></div>
                                    <div style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                                        Ef : {layer.type}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                                    <button onClick={(e) => moveLayerUp(e, idx)} style={{background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 0}} title="Move Layer Up"><MdKeyboardArrowUp size={14}/></button>
                                    <button onClick={(e) => moveLayerDown(e, idx)} style={{background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 0}} title="Move Layer Down"><MdKeyboardArrowDown size={14}/></button>
                                </div>
                            </div>
                        ));
                    })()}
                    
                    <div className="track-label" style={{ height: '50px' }}>
                        <div className="track-label-icon"><MdVideoLibrary size={16} /></div>
                        Video
                    </div>
                    <div className="track-label" style={{ height: '50px' }}>
                        <div className="track-label-icon"><MdMusicNote size={16} /></div>
                        Audio
                    </div>
                </div>

                <div
                    className="timeline-viewport"
                    ref={scrollContainerRef}
                    onMouseDown={handleMouseDown}
                    onScroll={handleViewportScroll}
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
                                        <MdAdd size={24} />
                                    </div>
                                    <h3>Start Your Masterpiece</h3>
                                    <p>Select a scene template to begin</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Active Scene Layer Tracks (TOP) */}
                                {(() => {
                                   const activeScene = scenes.find(s => s.id === activeSceneId);
                                   const activeSceneStartLocal = scenes.slice(0, scenes.findIndex(s => s.id === activeSceneId)).reduce((sum, s) => sum + (s.duration || 8), 0)
                                   return activeScene?.layers?.map((layer, index) => {
                                       const layerStart = layer.start || 0
                                       const layerDuration = layer.duration || activeScene.duration || 8
                                       const layerAbsoluteStart = activeSceneStartLocal + layerStart
                                       return (
                                           <div key={layer.id} className="layer-track">
                                               <div 
                                                   className="layer-clip" 
                                                   onMouseDown={(e) => startLayerDrag(e, layer)}
                                                   onClick={(e) => {
                                                       e.stopPropagation();
                                                       if (onSelectLayer) onSelectLayer(layer.id);
                                                   }}
                                                   style={{
                                                       left: layerAbsoluteStart * zoom,
                                                       width: layerDuration * zoom,
                                                       cursor: 'grab'
                                                   }}
                                               >
                                                   <div className="layer-clip-icon">
                                                       <MdContentCopy size={12} />
                                                   </div>
                                                   <span>{layer.type.toUpperCase()}</span>
                                                   <button className="delete-clip-btn" onClick={(e) => { e.stopPropagation(); onDeleteLayer(activeScene.id, layer.id) }}>×</button>
                                                   
                                                   <div 
                                                       style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', cursor: 'ew-resize'}} 
                                                       onMouseDown={(e) => startLayerResize(e, layer, 'left')} 
                                                   />
                                                   <div 
                                                       style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '4px', cursor: 'ew-resize'}} 
                                                       onMouseDown={(e) => startLayerResize(e, layer, 'right')} 
                                                   />
                                               </div>
                                           </div>
                                       )
                                   })
                                })()}

                                {/* Main Track (MIDDLE) */}
                                <div className="clip-track">
                                    {scenes.map((scene, index) => {
                                        const prevDuration = scenes.slice(0, index).reduce((sum, s) => sum + (s.duration || 8), 0)
                                        return (
                                            <div
                                                key={scene.id}
                                                className={`canva-clip ${activeSceneId === scene.id ? 'active' : ''} ${dragOverSceneId === scene.id ? 'drag-over' : ''}`}
                                                draggable
                                                onDragStart={(e) => onDragStart(e, scene.id)}
                                                onDragOver={onDragOver}
                                                onDrop={(e) => onDrop(e, scene.id)}
                                                onClick={() => onSelectScene(scene.id)}
                                                style={{ left: prevDuration * zoom, width: (scene.duration || 8) * zoom }}
                                            >
                                                <div className="clip-thumb" style={{ backgroundImage: `url(${scene.backgroundImage || scene.avatar})` }} />
                                                <div className="clip-info">
                                                    <MdVideoLibrary size={14} color="#f3f4f6" />
                                                    <span className="clip-name">{scene.title || `Scene ${index + 1}`}</span>
                                                </div>
                                                
                                                <div className="clip-trim-handle left" onMouseDown={(e) => {
                                                  // Placeholder for main clip trimming if needed in future
                                                }} />
                                                <div className="clip-trim-handle right" onMouseDown={(e) => {
                                                  // Placeholder for main clip trimming
                                                }} />
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Music Track (BOTTOM) */}
                                <div className="music-track">
                                    {bgMusic && (
                                        <div className="music-clip" style={{ left: 0, width: musicDuration * zoom }}>
                                            <MdMusicNote size={14} style={{ marginRight: 6 }} /> <span>{bgMusic.split('/').pop().slice(0, 15)}...</span>
                                            <div className="music-waveform" />
                                            <div className="music-trim-handle" onMouseDown={(e) => {
                                                e.stopPropagation();
                                                isDraggingMusicTrim.current = true;
                                            }} />
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
                                    <div className="playhead-head" onMouseDown={handleMouseDown} />
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
