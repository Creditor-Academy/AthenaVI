import { useEffect, useRef, useState } from 'react'
import { FiCopy, FiShare2, FiX, FiAlertCircle, FiRefreshCw, FiEye, FiMessageCircle } from 'react-icons/fi'
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

function ShareLinkCard({
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

  return (
    <article className="ppt-share-card">
      <header className="ppt-share-card-head">
        <span className="ppt-share-card-icon" aria-hidden>
          <Icon size={16} />
        </span>
        <div>
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-label={`Enable ${title} link`}
          aria-checked={Boolean(link.enabled)}
          className={`ppt-share-switch ${link.enabled ? 'is-on' : ''}`}
          disabled={loading || busy || generating}
          onClick={onToggle}
        >
          <span />
        </button>
      </header>

      {neverCreated ? (
        <p className="ppt-editor-modal-hint" style={{ margin: 0 }}>
          No link yet. Turn this on to create one.
        </p>
      ) : (
        <>
          <label className="ppt-editor-modal-field-label" htmlFor={inputId}>
            {title} URL
          </label>
          <div className="ppt-editor-modal-link-row">
            <input
              id={inputId}
              type="text"
              readOnly
              className="ppt-editor-modal-link-input"
              value={loading ? 'Loading…' : copyUrl || 'Reset the link to get a URL'}
            />
            <button
              type="button"
              className="ppt-editor-modal-btn ppt-editor-modal-btn--primary"
              onClick={onCopy}
              disabled={!copyUrl}
              title={copyUrl ? 'Copy link' : 'Reset the link to get a copyable URL'}
            >
              <FiCopy size={15} /> {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="ppt-editor-modal-hint">
            {link.enabled
              ? 'Link is on. Disable pauses this URL; reset issues a new one.'
              : 'Link is paused. Guests will see an unavailable page until you turn it back on.'}
          </p>
          {needsRotate && (
            <p className="ppt-editor-modal-hint">
              This link was created before a URL was stored. Reset it once to get a copyable URL.
            </p>
          )}
          {confirmRotate ? (
            <div className="ppt-share-reset-row" style={{ marginBottom: 0 }}>
              <p className="ppt-editor-modal-hint" style={{ margin: 0, flex: '1 1 100%' }}>
                Everyone with the current link will lose access.
              </p>
              <button
                type="button"
                className="ppt-editor-modal-btn ppt-editor-modal-btn--ghost"
                onClick={onCancelRotate}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ppt-editor-modal-btn ppt-editor-modal-btn--primary"
                onClick={onConfirmRotate}
                disabled={busy || generating}
              >
                Reset now
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="ppt-editor-modal-btn ppt-editor-modal-btn--ghost"
              onClick={onAskRotate}
              disabled={busy || generating}
            >
              <FiRefreshCw size={15} /> Reset link
            </button>
          )}
        </>
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
      <div className="ppt-editor-modal ppt-share-modal-wide" role="dialog" aria-label="Share presentation">
        <header className="ppt-editor-modal-head">
          <div className="ppt-editor-modal-head-text">
            <span className="ppt-editor-modal-kicker">Share</span>
            <h3 className="ppt-editor-modal-title">{title}</h3>
          </div>
          <button type="button" className="ppt-editor-modal-close" onClick={onClose} aria-label="Close">
            <FiX size={18} />
          </button>
        </header>

        <div className="ppt-editor-modal-callout">
          <FiShare2 size={16} />
          <p>
            Viewer is read-only. Reviewer can leave comments. Each link is independent — turning one
            on does not enable the other. Links stay valid until you disable or reset them.
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

        <div className="ppt-share-card-grid">
          <ShareLinkCard
            role="viewer"
            title="Viewer"
            description="Anyone with this link can preview the deck. No comments."
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
          <ShareLinkCard
            role="reviewer"
            title="Reviewer"
            description="Same preview, plus comments from guests or teammates."
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
        </div>

        <footer className="ppt-editor-modal-foot">
          <button type="button" className="ppt-editor-modal-btn ppt-editor-modal-btn--ghost" onClick={onClose}>
            Done
          </button>
        </footer>
      </div>
    </div>
  )
}
