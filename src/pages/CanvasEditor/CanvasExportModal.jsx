import { useLayoutEffect, useRef, useState } from 'react'
import { useCanvasDialogFocus } from './canvasDialogFocus'
import { FiDownload, FiCheck, FiX } from 'react-icons/fi'
import CanvasExportFrame from './CanvasExportFrame'
import {
  EXPORT_FORMATS,
  EXPORT_SCALES,
  buildDesignPdf,
  describeExportError,
  exportFileName,
  imageLabelsOnPage,
  pagesForExport,
  slugTitle,
  zipStoredFiles,
} from './canvasExport'
import { assertPageIsExportable, captureExportNode } from './canvasExportCapture'
import './CanvasEditor.css'

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error || new Error('Could not read the exported page.'))
    reader.readAsDataURL(blob)
  })
}

/**
 * Page number field with always-visible − / + buttons. The value is clamped to [min, max] so
 * what the field shows is always exactly the page that will be exported; typing is allowed
 * and settles to the nearest valid page on blur / Enter.
 */
function PageStepper({ label, value, min, max, onChange }) {
  const [draft, setDraft] = useState(null)
  const commit = (raw) => {
    const n = Math.round(Number(raw))
    onChange(Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : value)
    setDraft(null)
  }
  return (
    <div className="canvas-export-stepper" role="group" aria-label={`${label} page`}>
      <span className="canvas-export-stepper-label">{label}</span>
      <button
        type="button"
        className="canvas-export-stepper-btn"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`${label} page: previous`}
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        className="canvas-export-stepper-input"
        value={draft ?? String(value)}
        aria-label={`${label} page`}
        onChange={(event) => setDraft(event.target.value.replace(/[^0-9]/g, ''))}
        onBlur={(event) => commit(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            commit(event.currentTarget.value)
          } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            onChange(Math.min(max, value + 1))
            setDraft(null)
          } else if (event.key === 'ArrowDown') {
            event.preventDefault()
            onChange(Math.max(min, value - 1))
            setDraft(null)
          }
        }}
      />
      <button
        type="button"
        className="canvas-export-stepper-btn"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`${label} page: next`}
      >
        +
      </button>
    </div>
  )
}

function pageBackground(page) {
  const background = page?.background
  if (background && typeof background === 'object') return '#ffffff'
  return background || '#ffffff'
}

export default function CanvasExportModal({
  canvas,
  canvases,
  activeIndex = 0,
  title = 'Untitled Design',
  onClose,
}) {
  const pages = Array.isArray(canvases) && canvases.length ? canvases : canvas ? [canvas] : []
  const [format, setFormat] = useState('png')
  const [scale, setScale] = useState(2)
  const [scope, setScope] = useState('current')
  const [rangeStart, setRangeStart] = useState(1)
  const [rangeEnd, setRangeEnd] = useState(pages.length || 1)
  const [transparentBg, setTransparentBg] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const [error, setError] = useState('')
  const [capturePage, setCapturePage] = useState(null)
  const frameRef = useRef(null)
  const pendingFrame = useRef(null)
  const dialogRef = useRef(null)
  useCanvasDialogFocus(dialogRef, { onEscape: isExporting ? undefined : onClose })

  useLayoutEffect(() => {
    if (!capturePage || !frameRef.current || !pendingFrame.current) return
    const resolve = pendingFrame.current
    pendingFrame.current = null
    resolve(frameRef.current)
  }, [capturePage])

  const allowTransparent = format === 'png' || format === 'webp'
  const selectedFormat = EXPORT_FORMATS.find((item) => item.id === format) || EXPORT_FORMATS[0]

  const waitForFrame = (page) =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pendingFrame.current = null
        reject(new Error('The page did not render for export.'))
      }, 4000)
      pendingFrame.current = (node) => {
        clearTimeout(timer)
        resolve(node)
      }
      setCapturePage(page)
    })

  const handleExport = async () => {
    setError('')
    const selection = pagesForExport(pages, { scope, activeIndex, rangeStart, rangeEnd })
    if (selection.error) {
      setError(selection.error)
      return
    }

    setIsExporting(true)
    let lastPage = null
    try {
      const rasterFormat = format === 'pdf' ? 'png' : format
      const rasterScale = format === 'pdf' ? 1 : scale
      const captured = []

      for (let index = 0; index < selection.pages.length; index += 1) {
        const page = selection.pages[index]
        lastPage = page
        const node = await waitForFrame(page)
        await assertPageIsExportable(page)
        const blob = await captureExportNode(node, {
          format: rasterFormat,
          scale: rasterScale,
          background: pageBackground(page),
          transparent: allowTransparent && transparentBg,
        })
        captured.push({ page, blob, number: pages.indexOf(page) + 1 })
      }

      if (format === 'pdf') {
        const pdfPages = []
        for (const item of captured) {
          pdfPages.push({
            width: item.page.width,
            height: item.page.height,
            dataUrl: await blobToDataUrl(item.blob),
          })
        }
        const pdf = await buildDesignPdf(pdfPages)
        downloadBlob(pdf, exportFileName(title, { ext: '.pdf' }))
      } else if (captured.length === 1) {
        const item = captured[0]
        downloadBlob(
          item.blob,
          exportFileName(title, {
            ext: selectedFormat.ext,
            width: item.page.width,
            height: item.page.height,
          })
        )
      } else {
        const files = await Promise.all(
          captured.map(async (item) => ({
            name: exportFileName(title, {
              ext: selectedFormat.ext,
              width: item.page.width,
              height: item.page.height,
              pageNumber: item.number,
              pageCount: captured.length,
            }),
            bytes: new Uint8Array(await item.blob.arrayBuffer()),
          }))
        )
        const zip = zipStoredFiles(files)
        downloadBlob(new Blob([zip], { type: 'application/zip' }), `${slugTitle(title)}.zip`)
      }

      setDownloadSuccess(true)
      setTimeout(() => {
        setDownloadSuccess(false)
        onClose()
      }, 1200)
    } catch (err) {
      setError(describeExportError(err, imageLabelsOnPage(lastPage)))
    } finally {
      setCapturePage(null)
      setIsExporting(false)
    }
  }

  return (
    <div className="canvas-size-modal-backdrop" onClick={isExporting ? undefined : onClose}>
      <div ref={dialogRef} className="canvas-export-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="canvas-export-title">
        <header className="canvas-export-header">
          <div>
            <p className="canvas-editor-kicker">Export design</p>
            <h2 id="canvas-export-title">Download your canvas</h2>
          </div>
          <button type="button" className="canvas-size-close" onClick={onClose} aria-label="Close" disabled={isExporting}><FiX /></button>
        </header>

        <div className="canvas-export-body">
          <div className="canvas-export-section">
            <label className="canvas-export-label">File format</label>
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
            <label className="canvas-export-label">Pages</label>
            <div className="canvas-export-scale-pills">
              {[
                { id: 'current', label: 'This page' },
                { id: 'all', label: 'All pages' },
                { id: 'range', label: 'Range' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`canvas-export-scale-btn ${scope === item.id ? 'is-selected' : ''}`}
                  onClick={() => setScope(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            {scope === 'range' && (
              <div className="canvas-export-range">
                <PageStepper
                  label="From"
                  value={rangeStart}
                  min={1}
                  max={rangeEnd}
                  onChange={setRangeStart}
                />
                <PageStepper
                  label="To"
                  value={rangeEnd}
                  min={rangeStart}
                  max={pages.length}
                  onChange={setRangeEnd}
                />
                <span className="canvas-export-range-summary" aria-live="polite">
                  {rangeStart === rangeEnd
                    ? `Page ${rangeStart} of ${pages.length}`
                    : `Pages ${rangeStart}–${rangeEnd} of ${pages.length} (${rangeEnd - rangeStart + 1} pages)`}
                </span>
              </div>
            )}
          </div>

          {format === 'pdf' ? (
            <p className="canvas-export-note">PDF uses each page’s pixel size. Resolution scale applies to images only.</p>
          ) : (
            <div className="canvas-export-section">
              <label className="canvas-export-label">Resolution scale</label>
              <div className="canvas-export-scale-pills">
                {EXPORT_SCALES.map((multiplier) => (
                  <button
                    type="button"
                    key={multiplier}
                    className={`canvas-export-scale-btn ${scale === multiplier ? 'is-selected' : ''}`}
                    onClick={() => setScale(multiplier)}
                  >
                    {multiplier}×
                  </button>
                ))}
              </div>
            </div>
          )}

          {allowTransparent && (
            <div className="canvas-export-section">
              <label className="canvas-export-checkbox-label">
                <input
                  type="checkbox"
                  checked={transparentBg}
                  onChange={(event) => setTransparentBg(event.target.checked)}
                />
                <span>Transparent background</span>
              </label>
            </div>
          )}

          {scope !== 'current' && format !== 'pdf' && (
            <p className="canvas-export-note">Several pages download as one .zip.</p>
          )}

          {error && (
            <p className="canvas-export-error" role="alert">{error}</p>
          )}
        </div>

        <footer className="canvas-export-footer">
          <button type="button" className="canvas-size-cancel" onClick={onClose} disabled={isExporting}>Cancel</button>
          <button
            type="button"
            className="canvas-size-create"
            onClick={handleExport}
            disabled={isExporting || !pages.length}
          >
            {downloadSuccess ? (
              <><FiCheck /> Exported</>
            ) : isExporting ? (
              'Exporting...'
            ) : (
              <><FiDownload /> Download design</>
            )}
          </button>
        </footer>
      </div>
      <CanvasExportFrame
        page={capturePage}
        transparent={allowTransparent && transparentBg}
        frameRef={frameRef}
      />
    </div>
  )
}
