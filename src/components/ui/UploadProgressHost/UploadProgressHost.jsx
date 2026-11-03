import { useState, useSyncExternalStore } from 'react'
import { FiCheck, FiChevronDown, FiChevronUp, FiFilm, FiImage, FiMusic, FiX, FiAlertCircle } from 'react-icons/fi'
import {
  dismissTrackedUpload,
  getTrackedUploads,
  subscribeToUploads,
} from '../../../services/uploadTracker'
import { formatBytes } from '../../../utils/uploadRequest'
import './UploadProgressHost.css'

const KIND_ICON = { image: FiImage, video: FiFilm, audio: FiMusic }

/** Floating list of uploads in progress (bottom-right), shared by every page of the app. */
export default function UploadProgressHost() {
  const uploads = useSyncExternalStore(subscribeToUploads, getTrackedUploads, getTrackedUploads)
  const [collapsed, setCollapsed] = useState(false)
  if (!uploads.length) return null

  const active = uploads.filter((u) => u.status === 'uploading')
  const failed = uploads.filter((u) => u.status === 'error')
  const title = active.length
    ? `Uploading ${active.length} file${active.length === 1 ? '' : 's'}`
    : failed.length
      ? `${failed.length} upload${failed.length === 1 ? '' : 's'} failed`
      : 'Uploads complete'

  return (
    <section className="upload-host" aria-label="Uploads" aria-live="polite">
      <header className="upload-host__head">
        <span className="upload-host__title">{title}</span>
        <button
          type="button"
          className="upload-host__icon-btn"
          aria-label={collapsed ? 'Show uploads' : 'Hide uploads'}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((v) => !v)}
        >
          {collapsed ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
        </button>
      </header>
      {!collapsed && (
        <ul className="upload-host__list">
          {uploads.map((u) => {
            const Icon = KIND_ICON[u.kind] || FiImage
            const pct = Math.round((u.progress || 0) * 100)
            // Until the browser reports progress, a moving bar rather than a stuck 0%.
            const indeterminate = u.status === 'uploading' && pct === 0
            return (
              <li key={u.id} className={`upload-host__item is-${u.status}`}>
                <span className="upload-host__kind" aria-hidden>
                  {u.status === 'done' ? (
                    <FiCheck size={16} />
                  ) : u.status === 'error' ? (
                    <FiAlertCircle size={16} />
                  ) : (
                    <Icon size={16} />
                  )}
                </span>
                <div className="upload-host__body">
                  <div className="upload-host__row">
                    <span className="upload-host__name" title={u.name}>{u.name}</span>
                    <span className="upload-host__size">{formatBytes(u.size)}</span>
                  </div>
                  {u.status === 'error' ? (
                    <p className="upload-host__error">{u.error}</p>
                  ) : (
                    <>
                      <div
                        className={`upload-host__bar${indeterminate ? ' is-indeterminate' : ''}`}
                        role="progressbar"
                        aria-label={`Uploading ${u.name}`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={indeterminate ? undefined : pct}
                      >
                        <span style={indeterminate ? undefined : { width: `${pct}%` }} />
                      </div>
                      <p className="upload-host__meta">
                        {u.status === 'done'
                          ? u.note || 'Uploaded'
                          : indeterminate
                            ? 'Uploading…'
                            : `Uploading… ${pct}%`}
                      </p>
                    </>
                  )}
                </div>
                {u.status !== 'uploading' && (
                  <button
                    type="button"
                    className="upload-host__icon-btn"
                    aria-label={`Dismiss ${u.name}`}
                    onClick={() => dismissTrackedUpload(u.id)}
                  >
                    <FiX size={14} />
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
