import { useCallback, useEffect, useMemo, useState } from 'react'
import publicPresentationService from '../../../services/publicPresentationService'
import {
  getOrCreateViewerSessionId,
  readReviewerDisplayName,
  writeReviewerDisplayName,
} from '../../../utils/pptShareSession'
import './pptEditorExtras.css'
import './pptPanelUi.css'

function commentList(payload) {
  const data = payload?.data || payload || {}
  const list = data.comments || data.items || []
  return Array.isArray(list) ? list : []
}

function commentText(comment) {
  return comment?.body || comment?.text || ''
}

function commentAuthor(comment) {
  return (
    comment?.authorName ||
    comment?.displayName ||
    comment?.author?.name ||
    comment?.author?.displayName ||
    'Guest'
  )
}

export default function PptPublicCommentsPanel({
  token,
  slideId,
  canComment = false,
  canResolveComments = false,
  isAnonymous = true,
  commentsUpdatedAt = null,
}) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState('')
  const [guestName, setGuestName] = useState(() => readReviewerDisplayName())
  const [nameDraft, setNameDraft] = useState(() => readReviewerDisplayName())
  const [creating, setCreating] = useState(false)
  const [mentions, setMentions] = useState([])

  const viewerSessionId = useMemo(() => getOrCreateViewerSessionId(), [])
  const needsName = Boolean(canComment && isAnonymous && !guestName)

  const loadThread = useCallback(async () => {
    if (!token || !slideId || !canComment) {
      setComments([])
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await publicPresentationService.listComments(token, { slideId })
      setComments(commentList(result.data || result))
    } catch (err) {
      setError(err.message || 'Could not load comments.')
    } finally {
      setLoading(false)
    }
  }, [token, slideId, canComment])

  useEffect(() => {
    loadThread()
  }, [loadThread, commentsUpdatedAt])

  useEffect(() => {
    if (!token || !canResolveComments) {
      setMentions([])
      return undefined
    }
    let cancelled = false
    publicPresentationService
      .listMentionableUsers(token)
      .then((result) => {
        if (cancelled) return
        const users = result?.data?.users || result?.users || result?.data || []
        setMentions(Array.isArray(users) ? users : [])
      })
      .catch(() => {
        if (!cancelled) setMentions([])
      })
    return () => {
      cancelled = true
    }
  }, [token, canResolveComments])

  const saveGuestName = () => {
    const next = writeReviewerDisplayName(nameDraft)
    if (next.length < 1) {
      setError('Enter a name (1–80 characters) to comment.')
      return
    }
    setGuestName(next)
    setError('')
  }

  const submit = async () => {
    const text = draft.trim()
    if (!text || !canComment || !slideId) return
    if (isAnonymous && !guestName) {
      setError('Enter a name to comment.')
      return
    }
    setCreating(true)
    setError('')
    try {
      const payload = {
        body: text,
        slideId,
        viewerSessionId,
      }
      if (isAnonymous) payload.displayName = guestName
      await publicPresentationService.createComment(token, payload)
      setDraft('')
      await loadThread()
    } catch (err) {
      setError(err.message || 'Could not post comment.')
    } finally {
      setCreating(false)
    }
  }

  const resolveThread = async (comment, resolve) => {
    if (!canResolveComments) return
    try {
      await publicPresentationService.resolveComment(token, comment.id, resolve)
      await loadThread()
    } catch (err) {
      setError(err.message || 'Could not update thread.')
    }
  }

  const removeComment = async (comment) => {
    try {
      await publicPresentationService.deleteComment(token, comment.id, viewerSessionId)
      await loadThread()
    } catch (err) {
      setError(err.message || 'Could not delete comment.')
    }
  }

  if (!canComment) return null

  return (
    <div className="ppt-comments-panel">
      {needsName && (
        <div className="ppt-public-comment-name">
          <p className="ppt-slide-panel-hint" style={{ marginTop: 0 }}>
            Choose a name so reviewers know who left feedback.
          </p>
          <input
            type="text"
            maxLength={80}
            className="ppt-editor-modal-link-input"
            placeholder="Your name"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                saveGuestName()
              }
            }}
          />
          <button
            type="button"
            className="ppt-slide-panel-btn ppt-slide-panel-btn--block"
            style={{ marginTop: 8 }}
            onClick={saveGuestName}
            disabled={!nameDraft.trim()}
          >
            Continue
          </button>
        </div>
      )}

      {loading && <p className="ppt-slide-panel-hint">Loading comments…</p>}
      {error && (
        <p className="ppt-slide-panel-hint" style={{ color: '#dc2626' }}>
          {error}
        </p>
      )}

      <div className="ppt-comments-panel-list">
        {comments.length === 0 && !loading && !needsName && (
          <p className="ppt-slide-panel-hint">No comments on this slide yet.</p>
        )}
        {comments.map((c) => {
          const resolved = Boolean(c.resolved || c.isResolved)
          return (
            <div key={c.id} className="ppt-comment-item">
              <strong>{commentAuthor(c)}</strong>
              {resolved ? <span className="ppt-comment-resolved">Resolved</span> : null}
              <p style={{ margin: '4px 0 0' }}>{commentText(c)}</p>
              <div className="ppt-comment-actions">
                {canResolveComments && !c.parentId ? (
                  <button
                    type="button"
                    className="ppt-comment-action"
                    onClick={() => resolveThread(c, !resolved)}
                  >
                    {resolved ? 'Reopen' : 'Resolve'}
                  </button>
                ) : null}
                <button
                  type="button"
                  className="ppt-comment-action"
                  onClick={() => removeComment(c)}
                >
                  Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {!needsName && (
        <div className="ppt-comment-form" style={{ marginTop: 12 }}>
          <textarea
            placeholder="Add a comment…"
            value={draft}
            disabled={creating}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit()
            }}
          />
          {canResolveComments && mentions.length > 0 && (
            <p className="ppt-slide-panel-hint">
              Teammates you can mention:{' '}
              {mentions
                .slice(0, 6)
                .map((u) => u.name || u.email)
                .filter(Boolean)
                .join(', ')}
            </p>
          )}
          <button
            type="button"
            className="ppt-slide-panel-btn ppt-slide-panel-btn--block"
            style={{ marginTop: 8 }}
            disabled={creating || !draft.trim()}
            onClick={submit}
          >
            {creating ? 'Posting…' : 'Post comment'}
          </button>
        </div>
      )}
    </div>
  )
}
