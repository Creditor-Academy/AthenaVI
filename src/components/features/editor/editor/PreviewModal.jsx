import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { Player } from '@remotion/player'
import { MdClose, MdMovie } from 'react-icons/md'
import VideoComposition from './VideoComposition'
import heygenService from '../../../../services/heygenService'
import {
  prepareScenesForPlayback,
  unmuteRemotionPlayer,
} from '../../../../utils/heygenVideo'
import './PreviewModal.css'

const formatDuration = (totalFrames) => {
  const sec = Math.max(1, Math.round(totalFrames / 30))
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

const PreviewModal = ({
  showPreviewModal,
  setShowPreviewModal,
  projectTitle = 'Untitled project',
  scenes,
  totalDurationInFrames,
  bgMusic,
  bgMusicVolume,
  getSceneForFrame,
  setActiveSceneId,
  workspaceId,
  projectId,
}) => {
  const playerRef = useRef(null)
  const syncRef = useRef({ getSceneForFrame, setActiveSceneId })
  const [resolvedScenes, setResolvedScenes] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadLabel, setLoadLabel] = useState('Preparing preview…')
  const [loadProgress, setLoadProgress] = useState(0)
  const [playerReady, setPlayerReady] = useState(false)
  const [isCompact, setIsCompact] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 640
  )

  syncRef.current = { getSceneForFrame, setActiveSceneId }

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const update = () => setIsCompact(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const closePreview = useCallback(() => {
    if (playerRef.current?.isFullscreen?.()) {
      playerRef.current.exitFullscreen()
    }
    setShowPreviewModal(false)
    setPlayerReady(false)
    playerRef.current?.pause()
    window.speechSynthesis?.cancel()
  }, [setShowPreviewModal])

  useEffect(() => {
    if (!showPreviewModal) {
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
        setLoadLabel('Ready to play')
        setLoadProgress(100)
        await new Promise((r) => setTimeout(r, 150))
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
      if (e.key !== 'Escape') return
      const player = playerRef.current
      if (player?.isFullscreen?.()) {
        player.exitFullscreen()
        return
      }
      closePreview()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showPreviewModal, closePreview])

  const syncSceneFromFrame = useCallback((frame) => {
    const { scene } = syncRef.current.getSceneForFrame(frame)
    if (!scene) return
    syncRef.current.setActiveSceneId(scene.id)
  }, [])

  useEffect(() => {
    const player = playerRef.current
    if (!player || !playerReady || isLoading) return undefined

    const onFrameUpdate = ({ detail: { frame } }) => syncSceneFromFrame(frame)
    const onSeeked = ({ detail: { frame } }) => syncSceneFromFrame(frame)
    const onPlay = () => {
      unmuteRemotionPlayer(player)
      window.speechSynthesis?.cancel()
    }
    const onPause = () => {
      window.speechSynthesis?.cancel()
    }

    player.addEventListener('frameupdate', onFrameUpdate)
    player.addEventListener('seeked', onSeeked)
    player.addEventListener('play', onPlay)
    player.addEventListener('pause', onPause)

    return () => {
      player.removeEventListener('frameupdate', onFrameUpdate)
      player.removeEventListener('seeked', onSeeked)
      player.removeEventListener('play', onPlay)
      player.removeEventListener('pause', onPause)
    }
  }, [playerReady, isLoading, syncSceneFromFrame])

  const previewScenes = resolvedScenes ?? scenes
  const playerInputProps = useMemo(
    () => ({
      scenes: previewScenes,
      bgMusic,
      bgMusicVolume,
    }),
    [previewScenes, bgMusic, bgMusicVolume]
  )

  if (!showPreviewModal) return null

  const showOverlay = isLoading || !playerReady
  const progressPct = Math.min(100, Math.max(0, loadProgress))
  const durationLabel = formatDuration(totalDurationInFrames)

  return (
    <div className="video-preview" role="dialog" aria-modal="true" aria-label="Video preview">
      <header className="video-preview__topbar">
        <div className="video-preview__brand">
          <div className="video-preview__logo" aria-hidden>
            <MdMovie size={20} />
          </div>
          <div className="video-preview__brand-text">
            <h1 className="video-preview__title" title={projectTitle}>
              {projectTitle}
            </h1>
            <p className="video-preview__meta">
              Full preview
              {' · '}
              {scenes.length} scene{scenes.length === 1 ? '' : 's'}
              {' · '}
              {durationLabel}
              {bgMusic ? ' · Music on' : ''}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="video-preview__exit"
          onClick={closePreview}
          aria-label="Close preview"
        >
          <MdClose size={18} aria-hidden />
          <span>Close</span>
        </button>
      </header>

      <main className="video-preview__body">
        <div className="video-preview__player-wrap">
          {showOverlay && (
            <div className="video-preview__overlay">
              <div className="video-preview__spinner" aria-hidden />
              <p className="video-preview__load-title">{loadLabel}</p>
              <p className="video-preview__load-sub">
                Preparing your video with avatar audio and scene layers.
              </p>
              {progressPct > 0 && progressPct < 100 ? (
                <div
                  className="video-preview__progress"
                  role="progressbar"
                  aria-valuenow={progressPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="video-preview__progress-bar"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              ) : null}
            </div>
          )}

          {playerReady && (
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
              allowFullscreen
              clickToPlay
              doubleClickToFullscreen
              spaceKeyToPlayOrPause
              showPlaybackRateControl={
                isCompact ? false : [0.5, 0.75, 1, 1.25, 1.5, 2]
              }
              alwaysShowControls
              style={{ width: '100%', height: '100%', display: 'block' }}
              initiallyMuted={false}
              numberOfSharedAudioTags={12}
              showOutlines={false}
              autoPlay={false}
              inputProps={playerInputProps}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default PreviewModal
