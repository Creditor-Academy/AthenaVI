import { useEffect, useMemo, useState } from 'react'

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
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2600,
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div
        style={{
          width: 'min(1100px, 96vw)',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(2, 6, 23, 0.92)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
          color: '#e5e7eb',
          overflow: 'hidden',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontWeight: 900, fontSize: 13 }}>Export ready</div>
            <div style={{ fontSize: 12, color: 'rgba(226,232,240,0.8)' }}>{filename}</div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.06)',
                color: '#e5e7eb',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={!info?.url}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid rgba(59,130,246,0.35)',
                background: info?.url ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'rgba(255,255,255,0.10)',
                color: '#fff',
                cursor: info?.url ? 'pointer' : 'not-allowed',
                fontWeight: 800,
                fontSize: 12,
              }}
            >
              Download MP4
            </button>
          </div>
        </div>

        <div style={{ padding: 14, background: '#000' }}>
          {info?.url ? (
            <video
              src={info.url}
              controls
              playsInline
              autoPlay
              style={{
                width: '100%',
                maxHeight: '76vh',
                borderRadius: 12,
                background: '#000',
              }}
            />
          ) : (
            <div style={{ padding: 16, color: 'rgba(226,232,240,0.85)', fontWeight: 600 }}>
              No download found. Export again.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

