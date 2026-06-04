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
import TemplateModal from '../../components/features/editor/editor/TemplateModal'
import PreviewModal from '../../components/features/editor/editor/PreviewModal'
import ExportModal from '../../components/features/editor/editor/ExportModal'
import GeneratedVideoModal from '../../components/features/editor/editor/GeneratedVideoModal'
import QuickCreateModal from '../../components/features/editor/editor/QuickCreateModal'
import RenderDownloadModal from '../../components/features/editor/editor/RenderDownloadModal'
import heygenService from '../../services/heygenService'
import avatar1 from '../../assets/Avatarr1.png'
import projectTemplate from '../../constants/projectTemplate.json'
import workspaceService from '../../services/workspaceService'
import { buildHeygenAvatarContent, getSceneAvatarKind, getSceneAvatarLookId } from '../../utils/heygenAvatars'
import { buildClipTextContent } from '../../utils/textClip'
import {
  fromBackendProjectData,
  rehydrateSceneVideos,
  toBackendProjectData,
} from '../../utils/projectDataMapper'
import {
  applyGeneratedHeygenToClips,
  ensureSceneIdentity,
  getCenteredAvatarPlacement,
  nextHeygenSceneId,
} from '../../utils/heygenVideo'
import { exportFullProjectVideo } from '../../utils/projectRender'
import {
  applyDurationToSceneClips,
  buildSceneDurationPatch,
  durationFromVideoMetadata,
  estimateHeygenSceneDuration,
  probeVideoDuration,
  roundSceneDuration,
} from '../../utils/sceneDuration'
import { useEditorHistory } from '../../hooks/useEditorHistory'
import { useEditorUx } from '../../hooks/useEditorUx'
import { normalizeClipStack, normalizeClipsToScene } from '../../utils/editorLayerUtils'
import { saveVersionSnapshot, loadVersionSnapshot, listVersionSnapshots } from '../../utils/editorVersionHistory'
import EditorToast from '../../components/features/editor/editor/EditorToast'
import EditorViewControls from '../../components/features/editor/editor/EditorViewControls'
import PanelResizeHandle from '../../components/features/editor/editor/PanelResizeHandle'
import {
  readStoredPanelSize,
  writeStoredPanelSize,
} from '../../hooks/useDragResize'

function projectHasPreExistingScenes(scenes) {
  return Array.isArray(scenes) && scenes.length > 0
}

const TIMELINE_HEIGHT_STORAGE = 'athena-editor-timeline-height'
const PROPERTIES_WIDTH_STORAGE = 'athena-editor-properties-width'
const TIMELINE_HEIGHT_DEFAULT = 220
const TIMELINE_HEIGHT_MIN = 120
const TIMELINE_HEIGHT_MAX = 520
const PROPERTIES_WIDTH_DEFAULT = 320
const PROPERTIES_WIDTH_MIN = 240
const PROPERTIES_WIDTH_MAX = 640

function clampPanelSize(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function buildInitialProject(initialConfig) {
  if (initialConfig?.videoData?.data) {
    const data = initialConfig.videoData.data;
    const mapped = fromBackendProjectData(data, {
      title: initialConfig.videoData.name || initialConfig.videoData.title || projectTemplate.project.title,
      updatedAt: initialConfig.videoData.updatedAt || new Date().toISOString(),
      id: initialConfig.videoData.id || initialConfig.videoData._id,
      workspaceId: initialConfig.videoData.workspaceId,
      folderId: initialConfig.videoData.folderId,
    });
    return {
      ...projectTemplate.project,
      ...mapped,
      scenes: (mapped.scenes || []).map((scene) => ({
        ...scene,
        clips: normalizeClipsToScene(normalizeClipStack(scene.clips || []), scene.duration || 8),
      })),
    };
  }

  const pageSizeToResolution = {
    landscape: { width: 1920, height: 1080 },
    portrait: { width: 1080, height: 1920 },
    square: { width: 1080, height: 1080 },
  };

  const resolvedResolution = pageSizeToResolution[initialConfig?.pageSize] || projectTemplate.project.resolution;
  const resolvedTitle = initialConfig?.name?.trim() || projectTemplate.project.title;
  const initialScenes = initialConfig?.template?.scenes || (initialConfig?.template ? [initialConfig.template] : []);

  return {
    ...projectTemplate.project,
    title: resolvedTitle,
    resolution: resolvedResolution,
    scenes: initialScenes.length > 0
      ? initialScenes.map((scene, idx) => ({
          ...ensureSceneIdentity(scene, idx),
          clips: normalizeClipsToScene(normalizeClipStack(scene.clips || []), scene.duration || 8),
        }))
      : [],
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
          name: initialConfig.name || resolvedTitle,
        }
      : null,
  };
}

function Create({ onBack, initialConfig = null }) {
  useEffect(() => {
    console.log('Create component mounted')
  }, [])

  const [bootProject] = useState(() => buildInitialProject(initialConfig))
  const { project, setProject, undo, redo, canUndo, canRedo } = useEditorHistory(bootProject)

  const [isProjectLoading, setIsProjectLoading] = useState(() => {
    const workspaceId = initialConfig?.workspaceId || initialConfig?.videoData?.workspaceId
    const projectId = initialConfig?.videoId || initialConfig?.videoData?.id || initialConfig?.videoData?._id
    return !!(workspaceId && projectId)
  })

  const [activeSceneId, setActiveSceneId] = useState(null)
  const [selectedTool, setSelectedTool] = useState(null)
  const [timelineScope, setTimelineScope] = useState('all')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(1)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportPhase, setExportPhase] = useState('configure')
  const [exportStatus, setExportStatus] = useState('')
  const [exportError, setExportError] = useState('')
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)
  const [timelineHeight, setTimelineHeight] = useState(() =>
    clampPanelSize(
      readStoredPanelSize(TIMELINE_HEIGHT_STORAGE, TIMELINE_HEIGHT_DEFAULT),
      TIMELINE_HEIGHT_MIN,
      TIMELINE_HEIGHT_MAX
    )
  )
  const [propertiesPanelWidth, setPropertiesPanelWidth] = useState(() =>
    clampPanelSize(
      readStoredPanelSize(PROPERTIES_WIDTH_STORAGE, PROPERTIES_WIDTH_DEFAULT),
      PROPERTIES_WIDTH_MIN,
      PROPERTIES_WIDTH_MAX
    )
  )
  const [isResizingLayout, setIsResizingLayout] = useState(false)
  const [selectedLayerId, setSelectedLayerId] = useState(null)
  const [musicDuration, setMusicDuration] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showRenderDownload, setShowRenderDownload] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [showGeneratedVideoModal, setShowGeneratedVideoModal] = useState(false)
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState(null)
  const [generatingSceneId, setGeneratingSceneId] = useState(null)
  const [showQuickCreateModal, setShowQuickCreateModal] = useState(() => {
    const initial = buildInitialProject(initialConfig)
    if (!initialConfig?.videoData?.data && !initialConfig?.template) return true
    if (!initial.scenes || initial.scenes.length === 0) return true
    if (!initial.scenes[0].clips || initial.scenes[0].clips.length === 0) return true
    return false
  })

  const [selectedLayerIds, setSelectedLayerIds] = useState([])
  const [editorView, setEditorView] = useState({
    snapToGrid: true,
    showGuides: false,
    showSafeZone: true,
    gridSize: 20,
  })
  const [toast, setToast] = useState(null)
  const clipboardRef = useRef([])
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const toastTimerRef = useRef(null)

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type })
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(null), 4000)
  }, [])

  useEffect(() => {
    const onOnline = () => {
      setIsOnline(true)
      showToast('Back online — saving will resume', 'success')
    }
    const onOffline = () => {
      setIsOnline(false)
      showToast('You are offline — changes saved locally only', 'warning')
    }
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [showToast])

  const ux = useEditorUx({
    project,
    setProject,
    activeSceneId,
    selectedLayerIds,
    setSelectedLayerIds,
    setSelectedLayerId,
    editorView,
    clipboardRef,
    showToast,
  })

  const {
    updateScene: uxUpdateScene,
    moveLayerOrder,
    toggleLayerLock,
    duplicateSceneById,
    duplicateSelectedLayers,
    copySelectedLayers,
    pasteLayers,
    deleteSelectedLayers,
    selectLayer,
    updateLayerPosition: uxUpdateLayerPosition,
    commitLayerPositionHistory,
    addAudioClip,
  } = ux

  const versionSnapshots = useMemo(
    () => (project.id ? listVersionSnapshots(project.id) : []),
    [project.id, project.updatedAt]
  )

  const handleRestoreVersion = useCallback(() => {
    if (!project.id || !versionSnapshots.length) return
    const data = loadVersionSnapshot(project.id, 0)
    if (!data) return
    if (!window.confirm('Restore the most recent local version? Unsaved changes will be lost.')) return
    setProject(
      (prev) => ({
        ...prev,
        ...data,
        updatedAt: new Date().toISOString(),
      }),
      { history: true }
    )
    showToast('Version restored', 'success')
  }, [project.id, versionSnapshots.length, setProject, showToast])

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

  useEffect(() => {
    const handleReady = () => setShowRenderDownload(true)
    window.addEventListener('render-download-ready', handleReady)
    return () => window.removeEventListener('render-download-ready', handleReady)
  }, [])

  const quickCreateAutoDismissedRef = useRef(false)
  useEffect(() => {
    if (isProjectLoading || quickCreateAutoDismissedRef.current) return
    if (projectHasPreExistingScenes(project.scenes)) {
      setShowQuickCreateModal(false)
      quickCreateAutoDismissedRef.current = true
    }
  }, [isProjectLoading, project.scenes])

  const projectRef = useRef(project)
  const insertAfterIndexRef = useRef(null)
  projectRef.current = project

  // Fetch the latest project state from the backend on mount
  useEffect(() => {
    const workspaceId = initialConfig?.workspaceId || initialConfig?.videoData?.workspaceId
    const projectId = initialConfig?.videoId || initialConfig?.videoData?.id || initialConfig?.videoData?._id

    if (!workspaceId || !projectId) return

    const fetchProject = async () => {
      try {
        setIsProjectLoading(true)
        const fetchedProject = await workspaceService.getProject(workspaceId, projectId)
        if (!fetchedProject) return

        const backendScenes = fetchedProject.data?.scenes || []

        // If backend has no scenes but editor already has scenes (e.g. template), do an initial save
        if (backendScenes.length === 0 && projectRef.current.scenes.length > 0) {
          console.log('[Editor] Fresh project – saving initial template scenes to backend')
          setTimeout(() => saveProject(false, projectRef.current), 500)
          return
        }

        if (backendScenes.length > 0) {
          const mapped = fromBackendProjectData(fetchedProject.data);
          const scenesWithVideo = await rehydrateSceneVideos(
            mapped.scenes,
            workspaceId,
            projectId
          );

          setProject((prev) => ({
            ...prev,
            resolution: mapped.resolution || prev.resolution,
            meta: mapped.meta || prev.meta,
            scenes: scenesWithVideo.map((s, idx) => ensureSceneIdentity(s, idx)),
            updatedAt: fetchedProject.updatedAt || new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.warn('[Editor] Failed to fetch project from backend:', err)
      } finally {
        setIsProjectLoading(false)
      }
    }

    fetchProject()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saveProject = useCallback(async (manual = false, projectState = projectRef.current) => {
    try {
      localStorage.setItem('athenavi_project', JSON.stringify(projectState));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }

    if (!projectState.id || !projectState.workspaceId) {
      if (manual) {
        showToast('Cannot save — project is missing workspace or ID', 'warning');
      }
      return;
    }

    if (!isOnline) {
      if (manual) showToast('Offline — changes saved locally only', 'warning');
      return;
    }

    try {
      setIsSaving(true);

      const payload = toBackendProjectData(projectState);

      await workspaceService.saveProjectState(projectState.workspaceId, projectState.id, payload);

      if (manual) {
        await workspaceService.updateProject(projectState.workspaceId, projectState.id, { name: projectState.title });
      }

      saveVersionSnapshot(projectState.id, projectState);
      setLastSaved(new Date());
      if (manual) showToast('Project saved', 'success');
    } catch (error) {
      console.error('Failed to save project:', error);
      showToast(error?.message || 'Save failed — your work is kept locally', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [isOnline, showToast]);

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

      const newState = { ...prev, updatedAt: new Date().toISOString(), scenes: updatedScenes };
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
      return { ...prev, updatedAt: new Date().toISOString(), scenes: newScenes };
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
    }), { history: true })
    
    setActiveSceneId(newScene.id)
    return { newScene, updatedScenes: [...project.scenes, newScene] }
  }

  const addLayer = (type, content, meta = null) => {
    let targetSceneId = activeSceneId
    let currentScenes = project.scenes

    if (!targetSceneId || currentScenes.length === 0) {
      const { newScene, updatedScenes } = autoCreateScene()
      targetSceneId = newScene.id
      currentScenes = updatedScenes
    }

    const targetScene = currentScenes.find(s => s.id === targetSceneId)
    if (!targetScene) return

    const isMediaObject = content && typeof content === 'object' && !Array.isArray(content)
    const mediaSrc = isMediaObject ? (content.url || content.src) : content
    const assetId = isMediaObject ? content.assetId : meta?.assetId

    const newClip = {
      id: `clip_${Date.now()}`,
      type: type === 'image' ? 'image' : type === 'video' ? 'video' : type === 'avatar' ? 'avatar' : type === 'shape' ? 'shape' : type === 'audio' ? 'audio' : 'text',
      src: (type === 'image' || type === 'video' || type === 'avatar' || type === 'audio') ? mediaSrc : null,
      content: type === 'text'
        ? { text: typeof content === 'string' ? content : '' }
        : assetId
          ? { assetId, mediaType: type, url: mediaSrc }
          : null,
      layer: targetScene.clips.length,
      startTime: 0.0,
      endTime: targetScene.duration || 8.0,
      position: { x: 50, y: 50 },
      size: type === 'avatar' ? { width: 250, height: 330 } : type === 'shape' ? { width: parseInt(content?.style?.width) || 200, height: parseInt(content?.style?.height) || 200 } : { width: 400, height: 400 },
      role: type === 'avatar' ? 'avatar' : undefined,
      opacity: 1.0,
      style: type === 'text'
        ? {
            fontSize: 32,
            fontWeight: '700',
            color: '#1a1b1c',
            textAlign: 'left',
            fontFamily: 'Inter, system-ui, sans-serif',
            ...(meta?.style || {}),
          }
        : type === 'shape' ? content?.style : undefined,
      effects: {
        brightness: 1,
        contrast: 1,
        saturation: 1,
        blur: 0
      }
    }

    if (meta?.isBackground) {
      newClip.isBackground = true
      newClip.role = 'background'
      newClip.layer = 0
      newClip.position = meta?.position ?? { x: 960, y: 540 }
      newClip.size = meta?.size ?? { width: 1920, height: 1080 }
    }

    if (type === 'avatar') {
      const centered = getCenteredAvatarPlacement(project.resolution)
      newClip.position = centered.position
      newClip.size = centered.size
    }

    setProject(prev => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      scenes: prev.scenes.map(s =>
        s.id === targetSceneId
          ? { ...s, clips: normalizeClipStack([...s.clips, newClip]) }
          : s
      )
    }), { history: true })
    return newClip.id
  }

  // Update a specific layer's size within the active scene
  const updateLayerSize = (layerId, width, height) => {
    if (!activeSceneId) return
    setProject(prev => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      scenes: prev.scenes.map(s => {
        if (s.id !== activeSceneId) return s
        return {
          ...s,
          clips: s.clips.map(c =>
            c.id === layerId ? { ...c, size: { width, height }, _userPlaced: true } : c
          )
        }
      })
    }))
  }

  // Update a specific layer's position within the active scene (with optional snap)
  const updateLayerPosition = (layerId, x, y, options) => {
    uxUpdateLayerPosition(layerId, x, y, options)
  }

  const handleCommitLayerPosition = () => {
    commitLayerPositionHistory()
    // Autosave after any move/resize commit from canvas interactions.
    setTimeout(() => saveProject(false), 250)
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
      updatedAt: new Date().toISOString(),
      scenes: prev.scenes.map(s =>
        s.id === sceneId ? { ...s, clips: s.clips.filter(c => c.id !== layerId) } : s
      )
    }), { history: true })
    setSelectedLayerIds((prev) => prev.filter((id) => id !== layerId))
    if (selectedLayerId === layerId) setSelectedLayerId(null)
  }

  // Update clip text content (from inline editing via LiveCanvasRenderer)
  const updateClipContent = (sceneId, clipId, newText) => {
    setProject(prev => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      scenes: prev.scenes.map(s =>
        s.id === sceneId
          ? {
              ...s,
              clips: s.clips.map(c =>
                c.id === clipId
                  ? { ...c, content: buildClipTextContent(newText, c.content) }
                  : c
              ),
            }
          : s
      )
    }))
  }

  const deleteMusic = () => {
    setProject(prev => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      scenes: prev.scenes.map(s => ({
        ...s,
        clips: s.clips.filter(c => c.type !== 'audio')
      }))
    }));
  }

  const handleMusicDurationChange = (newDuration) => {
    setMusicDuration(newDuration)
  }

  const playerRef = useRef(null)
  const speechSynthesisRef = useRef(null)

  const activeScene = project.scenes.find(s => s.id === activeSceneId)
  const selectedLayer = activeScene?.clips?.find((c) => c.id === selectedLayerId)

  const handleTimelineResize = useCallback((delta) => {
    setTimelineHeight((h) =>
      clampPanelSize(h + delta, TIMELINE_HEIGHT_MIN, TIMELINE_HEIGHT_MAX)
    )
  }, [])

  const handlePropertiesResize = useCallback((delta) => {
    setPropertiesPanelWidth((w) =>
      clampPanelSize(w + delta, PROPERTIES_WIDTH_MIN, PROPERTIES_WIDTH_MAX)
    )
  }, [])

  const timelineHeightRef = useRef(timelineHeight)
  const propertiesPanelWidthRef = useRef(propertiesPanelWidth)
  timelineHeightRef.current = timelineHeight
  propertiesPanelWidthRef.current = propertiesPanelWidth

  const persistTimelineHeight = useCallback(() => {
    setIsResizingLayout(false)
    writeStoredPanelSize(TIMELINE_HEIGHT_STORAGE, timelineHeightRef.current)
  }, [])

  const persistPropertiesWidth = useCallback(() => {
    setIsResizingLayout(false)
    writeStoredPanelSize(PROPERTIES_WIDTH_STORAGE, propertiesPanelWidthRef.current)
  }, [])

  const totalDurationInFrames = useMemo(() => {
    return project.scenes.reduce((sum, s) => sum + (s.duration || 8), 0) * 30
  }, [project.scenes])

  const activeSceneStart = useMemo(() => {
    const idx = project.scenes.findIndex((s) => s.id === activeSceneId)
    if (idx <= 0) return 0
    return project.scenes.slice(0, idx).reduce((sum, s) => sum + (s.duration || 8), 0)
  }, [project.scenes, activeSceneId])

  const isSingleScenePlayback = timelineScope === 'single' && !!activeScene

  const playbackScenes = useMemo(
    () => (isSingleScenePlayback ? [activeScene] : project.scenes),
    [isSingleScenePlayback, activeScene, project.scenes]
  )

  const playbackDurationInFrames = useMemo(() => {
    if (isSingleScenePlayback) {
      return Math.max(1, Math.round((activeScene.duration || 8) * 30))
    }
    return totalDurationInFrames
  }, [isSingleScenePlayback, activeScene, totalDurationInFrames])

  const getSceneStartTime = useCallback((sceneId) => {
    const idx = project.scenes.findIndex((s) => s.id === sceneId)
    if (idx <= 0) return 0
    return project.scenes.slice(0, idx).reduce((sum, s) => sum + (s.duration || 8), 0)
  }, [project.scenes])

  const handleReorderScenes = (newScenes) => {
    setProject(prev => ({ ...prev, updatedAt: new Date().toISOString(), scenes: newScenes }), { history: true })
  }

  const handleSelectLayer = (layerId, sceneId, event) => {
    if (sceneId) setActiveSceneId(sceneId)
    selectLayer(layerId, sceneId, { additive: event?.shiftKey })
    if (layerId) setIsRightSidebarOpen(true)
  }

  const handleSelectLayerId = (layerId) => {
    if (layerId) {
      setSelectedLayerIds([layerId])
      setSelectedLayerId(layerId)
      setIsRightSidebarOpen(true)
    } else {
      setSelectedLayerIds([])
      setSelectedLayerId(null)
    }
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

  // Handle player frame updates (fallback sync when Remotion onFrameUpdate is sparse)
  useEffect(() => {
    if (playerRef.current && isPlaying) {
      const player = playerRef.current
      const updateTime = () => {
        try {
          const frame = player.getCurrentFrame()
          const time = timelineScope === 'single'
            ? activeSceneStart + frame / 30
            : frame / 30
          setCurrentTime(time)
          if (timelineScope !== 'single') {
            const { scene } = getSceneForFrame(frame)
            if (scene && scene.id !== activeSceneId) {
              setActiveSceneId(scene.id)
            }
          }
        } catch {
          // Player might not be ready
        }
      }

      const interval = setInterval(updateTime, 100)
      return () => clearInterval(interval)
    }
  }, [isPlaying, scenes, activeSceneId, timelineScope, activeSceneStart])

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
        if (isPlaying) {
          playerRef.current?.pause()
        } else {
          window.speechSynthesis?.cancel()
          playerRef.current?.play()
        }
      }

      // Escape: Close sidebar tool panel
      if (e.key === 'Escape') {
        setSelectedTool(null)
      }

      // Delete: remove selected layers, or active scene if none selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedLayerIds.length > 0) {
          e.preventDefault()
          deleteSelectedLayers()
          return
        }
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
            if (e.shiftKey) {
              if (redo()) showToast('Redo', 'info')
            } else if (undo()) {
              showToast('Undo', 'info')
            }
            break
          case 'y':
            e.preventDefault()
            if (redo()) showToast('Redo', 'info')
            break
          case 'c':
            e.preventDefault()
            copySelectedLayers()
            break
          case 'v':
            e.preventDefault()
            pasteLayers()
            break
          case 'd':
            e.preventDefault()
            duplicateSelectedLayers()
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
  }, [isPlaying, activeSceneId, scenes.length, currentTime, totalDurationInFrames, saveProject, selectedLayerIds, undo, redo, copySelectedLayers, pasteLayers, duplicateSelectedLayers, deleteSelectedLayers, showToast])

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
    const templateScene = JSON.parse(JSON.stringify(template));
    // Keep template scene clean (no generation / playback artifacts)
    delete templateScene.heygenVideoId;
    delete templateScene.generatedVideoUrl;
    delete templateScene.playbackUrl;
    delete templateScene.heygenStatus;
    delete templateScene.generation;

    const insertAfter = insertAfterIndexRef.current
    insertAfterIndexRef.current = null

    let nextActiveSceneId = null
    setProject(prev => {
      // Replace the "single default scene" only if it's genuinely an empty starter scene.
      const maybeDefault = prev.scenes?.length === 1 ? prev.scenes[0] : null
      const isDefaultSingleScene =
        !!maybeDefault &&
        (maybeDefault.id === 'lt_001' || maybeDefault.title === 'Intro' || maybeDefault.title === 'Hero Scene') &&
        ((maybeDefault.clips?.length ?? 0) === 0)

      const newSceneId = isDefaultSingleScene
        ? maybeDefault.id
        : `scene_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`

      nextActiveSceneId = newSceneId

      const newScene = {
        ...templateScene,
        id: newSceneId,
        sceneId: newSceneId,
        order: isDefaultSingleScene ? 0 : prev.scenes.length,
        clips: (templateScene.clips || []).map(clip => ({
          ...clip,
          id: `clip_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        })),
      }

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

    if (nextActiveSceneId) setActiveSceneId(nextActiveSceneId)
  }

  const handleGenerateStoryboard = (storyboardScenes, mode = 'replace') => {
    setProject(prev => {
      let finalScenes;
      if (mode === 'replace') {
        finalScenes = storyboardScenes.map((s, idx) =>
          ensureSceneIdentity({ ...s, order: idx }, idx)
        );
      } else {
        const baseOrder = prev.scenes.length;
        const orderedNewScenes = storyboardScenes.map((s, idx) =>
          ensureSceneIdentity({ ...s, order: baseOrder + idx }, baseOrder + idx)
        );
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
    setProject(prev => ({ ...prev, updatedAt: new Date().toISOString(), scenes: newScenes }), { history: true })
    if (activeSceneId === id) {
      setActiveSceneId(newScenes[0]?.id || null)
      setSelectedLayerIds([])
      setSelectedLayerId(null)
    }
  }

  const updateScene = (id, updates) => {
    uxUpdateScene(id, updates, { history: true })
  }

  const exportVideo = () => {
    const workspaceId = project.workspaceId || project.createConfig?.workspaceId
    const projectId = project.id || project.createConfig?.videoId

    if (!workspaceId || !projectId) {
      showToast('Save this project to a workspace folder before downloading.', 'error')
      return
    }

    if (!project.scenes?.length) {
      showToast('Add at least one scene before downloading.', 'error')
      return
    }

    setExportPhase('configure')
    setExportStatus('')
    setExportError('')
    setShowExportModal(true)
  }

  const handleStartExport = async ({ filename }) => {
    const workspaceId = project.workspaceId || project.createConfig?.workspaceId
    const projectId = project.id || project.createConfig?.videoId

    if (!workspaceId || !projectId || isExporting) return

    setExportPhase('loading')
    setExportStatus('Saving project…')
    setExportError('')
    setIsExporting(true)

    try {
      await exportFullProjectVideo({
        workspaceService,
        workspaceId,
        projectId,
        projectState: projectRef.current,
        filename,
        onStatus: setExportStatus,
      })
      setExportPhase('success')
      showToast('Download started', 'success')
    } catch (err) {
      console.error('[Export] Full render download failed:', err)
      setExportError(err?.message || 'Download failed. The video may still be rendering.')
      setExportPhase('error')
    } finally {
      setIsExporting(false)
    }
  }

  const handleCloseExportModal = () => {
    if (isExporting) return
    setShowExportModal(false)
    setExportPhase('configure')
    setExportStatus('')
    setExportError('')
  }

  const handlePreview = () => {
    window.speechSynthesis?.cancel()
    setIsPlaying(false)
    setShowPreviewModal(true)
  }

  const generateSceneVideo = async (sceneId, overrides = null) => {
    const scene = project.scenes.find(s => s.id === sceneId);
    if (!scene && !overrides) return;

    const avatarLookId =
      overrides?.avatarType || getSceneAvatarLookId(scene);
    const avatarKind =
      overrides?.avatarTypeLabel || getSceneAvatarKind(scene);
    const voiceId = overrides?.voiceId || scene?.voiceId;
    const script = overrides?.script || scene?.script;
    const isRegenerate = !!scene?.heygenVideoId || scene?.heygenStatus === 'completed';
    let stableSceneId = overrides?.sceneId || scene?.sceneId || scene?.id || sceneId;

    if (isRegenerate && !overrides?.sceneId) {
      stableSceneId = nextHeygenSceneId(stableSceneId, sceneId);
    }

    const workspaceId = project.workspaceId || project.createConfig?.workspaceId;
    const projectId = project.id || project.createConfig?.videoId;

    console.log('[HeyGen] Generating video for scene:', {
      sceneId: stableSceneId,
      avatarLookId,
      avatarKind,
      voiceId,
      scriptLength: script?.length,
      workspaceId,
      projectId
    });

    if (!avatarLookId || !voiceId || !script) {
      alert('Please select an avatar look, a voice, and enter a script first.');
      return;
    }

    if (String(avatarLookId).startsWith('ag_')) {
      alert('Please pick a look (not a character group) before generating video.');
      return;
    }

    if (!workspaceId || !projectId) {
      console.error('[HeyGen] Missing identifiers:', { workspaceId, projectId, project });
      alert('Missing workspace or project ID. Please ensure this project is saved in a folder.');
      return;
    }

    try {
      const voiceSettings = overrides?.voiceSettings || scene?.voiceSettings || {
        speed: 1,
        pitch: 0,
        locale: 'en-US',
      }
      const durationPatch = buildSceneDurationPatch(scene, { script, voiceSettings })

      updateScene(sceneId, {
        heygenStatus: 'processing',
        sceneId: stableSceneId,
        generatedVideoUrl: undefined,
        playbackUrl: undefined,
        ...durationPatch,
      });

      const aspectRatioStr = project.resolution?.width > project.resolution?.height ? '16:9' : '9:16';
      
      const payload = {
        sceneId: stableSceneId,
        avatarId: avatarLookId,
        avatarEngine: overrides?.avatarEngine || scene?.presenter?.avatarEngine || scene?.avatarEngine || 'avatar_iv',
        avatarType: avatarKind,
        title: `${project.title} - ${scene?.title || 'Scene'}`,
        resolution: project.resolution?.height >= 1080 ? '1080p' : '720p',
        aspectRatio: overrides?.aspectRatio || aspectRatioStr,
        backgroundColor: overrides?.backgroundColor || scene?.background?.value || scene?.backgroundColor || '#008000',
        voiceId: voiceId,
        script: script,
        voiceSettings,
        removeBackground: overrides?.removeBackground ?? (scene?.removeBackground || false),
        outputFormat: scene?.outputFormat || 'mp4'
      };

      if (payload.avatarEngine === 'avatar_iv' && avatarKind === 'photo_avatar') {
        payload.expressiveness = overrides?.expressiveness || scene?.expressiveness || 'medium';
      }

      const result = await heygenService.generateVideo(workspaceId, projectId, payload);
      const heygenVideoId = result.id || result.heygenVideoId || result.video_id;

      const sceneForContent = {
        ...(scene || {}),
        sceneId: stableSceneId,
        avatarLookId,
        avatarType: avatarLookId,
        avatarKind,
        voiceId,
        script,
        heygenVideoId,
      };
      const currentClips = durationPatch.clips || scene?.clips || [];
      const avatarIdx = currentClips.findIndex((c) => c.role === 'avatar' || c.type === 'avatar');
      let clipsWithHeygen = currentClips;
      if (avatarIdx !== -1) {
        clipsWithHeygen = [...currentClips];
        clipsWithHeygen[avatarIdx] = {
          ...clipsWithHeygen[avatarIdx],
          content: buildHeygenAvatarContent(sceneForContent, clipsWithHeygen[avatarIdx]),
        };
      }

      const syncedClips = applyDurationToSceneClips(clipsWithHeygen, durationPatch.duration);

      updateScene(sceneId, {
        sceneId: stableSceneId,
        heygenVideoId,
        heygenStatus: 'processing',
        clips: syncedClips,
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

            let finalDuration =
              durationFromVideoMetadata(videoData) ??
              durationPatch.duration

            try {
              const probed = await probeVideoDuration(videoUrl);
              if (Number.isFinite(probed) && probed > 0) {
                finalDuration = roundSceneDuration(probed);
              }
            } catch {
              // keep estimate / API metadata
            }

            const latestScene = projectRef.current.scenes.find((s) => s.id === sceneId) || scene;
            const sceneForPlacement = {
              ...latestScene,
              sceneId: stableSceneId,
              heygenVideoId,
              heygenStatus: 'completed',
              generatedVideoUrl: videoUrl,
              duration: finalDuration,
              avatar: videoData.thumbnail_url || latestScene?.avatar || scene?.avatar,
            };
            const placedClips = applyGeneratedHeygenToClips(latestScene?.clips || [], {
              videoUrl,
              resolution: projectRef.current.resolution,
              sceneDuration: finalDuration,
              scene: sceneForPlacement,
              buildContent: buildHeygenAvatarContent,
            });
            const finalClips = applyDurationToSceneClips(placedClips, finalDuration);

            updateScene(sceneId, {
              heygenStatus: 'completed',
              heygenVideoId,
              avatar: videoData.thumbnail_url || scene?.avatar,
              generatedVideoUrl: videoUrl,
              duration: finalDuration,
              durationFromScript: true,
              clips: finalClips,
            });

            showToast('Presenter placed in the center — your other elements are unchanged.', 'success');

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
    if (playerRef.current?.seekTo) {
      playerRef.current.seekTo(time)
    }
    const frame = Math.max(0, Math.floor(time * 30))
    const { scene } = getSceneForFrame(frame)
    if (scene && scene.id !== activeSceneId) {
      setActiveSceneId(scene.id)
    }
  }

  const handleSelectScene = useCallback((sceneId, options = {}) => {
    setActiveSceneId(sceneId)
    setSelectedLayerIds([])
    setSelectedLayerId(null)

    if (options.scope === 'single') {
      setTimelineScope('single')
    }

    const singleMode = options.scope === 'single' || timelineScope === 'single'
    if (singleMode) {
      const start = getSceneStartTime(sceneId)
      setCurrentTime(start)
      playerRef.current?.seekTo?.(start)
    }

    if (options.openSidebar && !isRightSidebarOpen) {
      setIsRightSidebarOpen(true)
    }
  }, [getSceneStartTime, timelineScope, isRightSidebarOpen])

  const handleQuickCreateGenerate = (payload) => {
    if (payload.isStoryboard) {
      // Split script into paragraphs by double newlines or single newlines with spacing
      const paragraphs = (payload.script || '')
        .split(/\n\s*\n+/)
        .map(p => p.trim())
        .filter(p => p.length > 0);

      if (paragraphs.length === 0) return;

      const storyboardScenes = paragraphs.map((paraText, pIdx) => {
        const duration = estimateHeygenSceneDuration(paraText, payload.voiceSettings);

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
            id: `clip_image_${Date.now()}_${pIdx}_1`, type: 'image', role: 'media-panel', src: '',
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
            id: `clip_image_${Date.now()}_${pIdx}_5`, type: 'image', role: 'media-panel', src: '',
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
          durationFromScript: true,
          background: { type: 'color', value: payload.backgroundColor || '#101828' },
          avatar: payload.avatarImage,
          avatarType: payload.avatarType,
          avatarLookId: payload.avatarType,
          avatarKind: payload.avatarTypeLabel,
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
          saveProject(false, updated);
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
    const voiceSettings = payload.voiceSettings || { speed: 1, pitch: 0, locale: 'en-US' };
    const durationPatch = buildSceneDurationPatch(targetScene, {
      script: payload.script,
      voiceSettings,
      clips: updatedClips,
    });
    updatedClips = durationPatch.clips;

    const sceneDraft = {
      ...(targetScene || {}),
      sceneId: stableSceneId,
      avatarType: payload.avatarType,
      avatarLookId: payload.avatarType,
      avatarKind: payload.avatarTypeLabel,
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
      const centered = getCenteredAvatarPlacement(project.resolution)
      const newClip = {
        id: `clip_${Date.now()}`,
        type: 'avatar',
        role: 'avatar',
        src: payload.avatarImage,
        layer: updatedClips.length,
        startTime: 0.0,
        endTime: durationPatch.duration,
        position: centered.position,
        size: centered.size,
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
          avatarLookId: payload.avatarType,
          avatarKind: payload.avatarTypeLabel,
          avatarName: payload.avatarName,
          avatarGroupId: payload.avatarGroupId,
          voiceId: payload.voiceId,
          voiceName: payload.voiceName,
          voiceSettings,
          script: payload.script,
          expressiveness: payload.expressiveness,
          backgroundColor: payload.backgroundColor,
          removeBackground: payload.removeBackground,
          duration: durationPatch.duration,
          durationFromScript: true,
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

    const scene = project.scenes.find(s => s.id === generatingSceneId);
    if (!scene) return;

    const placedClips = applyGeneratedHeygenToClips(scene.clips || [], {
      videoUrl: generatedVideoUrl,
      resolution: project.resolution,
      sceneDuration: scene.duration,
      scene: { ...scene, generatedVideoUrl },
      buildContent: buildHeygenAvatarContent,
    });

    setProject(prev => {
      const newProj = {
        ...prev,
        scenes: prev.scenes.map(s => s.id === generatingSceneId ? {
          ...s,
          clips: placedClips,
          generatedVideoUrl,
        } : s)
      };
      
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

            templateClips = normalizeClipsToScene(templateClips, s.duration || 8);
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
      <RenderDownloadModal
        isOpen={showRenderDownload}
        onClose={() => setShowRenderDownload(false)}
      />
      {isProjectLoading && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2500,
            background: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              width: 'min(520px, 94vw)',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(2, 6, 23, 0.85)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
              padding: 18,
              color: '#e5e7eb',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  border: '4px solid rgba(148,163,184,0.25)',
                  borderTop: '4px solid rgba(59,130,246,0.95)',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ fontWeight: 900, fontSize: 14 }}>Loading your project…</div>
                <div style={{ fontSize: 12, color: 'rgba(226,232,240,0.8)' }}>
                  Preparing scenes and media
                </div>
              </div>
            </div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      )}
      <QuickCreateModal
        isOpen={showQuickCreateModal && !isProjectLoading}
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
      <EditorToast toast={toast} onDismiss={() => setToast(null)} />
      <ExportModal
        isOpen={showExportModal}
        onClose={handleCloseExportModal}
        projectTitle={project.title}
        sceneCount={scenes.length}
        totalDurationSec={totalDurationInFrames / 30}
        phase={exportPhase}
        statusMessage={exportStatus}
        errorMessage={exportError}
        onStartExport={handleStartExport}
      />
      <EditorTopbar
        onBack={onBack}
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        handlePreview={handlePreview}
        exportVideo={exportVideo}
        isExporting={isExporting}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        onUndo={() => { if (undo()) showToast('Undo', 'info') }}
        onRedo={() => { if (redo()) showToast('Redo', 'info') }}
        canUndo={canUndo}
        canRedo={canRedo}
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
        workspaceId={project.workspaceId || project.createConfig?.workspaceId}
        addAudioClip={addAudioClip}
        onUploadError={(msg) => showToast(msg, 'error')}
        setSelectedLayerId={handleSelectLayerId}
        onPresenterChanged={({ message }) => showToast(message, 'info')}
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
            onSelectScene={(sceneId) => handleSelectScene(sceneId, { scope: 'single' })}
            onDeleteScene={deleteScene}
            onAddSceneAfter={addSceneAfter}
            updateScene={updateScene}
            onDuplicateScene={(sceneId) => {
              const newId = duplicateSceneById(sceneId)
              if (newId) {
                setActiveSceneId(newId)
                showToast('Scene duplicated', 'success')
              }
            }}
          />
        </div>

        {/* Main Content Area */}
        <div className="main-content">
          <div className="main-content-row" style={{ position: 'relative' }}>
            <EditorViewControls
              editorView={editorView}
              onChange={(patch) => setEditorView((prev) => ({ ...prev, ...patch }))}
              onRestoreVersion={handleRestoreVersion}
              versionCount={versionSnapshots.length}
            />
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
                activeSceneId={activeSceneId}
                setActiveSceneId={setActiveSceneId}
                totalDurationInFrames={totalDurationInFrames}
                playbackDurationInFrames={playbackDurationInFrames}
                playbackScenes={playbackScenes}
                playbackStartTime={activeSceneStart}
                timelineScope={timelineScope}
                getSceneForFrame={getSceneForFrame}
                speakText={speakText}
                selectedLayerId={selectedLayerId}
                selectedLayerIds={selectedLayerIds}
                setSelectedLayerId={(id) => {
                  if (id) {
                    setSelectedLayerIds([id])
                    setSelectedLayerId(id)
                    setIsRightSidebarOpen(true)
                  } else {
                    setSelectedLayerIds([])
                    setSelectedLayerId(null)
                  }
                }}
                onSelectLayer={handleSelectLayer}
                onUpdateLayerPosition={updateLayerPosition}
                onCommitLayerPosition={handleCommitLayerPosition}
                onUpdateLayerSize={updateLayerSize}
                updateClipContent={updateClipContent}
                editorView={editorView}
                workspaceId={project.workspaceId}
                projectId={project.id}
              />
            </div>
          </div>

          {/* Timeline Area - Always Visible */}
          <div
            className="timeline-area"
            style={{
              height: timelineHeight,
              minHeight: timelineHeight,
              maxHeight: timelineHeight,
            }}
          >
            <PanelResizeHandle
              axis="y"
              edge="top"
              onResize={(delta) => {
                setIsResizingLayout(true)
                handleTimelineResize(delta)
              }}
              onResizeEnd={persistTimelineHeight}
            />
            <TimelineEditor
              scenes={scenes}
              bgMusic={bgMusic}
              activeSceneId={activeSceneId}
              selectedLayerId={selectedLayerId}
              selectedLayerIds={selectedLayerIds}
              currentTime={currentTime}
              isPlaying={isPlaying}
              onSeek={handleSeek}
              onSelectScene={(sceneId) => handleSelectScene(sceneId, { openSidebar: true })}
              onSelectLayer={handleSelectLayer}
              onUpdateScene={updateScene}
              onAddScene={addScene}
              onDeleteScene={deleteScene}
              onReorderScenes={handleReorderScenes}
              onDeleteLayer={deleteLayer}
              onDeleteMusic={deleteMusic}
              onUndo={() => { if (undo()) showToast('Undo', 'info') }}
              onRedo={() => { if (redo()) showToast('Redo', 'info') }}
              canUndo={canUndo}
              canRedo={canRedo}
              onDuplicateLayer={duplicateSelectedLayers}
              onCopyLayer={copySelectedLayers}
              onMoveLayerOrder={moveLayerOrder}
              musicDuration={musicDuration || (totalDurationInFrames / 30)}
              onMusicDurationChange={handleMusicDurationChange}
              onPlayPause={() => {
                if (isPlaying) {
                  playerRef.current?.pause()
                } else {
                  window.speechSynthesis?.cancel()
                  playerRef.current?.play()
                }
              }}
              onStop={() => {
                const stopTime = timelineScope === 'single' ? activeSceneStart : 0
                if (playerRef.current) {
                  playerRef.current.pause()
                  playerRef.current.seekTo(stopTime)
                }
                setIsPlaying(false)
                setCurrentTime(stopTime)
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
          <div
            className="properties-panel-shell"
            style={{
              width: isRightSidebarOpen ? `${propertiesPanelWidth}px` : '0px',
              flexShrink: 0,
              height: '100%',
              overflow: 'hidden',
              transition: isResizingLayout
                ? 'none'
                : 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              borderLeft: isRightSidebarOpen ? '1px solid var(--border-color)' : 'none',
              background: 'var(--bg-panel)',
              zIndex: 40,
              position: 'relative',
            }}
          >
            {isRightSidebarOpen ? (
              <PanelResizeHandle
                axis="x"
                edge="start"
                onResize={(delta) => {
                  setIsResizingLayout(true)
                  handlePropertiesResize(delta)
                }}
                onResizeEnd={persistPropertiesWidth}
              />
            ) : null}
            <div
              className="scene-config-panel-scroll premium-scrollbar"
              style={{
                width: `${propertiesPanelWidth}px`,
                height: '100%',
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
            >
              <SceneConfigurationPanel
                activeScene={activeScene}
                activeSceneId={activeSceneId}
                updateScene={updateScene}
                selectedLayerId={selectedLayerId}
                generateSceneVideo={generateSceneVideo}
                setActiveTab={setSelectedTool}
                applyGlobalSetting={applyGlobalSetting}
                onOpenQuickCreate={() => setShowQuickCreateModal(true)}
                onMoveLayerOrder={moveLayerOrder}
                onToggleLayerLock={toggleLayerLock}
                onDuplicateScene={() => {
                  const newId = duplicateSceneById(activeSceneId)
                  if (newId) {
                    setActiveSceneId(newId)
                    showToast('Scene duplicated', 'success')
                  }
                }}
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
        getSceneForFrame={getSceneForFrame}
        setActiveSceneId={setActiveSceneId}
        workspaceId={project.workspaceId || project.createConfig?.workspaceId}
        projectId={project.id || project.createConfig?.videoId}
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
