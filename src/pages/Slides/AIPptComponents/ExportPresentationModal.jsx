import { useCallback, useEffect, useMemo, useState } from 'react'
import { FiCheck, FiCheckCircle, FiDownload, FiLoader, FiX } from 'react-icons/fi'
import presentationService from '../../../services/presentationService'
import { isInsufficientCreditsError } from '../../../services/creditsService'
import { PPT_EXPORT_FORMATS } from '../../../utils/presentationHelpers'
import './pptPanelUi.css'

const GROUPS = [
  { id: 'file', label: 'File', formats: ['PPTX', 'PDF'] },
  { id: 'images', label: 'Images', formats: ['PNG', 'JPEG'] },
]

const EXPORT_META = {
  PPTX: {
    label: 'PowerPoint',
    ext: 'PPTX',
    desc: 'Keep editing in PowerPoint or Google Slides.',
    detail: 'One editable .pptx with every slide.',
    preview: 'pptx',
    cta: 'Export PPTX',
  },
  PDF: {
    label: 'PDF',
    ext: 'PDF',
    desc: 'Print-ready and easy to share.',
    detail: 'A single document that opens anywhere.',
    preview: 'pdf',
    cta: 'Export PDF',
  },
  PNG: {
    label: 'PNG',
    ext: 'PNG',
    desc: 'Crisp images, one file per slide.',
    detail: 'Best quality for design, print, and slides.',
    preview: 'png',
    cta: 'Export PNG',
  },
  JPEG: {
    label: 'JPEG',
    ext: 'JPEG',
    desc: 'Smaller images for web and email.',
    detail: 'Faster to send, slightly lower quality.',
    preview: 'jpeg',
    cta: 'Export JPEG',
  },
}

function groupForFormat(format) {
  return GROUPS.find((g) => g.formats.includes(format))?.id || 'file'
}

function ExportPreview({ kind }) {
  return (
    <div className={`ppt-export-preview ppt-export-preview--${kind}`} aria-hidden>
      {kind === 'pdf' ? (
        <>
          <span className="ppt-export-sheet ppt-export-sheet--back" />
          <span className="ppt-export-sheet">
            <i />
            <i />
            <i />
          </span>
        </>
      ) : null}
      {kind === 'pptx' ? (
        <span className="ppt-export-deck">
          <span className="ppt-export-deck-bar">
            <b />
            <b />
            <b />
          </span>
          <span className="ppt-export-deck-stage">
            <i />
            <i />
          </span>
        </span>
      ) : null}
      {kind === 'png' || kind === 'jpeg' ? (
        <span className={`ppt-export-photo ${kind === 'jpeg' ? 'is-soft' : ''}`}>
          <span className="ppt-export-photo-sky" />
          <span className="ppt-export-photo-hill" />
        </span>
      ) : null}
    </div>
  )
}

export default function ExportPresentationModal({
  workspaceId,
  presentationId,
  title = 'Presentation',
  onClose,
}) {
  const [selected, setSelected] = useState('PDF')
  const [group, setGroup] = useState('file')
  const [phase, setPhase] = useState('pick')
  const [statusText, setStatusText] = useState('')
  const [error, setError] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')

  const formats = useMemo(() => {
    const allowed = new Set(PPT_EXPORT_FORMATS)
    return (GROUPS.find((g) => g.id === group)?.formats || []).filter((fmt) => allowed.has(fmt))
  }, [group])

  const meta = EXPORT_META[selected] || EXPORT_META.PDF
  const busy = phase === 'working'

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) onClose?.()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, busy])

  const selectGroup = (nextGroup) => {
    if (busy) return
    setGroup(nextGroup)
    const nextFormats = GROUPS.find((g) => g.id === nextGroup)?.formats || []
    if (!nextFormats.includes(selected)) setSelected(nextFormats[0] || 'PDF')
  }

  const runExport = useCallback(async () => {
    if (!workspaceId || !presentationId) {
      setError('Save the presentation before exporting.')
      return
    }
    setPhase('working')
    setError('')
    setDownloadUrl('')
    setStatusText(`Preparing ${selected}…`)

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
            setStatusText(`${selected}: ${String(st).toLowerCase()}…`)
          },
        }
      )

      const url = ready?.presignedUrl || ready?.url || ready?.downloadUrl
      if (!url) throw new Error('Export finished but no download link was returned')

      setDownloadUrl(url)
      setStatusText(`${meta.label} is ready`)
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
  }, [workspaceId, presentationId, selected, meta.label])

  const canExport = Boolean(workspaceId && presentationId)

  return (
    <div
      className="ppt-editor-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && !busy && onClose?.()}
    >
      <div className="ppt-editor-modal ppt-export-modal" role="dialog" aria-labelledby="ppt-export-title">
        <header className="ppt-export-head">
          <div className="ppt-export-head-main">
            <span className="ppt-export-head-icon" aria-hidden>
              <FiDownload size={18} />
            </span>
            <div className="ppt-export-head-text">
              <h3 id="ppt-export-title">Export</h3>
              <p>{title}</p>
            </div>
          </div>
          <button
            type="button"
            className="ppt-editor-modal-close"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
          >
            <FiX size={18} />
          </button>
        </header>

        {error ? (
          <div className="ppt-editor-modal-alert ppt-editor-modal-alert--error" role="alert">
            {error}
          </div>
        ) : null}

        {phase === 'done' ? (
          <div className="ppt-export-done">
            <ExportPreview kind={meta.preview} />
            <div>
              <strong>
                <FiCheckCircle size={16} /> {statusText}
              </strong>
              <p>If the download did not start, use the button below.</p>
            </div>
          </div>
        ) : busy ? (
          <div className="ppt-export-working" role="status">
            <ExportPreview kind={meta.preview} />
            <div>
              <strong>Preparing {meta.label}</strong>
              <p>{statusText}</p>
              <span className="ppt-export-bar" />
            </div>
          </div>
        ) : (
          <div className="ppt-export-body">
            <div className="ppt-export-tabs" role="tablist" aria-label="Export type">
              {GROUPS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={group === item.id}
                  className={`ppt-export-tab ${group === item.id ? 'is-active' : ''}`}
                  disabled={!canExport}
                  onClick={() => selectGroup(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="ppt-export-stage">
              <ExportPreview kind={meta.preview} />
              <div className="ppt-export-stage-copy">
                <span className="ppt-export-stage-kicker">{meta.ext}</span>
                <strong>{meta.label}</strong>
                <p>{meta.detail}</p>
              </div>
            </div>

            <div className="ppt-export-choices" role="listbox" aria-label="Format">
              {formats.map((fmt) => {
                const item = EXPORT_META[fmt]
                const active = selected === fmt
                return (
                  <button
                    key={fmt}
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={`ppt-export-choice ${active ? 'is-active' : ''}`}
                    disabled={!canExport}
                    onClick={() => {
                      setSelected(fmt)
                      setGroup(groupForFormat(fmt))
                    }}
                  >
                    <span className={`ppt-export-radio ${active ? 'is-on' : ''}`} aria-hidden>
                      {active ? <FiCheck size={12} /> : null}
                    </span>
                    <span>
                      <strong>{item.label}</strong>
                      <em>{item.desc}</em>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {!canExport ? (
          <p className="ppt-export-hint">Save this presentation before exporting.</p>
        ) : null}

        <footer className="ppt-export-foot">
          <button
            type="button"
            className="ppt-editor-modal-btn ppt-editor-modal-btn--ghost"
            onClick={onClose}
            disabled={busy}
          >
            {phase === 'done' ? 'Close' : 'Cancel'}
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
              disabled={!canExport || busy}
              onClick={runExport}
            >
              {busy ? (
                <>
                  <FiLoader className="ppt-export-spinner" size={16} /> Exporting…
                </>
              ) : (
                <>
                  <FiDownload size={16} /> {meta.cta}
                </>
              )}
            </button>
          )}
        </footer>
      </div>
    </div>
  )
}
