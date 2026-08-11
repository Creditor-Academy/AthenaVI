import { useEffect, useState } from 'react'
import { FiCopy, FiExternalLink, FiShare2, FiX, FiAlertCircle } from 'react-icons/fi'
import presentationService from '../../../services/presentationService'
import './pptPanelUi.css'

function fallbackShareUrl(workspaceId, presentationId) {
  const params = new URLSearchParams()
  if (workspaceId) params.set('workspaceId', workspaceId)
  if (presentationId) params.set('presentationId', presentationId)
  const qs = params.toString()
  return `${window.location.origin}/dashboard/editor${qs ? `?${qs}` : ''}`
}

export default function SharePresentationModal({
  workspaceId,
  presentationId,
  title = 'Presentation',
  onClose,
}) {
  const [shareUrl, setShareUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [usedFallback, setUsedFallback] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    const fallback = fallbackShareUrl(workspaceId, presentationId)
    if (!workspaceId || !presentationId) {
      setShareUrl(window.location.href || fallback)
      setUsedFallback(true)
      setLoading(false)
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const data = await presentationService.createShareLink(workspaceId, presentationId)
        if (cancelled) return
        const url = data?.shareUrl || data?.url || fallback
        setShareUrl(url)
      } catch (err) {
        if (cancelled) return
        setUsedFallback(true)
        setShareUrl(fallback)
        const raw = err?.message || ''
        if (raw.includes('404')) {
          setError('Share links are not available yet — use the editor link below to collaborate.')
        } else {
          setError(raw || 'Could not create a share link. You can still copy the editor link below.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [workspaceId, presentationId])

  const copyLink = async () => {
    if (!shareUrl || loading) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Copy failed — select the link and copy manually.')
    }
  }

  const openLink = () => {
    if (shareUrl && !loading) window.open(shareUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      className="ppt-editor-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="ppt-editor-modal" role="dialog" aria-label="Share presentation">
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
            Anyone with the link can view this presentation in pitch room mode — no account required.
          </p>
        </div>

        {error && (
          <div className="ppt-editor-modal-alert ppt-editor-modal-alert--warn" role="alert">
            <FiAlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {usedFallback && !error && !loading && (
          <div className="ppt-editor-modal-alert ppt-editor-modal-alert--info" role="status">
            Using editor link — full pitch-room sharing will appear here when enabled.
          </div>
        )}

        <label className="ppt-editor-modal-field-label" htmlFor="ppt-share-url">
          {usedFallback ? 'Editor link' : 'Share link'}
        </label>
        <div className="ppt-editor-modal-link-row">
          <input
            id="ppt-share-url"
            type="text"
            readOnly
            className="ppt-editor-modal-link-input"
            value={loading ? 'Generating link…' : shareUrl}
          />
          <button
            type="button"
            className="ppt-editor-modal-btn ppt-editor-modal-btn--primary"
            onClick={copyLink}
            disabled={loading || !shareUrl}
          >
            <FiCopy size={15} /> {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <footer className="ppt-editor-modal-foot">
          <button type="button" className="ppt-editor-modal-btn ppt-editor-modal-btn--ghost" onClick={onClose}>
            Done
          </button>
          <button
            type="button"
            className="ppt-editor-modal-btn ppt-editor-modal-btn--secondary"
            onClick={openLink}
            disabled={loading || !shareUrl}
          >
            <FiExternalLink size={16} /> Open link
          </button>
        </footer>
      </div>
    </div>
  )
}
