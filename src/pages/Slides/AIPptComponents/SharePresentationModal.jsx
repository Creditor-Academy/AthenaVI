import { useEffect, useRef, useState } from 'react'
import {
  FiCopy,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiRefreshCw,
  FiEye,
  FiMessageCircle,
  FiShare2,
} from 'react-icons/fi'
import presentationService, { PresentationConflictError } from '../../../services/presentationService'
import { extractShareToken, buildShareUrl } from '../../../utils/pptShareSession'
import './pptPanelUi.css'

const EMPTY_LINK = {
  exists: false,
  enabled: false,
  url: '',
  token: '',
}

function unwrapLink(raw, fallbackToken, fallbackUrl) {
  if (!raw || raw.exists === false) {
    return { ...EMPTY_LINK }
  }
  const token = raw.token || fallbackToken || ''
  const url = raw.url || fallbackUrl || (token ? buildShareUrl(token) : '')
  return {
    exists: true,
    enabled: Boolean(raw.enabled ?? raw.isEnabled),
    url,
    token,
    role: raw.role || '',
  }
}

function unwrapShareState(data) {
  const root = data && typeof data === 'object' ? data : {}
  return {
    viewer: unwrapLink(root.viewer, root.viewerToken, root.viewerUrl),
    reviewer: unwrapLink(root.reviewer, root.reviewerToken, root.reviewerUrl),
  }
}

function unwrapRoleResponse(data) {
  const root = data && typeof data === 'object' ? data : {}
  const link = root.link && typeof root.link === 'object' ? root.link : root
  return unwrapLink(link, root.token, root.url)
}

function ShareAccessRow({
  role,
  title,
  description,
  icon: Icon,
  link,
  loading,
  busy,
  generating,
  copied,
  confirmRotate,
  onToggle,
  onCopy,
  onAskRotate,
  onCancelRotate,
  onConfirmRotate,
}) {
  const neverCreated = !loading && !link.exists
  const needsRotate = Boolean(link.exists && !link.url)
  const copyUrl = link.url || ''
  const inputId = `ppt-share-url-${role}`
  const live = Boolean(link.enabled)

  return (
    <article className={`ppt-share-card ${live ? 'is-live' : ''} ${neverCreated ? 'is-idle' : ''}`}>
      <div className="ppt-share-card-top">
        <span className="ppt-share-card-icon" aria-hidden>
          <Icon size={18} />
        </span>
        <div className="ppt-share-card-copy">
          <div className="ppt-share-card-title">
            <strong>{title}</strong>
            {!neverCreated && (
              <span className={`ppt-share-pill ${live ? 'is-on' : ''}`}>{live ? 'On' : 'Off'}</span>
            )}
          </div>
          <p>{description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-label={`Enable ${title} link`}
          aria-checked={live}
          className={`ppt-share-switch ${live ? 'is-on' : ''}`}
          disabled={loading || busy || generating}
          onClick={onToggle}
        >
          <span />
        </button>
      </div>

      {neverCreated ? (
        <p className="ppt-share-card-hint">Turn this on to create a shareable link.</p>
      ) : (
        <div className="ppt-share-card-link">
          <div className="ppt-share-urlbar">
            <input
              id={inputId}
              type="text"
              readOnly
              className="ppt-share-urlbar-input"
              value={loading ? 'Loading…' : copyUrl || 'Reset the link to get a URL'}
              aria-label={`${title} link`}
            />
            <button
              type="button"
              className={`ppt-share-urlbar-copy ${copied ? 'is-copied' : ''}`}
              onClick={onCopy}
              disabled={!copyUrl}
              title={copyUrl ? 'Copy link' : 'Reset the link to get a copyable URL'}
            >
              {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          {needsRotate && (
            <p className="ppt-share-card-hint">Reset once to recover a copyable URL.</p>
          )}
          {!live && (
            <p className="ppt-share-card-hint">Paused — the same URL works again when you turn this on.</p>
          )}
          {confirmRotate ? (
            <div className="ppt-share-reset-confirm">
              <p>Everyone with the current link will lose access.</p>
              <div className="ppt-share-reset-actions">
                <button type="button" className="ppt-share-text-btn" onClick={onCancelRotate} disabled={busy}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="ppt-share-text-btn ppt-share-text-btn--danger"
                  onClick={onConfirmRotate}
                  disabled={busy || generating}
                >
                  Reset now
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="ppt-share-text-btn"
              onClick={onAskRotate}
              disabled={busy || generating}
            >
              <FiRefreshCw size={13} /> Reset link
            </button>
          )}
        </div>
      )}
    </article>
  )
}

export default function SharePresentationModal({
  workspaceId,
  presentationId,
  title = 'Presentation',
  deckStatus = 'READY',
  onClose,
  onShareToken,
}) {
  const [links, setLinks] = useState({ viewer: { ...EMPTY_LINK }, reviewer: { ...EMPTY_LINK } })
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')
  const [confirmRotate, setConfirmRotate] = useState('')

  const generating = String(deckStatus || '').toUpperCase() === 'GENERATING'
  const onShareTokenRef = useRef(onShareToken)
  onShareTokenRef.current = onShareToken

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const publishToken = (nextLinks) => {
    const token =
      extractShareToken(nextLinks.viewer?.token || nextLinks.viewer?.url) ||
      extractShareToken(nextLinks.reviewer?.token || nextLinks.reviewer?.url)
    if (token) onShareTokenRef.current?.(token)
  }

  const applyLinks = (next) => {
    setLinks(next)
    publishToken(next)
  }

  const patchRole = (role, nextLink) => {
    setLinks((prev) => {
      const next = { ...prev, [role]: nextLink }
      publishToken(next)
      return next
    })
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
        applyLinks(unwrapShareState(data))
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

  const run = async (fn, role) => {
    setBusy(true)
    setError('')
    try {
      const data = await fn()
      const nextLink = unwrapRoleResponse(data)
      if (role) patchRole(role, nextLink)
      else applyLinks(unwrapShareState(data))
      return nextLink
    } catch (err) {
      if (err instanceof PresentationConflictError) {
        setError('Sharing is unavailable while this deck is generating.')
      } else if (err?.status === 404 && role) {
        setError('Turn this link on first to create it.')
      } else {
        setError(err.message || 'Share update failed.')
      }
      return null
    } finally {
      setBusy(false)
    }
  }

  const handleToggle = async (role) => {
    if (generating || busy || loading) return
    const current = links[role]
    if (!current?.exists) {
      await run(
        () => presentationService.enableShareRole(workspaceId, presentationId, role),
        role
      )
      return
    }
    if (current.enabled) {
      await run(
        () => presentationService.updateShareRole(workspaceId, presentationId, role, { enabled: false }),
        role
      )
      return
    }
    setBusy(true)
    setError('')
    try {
      const data = await presentationService.updateShareRole(workspaceId, presentationId, role, {
        enabled: true,
      })
      patchRole(role, unwrapRoleResponse(data))
    } catch (err) {
      if (err?.status === 404) {
        try {
          const created = await presentationService.enableShareRole(workspaceId, presentationId, role)
          patchRole(role, unwrapRoleResponse(created))
        } catch (createErr) {
          if (createErr instanceof PresentationConflictError) {
            setError('Sharing is unavailable while this deck is generating.')
          } else {
            setError(createErr.message || 'Share update failed.')
          }
        }
      } else if (err instanceof PresentationConflictError) {
        setError('Sharing is unavailable while this deck is generating.')
      } else {
        setError(err.message || 'Share update failed.')
      }
    } finally {
      setBusy(false)
    }
  }

  const handleRotate = async (role) => {
    const next = await run(
      () => presentationService.rotateShareRole(workspaceId, presentationId, role),
      role
    )
    if (next) setConfirmRotate('')
  }

  const copyLink = async (role) => {
    const copyUrl = links[role]?.url
    if (!copyUrl) return
    try {
      await navigator.clipboard.writeText(copyUrl)
      setCopied(role)
      setTimeout(() => setCopied(''), 2000)
    } catch {
      setError('Copy failed — select the link and copy it manually.')
    }
  }

  return (
    <div
      className="ppt-editor-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="ppt-editor-modal ppt-share-modal" role="dialog" aria-labelledby="ppt-share-title">
        <header className="ppt-share-head">
          <div className="ppt-share-head-main">
            <span className="ppt-share-head-icon" aria-hidden>
              <FiShare2 size={18} />
            </span>
            <div className="ppt-share-head-text">
              <h3 id="ppt-share-title">Share</h3>
              <p>{title}</p>
            </div>
          </div>
          <button type="button" className="ppt-editor-modal-close" onClick={onClose} aria-label="Close">
            <FiX size={18} />
          </button>
        </header>

        <p className="ppt-share-lead">
          Create a view-only link, a comment link, or both. Each link is independent.
        </p>

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

        <section className="ppt-share-roles" aria-label="Anyone with the link">
          <p className="ppt-share-roles-label">Anyone with the link</p>

          <ShareAccessRow
            role="viewer"
            title="Can view"
            description="Preview only — no comments"
            icon={FiEye}
            link={links.viewer}
            loading={loading}
            busy={busy}
            generating={generating}
            copied={copied === 'viewer'}
            confirmRotate={confirmRotate === 'viewer'}
            onToggle={() => handleToggle('viewer')}
            onCopy={() => copyLink('viewer')}
            onAskRotate={() => setConfirmRotate('viewer')}
            onCancelRotate={() => setConfirmRotate('')}
            onConfirmRotate={() => handleRotate('viewer')}
          />
          <ShareAccessRow
            role="reviewer"
            title="Can comment"
            description="Preview plus feedback from guests or teammates"
            icon={FiMessageCircle}
            link={links.reviewer}
            loading={loading}
            busy={busy}
            generating={generating}
            copied={copied === 'reviewer'}
            confirmRotate={confirmRotate === 'reviewer'}
            onToggle={() => handleToggle('reviewer')}
            onCopy={() => copyLink('reviewer')}
            onAskRotate={() => setConfirmRotate('reviewer')}
            onCancelRotate={() => setConfirmRotate('')}
            onConfirmRotate={() => handleRotate('reviewer')}
          />
        </section>

        <footer className="ppt-share-foot">
          <button type="button" className="ppt-editor-modal-btn ppt-editor-modal-btn--primary" onClick={onClose}>
            Done
          </button>
        </footer>
      </div>
    </div>
  )
}
