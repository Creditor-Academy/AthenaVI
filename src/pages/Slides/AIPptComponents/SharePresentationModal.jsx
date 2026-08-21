import { useEffect, useRef, useState } from 'react'
import { FiCopy, FiShare2, FiX, FiAlertCircle, FiRefreshCw } from 'react-icons/fi'
import presentationService, { PresentationConflictError } from '../../../services/presentationService'
import { extractShareToken, buildShareUrl } from '../../../utils/pptShareSession'
import './pptPanelUi.css'

function unwrapShare(data) {
  const share = data?.share || data || {}
  const token = share.token || data?.token || ''
  const url = share.url || data?.url || (token ? buildShareUrl(token) : '')
  return {
    enabled: Boolean(share.enabled ?? share.isEnabled),
    exists:
      share.exists !== false &&
      (Boolean(share.enabled) || Boolean(url) || Boolean(token) || Boolean(share.expired)),
    expired: Boolean(share.expired),
    url,
    token,
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
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [confirmRotate, setConfirmRotate] = useState(false)

  const generating = String(deckStatus || '').toUpperCase() === 'GENERATING'
  const copyUrl = share?.url || ''
  const neverCreated = !loading && share && !share.exists && !share.enabled
  const needsRotate = Boolean(share?.exists && !copyUrl)
  const onShareTokenRef = useRef(onShareToken)
  onShareTokenRef.current = onShareToken

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const applyShare = (next) => {
    setShare(next)
    const token = extractShareToken(next.token || next.url)
    if (token) onShareTokenRef.current?.(token)
  }

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
        applyShare(unwrapShare(data))
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

  const run = async (fn) => {
    setBusy(true)
    setError('')
    try {
      const data = await fn()
      const next = unwrapShare(data)
      applyShare(next)
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
    if (!share?.exists) {
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
            Anyone with this link can view the deck read-only. Copy it whenever you like and send it to
            as many people as you want.
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

        {needsRotate && (
          <div className="ppt-editor-modal-alert ppt-editor-modal-alert--info" role="status">
            This link was created before full URLs were stored. Reset it once to get a copyable URL.
          </div>
        )}

        <div className="ppt-share-toggle-row">
          <div>
            <strong>View-only link</strong>
            <p>
              {neverCreated
                ? 'No link yet. Turn this on to create one.'
                : share?.enabled
                  ? 'Link is on. Copy it anytime — it stays the same until you reset it.'
                  : 'Link is paused. Guests will see an unavailable page until you turn it back on.'}
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

        {(copyUrl || share?.exists) && (
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
                value={loading ? 'Loading…' : copyUrl || 'Reset the link to get a URL'}
              />
              <button
                type="button"
                className="ppt-editor-modal-btn ppt-editor-modal-btn--primary"
                onClick={copyLink}
                disabled={!copyUrl}
                title={copyUrl ? 'Copy link' : 'Reset the link to get a copyable URL'}
              >
                <FiCopy size={15} /> {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="ppt-editor-modal-hint">
              Disable pauses this URL. Reset issues a new one and the old copies stop working.
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
