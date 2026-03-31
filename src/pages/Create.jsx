import { useMemo, useState, useEffect, useRef } from 'react'
import { MdChevronRight, MdChevronLeft } from 'react-icons/md'
import { useCurrentFrame, spring, interpolate, useVideoConfig } from 'remotion'
import TimelineEditor from '../components/TimelineEditor'
import './Create.css'
import { predefinedAvatars, pageTemplates } from '../constants/editorData'
import EditorTopbar from '../components/editor/EditorTopbar'
import EditorSidebar from '../components/editor/EditorSidebar'
import VideoCanvas from '../components/editor/VideoCanvas'
import SceneConfigurationPanel from '../components/editor/SceneConfigurationPanel'
import ExportModal from '../components/editor/ExportModal'
import TemplateModal from '../components/editor/TemplateModal'
import PreviewModal from '../components/editor/PreviewModal'
import avatar1 from '../assets/avatar1.png'

function Create({ onBack }) {
  // Debug: Log when component mounts
  useEffect(() => {
    console.log('Create component mounted')
  }, [])

  const [scenes, setScenes] = useState([])
  const [activeSceneId, setActiveSceneId] = useState(null)
  const [selectedTool, setSelectedTool] = useState(null) // Start with no tool selected
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(70)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [bgMusic, setBgMusic] = useState('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3')
  const [bgMusicVolume, setBgMusicVolume] = useState(0.3)
  const [musicDuration, setMusicDuration] = useState(null) // null means full project duration
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true)
  const [selectedLayerId, setSelectedLayerId] = useState(null)

  // Auto-create a default blank scene and return the new scene + updated scenes array
  const autoCreateScene = () => {
    const defaultAvatar = predefinedAvatars[0]
    const newScene = {
      id: `scene${Date.now()}`,
      title: 'Scene 1',
      duration: 8,
      titleText: 'New Scene',
      subtitleText: 'Start creating your content',
      layout: 'default',
      avatar: defaultAvatar?.image || avatar1,
      avatarType: defaultAvatar?.id || 'avatar1',
      type: 'video',
      script: '',
      layers: [],
      titleStyle: {
        fontSize: 48,
        color: '#1a73e8',
        fontFamily: 'Inter',
        fontWeight: '700',
        textAlign: 'left'
      },
      subtitleStyle: {
        fontSize: 24,
        color: '#202124',
        fontFamily: 'Inter',
        fontWeight: '400',
        textAlign: 'left'
      }
    }
    const updatedScenes = [...scenes, newScene]
    setScenes(updatedScenes)
    setActiveSceneId(newScene.id)
    console.log('Auto-created default scene:', newScene.id)
    return { newScene, updatedScenes }
  }

  const addLayer = (type, content) => {
    let targetSceneId = activeSceneId
    let targetScenes = scenes

    // Auto-create a scene if none exist
    if (!targetSceneId || scenes.length === 0) {
      const { newScene, updatedScenes } = autoCreateScene()
      targetSceneId = newScene.id
      targetScenes = updatedScenes
    }

    const targetScene = targetScenes.find(s => s.id === targetSceneId)
    if (!targetScene) {
      console.warn('Target scene not found:', targetSceneId)
      return
    }
    console.log('Adding layer:', type, content, 'to scene:', targetSceneId)
    const newLayer = {
      id: `layer-${Date.now()}`,
      type,
      content,
      start: 0,
      duration: targetScene.duration || 8,
      x: 0,
      y: 0,
      scale: 1,
      width: '100%',
      height: '100%'
    }
    // Use functional update to ensure we get the latest state (in case autoCreateScene just set it)
    setScenes(prev => prev.map(scene =>
      scene.id === targetSceneId
        ? { ...scene, layers: [...(scene.layers || []), newLayer] }
        : scene
    ))
    return newLayer.id
  }

  // Update a specific layer's position within the active scene
  const updateLayerPosition = (layerId, x, y) => {
    if (!activeSceneId) return
    setScenes(prev => prev.map(scene => {
      if (scene.id !== activeSceneId) return scene
      return {
        ...scene,
        layers: (scene.layers || []).map(layer =>
          layer.id === layerId ? { ...layer, x, y } : layer
        )
      }
    }))
  }

  // Listen for canvas-drop events (drag from sidebar to canvas)
  useEffect(() => {
    const handleCanvasDrop = (e) => {
      const { type, content, x, y } = e.detail
      const layerId = addLayer(type, content)
      // Update the newly added layer's position
      if (layerId) {
        setTimeout(() => {
          updateLayerPosition(layerId, x, y)
        }, 50)
      }
    }
    window.addEventListener('canvas-drop', handleCanvasDrop)
    return () => window.removeEventListener('canvas-drop', handleCanvasDrop)
  }, [activeSceneId, scenes])

  const deleteLayer = (sceneId, layerId) => {
    const scene = scenes.find(s => s.id === sceneId)
    if (!scene) return
    updateScene(sceneId, {
      layers: scene.layers.filter(l => l.id !== layerId)
    })
  }

  const deleteMusic = () => {
    setBgMusic(null)
    setMusicDuration(null)
  }

  const handleMusicDurationChange = (newDuration) => {
    setMusicDuration(newDuration)
  }

  // Export settings state
  const [exportFormat, setExportFormat] = useState('MP4')
  const [exportResolution, setExportResolution] = useState('1920x1080')
  const [exportFrameRate, setExportFrameRate] = useState('30')
  const [exportQuality, setExportQuality] = useState('High')

  const playerRef = useRef(null)
  const speechSynthesisRef = useRef(null)

  // Store player methods for seeking
  const [playerMethods, setPlayerMethods] = useState(null)

  // Credit calculation function
  const calculateCredits = () => {
    let baseCredits = 100

    // Format multipliers
    const formatMultipliers = {
      'MP4': 1.0,
      'WebM': 0.8,
      'GIF': 0.5
    }

    // Resolution multipliers
    const resolutionMultipliers = {
      '1920x1080': 1.0,
      '1280x720': 0.7,
      '3840x2160': 2.0
    }

    // Frame rate multipliers
    const frameRateMultipliers = {
      '30': 1.0,
      '24': 0.8,
      '60': 1.5
    }

    // Quality multipliers
    const qualityMultipliers = {
      'High': 1.2,
      'Medium': 1.0,
      'Low': 0.7
    }

    const formatMultiplier = formatMultipliers[exportFormat] || 1.0
    const resolutionMultiplier = resolutionMultipliers[exportResolution] || 1.0
    const frameRateMultiplier = frameRateMultipliers[exportFrameRate] || 1.0
    const qualityMultiplier = qualityMultipliers[exportQuality] || 1.0

    const totalCredits = Math.round(baseCredits * formatMultiplier * resolutionMultiplier * frameRateMultiplier * qualityMultiplier)

    return totalCredits
  }

  const activeScene = scenes.find(s => s.id === activeSceneId)

  const totalDurationInFrames = useMemo(() => {
    return scenes.reduce((sum, s) => sum + (s.duration || 8), 0) * 30
  }, [scenes])

  const handleReorderScenes = (newScenes) => {
    setScenes(newScenes)
  }

  // Text-to-speech function
  const speakText = (text, sceneId) => {
    // Stop any ongoing speech
    if (speechSynthesisRef.current) {
      window.speechSynthesis.cancel()
    }

    if (!text || text.trim() === '') return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9 // Slightly slower for natural speech
    utterance.pitch = 1
    utterance.volume = 1

    // Use a more natural voice if available
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(voice =>
      voice.name.includes('Google') ||
      voice.name.includes('Microsoft') ||
      voice.lang.startsWith('en')
    )
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    speechSynthesisRef.current = utterance
    window.speechSynthesis.speak(utterance)

    utterance.onend = () => {
      speechSynthesisRef.current = null
    }
  }

  // Stop speech when component unmounts or preview closes
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Load voices when component mounts
  useEffect(() => {
    if (window.speechSynthesis) {
      const loadVoices = () => {
        window.speechSynthesis.getVoices()
      }
      loadVoices()
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  // Get current scene based on frame
  const getSceneForFrame = (frame) => {
    let currentFrame = 0
    for (const scene of scenes) {
      const sceneFrames = (scene.duration || 8) * 30
      if (frame < currentFrame + sceneFrames) {
        return { scene, frameInScene: frame - currentFrame }
      }
      currentFrame += sceneFrames
    }
    return { scene: scenes[scenes.length - 1] || scenes[0], frameInScene: 0 }
  }

  // Handle player frame updates
  useEffect(() => {
    if (playerRef.current && isPlaying) {
      const player = playerRef.current
      const updateTime = () => {
        try {
          const frame = player.getCurrentFrame()
          setCurrentTime(frame / 30) // Convert frames to seconds
          const { scene } = getSceneForFrame(frame)
          if (scene && scene.id !== activeSceneId) {
            setActiveSceneId(scene.id)
          }
        } catch (e) {
          // Player might not be ready
        }
      }

      const interval = setInterval(updateTime, 100)
      return () => clearInterval(interval)
    }
  }, [isPlaying, scenes, activeSceneId])

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        // Allow escape even if focused
        if (e.key === 'Escape') {
          setSelectedTool(null)
          document.activeElement.blur()
        }
        return
      }

      // Space: Play/Pause
      if (e.code === 'Space') {
        e.preventDefault()
        if (playerMethods) {
          if (isPlaying) {
            playerMethods.pause()
          } else {
            playerMethods.play()
          }
        }
      }

      // Escape: Close sidebar tool panel
      if (e.key === 'Escape') {
        setSelectedTool(null)
      }

      // Delete: Delete active scene
      if (e.key === 'Delete') {
        if (activeSceneId && scenes.length > 1) {
          if (window.confirm('Delete this scene?')) {
            deleteScene(activeSceneId)
          }
        }
      }

      // Meta/Ctrl Shortcuts
      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault()
            alert('Project saved automatically!')
            break
          case 'e':
            e.preventDefault()
            exportVideo()
            break
          case 'z':
            e.preventDefault()
            // Undo logic would go here
            console.log('Undo triggered')
            break
          case 'y':
            e.preventDefault()
            // Redo logic would go here
            console.log('Redo triggered')
            break
        }
      }

      // Arrow Keys: Step frame (0.1s increments)
      if (e.key === 'ArrowLeft') {
        handleSeek(Math.max(0, currentTime - 0.1))
      }
      if (e.key === 'ArrowRight') {
        handleSeek(Math.min(totalDurationInFrames / 30, currentTime + 0.1))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, playerMethods, activeSceneId, scenes.length, currentTime, totalDurationInFrames])

  const addScene = () => {
    setShowTemplateModal(true)
  }

  const handleAddTemplateScene = (template) => {
    // Get default avatar if no active scene
    const defaultAvatar = activeScene?.avatar || avatar1
    const defaultAvatarType = activeScene?.avatarType || 'avatar1'

    const newScene = {
      id: `scene${Date.now()}`,
      title: `Scene ${scenes.length + 1}`,
      duration: 8,
      titleText: template.fields.find(f => f.key === 'titleText')?.default || 'New Scene',
      subtitleText: template.fields.find(f => f.key === 'subtitleText')?.default || 'Add your content here',
      layout: template.layout,
      avatar: defaultAvatar,
      avatarType: defaultAvatarType,
      type: 'video',
      script: template.fields.find(f => f.key === 'script')?.default || 'Start your video by greeting your audience and introducing your topic.',
      layers: [],
      titleStyle: {
        fontSize: 48,
        color: '#1a73e8',
        fontFamily: 'Inter',
        fontWeight: '700',
        textAlign: 'left'
      },
      subtitleStyle: {
        fontSize: 24,
        color: '#202124',
        fontFamily: 'Inter',
        fontWeight: '400',
        textAlign: 'left'
      }
    }

    // Add other template fields as data
    template.fields.forEach(field => {
      if (field.key !== 'titleText' && field.key !== 'subtitleText' && field.key !== 'script') {
        newScene[field.key] = field.default
      }
    })

    // Ensure avatar is set - fallback to first predefined avatar if needed
    if (!newScene.avatar) {
      const firstAvatar = predefinedAvatars[0]
      if (firstAvatar) {
        newScene.avatar = firstAvatar.image
        newScene.avatarType = firstAvatar.id
      } else {
        newScene.avatar = avatar1
        newScene.avatarType = 'avatar1'
      }
    }

    console.log('Adding new scene:', newScene)
    const updatedScenes = [...scenes, newScene]
    setScenes(updatedScenes)
    setActiveSceneId(newScene.id)
    setShowTemplateModal(false)
    setSelectedTool(null) // Close the tool panel after adding

    console.log('Updated scenes count:', updatedScenes.length)
  }

  const deleteScene = (id) => {
    if (scenes.length === 1) return
    const newScenes = scenes.filter(s => s.id !== id)
    setScenes(newScenes)
    if (activeSceneId === id) {
      setActiveSceneId(newScenes[0].id)
    }
  }

  const updateScene = (id, updates) => {
    if (!id) {
      console.warn('updateScene called with no id')
      return
    }
    console.log('Updating scene:', id, updates)
    setScenes(prevScenes => {
      const updated = prevScenes.map(scene =>
        scene.id === id ? { ...scene, ...updates } : scene
      )
      console.log('Scenes after update:', updated)
      return updated
    })
  }

  const exportVideo = () => {
    setShowExportModal(true)
  }

  // Handle preview with text-to-speech
  const handlePreview = () => {
    setShowPreviewModal(true)
    // Start speaking the script when preview opens
    if (activeScene?.script) {
      setTimeout(() => {
        speakText(activeScene.script, activeSceneId)
      }, 500)
    }
  }

  const handleSeek = (time) => {
    setCurrentTime(time)
    // Use player methods if available
    if (playerMethods && playerMethods.seekTo) {
      playerMethods.seekTo(time)
    }
  }

  // Safety check - removed forced loading screen for empty scenes
  // We want to show the empty editor instead

  return (
    <div className="video-editor-shell">
      <EditorTopbar
        onBack={onBack}
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        handlePreview={handlePreview}
        exportVideo={exportVideo}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
      />

      <div className="editor-container">
        {/* Left Sidebar + Tool Panel Container */}
        <div className="left-section">
          {/* Sidebar Section handles both Nav and Panel internally */}
          <EditorSidebar
            selectedTool={selectedTool}
            setSelectedTool={setSelectedTool}
            activeSceneId={activeSceneId}
            addLayer={addLayer}
            updateScene={updateScene}
            activeScene={activeScene}
            handleAddTemplateScene={handleAddTemplateScene}
            setShowTemplateModal={setShowTemplateModal}
            bgMusic={bgMusic}
            setBgMusic={setBgMusic}
            scenes={scenes}
            autoCreateScene={autoCreateScene}
          />
        </div>

        {/* Main Content Area */}
        <div className="main-content">
          <div className="main-content-row" style={{ position: 'relative' }}>
            <div className="editor-content">
              <VideoCanvas
                ref={playerRef}
                scenes={scenes}
                bgMusic={bgMusic}
                bgMusicVolume={bgMusicVolume}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                currentTime={currentTime}
                setCurrentTime={setCurrentTime}
                zoomLevel={zoomLevel}
                setZoomLevel={setZoomLevel}
                activeSceneId={activeSceneId}
                setActiveSceneId={setActiveSceneId}
                totalDurationInFrames={totalDurationInFrames}
                getSceneForFrame={getSceneForFrame}
                speakText={speakText}
                onPlayerReady={setPlayerMethods}
                selectedLayerId={selectedLayerId}
                setSelectedLayerId={setSelectedLayerId}
                onUpdateLayerPosition={updateLayerPosition}
              />
            </div>
          </div>

          {/* Timeline Area - Always Visible */}
          <div className="timeline-area">
            <TimelineEditor
              scenes={scenes}
              bgMusic={bgMusic}
              activeSceneId={activeSceneId}
              currentTime={currentTime}
              isPlaying={isPlaying}
              onSeek={handleSeek}
              onSelectScene={(sceneId) => {
                setActiveSceneId(sceneId);
                setSelectedLayerId(null);
                if (!isRightSidebarOpen) setIsRightSidebarOpen(true);
              }}
              onSelectLayer={(layerId) => {
                setSelectedLayerId(layerId);
                if (!isRightSidebarOpen) setIsRightSidebarOpen(true);
              }}
              onUpdateScene={updateScene}
              onAddScene={addScene}
              onDeleteScene={deleteScene}
              onReorderScenes={handleReorderScenes}
              onDeleteLayer={deleteLayer}
              onDeleteMusic={deleteMusic}
              musicDuration={musicDuration || (totalDurationInFrames / 30)}
              onMusicDurationChange={handleMusicDurationChange}
              onPlayPause={() => {
                if (playerMethods) {
                  if (isPlaying) {
                    playerMethods.pause()
                  } else {
                    playerMethods.play()
                  }
                }
              }}
              onStop={() => {
                if (playerMethods) {
                  playerMethods.pause()
                  playerMethods.seekTo(0)
                }
                setIsPlaying(false)
                setCurrentTime(0)
                window.speechSynthesis.cancel()
              }}
              totalDuration={(totalDurationInFrames || 0) / 30}
            />
          </div>
        </div>

        {/* Right Sidebar Section */}
        <div className="right-section" style={{ position: 'relative', display: 'flex', height: '100%', zIndex: 40 }}>
          {/* Properties Panel Toggle Button */}
          <button
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            style={{
              position: 'absolute',
              left: '-24px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 50,
              width: '24px',
              height: '48px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRight: 'none',
              borderRadius: '8px 0 0 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '-2px 0 8px rgba(0,0,0,0.05)',
              padding: 0
            }}
            title={isRightSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isRightSidebarOpen ? <MdChevronRight size={20} color="var(--text-muted)" /> : <MdChevronLeft size={20} color="var(--text-muted)" />}
          </button>

          {/* Properties Panel (Script, Duration, Audio, etc.) */}
          <div style={{
            width: isRightSidebarOpen ? '320px' : '0px',
            flexShrink: 0,
            height: '100%',
            overflow: 'hidden',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            borderLeft: isRightSidebarOpen ? '1px solid var(--border-color)' : 'none',
            background: 'var(--bg-panel)',
            zIndex: 40
          }}>
            <div style={{ width: '320px', height: '100%', overflowY: 'auto' }}>
              <SceneConfigurationPanel
                activeScene={activeScene}
                activeSceneId={activeSceneId}
                updateScene={updateScene}
                bgMusic={bgMusic}
                setBgMusic={setBgMusic}
                bgMusicVolume={bgMusicVolume}
                setBgMusicVolume={setBgMusicVolume}
                selectedLayerId={selectedLayerId}
              />
            </div>
          </div>
        </div>
      </div>

      <PreviewModal
        showPreviewModal={showPreviewModal}
        setShowPreviewModal={setShowPreviewModal}
        scenes={scenes}
        activeSceneId={activeSceneId}
        totalDurationInFrames={totalDurationInFrames}
        bgMusic={bgMusic}
        bgMusicVolume={bgMusicVolume}
        setIsPlaying={setIsPlaying}
        speakText={speakText}
        getSceneForFrame={getSceneForFrame}
        setActiveSceneId={setActiveSceneId}
      />

      <ExportModal
        showExportModal={showExportModal}
        setShowExportModal={setShowExportModal}
        calculateCredits={calculateCredits}
      />

      <TemplateModal
        showTemplateModal={showTemplateModal}
        setShowTemplateModal={setShowTemplateModal}
        handleAddTemplateScene={handleAddTemplateScene}
      />
    </div>
  )
}

export default Create
