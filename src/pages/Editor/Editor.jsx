import { useMemo, useState, useEffect, useRef } from 'react'
import { MdChevronRight, MdChevronLeft } from 'react-icons/md'
import { useCurrentFrame, spring, interpolate, useVideoConfig } from 'remotion'
import TimelineEditor from '../../components/features/editor/TimelineEditor'
import './Editor.css'
import { predefinedAvatars } from '../../constants/editorData'
import EditorTopbar from '../../components/features/editor/editor/EditorTopbar'
import EditorSidebar from '../../components/features/editor/editor/EditorSidebar'
import VideoCanvas from '../../components/features/editor/editor/VideoCanvas'
import SceneConfigurationPanel from '../../components/features/editor/editor/SceneConfigurationPanel'
import ExportModal from '../../components/features/editor/editor/ExportModal'
import TemplateModal from '../../components/features/editor/editor/TemplateModal'
import PreviewModal from '../../components/features/editor/editor/PreviewModal'
import avatar1 from '../../assets/Avatarr1.png'
import projectTemplate from '../../constants/projectTemplate.json'

function Create({ onBack, initialConfig = null }) {
  // Debug: Log when component mounts
  useEffect(() => {
    console.log('Create component mounted')
  }, [])

  const [project, setProject] = useState(() => {
    const pageSizeToResolution = {
      landscape: { width: 1920, height: 1080 },
      portrait: { width: 1080, height: 1920 },
      square: { width: 1080, height: 1080 }
    }

    const resolvedResolution = pageSizeToResolution[initialConfig?.pageSize] || projectTemplate.project.resolution
    const resolvedTitle = initialConfig?.name?.trim() || projectTemplate.project.title

    return {
      ...projectTemplate.project,
      title: resolvedTitle,
      resolution: resolvedResolution,
      scenes: [],
      updatedAt: new Date().toISOString(),
      createConfig: initialConfig
        ? {
            template: initialConfig.template || null,
            pageSize: initialConfig.pageSize || 'landscape',
            workspace: initialConfig.workspace || '',
            folder: initialConfig.folder || '',
            tags: initialConfig.tags || [],
            name: initialConfig.name || resolvedTitle
          }
        : null
    }
  })
  const [activeSceneId, setActiveSceneId] = useState(null)
  const [selectedTool, setSelectedTool] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(70)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)
  const [selectedLayerId, setSelectedLayerId] = useState(null)
  const [musicDuration, setMusicDuration] = useState(null)

  // Memoized access for convenience
  const scenes = project.scenes;
  const bgMusic = scenes.find(s => s.clips.some(c => c.type === 'audio'))?.clips.find(c => c.type === 'audio')?.src || null;
  const [bgMusicVolume, setBgMusicVolume] = useState(0.6);

  const setBgMusic = (url) => {
    // Update or add audio clip to the first scene as a simple management strategy for now
    setProject(prev => {
      const newScenes = [...prev.scenes];
      if (newScenes.length > 0) {
        const audioClip = newScenes[0].clips.find(c => c.type === 'audio');
        if (audioClip) {
          newScenes[0].clips = newScenes[0].clips.map(c => c.type === 'audio' ? { ...c, src: url } : c);
        } else {
          newScenes[0].clips.push({
            id: `audio_${Date.now()}`,
            type: 'audio',
            src: url,
            startTime: 0,
            endTime: newScenes[0].duration,
            volume: bgMusicVolume
          });
        }
      }
      return { ...prev, scenes: newScenes };
    });
  }

  // Auto-create a default blank scene and return the new scene + updated scenes array
  const autoCreateScene = () => {
    const newScene = {
      id: `scene_${Date.now()}`,
      title: 'Intro',
      order: project.scenes.length,
      locked: false,
      thumbnail: avatar1,
      duration: 8.0,
      transition: {
        type: "fade",
        duration: 0.5,
        direction: null
      },
      avatar: avatar1, // Legacy support for now
      titleText: 'New Scene',
      subtitleText: 'Start creating your content',
      layout: 'default',
      clips: []
    }
    
    setProject(prev => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      scenes: [...prev.scenes, newScene]
    }))
    
    setActiveSceneId(newScene.id)
    return { newScene, updatedScenes: [...project.scenes, newScene] }
  }

  const addLayer = (type, content) => {
    let targetSceneId = activeSceneId
    let currentScenes = project.scenes

    if (!targetSceneId || currentScenes.length === 0) {
      const { newScene, updatedScenes } = autoCreateScene()
      targetSceneId = newScene.id
      currentScenes = updatedScenes
    }

    const targetScene = currentScenes.find(s => s.id === targetSceneId)
    if (!targetScene) return

    const newClip = {
      id: `clip_${Date.now()}`,
      type: type === 'image' ? 'image' : type === 'video' ? 'video' : 'text',
      src: type !== 'text' ? content : null,
      content: type === 'text' ? content : null,
      layer: targetScene.clips.length,
      startTime: 0.0,
      endTime: targetScene.duration || 8.0,
      position: { x: 50, y: 50 },
      size: { width: 400, height: 400 },
      opacity: 1.0,
      effects: {
        brightness: 1,
        contrast: 1,
        saturation: 1,
        blur: 0
      }
    }

    setProject(prev => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      scenes: prev.scenes.map(s => 
        s.id === targetSceneId 
          ? { ...s, clips: [...s.clips, newClip] }
          : s
      )
    }))
    return newClip.id
  }

  // Update a specific layer's position within the active scene
  const updateLayerPosition = (layerId, x, y) => {
    if (!activeSceneId) return
    setProject(prev => ({
      ...prev,
      scenes: prev.scenes.map(s => {
        if (s.id !== activeSceneId) return s
        return {
          ...s,
          clips: s.clips.map(c => c.id === layerId ? { ...c, position: { x, y } } : c)
        }
      })
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
  }, [activeSceneId, project.scenes])

  const deleteLayer = (sceneId, layerId) => {
    setProject(prev => ({
      ...prev,
      scenes: prev.scenes.map(s => 
        s.id === sceneId ? { ...s, clips: s.clips.filter(c => c.id !== layerId) } : s
      )
    }))
  }

  const deleteMusic = () => {
    setProject(prev => ({
      ...prev,
      scenes: prev.scenes.map(s => ({
        ...s,
        clips: s.clips.filter(c => c.type !== 'audio')
      }))
    }));
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
    const formatMultipliers = { 'MP4': 1.0, 'WebM': 0.8, 'GIF': 0.5 }
    const resolutionMultipliers = { '1920x1080': 1.0, '1280x720': 0.7, '3840x2160': 2.0 }
    const frameRateMultipliers = { '30': 1.0, '24': 0.8, '60': 1.5 }
    const qualityMultipliers = { 'High': 1.2, 'Medium': 1.0, 'Low': 0.7 }

    const formatMultiplier = formatMultipliers[exportFormat] || 1.0
    const resolutionMultiplier = resolutionMultipliers[exportResolution] || 1.0
    const frameRateMultiplier = frameRateMultipliers[exportFrameRate] || 1.0
    const qualityMultiplier = qualityMultipliers[exportQuality] || 1.0

    return Math.round(baseCredits * formatMultiplier * resolutionMultiplier * frameRateMultiplier * qualityMultiplier)
  }

  const activeScene = project.scenes.find(s => s.id === activeSceneId)

  const totalDurationInFrames = useMemo(() => {
    return project.scenes.reduce((sum, s) => sum + (s.duration || 8), 0) * 30
  }, [project.scenes])

  const handleReorderScenes = (newScenes) => {
    setProject(prev => ({ ...prev, scenes: newScenes }))
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
    // Deep copy the scene template to avoid shared references
    const newScene = JSON.parse(JSON.stringify(template));
    
    // Assign unique IDs to scene and all its clips
    newScene.id = `scene_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    newScene.order = project.scenes.length;
    
    if (newScene.clips) {
        newScene.clips = newScene.clips.map(clip => ({
            ...clip,
            id: `clip_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
        }));
    }

    setProject(prev => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      scenes: [...prev.scenes, newScene]
    }))
    
    setActiveSceneId(newScene.id)
  }

  const deleteScene = (id) => {
    if (project.scenes.length === 1) return
    const newScenes = project.scenes.filter(s => s.id !== id)
    setProject(prev => ({ ...prev, scenes: newScenes }))
    if (activeSceneId === id) setActiveSceneId(newScenes[0]?.id || null)
  }

  const updateScene = (id, updates) => {
    setProject(prev => ({
      ...prev,
      scenes: prev.scenes.map(s => s.id === id ? { ...s, ...updates } : s)
    }))
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
