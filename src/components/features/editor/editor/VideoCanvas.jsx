import { useRef, useCallback, forwardRef, useImperativeHandle, useEffect, useState } from 'react'
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
  onAddScene,
  updateClipContent,
  onFillShape,
  onCanvasDrop,
  editorView = {},
  workspaceId,
  projectId,
}, ref) => {
  const remotionPlayerRef = useRef(null)
  const [playbackReadyScenes, setPlaybackReadyScenes] = useState(null)
  const [isPreparingPlayback, setIsPreparingPlayback] = useState(false)

  const isSingleScene = timelineScope === 'single' && playbackScenes?.length === 1
  const durationInFrames = Math.max(playbackDurationInFrames ?? totalDurationInFrames, 1)
  const baseCompositionScenes = playbackScenes?.length ? playbackScenes : scenes
  const compositionScenes = playbackReadyScenes ?? baseCompositionScenes
  const showRemotionPlayer = isPlaying || isPreparingPlayback

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
    if (isSingleScene) {
      const sceneEnd = playbackStartTime + durationInFrames / 30
      if (currentTime < playbackStartTime || currentTime >= sceneEnd - 0.05) {
        setCurrentTime(playbackStartTime)
        node.seekTo(0)
      }
    } else {
      node.seekTo(toLocalFrame(currentTime))
    }
    unmuteRemotionPlayer(node)
    const result = node.play()
    if (result && typeof result.catch === 'function') {
      result.catch(() => {})
    }
  }, [isSingleScene, playbackStartTime, durationInFrames, currentTime, setCurrentTime, toLocalFrame])

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
    if (!isPlaying) {
      setPlaybackReadyScenes(null)
      setIsPreparingPlayback(false)
      return undefined
    }

    window.speechSynthesis?.cancel()

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
        if (!cancelled) {
          setPlaybackReadyScenes(withUrls)
          setIsPreparingPlayback(false)
        }
      })
      .catch((err) => {
        console.warn('[VideoCanvas] Playback prepare failed:', err)
        if (!cancelled) {
          setPlaybackReadyScenes(baseCompositionScenes)
          setIsPreparingPlayback(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [isPlaying, baseCompositionScenes, workspaceId, projectId])

  useEffect(() => {
    if (!isPlaying || isPreparingPlayback) return undefined
    const timer = setTimeout(startRemotionPlayback, 50)
    return () => clearTimeout(timer)
  }, [isPlaying, isPreparingPlayback, playbackReadyScenes, startRemotionPlayback])

  useEffect(() => {
    if (showRemotionPlayer || !remotionPlayerRef.current) return
    remotionPlayerRef.current.seekTo(toLocalFrame(currentTime))
  }, [currentTime, showRemotionPlayer, toLocalFrame])

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
            inputProps={{
              scenes: compositionScenes,
              bgMusic: isSingleScene ? null : bgMusic,
              bgMusicVolume: bgMusicVolume,
              onAddScene: onAddScene,
            }}
            showOutlines={false}
            showVolumeControls={false}
            numberOfSharedAudioTags={12}
            autoPlay={false}
            onPlay={() => setIsPlaying(true)}
            onPause={() => {
              setIsPlaying(false)
              window.speechSynthesis?.cancel()
            }}
            onFrameUpdate={(frame) => {
              if (!isPlaying) return

              if (isSingleScene) {
                const globalTime = playbackStartTime + frame / 30
                setCurrentTime(globalTime)
                if (frame >= durationInFrames - 1) {
                  remotionPlayerRef.current?.pause()
                  setIsPlaying(false)
                }
                return
              }

              const time = frame / 30
              setCurrentTime(time)
              const { scene } = getSceneForFrame(frame)
              if (scene && scene.id !== activeSceneId) {
                setActiveSceneId(scene.id)
                window.speechSynthesis?.cancel()
                if (scene.script && !sceneHasHeygenPlayback(scene) && speakText) {
                  speakText(scene.script, scene.id)
                }
              }
            }}
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
                onFillShape={onFillShape}
                onCanvasDrop={onCanvasDrop}
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
