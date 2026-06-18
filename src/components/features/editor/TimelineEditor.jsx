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
    MdContentCopy,
    MdImage,
    MdTextFields,
    MdSmartDisplay,
    MdPerson,
    MdClose,
    MdZoomOutMap,
    MdViewTimeline,
} from 'react-icons/md'
import { getClipTextContent } from '../../../utils/textClip'
import { isAvatarClip, findSceneAvatarClip } from '../../../utils/heygenVideo'
import {
    computeFitZoom,
    buildRulerTicks,
    formatRulerLabel,
    DEFAULT_ZOOM,
    MIN_ZOOM,
    MAX_ZOOM,
} from '../../../utils/timelineScaleUtils'

const TimelineEditor = ({
    scenes,
    bgMusic,
    activeSceneId,
    currentTime,
    isPlaying,
    onSeek,
    onSelectScene,
    onSelectAvatarVideo,
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
    onSelectLayer,
    selectedLayerId = null,
    selectedLayerIds = [],
    timelineScope = 'all',
    setTimelineScope,
    onUndo,
    onRedo,
    canUndo = false,
    canRedo = false,
    onDuplicateLayer,
    onCopyLayer,
    onMoveLayerOrder,
}) => {
    const [zoom, setZoom] = useState(DEFAULT_ZOOM)
    const [zoomMode, setZoomMode] = useState('auto')
    const [viewportWidth, setViewportWidth] = useState(0)
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

    const scopedScenes = useMemo(() => {
        if (timelineScope === 'single' && activeScene) {
            return [activeScene];
        }
        return scenes;
    }, [scenes, timelineScope, activeScene]);

    const effectiveTotalDuration = useMemo(() => {
        return timelineScope === 'single' ? (activeScene?.duration || 8.0) : totalDuration;
    }, [timelineScope, activeScene, totalDuration]);

    const effectiveCurrentTime = useMemo(() => {
        return timelineScope === 'single' 
            ? Math.max(0, Math.min(activeScene?.duration || 8.0, currentTime - activeSceneStart)) 
            : currentTime;
    }, [timelineScope, activeScene, currentTime, activeSceneStart]);

    const rulerTicks = useMemo(
        () => buildRulerTicks(effectiveTotalDuration, zoom),
        [effectiveTotalDuration, zoom],
    )

    const canvasWidth = useMemo(() => {
        const contentWidth = Math.max(effectiveTotalDuration, 1) * zoom + 16
        if (zoomMode === 'manual' && viewportWidth && contentWidth > viewportWidth) {
            return contentWidth + 500
        }
        return Math.max(viewportWidth || contentWidth, contentWidth)
    }, [effectiveTotalDuration, zoom, zoomMode, viewportWidth])

    // Calculate global tracks
    const globalTracks = useMemo(() => {
        const allClips = scopedScenes.reduce((acc, scene, sIdx) => {
            const prevDuration = timelineScope === 'single' ? 0 : scenes.slice(0, scenes.findIndex(s => s.id === scene.id)).reduce((sum, s) => sum + (s.duration || 8), 0);
            const sceneClips = (scene.clips || []).map((clip, clipIndex) => {
                const clipStart = clip.startTime || 0;
                const clipDuration = (clip.endTime || (clip.startTime + 5)) - clipStart;
                return {
                    ...clip,
                    sceneId: scene.id,
                    absoluteStart: prevDuration + clipStart,
                    absoluteEnd: prevDuration + clipStart + clipDuration,
                    clipDuration,
                    layerIndex: clipIndex
                };
            });
            return [...acc, ...sceneClips];
        }, []);

        const tracks = [];
        allClips.forEach(clip => {
            const index = clip.layerIndex;
            if (!tracks[index]) tracks[index] = [];
            tracks[index].push(clip);
        });

        // Filter out any undefined slots if some layers were deleted leaving gaps
        return tracks.filter(Boolean);
    }, [scopedScenes, scenes, timelineScope]);

    const stateRef = useRef({ zoom, activeSceneStart, activeScene, totalDuration: effectiveTotalDuration, scenes, globalTracks, timelineScope })
    useEffect(() => {
        stateRef.current = { zoom, activeSceneStart, activeScene, totalDuration: effectiveTotalDuration, scenes, globalTracks, timelineScope }
    })

    useEffect(() => {
        const el = scrollContainerRef.current
        if (!el) return undefined

        const updateWidth = () => setViewportWidth(el.clientWidth)
        updateWidth()

        const observer = new ResizeObserver(() => updateWidth())
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        setZoomMode('auto')
    }, [timelineScope])

    useEffect(() => {
        if (zoomMode !== 'auto') return
        const width = viewportWidth || scrollContainerRef.current?.clientWidth
        if (!width || !effectiveTotalDuration) return

        if (timelineScope === 'single') {
            setZoom(computeFitZoom(effectiveTotalDuration, width))
            return
        }

        const naturalWidth = effectiveTotalDuration * DEFAULT_ZOOM
        if (naturalWidth > width) {
            setZoom(computeFitZoom(effectiveTotalDuration, width))
        } else {
            setZoom(DEFAULT_ZOOM)
        }
    }, [zoomMode, timelineScope, effectiveTotalDuration, viewportWidth, activeSceneId])

    const handleManualZoomOut = () => {
        setZoomMode('manual')
        setZoom((z) => Math.max(MIN_ZOOM, z - 10))
    }

    const handleManualZoomIn = () => {
        setZoomMode('manual')
        setZoom((z) => Math.min(MAX_ZOOM, z + 10))
    }

    const handleFitTimeline = () => {
        setZoomMode('auto')
    }

    const handleFullTimeline = () => {
        setTimelineScope?.('all')
        setZoomMode('auto')
    }

    const handleSceneBarClick = (sceneId) => {
        setZoomMode('auto')
        onSelectScene?.(sceneId, { scope: 'single' })
    }

    // Auto-scroll during playback
    useEffect(() => {
        if (isPlaying && scrollContainerRef.current) {
            const container = scrollContainerRef.current
            const playheadPosition = effectiveCurrentTime * zoom
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
    }, [effectiveCurrentTime, isPlaying, zoom])

    // Scrubbing logic
    const handleTimelineAction = (clientX) => {
        if (!scrollContainerRef.current) return
        const rect = scrollContainerRef.current.getBoundingClientRect()
        const x = clientX - rect.left + scrollContainerRef.current.scrollLeft
        const time = Math.max(0, Math.min(x / zoom, effectiveTotalDuration))
        if (timelineScope === 'single') {
            onSeek(activeSceneStart + time)
        } else {
            onSeek(time)
        }
    }

    const handleMouseDown = (e) => {
        const isClipInteraction =
            e.target.closest('.layer-clip') ||
            e.target.closest('.canva-clip') ||
            e.target.closest('.clip-trim-handle') ||
            e.target.closest('.music-trim-handle') ||
            e.target.closest('.add-scene-timeline-btn')

        if (!isClipInteraction && (
            e.target.closest('.playhead-head') ||
            e.target.closest('.timeline-ruler') ||
            e.target.closest('.clip-track') ||
            e.target.closest('.music-track') ||
            e.target.closest('.layer-track')
        )) {
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
        const { zoom, totalDuration, scenes, activeSceneStart, timelineScope: scope } = stateRef.current
        const rect = scrollContainerRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left + scrollContainerRef.current.scrollLeft
        
        if (isDraggingPlayhead.current) {
            const time = Math.max(0, Math.min(x / zoom, totalDuration))
            if (scope === 'single') {
                onSeek(activeSceneStart + time)
            } else {
                onSeek(time)
            }
        } else if (isDraggingMusicTrim.current) {
            const newDuration = Math.max(1, Math.min(x / zoom, totalDuration))
            if (onMusicDurationChange) onMusicDurationChange(newDuration)
        } else if (resizingLayerRef.current) {
            const { clip, sceneId, sceneStart } = resizingLayerRef.current
            const timeAtCursor = Math.max(0, (x / zoom) - sceneStart)
            const scene = scenes.find(s => s.id === sceneId)
            
            if (resizeSideRef.current === 'right') {
                const newDuration = Math.max(0.5, timeAtCursor - (clip.startTime || 0))
                updateLayerWithState(clip.id, { duration: newDuration, endTime: (clip.startTime || 0) + newDuration }, scene)
            } else if (resizeSideRef.current === 'left') {
                const end = (clip.startTime || 0) + (clip.duration || scene?.duration || 8)
                const newStart = Math.min(timeAtCursor, end - 0.5)
                const newDuration = end - newStart
                updateLayerWithState(clip.id, { startTime: newStart, duration: newDuration, endTime: end }, scene)
            }
        } else if (draggingLayerRef.current) {
            const { clip, sceneId, sceneStart, offsetX } = draggingLayerRef.current
            const timeAtCursor = Math.max(0, (x / zoom) - sceneStart - offsetX)
            const scene = scenes.find(s => s.id === sceneId)
            updateLayerWithState(clip.id, { startTime: timeAtCursor, endTime: timeAtCursor + (clip.duration || 5) }, scene)
        }
    }

    const updateLayerWithState = (layerId, updates, targetScene) => {
        if (!targetScene) return
        const newClips = targetScene.clips.map(l => 
            l.id === layerId ? { ...l, ...updates } : l
        )
        onUpdateScene(targetScene.id, { clips: newClips })
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

    const startLayerDrag = (e, clip, sceneId) => {
        e.stopPropagation()
        const { zoom, scenes } = stateRef.current
        const rect = scrollContainerRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left + scrollContainerRef.current.scrollLeft
        
        const sceneIndex = scenes.findIndex(s => s.id === sceneId)
        const sceneStart = scenes.slice(0, sceneIndex).reduce((sum, s) => sum + (s.duration || 8), 0)
        
        const timeAtCursor = (x / zoom) - sceneStart
        draggingLayerRef.current = { clip, sceneId, sceneStart, offsetX: timeAtCursor - (clip.startTime || 0) }
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
    }

    const startLayerResize = (e, clip, side, sceneId) => {
        e.stopPropagation()
        const { scenes } = stateRef.current
        const sceneIndex = scenes.findIndex(s => s.id === sceneId)
        const sceneStart = scenes.slice(0, sceneIndex).reduce((sum, s) => sum + (s.duration || 8), 0)

        resizingLayerRef.current = { clip, side, sceneId, sceneStart }
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
        const newClips = [...activeScene.clips]
        const temp = newClips[index - 1]
        newClips[index - 1] = newClips[index]
        newClips[index] = temp
        onUpdateScene(activeScene.id, { clips: newClips })
    }

    const moveLayerDown = (e, index) => {
        e.stopPropagation()
        if (index === activeScene.clips.length - 1) return
        const newClips = [...activeScene.clips]
        const temp = newClips[index + 1]
        newClips[index + 1] = newClips[index]
        newClips[index] = temp
        onUpdateScene(activeScene.id, { clips: newClips })
    }

    const timelineCanvasHeight = 24 + globalTracks.length * 49 + 50 + 50

    return (
        <div className="timeline-editor-root">
            <style>{`
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

          .timeline-canvas {
            position: relative;
            min-height: 100%;
          }

          .timeline-ruler {
            height: 24px;
            background: var(--bg-card);
            position: relative;
            z-index: 20;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: flex-end;
            pointer-events: auto;
            cursor: pointer;
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
            height: 48px;
            background: linear-gradient(180deg, #2b3648 0%, #1f2937 100%);
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            cursor: grab;
            display: flex;
            align-items: center;
            overflow: hidden;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            margin-top: 1px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }

          .canva-clip:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
            border-color: rgba(255, 255, 255, 0.2);
          }

          .canva-clip.active {
            border: 2px solid var(--primary);
            box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.3), 0 4px 16px rgba(0,0,0,0.4);
            z-index: 10;
          }

          .canva-clip--avatar-selected {
            border-color: var(--primary);
            box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.35), 0 4px 16px rgba(var(--primary-rgb), 0.25);
          }

          .canva-clip.drag-over {
            border: 2px dashed var(--primary);
            opacity: 0.8;
          }

          .clip-thumb {
            width: 44px;
            height: 100%;
            background: #1f2937;
            background-size: cover;
            background-position: center;
            border-right: 1px solid rgba(255,255,255,0.1);
          }

          .clip-info {
            padding: 0 12px;
            color: #f3f4f6;
            display: flex;
            align-items: center;
            gap: 8px;
            white-space: nowrap;
          }

          .clip-name {
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 0.2px;
          }

          .clip-trim-handle {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 14px;
            cursor: ew-resize;
            display: none;
            align-items: center;
            justify-content: center;
            background: var(--primary);
            z-index: 15;
            transition: opacity 0.2s;
          }
          
          .canva-clip.active .clip-trim-handle {
             display: flex;
          }

          .clip-trim-handle.left { left: 0; border-radius: 6px 0 0 6px; }
          .clip-trim-handle.right { right: 0; border-radius: 0 6px 6px 0; }
          
          .clip-trim-handle::after {
            content: "";
            width: 2px;
            height: 14px;
            background: rgba(255,255,255,0.6);
            border-radius: 2px;
          }

          .playhead {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 3px;
            margin-left: -1px;
            background: linear-gradient(180deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 70%, #6366f1) 100%);
            z-index: 500;
            pointer-events: none;
            box-shadow:
              0 0 0 1px rgba(255, 255, 255, 0.9),
              0 0 12px rgba(var(--primary-rgb), 0.55);
          }

          .playhead::after {
            content: '';
            position: absolute;
            top: 0;
            bottom: 0;
            left: 50%;
            width: 1px;
            transform: translateX(-50%);
            background: rgba(255, 255, 255, 0.55);
          }

          .playhead-head {
            position: absolute;
            top: 2px;
            left: 50%;
            transform: translateX(-50%);
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: var(--primary);
            border: 2px solid #ffffff;
            pointer-events: auto;
            cursor: grab;
            box-shadow: 0 2px 8px rgba(var(--primary-rgb), 0.5);
            transition: transform 0.1s;
          }
          
          .playhead-head:hover {
            transform: translateX(-50%) scale(1.15);
          }

          .playhead-head::after {
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
            background: rgba(var(--primary-rgb), 0.78);
            backdrop-filter: blur(4px);
            border: 1px solid rgba(255, 255, 255, 0.14);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 8px;
            color: #fff;
            font-size: 11px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            font-weight: 500;
            transition: all 0.2s ease;
        }

        .layer-clip:hover {
            border-color: rgba(255, 255, 255, 0.32);
            background: rgba(var(--primary-rgb), 0.92);
            box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.28);
        }

        .layer-clip.selected-layer-clip {
            border: 2px solid var(--primary);
            box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.28);
        }

        .timeline-clip-remove {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            margin-left: 6px;
            padding: 0;
            border: 1px solid rgba(255, 255, 255, 0.22);
            border-radius: 6px;
            background: rgba(15, 23, 42, 0.35);
            color: rgba(255, 255, 255, 0.88);
            cursor: pointer;
            flex-shrink: 0;
            transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.12s ease;
        }

        .timeline-clip-remove:hover {
            background: rgba(var(--primary-rgb), 0.85);
            border-color: rgba(255, 255, 255, 0.45);
            color: #fff;
            transform: scale(1.05);
        }

        .timeline-clip-remove:active {
            transform: scale(0.96);
        }

        .layer-clip-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 22px;
            height: 22px;
            background: rgba(255,255,255,0.15);
            border-radius: 6px;
            margin-right: 6px;
            flex-shrink: 0;
            color: #f3f4f6;
        }

        .layer-clip-thumb {
            width: 24px;
            height: 24px;
            border-radius: 4px;
            margin-right: 6px;
            background-size: cover;
            background-position: center;
            flex-shrink: 0;
            border: 1px solid rgba(255,255,255,0.2);
        }

          .music-trim-handle {
              position: absolute;
              right: 0;
              top: 0;
              bottom: 0;
              width: 10px;
              cursor: ew-resize;
              background: rgba(255,255,255,0.2);
              border-radius: 0 6px 6px 0;
          }

          .music-clip-empty {
              background: rgba(156, 163, 175, 0.05);
              border: 1px dashed rgba(156, 163, 175, 0.3);
              border-radius: 6px;
              height: 36px;
              margin-top: 6px;
              display: flex;
              align-items: center;
              padding: 0 10px;
              position: absolute;
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
      `}</style>

            <div className="timeline-toolbar" style={{ position: 'relative' }}>
                <div className="toolbar-section">
                    <button
                      className={`toolbar-btn ${!canUndo ? 'disabled' : ''}`}
                      title="Undo (Ctrl+Z)"
                      onClick={onUndo}
                      disabled={!canUndo}
                    >
                      <MdUndo />
                    </button>
                    <button
                      className={`toolbar-btn ${!canRedo ? 'disabled' : ''}`}
                      title="Redo (Ctrl+Y)"
                      onClick={onRedo}
                      disabled={!canRedo}
                    >
                      <MdRedo />
                    </button>
                    {selectedLayerId && (
                      <>
                        <div style={{ width: '1px', height: '20px', background: 'var(--border-color)', margin: '0 8px' }} />
                        <button className="toolbar-btn" title="Copy (Ctrl+C)" onClick={onCopyLayer}><MdContentCopy size={16} /></button>
                        <button className="toolbar-btn" title="Duplicate (Ctrl+D)" onClick={onDuplicateLayer}><MdContentCopy size={16} style={{ opacity: 0.6 }} /></button>
                        <button
                          className="toolbar-btn"
                          title="Bring forward"
                          onClick={() => onMoveLayerOrder?.(selectedLayerId, 'forward')}
                        >
                          <MdKeyboardArrowUp size={18} />
                        </button>
                        <button
                          className="toolbar-btn"
                          title="Send backward"
                          onClick={() => onMoveLayerOrder?.(selectedLayerId, 'backward')}
                        >
                          <MdKeyboardArrowDown size={18} />
                        </button>
                      </>
                    )}
                </div>

                <div className="toolbar-section" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', marginRight: '12px' }}>
                        {Math.floor(effectiveCurrentTime / 60)}:{(Math.floor(effectiveCurrentTime % 60)).toString().padStart(2, '0')}
                    </span>
                    <button className="toolbar-btn primary" onClick={onPlayPause} style={{ borderRadius: '50%', width: '40px', height: '40px', background: 'var(--bg-card)' }}>
                        {isPlaying ? <MdPause size={24} color="var(--text-main)" /> : <MdPlayArrow size={24} color="var(--text-main)" />}
                    </button>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-muted)', marginLeft: '12px' }}>
                        {Math.floor(effectiveTotalDuration / 60)}:{(Math.floor(effectiveTotalDuration % 60)).toString().padStart(2, '0')}
                    </span>
                </div>

                <div className="toolbar-section">
                    {timelineScope === 'single' && (
                      <>
                        <button
                          className="toolbar-btn"
                          title="Full timeline"
                          onClick={handleFullTimeline}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingInline: '10px' }}
                        >
                          <MdViewTimeline size={18} />
                          <span style={{ fontSize: '12px', fontWeight: 600 }}>Full timeline</span>
                        </button>
                        <div style={{ width: '1px', height: '20px', background: 'var(--border-color)', margin: '0 8px' }} />
                      </>
                    )}
                    <button className="toolbar-btn" title="Zoom Out" onClick={handleManualZoomOut}><MdZoomOut /></button>
                    <button className="toolbar-btn" title="Zoom In" onClick={handleManualZoomIn}><MdZoomIn /></button>
                    <button
                      className="toolbar-btn"
                      title="Fit timeline"
                      onClick={handleFitTimeline}
                      style={zoomMode === 'manual' ? { color: 'var(--primary)' } : undefined}
                    >
                      <MdZoomOutMap size={18} />
                    </button>
                    <div style={{ width: '1px', height: '20px', background: 'var(--border-color)', margin: '0 8px' }}></div>
                    <button className="toolbar-btn" onClick={onAddScene} title="Add Scene"><MdAdd size={20} /></button>
                    <button className="toolbar-btn" title="Delete" onClick={() => onDeleteScene(activeSceneId)}><MdDelete size={18} /></button>
                </div>
            </div>

            <div className="timeline-container">
                <div className="timeline-labels" ref={labelsRef} onScroll={handleLabelsScroll}>
                    <div style={{ height: '24px', minHeight: '24px', position: 'sticky', top: 0, background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', zIndex: 10 }}></div>
                        {globalTracks.map((track, idx) => {
                            // Find the most prominent type in this track
                            const types = track.map(c => c.type);
                            const dominantType = types.sort((a,b) => types.filter(v => v===a).length - types.filter(v => v===b).length).pop() || 'layer';
                            return (
                                <div key={`track-label-${idx}`} className="track-label" style={{ height: '49px', justifyContent: 'space-between', paddingRight: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', maxWidth: '80%' }}>
                                        <div className="track-label-icon" style={{width: 16, height: 16, fontSize: 10}}><MdContentCopy size={12}/></div>
                                        <div style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                                            Track {idx + 1} ({dominantType})
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                                        <button
                                          onClick={(e) => moveLayerUp(e, idx)}
                                          style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 0 }}
                                          title="Move track up"
                                        >
                                          <MdKeyboardArrowUp size={14}/>
                                        </button>
                                        <button
                                          onClick={(e) => moveLayerDown(e, idx)}
                                          style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 0 }}
                                          title="Move track down"
                                        >
                                          <MdKeyboardArrowDown size={14}/>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    
                    <div className="track-label" style={{ height: '50px' }}>
                        <div className="track-label-icon"><MdPerson size={16} /></div>
                        Avatar Video
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
                    <div
                        className="timeline-canvas"
                        style={{
                            width: `${canvasWidth}px`,
                            minHeight: timelineCanvasHeight,
                            height: timelineCanvasHeight,
                        }}
                    >
                    <div className="timeline-ruler">
                        {rulerTicks.map((tick) => (
                            <div
                                key={`${tick.time}-${tick.isMajor ? 'major' : 'minor'}`}
                                className={`ruler-tick ${tick.isMajor ? 'major' : ''}`}
                                style={{ left: `${tick.time * zoom}px` }}
                            >
                                {tick.isMajor && (
                                    <span className="ruler-label">{formatRulerLabel(tick.time)}</span>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="timeline-tracks">
                        {scopedScenes.length === 0 ? (
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
                                {globalTracks.map((track, trackIdx) => (
                                    <div key={`track-${trackIdx}`} className="layer-track" style={{ position: 'relative', height: '49px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        {track.map(clip => (
                                            <div 
                                                key={clip.id}
                                                className={`layer-clip ${clip.sceneId === activeSceneId ? 'active-scene-clip' : ''} ${selectedLayerIds.includes(clip.id) || selectedLayerId === clip.id ? 'selected-layer-clip' : ''}`}
                                                onMouseDown={(e) => startLayerDrag(e, clip, clip.sceneId)}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (onSelectLayer) onSelectLayer(clip.id, clip.sceneId, e);
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    left: clip.absoluteStart * zoom,
                                                    width: clip.clipDuration * zoom,
                                                    height: '40px',
                                                    top: '4px',
                                                    cursor: 'grab',
                                                    opacity: clip.sceneId === activeSceneId ? 1 : 0.6
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                                                    {(clip.type === 'image' || clip.type === 'video' || clip.type === 'avatar') && clip.src ? (
                                                        <div className="layer-clip-thumb" style={{ backgroundImage: `url(${clip.src})` }} />
                                                    ) : (
                                                        <div className="layer-clip-icon">
                                                            {clip.type === 'text' ? <MdTextFields size={12} /> :
                                                             isAvatarClip(clip) ? <MdPerson size={12} /> :
                                                             clip.type === 'video' ? <MdSmartDisplay size={12} /> :
                                                             clip.type === 'image' ? <MdImage size={12} /> :
                                                             <MdContentCopy size={12} />}
                                                        </div>
                                                    )}
                                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80px', paddingRight: '4px' }}>
                                                        {isAvatarClip(clip)
                                                          ? 'Avatar Video'
                                                          : (getClipTextContent(clip) || clip.type.toUpperCase())}
                                                    </span>
                                                </div>
                                                {clip.sceneId === activeSceneId && (
                                                    <button
                                                      type="button"
                                                      className="timeline-clip-remove"
                                                      title="Remove layer"
                                                      aria-label="Remove layer"
                                                      onClick={(e) => { e.stopPropagation(); onDeleteLayer(clip.sceneId, clip.id) }}
                                                    >
                                                      <MdClose size={12} />
                                                    </button>
                                                )}
                                                
                                                {clip.sceneId === activeSceneId && (
                                                    <>
                                                        <div 
                                                            style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', cursor: 'ew-resize'}} 
                                                            onMouseDown={(e) => startLayerResize(e, clip, 'left', clip.sceneId)} 
                                                        />
                                                        <div 
                                                            style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '4px', cursor: 'ew-resize'}} 
                                                            onMouseDown={(e) => startLayerResize(e, clip, 'right', clip.sceneId)} 
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ))}

                                {/* Main Track (MIDDLE) */}
                                <div className="clip-track">
                                    {scopedScenes.map((scene, index) => {
                                        const prevDuration = timelineScope === 'single' ? 0 : scenes.slice(0, scenes.findIndex(s => s.id === scene.id)).reduce((sum, s) => sum + (s.duration || 8), 0)
                                        return (
                                            <div
                                                key={scene.id}
                                                className={`canva-clip ${activeSceneId === scene.id ? 'active' : ''} ${dragOverSceneId === scene.id ? 'drag-over' : ''} ${selectedLayerId && findSceneAvatarClip(scene)?.id === selectedLayerId && activeSceneId === scene.id ? 'canva-clip--avatar-selected' : ''}`}
                                                draggable={timelineScope !== 'single'}
                                                onDragStart={(e) => onDragStart(e, scene.id)}
                                                onDragOver={onDragOver}
                                                onDrop={(e) => onDrop(e, scene.id)}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleSceneBarClick(scene.id);
                                                }}
                                                style={{ left: prevDuration * zoom, width: (scene.duration || 8) * zoom }}
                                            >
                                                <div className="clip-thumb" style={{ backgroundImage: `url(${scene.backgroundImage || scene.avatar})` }} />
                                                <div className="clip-info">
                                                    <MdPerson size={14} color="#f3f4f6" />
                                                    <span className="clip-name">
                                                      {findSceneAvatarClip(scene) ? 'Avatar Video' : (scene.title || `Scene ${index + 1}`)}
                                                    </span>
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
                                    {timelineScope !== 'single' && (
                                        <div 
                                            onClick={onAddScene}
                                            style={{
                                                position: 'absolute',
                                                left: scenes.reduce((sum, s) => sum + (s.duration || 8), 0) * zoom + 16,
                                                height: '48px',
                                                width: '48px',
                                                background: 'linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 65%, #6366f1) 100%)',
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                color: '#ffffff',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                boxShadow: '0 4px 15px rgba(var(--primary-rgb), 0.4), inset 0 2px 4px rgba(255,255,255,0.3)',
                                                marginTop: '1px'
                                            }}
                                            className="add-scene-timeline-btn"
                                            title="Add New Scene"
                                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(var(--primary-rgb), 0.55), inset 0 2px 4px rgba(255,255,255,0.3)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1) translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(var(--primary-rgb), 0.4), inset 0 2px 4px rgba(255,255,255,0.3)'; }}
                                        >
                                            <MdAdd size={28} />
                                        </div>
                                    )}
                                </div>

                                {/* Music Track (BOTTOM) */}
                                <div className="music-track">
                                    {bgMusic ? (
                                        <div className="music-clip" style={{ left: timelineScope === 'single' ? -activeSceneStart * zoom : 0, width: musicDuration * zoom }}>
                                            <MdMusicNote size={14} style={{ marginRight: 6 }} /> <span>{bgMusic.split('/').pop().slice(0, 15)}...</span>
                                            <div className="music-waveform" />
                                            <div className="music-trim-handle" onMouseDown={(e) => {
                                                e.stopPropagation();
                                                isDraggingMusicTrim.current = true;
                                            }} />
                                        </div>
                                    ) : (
                                        <div className="music-clip-empty" style={{ left: 0, width: totalDuration * zoom }}>
                                            <MdMusicNote size={14} style={{ marginRight: 6 }} /> <span style={{ fontSize: '11px' }}>Audio Track</span>
                                            <div className="music-waveform" style={{ opacity: 0.1, filter: 'grayscale(100%)' }} />
                                        </div>
                                    )}
                                </div>

                            </>
                        )}
                    </div>

                    {scopedScenes.length > 0 && (
                        <div
                            className="playhead"
                            style={{
                                left: `${effectiveCurrentTime * zoom}px`,
                                height: timelineCanvasHeight,
                            }}
                        >
                            <div className="playhead-head" onMouseDown={handleMouseDown} />
                        </div>
                    )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TimelineEditor
