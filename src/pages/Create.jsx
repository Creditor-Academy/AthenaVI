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

  const [scenes, setScenes] = useState([
    {
      id: 'scene1',
      title: 'Scene 1',
      duration: 8,
      titleText: 'Build Your Brand with AI',
      titleStyle: {
        fontSize: 48,
        color: '#0066cc',
        fontFamily: 'Inter',
        fontWeight: '700',
        textAlign: 'left'
      },
      subtitleText: 'The future of video creation is here.',
      subtitleStyle: {
        fontSize: 24,
        color: '#333333',
        fontFamily: 'Inter',
        fontWeight: '400',
        textAlign: 'left'
      },
      layers: [], // Support for B-roll, images, etc.
      script: 'Start your video by greeting your audience and introducing your topic. Create a clear title and give more context with a compelling sub-headline.',
      avatar: avatar1,
      avatarType: 'avatar1',
      type: 'video',
      layout: 'split-right'
    }
  ])
  const [activeSceneId, setActiveSceneId] = useState('scene1')
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

  const addLayer = (type, content) => {
    if (!activeSceneId) {
      console.warn('No active scene selected for adding layer')
      alert('Please select a scene first')
      return
    }
    const activeScene = scenes.find(s => s.id === activeSceneId)
    if (!activeScene) {
      console.warn('Active scene not found:', activeSceneId)
      return
    }
    console.log('Adding layer:', type, content, 'to scene:', activeSceneId)
    const newLayer = {
      id: `layer-${Date.now()}`,
      type,
      content,
      start: 0,
      duration: activeScene.duration || 8,
      x: 0,
      y: 0,
      scale: 1,
      width: '100%',
      height: '100%'
    }
    updateScene(activeSceneId, {
      layers: [...(activeScene?.layers || []), newLayer]
    })
  }

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

  // Safety check
  if (!scenes || scenes.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading editor...</h2>
      </div>
    )
  }

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
          {/* Left Sidebar - Full Height */}
          <div className="left-sidebar">
            <EditorSidebar
              selectedTool={selectedTool}
              setSelectedTool={setSelectedTool}
              activeSceneId={activeSceneId}
              addLayer={addLayer}
              updateScene={updateScene}
              activeScene={activeScene}
              handleAddTemplateScene={handleAddTemplateScene}
              setShowTemplateModal={setShowTemplateModal}
            />
          </div>

          {/* Tool Panel - Beside Left Sidebar */}
          {selectedTool && (
            <div className="tool-panel-beside">
              <EditorSidebar
                selectedTool={selectedTool}
                setSelectedTool={setSelectedTool}
                activeSceneId={activeSceneId}
                addLayer={addLayer}
                updateScene={updateScene}
                activeScene={activeScene}
                handleAddTemplateScene={handleAddTemplateScene}
                setShowTemplateModal={setShowTemplateModal}
                showPanelOnly={true}
              />
            </div>
          )}
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
              onSelectScene={setActiveSceneId}
              onUpdateScene={updateScene}
              onAddScene={addScene}
              onDeleteScene={deleteScene}
              onReorderScenes={handleReorderScenes}
              onDeleteLayer={deleteLayer}
              onDeleteMusic={deleteMusic}
              musicDuration={musicDuration || (totalDurationInFrames / 30)}
              onMusicDurationChange={handleMusicDurationChange}
              onPlayPause={() => {
                if (playerMethods.current) {
                  if (isPlaying) {
                    playerMethods.current.pause()
                  } else {
                    playerMethods.current.play()
                  }
                }
              }}
              onStop={() => {
                if (playerMethods.current) {
                  playerMethods.current.pause()
                  playerMethods.current.seekTo(0)
                }
                setIsPlaying(false)
                setCurrentTime(0)
                window.speechSynthesis.cancel()
              }}
              totalDuration={totalDurationInFrames / 30}
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
              background: '#ffffff',
              border: '1px solid #e8eaed',
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
            {isRightSidebarOpen ? <MdChevronRight size={20} color="#5f6368" /> : <MdChevronLeft size={20} color="#5f6368" />}
          </button>

          {/* Properties Panel (Script, Duration, Audio, etc.) */}
          <div style={{
            width: isRightSidebarOpen ? '300px' : '0px',
            flexShrink: 0,
            height: '100%',
            borderLeft: isRightSidebarOpen ? '1px solid #e5e7eb' : 'none',
            background: '#ffffff',
            overflowY: 'auto',
            overflowX: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            <div style={{ width: '300px', height: '100%' }}>
              <SceneConfigurationPanel
                activeScene={activeScene}
                activeSceneId={activeSceneId}
                updateScene={updateScene}
                bgMusic={bgMusic}
                setBgMusic={setBgMusic}
                bgMusicVolume={bgMusicVolume}
                setBgMusicVolume={setBgMusicVolume}
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
