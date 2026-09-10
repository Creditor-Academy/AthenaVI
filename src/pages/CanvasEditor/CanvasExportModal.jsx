import { useState } from 'react'
import { FiDownload, FiCheck, FiX } from 'react-icons/fi'
import './CanvasEditor.css'

const EXPORT_FORMATS = [
  { id: 'png', name: 'PNG Image', desc: 'Best for web & graphic design with sharp details', mime: 'image/png', ext: '.png' },
  { id: 'jpeg', name: 'JPEG Image', desc: 'Standard image format with compact file size', mime: 'image/jpeg', ext: '.jpg' },
  { id: 'webp', name: 'WebP Image', desc: 'Modern high-compression web image format', mime: 'image/webp', ext: '.webp' },
  { id: 'svg', name: 'SVG Vector', desc: 'Scalable vector graphic format for print & editing', mime: 'image/svg+xml', ext: '.svg' },
]

export default function CanvasExportModal({ canvas, title = 'Untitled Design', onClose }) {
  const [format, setFormat] = useState('png')
  const [scale, setScale] = useState(2) // 1x, 2x, 4x
  const [transparentBg, setTransparentBg] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const surfaceEl = document.querySelector('.canvas-editor-surface')
      const targetCanvasWidth = (canvas?.width || 1200) * scale
      const targetCanvasHeight = (canvas?.height || 800) * scale

      const exportCanvas = document.createElement('canvas')
      exportCanvas.width = targetCanvasWidth
      exportCanvas.height = targetCanvasHeight
      const ctx = exportCanvas.getContext('2d')

      if (!transparentBg) {
        ctx.fillStyle = canvas?.background || '#FFFFFF'
        ctx.fillRect(0, 0, targetCanvasWidth, targetCanvasHeight)
      } else {
        ctx.clearRect(0, 0, targetCanvasWidth, targetCanvasHeight)
      }

      if (surfaceEl) {
        const selectedFills = surfaceEl.querySelectorAll('.is-selected')
        selectedFills.forEach((el) => el.classList.remove('is-selected'))

        const svgData = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
            <foreignObject width="100%" height="100%">
              <div xmlns="http://www.w3.org/1999/xhtml">
                ${surfaceEl.outerHTML}
              </div>
            </foreignObject>
          </svg>
        `

        const img = new Image()
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(svgBlob)

        await new Promise((resolve) => {
          img.onload = () => {
            ctx.drawImage(img, 0, 0, targetCanvasWidth, targetCanvasHeight)
            URL.revokeObjectURL(url)
            resolve()
          }
          img.onerror = () => {
            URL.revokeObjectURL(url)
            resolve()
          }
          img.src = url
        })
      }

      const selectedFormat = EXPORT_FORMATS.find((f) => f.id === format) || EXPORT_FORMATS[0]
      const mime = selectedFormat.mime
      const filename = `${(title || 'canvas').toLowerCase().replace(/\s+/g, '-')}-${canvas.width}x${canvas.height}${selectedFormat.ext}`

      if (format === 'svg') {
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${targetCanvasWidth}" height="${targetCanvasHeight}" viewBox="0 0 ${canvas.width} ${canvas.height}"><rect width="100%" height="100%" fill="${transparentBg ? 'none' : canvas.background || '#ffffff'}" /></svg>`
        const blob = new Blob([svgString], { type: 'image/svg+xml' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = filename
        link.click()
      } else {
        const dataUrl = exportCanvas.toDataURL(mime, 0.95)
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = filename
        link.click()
      }

      setDownloadSuccess(true)
      setTimeout(() => {
        setDownloadSuccess(false)
        onClose()
      }, 1200)
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="canvas-size-modal-backdrop" onClick={onClose}>
      <div className="canvas-export-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header className="canvas-export-header">
          <div>
            <p className="canvas-editor-kicker">Export design</p>
            <h2>Download your canvas</h2>
          </div>
          <button type="button" className="canvas-size-close" onClick={onClose} aria-label="Close"><FiX /></button>
        </header>

        <div className="canvas-export-body">
          <div className="canvas-export-section">
            <label className="canvas-export-label">File Format</label>
            <div className="canvas-export-format-grid">
              {EXPORT_FORMATS.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`canvas-export-format-card ${format === item.id ? 'is-selected' : ''}`}
                  onClick={() => setFormat(item.id)}
                >
                  <div className="canvas-export-format-head">
                    <strong className="canvas-export-format-name">{item.name}</strong>
                    {format === item.id && <FiCheck className="canvas-export-check" />}
                  </div>
                  <p className="canvas-export-format-desc">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="canvas-export-section">
            <label className="canvas-export-label">Resolution Scale</label>
            <div className="canvas-export-scale-pills">
              {[
                { multiplier: 1, label: '1x (Standard)' },
                { multiplier: 2, label: '2x (High Res HD)' },
                { multiplier: 4, label: '4x (Ultra HD Print)' },
              ].map((s) => (
                <button
                  type="button"
                  key={s.multiplier}
                  className={`canvas-export-scale-btn ${scale === s.multiplier ? 'is-selected' : ''}`}
                  onClick={() => setScale(s.multiplier)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="canvas-export-section">
            <label className="canvas-export-checkbox-label">
              <input
                type="checkbox"
                checked={transparentBg}
                onChange={(e) => setTransparentBg(e.target.checked)}
              />
              <span>Transparent Background (PNG / WebP / SVG)</span>
            </label>
          </div>
        </div>

        <footer className="canvas-export-footer">
          <button type="button" className="canvas-size-cancel" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="canvas-size-create"
            onClick={handleExport}
            disabled={isExporting}
          >
            {downloadSuccess ? (
              <><FiCheck /> Exported Successfully!</>
            ) : isExporting ? (
              'Exporting...'
            ) : (
              <><FiDownload /> Download Design</>
            )}
          </button>
        </footer>
      </div>
    </div>
  )
}
