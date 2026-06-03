import { useRef, useCallback, forwardRef, useImperativeHandle, useEffect, useState } from 'react'
import { Player } from '@remotion/player'
import VideoComposition from './VideoComposition'
import LiveCanvasRenderer from './LiveCanvasRenderer'
import heygenService from '../../../../services/heygenService'
import {
  preloadSceneHeygenVideos,
  resolveScenePlaybackUrls,
  sceneHasHeygenPlayback,
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
  onAddScene,
  updateClipContent,
  editorView = {},
  workspaceId,
  projectId,
}, ref) => {
  const playerRef = useRef(null)
  const [resolvedPlayScenes, setResolvedPlayScenes] = useState(null)

  const isSingleScene = timelineScope === 'single' && playbackScenes?.length === 1
  const durationInFrames = Math.max(playbackDurationInFrames ?? totalDurationInFrames, 1)
  const baseCompositionScenes = playbackScenes?.length ? playbackScenes : scenes
  const compositionScenes = resolvedPlayScenes ?? baseCompositionScenes

  useEffect(() => {
    if (!isPlaying || isSingleScene) {
      setResolvedPlayScenes(null)
      return undefined
    }
    const needsResolve = baseCompositionScenes.some((s) => s.heygenVideoId)
    if (!needsResolve || !workspaceId || !projectId) {
      setResolvedPlayScenes(null)
      return undefined
    }

    let cancelled = false
    resolveScenePlaybackUrls(baseCompositionScenes, workspaceId, projectId, heygenService)
      .then(async (withUrls) => {
        if (cancelled) return
        const heygenCount = withUrls.filter((s) => s.heygenVideoId).length
        if (heygenCount > 0) {
          await preloadSceneHeygenVideos(withUrls)
        }
        if (!cancelled) setResolvedPlayScenes(withUrls)
      })
      .catch((err) => {
        console.warn('[VideoCanvas] HeyGen URL resolve failed:', err)
        if (!cancelled) setResolvedPlayScenes(null)
      })

    return () => {
      cancelled = true
    }
  }, [isPlaying, isSingleScene, baseCompositionScenes, workspaceId, projectId])
  const activeScene = (scenes || []).find(s => s.id === activeSceneId)
  const isEditingLayer = !isPlaying && !!(selectedLayerId || selectedLayerIds.length)

  const toLocalFrame = useCallback((globalTime) => {
    const localTime = isSingleScene
      ? Math.max(0, globalTime - playbackStartTime)
      : globalTime
    return Math.max(0, Math.min(Math.round(localTime * 30), durationInFrames - 1))
  }, [isSingleScene, playbackStartTime, durationInFrames])

  const setPlayerRef = useCallback((node) => {
    playerRef.current = node
    if (node && onPlayerReady) {
      onPlayerReady({
        seekTo: (time) => {
          node.seekTo(toLocalFrame(time))
        },
        getCurrentFrame: () => node.getCurrentFrame(),
        play: () => node.play(),
        pause: () => node.pause(),
      })
    }
  }, [onPlayerReady, toLocalFrame])

  useImperativeHandle(ref, () => ({
    seekTo: (time) => {
      if (playerRef.current) {
        playerRef.current.seekTo(toLocalFrame(time))
      }
    },
    getCurrentFrame: () => (playerRef.current ? playerRef.current.getCurrentFrame() : 0),
    play: () => {
      if (!playerRef.current) return
      if (isSingleScene) {
        const sceneEnd = playbackStartTime + durationInFrames / 30
        if (currentTime < playbackStartTime || currentTime >= sceneEnd - 0.05) {
          setCurrentTime(playbackStartTime)
          playerRef.current.seekTo(0)
        }
      }
      playerRef.current.play()
    },
    pause: () => {
      if (playerRef.current) playerRef.current.pause()
    },
  }))

  useEffect(() => {
    if (isPlaying || !playerRef.current) return
    playerRef.current.seekTo(toLocalFrame(currentTime))
  }, [currentTime, isPlaying, toLocalFrame])

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && setSelectedLayerId) {
      setSelectedLayerId(null)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const dropX = ((e.clientX - rect.left) / rect.width) * 1920
    const dropY = ((e.clientY - rect.top) / rect.height) * 1080

    const layerData = e.dataTransfer.getData('application/json')
    if (layerData) {
      try {
        const data = JSON.parse(layerData)
        window.dispatchEvent(new CustomEvent('canvas-drop', {
          detail: { ...data, x: dropX, y: dropY },
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
          style={{
            position: 'relative',
            '--canvas-zoom': (zoomLevel || 100) / 100,
          }}
        >
          {/* Player is always mounted so playerRef stays valid for play/pause/seek */}
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
              backgroundColor: 'transparent',
              pointerEvents: isPlaying ? 'auto' : 'none',
              zIndex: 10,
              // Hide the Remotion player while editing — LiveCanvasRenderer takes over
              visibility: isPlaying ? 'visible' : 'hidden',
              position: isPlaying ? 'relative' : 'absolute',
              inset: 0,
            }}
            inputProps={{
              scenes: compositionScenes,
              bgMusic: isSingleScene ? null : bgMusic,
              bgMusicVolume: bgMusicVolume,
              onAddScene: onAddScene,
            }}
            showOutlines={false}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onFrameUpdate={(frame) => {
              if (!isPlaying) return

              if (isSingleScene) {
                const globalTime = playbackStartTime + frame / 30
                setCurrentTime(globalTime)
                if (frame >= durationInFrames - 1) {
                  playerRef.current?.pause()
                  setIsPlaying(false)
                }
                return
              }

              const time = frame / 30
              setCurrentTime(time)
              const { scene } = getSceneForFrame(frame)
              if (scene && scene.id !== activeSceneId) {
                setActiveSceneId(scene.id)
                if (scene.script && !sceneHasHeygenPlayback(scene) && speakText) {
                  speakText(scene.script, scene.id)
                }
              }
            }}
          />

          {/* Edit overlay — always visible when not playing; fully interactive */}
          {!isPlaying && (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
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
                showGuides={editorView.showGuides}
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
