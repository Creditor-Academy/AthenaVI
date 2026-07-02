import { useEffect, useMemo, useState } from 'react'
import './RenderDownloadModal.css'

function ensureMp4(name) {
  const base = String(name || 'video.mp4')
  return base.toLowerCase().endsWith('.mp4') ? base : `${base}.mp4`
}

export default function RenderDownloadModal({ isOpen, onClose }) {
  const [info, setInfo] = useState(null)

  useEffect(() => {
    if (!isOpen) return
    try {
      const raw = window.sessionStorage.getItem('athenavi:lastDownload')
      setInfo(raw ? JSON.parse(raw) : null)
    } catch {
      setInfo(null)
    }
  }, [isOpen])

  const filename = useMemo(() => ensureMp4(info?.filename), [info?.filename])

  const handleDownload = () => {
    if (!info?.url) return
    const link = document.createElement('a')
    link.href = info.url
    link.download = filename
    link.target = '_self'
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  if (!isOpen) return null

  return (
    <div
      className="render-download-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div className="render-download-modal">
        <div className="render-download-modal__header">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div className="render-download-modal__title">Export ready</div>
            <div className="render-download-modal__filename">{filename}</div>
          </div>

          <div className="render-download-modal__actions">
            <button type="button" className="render-download-modal__btn" onClick={onClose}>
              Close
            </button>
            <button
              type="button"
              className="render-download-modal__btn render-download-modal__btn--primary"
              onClick={handleDownload}
              disabled={!info?.url}
            >
              Download MP4
            </button>
          </div>
        </div>

        <div className="render-download-modal__video-wrap">
          {info?.url ? (
            <video
              src={info.url}
              controls
              playsInline
              autoPlay
              className="render-download-modal__video"
            />
          ) : (
            <div className="render-download-modal__empty">
              No download URL found. Please export again.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
