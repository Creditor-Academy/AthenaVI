import { useRef, useEffect, useState, useCallback } from 'react'
import { Player } from '@remotion/player'
import { MdClose, MdPlayCircleOutline, MdMovie } from 'react-icons/md'
import VideoComposition from './VideoComposition'
import heygenService from '../../../../services/heygenService'
import {
  prepareScenesForPlayback,
  unmuteRemotionPlayer,
} from '../../../../utils/heygenVideo'
import './PreviewModal.css'

const PreviewModal = ({
  showPreviewModal,
  setShowPreviewModal,
  scenes,
  totalDurationInFrames,
  bgMusic,
  bgMusicVolume,
  setIsPlaying,
  getSceneForFrame,
  setActiveSceneId,
  workspaceId,
  projectId,
}) => {
  const playerRef = useRef(null)
  const playbackStartedRef = useRef(false)
  const [resolvedScenes, setResolvedScenes] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadLabel, setLoadLabel] = useState('Preparing preview…')
  const [loadProgress, setLoadProgress] = useState(0)
  const [previewSceneLabel, setPreviewSceneLabel] = useState('')
  const [playerReady, setPlayerReady] = useState(false)

  const closePreview = useCallback(() => {
    setShowPreviewModal(false)
    setIsPlaying(false)
    setPlayerReady(false)
    playerRef.current?.pause()
    window.speechSynthesis?.cancel()
  }, [setShowPreviewModal, setIsPlaying])

  useEffect(() => {
    if (!showPreviewModal) {
      playbackStartedRef.current = false
      setResolvedScenes(null)
      setIsLoading(false)
      setLoadProgress(0)
      setPlayerReady(false)
      return undefined
    }

    window.speechSynthesis?.cancel()

    let cancelled = false

    const prepare = async () => {
      setIsLoading(true)
      setPlayerReady(false)
      setLoadProgress(0)
      setLoadLabel('Connecting to project…')

      try {
        setLoadLabel('Refreshing avatar videos…')
        const withUrls = await prepareScenesForPlayback(
          scenes,
          workspaceId,
          projectId,
          heygenService,
          ({ done, total, label }) => {
            if (cancelled) return
            setLoadLabel(label)
            setLoadProgress(total > 0 ? Math.round((done / total) * 100) : 100)
          }
        )
        if (cancelled) return
        if (!withUrls.some((s) => s.heygenVideoId)) {
          setLoadProgress(100)
          setLoadLabel('Almost ready…')
        }

        if (cancelled) return
        setResolvedScenes(withUrls)
        setLoadLabel('Starting playback…')
        setLoadProgress(100)
        await new Promise((r) => setTimeout(r, 200))
        if (!cancelled) setPlayerReady(true)
      } catch (err) {
        console.error('[Preview] Failed to resolve HeyGen playback URLs:', err)
        if (!cancelled) {
          setResolvedScenes(scenes)
          setPlayerReady(true)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    prepare()
    return () => {
      cancelled = true
    }
  }, [showPreviewModal, scenes, workspaceId, projectId])

  useEffect(() => {
    if (!showPreviewModal) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') closePreview()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showPreviewModal, closePreview])

  const syncSceneFromFrame = useCallback(
    (frame) => {
      const { scene } = getSceneForFrame(frame)
      if (!scene) return
      setActiveSceneId(scene.id)
      setPreviewSceneLabel(scene.title || scene.name || 'Scene')
    },
    [getSceneForFrame, setActiveSceneId]
  )

  const startPlaybackWithSound = useCallback(() => {
    const player = playerRef.current
    if (!player) return
    unmuteRemotionPlayer(player)
    const playResult = player.play()
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (!playerReady || isLoading || playbackStartedRef.current) return undefined
    playbackStartedRef.current = true
    const timer = setTimeout(startPlaybackWithSound, 150)
    return () => clearTimeout(timer)
  }, [playerReady, isLoading, startPlaybackWithSound])

  if (!showPreviewModal) return null

  const previewScenes = resolvedScenes ?? scenes
  const hasHeygenInProject = previewScenes.some((s) => s.heygenVideoId)
  const showOverlay = isLoading || !playerReady
  const progressPct = Math.min(100, Math.max(0, loadProgress))

  return (
    <div className="video-preview" role="dialog" aria-modal="true" aria-label="Video preview">
      <header className="video-preview__topbar">
        <div className="video-preview__brand">
          <div className="video-preview__logo" aria-hidden>
            <MdMovie size={20} />
          </div>
          <div>
            <h1 className="video-preview__title">Preview</h1>
            <p className="video-preview__meta">
              {scenes.length} scene{scenes.length === 1 ? '' : 's'}
              {bgMusic ? ' · Background music on' : ''}
            </p>
          </div>
        </div>

        {previewSceneLabel && playerReady && !isLoading ? (
          <div className="video-preview__scene-pill" title={previewSceneLabel}>
            <span className="video-preview__scene-pill-dot" aria-hidden />
            {previewSceneLabel}
          </div>
        ) : null}

        <div className="video-preview__actions">
          <button type="button" className="video-preview__exit" onClick={closePreview}>
            <MdClose size={18} />
            Exit
          </button>
        </div>
      </header>

      <div className="video-preview__body">
        <div className="video-preview__stage">
          {showOverlay && (
            <div className="video-preview__overlay">
              <div className="video-preview__spinner" aria-hidden />
              <p className="video-preview__load-title">{loadLabel}</p>
              <p className="video-preview__load-sub">
                Avatar videos are cached so playback stays in sync with your scene. Layers at 0:00
                appear together when the scene starts.
              </p>
              {progressPct > 0 && progressPct < 100 ? (
                <div className="video-preview__progress" aria-hidden>
                  <div
                    className="video-preview__progress-bar"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              ) : null}
            </div>
          )}

          {playerReady && (
            <div className="video-preview__player-shell">
              <Player
                key={`preview-${previewScenes.map((s) => s.playbackUrl || s.generatedVideoUrl || s.id).join('|')}`}
                ref={playerRef}
                className="video-preview__player"
                component={VideoComposition}
                durationInFrames={Math.max(totalDurationInFrames, 30)}
                compositionWidth={1920}
                compositionHeight={1080}
                fps={30}
                controls
                showVolumeControls
                numberOfSharedAudioTags={12}
                showOutlines={false}
                autoPlay={false}
                inputProps={{
                  scenes: previewScenes,
                  bgMusic,
                  bgMusicVolume,
                }}
                onPlay={() => {
                  unmuteRemotionPlayer(playerRef.current)
                  setIsPlaying(true)
                  window.speechSynthesis?.cancel()
                }}
                onPause={() => {
                  setIsPlaying(false)
                  window.speechSynthesis?.cancel()
                }}
                onSeek={(frame) => syncSceneFromFrame(frame)}
                onFrameUpdate={(frame) => syncSceneFromFrame(frame)}
              />
            </div>
          )}
        </div>
      </div>

      {playerReady && !isLoading && hasHeygenInProject && (
        <p className="video-preview__footer-hint">
          <MdPlayCircleOutline size={13} style={{ verticalAlign: -2, marginRight: 4 }} />
          Voice plays from your generated avatar video — use the player play button if audio is muted
        </p>
      )}
    </div>
  )
}

export default PreviewModal
