import { useRef, useEffect, useState, useCallback } from 'react'
import { Player } from '@remotion/player'
import { MdClose, MdPlayCircleOutline, MdMovie } from 'react-icons/md'
import VideoComposition from './VideoComposition'
import heygenService from '../../../../services/heygenService'
import {
  preloadSceneHeygenVideos,
  resolveScenePlaybackUrls,
} from '../../../../utils/heygenVideo'
import './PreviewModal.css'

const PreviewModal = ({
  showPreviewModal,
  setShowPreviewModal,
  scenes,
  activeSceneId,
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
        const withUrls = await resolveScenePlaybackUrls(
          scenes,
          workspaceId,
          projectId,
          heygenService
        )
        if (cancelled) return

        const heygenCount = withUrls.filter((s) => s.heygenVideoId).length
        if (heygenCount > 0) {
          await preloadSceneHeygenVideos(withUrls, ({ done, total, label }) => {
            if (cancelled) return
            setLoadLabel(label)
            setLoadProgress(total > 0 ? Math.round((done / total) * 100) : 100)
          })
        } else {
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
        console.error('[Preview] Prepare failed:', err)
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

  if (!showPreviewModal) return null

  const previewScenes = resolvedScenes ?? scenes
  const hasHeygenInProject = previewScenes.some((s) => s.heygenVideoId)
  const showOverlay = isLoading || !playerReady
  const progressPct = Math.min(100, Math.max(0, loadProgress))

  return (
    <div className="preview-modal" role="dialog" aria-modal="true" aria-label="Video preview">
      <header className="preview-modal__topbar">
        <div className="preview-modal__brand">
          <div className="preview-modal__logo" aria-hidden>
            <MdMovie size={20} />
          </div>
          <div>
            <h1 className="preview-modal__title">Preview</h1>
            <p className="preview-modal__meta">
              {scenes.length} scene{scenes.length === 1 ? '' : 's'}
              {bgMusic ? ' · Background music on' : ''}
            </p>
          </div>
        </div>

        {previewSceneLabel && playerReady && !isLoading ? (
          <div className="preview-modal__scene-pill" title={previewSceneLabel}>
            <span className="preview-modal__scene-pill-dot" aria-hidden />
            {previewSceneLabel}
          </div>
        ) : null}

        <div className="preview-modal__actions">
          <button type="button" className="preview-modal__exit" onClick={closePreview}>
            <MdClose size={18} />
            Exit
          </button>
        </div>
      </header>

      <div className="preview-modal__body">
        <div className="preview-modal__stage">
          {showOverlay && (
            <div className="preview-modal__overlay">
              <div className="preview-modal__spinner" aria-hidden />
              <p className="preview-modal__load-title">{loadLabel}</p>
              <p className="preview-modal__load-sub">
                Avatar videos are cached so playback stays in sync with your scene. Layers at 0:00
                appear together when the scene starts.
              </p>
              {progressPct > 0 && progressPct < 100 ? (
                <div className="preview-modal__progress" aria-hidden>
                  <div
                    className="preview-modal__progress-bar"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              ) : null}
            </div>
          )}

          {playerReady && (
            <div className="preview-modal__player-shell">
              <Player
                key={`preview-${previewScenes.map((s) => s.playbackUrl || s.generatedVideoUrl || s.id).join('|')}`}
                ref={playerRef}
                className="preview-modal__player"
                component={VideoComposition}
                durationInFrames={Math.max(totalDurationInFrames, 30)}
                compositionWidth={1920}
                compositionHeight={1080}
                fps={30}
                controls
                autoPlay
                inputProps={{
                  scenes: previewScenes,
                  bgMusic,
                  bgMusicVolume,
                }}
                onPlay={() => {
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
        <p className="preview-modal__footer-hint">
          <MdPlayCircleOutline size={13} style={{ verticalAlign: -2, marginRight: 4 }} />
          Voice plays from your generated avatar video
        </p>
      )}
    </div>
  )
}

export default PreviewModal
