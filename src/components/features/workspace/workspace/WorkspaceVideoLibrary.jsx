import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  MdDownload,
  MdFolder,
  MdGridView,
  MdPlayArrow,
  MdRefresh,
  MdVideoLibrary,
  MdViewList,
} from 'react-icons/md';
import videoLibraryService from '../../../../services/videoLibraryService.js';
import { formatBytes } from '../../../../utils/formatSize.js';
import './WorkspaceVideoLibrary.css';

function formatCompletedDate(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function WorkspaceVideoLibrary({
  workspaceId,
  isOwner = false,
  onOpenProject,
  pageSize = 20,
}) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [previewVideo, setPreviewVideo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [actionId, setActionId] = useState(null);

  const title = isOwner ? 'My Videos' : 'Team Videos';
  const subtitle = isOwner
    ? 'Completed final exports across this workspace (counts toward your storage).'
    : 'Completed exports for this workspace. Renders by any member appear here.';

  const loadVideos = useCallback(
    async ({ page = 1, append = false } = {}) => {
      if (!workspaceId) {
        setVideos([]);
        return;
      }

      if (append) setLoadingMore(true);
      else setLoading(true);
      setError('');

      try {
        const skip = (page - 1) * pageSize;
        const result = await videoLibraryService.listWorkspaceVideos(workspaceId, {
          take: pageSize,
          skip,
          status: 'completed',
        });

        setVideos((prev) => (append ? [...prev, ...result.videos] : result.videos));
        setPagination(result.pagination);
      } catch (err) {
        setError(err.message || 'Failed to load videos');
        if (!append) setVideos([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [workspaceId, pageSize]
  );

  useEffect(() => {
    loadVideos({ page: 1 });
  }, [loadVideos]);

  const hasMore = pagination.page < pagination.totalPages;

  const openPreview = async (video) => {
    setPreviewVideo(video);
    setPreviewUrl('');
    setPreviewLoading(true);
    try {
      const url = await videoLibraryService.fetchPresignedDownloadUrl(video);
      setPreviewUrl(url || '');
    } catch (err) {
      setError(err.message || 'Failed to load preview');
      setPreviewVideo(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownload = async (video) => {
    setActionId(video.id);
    setError('');
    try {
      await videoLibraryService.downloadVideoFile(video, video.title);
    } catch (err) {
      setError(err.message || 'Download failed');
    } finally {
      setActionId(null);
    }
  };

  const emptyMessage = useMemo(() => {
    if (loading) return null;
    return isOwner
      ? 'No completed exports yet. Finish a render from the editor to see it here.'
      : 'No team exports yet.';
  }, [isOwner, loading]);

  return (
    <section className="workspace-video-library" aria-label={title}>
      <header className="workspace-video-library__header">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <div className="workspace-video-library__actions">
          <div className="view-toggle">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <MdGridView />
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <MdViewList />
            </button>
          </div>
          <button type="button" className="btn-secondary add-btn-small" onClick={() => loadVideos({ page: 1 })}>
            <MdRefresh size={16} /> Refresh
          </button>
        </div>
      </header>

      {error ? <p className="workspace-video-library__error">{error}</p> : null}

      {loading && videos.length === 0 ? (
        <p className="workspace-video-library__status">Loading videos…</p>
      ) : videos.length === 0 ? (
        <div className="workspace-video-library__empty">
          <MdVideoLibrary size={40} aria-hidden />
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'workspace-video-library__grid' : 'workspace-video-library__list'}>
          {videos.map((video) => (
            <article key={video.id} className="workspace-video-library__card">
              <button
                type="button"
                className="workspace-video-library__thumb"
                onClick={() => openPreview(video)}
                aria-label={`Play ${video.title}`}
              >
                <span className="workspace-video-library__play">
                  <MdPlayArrow size={28} />
                </span>
              </button>
              <div className="workspace-video-library__body">
                <h4 title={video.title}>{video.title}</h4>
                <p className="workspace-video-library__meta">
                  {formatCompletedDate(video.completedAt)}
                  {video.fileSizeBytes ? ` · ${formatBytes(video.fileSizeBytes)}` : ''}
                </p>
                {video.triggeredBy?.name ? (
                  <p className="workspace-video-library__byline">Rendered by {video.triggeredBy.name}</p>
                ) : null}
                <div className="workspace-video-library__card-actions">
                  <button
                    type="button"
                    className="btn-secondary add-btn-small"
                    disabled={actionId === video.id}
                    onClick={() => handleDownload(video)}
                  >
                    <MdDownload size={14} /> Download
                  </button>
                  {onOpenProject ? (
                    <button
                      type="button"
                      className="btn-secondary add-btn-small"
                      onClick={() =>
                        onOpenProject({
                          workspaceId: video.workspaceId,
                          projectId: video.projectId,
                          folderId: video.folderId,
                          title: video.title,
                        })
                      }
                    >
                      <MdFolder size={14} /> Open project
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {hasMore ? (
        <div className="workspace-video-library__more">
          <button
            type="button"
            className="btn-secondary"
            disabled={loadingMore}
            onClick={() => loadVideos({ page: pagination.page + 1, append: true })}
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      ) : null}

      {previewVideo ? (
        <div className="workspace-video-library__modal" role="dialog" aria-modal="true">
          <div className="workspace-video-library__modal-backdrop" onClick={() => setPreviewVideo(null)} />
          <div className="workspace-video-library__modal-panel">
            <header>
              <h4>{previewVideo.title}</h4>
              <button type="button" onClick={() => setPreviewVideo(null)} aria-label="Close">
                ×
              </button>
            </header>
            {previewLoading ? (
              <p className="workspace-video-library__status">Loading preview…</p>
            ) : previewUrl ? (
              <video src={previewUrl} controls autoPlay className="workspace-video-library__player" />
            ) : (
              <p className="workspace-video-library__status">Preview unavailable.</p>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default WorkspaceVideoLibrary;
