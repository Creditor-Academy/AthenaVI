import { useEffect, useState } from 'react'
import { FiCopy, FiShare2, FiX, FiAlertCircle, FiRefreshCw } from 'react-icons/fi'
import presentationService, { PresentationConflictError } from '../../../services/presentationService'
import {
  stashShareToken,
  readShareUrl,
  extractShareToken,
  buildShareUrl,
  isCompleteShareUrl,
} from '../../../utils/pptShareSession'
import './pptPanelUi.css'

function unwrapShare(data) {
  const share = data?.share || data || {}
  const token = share.token || data?.token || ''
  const rawUrl =
    share.url ||
    data?.url ||
    share.publicUrl ||
    share.shareUrl ||
    share.link ||
    ''
  const url = isCompleteShareUrl(rawUrl)
    ? rawUrl
    : token
      ? buildShareUrl(token)
      : isCompleteShareUrl(share.urlDisplay)
        ? share.urlDisplay
        : ''
  return {
    enabled: Boolean(share.enabled ?? share.isEnabled),
    exists:
      share.exists !== false &&
      (Boolean(share.enabled) ||
        Boolean(share.urlDisplay) ||
        Boolean(share.tokenPrefix) ||
        Boolean(url) ||
        Boolean(token)),
    url,
    token,
    urlDisplay: share.urlDisplay || '',
    tokenPrefix: share.tokenPrefix || '',
    expiresAt: share.expiresAt || share.expires_at || '',
  }
}

export default function SharePresentationModal({
  workspaceId,
  presentationId,
  title = 'Presentation',
  deckStatus = 'READY',
  onClose,
  onShareToken,
}) {
  const [share, setShare] = useState(null)
  const [copyUrl, setCopyUrl] = useState(() => readShareUrl(presentationId))
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [confirmRotate, setConfirmRotate] = useState(false)

  const generating = String(deckStatus || '').toUpperCase() === 'GENERATING'

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (!workspaceId || !presentationId) {
      setError('Missing presentation.')
      setLoading(false)
      return undefined
    }

    let cancelled = false
    ;(async () => {
      try {
        const data = await presentationService.getShareLink(workspaceId, presentationId)
        if (cancelled) return
        const next = unwrapShare(data)
        setShare(next)
        let url =
          next.url ||
          readShareUrl(presentationId) ||
          (next.token ? buildShareUrl(next.token) : '')
        if (next.enabled && !url) {
          try {
            const created = unwrapShare(
              await presentationService.enableShareLink(workspaceId, presentationId)
            )
            url = created.url || (created.token ? buildShareUrl(created.token) : '')
            setShare({ ...next, ...created, enabled: true })
            if (url) stashShareToken(presentationId, created.token || url)
          } catch {
            /* keep GET state if the link is already on */
          }
        }
        if (url) {
          setCopyUrl(url)
          stashShareToken(presentationId, url)
          onShareToken?.(extractShareToken(url))
        }
      } catch (err) {
        if (cancelled) return
        setError(err.message || 'Could not load share settings.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [workspaceId, presentationId])

  const remember = (next) => {
    const url = next.url || (next.token ? buildShareUrl(next.token) : '') || readShareUrl(presentationId)
    if (url) {
      setCopyUrl(url)
      stashShareToken(presentationId, next.token || url)
      onShareToken?.(extractShareToken(next.token || url))
    }
  }

  const run = async (fn) => {
    setBusy(true)
    setError('')
    try {
      const data = await fn()
      const next = unwrapShare(data)
      setShare(next)
      remember(next)
      return next
    } catch (err) {
      if (err instanceof PresentationConflictError) {
        setError('Sharing is unavailable while this deck is generating.')
      } else {
        setError(err.message || 'Share update failed.')
      }
      return null
    } finally {
      setBusy(false)
    }
  }

  const handleToggle = async () => {
    if (generating || busy || loading) return
    if (!share?.exists || (!share.enabled && !copyUrl && !share.urlDisplay)) {
      await run(() => presentationService.enableShareLink(workspaceId, presentationId))
      return
    }
    if (share.enabled) {
      await run(() =>
        presentationService.updateShareLink(workspaceId, presentationId, { enabled: false })
      )
      return
    }
    await run(() =>
      presentationService.updateShareLink(workspaceId, presentationId, { enabled: true })
    )
  }

  const handleRotate = async () => {
    const next = await run(() => presentationService.rotateShareLink(workspaceId, presentationId))
    if (next) setConfirmRotate(false)
  }

  const copyLink = async () => {
    if (!copyUrl) return
    try {
      await navigator.clipboard.writeText(copyUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Copy failed — select the link and copy it manually.')
    }
  }

  const neverCreated = !loading && share && !share.exists && !share.enabled

  return (
    <div
      className="ppt-editor-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="ppt-editor-modal" role="dialog" aria-label="Share preview">
        <header className="ppt-editor-modal-head">
          <div className="ppt-editor-modal-head-text">
            <span className="ppt-editor-modal-kicker">Share preview</span>
            <h3 className="ppt-editor-modal-title">{title}</h3>
          </div>
          <button type="button" className="ppt-editor-modal-close" onClick={onClose} aria-label="Close">
            <FiX size={18} />
          </button>
        </header>

        <div className="ppt-editor-modal-callout">
          <FiShare2 size={16} />
          <p>
            Anyone with this link can view the deck read-only. Share it with as many people as you like
            until you reset or turn it off.
          </p>
        </div>

        {generating && (
          <div className="ppt-editor-modal-alert ppt-editor-modal-alert--warn" role="status">
            <FiAlertCircle size={16} />
            <span>Turn sharing on after generation finishes.</span>
          </div>
        )}

        {error && (
          <div className="ppt-editor-modal-alert ppt-editor-modal-alert--warn" role="alert">
            <FiAlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="ppt-share-toggle-row">
          <div>
            <strong>View-only link</strong>
            <p>
              {neverCreated
                ? 'No link yet. Turn this on to create one.'
                : share?.enabled
                  ? 'Link is on. Copy it anytime and send it to multiple people.'
                  : 'Link is paused. Re-enable to revive the same URL.'}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={Boolean(share?.enabled)}
            className={`ppt-share-switch ${share?.enabled ? 'is-on' : ''}`}
            disabled={loading || busy || generating}
            onClick={handleToggle}
          >
            <span />
          </button>
        </div>

        {(copyUrl || share?.urlDisplay) && (
          <>
            <label className="ppt-editor-modal-field-label" htmlFor="ppt-share-url">
              Preview link
            </label>
            <div className="ppt-editor-modal-link-row">
              <input
                id="ppt-share-url"
                type="text"
                readOnly
                className="ppt-editor-modal-link-input"
                value={loading ? 'Loading…' : copyUrl || share?.urlDisplay || ''}
              />
              <button
                type="button"
                className="ppt-editor-modal-btn ppt-editor-modal-btn--primary"
                onClick={copyLink}
                disabled={!copyUrl || !share?.enabled}
                title={share?.enabled ? 'Copy link' : 'Turn the link on to copy it'}
              >
                <FiCopy size={15} /> {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="ppt-editor-modal-hint">
              This same link works for every viewer until you reset it.
            </p>
          </>
        )}

        {share?.exists && (
          <div className="ppt-share-reset-row">
            {confirmRotate ? (
              <>
                <p className="ppt-editor-modal-hint" style={{ margin: 0 }}>
                  Everyone holding the old link will lose access. Disable instead if you only want a pause.
                </p>
                <button
                  type="button"
                  className="ppt-editor-modal-btn ppt-editor-modal-btn--ghost"
                  onClick={() => setConfirmRotate(false)}
                  disabled={busy}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="ppt-editor-modal-btn ppt-editor-modal-btn--primary"
                  onClick={handleRotate}
                  disabled={busy || generating}
                >
                  Reset now
                </button>
              </>
            ) : (
              <button
                type="button"
                className="ppt-editor-modal-btn ppt-editor-modal-btn--ghost"
                onClick={() => setConfirmRotate(true)}
                disabled={busy || generating}
              >
                <FiRefreshCw size={15} /> Reset link
              </button>
            )}
          </div>
        )}

        <footer className="ppt-editor-modal-foot">
          <button type="button" className="ppt-editor-modal-btn ppt-editor-modal-btn--ghost" onClick={onClose}>
            Done
          </button>
        </footer>
      </div>
    </div>
  )
}
