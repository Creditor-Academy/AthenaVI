import { useCallback, useEffect, useState } from 'react'
import presentationService from '../../../services/presentationService'
import { PptCommentComposer, PptCommentThread, PptCommentsShell } from './PptCommentThread'
import { commentListFromPayload, isCommentResolved } from './pptCommentUtils'
import './pptEditorExtras.css'
import './pptPanelUi.css'

export default function PptCommentsPanel({
  workspaceId,
  presentationId,
  slideId,
  disabled = false,
  commentsUpdatedAt = null,
}) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState('')
  const [creating, setCreating] = useState(false)
  const [replyTo, setReplyTo] = useState(null)
  const [replyDraft, setReplyDraft] = useState('')

  const loadThread = useCallback(async () => {
    if (!workspaceId || !presentationId || !slideId) {
      setComments([])
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await presentationService.listPresentationComments(workspaceId, presentationId, {
        slideId,
      })
      setComments(commentListFromPayload(data))
    } catch (err) {
      setError(err.message || 'Could not load comments.')
    } finally {
      setLoading(false)
    }
  }, [workspaceId, presentationId, slideId])

  useEffect(() => {
    loadThread()
  }, [loadThread, commentsUpdatedAt])

  const submitRoot = async () => {
    const text = draft.trim()
    if (!text || disabled || !slideId) return
    setCreating(true)
    setError('')
    try {
      await presentationService.createPresentationComment(workspaceId, presentationId, {
        body: text,
        slideId,
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
    if (!text || disabled || isCommentResolved(parent)) return
    setCreating(true)
    setError('')
    try {
      await presentationService.createPresentationComment(workspaceId, presentationId, {
        body: text,
        parentId: parent.id,
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
    try {
      await presentationService.resolvePresentationComment(
        workspaceId,
        presentationId,
        comment.id,
        resolve
      )
      await loadThread()
    } catch (err) {
      setError(err.message || 'Could not update thread.')
    }
  }

  const removeComment = async (comment) => {
    try {
      await presentationService.deletePresentationComment(workspaceId, presentationId, comment.id)
      if (replyTo === comment.id) setReplyTo(null)
      await loadThread()
    } catch (err) {
      setError(err.message || 'Could not delete comment.')
    }
  }

  return (
    <PptCommentsShell
      loading={loading}
      error={error}
      empty={comments.length === 0}
      composer={
        <PptCommentComposer
          value={draft}
          onChange={setDraft}
          onSubmit={submitRoot}
          disabled={disabled}
          submitting={creating && !replyTo}
          placeholder="Add a comment…"
        />
      }
    >
      {comments.map((c) => (
        <PptCommentThread
          key={c.id}
          comment={c}
          canReply={!isCommentResolved(c)}
          canResolve
          disabled={disabled}
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
