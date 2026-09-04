import { useEffect, useState } from 'react'
import {
  FiCheckCircle,
  FiCornerUpLeft,
  FiMessageCircle,
  FiRotateCcw,
  FiSend,
  FiTrash2,
} from 'react-icons/fi'
import {
  commentAuthor,
  commentAvatarTone,
  commentAvatarUrl,
  commentInitials,
  commentRelativeTime,
  commentReplies,
  commentText,
  isCommentResolved,
} from './pptCommentUtils'

export function PptCommentAvatar({ comment, size = 'md' }) {
  const url = commentAvatarUrl(comment)
  const tone = commentAvatarTone(comment)
  if (url) {
    return (
      <img
        className={`ppt-cmt-avatar ppt-cmt-avatar--${size}`}
        src={url}
        alt=""
        referrerPolicy="no-referrer"
      />
    )
  }
  return (
    <span className={`ppt-cmt-avatar ppt-cmt-avatar--${size} ppt-cmt-avatar--tone-${tone}`} aria-hidden>
      {commentInitials(comment)}
    </span>
  )
}

export function PptCommentComposer({
  value,
  onChange,
  onSubmit,
  disabled = false,
  submitting = false,
  placeholder = 'Add a comment…',
  autoFocus = false,
  compact = false,
}) {
  return (
    <form
      className={`ppt-cmt-composer ${compact ? 'ppt-cmt-composer--compact' : ''}`}
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.()
      }}
    >
      <textarea
        rows={compact ? 1 : 2}
        placeholder={placeholder}
        value={value}
        disabled={disabled || submitting}
        autoFocus={autoFocus}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onSubmit?.()
          }
        }}
      />
      <button
        type="submit"
        className="ppt-cmt-send"
        disabled={disabled || submitting || !String(value || '').trim()}
        aria-label={submitting ? 'Posting' : 'Post'}
      >
        <FiSend size={16} />
      </button>
    </form>
  )
}

function CommentBody({ comment, nested = false, resolved = false, actions }) {
  return (
    <article className={`ppt-cmt-row ${nested ? 'ppt-cmt-row--reply' : ''} ${resolved ? 'is-resolved' : ''}`}>
      <PptCommentAvatar comment={comment} size={nested ? 'sm' : 'md'} />
      <div className="ppt-cmt-main">
        <header className="ppt-cmt-head">
          <span className="ppt-cmt-name">{commentAuthor(comment)}</span>
          {commentRelativeTime(comment) ? (
            <time className="ppt-cmt-time">{commentRelativeTime(comment)}</time>
          ) : null}
          {resolved && !nested ? (
            <span className="ppt-cmt-pill">
              <FiCheckCircle size={11} />
              Resolved
            </span>
          ) : null}
        </header>
        <p className="ppt-cmt-body">{commentText(comment)}</p>
        {actions}
      </div>
    </article>
  )
}

export function PptCommentThread({
  comment,
  canReply = false,
  canResolve = false,
  onReply,
  onResolve,
  onDelete,
  replyOpen = false,
  replyDraft = '',
  onReplyDraft,
  onSubmitReply,
  submitting = false,
  disabled = false,
  highlighted = false,
  replyComposer = null,
}) {
  const replies = commentReplies(comment)
  const resolved = isCommentResolved(comment)
  const collapseByDefault = replies.length > 1
  const [expanded, setExpanded] = useState(!collapseByDefault)

  useEffect(() => {
    if (replyOpen) setExpanded(true)
  }, [replyOpen])

  useEffect(() => {
    if (replies.length <= 1) setExpanded(true)
  }, [replies.length])

  const showReplies = replies.length === 1 || expanded

  return (
    <div className={`ppt-cmt-thread ${highlighted ? 'is-highlighted' : ''}`}>
      <CommentBody
        comment={comment}
        resolved={resolved}
        actions={
          <div className="ppt-cmt-actions">
            {canReply && !resolved ? (
              <button type="button" className="ppt-cmt-action" onClick={onReply} disabled={disabled}>
                <FiCornerUpLeft size={13} />
                {replyOpen ? 'Cancel' : 'Reply'}
              </button>
            ) : null}
            {canResolve ? (
              <button
                type="button"
                className="ppt-cmt-action"
                onClick={() => onResolve?.(comment, !resolved)}
                disabled={disabled}
              >
                {resolved ? <FiRotateCcw size={13} /> : <FiCheckCircle size={13} />}
                {resolved ? 'Reopen' : 'Resolve'}
              </button>
            ) : null}
            <button type="button" className="ppt-cmt-action ppt-cmt-action--danger" onClick={() => onDelete?.(comment)}>
              <FiTrash2 size={13} />
              Delete
            </button>
          </div>
        }
      />

      {replies.length > 1 ? (
        <button
          type="button"
          className={`ppt-cmt-expand ${expanded ? 'is-open' : ''}`}
          onClick={() => setExpanded((open) => !open)}
        >
          <span className="ppt-cmt-expand-line" />
          {expanded ? 'Hide replies' : `View all ${replies.length} replies`}
        </button>
      ) : null}

      {showReplies && replies.length > 0 ? (
        <div className="ppt-cmt-replies">
          {replies.map((reply) => (
            <CommentBody
              key={reply.id}
              comment={reply}
              nested
              actions={
                <div className="ppt-cmt-actions">
                  <button
                    type="button"
                    className="ppt-cmt-action ppt-cmt-action--danger"
                    onClick={() => onDelete?.(reply)}
                  >
                    <FiTrash2 size={13} />
                    Delete
                  </button>
                </div>
              }
            />
          ))}
        </div>
      ) : null}

      {replyOpen ? (
        <div className="ppt-cmt-reply-box">
          {replyComposer || (
            <PptCommentComposer
              compact
              autoFocus
              placeholder="Reply…"
              value={replyDraft}
              onChange={onReplyDraft}
              onSubmit={onSubmitReply}
              disabled={disabled || resolved}
              submitting={submitting}
            />
          )}
        </div>
      ) : null}
    </div>
  )
}

export function PptCommentsShell({
  loading = false,
  error = '',
  empty = false,
  emptyLabel = 'No comments on this slide yet',
  emptyHint = 'Share feedback on this slide. Replies stay nested under each comment.',
  children,
  composer,
  header = null,
}) {
  return (
    <div className="ppt-comments-panel ppt-cmt-shell">
      {header}
      {error ? <p className="ppt-cmt-error">{error}</p> : null}
      <div className="ppt-comments-panel-list ppt-cmt-list">
        {loading ? <p className="ppt-cmt-muted">Loading comments…</p> : null}
        {empty && !loading ? (
          <div className="ppt-cmt-empty">
            <span className="ppt-cmt-empty-icon">
              <FiMessageCircle size={22} />
            </span>
            <p>{emptyLabel}</p>
            <span>{emptyHint}</span>
          </div>
        ) : null}
        {children}
      </div>
      {composer}
    </div>
  )
}
