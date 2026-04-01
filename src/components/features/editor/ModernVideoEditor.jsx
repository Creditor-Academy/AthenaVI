import { useState, useRef, useEffect } from 'react'
import {
  MdPlayArrow,
  MdPause,
  MdUndo,
  MdRedo,
  MdZoomIn,
  MdZoomOut,
  MdFitScreen,
  MdSelectAll,
  MdShare,
  MdPerson,
  MdMic,
  MdImage,
  MdVideocam,
  MdCloudUpload,
  MdFolder,
  MdMovie,
  MdClosedCaption,
  MdTextFields,
  MdAutoAwesome,
  MdShapeLine,
  MdAdd,
  MdMoreVert,
  MdAccountCircle
} from 'react-icons/md'

const ModernVideoEditor = ({ scenes: initialScenes = [], onSceneUpdate, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [showTiming, setShowTiming] = useState(true)
  const [selectedTool, setSelectedTool] = useState(null)
  const [timelineZoom, setTimelineZoom] = useState(50)
  const [scenes, setScenes] = useState(initialScenes.length > 0 ? initialScenes : [
    { id: '1', duration: 8 },
    { id: '2', duration: 6 },
    { id: '3', duration: 10 }
  ])
  const [activeSceneId, setActiveSceneId] = useState(scenes[0]?.id)
  const canvasRef = useRef(null)
  const playIntervalRef = useRef(null)
  const timelineRef = useRef(null)
  const isDraggingPlayhead = useRef(false)

  const totalDuration = scenes.reduce((sum, s) => sum + (s.duration || 8), 0)

  // Playback simulation
  useEffect(() => {
    if (isPlaying && !isDraggingPlayhead.current) {
      playIntervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev + 0.1
          if (newTime >= totalDuration) {
            setIsPlaying(false)
            return totalDuration
          }
          return newTime
        })
      }, 100)
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }
    }
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }
    }
  }, [isPlaying, totalDuration])

  // Timeline scrubbing
  const handleTimelineClick = (e) => {
    if (!timelineRef.current || isDraggingPlayhead.current) return
    const rect = timelineRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(1, x / rect.width))
    const newTime = percentage * totalDuration
    setCurrentTime(newTime)
  }

  const handlePlayheadMouseDown = (e) => {
    e.stopPropagation()
    isDraggingPlayhead.current = true
    setIsPlaying(false)
    
    const handleMouseMove = (e) => {
      if (!timelineRef.current) return
      const rect = timelineRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = Math.max(0, Math.min(1, x / rect.width))
      const newTime = percentage * totalDuration
      setCurrentTime(newTime)
    }

    const handleMouseUp = () => {
      isDraggingPlayhead.current = false
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const tools = [
    { id: 'avatar', icon: MdPerson, label: 'Avatar' },
    { id: 'voiceover', icon: MdMic, label: 'Voiceover' },
    { id: 'image', icon: MdImage, label: 'Image' },
    { id: 'record', icon: MdVideocam, label: 'Record' },
    { id: 'uploads', icon: MdCloudUpload, label: 'Uploads' },
    { id: 'stock', icon: MdFolder, label: 'Stock' },
    { id: 'captions', icon: MdClosedCaption, label: 'Captions' },
    { id: 'text', icon: MdTextFields, label: 'Text' },
    { id: 'templates', icon: MdAutoAwesome, label: 'Templates' },
    { id: 'shapes', icon: MdShapeLine, label: 'Shapes' }
  ]

  return (
    <>
      <style>{`
        :root {
          --color-bg-primary: #ffffff;
          --color-bg-secondary: #f8f9fa;
          --color-bg-tertiary: #f1f3f4;
          --color-border: #e8eaed;
          --color-border-light: #f1f3f4;
          --color-text-primary: #202124;
          --color-text-secondary: #5f6368;
          --color-text-tertiary: #80868b;
          --color-accent: #1a73e8;
          --color-accent-hover: #1557b0;
          --color-accent-light: #e8f0fe;
          --shadow-sm: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
          --shadow-md: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 2px 6px 2px rgba(60, 64, 67, 0.15);
          --shadow-lg: 0 2px 4px 0 rgba(60, 64, 67, 0.3), 0 4px 12px 4px rgba(60, 64, 67, 0.15);
          --radius-sm: 4px;
          --radius-md: 8px;
          --radius-lg: 12px;
          --radius-xl: 16px;
          --transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .modern-editor {
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--color-bg-secondary);
          font-family: 'Inter', 'Roboto', system-ui, -apple-system, sans-serif;
          color: var(--color-text-primary);
          overflow: hidden;
        }

        /* Top App Bar */
        .editor-header {
          height: 64px;
          background: var(--color-bg-primary);
          border-bottom: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          padding: 0 24px;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: var(--shadow-sm);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
          min-width: 200px;
        }

        .app-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 20px;
          font-weight: 500;
          color: var(--color-text-primary);
          text-decoration: none;
        }

        .app-icon {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, var(--color-accent) 0%, #4285f4 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
        }

        .header-center {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .toolbar-btn {
          width: 40px;
          height: 40px;
          border: none;
          background: transparent;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: var(--transition);
        }

        .toolbar-btn:hover {
          background: var(--color-bg-tertiary);
          color: var(--color-text-primary);
        }

        .toolbar-btn:active {
          background: var(--color-border);
        }

        .toolbar-btn.active {
          background: var(--color-accent-light);
          color: var(--color-accent);
        }

        .toolbar-divider {
          width: 1px;
          height: 24px;
          background: var(--color-border);
          margin: 0 4px;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 200px;
          justify-content: flex-end;
        }

        .play-btn {
          width: 40px;
          height: 40px;
          border: none;
          background: var(--color-accent);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: var(--transition);
          box-shadow: var(--shadow-sm);
        }

        .play-btn:hover {
          background: var(--color-accent-hover);
          box-shadow: var(--shadow-md);
          transform: scale(1.05);
        }

        .share-btn {
          width: 40px;
          height: 40px;
          border: none;
          background: transparent;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: var(--transition);
        }

        .share-btn:hover {
          background: var(--color-bg-tertiary);
          color: var(--color-text-primary);
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--color-bg-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: var(--transition);
        }

        .user-avatar:hover {
          background: var(--color-border);
        }

        /* Main Content Area */
        .editor-content {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        /* Canvas Area */
        .canvas-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: var(--color-bg-secondary);
          overflow: auto;
        }

        .canvas-wrapper {
          position: relative;
          background: var(--color-bg-primary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          overflow: hidden;
          transition: var(--transition);
        }

        .canvas-wrapper:hover {
          box-shadow: var(--shadow-lg);
        }

        .canvas {
          display: block;
          max-width: 100%;
          height: auto;
        }

        /* Right Sidebar */
        .tool-sidebar {
          width: 72px;
          background: var(--color-bg-primary);
          border-left: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 0;
          gap: 8px;
          overflow-y: auto;
        }

        .tool-item {
          width: 48px;
          height: 48px;
          border: none;
          background: transparent;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          cursor: pointer;
          transition: var(--transition);
          position: relative;
          color: var(--color-text-secondary);
        }

        .tool-item:hover {
          background: var(--color-bg-tertiary);
          color: var(--color-text-primary);
        }

        .tool-item.active {
          background: var(--color-accent-light);
          color: var(--color-accent);
        }

        .tool-item svg {
          width: 24px;
          height: 24px;
        }

        .tool-item-label {
          font-size: 10px;
          font-weight: 500;
          opacity: 0;
          transform: translateY(-4px);
          transition: var(--transition);
          position: absolute;
          bottom: -20px;
          white-space: nowrap;
          background: var(--color-text-primary);
          color: white;
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          pointer-events: none;
          z-index: 10;
        }

        .tool-item:hover .tool-item-label {
          opacity: 1;
          transform: translateY(0);
        }

        /* Timeline Panel */
        .timeline-panel {
          height: 200px;
          background: var(--color-bg-primary);
          border-top: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          box-shadow: 0 -2px 8px rgba(60, 64, 67, 0.1);
        }

        .timeline-header {
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          border-bottom: 1px solid var(--color-border-light);
        }

        .timeline-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .timing-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--color-text-secondary);
        }

        .toggle-switch {
          position: relative;
          width: 36px;
          height: 20px;
          background: var(--color-border);
          border-radius: 10px;
          cursor: pointer;
          transition: var(--transition);
        }

        .toggle-switch.active {
          background: var(--color-accent);
        }

        .toggle-switch::after {
          content: '';
          position: absolute;
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          top: 2px;
          left: 2px;
          transition: var(--transition);
          box-shadow: var(--shadow-sm);
        }

        .toggle-switch.active::after {
          left: 18px;
        }

        .zoom-control {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--color-text-secondary);
        }

        .zoom-slider {
          width: 120px;
          height: 4px;
          background: var(--color-border);
          border-radius: 2px;
          outline: none;
          -webkit-appearance: none;
        }

        .zoom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          background: var(--color-accent);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: var(--shadow-sm);
        }

        .zoom-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: var(--color-accent);
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: var(--shadow-sm);
        }

        .timeline-content {
          flex: 1;
          display: flex;
          align-items: center;
          padding: 0 24px;
          position: relative;
          overflow-x: auto;
          overflow-y: hidden;
        }

        .playhead {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--color-accent);
          z-index: 10;
          pointer-events: none;
        }

        .playhead::before {
          content: '';
          position: absolute;
          top: -6px;
          left: -6px;
          width: 14px;
          height: 14px;
          background: var(--color-accent);
          border-radius: 50%;
          box-shadow: var(--shadow-md);
        }

        .time-indicator {
          position: absolute;
          top: -24px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--color-text-primary);
          color: white;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          font-size: 11px;
          font-weight: 500;
          white-space: nowrap;
        }

        .timeline-blocks {
          display: flex;
          gap: 8px;
          align-items: center;
          min-width: 100%;
        }

        .timeline-block {
          min-width: 120px;
          height: 64px;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-secondary);
          font-size: 12px;
          transition: var(--transition);
          cursor: pointer;
        }

        .timeline-block:hover {
          background: var(--color-accent-light);
          border-color: var(--color-accent);
          color: var(--color-accent);
        }

        .timeline-block.active {
          background: var(--color-accent-light);
          border-color: var(--color-accent);
          color: var(--color-accent);
          box-shadow: 0 0 0 2px var(--color-accent-light);
        }

        .add-scene-btn {
          width: 48px;
          height: 48px;
          border: 2px dashed var(--color-border);
          background: transparent;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: var(--transition);
          flex-shrink: 0;
        }

        .add-scene-btn:hover {
          border-color: var(--color-accent);
          background: var(--color-accent-light);
          color: var(--color-accent);
          transform: scale(1.1);
        }

        /* Empty State */
        .empty-canvas {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--color-text-tertiary);
          font-size: 14px;
        }

        .empty-canvas svg {
          width: 64px;
          height: 64px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        /* Focus States */
        .toolbar-btn:focus-visible,
        .tool-item:focus-visible,
        .play-btn:focus-visible {
          outline: 2px solid var(--color-accent);
          outline-offset: 2px;
        }

        /* Scrollbar Styling */
        .tool-sidebar::-webkit-scrollbar,
        .timeline-content::-webkit-scrollbar {
          width: 8px;
        }

        .tool-sidebar::-webkit-scrollbar-track,
        .timeline-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .tool-sidebar::-webkit-scrollbar-thumb,
        .timeline-content::-webkit-scrollbar-thumb {
          background: var(--color-border);
          border-radius: 4px;
        }

        .tool-sidebar::-webkit-scrollbar-thumb:hover,
        .timeline-content::-webkit-scrollbar-thumb:hover {
          background: var(--color-text-tertiary);
        }
      `}</style>

      <div className="modern-editor">
        {/* Top App Bar */}
        <header className="editor-header">
          <div className="header-left">
            {onBack && (
              <button 
                className="toolbar-btn" 
                onClick={onBack}
                title="Back"
                style={{ marginRight: 8 }}
              >
                ←
              </button>
            )}
            <div className="app-logo">
              <div className="app-icon">A</div>
              <span>AthenaVI</span>
            </div>
          </div>

          <div className="header-center">
            <button className="toolbar-btn" title="Select">
              <MdSelectAll size={20} />
            </button>
            <button 
              className="toolbar-btn" 
              title="Zoom In"
              onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
            >
              <MdZoomIn size={20} />
            </button>
            <button 
              className="toolbar-btn" 
              title="Zoom Out"
              onClick={() => setZoomLevel(Math.max(25, zoomLevel - 10))}
            >
              <MdZoomOut size={20} />
            </button>
            <button 
              className="toolbar-btn" 
              title="Fit to Screen"
              onClick={() => setZoomLevel(100)}
            >
              <MdFitScreen size={20} />
            </button>
            <div className="toolbar-divider" />
            <button className="toolbar-btn" title="Undo">
              <MdUndo size={20} />
            </button>
            <button className="toolbar-btn" title="Redo">
              <MdRedo size={20} />
            </button>
          </div>

          <div className="header-right">
            <button 
              className="play-btn" 
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <MdPause size={24} /> : <MdPlayArrow size={24} />}
            </button>
            <button className="share-btn" title="Share">
              <MdShare size={20} />
            </button>
            <div className="user-avatar">
              <MdAccountCircle size={24} />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="editor-content">
          {/* Canvas Area */}
          <div className="canvas-container">
            <div 
              className="canvas-wrapper"
              style={{
                width: `${(1920 * zoomLevel) / 100}px`,
                maxWidth: '100%',
                aspectRatio: '16/9'
              }}
            >
              <div 
                ref={canvasRef}
                className="canvas"
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'white'
                }}
              >
                {scenes.length === 0 ? (
                  <div className="empty-canvas">
                    <MdMovie />
                    <p>Start by adding a scene</p>
                  </div>
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5f6368' }}>
                    Video Preview
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="tool-sidebar">
            {tools.map((tool) => {
              const Icon = tool.icon
              return (
                <button
                  key={tool.id}
                  className={`tool-item ${selectedTool === tool.id ? 'active' : ''}`}
                  onClick={() => setSelectedTool(selectedTool === tool.id ? null : tool.id)}
                  title={tool.label}
                >
                  <Icon />
                  <span className="tool-item-label">{tool.label}</span>
                </button>
              )
            })}
          </aside>
        </div>

        {/* Bottom Timeline Panel */}
        <div className="timeline-panel">
          <div className="timeline-header">
            <div className="timeline-controls">
              <div className="timing-toggle">
                <span>Show timing</span>
                <div 
                  className={`toggle-switch ${showTiming ? 'active' : ''}`}
                  onClick={() => setShowTiming(!showTiming)}
                />
              </div>
            </div>
            <div className="zoom-control">
              <MdZoomOut size={16} />
              <input
                type="range"
                min="20"
                max="200"
                value={timelineZoom}
                onChange={(e) => setTimelineZoom(Number(e.target.value))}
                className="zoom-slider"
              />
              <MdZoomIn size={16} />
            </div>
          </div>

          <div 
            className="timeline-content"
            ref={timelineRef}
            onClick={handleTimelineClick}
            style={{ cursor: 'pointer' }}
          >
            <div 
              className="playhead"
              style={{ 
                left: `${totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}%`,
                display: totalDuration > 0 ? 'block' : 'none',
                pointerEvents: 'auto',
                cursor: 'grab'
              }}
              onMouseDown={handlePlayheadMouseDown}
            >
              {showTiming && totalDuration > 0 && (
                <div className="time-indicator">
                  {formatTime(currentTime)} / {formatTime(totalDuration)}
                </div>
              )}
            </div>

            <div className="timeline-blocks">
              {scenes.map((scene, index) => (
                <div
                  key={scene.id || index}
                  className={`timeline-block ${activeSceneId === scene.id ? 'active' : ''}`}
                  style={{ width: `${(scene.duration || 8) * timelineZoom}px` }}
                  onClick={() => {
                    setActiveSceneId(scene.id)
                    const prevDuration = scenes.slice(0, index).reduce((sum, s) => sum + (s.duration || 8), 0)
                    setCurrentTime(prevDuration)
                  }}
                >
                  Scene {index + 1}
                </div>
              ))}
              <button 
                className="add-scene-btn" 
                title="Add scene"
                onClick={() => {
                  const newScene = { id: `scene-${Date.now()}`, duration: 8 }
                  setScenes([...scenes, newScene])
                  if (onSceneUpdate) onSceneUpdate([...scenes, newScene])
                }}
              >
                <MdAdd size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ModernVideoEditor

