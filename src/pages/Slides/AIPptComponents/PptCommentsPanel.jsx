import { useState } from 'react'
import { useProjectComments } from '../../../hooks/useProjectComments'
import './pptEditorExtras.css'

/**
 * Slide-level comments panel — reuses project comment infrastructure.
 * Presentations are treated as projects for comment API purposes.
 */
export default function PptCommentsPanel({
  workspaceId,
  presentationId,
  slideId,
  disabled = false,
}) {
  const {
    comments,
    loading,
    error,
    createComment,
    creating,
  } = useProjectComments(workspaceId, presentationId, {
    enabled: Boolean(workspaceId && presentationId),
  })

  const [draft, setDraft] = useState('')

  const slideComments = comments.filter(
    (c) => !c.slideId || c.slideId === slideId
  )

  const submit = async () => {
    const text = draft.trim()
    if (!text || disabled) return
    await createComment({
      text,
      slideId,
      context: 'presentation',
    })
    setDraft('')
  }

  return (
    <div className="ppt-comments-panel">
      {loading && <p className="ppt-slide-panel-hint">Loading comments…</p>}
      {error && <p className="ppt-slide-panel-hint" style={{ color: '#dc2626' }}>{error}</p>}
      <div className="ppt-comments-panel-list">
        {slideComments.length === 0 && !loading && (
          <p className="ppt-slide-panel-hint">No comments on this slide yet.</p>
        )}
        {slideComments.map((c) => (
          <div key={c.id} className="ppt-comment-item">
            <strong>{c.authorName || c.author?.name || 'User'}</strong>
            <p style={{ margin: '4px 0 0' }}>{c.text || c.body}</p>
          </div>
        ))}
      </div>
      <div className="ppt-comment-form" style={{ marginTop: 12 }}>
        <textarea
          placeholder="Add a comment…"
          value={draft}
          disabled={disabled || creating}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit()
          }}
        />
        <button
          type="button"
          className="ppt-slide-panel-btn ppt-slide-panel-btn--block"
          style={{ marginTop: 8 }}
          disabled={disabled || creating || !draft.trim()}
          onClick={submit}
        >
          {creating ? 'Posting…' : 'Post comment'}
        </button>
      </div>
    </div>
  )
}
