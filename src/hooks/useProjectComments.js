import { useCallback, useEffect, useRef, useState } from 'react';
import commentService from '../services/commentService.js';

const DEFAULT_LIMIT = 50;

export function useProjectComments(workspaceId, projectId, { enabled = true } = {}) {
  const [comments, setComments] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const requestIdRef = useRef(0);

  const canFetch = Boolean(enabled && workspaceId && projectId);

  const loadComments = useCallback(
    async ({ cursor, append = false } = {}) => {
      if (!canFetch) return;

      const requestId = ++requestIdRef.current;
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      try {
        const data = await commentService.listComments(workspaceId, projectId, {
          limit: DEFAULT_LIMIT,
          cursor: cursor || undefined,
        });

        if (requestId !== requestIdRef.current) return;

        setComments((prev) => {
          if (!append) return data.comments;
          const seen = new Set(prev.map((c) => c.id));
          const merged = [...prev];
          data.comments.forEach((comment) => {
            if (!seen.has(comment.id)) merged.push(comment);
          });
          return merged;
        });
        setNextCursor(data.nextCursor);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(err?.message || 'Failed to load comments');
        if (!append) setComments([]);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [canFetch, workspaceId, projectId]
  );

  const refresh = useCallback(() => loadComments(), [loadComments]);

  const loadMore = useCallback(() => {
    if (!nextCursor || loadingMore) return;
    return loadComments({ cursor: nextCursor, append: true });
  }, [nextCursor, loadingMore, loadComments]);

  useEffect(() => {
    if (!canFetch) {
      setComments([]);
      setNextCursor(null);
      setError(null);
      return;
    }
    loadComments();
  }, [canFetch, workspaceId, projectId, loadComments]);

  const createComment = useCallback(
    async (payload) => {
      if (!canFetch) throw new Error('Comments unavailable');
      setCreating(true);
      setSubmitting(true);
      setError(null);
      try {
        const comment = await commentService.createComment(workspaceId, projectId, payload);
        setComments((prev) => [comment, ...prev]);
        return comment;
      } catch (err) {
        setError(err?.message || 'Failed to post comment');
        throw err;
      } finally {
        setCreating(false);
        setSubmitting(false);
      }
    },
    [canFetch, workspaceId, projectId]
  );

  const updateComment = useCallback(
    async (commentId, payload) => {
      if (!canFetch) throw new Error('Comments unavailable');
      setUpdating(true);
      setSubmitting(true);
      setError(null);
      try {
        const updated = await commentService.updateComment(
          workspaceId,
          projectId,
          commentId,
          payload
        );
        setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
        return updated;
      } catch (err) {
        setError(err?.message || 'Failed to update comment');
        throw err;
      } finally {
        setUpdating(false);
        setSubmitting(false);
      }
    },
    [canFetch, workspaceId, projectId]
  );

  const deleteComment = useCallback(
    async (commentId) => {
      if (!canFetch) throw new Error('Comments unavailable');
      setError(null);
      try {
        await commentService.deleteComment(workspaceId, projectId, commentId);
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        return true;
      } catch (err) {
        setError(err?.message || 'Failed to delete comment');
        throw err;
      }
    },
    [canFetch, workspaceId, projectId]
  );

  return {
    comments,
    commentCount: comments.length,
    nextCursor,
    loading,
    loadingMore,
    error,
    submitting,
    creating,
    updating,
    refresh,
    loadMore,
    createComment,
    updateComment,
    deleteComment,
  };
}

export default useProjectComments;
