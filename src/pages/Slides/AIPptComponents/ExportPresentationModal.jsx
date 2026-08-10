import { useCallback, useEffect, useState } from 'react'
import {
  FiDownload,
  FiFile,
  FiFileText,
  FiImage,
  FiLoader,
  FiX,
  FiCheckCircle,
} from 'react-icons/fi'
import presentationService from '../../../services/presentationService'
import { isInsufficientCreditsError } from '../../../services/creditsService'
import { PPT_EXPORT_FORMATS } from '../../../utils/presentationHelpers'
import './pptPanelUi.css'

const EXPORT_META = {
  PPTX: {
    label: 'PowerPoint',
    desc: 'Editable .pptx file for Microsoft PowerPoint or Google Slides',
    Icon: FiFile,
  },
  PDF: {
    label: 'PDF',
    desc: 'Print-ready document, best for sharing or printing',
    Icon: FiFileText,
  },
  PNG: {
    label: 'PNG slides',
    desc: 'High-quality image export per slide',
    Icon: FiImage,
  },
  JPEG: {
    label: 'JPEG slides',
    desc: 'Smaller image export, good for web and email',
    Icon: FiImage,
  },
}

export default function ExportPresentationModal({
  workspaceId,
  presentationId,
  title = 'Presentation',
  onClose,
}) {
  const [selected, setSelected] = useState('PDF')
  const [phase, setPhase] = useState('pick')
  const [statusText, setStatusText] = useState('')
  const [error, setError] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && phase !== 'working') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, phase])

  const runExport = useCallback(async () => {
    if (!workspaceId || !presentationId) {
      setError('Save the presentation before exporting.')
      return
    }
    setPhase('working')
    setError('')
    setDownloadUrl('')
    setStatusText(`Preparing ${selected} export…`)

    try {
      const started = await presentationService.startExport(workspaceId, presentationId, {
        format: selected,
        slideId: null,
      })
      const exportId =
        started?.exportId || started?.id || started?.export?.id || started?._id
      if (!exportId) throw new Error('Export started but no export id was returned')

      const ready = await presentationService.pollExportUntilReady(
        workspaceId,
        presentationId,
        exportId,
        {
          onProgress: (s) => {
            const st = s?.status || s?.exportStatus || 'PROCESSING'
            setStatusText(`${selected} export: ${String(st).toLowerCase()}…`)
          },
        }
      )

      const url = ready?.presignedUrl || ready?.url || ready?.downloadUrl
      if (!url) throw new Error('Export finished but no download link was returned')

      setDownloadUrl(url)
      setStatusText(`${selected} is ready`)
      setPhase('done')
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      setPhase('pick')
      if (isInsufficientCreditsError(err)) {
        setError(err.message || 'Insufficient credits to export')
      } else {
        setError(err.message || 'Export failed. Try again in a moment.')
      }
      setStatusText('')
    }
  }, [workspaceId, presentationId, selected])

  const canExport = Boolean(workspaceId && presentationId)

  return (
    <div
      className="ppt-editor-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && phase !== 'working' && onClose?.()}
    >
      <div className="ppt-editor-modal" role="dialog" aria-label="Export presentation">
        <header className="ppt-editor-modal-head">
          <div className="ppt-editor-modal-head-text">
            <span className="ppt-editor-modal-kicker">Export</span>
            <h3 className="ppt-editor-modal-title">{title}</h3>
          </div>
          <button
            type="button"
            className="ppt-editor-modal-close"
            onClick={onClose}
            disabled={phase === 'working'}
            aria-label="Close"
          >
            <FiX size={18} />
          </button>
        </header>

        <p className="ppt-editor-modal-lead">
          Choose a format. We&apos;ll prepare your deck and open the download when it&apos;s ready.
        </p>

        {error && (
          <div className="ppt-editor-modal-alert ppt-editor-modal-alert--error" role="alert">
            {error}
          </div>
        )}

        {phase === 'done' && (
          <div className="ppt-editor-modal-alert ppt-editor-modal-alert--success" role="status">
            <FiCheckCircle size={16} />
            <span>{statusText}</span>
          </div>
        )}

        <div className="ppt-export-format-grid">
          {PPT_EXPORT_FORMATS.map((fmt) => {
            const meta = EXPORT_META[fmt] || { label: fmt, desc: '', Icon: FiFile }
            const Icon = meta.Icon
            const active = selected === fmt
            return (
              <button
                key={fmt}
                type="button"
                className={`ppt-export-format-card ${active ? 'is-active' : ''}`}
                disabled={phase === 'working' || !canExport}
                onClick={() => setSelected(fmt)}
              >
                <span className="ppt-export-format-icon">
                  <Icon size={18} />
                </span>
                <span className="ppt-export-format-label">{meta.label}</span>
                <span className="ppt-export-format-desc">{meta.desc}</span>
                <span className="ppt-export-format-badge">{fmt}</span>
              </button>
            )
          })}
        </div>

        {!canExport && (
          <p className="ppt-editor-modal-hint">Export requires a saved presentation.</p>
        )}

        {phase === 'working' && (
          <div className="ppt-export-progress">
            <FiLoader className="ppt-export-spinner" size={18} />
            <span>{statusText}</span>
          </div>
        )}

        <footer className="ppt-editor-modal-foot">
          <button
            type="button"
            className="ppt-editor-modal-btn ppt-editor-modal-btn--ghost"
            onClick={onClose}
            disabled={phase === 'working'}
          >
            Cancel
          </button>
          {phase === 'done' && downloadUrl ? (
            <a
              className="ppt-editor-modal-btn ppt-editor-modal-btn--primary"
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiDownload size={16} /> Download again
            </a>
          ) : (
            <button
              type="button"
              className="ppt-editor-modal-btn ppt-editor-modal-btn--primary"
              disabled={!canExport || phase === 'working'}
              onClick={runExport}
            >
              {phase === 'working' ? (
                <>
                  <FiLoader className="ppt-export-spinner" size={16} /> Exporting…
                </>
              ) : (
                <>
                  <FiDownload size={16} /> Export {selected}
                </>
              )}
            </button>
          )}
        </footer>
      </div>
    </div>
  )
}
