import { useCallback, useEffect, useMemo, useState } from 'react'
import publicPresentationService from '../../../services/publicPresentationService'
import {
  getOrCreateViewerSessionId,
  readReviewerDisplayName,
  writeReviewerDisplayName,
} from '../../../utils/pptShareSession'
import { PptCommentComposer, PptCommentThread, PptCommentsShell } from './PptCommentThread'
import { commentListFromPayload, isCommentResolved } from './pptCommentUtils'
import './pptEditorExtras.css'
import './pptPanelUi.css'

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
  const [replyTo, setReplyTo] = useState(null)
  const [replyDraft, setReplyDraft] = useState('')

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
      setComments(commentListFromPayload(result.data || result))
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

  const guestFields = () => {
    const payload = { viewerSessionId }
    if (isAnonymous) payload.displayName = guestName
    return payload
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
      await publicPresentationService.createComment(token, {
        body: text,
        slideId,
        ...guestFields(),
      })
      setDraft('')
      await loadThread()
    } catch (err) {
      setError(err.message || 'Could not post comment.')
    } finally {
      setCreating(false)
    }
  }

  const submitReply = async (parent) => {
    const text = replyDraft.trim()
    if (!text || isCommentResolved(parent)) return
    if (isAnonymous && !guestName) {
      setError('Enter a name to comment.')
      return
    }
    setCreating(true)
    setError('')
    try {
      await publicPresentationService.createComment(token, {
        body: text,
        parentId: parent.id,
        ...guestFields(),
      })
      setReplyDraft('')
      setReplyTo(null)
      await loadThread()
    } catch (err) {
      setError(err.message || 'Could not post reply.')
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
      if (replyTo === comment.id) setReplyTo(null)
      await loadThread()
    } catch (err) {
      setError(err.message || 'Could not delete comment.')
    }
  }

  if (!canComment) return null

  return (
    <PptCommentsShell
      loading={loading}
      error={error}
      empty={comments.length === 0 && !needsName}
      header={
        needsName ? (
          <div className="ppt-cmt-name-gate">
            <p>Choose a name so reviewers know who left feedback.</p>
            <input
              type="text"
              maxLength={80}
              className="ppt-cmt-name-input"
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
              className="ppt-cmt-name-btn"
              onClick={saveGuestName}
              disabled={!nameDraft.trim()}
            >
              Continue
            </button>
          </div>
        ) : null
      }
      composer={
        needsName ? null : (
          <div>
            {canResolveComments && mentions.length > 0 ? (
              <p className="ppt-cmt-mentions">
                Mention:{' '}
                {mentions
                  .slice(0, 6)
                  .map((u) => u.name || u.email)
                  .filter(Boolean)
                  .join(', ')}
              </p>
            ) : null}
            <PptCommentComposer
              value={draft}
              onChange={setDraft}
              onSubmit={submit}
              submitting={creating && !replyTo}
              placeholder="Add a comment…"
            />
          </div>
        )
      }
    >
      {comments.map((c) => (
        <PptCommentThread
          key={c.id}
          comment={c}
          canReply={!isCommentResolved(c) && !needsName}
          canResolve={canResolveComments}
          submitting={creating && replyTo === c.id}
          replyOpen={replyTo === c.id}
          replyDraft={replyDraft}
          onReply={() => {
            setReplyTo(replyTo === c.id ? null : c.id)
            setReplyDraft('')
          }}
          onReplyDraft={setReplyDraft}
          onSubmitReply={() => submitReply(c)}
          onResolve={resolveThread}
          onDelete={removeComment}
        />
      ))}
    </PptCommentsShell>
  )
}
