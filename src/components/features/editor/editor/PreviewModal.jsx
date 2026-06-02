import { useRef, useEffect, useState } from 'react'
import { Player } from '@remotion/player'
import VideoComposition from './VideoComposition'
import heygenService from '../../../../services/heygenService'
import { resolveScenePlaybackUrls } from '../../../../utils/heygenVideo'

const PreviewModal = ({ 
  showPreviewModal, 
  setShowPreviewModal, 
  scenes, 
  activeSceneId, 
  totalDurationInFrames, 
  bgMusic, 
  bgMusicVolume, 
  setIsPlaying, 
  speakText, 
  getSceneForFrame, 
  setActiveSceneId,
  workspaceId,
  projectId,
}) => {
  const playerRef = useRef(null)
  const [resolvedScenes, setResolvedScenes] = useState(null)
  const [isResolving, setIsResolving] = useState(false)

  useEffect(() => {
    if (!showPreviewModal) {
      setResolvedScenes(null)
      return
    }

    let cancelled = false

    const resolve = async () => {
      setIsResolving(true)
      try {
        const withUrls = await resolveScenePlaybackUrls(
          scenes,
          workspaceId,
          projectId,
          heygenService
        )
        if (!cancelled) setResolvedScenes(withUrls)
      } catch (err) {
        console.error('[Preview] Failed to resolve HeyGen playback URLs:', err)
        if (!cancelled) setResolvedScenes(scenes)
      } finally {
        if (!cancelled) setIsResolving(false)
      }
    }

    resolve()
    return () => { cancelled = true }
  }, [showPreviewModal, scenes, workspaceId, projectId])

  if (!showPreviewModal) return null

  const previewScenes = resolvedScenes ?? scenes

  return (
    <div className="fullscreen-preview-page">
      <style>{`
        .fullscreen-preview-page {
          position: fixed;
          inset: 0;
          background: #f8f9fa;
          z-index: 2000;
          display: flex;
          flex-direction: column;
          color: #202124;
        }
        .preview-topbar {
          height: 60px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(10px);
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          border-bottom: 1px solid #e8eaed;
          box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
        }
        .preview-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
        }
        .close-preview {
          background: #1a73e8;
          border: none;
          color: #ffffff;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .close-preview:hover {
          background: #1557b0;
        }
        .preview-loading {
          color: #5f6368;
          font-size: 15px;
          font-weight: 500;
        }
      `}</style>
      <div className="preview-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 700, fontSize: '18px' }}>AthenaVI Preview</span>
          <span style={{ color: '#5f6368', fontSize: '14px' }}>Draft - {scenes.length} Scenes</span>
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
        {isResolving ? (
          <p className="preview-loading">Loading HeyGen videos…</p>
        ) : (
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
              scenes: previewScenes,
              bgMusic: bgMusic,
              bgMusicVolume: bgMusicVolume
            }}
            onPlay={() => {
              setIsPlaying(true)
              const currentScene = previewScenes.find(s => s.id === activeSceneId)
              if (currentScene?.script) {
                speakText(currentScene.script, activeSceneId)
              }
            }}
            onPause={() => {
              setIsPlaying(false)
              window.speechSynthesis.pause()
            }}
            onSeek={(frame) => {
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
        )}
      </div>
    </div>
  )
}

export default PreviewModal
