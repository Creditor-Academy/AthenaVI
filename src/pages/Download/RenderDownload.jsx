import { useEffect, useMemo, useState } from 'react'

function safeDecode(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export default function RenderDownload({ onBack }) {
  const [error, setError] = useState('')
  const [info, setInfo] = useState(null)

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem('athenavi:lastDownload')
      const parsed = raw ? JSON.parse(raw) : null
      if (parsed?.url) {
        setInfo(parsed)
        return
      }
    } catch {
      // ignore
    }

    const params = new URLSearchParams(window.location.search || '')
    const url = params.get('url')
    const filename = params.get('filename')
    if (url) {
      setInfo({ url: safeDecode(url), filename: filename ? safeDecode(filename) : 'video.mp4' })
      return
    }

    setError('No download found. Export again from the editor.')
  }, [])

  const filename = useMemo(() => {
    const name = info?.filename || 'video.mp4'
    return name.toLowerCase().endsWith('.mp4') ? name : `${name}.mp4`
  }, [info?.filename])

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

  return (
    <div style={{ minHeight: '100vh', background: '#0b1220', color: '#e5e7eb' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(11,18,32,0.9)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 800, fontSize: 14 }}>Render preview</div>
          <div style={{ fontSize: 12, color: 'rgba(229,231,235,0.75)' }}>{filename}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={onBack}
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
            Back to editor
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

      <div style={{ padding: 18, display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 'min(1100px, 96vw)' }}>
          {error ? (
            <div style={{
              padding: 14,
              borderRadius: 12,
              border: '1px solid rgba(239,68,68,0.35)',
              background: 'rgba(239,68,68,0.08)',
              color: '#fecaca',
              fontWeight: 600,
              fontSize: 13,
            }}>
              {error}
            </div>
          ) : (
            <video
              src={info?.url || ''}
              controls
              playsInline
              style={{
                width: '100%',
                maxHeight: '76vh',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.10)',
                background: '#000',
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

