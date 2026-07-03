import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { MdDelete, MdEdit, MdMessage, MdSend } from 'react-icons/md';
import MentionAutocomplete from './MentionAutocomplete.jsx';
import UserIdentity from '../../workspace/workspace/UserIdentity.jsx';
import { formatInboxRelativeTime } from '../../../../utils/inboxNotifications.js';
import workspaceService from '../../../../services/workspaceService.js';
import useProjectComments from '../../../../hooks/useProjectComments.js';
import './ProjectCommentsPanel.css';

const EMPTY_MENTION_IDS = Object.freeze([]);

const CommentComposer = memo(function CommentComposer({
  workspaceId,
  projectId,
  editKey = null,
  initialBody = '',
  initialMentionedUserIds = EMPTY_MENTION_IDS,
  submitLabel = 'Post',
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const [body, setBody] = useState(initialBody);
  const [mentionedUserIds, setMentionedUserIds] = useState(initialMentionedUserIds);

  // Only sync when opening edit mode for a specific comment — never on create drafts
  useEffect(() => {
    if (editKey == null) return;
    setBody(initialBody);
    setMentionedUserIds(initialMentionedUserIds);
  }, [editKey, initialBody, initialMentionedUserIds]);

  const handleSubmit = async () => {
    const trimmed = body.trim();
    if (!trimmed || submitting) return;
    await onSubmit({ body: trimmed, mentionedUserIds });
    if (!onCancel) {
      setBody('');
      setMentionedUserIds(EMPTY_MENTION_IDS);
    }
  };

  return (
    <div
      className="project-comments__composer"
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <MentionAutocomplete
        workspaceId={workspaceId}
        projectId={projectId}
        value={body}
        onChange={setBody}
        mentionedUserIds={mentionedUserIds}
        onMentionedUserIdsChange={setMentionedUserIds}
        disabled={submitting}
      />
      <div className="project-comments__composer-actions">
        {onCancel ? (
          <button type="button" className="project-comments__btn project-comments__btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
        <button
          type="button"
          className="project-comments__btn project-comments__btn--primary"
          onClick={handleSubmit}
          disabled={submitting || !body.trim()}
        >
          <MdSend size={16} aria-hidden />
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </div>
  );
});

const CommentRow = memo(function CommentRow({
  comment,
  currentUserId,
  workspaceId,
  projectId,
  highlighted = false,
  onUpdate,
  onDelete,
  submitting = false,
}) {
  const [editing, setEditing] = useState(false);
  const isAuthor = currentUserId && comment.author?.id === currentUserId;
  const rowRef = useRef(null);
  const mentionIds = comment.mentionedUserIds ?? EMPTY_MENTION_IDS;

  useEffect(() => {
    if (highlighted && rowRef.current) {
      rowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlighted]);

  const handleUpdate = async (payload) => {
    await onUpdate(comment.id, payload);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;
    await onDelete(comment.id);
  };

  return (
    <article
      ref={rowRef}
      className={`project-comments__item${highlighted ? ' is-highlighted' : ''}${isAuthor ? ' is-own' : ''}`}
      id={`comment-${comment.id}`}
    >
      <div className="project-comments__item-layout">
        <UserIdentity
          name={comment.author?.name || 'Unknown'}
          profileImage={comment.author?.profileImage}
          compact
          showName={false}
          className="project-comments__avatar"
        />

        <div className="project-comments__item-content">
          <div className="project-comments__item-meta">
            <span className="project-comments__author-name">
              {comment.author?.name || 'Unknown'}
            </span>
            <time className="project-comments__time" dateTime={comment.createdAt}>
              {formatInboxRelativeTime(comment.createdAt)}
              {comment.updatedAt && comment.updatedAt !== comment.createdAt ? ' · edited' : ''}
            </time>
          </div>

          {editing ? (
            <CommentComposer
              editKey={comment.id}
              workspaceId={workspaceId}
              projectId={projectId}
              initialBody={comment.body}
              initialMentionedUserIds={mentionIds}
              submitLabel="Save"
              submitting={submitting}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <p className="project-comments__body">{comment.body}</p>
          )}

          {!editing && isAuthor ? (
            <div className="project-comments__item-actions">
              <button
                type="button"
                className="project-comments__icon-btn"
                onClick={() => setEditing(true)}
                title="Edit comment"
                aria-label="Edit comment"
              >
                <MdEdit size={15} />
              </button>
              <button
                type="button"
                className="project-comments__icon-btn project-comments__icon-btn--danger"
                onClick={handleDelete}
                title="Delete comment"
                aria-label="Delete comment"
              >
                <MdDelete size={15} />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
});

function ProjectCommentsPanel({
  workspaceId,
  projectId,
  highlightCommentId = null,
  onCommentCountChange,
}) {
  const currentUserId = workspaceService.getCurrentUserId();
  const listRef = useRef(null);

  const {
    comments,
    commentCount,
    nextCursor,
    loading,
    loadingMore,
    error,
    creating,
    updating,
    refresh,
    loadMore,
    createComment,
    updateComment,
    deleteComment,
  } = useProjectComments(workspaceId, projectId);

  useEffect(() => {
    onCommentCountChange?.(commentCount);
  }, [commentCount, onCommentCountChange]);

  const handleCreate = useCallback(
    async (payload) => {
      await createComment(payload);
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      });
    },
    [createComment]
  );

  if (!workspaceId || !projectId) {
    return (
      <div className="project-comments">
        <p className="project-comments__empty">Save the project to a workspace to enable comments.</p>
      </div>
    );
  }

  return (
    <div className="project-comments">
      <header className="project-comments__header">
        <div className="project-comments__title-block">
          <div className="project-comments__icon">
            <MdMessage size={18} />
          </div>
          <div>
            <h3 className="project-comments__title">Comments</h3>
            <p className="project-comments__subtitle">Discuss this project with your team</p>
          </div>
        </div>
        <button
          type="button"
          className="project-comments__refresh-btn"
          onClick={refresh}
          disabled={loading}
        >
          Refresh
        </button>
      </header>

      <CommentComposer
        workspaceId={workspaceId}
        projectId={projectId}
        onSubmit={handleCreate}
        submitting={creating}
      />

      {error ? <p className="project-comments__error">{error}</p> : null}

      <div ref={listRef} className="project-comments__list premium-scrollbar">
        {loading && comments.length === 0 ? (
          <p className="project-comments__empty">Loading comments…</p>
        ) : null}

        {!loading && comments.length === 0 ? (
          <p className="project-comments__empty">No comments yet. Start the conversation.</p>
        ) : null}

        {comments.map((comment) => (
          <CommentRow
            key={comment.id}
            comment={comment}
            currentUserId={currentUserId}
            workspaceId={workspaceId}
            projectId={projectId}
            highlighted={highlightCommentId === comment.id}
            onUpdate={updateComment}
            onDelete={deleteComment}
            submitting={updating}
          />
        ))}

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
      </div>
    </div>
  );
}

export default memo(ProjectCommentsPanel);
