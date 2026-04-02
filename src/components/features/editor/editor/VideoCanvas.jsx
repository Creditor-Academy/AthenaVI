import { useRef, useState, useCallback, forwardRef, useImperativeHandle, useEffect, useMemo } from 'react'
import { Player } from '@remotion/player'
import { MdOpenWith, MdClose, MdZoomOutMap } from 'react-icons/md'
import VideoComposition from './VideoComposition'

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
  onAddScene
}, ref) => {
  const playerRef = useRef(null)
  const overlayRef = useRef(null)
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
    }
  }))

  useEffect(() => {
    if (playerRef.current && onPlayerReady) {
      onPlayerReady({
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
      })
    }
  }, [])

  // Convert percentage/pixel layer position to overlay coordinates
  const getLayerStyle = (layer) => {
    const x = layer.position?.x ?? 0
    const y = layer.position?.y ?? 0
    const w = layer.size?.width || 300
    const h = layer.size?.height || 400
    const s = layer.scale || 1

    return {
      position: 'absolute',
      left: `${x}%`,
      top: `${y}%`,
      width: `${(w / 12.8)}%`,
      height: `${(h / 7.2)}%`,
      transform: `scale(${s})`,
      transformOrigin: 'top left',
      cursor: isDragging ? 'grabbing' : 'grab',
      zIndex: selectedLayerId === layer.id ? 20 : 10,
    }
  }

  // Handle clip corner resizing
  const handleResizeMouseDown = useCallback((e, clip, corner) => {
    e.stopPropagation()
    e.preventDefault()
    setIsDragging(true)
    
    const overlay = overlayRef.current
    if (!overlay) return
    const rect = overlay.getBoundingClientRect()
    
    const startX = e.clientX
    const startY = e.clientY
    const startW = typeof clip.size?.width === 'number' ? clip.size.width : 300
    const startH = typeof clip.size?.height === 'number' ? clip.size.height : 400
    const startPosX = clip.position?.x ?? 0
    const startPosY = clip.position?.y ?? 0

    const handleMouseMove = (moveEvent) => {
      const deltaX = ((moveEvent.clientX - startX) / rect.width) * 1280
      const deltaY = ((moveEvent.clientY - startY) / rect.height) * 720
      
      let newW = startW
      let newH = startH
      let newX = startPosX
      let newY = startPosY

      if (corner.includes('right')) newW = Math.max(50, startW + deltaX)
      if (corner.includes('bottom')) newH = Math.max(50, startH + deltaY)
      
      if (corner.includes('left')) {
        const potentialW = startW - deltaX
        if (potentialW > 50) {
          newW = potentialW
          newX = startPosX + (deltaX / 1280) * 100
        }
      }
      if (corner.includes('top')) {
        const potentialH = startH - deltaY
        if (potentialH > 50) {
          newH = potentialH
          newY = startPosY + (deltaY / 720) * 100
        }
      }

      if (onUpdateLayerSize) {
        onUpdateLayerSize(clip.id, newW, newH)
      }
      if (onUpdateLayerPosition && (corner.includes('left') || corner.includes('top'))) {
        onUpdateLayerPosition(clip.id, newX, newY)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }, [onUpdateLayerSize, onUpdateLayerPosition])

  // Handle clip drag start
  const handleLayerMouseDown = useCallback((e, clip) => {
    e.stopPropagation()
    e.preventDefault()
    if (setSelectedLayerId) setSelectedLayerId(clip.id)
    setIsDragging(true)

    const overlay = overlayRef.current
    if (!overlay) return
    const rect = overlay.getBoundingClientRect()
    
    const clipX = clip.position?.x ?? 0
    const clipY = clip.position?.y ?? 0
    
    // Calculate offset of mouse from clip origin in percentage of canvas
    const mouseXPct = ((e.clientX - rect.left) / rect.width) * 100
    const mouseYPct = ((e.clientY - rect.top) / rect.height) * 100
    
    setDragOffset({
      x: mouseXPct - clipX,
      y: mouseYPct - clipY
    })

    const handleMouseMove = (moveEvent) => {
      const newMouseXPct = ((moveEvent.clientX - rect.left) / rect.width) * 100
      const newMouseYPct = ((moveEvent.clientY - rect.top) / rect.height) * 100
      
      const newX = Math.max(-100, Math.min(100, newMouseXPct - (mouseXPct - clipX)))
      const newY = Math.max(-100, Math.min(100, newMouseYPct - (mouseYPct - clipY)))

      if (onUpdateLayerPosition) {
        onUpdateLayerPosition(clip.id, newX, newY)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }, [selectedLayerId, onUpdateLayerPosition])

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
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
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
    const dropX = ((e.clientX - rect.left) / rect.width) * 100
    const dropY = ((e.clientY - rect.top) / rect.height) * 100

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
          style={{ width: `${zoomLevel}%`, position: 'relative' }}
        >
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
              backgroundColor: 'white'
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

          {/* Interactive Overlay — sits on top of the Remotion Player when NOT playing */}
          {!isPlaying && clips.length > 0 && (
            <div
              ref={overlayRef}
              className="canvas-interactive-overlay"
              onClick={handleOverlayClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 10,
                cursor: 'default',
                pointerEvents: 'all'
              }}
            >
              {/* Clip selection handles */}
              {clips.map(clip => {
                const isSelected = selectedLayerId === clip.id
                const x = clip.position?.x ?? 0
                const y = clip.position?.y ?? 0
                const w = clip.size?.width || 'auto'
                const h = clip.size?.height || 'auto'

                 return (
                  <div
                    key={clip.id}
                    onMouseDown={(e) => handleLayerMouseDown(e, clip)}
                    style={{
                      position: 'absolute',
                      left: `${x}%`,
                      top: `${y}%`,
                      width: `${(w / 12.8)}%`,
                      height: `${(h / 7.2)}%`,
                      transform: `scale(${clip.scale || 1})`,
                      transformOrigin: 'top left',
                      cursor: isDragging ? 'grabbing' : 'pointer',
                      border: isSelected 
                        ? '2px solid #1a73e8' 
                        : (clip.editable ? '1.5px dashed rgba(26, 115, 232, 0.4)' : '2px solid transparent'),
                      borderRadius: '4px',
                      boxSizing: 'border-box',
                      transition: isDragging ? 'none' : 'all 0.15s ease',
                      zIndex: isSelected ? 20 : 10,
                      backgroundColor: !isSelected && clip.editable && hoveredClipId === clip.id ? 'rgba(26, 115, 232, 0.05)' : 'transparent'
                    }}
                    onMouseEnter={() => !isSelected && clip.editable && setHoveredClipId(clip.id)}
                    onMouseLeave={() => setHoveredClipId(null)}
                  >
                    {/* Selection handles on corners */}
                    {isSelected && (
                      <>
                          {/* Corner handles */}
                          {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => (
                            <div
                              key={pos}
                              onMouseDown={(e) => handleResizeMouseDown(e, clip, pos)}
                              style={{
                                position: 'absolute',
                                width: '10px',
                                height: '10px',
                                backgroundColor: '#1a73e8',
                                border: '2px solid #fff',
                                borderRadius: '2px',
                                ...(pos.includes('top') ? { top: '-5px' } : { bottom: '-5px' }),
                                ...(pos.includes('left') ? { left: '-5px' } : { right: '-5px' }),
                                cursor: pos === 'top-left' || pos === 'bottom-right' ? 'nwse-resize' : 'nesw-resize',
                                zIndex: 30,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                              }}
                            />
                          ))}
                      </>
                    )}
                  </div>
                )
              })}

              {/* Drop indicator */}
              {dropIndicator && (
                <div style={{
                  position: 'absolute',
                  left: `${dropIndicator.x}%`,
                  top: `${dropIndicator.y}%`,
                  width: '120px',
                  height: '80px',
                  border: '2px dashed #1a73e8',
                  borderRadius: '8px',
                  background: 'rgba(26, 115, 232, 0.08)',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                  zIndex: 50
                }} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})
export default VideoCanvas;
