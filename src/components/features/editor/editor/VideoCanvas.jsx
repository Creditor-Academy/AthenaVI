import { useRef, useCallback, forwardRef, useImperativeHandle, useEffect, useState, useMemo } from 'react'
import { Player } from '@remotion/player'
import VideoComposition from './VideoComposition'
import LiveCanvasRenderer from './LiveCanvasRenderer'
import heygenService from '../../../../services/heygenService'
import {
  prepareScenesForPlayback,
  sceneHasHeygenPlayback,
  unmuteRemotionPlayer,
} from '../../../../utils/heygenVideo'

const VideoCanvas = forwardRef(({
  scenes,
  bgMusic,
  bgMusicVolume,
  isPlaying,
  setIsPlaying,
  currentTime,
  setCurrentTime,
  zoomLevel,
  activeSceneId,
  setActiveSceneId,
  totalDurationInFrames,
  playbackDurationInFrames,
  playbackScenes,
  playbackStartTime = 0,
  timelineScope = 'all',
  getSceneForFrame,
  speakText,
  onPlayerReady,
  selectedLayerId,
  selectedLayerIds = [],
  setSelectedLayerId,
  onSelectLayer,
  onUpdateLayerPosition,
  onCommitLayerPosition,
  onUpdateLayerSize,
  onUpdateLayerRotation,
  onUpdateLayerStyle,
  onUpdateLayer,
  onDuplicateLayer,
  onDeleteLayer,
  onMoveLayerOrder,
  onToggleLayerLock,
  onOpenLayerCrop,
  onAddScene,
  updateClipContent,
  onFillShape,
  onCanvasDrop,
  editorView = {},
  workspaceId,
  projectId,
  previewOpen = false,
}, ref) => {
  const remotionPlayerRef = useRef(null)
  const [playbackReadyScenes, setPlaybackReadyScenes] = useState(null)
  const [isPreparingPlayback, setIsPreparingPlayback] = useState(false)
  const currentTimeRef = useRef(currentTime)
  const playbackSessionRef = useRef(0)
  const playbackStartedSessionRef = useRef(-1)
  const lastSyncedSceneIdRef = useRef(activeSceneId)
  const lastSpokenSceneIdRef = useRef(null)
  const wasPlayingRef = useRef(false)
  const activeSceneIdRef = useRef(activeSceneId)
  const playbackSyncRef = useRef({})

  currentTimeRef.current = currentTime
  activeSceneIdRef.current = activeSceneId

  const isSingleScene = timelineScope === 'single' && playbackScenes?.length === 1
  const durationInFrames = Math.max(playbackDurationInFrames ?? totalDurationInFrames, 1)
  const baseCompositionScenes = playbackScenes?.length ? playbackScenes : scenes
  const compositionScenes = playbackReadyScenes ?? baseCompositionScenes
  const editorPlaybackActive = isPlaying && !previewOpen
  const showRemotionPlayer = editorPlaybackActive || isPreparingPlayback

  const activeScene = (scenes || []).find(s => s.id === activeSceneId)
  const isEditingLayer = !showRemotionPlayer && !!(selectedLayerId || selectedLayerIds.length)

  const toLocalFrame = useCallback((globalTime) => {
    const localTime = isSingleScene
      ? Math.max(0, globalTime - playbackStartTime)
      : globalTime
    return Math.max(0, Math.min(Math.round(localTime * 30), durationInFrames - 1))
  }, [isSingleScene, playbackStartTime, durationInFrames])

  const startRemotionPlayback = useCallback(() => {
    const node = remotionPlayerRef.current
    if (!node) return

    const time = currentTimeRef.current
    if (isSingleScene) {
      const sceneEnd = playbackStartTime + durationInFrames / 30
      if (time < playbackStartTime || time >= sceneEnd - 0.05) {
        setCurrentTime(playbackStartTime)
        node.seekTo(0)
      } else {
        node.seekTo(toLocalFrame(time))
      }
    } else {
      node.seekTo(toLocalFrame(time))
    }
    unmuteRemotionPlayer(node)
    const result = node.play()
    if (result && typeof result.catch === 'function') {
      result.catch(() => {})
    }
  }, [isSingleScene, playbackStartTime, durationInFrames, setCurrentTime, toLocalFrame])

  const setPlayerRef = useCallback((node) => {
    remotionPlayerRef.current = node
    if (node && onPlayerReady) {
      onPlayerReady({
        seekTo: (time) => {
          node.seekTo(toLocalFrame(time))
        },
        getCurrentFrame: () => node.getCurrentFrame(),
        play: () => {
          window.speechSynthesis?.cancel()
          setIsPlaying(true)
        },
        pause: () => {
          node.pause()
          setIsPlaying(false)
          window.speechSynthesis?.cancel()
        },
      })
    }
  }, [onPlayerReady, toLocalFrame, setIsPlaying])

  useImperativeHandle(ref, () => ({
    seekTo: (time) => {
      if (remotionPlayerRef.current) {
        remotionPlayerRef.current.seekTo(toLocalFrame(time))
      }
    },
    getCurrentFrame: () => (remotionPlayerRef.current ? remotionPlayerRef.current.getCurrentFrame() : 0),
    play: () => {
      window.speechSynthesis?.cancel()
      setIsPlaying(true)
    },
    pause: () => {
      remotionPlayerRef.current?.pause()
      setIsPlaying(false)
      window.speechSynthesis?.cancel()
    },
  }), [setIsPlaying, toLocalFrame])

  useEffect(() => {
    if (!previewOpen) return undefined
    remotionPlayerRef.current?.pause()
    window.speechSynthesis?.cancel()
    return undefined
  }, [previewOpen])

  useEffect(() => {
    if (!isPlaying || previewOpen) {
      wasPlayingRef.current = false
      setPlaybackReadyScenes(null)
      setIsPreparingPlayback(false)
      playbackStartedSessionRef.current = -1
      lastSpokenSceneIdRef.current = null
      return undefined
    }

    // Scene changes during playback must not re-prepare or restart Remotion audio.
    if (wasPlayingRef.current) {
      return undefined
    }
    wasPlayingRef.current = true

    playbackSessionRef.current += 1
    const session = playbackSessionRef.current
    window.speechSynthesis?.cancel()
    lastSpokenSceneIdRef.current = null
    lastSyncedSceneIdRef.current = activeSceneIdRef.current

    const needsResolve = baseCompositionScenes.some((s) => s.heygenVideoId)
    if (!needsResolve || !workspaceId || !projectId) {
      setPlaybackReadyScenes(baseCompositionScenes)
      return undefined
    }

    let cancelled = false
    setIsPreparingPlayback(true)
    setPlaybackReadyScenes(null)

    prepareScenesForPlayback(
      baseCompositionScenes,
      workspaceId,
      projectId,
      heygenService
    )
      .then((withUrls) => {
        if (!cancelled && session === playbackSessionRef.current) {
          setPlaybackReadyScenes(withUrls)
          setIsPreparingPlayback(false)
        }
      })
      .catch((err) => {
        console.warn('[VideoCanvas] Playback prepare failed:', err)
        if (!cancelled && session === playbackSessionRef.current) {
          setPlaybackReadyScenes(baseCompositionScenes)
          setIsPreparingPlayback(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [isPlaying, previewOpen, baseCompositionScenes, workspaceId, projectId])

  useEffect(() => {
    if (!editorPlaybackActive || isPreparingPlayback || playbackReadyScenes === null) return undefined
    if (playbackStartedSessionRef.current === playbackSessionRef.current) return undefined

    playbackStartedSessionRef.current = playbackSessionRef.current
    const timer = setTimeout(startRemotionPlayback, 50)
    return () => clearTimeout(timer)
  }, [editorPlaybackActive, isPreparingPlayback, playbackReadyScenes, startRemotionPlayback])

  useEffect(() => {
    if (showRemotionPlayer || !remotionPlayerRef.current) return
    remotionPlayerRef.current.seekTo(toLocalFrame(currentTime))
  }, [currentTime, showRemotionPlayer, toLocalFrame])

  playbackSyncRef.current = {
    isSingleScene,
    playbackStartTime,
    durationInFrames,
    setCurrentTime,
    setIsPlaying,
    setActiveSceneId,
    getSceneForFrame,
    speakText,
  }

  useEffect(() => {
    const player = remotionPlayerRef.current
    if (!player || !editorPlaybackActive || isPreparingPlayback) return undefined

    const onFrameUpdate = ({ detail: { frame } }) => {
      const ctx = playbackSyncRef.current
      if (ctx.isSingleScene) {
        const globalTime = ctx.playbackStartTime + frame / 30
        ctx.setCurrentTime(globalTime)
        if (frame >= ctx.durationInFrames - 1) {
          remotionPlayerRef.current?.pause()
          ctx.setIsPlaying(false)
        }
        return
      }

      const time = frame / 30
      ctx.setCurrentTime(time)
      const { scene } = ctx.getSceneForFrame(frame)
      if (!scene || scene.id === lastSyncedSceneIdRef.current) return

      lastSyncedSceneIdRef.current = scene.id
      ctx.setActiveSceneId(scene.id)

      if (scene.script && !sceneHasHeygenPlayback(scene) && ctx.speakText) {
        if (lastSpokenSceneIdRef.current !== scene.id) {
          lastSpokenSceneIdRef.current = scene.id
          window.speechSynthesis?.cancel()
          ctx.speakText(scene.script, scene.id)
        }
      } else {
        window.speechSynthesis?.cancel()
      }
    }

    player.addEventListener('frameupdate', onFrameUpdate)
    return () => player.removeEventListener('frameupdate', onFrameUpdate)
  }, [editorPlaybackActive, isPreparingPlayback, playbackReadyScenes])

  const playerInputProps = useMemo(
    () => ({
      scenes: compositionScenes,
      bgMusic: isSingleScene ? null : bgMusic,
      bgMusicVolume,
      onAddScene,
    }),
    [compositionScenes, isSingleScene, bgMusic, bgMusicVolume, onAddScene]
  )

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && setSelectedLayerId) {
      setSelectedLayerId(null)
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
          <Player
            ref={setPlayerRef}
            component={VideoComposition}
            durationInFrames={durationInFrames}
            compositionWidth={1920}
            compositionHeight={1080}
            fps={30}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#0a0a0a',
              pointerEvents: showRemotionPlayer ? 'none' : 'none',
              zIndex: 10,
              visibility: showRemotionPlayer ? 'visible' : 'hidden',
              position: showRemotionPlayer ? 'relative' : 'absolute',
              inset: 0,
            }}
            inputProps={playerInputProps}
            showOutlines={false}
            showVolumeControls={false}
            numberOfSharedAudioTags={12}
            autoPlay={false}
          />

          {isPreparingPlayback && (
            <div className="canvas-playback-preparing" aria-live="polite">
              Loading avatar audio…
            </div>
          )}

          {!showRemotionPlayer && (
            <div
              onClick={handleOverlayClick}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 15,
              }}
            >
              <LiveCanvasRenderer
                scene={activeScene}
                overlayMode={false}
                selectedId={selectedLayerId}
                selectedIds={selectedLayerIds}
                onSelectClip={(id, e) => {
                  if (onSelectLayer) onSelectLayer(id, activeSceneId, e)
                  else if (setSelectedLayerId) setSelectedLayerId(id)
                }}
                onContentChange={(clipId, newText) =>
                  updateClipContent && updateClipContent(activeSceneId, clipId, newText)
                }
                onDeselect={() => setSelectedLayerId && setSelectedLayerId(null)}
                onUpdateLayerPosition={(clipId, x, y) =>
                  onUpdateLayerPosition && onUpdateLayerPosition(clipId, x, y)
                }
                onCommitLayerPosition={onCommitLayerPosition}
                onUpdateLayerSize={(clipId, w, h) =>
                  onUpdateLayerSize && onUpdateLayerSize(clipId, w, h)
                }
                onUpdateLayerRotation={(clipId, deg) =>
                  onUpdateLayerRotation && onUpdateLayerRotation(clipId, deg)
                }
                onUpdateLayerStyle={(clipId, updates) =>
                  onUpdateLayerStyle && onUpdateLayerStyle(clipId, updates)
                }
                onUpdateLayer={(clipId, updates) =>
                  onUpdateLayer && onUpdateLayer(clipId, updates)
                }
                onDuplicateLayer={(clipId) =>
                  onDuplicateLayer && onDuplicateLayer(clipId)
                }
                onDeleteLayer={(clipId) =>
                  onDeleteLayer && onDeleteLayer(clipId)
                }
                onMoveLayerOrder={onMoveLayerOrder}
                onToggleLayerLock={onToggleLayerLock}
                onOpenLayerCrop={onOpenLayerCrop}
                onFillShape={onFillShape}
                onCanvasDrop={onCanvasDrop}
                showGuides={editorView.showGuides}
                showPageGrid={editorView.showPageGrid}
                showSafeZone={editorView.showSafeZone}
                gridSize={editorView.gridSize || 20}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

export default VideoCanvas
