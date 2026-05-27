import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
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
import GeneratedVideoModal from '../../components/features/editor/editor/GeneratedVideoModal'
import QuickCreateModal from '../../components/features/editor/editor/QuickCreateModal'
import heygenService from '../../services/heygenService'
import avatar1 from '../../assets/Avatarr1.png'
import projectTemplate from '../../constants/projectTemplate.json'
import workspaceService from '../../services/workspaceService'
import { buildHeygenAvatarContent } from '../../utils/heygenAvatars'

function Create({ onBack, initialConfig = null }) {
  // Debug: Log when component mounts
  useEffect(() => {
    console.log('Create component mounted')
  }, [])

  const [project, setProject] = useState(() => {
    // If we have full video data already (e.g. from dashboard click)
    if (initialConfig?.videoData?.data) {
      const data = initialConfig.videoData.data;
      
      const mapBackendToFrontend = (backendScenes) => {
        if (!backendScenes) return [];
        return backendScenes.map(scene => ({
          ...scene,
          id: scene.sceneId || scene.id,
          title: scene.name || scene.title || 'Scene',
          duration: scene.durationInFrames ? scene.durationInFrames / 30 : (scene.duration || 8),
          clips: (scene.elements || scene.clips || []).map(element => ({
            ...element,
            id: element.id,
            type: element.type,
            layer: element.layer || 0,
            startTime: element.startFrame ? element.startFrame / 30 : (element.startTime || 0),
            duration: element.durationInFrames ? element.durationInFrames / 30 : (element.duration || 5),
            position: element.placement ? { x: element.placement.x, y: element.placement.y } : element.position,
            size: element.placement ? { width: element.placement.width, height: element.placement.height } : element.size,
            opacity: element.placement?.opacity !== undefined ? element.placement.opacity : (element.opacity !== undefined ? element.opacity : 1),
            content: element.content?.src ? element.content.src : element.content,
            src: element.content?.src ? element.content.src : (element.src || element.content)
          }))
        }));
      };

      return {
        ...projectTemplate.project,
        title: initialConfig.videoData.name || initialConfig.videoData.title || projectTemplate.project.title,
        resolution: data.videoSettings || projectTemplate.project.resolution,
        scenes: mapBackendToFrontend(data.scenes),
        updatedAt: initialConfig.videoData.updatedAt || new Date().toISOString(),
        id: initialConfig.videoData.id || initialConfig.videoData._id,
        workspaceId: initialConfig.videoData.workspaceId,
        folderId: initialConfig.videoData.folderId
      };
    }

    const pageSizeToResolution = {
      landscape: { width: 1920, height: 1080 },
      portrait: { width: 1080, height: 1920 },
      square: { width: 1080, height: 1080 }
    }

    const resolvedResolution = pageSizeToResolution[initialConfig?.pageSize] || projectTemplate.project.resolution
    const resolvedTitle = initialConfig?.name?.trim() || projectTemplate.project.title

    const initialScenes = initialConfig?.template?.scenes || (initialConfig?.template ? [initialConfig.template] : [])
    
    return {
      ...projectTemplate.project,
      title: resolvedTitle,
      resolution: resolvedResolution,
      scenes: initialScenes.length > 0 ? initialScenes : [],
      updatedAt: new Date().toISOString(),
      id: initialConfig?.videoId,
      workspaceId: initialConfig?.workspaceId,
      folderId: initialConfig?.folderId,
      createConfig: initialConfig
        ? {
            template: initialConfig.template || null,
            pageSize: initialConfig.pageSize || 'landscape',
            workspace: initialConfig.workspace || '',
            workspaceId: initialConfig.workspaceId || '',
            folder: initialConfig.folder || '',
            folderId: initialConfig.folderId || '',
            tags: initialConfig.tags || [],
            name: initialConfig.name || resolvedTitle
          }
        : null
    }
  })
  const [activeSceneId, setActiveSceneId] = useState(null)
  const [selectedTool, setSelectedTool] = useState(null)
  const [timelineScope, setTimelineScope] = useState('all')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)
  const [selectedLayerId, setSelectedLayerId] = useState(null)
  const [musicDuration, setMusicDuration] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [showGeneratedVideoModal, setShowGeneratedVideoModal] = useState(false)
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState(null)
  const [generatingSceneId, setGeneratingSceneId] = useState(null)
  const [showQuickCreateModal, setShowQuickCreateModal] = useState(() => {
    if (!initialConfig?.videoData?.data && !initialConfig?.template) return true;
    if (!project.scenes || project.scenes.length === 0) return true;
    if (!project.scenes[0].clips || project.scenes[0].clips.length === 0) return true;
    return false;
  })

  useEffect(() => {
    const handleOpenGeneratedVideo = (e) => {
      if (e.detail?.url) {
        setGeneratedVideoUrl(e.detail.url)
        setGeneratingSceneId(e.detail.sceneId || null)
        setShowGeneratedVideoModal(true)
      }
    }
    window.addEventListener('open-generated-video', handleOpenGeneratedVideo)
    return () => window.removeEventListener('open-generated-video', handleOpenGeneratedVideo)
  }, [])

  const projectRef = useRef(project)
  const insertAfterIndexRef = useRef(null)
  projectRef.current = project

  const saveProject = useCallback(async (manual = false, projectState = projectRef.current) => {
    try {
      localStorage.setItem('athenavi_project', JSON.stringify(projectState));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }

    if (!projectState.id || !projectState.workspaceId) {
      if (manual) console.warn('Cannot save project to backend: missing ID or workspaceId', projectState);
      return;
    }

    try {
      setIsSaving(true);
      
      // Map project state to backend schema
      const payload = {
        data: {
          videoSettings: {
            width: projectState.resolution?.width || 1920,
            height: projectState.resolution?.height || 1080,
            fps: 30,
            backgroundColor: '#000000'
          },
          scenes: (projectState.scenes || []).map((scene, idx) => ({
            sceneId: scene.sceneId || scene.id || `scene_${idx}`,
            name: scene.title || `Scene ${idx + 1}`,
            durationInFrames: Math.max(1, Math.round((scene.duration || 8) * 30)),
            background: scene.background || { type: 'color', value: '#ffffff' },
            elements: (scene.clips || []).map((clip, cIdx) => {
              const isAvatarClip = clip.type === 'avatar' || clip.role === 'avatar';
              let content;
              if (isAvatarClip && scene.avatarType) {
                content = buildHeygenAvatarContent(
                  { ...scene, sceneId: scene.sceneId || scene.id },
                  clip
                );
              } else if (typeof clip.content === 'object' && clip.content !== null) {
                content = clip.content;
              } else {
                content = { src: clip.src || clip.content };
              }
              return {
              id: String(clip.id || `clip_${cIdx}`),
              type: ['avatar', 'text', 'image', 'video', 'audio', 'shape', 'subtitle'].includes(clip.type) ? clip.type : 'text',
              layer: clip.layer || 0,
              startFrame: Math.max(0, Math.round((clip.startTime || 0) * 30)),
              durationInFrames: Math.max(1, Math.round(((clip.endTime || ((clip.startTime || 0) + (clip.duration || 5))) - (clip.startTime || 0)) * 30)),
              placement: {
                x: Number(clip.position?.x || 0),
                y: Number(clip.position?.y || 0),
                width: Math.max(1, Number(clip.size?.width || 100)),
                height: Math.max(1, Number(clip.size?.height || 100)),
                rotation: 0,
                scale: 1,
                opacity: clip.opacity !== undefined ? Number(clip.opacity) : 1
              },
              content
            };
            })
          }))
        }
      };

      await workspaceService.saveProjectState(projectState.workspaceId, projectState.id, payload);
      
      // Also update name if it changed
      if (manual) {
        await workspaceService.updateProject(projectState.workspaceId, projectState.id, { name: projectState.title });
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save project:', error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const applyGlobalSetting = (type) => {
    const activeScene = project.scenes.find(s => s.id === activeSceneId);
    if (!activeScene) return;

    setProject(prev => {
      const updatedScenes = prev.scenes.map(s => {
        if (s.id === activeSceneId) return s;

        let newClips = s.clips || [];
        
        if (type === 'avatar' && activeScene.avatarType) {
          const avatarIndex = newClips.findIndex(c => c.role === 'avatar' || c.type === 'avatar');
          if (avatarIndex !== -1) {
            newClips = [...newClips];
            newClips[avatarIndex] = { ...newClips[avatarIndex], src: activeScene.avatar };
          }
          return {
            ...s,
            avatar: activeScene.avatar,
            avatarType: activeScene.avatarType,
            avatarName: activeScene.avatarName,
            clips: newClips
          };
        } else if (type === 'voice' && activeScene.voiceId) {
          return {
            ...s,
            voiceId: activeScene.voiceId,
            voiceName: activeScene.voiceName,
            voiceSettings: activeScene.voiceSettings
          };
        }
        return s;
      });

      const newState = { ...prev, scenes: updatedScenes };
      setTimeout(() => saveProject(false, newState), 100);
      return newState;
    });
  };

  const autoSaveReadyRef = useRef(false)

  // Debounced auto-save (3s after edits)
  useEffect(() => {
    if (!autoSaveReadyRef.current) {
      autoSaveReadyRef.current = true
      return undefined
    }

    const timer = setTimeout(() => {
      saveProject(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [project.scenes, project.title, project.resolution, saveProject])

  // Memoized access for convenience
  const scenes = project.scenes || [];
  const bgMusic = scenes.find(s => s.clips?.some(c => c.type === 'audio'))?.clips?.find(c => c.type === 'audio')?.src || null;
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
    const sceneKey = `scene_${Date.now()}`;
    const newScene = {
      id: sceneKey,
      sceneId: sceneKey,
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
      type: type === 'image' ? 'image' : type === 'video' ? 'video' : type === 'avatar' ? 'avatar' : type === 'shape' ? 'shape' : 'text',
      src: (type === 'image' || type === 'video' || type === 'avatar') ? content : null,
      content: type === 'text' ? content : null,
      layer: targetScene.clips.length,
      startTime: 0.0,
      endTime: targetScene.duration || 8.0,
      position: { x: 50, y: 50 },
      size: type === 'avatar' ? { width: 250, height: 330 } : type === 'shape' ? { width: parseInt(content?.style?.width) || 200, height: parseInt(content?.style?.height) || 200 } : { width: 400, height: 400 },
      opacity: 1.0,
      style: type === 'shape' ? content?.style : undefined,
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

  // Update a specific layer's size within the active scene
  const updateLayerSize = (layerId, width, height) => {
    if (!activeSceneId) return
    setProject(prev => ({
      ...prev,
      scenes: prev.scenes.map(s => {
        if (s.id !== activeSceneId) return s
        return {
          ...s,
          clips: s.clips.map(c => c.id === layerId ? { ...c, size: { width, height } } : c)
        }
      })
    }))
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

  // Update clip text content (from inline editing via LiveCanvasRenderer)
  const updateClipContent = (sceneId, clipId, newText) => {
    setProject(prev => ({
      ...prev,
      scenes: prev.scenes.map(s =>
        s.id === sceneId
          ? { ...s, clips: s.clips.map(c => c.id === clipId ? { ...c, content: newText } : c) }
          : s
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
  // We use playerRef.current now

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
        if (playerRef.current) {
          if (isPlaying) {
            playerRef.current.pause()
          } else {
            playerRef.current.play()
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
            saveProject(true)
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
  }, [isPlaying, activeSceneId, scenes.length, currentTime, totalDurationInFrames, saveProject])

  const addScene = () => {
    insertAfterIndexRef.current = null
    setShowTemplateModal(true)
  }

  const addSceneAfter = (afterIndex) => {
    insertAfterIndexRef.current = afterIndex
    setShowTemplateModal(true)
  }

  const handleAddTemplateScene = (template) => {
    // Deep copy the scene template to avoid shared references
    const newScene = JSON.parse(JSON.stringify(template));
    // Check if we should replace the single default scene
    // A scene is considered default if it's the only scene and its title is "Intro" or "Hero Scene"
    const isDefaultSingleScene = project.scenes.length === 1 && (project.scenes[0].title === 'Intro' || project.scenes[0].title === 'Hero Scene' || project.scenes[0].id === 'lt_001');

    newScene.id = isDefaultSingleScene ? project.scenes[0].id : `scene_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    newScene.order = isDefaultSingleScene ? 0 : project.scenes.length;
    
    if (newScene.clips) {
        newScene.clips = newScene.clips.map(clip => ({
            ...clip,
            id: `clip_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
        }));
    }

    const insertAfter = insertAfterIndexRef.current
    insertAfterIndexRef.current = null

    setProject(prev => {
      let newScenes;
      if (isDefaultSingleScene) {
        newScenes = [newScene];
      } else if (insertAfter != null && insertAfter >= 0 && insertAfter < prev.scenes.length) {
        newScenes = [
          ...prev.scenes.slice(0, insertAfter + 1),
          newScene,
          ...prev.scenes.slice(insertAfter + 1),
        ];
      } else {
        newScenes = [...prev.scenes, newScene];
      }
      return {
        ...prev,
        updatedAt: new Date().toISOString(),
        scenes: newScenes,
      };
    });

    setActiveSceneId(newScene.id)
  }

  const handleGenerateStoryboard = (storyboardScenes, mode = 'replace') => {
    setProject(prev => {
      let finalScenes;
      if (mode === 'replace') {
        finalScenes = storyboardScenes.map((s, idx) => ({
          ...s,
          order: idx
        }));
      } else {
        const baseOrder = prev.scenes.length;
        const orderedNewScenes = storyboardScenes.map((s, idx) => ({
          ...s,
          order: baseOrder + idx
        }));
        finalScenes = [...prev.scenes, ...orderedNewScenes];
      }
      
      return {
        ...prev,
        updatedAt: new Date().toISOString(),
        scenes: finalScenes
      };
    });

    if (storyboardScenes.length > 0) {
      setActiveSceneId(storyboardScenes[0].id);
    }
  };

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

  const generateSceneVideo = async (sceneId, overrides = null) => {
    const scene = project.scenes.find(s => s.id === sceneId);
    if (!scene && !overrides) return;

    const avatarType = overrides?.avatarType || scene?.avatarType;
    const voiceId = overrides?.voiceId || scene?.voiceId;
    const script = overrides?.script || scene?.script;
    const stableSceneId = scene?.sceneId || sceneId;
    const workspaceId = project.workspaceId || project.createConfig?.workspaceId;
    const projectId = project.id || project.createConfig?.videoId;

    console.log('[HeyGen] Generating video for scene:', {
      sceneId: stableSceneId,
      avatarType,
      voiceId,
      scriptLength: script?.length,
      workspaceId,
      projectId
    });

    if (!avatarType || !voiceId || !script) {
      alert('Please select an avatar look, a voice, and enter a script first.');
      return;
    }

    if (String(avatarType).startsWith('ag_')) {
      alert('Please pick a look (not a character group) before generating video.');
      return;
    }

    if (!workspaceId || !projectId) {
      console.error('[HeyGen] Missing identifiers:', { workspaceId, projectId, project });
      alert('Missing workspace or project ID. Please ensure this project is saved in a folder.');
      return;
    }

    try {
      // Mark scene as processing
      updateScene(sceneId, { heygenStatus: 'processing' });

      const aspectRatioStr = project.resolution?.width > project.resolution?.height ? '16:9' : '9:16';
      
      const payload = {
        sceneId: stableSceneId,
        avatarId: avatarType,
        title: `${project.title} - ${scene?.title || 'Scene'}`,
        resolution: project.resolution?.height >= 1080 ? '1080p' : '720p',
        aspectRatio: overrides?.aspectRatio || aspectRatioStr,
        backgroundColor: overrides?.backgroundColor || scene?.background?.value || scene?.backgroundColor || '#008000',
        voiceId: voiceId,
        script: script,
        expressiveness: overrides?.expressiveness || scene?.expressiveness || 'medium',
        voiceSettings: scene?.voiceSettings || {
          speed: 1,
          pitch: 0,
          locale: 'en-US'
        },
        removeBackground: overrides?.removeBackground ?? (scene?.removeBackground || false),
        outputFormat: scene?.outputFormat || 'mp4'
      };

      const result = await heygenService.generateVideo(workspaceId, projectId, payload);
      const heygenVideoId = result.id || result.heygenVideoId || result.video_id;

      const sceneForContent = {
        ...(scene || {}),
        sceneId: stableSceneId,
        avatarType,
        voiceId,
        script,
        heygenVideoId,
      };
      const currentClips = scene?.clips || [];
      const avatarIdx = currentClips.findIndex((c) => c.role === 'avatar' || c.type === 'avatar');
      let clipsWithHeygen = currentClips;
      if (avatarIdx !== -1) {
        clipsWithHeygen = [...currentClips];
        clipsWithHeygen[avatarIdx] = {
          ...clipsWithHeygen[avatarIdx],
          content: buildHeygenAvatarContent(sceneForContent, clipsWithHeygen[avatarIdx]),
        };
      }

      updateScene(sceneId, {
        sceneId: stableSceneId,
        heygenVideoId,
        heygenStatus: 'processing',
        ...(clipsWithHeygen !== currentClips ? { clips: clipsWithHeygen } : {}),
      });

      setTimeout(() => saveProject(false), 200);

      let pollAttempts = 0;
      const maxPollAttempts = 24;

      const pollStatus = async () => {
        try {
          pollAttempts += 1;
          const videoData = await heygenService.getVideo(workspaceId, projectId, heygenVideoId);
          const s3Ready = !!(videoData.s3Key || videoData.s3_key);
          const isDone =
            (videoData.status === 'completed' || videoData.status === 'success') && s3Ready;

          if (isDone) {
            const videoUrl = await heygenService.getVideoBlobUrl(
              workspaceId,
              projectId,
              heygenVideoId
            );

            updateScene(sceneId, {
              heygenStatus: 'completed',
              heygenVideoId,
              avatar: videoData.thumbnail_url || scene?.avatar,
              generatedVideoUrl: videoUrl,
            });

            window.dispatchEvent(
              new CustomEvent('open-generated-video', { detail: { url: videoUrl, sceneId } })
            );
          } else if (videoData.status === 'failed' || videoData.status === 'error') {
            updateScene(sceneId, { heygenStatus: 'failed' });
            window.dispatchEvent(new CustomEvent('generation-failed'));
          } else if (pollAttempts < maxPollAttempts) {
            setTimeout(pollStatus, 5000);
          } else {
            updateScene(sceneId, { heygenStatus: 'failed' });
            window.dispatchEvent(new CustomEvent('generation-failed'));
          }
        } catch (err) {
          console.error('Polling failed:', err);
          if (pollAttempts < maxPollAttempts) {
            setTimeout(pollStatus, 5000);
          } else {
            updateScene(sceneId, { heygenStatus: 'failed' });
            window.dispatchEvent(new CustomEvent('generation-failed'));
          }
        }
      };

      pollStatus();

    } catch (error) {
      console.error('Failed to start video generation:', error);
      updateScene(sceneId, { heygenStatus: 'failed' });
      alert('Failed to start video generation: ' + error.message);
      window.dispatchEvent(new CustomEvent('generation-failed'));
    }
  }

  const handleSeek = (time) => {
    setCurrentTime(time)
    // Use player methods if available
    if (playerRef.current && playerRef.current.seekTo) {
      playerRef.current.seekTo(time)
    }
  }

  const handleQuickCreateGenerate = (payload) => {
    if (payload.isStoryboard) {
      // Split script into paragraphs by double newlines or single newlines with spacing
      const paragraphs = (payload.script || '')
        .split(/\n\s*\n+/)
        .map(p => p.trim())
        .filter(p => p.length > 0);

      if (paragraphs.length === 0) return;

      const storyboardScenes = paragraphs.map((paraText, pIdx) => {
        // Calculate scene duration (approx 2.3 words/sec, min 6s)
        const words = paraText.split(/\s+/).filter(w => w.length > 0);
        const duration = Math.max(6.0, Math.ceil((words.length / 2.3) * 10) / 10);

        // Extract a concise highlight phrase or first sentence
        const sentences = paraText.split(/[.!?]\s+/);
        let headline = sentences[0]?.trim() || '';
        if (headline) {
          const punctuationChar = paraText.charAt(headline.length);
          if (['.', '!', '?'].includes(punctuationChar)) {
            headline += punctuationChar;
          }
        }
        
        if (headline.length > 85) {
          headline = headline.substring(0, 82) + '...';
        }

        // Layout cycles alternating left/right
        const isLeft = pIdx % 2 === 0;
        const isLightTheme = payload.backgroundColor === '#ffffff' || payload.backgroundColor === '#e2e8f0' || payload.backgroundColor === '#f8fafc';
        const textColor = isLightTheme ? '#0f172a' : '#ffffff';
        const clips = [];

        if (isLeft) {
          // Layout: Image Left, Text Right
          clips.push({
            id: `clip_image_${Date.now()}_${pIdx}_1`, type: 'image', role: 'background-image', src: '',
            startTime: 0, endTime: duration, position: { x: 120, y: 200 }, size: { width: 600, height: 600 },
            style: { backgroundColor: '#f0fdf4', borderRadius: '32px', border: '4px solid #ffffff', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }, layer: 1
          });
          clips.push({
            id: `clip_avatar_${Date.now()}_${pIdx}_2`, type: 'avatar', role: 'avatar', src: payload.avatarImage,
            startTime: 0, endTime: duration, position: { x: 570, y: 650 }, size: { width: 200, height: 200 },
            style: { borderRadius: '50%', border: '8px solid #ffffff', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }, layer: 2
          });
          clips.push({
            id: `clip_title_${Date.now()}_${pIdx}_3`, type: 'text', role: 'main-text', content: headline || 'SCALE YOUR BRAND WITH AI VIDEO',
            startTime: 0, endTime: duration, position: { x: 950, y: 250 }, size: { width: 700, height: 200 },
            style: { fontSize: 72, fontWeight: '900', color: textColor, textAlign: 'left', lineHeight: 1.1, textTransform: 'uppercase' }, layer: 3
          });
          clips.push({
            id: `clip_subtitle_${Date.now()}_${pIdx}_4`, type: 'text', role: 'subtitle-text', content: paraText || 'Generate professional marketing content in seconds.',
            startTime: 0.5, endTime: duration, position: { x: 950, y: 460 }, size: { width: 700, height: 100 },
            style: { fontSize: 32, fontWeight: '500', color: '#64748b', textAlign: 'left', lineHeight: 1.4 }, layer: 4
          });
          clips.push({
            id: `clip_btn_bg_${Date.now()}_${pIdx}_5`, type: 'shape', role: 'decoration',
            startTime: 0, endTime: duration, position: { x: 950, y: 580 }, size: { width: 280, height: 80 },
            style: { backgroundColor: '#10b981', borderRadius: '40px' }, layer: 5
          });
          clips.push({
            id: `clip_btn_line_${Date.now()}_${pIdx}_6`, type: 'shape', role: 'decoration',
            startTime: 0, endTime: duration, position: { x: 1025, y: 615 }, size: { width: 130, height: 10 },
            style: { backgroundColor: '#ffffff', borderRadius: '5px' }, layer: 6
          });
        } else {
          // Layout: Text Left, Image Right
          clips.push({
            id: `clip_title_${Date.now()}_${pIdx}_1`, type: 'text', role: 'main-text', content: headline || 'YOUR NEXT BIG IDEA STARTS HERE',
            startTime: 0, endTime: duration, position: { x: 120, y: 250 }, size: { width: 700, height: 200 },
            style: { fontSize: 72, fontWeight: '900', color: textColor, textAlign: 'left', lineHeight: 1.1, textTransform: 'uppercase' }, layer: 1
          });
          clips.push({
            id: `clip_subtitle_${Date.now()}_${pIdx}_2`, type: 'text', role: 'subtitle-text', content: paraText || 'The ultimate platform for AI video generation and professional layouts.',
            startTime: 0.5, endTime: duration, position: { x: 120, y: 460 }, size: { width: 700, height: 100 },
            style: { fontSize: 32, fontWeight: '500', color: '#64748b', textAlign: 'left', lineHeight: 1.4 }, layer: 2
          });
          clips.push({
            id: `clip_btn_bg_${Date.now()}_${pIdx}_3`, type: 'shape', role: 'decoration',
            startTime: 0, endTime: duration, position: { x: 120, y: 580 }, size: { width: 280, height: 80 },
            style: { backgroundColor: '#3b82f6', borderRadius: '40px' }, layer: 3
          });
          clips.push({
            id: `clip_btn_line_${Date.now()}_${pIdx}_4`, type: 'shape', role: 'decoration',
            startTime: 0, endTime: duration, position: { x: 195, y: 615 }, size: { width: 130, height: 10 },
            style: { backgroundColor: '#ffffff', borderRadius: '5px' }, layer: 4
          });
          clips.push({
            id: `clip_image_${Date.now()}_${pIdx}_5`, type: 'image', role: 'background-image', src: '',
            startTime: 0, endTime: duration, position: { x: 950, y: 200 }, size: { width: 600, height: 600 },
            style: { backgroundColor: '#eef2ff', borderRadius: '32px', border: '4px solid #ffffff', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }, layer: 5
          });
          clips.push({
            id: `clip_avatar_${Date.now()}_${pIdx}_6`, type: 'avatar', role: 'avatar', src: payload.avatarImage,
            startTime: 0, endTime: duration, position: { x: 1400, y: 650 }, size: { width: 200, height: 200 },
            style: { borderRadius: '50%', border: '8px solid #ffffff', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }, layer: 6
          });
        }

        return {
          id: `scene_${Date.now()}_${pIdx}`,
          sceneId: `scene_${Date.now()}_${pIdx}`,
          name: `Scene ${pIdx + 1}`,
          title: `Scene ${pIdx + 1}`,
          duration: duration,
          background: { type: 'color', value: payload.backgroundColor || '#101828' },
          avatar: payload.avatarImage,
          avatarType: payload.avatarType,
          avatarName: payload.avatarName || 'AI Presenter',
          voiceId: payload.voiceId,
          voiceName: payload.voiceName,
          script: paraText,
          clips: clips
        };
      });

      setProject(prev => {
        const updated = {
          ...prev,
          scenes: storyboardScenes
        };
        setTimeout(() => {
          saveProject(false, newProj);
        }, 100);
        return updated;
      });

      if (storyboardScenes.length > 0) {
        setActiveSceneId(storyboardScenes[0].id);
      }

      setShowQuickCreateModal(false);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('open-generated-video'));
      }, 300);
      return;
    }

    let targetSceneId = activeSceneId;
    let currentScenes = project.scenes;

    if (!targetSceneId && currentScenes.length > 0) {
      targetSceneId = currentScenes[0].id;
      setActiveSceneId(targetSceneId);
    } else if (!targetSceneId || currentScenes.length === 0) {
      const { newScene, updatedScenes } = autoCreateScene();
      targetSceneId = newScene.id;
      currentScenes = updatedScenes;
    }

    const activeClips = currentScenes.find(s => s.id === targetSceneId)?.clips || [];
    const avatarClipIndex = activeClips.findIndex(c => c.role === 'avatar' || c.type === 'avatar');
    
    const targetScene = currentScenes.find((s) => s.id === targetSceneId);
    const stableSceneId = targetScene?.sceneId || targetSceneId;

    let updatedClips = [...activeClips];
    const sceneDraft = {
      ...(targetScene || {}),
      sceneId: stableSceneId,
      avatarType: payload.avatarType,
      voiceId: payload.voiceId,
      script: payload.script,
    };

    if (avatarClipIndex !== -1) {
      updatedClips[avatarClipIndex] = {
        ...updatedClips[avatarClipIndex],
        role: 'avatar',
        type: 'avatar',
        src: payload.avatarImage,
        content: buildHeygenAvatarContent(sceneDraft, {
          ...updatedClips[avatarClipIndex],
          src: payload.avatarImage,
        }),
      };
    } else {
      const newClip = {
        id: `clip_${Date.now()}`,
        type: 'avatar',
        role: 'avatar',
        src: payload.avatarImage,
        layer: updatedClips.length,
        startTime: 0.0,
        endTime: 8.0,
        position: { x: 50, y: 50 },
        size: { width: 250, height: 330 },
        opacity: 1.0,
        effects: {
          brightness: 1,
          contrast: 1,
          saturation: 1,
          blur: 0,
        },
      };
      newClip.content = buildHeygenAvatarContent(sceneDraft, newClip);
      updatedClips.push(newClip);
    }

    setProject(prev => {
      const newProject = {
        ...prev,
        scenes: prev.scenes.map(s => s.id === targetSceneId ? {
          ...s,
          sceneId: stableSceneId,
          avatar: payload.avatarImage,
          avatarType: payload.avatarType,
          avatarName: payload.avatarName,
          avatarGroupId: payload.avatarGroupId,
          voiceId: payload.voiceId,
          voiceName: payload.voiceName,
          script: payload.script,
          expressiveness: payload.expressiveness,
          backgroundColor: payload.backgroundColor,
          removeBackground: payload.removeBackground,
          clips: updatedClips
        } : s)
      };

      // We call generateSceneVideo after state settles
      setTimeout(() => {
        // We need to bypass the state closure issue by either passing the scene data directly or waiting
        // We will just let the component re-render, then the user can click generate or we trigger it
        // Wait, if we trigger it here, it might use stale state. We will trigger it in a way that fetches the latest.
        // For now, we update state, then call generateSceneVideo.
      }, 0);
      return newProject;
    });

    // To ensure generation uses latest data, we should modify generateSceneVideo or pass overrides,
    // but the simplest is just let it update the scene and tell user to click generate, OR
    // we can use a ref. But let's just trigger it with a small delay.
    setTimeout(() => {
      generateSceneVideo(targetSceneId, payload);
    }, 500);
  };

  const handleUseGeneratedVideo = () => {
    if (!generatingSceneId || !generatedVideoUrl) return;

    // Find the scene
    const scene = project.scenes.find(s => s.id === generatingSceneId);
    if (!scene) return;

    // Update the avatar clip with the generated video URL and type 'video'
    const updatedClips = (scene.clips || []).map(clip => 
      (clip.role === 'avatar' || clip.type === 'avatar') 
        ? { ...clip, src: generatedVideoUrl, type: 'video' } 
        : clip
    );

    setProject(prev => {
      const newProj = {
        ...prev,
        scenes: prev.scenes.map(s => s.id === generatingSceneId ? {
          ...s,
          clips: updatedClips,
          generatedVideoUrl: generatedVideoUrl
        } : s)
      };
      
      // Auto-save the project
      setTimeout(() => {
        saveProject(false, newProj);
      }, 100);
      
      return newProj;
    });

    setShowGeneratedVideoModal(false);
  };

  const handleSelectLayout = (layoutId) => {
    if (!generatingSceneId || !generatedVideoUrl) return;

    setProject(prev => {
      const newProj = {
        ...prev,
        scenes: prev.scenes.map(s => {
          if (s.id !== generatingSceneId) return s;

          const template = projectTemplate.project.scenes.find(t => t.id === layoutId);

          if (template) {
            let templateClips = JSON.parse(JSON.stringify(template.clips));
            
            // Find avatar placeholder (either labelled or first large image)
            let avatarIndex = templateClips.findIndex(c => 
              c.label?.toLowerCase().includes('avatar') || 
              c.label?.toLowerCase().includes('media') || 
              c.label?.toLowerCase().includes('center image') ||
              (c.type === 'image' && !c.label?.toLowerCase().includes('logo'))
            );

            if (avatarIndex === -1) {
              templateClips.push({
                id: `clip_video_${Date.now()}`,
                type: 'video',
                role: 'avatar',
                src: generatedVideoUrl,
                layer: templateClips.length,
                startTime: 0,
                endTime: s.duration || 8,
                opacity: 1,
                position: { x: 100, y: 100 },
                size: { width: 350, height: 500 }
              });
            } else {
              templateClips[avatarIndex] = {
                ...templateClips[avatarIndex],
                src: generatedVideoUrl,
                type: 'video',
                role: 'avatar'
              };
            }

            // Retain user's existing text content if possible
            const oldTextClip = s.clips?.find(c => c.type === 'text' || c.role === 'main-text');
            const newTextIndex = templateClips.findIndex(c => c.type === 'text');
            
            if (oldTextClip && newTextIndex !== -1) {
              templateClips[newTextIndex].content = oldTextClip.content;
            }

            return { ...s, clips: templateClips, layout: layoutId, generatedVideoUrl, title: template.title };
          }

          let updatedClips = [...(s.clips || [])];

          // Ensure the avatar is updated to the video
          let avatarClipIndex = updatedClips.findIndex(c => c.role === 'avatar' || c.type === 'avatar' || c.type === 'video');
          if (avatarClipIndex === -1) {
            updatedClips.push({
              id: `clip_video_${Date.now()}`,
              type: 'video',
              role: 'avatar',
              src: generatedVideoUrl,
              layer: 1,
              startTime: 0,
              endTime: s.duration || 8,
              opacity: 1
            });
            avatarClipIndex = updatedClips.length - 1;
          } else {
            updatedClips[avatarClipIndex] = { ...updatedClips[avatarClipIndex], src: generatedVideoUrl, type: 'video' };
          }

          let textClipIndex = updatedClips.findIndex(c => c.role === 'main-text' || c.type === 'text');

          const applyLayout = (avatarPos, avatarSize, textPos, textSize, textAlignment) => {
            updatedClips[avatarClipIndex] = {
              ...updatedClips[avatarClipIndex],
              position: avatarPos,
              size: avatarSize
            };
            if (textClipIndex !== -1) {
              updatedClips[textClipIndex] = {
                ...updatedClips[textClipIndex],
                position: textPos,
                size: textSize,
                style: { 
                  ...updatedClips[textClipIndex].style, 
                  width: textSize.width + 'px',
                  textAlign: textAlignment 
                }
              };
            }
          };

          // Default canvas dimensions
          const canvasWidth = prev.resolution?.width || 1920;
          const canvasHeight = prev.resolution?.height || 1080;

          if (layoutId === 'split-left') {
             applyLayout(
               { x: canvasWidth * 0.1, y: canvasHeight * 0.1 }, 
               { width: canvasWidth * 0.35, height: canvasHeight * 0.8 },
               { x: canvasWidth * 0.5, y: canvasHeight * 0.2 }, 
               { width: canvasWidth * 0.4, height: canvasHeight * 0.6 },
               'left'
             );
          } else if (layoutId === 'split-right') {
             applyLayout(
               { x: canvasWidth * 0.55, y: canvasHeight * 0.1 }, 
               { width: canvasWidth * 0.35, height: canvasHeight * 0.8 },
               { x: canvasWidth * 0.05, y: canvasHeight * 0.2 }, 
               { width: canvasWidth * 0.4, height: canvasHeight * 0.6 },
               'left'
             );
          } else if (layoutId === 'centered') {
             applyLayout(
               { x: canvasWidth * 0.3, y: canvasHeight * 0.1 }, 
               { width: canvasWidth * 0.4, height: canvasHeight * 0.8 },
               { x: canvasWidth * 0.1, y: canvasHeight * 0.85 }, 
               { width: canvasWidth * 0.8, height: canvasHeight * 0.1 },
               'center'
             );
          } else if (layoutId === 'full-avatar' || layoutId === 'pip') {
             applyLayout(
               { x: canvasWidth * 0.7, y: canvasHeight * 0.6 }, 
               { width: canvasWidth * 0.25, height: canvasHeight * 0.35 },
               { x: canvasWidth * 0.1, y: canvasHeight * 0.1 }, 
               { width: canvasWidth * 0.8, height: canvasHeight * 0.8 },
               'left'
             );
          }

          return { ...s, clips: updatedClips, generatedVideoUrl, layout: layoutId };
        })
      };
      
      // Auto-save the project
      setTimeout(() => {
        saveProject(false, newProj);
      }, 100);

      return newProj;
    });
  };
  const handleRemakeVideo = () => {
    if (!generatingSceneId) return;
    
    // Close the modal
    setShowGeneratedVideoModal(false);
    
    // Trigger generation again
    generateSceneVideo(generatingSceneId);
  };

  return (
    <div className="video-editor-shell">
      <QuickCreateModal
        isOpen={showQuickCreateModal}
        onClose={() => setShowQuickCreateModal(false)}
        onGenerate={handleQuickCreateGenerate}
      />
      <GeneratedVideoModal 
        isOpen={showGeneratedVideoModal} 
        onClose={() => setShowGeneratedVideoModal(false)} 
        videoUrl={generatedVideoUrl} 
        onUseInEditor={handleUseGeneratedVideo}
        onRemake={handleRemakeVideo}
        onSelectLayout={handleSelectLayout}
      />
      <EditorTopbar
        onBack={onBack}
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        handlePreview={handlePreview}
        exportVideo={exportVideo}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        projectTitle={project.title}
        onProjectTitleChange={(newTitle) => setProject(prev => ({ ...prev, title: newTitle }))}
        onSave={() => saveProject(true)}
        isSaving={isSaving}
        lastSaved={lastSaved}
        activeSceneId={activeSceneId}
        addLayer={addLayer}
        updateScene={updateScene}
        activeScene={activeScene}
        handleAddTemplateScene={handleAddTemplateScene}
        setShowTemplateModal={setShowTemplateModal}
        scenes={scenes}
        autoCreateScene={autoCreateScene}
        onGenerateStoryboard={handleGenerateStoryboard}
      />

      <div className="editor-container">
        {/* Left Sidebar + Tool Panel Container */}
        <div className="left-section">
          {/* Sidebar Section handles both Nav and Panel internally */}
          <EditorSidebar
            activeSceneId={activeSceneId}
            setShowTemplateModal={setShowTemplateModal}
            scenes={scenes}
            timelineScope={timelineScope}
            setTimelineScope={setTimelineScope}
            onSelectScene={(sceneId) => {
              setActiveSceneId(sceneId);
              setSelectedLayerId(null);
            }}
            onDeleteScene={deleteScene}
            onAddSceneAfter={addSceneAfter}
            updateScene={updateScene}
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
                selectedLayerId={selectedLayerId}
                setSelectedLayerId={setSelectedLayerId}
                onUpdateLayerPosition={updateLayerPosition}
                onUpdateLayerSize={updateLayerSize}
                updateClipContent={updateClipContent}
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
                if (playerRef.current) {
                  if (isPlaying) {
                    playerRef.current.pause()
                  } else {
                    playerRef.current.play()
                  }
                }
              }}
              onStop={() => {
                if (playerRef.current) {
                  playerRef.current.pause()
                  playerRef.current.seekTo(0)
                }
                setIsPlaying(false)
                setCurrentTime(0)
                window.speechSynthesis.cancel()
              }}
              totalDuration={(totalDurationInFrames || 0) / 30}
              timelineScope={timelineScope}
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
            <div className="scene-config-panel-scroll premium-scrollbar" style={{ width: '320px', height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
              <SceneConfigurationPanel
                activeScene={activeScene}
                activeSceneId={activeSceneId}
                updateScene={updateScene}
                selectedLayerId={selectedLayerId}
                generateSceneVideo={generateSceneVideo}
                setActiveTab={setSelectedTool}
                applyGlobalSetting={applyGlobalSetting}
                onOpenQuickCreate={() => setShowQuickCreateModal(true)}
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
