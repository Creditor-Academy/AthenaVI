import { useEffect, useState } from 'react'
import { MdClose, MdCheckCircle, MdErrorOutline, MdFileDownload } from 'react-icons/md'

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
  readyFilename = '',
  downloading = false,
  onStartExport,
  onDownload,
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
            <div className="export-modal-spinner" aria-hidden="true" />
            <p className="export-modal-status">{statusMessage || 'Starting…'}</p>
            <p className="export-modal-loading-hint">
              This may take a few minutes depending on length and complexity. Keep this tab open.
            </p>
            <ul className="export-modal-steps">
              <li className={statusMessage?.toLowerCase().includes('saving') ? 'active' : statusMessage ? 'done' : ''}>
                Saving project
              </li>
              <li className={statusMessage?.toLowerCase().includes('starting') ? 'active' : statusMessage?.toLowerCase().includes('render') ? 'done' : ''}>
                Starting render
              </li>
              <li className={statusMessage?.toLowerCase().includes('render') && !statusMessage?.toLowerCase().includes('starting') ? 'active' : statusMessage?.toLowerCase().includes('prepar') ? 'done' : ''}>
                Rendering video
              </li>
              <li className={statusMessage?.toLowerCase().includes('prepar') ? 'active' : ''}>
                Preparing download
              </li>
            </ul>
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
          <div className="export-modal-result export-modal-result--error">
            <MdErrorOutline size={48} />
            <p>{errorMessage || 'Something went wrong while exporting your video.'}</p>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => onStartExport?.({ filename: filename.trim() || projectTitle, resolution, quality })}
              >
                Try again
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ExportModal;
