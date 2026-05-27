import { useRef, useState, useCallback, forwardRef, useImperativeHandle, useEffect } from 'react'
import { Player } from '@remotion/player'
import VideoComposition from './VideoComposition'
import LiveCanvasRenderer from './LiveCanvasRenderer'

const VideoCanvas = forwardRef(({
  scenes,
  bgMusic,
  bgMusicVolume,
  isPlaying,
  setIsPlaying,
  currentTime,
  setCurrentTime,
  zoomLevel,
  setZoomLevel,
  activeSceneId,
  setActiveSceneId,
  totalDurationInFrames,
  getSceneForFrame,
  speakText,
  onPlayerReady,
  selectedLayerId,
  setSelectedLayerId,
  onUpdateLayerPosition,
  onUpdateLayerSize,
  onAddScene,
  updateClipContent,
}, ref) => {
  const playerRef = useRef(null)
  const overlayRef = useRef(null)

  const setPlayerRef = useCallback((node) => {
    playerRef.current = node
    if (node && onPlayerReady) {
      onPlayerReady({
        seekTo: (time) => {
          node.seekTo(time * 30)
        },
        getCurrentFrame: () => {
          return node.getCurrentFrame()
        },
        play: () => {
          node.play()
        },
        pause: () => {
          node.pause()
        }
      })
    }
  }, [onPlayerReady])
  const [isDragging, setIsDragging] = useState(false)
  const [hoveredClipId, setHoveredClipId] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [dropIndicator, setDropIndicator] = useState(null)

  const activeScene = (scenes || []).find(s => s.id === activeSceneId)
  const clips = activeScene?.clips || []

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const totalDuration = totalDurationInFrames / 30

  const handlePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause()
      } else {
        playerRef.current.play()
      }
    }
  }

  const handleStop = () => {
    if (playerRef.current) {
      playerRef.current.pause()
      playerRef.current.seekTo(0)
    }
    setIsPlaying(false)
    setCurrentTime(0)
    window.speechSynthesis.cancel()
  }

  // Notify parent when player is ready
  useImperativeHandle(ref, () => ({
    seekTo: (time) => {
      if (playerRef.current) {
        playerRef.current.seekTo(time * 30)
      }
    },
    getCurrentFrame: () => {
      return playerRef.current ? playerRef.current.getCurrentFrame() : 0
    },
    play: () => {
      if (playerRef.current) playerRef.current.play()
    },
    pause: () => {
      if (playerRef.current) playerRef.current.pause()
    }
  }))

  // Callback ref replaces manual mount effect to avoid race condition

  // Removed dead getLayerStyle, handleResizeMouseDown, handleLayerMouseDown

  // Click on canvas background deselects
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      if (setSelectedLayerId) setSelectedLayerId(null)
    }
  }

  // Handle drag-over for elements dropped from sidebar
  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    const overlay = overlayRef.current
    if (!overlay) return
    const rect = overlay.getBoundingClientRect()
    setDropIndicator({
      x: ((e.clientX - rect.left) / rect.width) * 1920,
      y: ((e.clientY - rect.top) / rect.height) * 1080
    })
  }

  const handleDragLeave = () => {
    setDropIndicator(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDropIndicator(null)
    const overlay = overlayRef.current
    if (!overlay) return
    const rect = overlay.getBoundingClientRect()
    const dropX = ((e.clientX - rect.left) / rect.width) * 1920
    const dropY = ((e.clientY - rect.top) / rect.height) * 1080

    // Get dropped data
    const layerData = e.dataTransfer.getData('application/json')
    if (layerData) {
      try {
        const data = JSON.parse(layerData)
        // Dispatch custom event for parent to handle
        window.dispatchEvent(new CustomEvent('canvas-drop', {
          detail: { ...data, x: dropX, y: dropY }
        }))
      } catch (err) {
        console.warn('Invalid drop data:', err)
      }
    }
  }

  return (
    <div className="canvas-area">
      <div className="preview-container">
        <div
          className="preview-wrapper"
          style={{
            position: 'relative',
            '--canvas-zoom': (zoomLevel || 100) / 100,
          }}
        >
          {/* === EDITING VIEW: LiveCanvasRenderer shows real template UI === */}
          {!isPlaying && (
            <div 
              ref={overlayRef}
              onDragOver={handleDragOver}
              onDragLeave={() => setDropIndicator(null)}
              onDrop={handleDrop}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 15,
                // Maintain 16:9 aspect ratio
              }}
            >
              <LiveCanvasRenderer
                scene={activeScene}
                selectedId={selectedLayerId}
                onSelectClip={(id) => setSelectedLayerId && setSelectedLayerId(id)}
                onContentChange={(clipId, newText) => updateClipContent && updateClipContent(activeSceneId, clipId, newText)}
                onDeselect={() => setSelectedLayerId && setSelectedLayerId(null)}
                onUpdateLayerPosition={(clipId, x, y) => onUpdateLayerPosition && onUpdateLayerPosition(clipId, x, y)}
                onUpdateLayerSize={(clipId, w, h) => onUpdateLayerSize && onUpdateLayerSize(clipId, w, h)}
              />
            </div>
          )}

          {/* === REMOTION PLAYER: used for preview/export, hidden during editing === */}
          <Player
            ref={playerRef}
            component={VideoComposition}
            durationInFrames={Math.max(totalDurationInFrames, 1)}
            compositionWidth={1280}
            compositionHeight={720}
            fps={30}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'white',
              visibility: isPlaying ? 'visible' : 'hidden',
            }}
            inputProps={{
              scenes: scenes,
              bgMusic: bgMusic,
              bgMusicVolume: bgMusicVolume,
              onAddScene: onAddScene
            }}
            showOutlines={false}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onFrameUpdate={(frame) => {
              const time = frame / 30
              setCurrentTime(time)
              const { scene } = getSceneForFrame(frame)
              if (scene && scene.id !== activeSceneId) {
                setActiveSceneId(scene.id)
                if (isPlaying && scene.script) {
                  speakText(scene.script, scene.id)
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  )
})
export default VideoCanvas;
