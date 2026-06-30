import { useEffect, useState } from 'react'
import { MdClose, MdCheckCircle, MdErrorOutline, MdFileDownload, MdCloudUpload, MdAccessTime, MdMovieFilter, MdSettings } from 'react-icons/md'

const RESOLUTIONS = [
  { value: '1920x1080', label: '1080p (1920 × 1080)' },
  { value: '1280x720', label: '720p (1280 × 720)' },
  { value: '3840x2160', label: '4K (3840 × 2160)' },
]

const QUALITIES = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

function formatDuration(seconds) {
  const s = Math.max(0, Math.round(seconds || 0))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, '0')}`
}

const ExportModal = ({
  isOpen,
  onClose,
  projectTitle = 'Untitled video',
  sceneCount = 0,
  totalDurationSec = 0,
  phase = 'configure',
  statusMessage = '',
  errorMessage = '',
  errorObject = null,
  readyFilename = '',
  downloading = false,
  onStartExport,
  onDownload,
  progress = 0,
}) => {
  const [filename, setFilename] = useState(projectTitle)
  const [resolution, setResolution] = useState('1920x1080')
  const [quality, setQuality] = useState('high')

  useEffect(() => {
    if (isOpen) {
      setFilename(projectTitle || 'Untitled video')
      setResolution('1920x1080')
      setQuality('high')
    }
  }, [isOpen, projectTitle])

  const steps = [
    { id: 'saving', label: 'Saving', icon: MdCloudUpload },
    { id: 'queued', label: 'Queued', icon: MdAccessTime },
    { id: 'rendering', label: 'Rendering', icon: MdMovieFilter },
    { id: 'preparing', label: 'Preparing', icon: MdSettings },
    { id: 'ready', label: 'Ready', icon: MdFileDownload },
  ]

  let activeStep = 0
  const statusLower = (statusMessage || '').toLowerCase()

  if (phase === 'success') {
    activeStep = 5
  } else if (statusLower.includes('preparing download') || statusLower.includes('assembling')) {
    activeStep = 3
  } else if (statusLower.includes('rendering')) {
    activeStep = 2
  } else if (statusLower.includes('starting full video render') || statusLower.includes('queued') || statusLower.includes('starting')) {
    activeStep = 1
  } else {
    activeStep = 0
  }

  const connectors = []
  for (let i = 0; i < 4; i++) {
    let connState = 'pending'
    if (activeStep > i + 1) {
      connState = 'completed'
    } else if (activeStep === i + 1) {
      connState = 'active'
    }
    connectors.push(connState)
  }

  if (!isOpen) return null

  const isLoading = phase === 'loading'
  const isSuccess = phase === 'success'
  const isError = phase === 'error'
  const canClose = !isLoading

  const handleOverlayClick = () => {
    if (canClose) onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onStartExport?.({ filename: filename.trim() || projectTitle, resolution, quality })
  }

  return (
    <div className="modal-overlay export-modal-overlay" onClick={handleOverlayClick}>
      <div
        className="modal-content export-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="export-modal-title"
        aria-busy={isLoading}
      >
        <div className="export-modal-header">
          <h2 id="export-modal-title" className="modal-title">
            {isLoading ? 'Preparing your video' : isSuccess ? 'Download ready' : 'Download video'}
          </h2>
          {canClose && (
            <button
              type="button"
              className="export-modal-close"
              onClick={onClose}
              aria-label="Close"
            >
              <MdClose size={20} />
            </button>
          )}
        </div>

        {phase === 'configure' && (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="export-modal-summary">
                <div className="export-modal-summary-item">
                  <span>Scenes</span>
                  <strong>{sceneCount}</strong>
                </div>
                <div className="export-modal-summary-item">
                  <span>Duration</span>
                  <strong>{formatDuration(totalDurationSec)}</strong>
                </div>
                <div className="export-modal-summary-item">
                  <span>Format</span>
                  <strong>MP4</strong>
                </div>
              </div>

              <div className="property-group">
                <div className="property-row">
                  <label className="property-label" htmlFor="export-filename">File name</label>
                  <input
                    id="export-filename"
                    className="property-input"
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    placeholder="My video"
                    maxLength={120}
                  />
                </div>
                <div className="property-row">
                  <label className="property-label" htmlFor="export-resolution">Resolution</label>
                  <select
                    id="export-resolution"
                    className="property-input"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                  >
                    {RESOLUTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="property-row">
                  <label className="property-label" htmlFor="export-quality">Quality</label>
                  <select
                    id="export-quality"
                    className="property-input"
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                  >
                    {QUALITIES.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="export-modal-hint">
                Your full project will be rendered — all scenes, text, images, and avatars combined into one video.
              </p>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary export-modal-submit">
                <MdFileDownload size={18} />
                Start download
              </button>
            </div>
          </form>
        )}

        {isLoading && (
          <div className="export-modal-loading">
            <h3 className="modal-subtitle" style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>
              Process Timeline
            </h3>

            <div className="process-timeline-container">
              <div className="timeline-connectors">
                {connectors.map((state, i) => (
                  <div key={i} className={`timeline-connector ${state}`} />
                ))}
              </div>

              <div className="timeline-steps">
                {steps.map((step, idx) => {
                  const isCompleted = idx < activeStep
                  const isActive = idx === activeStep
                  const isPending = idx > activeStep

                  let stepClass = 'pending'
                  if (isCompleted) stepClass = 'completed'
                  else if (isActive) stepClass = 'active'

                  const Icon = step.icon

                  return (
                    <div key={step.id} className={`timeline-step ${stepClass}`}>
                      <div className="step-icon">
                        <Icon size={20} />
                      </div>
                      <div className="step-node">
                        {isCompleted ? (
                          <span>✓</span>
                        ) : null}
                      </div>
                      <div className="step-label">
                        {step.label}
                        {isActive && step.id === 'rendering' && progress > 0 && (
                          <span className="step-percentage">{progress}%</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <p className="export-modal-status">{statusMessage || 'Starting…'}</p>
            <p className="export-modal-loading-hint">
              This may take a few minutes depending on length and complexity. Keep this tab open.
            </p>
          </div>
        )}

        {isSuccess && (
          <div className="export-modal-result export-modal-result--success">
            <MdCheckCircle size={48} />
            <p>Your render is complete. Download the MP4 to save it locally.</p>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Close
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={onDownload}
                disabled={downloading || !onDownload}
                title={readyFilename ? `Download ${readyFilename}` : 'Download MP4'}
              >
                {downloading ? 'Downloading…' : 'Download MP4'}
              </button>
            </div>
          </div>
        )}

        {isError && (
          <div className="export-modal-result export-modal-result--error" style={{ width: '100%' }}>
            <div className="export-error-glass">
              <div className="export-error-title">
                <MdErrorOutline size={24} />
                <span>{errorObject?.title || 'Export Failed'}</span>
              </div>
              <p className="export-error-desc">
                {errorObject?.message || errorMessage || 'An unexpected error occurred while exporting.'}
              </p>
              
              {errorObject?.remediation && errorObject.remediation.length > 0 && (
                <>
                  <div className="export-error-remediation-title">To resolve this:</div>
                  <ul className="export-error-steps">
                    {errorObject.remediation.map((step, i) => (
                      <li key={i} className="export-error-step">
                        {step}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {errorObject?.details && (
                <details style={{ marginTop: '12px' }}>
                  <summary className="export-error-details-summary">Technical details</summary>
                  <pre className="export-error-details-pre">
                    {typeof errorObject.details === 'object'
                      ? JSON.stringify(errorObject.details, null, 2)
                      : String(errorObject.details)}
                  </pre>
                </details>
              )}
            </div>

            <div className="modal-actions" style={{ marginTop: '16px', width: '100%' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Close
              </button>
              {!errorObject?.title && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => onStartExport?.({ filename: filename.trim() || projectTitle, resolution, quality })}
                >
                  Try again
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .export-error-glass {
          background: rgba(30, 41, 59, 0.45);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 12px;
          padding: 20px;
          width: 100%;
          text-align: left;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
          box-sizing: border-box;
        }
        .export-error-title {
          font-size: 16px;
          font-weight: 700;
          color: #fca5a5;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }
        .export-error-desc {
          font-size: 14px;
          color: #e2e8f0;
          line-height: 1.5;
          margin: 0 0 16px 0 !important;
          max-width: 100% !important;
          text-align: left;
        }
        .export-error-remediation-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .export-error-steps {
          list-style: none;
          padding: 0;
          margin: 0 0 8px 0;
        }
        .export-error-step {
          font-size: 13px;
          color: #cbd5e1;
          margin-bottom: 6px;
          display: flex;
          align-items: flex-start;
          gap: 6px;
        }
        .export-error-step::before {
          content: "•";
          color: #f87171;
          font-weight: bold;
        }
        .export-error-details-summary {
          font-size: 11px;
          color: #64748b;
          cursor: pointer;
          user-select: none;
          margin-bottom: 4px;
        }
        .export-error-details-pre {
          background: rgba(15, 23, 42, 0.6);
          padding: 10px;
          border-radius: 6px;
          font-family: monospace;
          font-size: 11px;
          color: #cbd5e1;
          overflow-x: auto;
          margin-top: 6px;
          white-space: pre-wrap;
        }
      `}</style>
    </div>
  );
};

export default ExportModal;
