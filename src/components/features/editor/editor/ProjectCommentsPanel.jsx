import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { FiRefreshCw, FiSend } from 'react-icons/fi'
import MentionAutocomplete from './MentionAutocomplete.jsx'
import {
  PptCommentComposer,
  PptCommentThread,
  PptCommentsShell,
} from '../../../../pages/Slides/AIPptComponents/PptCommentThread.jsx'
import { isCommentResolved } from '../../../../pages/Slides/AIPptComponents/pptCommentUtils.js'
import useProjectComments from '../../../../hooks/useProjectComments.js'
import './ProjectCommentsPanel.css'
import '../../../../pages/Slides/AIPptComponents/pptEditorExtras.css'

const EMPTY_MENTION_IDS = Object.freeze([])

function MentionComposer({
  workspaceId,
  projectId,
  placeholder,
  submitting = false,
  onSubmit,
}) {
  const [body, setBody] = useState('')
  const [mentionedUserIds, setMentionedUserIds] = useState(EMPTY_MENTION_IDS)

  const handleSubmit = async () => {
    const trimmed = body.trim()
    if (!trimmed || submitting) return
    await onSubmit({ body: trimmed, mentionedUserIds })
    setBody('')
    setMentionedUserIds(EMPTY_MENTION_IDS)
  }

  return (
    <form
      className="ppt-cmt-composer"
      onSubmit={(event) => {
        event.preventDefault()
        handleSubmit()
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <MentionAutocomplete
        workspaceId={workspaceId}
        projectId={projectId}
        value={body}
        onChange={setBody}
        mentionedUserIds={mentionedUserIds}
        onMentionedUserIdsChange={setMentionedUserIds}
        disabled={submitting}
        placeholder={placeholder}
        rows={2}
      />
      <button
        type="submit"
        className="ppt-cmt-send"
        disabled={submitting || !body.trim()}
        aria-label={submitting ? 'Posting' : 'Post'}
      >
        <FiSend size={16} />
      </button>
    </form>
  )
}

function ProjectCommentsPanel({
  workspaceId,
  projectId,
  highlightCommentId = null,
  onCommentCountChange,
}) {
  const listRef = useRef(null)
  const [replyTo, setReplyTo] = useState(null)
  const [replyDraft, setReplyDraft] = useState('')
  const {
    comments,
    commentCount,
    nextCursor,
    loading,
    loadingMore,
    error,
    creating,
    refresh,
    loadMore,
    createComment,
    deleteComment,
    resolveComment,
  } = useProjectComments(workspaceId, projectId)

  useEffect(() => {
    onCommentCountChange?.(commentCount)
  }, [commentCount, onCommentCountChange])

  const handleCreate = useCallback(
    async (payload) => {
      try {
        await createComment(payload)
        requestAnimationFrame(() => {
          listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
        })
      } catch {
        /* error is already set on the comments hook */
      }
    },
    [createComment]
  )

  const submitReply = async (parent) => {
    const text = replyDraft.trim()
    if (!text || isCommentResolved(parent)) return
    try {
      await createComment({ body: text, parentId: parent.id })
      setReplyDraft('')
      setReplyTo(null)
    } catch {
      /* error is already set on the comments hook */
    }
  }

  const resolveThread = async (comment, resolve) => {
    try {
      await resolveComment(comment.id, resolve)
    } catch {
      /* error is already set on the comments hook */
    }
  }

  const removeComment = async (comment) => {
    try {
      await deleteComment(comment.id)
      if (replyTo === comment.id) {
        setReplyTo(null)
        setReplyDraft('')
      }
    } catch {
      /* error is already set on the comments hook */
    }
  }

  if (!workspaceId || !projectId) {
    return (
      <div className="project-comments project-comments--thread">
        <PptCommentsShell
          empty
          emptyLabel="Comments unavailable"
          emptyHint="Save the project to a workspace to enable comments."
        />
      </div>
    )
  }

  return (
    <div className="project-comments project-comments--thread">
      <div className="project-comments__toolbar">
        <button
          type="button"
          className="project-comments__refresh-btn"
          onClick={refresh}
          disabled={loading}
        >
          <FiRefreshCw size={13} />
          Refresh
        </button>
      </div>

      <PptCommentsShell
        loading={loading && comments.length === 0}
        error={error || ''}
        empty={!loading && comments.length === 0}
        emptyLabel="No comments yet"
        emptyHint="Start a thread. If a comment has more than one reply, tap View all replies."
        composer={
          <MentionComposer
            workspaceId={workspaceId}
            projectId={projectId}
            onSubmit={handleCreate}
            submitting={creating && !replyTo}
            placeholder="Add a comment…"
          />
        }
      >
        <div ref={listRef} className="project-comments__threads">
          {comments.map((comment) => (
            <div key={comment.id} id={`comment-${comment.id}`}>
              <PptCommentThread
                comment={comment}
                highlighted={
                  highlightCommentId === comment.id ||
                  (comment.replies || []).some((reply) => reply.id === highlightCommentId)
                }
                canReply={!isCommentResolved(comment)}
                canResolve
                submitting={creating && replyTo === comment.id}
                replyOpen={replyTo === comment.id}
                replyDraft={replyDraft}
                onReply={() => {
                  setReplyTo(replyTo === comment.id ? null : comment.id)
                  setReplyDraft('')
                }}
                onReplyDraft={setReplyDraft}
                onSubmitReply={() => submitReply(comment)}
                onResolve={resolveThread}
                onDelete={removeComment}
              />
            </div>
          ))}
        </div>

        {nextCursor ? (
          <button
            type="button"
            className="project-comments__load-more"
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? 'Loading…' : 'Load older comments'}
          </button>
        ) : null}
      </PptCommentsShell>
    </div>
  )
}

export default memo(ProjectCommentsPanel)
