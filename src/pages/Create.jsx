import { useMemo, useState, useEffect, useRef } from 'react'
import { Player } from '@remotion/player'
import { useCurrentFrame } from 'remotion'
import {
  MdUndo,
  MdRedo,
  MdPlayArrow,
  MdPause,
  MdStop,
  MdCloudUpload,
  MdPerson,
  MdTextFields,
  MdCropFree,
  MdPhotoLibrary,
  MdCategory,
  MdMic,
  MdPlayCircleOutline,
  MdZoomIn,
  MdZoomOut,
  MdFullscreen,
  MdSettings,
  MdSave,
  MdContentCut,
  MdContentCopy,
  MdContentPaste,
  MdDelete,
  MdAdd,
  MdVideoLibrary,
  MdMusicNote,
  MdPalette,
  MdTransform,
  MdLayers,
  MdTimer,
  MdAspectRatio,
  MdClose,
} from 'react-icons/md'
import avatar1 from '../assets/avatar1.png'
import avatar2 from '../assets/avatar2.png'
import avatar3 from '../assets/avatar3.png'
import avatar4 from '../assets/avatar4.png'
import avatar5 from '../assets/avatar5.png'

// Predefined avatars
const predefinedAvatars = [
  { id: 'avatar1', name: 'Avatar 1', image: avatar1 },
  { id: 'avatar2', name: 'Avatar 2', image: avatar2 },
  { id: 'avatar3', name: 'Avatar 3', image: avatar3 },
  { id: 'avatar4', name: 'Avatar 4', image: avatar4 },
  { id: 'avatar5', name: 'Avatar 5', image: avatar5 },
]

const avatarUrl =
  'https://media.istockphoto.com/id/1480023591/video/creating-a-female-video-game-character.jpg?s=640x640&k=20&c=S1LW6oZZDQYgsqp4GRL0bj9wE1oRIaBfQSV-UQXv2II='
const localAvatar = '/public/Avatar.png'

const styles = `
.video-editor-shell {
  min-height: 100vh;
  height: 100vh;
  background: #0f0f0f;
  display: grid;
  grid-template-rows: 60px 1fr 200px;
  overflow: hidden;
  box-sizing: border-box;
}

.editor-topbar {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: #1a1a1a;
  border-bottom: 1px solid #333;
}

.top-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.project-title {
  border: none;
  font-weight: 700;
  font-size: 14px;
  outline: none;
  background: transparent;
  color: #fff;
  min-width: 140px;
  padding: 6px 8px;
  border-radius: 6px;
  background: #2a2a2a;
}

.top-center {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.icon-btn {
  border: 1px solid #333;
  background: #2a2a2a;
  border-radius: 8px;
  padding: 8px 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 40px;
  justify-content: center;
  font-size: 14px;
  color: #fff;
}

.icon-btn:hover {
  background: #3a3a3a;
  border-color: #555;
}

.icon-btn.active {
  background: #0066cc;
  border-color: #0066cc;
}

.top-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.primary-btn {
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 700;
  cursor: pointer;
  background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
  color: #ffffff;
  transition: all 0.2s ease;
}

.primary-btn:hover {
  background: linear-gradient(135deg, #0052a3 0%, #003366 100%);
}

.editor-main {
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  gap: 0;
  background: #1a1a1a;
  overflow: hidden;
  position: relative;
  height: 100%;
}

.editor-main > * {
  overflow: hidden;
  height: 100%;
}

.media-library {
  background: #1e1e1e;
  border-right: 1px solid #333;
  padding: 16px;
  overflow-y: auto;
  display: grid;
  gap: 12px;
}

.library-section {
  display: grid;
  gap: 8px;
}

.section-title {
  color: #fff;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  margin: 0;
  padding: 8px 0;
  border-bottom: 1px solid #333;
}

.upload-area {
  border: 2px dashed #444;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  color: #888;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-area:hover {
  border-color: #0066cc;
  color: #0066cc;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
}

.media-item {
  aspect-ratio: 16/9;
  background: #2a2a2a;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: grid;
  place-items: center;
  color: #666;
  font-size: 20px;
}

.media-item:hover {
  background: #3a3a3a;
  transform: scale(1.05);
}

.canvas-area {
  background: #0a0a0a;
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 0;
  overflow: hidden;
}

.preview-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  height: 100%;
  overflow: hidden;
}

.preview-wrapper {
  background: transparent;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  border: 2px solid #333;
}

.preview-controls {
  background: #1a1a1a;
  border-top: 1px solid #333;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.playback-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-display {
  color: #fff;
  font-weight: 600;
  font-size: 12px;
  min-width: 100px;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.properties-panel {
  background: #1e1e1e;
  border-left: 1px solid #333;
  padding: 16px;
  overflow-y: auto;
  display: grid;
  gap: 16px;
}

.property-group {
  display: grid;
  gap: 12px;
}

.property-title {
  color: #fff;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  margin: 0;
  padding: 8px 0;
  border-bottom: 1px solid #333;
}

.property-row {
  display: grid;
  gap: 8px;
}

.property-label {
  color: #aaa;
  font-size: 12px;
  font-weight: 500;
}

.property-input {
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 6px;
  padding: 6px 8px;
  color: #fff;
  font-size: 12px;
}

.property-input:focus {
  outline: none;
  border-color: #0066cc;
}

.timeline-area {
  background: #1a1a1a;
  border-top: 1px solid #333;
  display: grid;
  grid-template-rows: 40px 1fr;
  gap: 0;
}

.timeline-header {
  background: #1e1e1e;
  border-bottom: 1px solid #333;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.timeline-tracks {
  background: #0a0a0a;
  overflow-x: auto;
  overflow-y: auto;
  padding: 8px;
}

.track {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 8px;
  margin-bottom: 8px;
  min-height: 40px;
}

.track-label {
  background: #2a2a2a;
  border-radius: 6px;
  padding: 8px 12px;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.track-content {
  background: #1a1a1a;
  border-radius: 6px;
  border: 1px solid #333;
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
}

.clip {
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 4px 8px;
  color: #fff;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 60px;
  text-align: center;
}

.clip:hover {
  background: #3a3a3a;
  border-color: #0066cc;
}

.clip.selected {
  background: #0066cc;
  border-color: #0066cc;
}

.playhead {
  position: absolute;
  top: 0;
  width: 2px;
  height: 100%;
  background: #ff3333;
  pointer-events: none;
  z-index: 10;
}

.tools-palette {
  position: fixed;
  left: 50%;
  bottom: 220px;
  transform: translateX(-50%);
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 8px;
  display: flex;
  gap: 4px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  z-index: 100;
}

.tool-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #2a2a2a;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: all 0.2s ease;
}

.tool-btn:hover {
  background: #3a3a3a;
}

.tool-btn.active {
  background: #0066cc;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: grid;
  place-items: center;
  z-index: 1000;
}

.modal-content {
  background: #1a1a1a;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  border: 1px solid #333;
}

.preview-modal {
  background: #1a1a1a;
  border-radius: 12px;
  padding: 24px;
  max-width: 90vw;
  width: 1200px;
  max-height: 90vh;
  border: 1px solid #333;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.preview-modal-title {
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.preview-modal-close {
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.preview-modal-close:hover {
  background: #2a2a2a;
}

.preview-modal-content {
  background: #0a0a0a;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #333;
}

.modal-title {
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 16px 0;
}

.modal-body {
  color: #aaa;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-secondary {
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 6px;
  padding: 8px 16px;
  color: #fff;
  cursor: pointer;
}

.btn-primary {
  background: #0066cc;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  color: #fff;
  cursor: pointer;
}

.btn-primary:hover {
  background: #0052a3;
}

/* Avatar Selection Styles */
.avatar-selection {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.avatar-options {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px;
}

.avatar-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border: 2px solid #333;
  border-radius: 8px;
  background: #2a2a2a;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
}

.avatar-option:hover {
  border-color: #0066cc;
  background: #333;
}

.avatar-option.active {
  border-color: #0066cc;
  background: #0066cc;
  color: white;
}

.avatar-option span {
  font-size: 11px;
  text-align: center;
  font-weight: 600;
}

.upload-avatar-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #333;
  border: 1px solid #444;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.upload-avatar-btn:hover {
  background: #444;
  border-color: #555;
}

/* Script Section Styles */
.script-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.script-input {
  width: 100%;
  min-height: 120px;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 6px;
  padding: 12px;
  color: #fff;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s ease;
}

.script-input:focus {
  outline: none;
  border-color: #0066cc;
}

.script-input::placeholder {
  color: #666;
}

.script-actions {
  display: flex;
  gap: 8px;
}

.script-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #333;
  border: 1px solid #444;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.script-btn:hover {
  background: #444;
  border-color: #555;
}
`

// Remotion Composition Component
const VideoComposition = ({ inputProps }) => {
  const frame = useCurrentFrame()
  const { scenes } = inputProps || { scenes: [] }
  
  // Find which scene we're in based on current frame
  let frameCount = 0
  let currentScene = scenes[0] || {}
  let frameInScene = 0
  
  for (const scene of scenes) {
    const sceneFrames = (scene.duration || 8) * 30
    if (frame < frameCount + sceneFrames) {
      currentScene = scene
      frameInScene = frame - frameCount
      break
    }
    frameCount += sceneFrames
  }
  
  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#ffffff',
      color: '#000000',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '40px'
    }}>
      {/* Main Content Container */}
      <div style={{
        width: '100%',
        height: '100%',
        maxWidth: '1200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '60px',
        position: 'relative',
        opacity: frameInScene > 10 ? 1 : frameInScene / 10,
        transition: 'opacity 0.3s ease'
      }}>
        {/* Left Side - Text Content */}
        <div style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: '24px',
          maxWidth: '600px',
          zIndex: 2
        }}>
          {/* Title */}
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            margin: '0',
            lineHeight: '1.2',
            color: '#000000',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            {currentScene?.titleText || 'Insert your video title here'}
          </h1>
          
          {/* Subtitle */}
          <h2 style={{
            fontSize: '24px',
            fontWeight: '400',
            margin: '0',
            lineHeight: '1.4',
            color: '#333333',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            {currentScene?.subtitleText || 'Add sub-headline here'}
          </h2>
          
          {/* Logo Placeholder */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#f0f0f0',
            border: '2px dashed #cccccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '8px',
            fontSize: '10px',
            color: '#999999',
            fontWeight: '600',
            textAlign: 'center',
            padding: '8px'
          }}>
            YOUR LOGO
          </div>
        </div>
        
        {/* Right Side - Avatar Display */}
        <div style={{
          flex: '0 0 auto',
          width: '300px',
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          {currentScene?.avatar ? (
            <img 
              src={currentScene.avatar} 
              alt="Avatar"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                objectPosition: 'center'
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#f5f5f5',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed #cccccc'
            }}>
              <MdPerson size={120} color="#999999" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Static Preview Component (for thumbnail view)
const StaticPreview = ({ scene }) => {
  // Debug: log scene data
  console.log('StaticPreview scene:', scene)
  
  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#ffffff',
      color: '#000000',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '30px 40px',
      boxSizing: 'border-box'
    }}>
      {/* Main Content Container */}
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '40px',
        position: 'relative',
        maxWidth: '100%'
      }}>
        {/* Left Side - Text Content */}
        <div style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: '20px',
          minWidth: '0',
          zIndex: 10,
          position: 'relative'
        }}>
          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: '700',
            margin: '0',
            lineHeight: '1.2',
            color: '#000000',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            wordWrap: 'break-word',
            width: '100%'
          }}>
            {scene?.titleText || 'Insert your video title here'}
          </h1>
          
          {/* Subtitle */}
          <h2 style={{
            fontSize: 'clamp(16px, 2.5vw, 22px)',
            fontWeight: '400',
            margin: '0',
            lineHeight: '1.4',
            color: '#333333',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            wordWrap: 'break-word',
            width: '100%'
          }}>
            {scene?.subtitleText || 'Add sub-headline here'}
          </h2>
          
          {/* Logo Placeholder */}
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#f0f0f0',
            border: '2px dashed #cccccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '4px',
            fontSize: '9px',
            color: '#999999',
            fontWeight: '600',
            textAlign: 'center',
            padding: '6px',
            flexShrink: 0
          }}>
            YOUR LOGO
          </div>
        </div>
        
        {/* Right Side - Avatar Display */}
        <div style={{
          flex: '0 0 auto',
          width: 'clamp(200px, 25vw, 280px)',
          height: 'clamp(250px, 35vh, 350px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 10
        }}>
          {scene?.avatar ? (
            <img 
              src={scene.avatar} 
              alt="Avatar"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                objectPosition: 'center',
                display: 'block',
                maxWidth: '100%',
                maxHeight: '100%'
              }}
              onError={(e) => {
                console.error('Avatar image failed to load:', scene.avatar)
                e.target.style.display = 'none'
              }}
              onLoad={() => {
                console.log('Avatar image loaded successfully:', scene.avatar)
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#f5f5f5',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed #cccccc'
            }}>
              <MdPerson size={80} color="#999999" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Create({ onBack }) {
  const [scenes, setScenes] = useState([
    {
      id: 'scene1',
      title: 'Scene 1',
      duration: 8,
      titleText: 'Insert your video title here',
      subtitleText: 'Add sub-headline here',
      script: 'Start your video by greeting your audience and introducing your topic. Create a clear title and give more context with a compelling sub-headline.',
      avatar: avatar1,
      avatarType: 'avatar1',
      type: 'video'
    }
  ])
  const [activeSceneId, setActiveSceneId] = useState('scene1')
  const [selectedTool, setSelectedTool] = useState('select')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState('avatar1')
  const playerRef = useRef(null)
  const speechSynthesisRef = useRef(null)
  
  const activeScene = scenes.find(s => s.id === activeSceneId)
  
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
  
  // Calculate total duration in frames (30 fps)
  const totalDurationInFrames = useMemo(() => {
    return scenes.reduce((total, scene) => total + ((scene.duration || 8) * 30), 0)
  }, [scenes])
  
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
    const newScene = {
      id: `scene${scenes.length + 1}`,
      title: `Scene ${scenes.length + 1}`,
      duration: 8,
      titleText: 'New Scene',
      subtitleText: 'Add your content here',
      type: 'video'
    }
    setScenes([...scenes, newScene])
    setActiveSceneId(newScene.id)
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
      // Pause
      if (playerRef.current) {
        playerRef.current.pause()
      }
      window.speechSynthesis.pause()
      setIsPlaying(false)
    } else {
      // Play
      if (playerRef.current) {
        playerRef.current.play()
      }
      // Resume or start speaking
      const currentScene = scenes.find(s => s.id === activeSceneId)
      if (currentScene?.script && window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
      } else if (currentScene?.script) {
        speakText(currentScene.script, activeSceneId)
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

  return (
    <>
      <style>{styles}</style>
      <div className="video-editor-shell">
        <div className="editor-topbar">
          <div className="top-left">
            <button className="icon-btn" onClick={onBack}>
              ← Back
            </button>
            <input 
              className="project-title" 
              defaultValue="Untitled Video Project" 
            />
            <button 
              className="icon-btn" 
              title="Undo"
              onClick={() => {
                console.log('Undo clicked')
                // TODO: Implement undo functionality
              }}
            >
              <MdUndo />
            </button>
            <button 
              className="icon-btn" 
              title="Redo"
              onClick={() => {
                console.log('Redo clicked')
                // TODO: Implement redo functionality
              }}
            >
              <MdRedo />
            </button>
            <button 
              className="icon-btn" 
              title="Save"
              onClick={() => {
                alert('Project saved!')
                // TODO: Implement save functionality
              }}
            >
              <MdSave />
            </button>
          </div>
          
          <div className="top-center">
            <button 
              className={`icon-btn ${selectedTool === 'avatar' ? 'active' : ''}`}
              title="Avatar"
              onClick={() => setSelectedTool('avatar')}
            >
              <MdPerson />
            </button>
            <button 
              className={`icon-btn ${selectedTool === 'text' ? 'active' : ''}`}
              title="Text"
              onClick={() => setSelectedTool('text')}
            >
              <MdTextFields />
            </button>
            <button 
              className={`icon-btn ${selectedTool === 'media' ? 'active' : ''}`}
              title="Media"
              onClick={() => setSelectedTool('media')}
            >
              <MdPhotoLibrary />
            </button>
            <button 
              className={`icon-btn ${selectedTool === 'audio' ? 'active' : ''}`}
              title="Audio"
              onClick={() => setSelectedTool('audio')}
            >
              <MdMusicNote />
            </button>
            <button 
              className={`icon-btn ${selectedTool === 'effects' ? 'active' : ''}`}
              title="Effects"
              onClick={() => setSelectedTool('effects')}
            >
              <MdPalette />
            </button>
            <button 
              className={`icon-btn ${selectedTool === 'layers' ? 'active' : ''}`}
              title="Layers"
              onClick={() => setSelectedTool('layers')}
            >
              <MdLayers />
            </button>
          </div>
          
          <div className="top-right">
            <button 
              className="icon-btn" 
              title="Preview"
              onClick={handlePreview}
            >
              <MdPlayCircleOutline /> Preview
            </button>
            <button 
              className="icon-btn" 
              title="Settings"
              onClick={() => {
                alert('Settings panel coming soon!')
                // TODO: Implement settings panel
              }}
            >
              <MdSettings />
            </button>
            <button className="primary-btn" onClick={exportVideo}>
              Export Video
            </button>
          </div>
        </div>

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
                    console.log('Files selected:', files)
                    // TODO: Handle file uploads
                    alert(`${files.length} file(s) selected. Upload functionality coming soon!`)
                  }
                  input.click()
                }}
              >
                <MdCloudUpload size={24} />
                <div>Upload Media</div>
              </div>
              <div className="media-grid">
                <div className="media-item">
                  <MdPhotoLibrary />
                </div>
                <div className="media-item">
                  <MdVideoLibrary />
                </div>
                <div className="media-item">
                  <MdMusicNote />
                </div>
                <div className="media-item">
                  <MdPhotoLibrary />
                </div>
              </div>
            </div>
            
            <div className="library-section">
              <h3 className="section-title">Templates</h3>
              <div className="media-grid">
                <div className="media-item">
                  <MdVideoLibrary />
                </div>
                <div className="media-item">
                  <MdVideoLibrary />
                </div>
              </div>
            </div>
          </div>
          
          {/* Canvas Area */}
          <div className="canvas-area">
            <div className="preview-container">
              <div className="preview-wrapper">
                <div 
                  style={{
                    width: '100%',
                    maxWidth: '900px',
                    aspectRatio: '16/9',
                    backgroundColor: '#ffffff',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    height: 'calc(100% - 40px)',
                    maxHeight: '500px',
                    margin: '0 auto'
                  }}
                >
                  {showPreviewModal ? (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#666',
                      fontSize: '14px',
                      backgroundColor: '#f9f9f9'
                    }}>
                      Preview is open in modal
                    </div>
                  ) : (
                    <StaticPreview scene={activeScene} />
                  )}
                </div>
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
            {/* Avatar Section */}
            <div className="property-group">
              <h3 className="property-title">
                <MdPerson style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Avatar
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
            
            {/* Script Section */}
            <div className="property-group">
              <h3 className="property-title">
                <MdTextFields style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Script
              </h3>
              <div className="script-container">
                <textarea
                  className="script-input"
                  placeholder="Enter your script here..."
                  value={activeScene?.script || ''}
                  onChange={(e) => updateScene(activeSceneId, { script: e.target.value })}
                  rows={6}
                />
                <div className="script-actions">
                  <button className="script-btn">
                    <MdMic />
                    Record Audio
                  </button>
                  <button className="script-btn">
                    <MdMusicNote />
                    Add Voiceover
                  </button>
                </div>
              </div>
            </div>
            
            <div className="property-group">
              <h3 className="property-title">Scene Properties</h3>
              <div className="property-row">
                <label className="property-label">Scene Name</label>
                <input 
                  className="property-input"
                  value={activeScene?.title || ''}
                  onChange={(e) => updateScene(activeSceneId, { title: e.target.value })}
                />
              </div>
              <div className="property-row">
                <label className="property-label">Duration (seconds)</label>
                <input 
                  className="property-input"
                  type="number"
                  value={activeScene?.duration || 8}
                  onChange={(e) => updateScene(activeSceneId, { duration: Number(e.target.value) })}
                />
              </div>
            </div>
            
            <div className="property-group">
              <h3 className="property-title">Text Properties</h3>
              <div className="property-row">
                <label className="property-label">Title Text</label>
                <input 
                  className="property-input"
                  value={activeScene?.titleText || ''}
                  onChange={(e) => updateScene(activeSceneId, { titleText: e.target.value })}
                />
              </div>
              <div className="property-row">
                <label className="property-label">Subtitle Text</label>
                <input 
                  className="property-input"
                  value={activeScene?.subtitleText || ''}
                  onChange={(e) => updateScene(activeSceneId, { subtitleText: e.target.value })}
                />
              </div>
            </div>
            
            <div className="property-group">
              <h3 className="property-title">Transform</h3>
              <div className="property-row">
                <label className="property-label">Position X</label>
                <input className="property-input" type="number" defaultValue="0" />
              </div>
              <div className="property-row">
                <label className="property-label">Position Y</label>
                <input className="property-input" type="number" defaultValue="0" />
              </div>
              <div className="property-row">
                <label className="property-label">Scale</label>
                <input className="property-input" type="number" defaultValue="100" />
              </div>
              <div className="property-row">
                <label className="property-label">Rotation</label>
                <input className="property-input" type="number" defaultValue="0" />
              </div>
            </div>
            
            <div className="property-group">
              <h3 className="property-title">Appearance</h3>
              <div className="property-row">
                <label className="property-label">Opacity</label>
                <input className="property-input" type="number" defaultValue="100" />
              </div>
              <div className="property-row">
                <label className="property-label">Background Color</label>
                <input className="property-input" type="color" defaultValue="#000000" />
              </div>
            </div>
          </div>
        </div>
        {/* Timeline */}
        <div className="timeline-area">
          <div className="timeline-header">
            <button className="icon-btn" onClick={addScene}>
              <MdAdd /> Add Scene
            </button>
            <button className="icon-btn" title="Cut" onClick={() => {
              if (activeSceneId) {
                console.log('Cut scene:', activeSceneId)
                // TODO: Implement cut functionality
              }
            }}>
              <MdContentCut />
            </button>
            <button className="icon-btn" title="Copy" onClick={() => {
              if (activeSceneId) {
                console.log('Copy scene:', activeSceneId)
                // TODO: Implement copy functionality
              }
            }}>
              <MdContentCopy />
            </button>
            <button className="icon-btn" title="Paste" onClick={() => {
              console.log('Paste scene')
              // TODO: Implement paste functionality
            }}>
              <MdContentPaste />
            </button>
            <button className="icon-btn" title="Delete" onClick={() => {
              if (activeSceneId) {
                deleteScene(activeSceneId)
              }
            }}>
              <MdDelete />
            </button>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
              <button className="icon-btn" title="Snap to Grid">
                <MdTimer />
              </button>
              <button className="icon-btn" title="Aspect Ratio">
                <MdAspectRatio />
              </button>
            </div>
          </div>
          
          <div className="timeline-tracks">
            {scenes.map((scene) => (
              <div key={scene.id} className="track">
                <div 
                  className={`track-label ${scene.id === activeSceneId ? 'active' : ''}`}
                  onClick={() => setActiveSceneId(scene.id)}
                  style={{ 
                    background: scene.id === activeSceneId ? '#0066cc' : '#2a2a2a',
                    cursor: 'pointer'
                  }}
                >
                  <MdVideoLibrary size={14} />
                  {scene.title}
                </div>
                <div className="track-content">
                  <div 
                    className={`clip ${scene.id === activeSceneId ? 'selected' : ''}`}
                    onClick={() => {
                      setActiveSceneId(scene.id)
                      // Calculate frame position for this scene
                      let frameCount = 0
                      for (const s of scenes) {
                        if (s.id === scene.id) break
                        frameCount += (s.duration || 8) * 30
                      }
                      setCurrentTime(frameCount / 30)
                      if (playerRef.current) {
                        playerRef.current.seekTo(frameCount)
                      }
                    }}
                    style={{ 
                      width: `${(scene.duration || 8) * 20}px`,
                      background: scene.id === activeSceneId ? '#0066cc' : '#2a2a2a'
                    }}
                  >
                    {scene.duration || 8}s
                  </div>
                  <div 
                    className="playhead" 
                    style={{ 
                      left: `${Math.min(currentTime * 20, (scene.duration || 8) * 20)}px`,
                      display: scene.id === activeSceneId ? 'block' : 'none'
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Tools Palette */}
        <div className="tools-palette">
          <button 
            className={`tool-btn ${selectedTool === 'select' ? 'active' : ''}`}
            onClick={() => setSelectedTool('select')}
            title="Select Tool"
          >
            <MdTextFields />
          </button>
          <button 
            className={`tool-btn ${selectedTool === 'text' ? 'active' : ''}`}
            onClick={() => setSelectedTool('text')}
            title="Text Tool"
          >
            <MdTextFields />
          </button>
          <button 
            className={`tool-btn ${selectedTool === 'crop' ? 'active' : ''}`}
            onClick={() => setSelectedTool('crop')}
            title="Crop Tool"
          >
            <MdCropFree />
          </button>
          <button 
            className={`tool-btn ${selectedTool === 'transform' ? 'active' : ''}`}
            onClick={() => setSelectedTool('transform')}
            title="Transform Tool"
          >
            <MdTransform />
          </button>
        </div>
        
        {/* Preview Modal */}
        {showPreviewModal && (
          <div className="modal-overlay" onClick={() => {
            setShowPreviewModal(false)
            if (playerRef.current) {
              playerRef.current.pause()
            }
            setIsPlaying(false)
          }}>
            <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
              <div className="preview-modal-header">
                <h2 className="preview-modal-title">Video Preview</h2>
                <button 
                  className="preview-modal-close"
                  onClick={() => {
                    setShowPreviewModal(false)
                    if (playerRef.current) {
                      playerRef.current.pause()
                    }
                    window.speechSynthesis.cancel()
                    setIsPlaying(false)
                  }}
                >
                  <MdClose size={24} />
                </button>
              </div>
              <div className="preview-modal-content">
                <Player
                  ref={playerRef}
                  component={VideoComposition}
                  durationInFrames={Math.max(totalDurationInFrames, 240)}
                  compositionWidth={1920}
                  compositionHeight={1080}
                  fps={30}
                  controls
                  style={{
                    width: '100%',
                    maxHeight: '70vh'
                  }}
                  inputProps={{
                    scenes: scenes
                  }}
                  onPlay={() => {
                    setIsPlaying(true)
                    // Start speaking when play starts
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
                      // Speak the new scene's script
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
                      // Speak the new scene's script when scene changes
                      if (scene.script) {
                        window.speechSynthesis.cancel()
                        setTimeout(() => speakText(scene.script, scene.id), 300)
                      }
                    }
                  }}
                />
              </div>
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
                    <select className="property-input">
                      <option>MP4</option>
                      <option>WebM</option>
                      <option>GIF</option>
                    </select>
                  </div>
                  <div className="property-row">
                    <label className="property-label">Resolution</label>
                    <select className="property-input">
                      <option>1920x1080 (Full HD)</option>
                      <option>1280x720 (HD)</option>
                      <option>3840x2160 (4K)</option>
                    </select>
                  </div>
                  <div className="property-row">
                    <label className="property-label">Frame Rate</label>
                    <select className="property-input">
                      <option>30 fps</option>
                      <option>24 fps</option>
                      <option>60 fps</option>
                    </select>
                  </div>
                  <div className="property-row">
                    <label className="property-label">Quality</label>
                    <select className="property-input">
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowExportModal(false)}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={() => {
                  alert('Video export started! This will take a few moments...')
                  setShowExportModal(false)
                }}>
                  Start Export
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

