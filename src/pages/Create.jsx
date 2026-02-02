import { useMemo, useState, useEffect, useRef } from 'react'
import { Player } from '@remotion/player'
import { useCurrentFrame, spring, interpolate, useVideoConfig } from 'remotion'
import {
  MdPlayArrow,
  MdPause,
  MdStop,
  MdCloudUpload,
  MdPerson,
  MdTextFields,
  MdPhotoLibrary,
  MdLayers,
  MdZoomIn,
  MdZoomOut,
  MdMic,
  MdFullscreen,
  MdVideoLibrary,
  MdDelete, // Add MdDelete
  MdClose
} from 'react-icons/md'
import TimelineEditor from '../components/TimelineEditor'
import './Create.css'
import { predefinedAvatars, predefinedMedia, pageTemplates, avatarUrl, localAvatar } from '../constants/editorData'
import VideoComposition from '../components/editor/VideoComposition'
import StaticPreview from '../components/editor/StaticPreview'
import avatar1 from '../assets/avatar1.png'
import EditorTopbar from '../components/editor/EditorTopbar'

function Create({ onBack }) {
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
  const [selectedTool, setSelectedTool] = useState('avatar')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState('avatar1')
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [bgMusic, setBgMusic] = useState('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3')
  const [bgMusicVolume, setBgMusicVolume] = useState(0.3)

  const addLayer = (type, content) => {
    const activeScene = scenes.find(s => s.id === activeSceneId)
    const newLayer = {
      id: `layer-${Date.now()}`,
      type,
      content,
      start: 0,
      duration: activeScene?.duration || 8,
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

  // Export settings state
  const [exportFormat, setExportFormat] = useState('MP4')
  const [exportResolution, setExportResolution] = useState('1920x1080')
  const [exportFrameRate, setExportFrameRate] = useState('30')
  const [exportQuality, setExportQuality] = useState('High')

  const playerRef = useRef(null)
  const speechSynthesisRef = useRef(null)

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
    const newScene = {
      id: `scene${Date.now()}`,
      title: `Scene ${scenes.length + 1}`,
      duration: 8,
      titleText: template.fields.find(f => f.key === 'titleText')?.default || 'New Scene',
      subtitleText: template.fields.find(f => f.key === 'subtitleText')?.default || 'Add your content here',
      layout: template.layout,
      avatar: activeScene?.avatar || avatar1,
      avatarType: activeScene?.avatarType || 'avatar1',
      type: 'video',
      titleStyle: {
        fontSize: 48,
        color: '#0066cc',
        fontFamily: 'Inter',
        fontWeight: '700',
        textAlign: 'left'
      },
      subtitleStyle: {
        fontSize: 24,
        color: '#333333',
        fontFamily: 'Inter',
        fontWeight: '400',
        textAlign: 'left'
      }
    }

    // Add other template fields as data
    template.fields.forEach(field => {
      if (field.key !== 'titleText' && field.key !== 'subtitleText') {
        newScene[field.key] = field.default
      }
    })

    setScenes([...scenes, newScene])
    setActiveSceneId(newScene.id)
    setShowTemplateModal(false)
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
    setScenes(scenes.map(scene =>
      scene.id === id ? { ...scene, ...updates } : scene
    ))
  }

  const exportVideo = () => {
    setShowExportModal(true)
  }

  const selectAvatar = (avatarId) => {
    setSelectedAvatar(avatarId)
    const avatar = predefinedAvatars.find(a => a.id === avatarId)
    updateScene(activeSceneId, {
      avatarType: avatarId,
      avatar: avatar ? avatar.image : null
    })
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

  // Handle play/pause with speech
  const handlePlayPause = () => {
    if (isPlaying) {
      if (playerRef.current) {
        playerRef.current.pause()
      }
      window.speechSynthesis.pause()
      setIsPlaying(false)
    } else {
      if (playerRef.current) {
        playerRef.current.play()
      }
      // Resume or start speaking
      const { scene } = getSceneForFrame(currentTime * 30)
      if (scene?.script) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume()
        } else {
          speakText(scene.script, scene.id)
        }
      }
      setIsPlaying(true)
    }
  }

  // Handle stop with speech
  const handleStop = () => {
    if (playerRef.current) {
      playerRef.current.pause()
      playerRef.current.seekTo(0)
    }
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const handleSeek = (time) => {
    setCurrentTime(time)
    if (playerRef.current) {
      playerRef.current.seekTo(time * 30)
    }
  }

  return (
    <>
      <div className="video-editor-shell">
        <EditorTopbar
          onBack={onBack}
          selectedTool={selectedTool}
          setSelectedTool={setSelectedTool}
          handlePreview={handlePreview}
          exportVideo={exportVideo}
        />

        <div className="editor-main">
          {/* Media Library */}
          <div className="media-library">
            <div className="library-section">
              <h3 className="section-title">Media Library</h3>
              <div
                className="upload-area"
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*,video/*,audio/*'
                  input.multiple = true
                  input.onchange = (e) => {
                    const files = Array.from(e.target.files)
                    files.forEach(file => {
                      const url = URL.createObjectURL(file)
                      addLayer(file.type.split('/')[0], url)
                    })
                  }
                  input.click()
                }}
              >
                <MdCloudUpload size={24} />
                <div>Upload Media</div>
              </div>
              <div className="media-grid">
                {predefinedMedia.map((media) => (
                  <div
                    key={media.id}
                    className="media-item"
                    onClick={() => addLayer('image', media.full)}
                    title={`Add ${media.name}`}
                  >
                    <img src={media.image} alt={media.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="library-section">
              <h3 className="section-title">Page Templates</h3>
              <div className="media-grid">
                {pageTemplates.map(template => (
                  <div
                    key={template.id}
                    className="media-item"
                    title={template.name}
                    onClick={() => handleAddTemplateScene(template)}
                  >
                    {template.icon}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="canvas-area">
            <div className="preview-container">
              <div className="preview-wrapper">
                <Player
                  ref={playerRef}
                  component={VideoComposition}
                  durationInFrames={Math.max(totalDurationInFrames, 1)}
                  compositionWidth={1920}
                  compositionHeight={1080}
                  fps={30}
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'white'
                  }}
                  inputProps={{
                    scenes: scenes,
                    bgMusic: bgMusic,
                    bgMusicVolume: bgMusicVolume
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

            <div className="preview-controls">
              <div className="playback-controls">
                <button
                  className="icon-btn"
                  title="Stop"
                  onClick={handleStop}
                >
                  <MdStop />
                </button>
                <button
                  className="icon-btn"
                  title="Play/Pause"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? <MdPause /> : <MdPlayArrow />}
                </button>
                <div className="time-display">
                  {String(Math.floor(currentTime / 60)).padStart(2, '0')}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} / {String(Math.floor((totalDurationInFrames / 30) / 60)).padStart(2, '0')}:{String(Math.floor((totalDurationInFrames / 30) % 60)).padStart(2, '0')}
                </div>
              </div>

              <div className="zoom-controls">
                <button
                  className="icon-btn"
                  title="Zoom Out"
                  onClick={() => setZoomLevel(Math.max(25, zoomLevel - 25))}
                >
                  <MdZoomOut />
                </button>
                <span style={{ color: '#aaa', fontSize: '12px', margin: '0 8px' }}>
                  {zoomLevel}%
                </span>
                <button
                  className="icon-btn"
                  title="Zoom In"
                  onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                >
                  <MdZoomIn />
                </button>
                <button
                  className="icon-btn"
                  title="Fullscreen"
                  onClick={() => {
                    const elem = document.querySelector('.preview-wrapper')
                    if (elem.requestFullscreen) {
                      elem.requestFullscreen()
                    }
                  }}
                >
                  <MdFullscreen />
                </button>
              </div>
            </div>
          </div>

          {/* Properties Panel */}
          <div className="properties-panel">
            {selectedTool === 'avatar' && (
              <div className="property-group">
                <h3 className="property-title">
                  <MdPerson style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Avatar Selection
                </h3>
                <div className="avatar-selection">
                  <div className="avatar-options" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                    gap: '8px'
                  }}>
                    {predefinedAvatars.map((avatar) => (
                      <div
                        key={avatar.id}
                        className={`avatar-option ${activeScene?.avatarType === avatar.id ? 'active' : ''}`}
                        onClick={() => selectAvatar(avatar.id)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px',
                          border: `2px solid ${activeScene?.avatarType === avatar.id ? '#0066cc' : '#333'}`,
                          borderRadius: '8px',
                          background: activeScene?.avatarType === avatar.id ? '#0066cc' : '#2a2a2a',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <img
                          src={avatar.image}
                          alt={avatar.name}
                          style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid rgba(255,255,255,0.2)'
                          }}
                        />
                        <span style={{
                          fontSize: '11px',
                          textAlign: 'center',
                          fontWeight: 600,
                          color: activeScene?.avatarType === avatar.id ? '#fff' : '#aaa'
                        }}>
                          {avatar.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedTool === 'text' && (
              <div className="property-group">
                <h3 className="property-title">
                  <MdTextFields style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Text Styling
                </h3>

                {/* Dynamically render fields based on template */}
                {(pageTemplates.find(t => t.layout === (activeScene?.layout || 'split-right'))?.fields || []).map(field => (
                  <div key={field.key} className="property-row">
                    <label className="property-label">{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea
                        className="property-input"
                        style={{ minHeight: '60px', resize: 'vertical' }}
                        value={activeScene?.[field.key] || ''}
                        onChange={(e) => updateScene(activeSceneId, { [field.key]: e.target.value })}
                      />
                    ) : (
                      <input
                        className="property-input"
                        value={activeScene?.[field.key] || ''}
                        onChange={(e) => updateScene(activeSceneId, { [field.key]: e.target.value })}
                      />
                    )
                    }
                  </div>
                ))}

                <div style={{ height: '8px', borderBottom: '1px solid #333', margin: '8px 0' }} />

                <div className="property-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label className="property-label">Title Size</label>
                    <input
                      className="property-input"
                      type="number"
                      value={activeScene?.titleStyle?.fontSize || 48}
                      onChange={(e) => updateScene(activeSceneId, {
                        titleStyle: { ...(activeScene?.titleStyle || {}), fontSize: Number(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <label className="property-label">Title Color</label>
                    <input
                      className="property-input"
                      type="color"
                      style={{ height: '32px', padding: '2px' }}
                      value={activeScene?.titleStyle?.color || '#000000'}
                      onChange={(e) => updateScene(activeSceneId, {
                        titleStyle: { ...(activeScene?.titleStyle || {}), color: e.target.value }
                      })}
                    />
                  </div>
                </div>
                <div className="property-row">
                  <label className="property-label">Alignment</label>
                  <select
                    className="property-input"
                    value={activeScene?.titleStyle?.textAlign || 'left'}
                    onChange={(e) => updateScene(activeSceneId, {
                      titleStyle: { ...(activeScene?.titleStyle || {}), textAlign: e.target.value }
                    })}
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>

                <div className="property-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label className="property-label">Sub Size</label>
                    <input
                      className="property-input"
                      type="number"
                      value={activeScene?.subtitleStyle?.fontSize || 24}
                      onChange={(e) => updateScene(activeSceneId, {
                        subtitleStyle: { ...(activeScene?.subtitleStyle || {}), fontSize: Number(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <label className="property-label">Sub Color</label>
                    <input
                      className="property-input"
                      type="color"
                      style={{ height: '32px', padding: '2px' }}
                      value={activeScene?.subtitleStyle?.color || '#333333'}
                      onChange={(e) => updateScene(activeSceneId, {
                        subtitleStyle: { ...(activeScene?.subtitleStyle || {}), color: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedTool === 'layers' && (
              <div className="property-group">
                <h3 className="property-title">
                  <MdLayers style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  B-Roll & Overlays
                </h3>
                <div className="layers-list">
                  {(activeScene?.layers || []).length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontSize: '12px', border: '1px dashed #444', borderRadius: '8px' }}>
                      No extra layers in this scene. Add media from the library to see them here.
                    </div>
                  ) : (
                    activeScene.layers.map(layer => (
                      <div key={layer.id} className="layer-item-preview">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {layer.type === 'image' ? <MdPhotoLibrary size={14} /> : <MdVideoLibrary size={14} />}
                          <span>{layer.type}</span>
                        </div>
                        <button onClick={() => {
                          updateScene(activeSceneId, {
                            layers: activeScene.layers.filter(l => l.id !== layer.id)
                          })
                        }}>
                          <MdDelete size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* General Properties */}
            <div className="property-group">
              <h3 className="property-title">Scene Configuration</h3>
              <div className="property-row">
                <label className="property-label">Duration (seconds)</label>
                <input
                  className="property-input"
                  type="number"
                  value={activeScene?.duration || 8}
                  onChange={(e) => updateScene(activeSceneId, { duration: Number(e.target.value) })}
                />
              </div>
              <div className="property-row">
                <label className="property-label">Transition</label>
                <select className="property-input" defaultValue="fade">
                  <option value="none">None (Cut)</option>
                  <option value="fade">Fade</option>
                  <option value="slide">Slide</option>
                </select>
              </div>
            </div>

            <div className="property-group">
              <h3 className="property-title">
                <MdMic style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Voiceover Script
              </h3>
              <textarea
                className="script-input"
                placeholder="What will the AI say?"
                value={activeScene?.script || ''}
                onChange={(e) => updateScene(activeSceneId, { script: e.target.value })}
                rows={4}
              />
            </div>
            {selectedTool === 'media' && (
              <div className="property-group">
                <h3 className="property-title">
                  <MdMusicNote style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Background Music
                </h3>
                <div className="property-row">
                  <label className="property-label">Select Audio</label>
                  <select
                    className="property-input"
                    value={bgMusic}
                    onChange={(e) => setBgMusic(e.target.value)}
                  >
                    <option value="">None</option>
                    <option value="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3">Acoustic Guitar</option>
                    <option value="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3">Upbeat Tech</option>
                    <option value="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3">Ambient Corporate</option>
                  </select>
                </div>
                <div className="property-row">
                  <label className="property-label">Volume: {Math.round(bgMusicVolume * 100)}%</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={bgMusicVolume}
                    onChange={(e) => setBgMusicVolume(Number(e.target.value))}
                    className="property-input"
                  />
                </div>
                <div style={{ marginTop: '20px' }}>
                  <label className="property-label">Voiceover Settings</label>
                  <p style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                    AI voiceover will play automatically when you preview scenes.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Enhanced Timeline Component */}
        <div className="timeline-area" style={{ height: '300px', display: 'block' }}>
          <TimelineEditor
            scenes={scenes}
            activeSceneId={activeSceneId}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onSeek={handleSeek}
            onSelectScene={setActiveSceneId}
            onUpdateScene={updateScene}
            onAddScene={addScene}
            onDeleteScene={deleteScene}
            onReorderScenes={handleReorderScenes}
          />
        </div>

        {/* Removed redundant overlay tools palette as requested */}

        {/* Preview Modal (Updated to "Fullscreen Mode") */}
        {showPreviewModal && (
          <div className="fullscreen-preview-page">
            <style>{`
              .fullscreen-preview-page {
                position: fixed;
                inset: 0;
                background: #000;
                z-index: 2000;
                display: flex;
                flex-direction: column;
                color: #fff;
              }
              .preview-topbar {
                height: 60px;
                padding: 0 24px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: rgba(255,255,255,0.05);
                backdrop-filter: blur(10px);
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                z-index: 100;
              }
              .preview-content {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #0a0a0a;
              }
              .close-preview {
                background: #ff4d4d;
                border: none;
                color: #fff;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
              }
            `}</style>
            <div className="preview-topbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontWeight: 700, fontSize: '18px' }}>AthenaVI Preview</span>
                <span style={{ color: '#888', fontSize: '14px' }}>Draft - {scenes.length} Scenes</span>
              </div>
              <button className="close-preview" onClick={() => {
                setShowPreviewModal(false)
                setIsPlaying(false)
                if (playerRef.current) playerRef.current.pause()
                window.speechSynthesis.cancel()
              }}>
                Exit Preview
              </button>
            </div>
            <div className="preview-content">
              <Player
                ref={playerRef}
                component={VideoComposition}
                durationInFrames={Math.max(totalDurationInFrames, 30)}
                compositionWidth={1920}
                compositionHeight={1080}
                fps={30}
                controls
                autoPlay
                style={{
                  width: '100%',
                  height: '100%',
                  maxHeight: '100vh'
                }}
                inputProps={{
                  scenes: scenes,
                  bgMusic: bgMusic,
                  bgMusicVolume: bgMusicVolume
                }}
                onPlay={() => {
                  setIsPlaying(true)
                  const currentScene = scenes.find(s => s.id === activeSceneId)
                  if (currentScene?.script) {
                    speakText(currentScene.script, activeSceneId)
                  }
                }}
                onPause={() => {
                  setIsPlaying(false)
                  window.speechSynthesis.pause()
                }}
                onSeek={(frame) => {
                  setCurrentTime(frame / 30)
                  const { scene } = getSceneForFrame(frame)
                  if (scene) {
                    setActiveSceneId(scene.id)
                    if (scene.script) {
                      window.speechSynthesis.cancel()
                      setTimeout(() => speakText(scene.script, scene.id), 300)
                    }
                  }
                }}
                onFrameUpdate={(frame) => {
                  setCurrentTime(frame / 30)
                  const { scene } = getSceneForFrame(frame)
                  if (scene && scene.id !== activeSceneId) {
                    setActiveSceneId(scene.id)
                    if (scene.script) {
                      window.speechSynthesis.cancel()
                      setTimeout(() => speakText(scene.script, scene.id), 300)
                    }
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Export Modal */}
        {showExportModal && (
          <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">Export Video</h2>
              <div className="modal-body">
                <div className="property-group">
                  <div className="property-row">
                    <label className="property-label">Format</label>
                    <select
                      className="property-input"
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                    >
                      <option>MP4</option>
                      <option>WebM</option>
                      <option>GIF</option>
                    </select>
                  </div>
                  <div className="property-row">
                    <label className="property-label">Resolution</label>
                    <select
                      className="property-input"
                      value={exportResolution}
                      onChange={(e) => setExportResolution(e.target.value)}
                    >
                      <option>1920x1080</option>
                      <option>1280x720</option>
                      <option>3840x2160</option>
                    </select>
                  </div>
                  <div className="property-row">
                    <label className="property-label">Frame Rate</label>
                    <select
                      className="property-input"
                      value={exportFrameRate}
                      onChange={(e) => setExportFrameRate(e.target.value)}
                    >
                      <option>30</option>
                      <option>24</option>
                      <option>60</option>
                    </select>
                  </div>
                  <div className="property-row">
                    <label className="property-label">Quality</label>
                    <select
                      className="property-input"
                      value={exportQuality}
                      onChange={(e) => setExportQuality(e.target.value)}
                    >
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                </div>

                {/* Credit Display */}
                <div className="credit-display" style={{
                  marginTop: '20px',
                  padding: '15px',
                  backgroundColor: '#2a2a2a',
                  borderRadius: '8px',
                  border: '1px solid #444'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{ color: '#fff', fontSize: '14px' }}>Credit Consumption:</span>
                    <span style={{
                      color: '#4CAF50',
                      fontSize: '18px',
                      fontWeight: 'bold'
                    }}>
                      {calculateCredits()} credits
                    </span>
                  </div>
                  <div style={{
                    color: '#888',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}>
                    Credits vary based on format, resolution, frame rate, and quality
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowExportModal(false)}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={() => {
                  alert(`Video export started! This will consume ${calculateCredits()} credits.`)
                  setShowExportModal(false)
                }}>
                  Start Export
                </button>
              </div>
            </div>
          </div>
        )}

        {showTemplateModal && (
          <div className="modal-overlay">
            <div className="template-modal">
              <div className="preview-modal-header">
                <h3 className="preview-modal-title">Select a Scene Template</h3>
                <button className="preview-modal-close" onClick={() => setShowTemplateModal(false)}>
                  <MdClose size={24} />
                </button>
              </div>
              <div className="template-grid">
                {pageTemplates.map(template => (
                  <div
                    key={template.id}
                    className="template-card"
                    onClick={() => handleAddTemplateScene(template)}
                  >
                    <div className="template-preview-wrapper" style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      position: 'relative',
                      border: '1px solid #444',
                      background: '#000',
                      pointerEvents: 'none'
                    }}>
                      <StaticPreview scene={{
                        layout: template.layout,
                        titleText: template.fields.find(f => f.key === 'titleText')?.default || template.name,
                        subtitleText: template.fields.find(f => f.key === 'subtitleText')?.default || '',
                        avatar: avatar1,
                        ...template.fields.reduce((acc, f) => ({ ...acc, [f.key]: f.default }), {})
                      }} />
                    </div>
                    <div className="template-info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ color: '#0066cc', fontSize: '18px', display: 'flex' }}>{template.icon}</div>
                        <h4 style={{ margin: 0 }}>{template.name}</h4>
                      </div>
                      <p>{template.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowTemplateModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Create
