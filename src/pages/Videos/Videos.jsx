import { useCallback, useEffect, useRef, useState } from 'react'
import {
  MdAdd,
  MdDownload,
  MdFolder,
  MdGridView,
  MdPlayArrow,
  MdRefresh,
  MdSearch,
  MdVideoLibrary,
  MdViewList,
  MdClose,
  MdCheckCircle,
  MdCancel,
} from 'react-icons/md'
import videoLibraryService from '../../services/videoLibraryService'
import { formatBytes } from '../../utils/formatSize'
import VideosSkeleton from '../page-skeleton/VideosSkeleton'
import './Videos.css'

const PAGE_SIZE = 20

function formatCompletedDate(iso) {
  if (!iso) return 'Recently'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Recently'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function Videos({ onCreate, onEdit }) {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [previewVideo, setPreviewVideo] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [actionId, setActionId] = useState(null)
  const [toast, setToast] = useState(null)
  const toastTimeoutRef = useRef(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => setToast(null), 2800)
  }

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    }
  }, [])

  const fetchVideos = useCallback(async ({ page = 1, append = false } = {}) => {
    if (append) setLoadingMore(true)
    else setLoading(true)

    try {
      const skip = (page - 1) * PAGE_SIZE
      const result = await videoLibraryService.listUserVideos({
        take: PAGE_SIZE,
        skip,
        status: 'completed',
      })
      setVideos((prev) => (append ? [...prev, ...result.videos] : result.videos))
      setPagination(result.pagination)
    } catch (error) {
      console.error('Failed to fetch videos:', error)
      showToast(error.message || 'Failed to load videos', 'error')
      if (!append) setVideos([])
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    fetchVideos({ page: 1 })
  }, [fetchVideos])

  const filteredVideos = videos.filter((video) => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return true
    return (
      video.title.toLowerCase().includes(q) ||
      video.workspaceName.toLowerCase().includes(q) ||
      (video.triggeredBy?.name || '').toLowerCase().includes(q)
    )
  })

  const openPreview = async (video) => {
    setPreviewVideo(video)
    setPreviewUrl('')
    setPreviewLoading(true)
    try {
      const url = await videoLibraryService.fetchPresignedDownloadUrl(video)
      setPreviewUrl(url || '')
    } catch (err) {
      showToast(err.message || 'Failed to load preview', 'error')
      setPreviewVideo(null)
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleDownload = async (video) => {
    setActionId(video.id)
    try {
      await videoLibraryService.downloadVideoFile(video, video.title)
      showToast('Download started', 'success')
    } catch (err) {
      showToast(err.message || 'Download failed', 'error')
    } finally {
      setActionId(null)
    }
  }

  const handleOpenProject = (video) => {
    if (!onEdit) return
    onEdit({
      id: video.projectId,
      workspaceId: video.workspaceId,
      folderId: video.folderId,
      title: video.title,
    })
  }

  const hasMore = pagination.page < pagination.totalPages

  return (
    <div className="videos-page">
      <div className="videos-shell">
        <header className="videos-page-header">
          <div className="videos-title-section">
            <h1 className="videos-page-title">My Videos</h1>
            <p className="videos-page-subtitle">
              Completed final exports from workspaces you own. Team member renders count toward your storage.
            </p>
          </div>
          <div className="videos-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => fetchVideos({ page: 1 })}
              disabled={loading}
            >
              <MdRefresh size={18} />
            </button>
            <div className="view-toggle">
              <button
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
                type="button"
              >
                <MdGridView />
              </button>
              <button
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
                type="button"
              >
                <MdViewList />
              </button>
            </div>
            <button type="button" className="btn-primary videos-create-btn" onClick={onCreate}>
              <MdAdd size={18} />
              Create Video
            </button>
          </div>
        </header>

        <div className="videos-search-bar">
          <MdSearch size={22} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search exports or workspaces…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search videos"
          />
        </div>

        <main className="videos-main">
          {loading && videos.length === 0 ? (
            <VideosSkeleton />
          ) : filteredVideos.length === 0 ? (
            <div className="empty-videos">
              <MdVideoLibrary className="empty-videos-icon" />
              <h3 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>No completed exports yet</h3>
              <p>Finish a render from the editor, or adjust your search.</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'videos-grid' : 'videos-list'}>
              {filteredVideos.map((video) => (
                <article className={`video-card export-card ${viewMode === 'list' ? 'list-view' : ''}`} key={video.id}>
                  <button
                    type="button"
                    className="video-thumb export-thumb"
                    onClick={() => openPreview(video)}
                    aria-label={`Play ${video.title}`}
                  >
                    <span className="export-play-btn">
                      <MdPlayArrow size={32} />
                    </span>
                    <div className="video-badge completed">EXPORT</div>
                  </button>
                  <div className="video-info">
                    <h4 className="video-title" title={video.title}>{video.title}</h4>
                    <p className="video-meta">
                      {formatCompletedDate(video.completedAt)}
                      {video.fileSizeBytes ? ` · ${formatBytes(video.fileSizeBytes)}` : ''}
                    </p>
                    {video.triggeredBy?.name ? (
                      <p className="video-meta">Rendered by {video.triggeredBy.name}</p>
                    ) : null}
                    <div className="workspace-badge" title={`In workspace: ${video.workspaceName}`}>
                      <MdFolder size={12} style={{ marginRight: '4px' }} />
                      {video.workspaceName || 'Workspace'}
                    </div>
                    <div className="export-card-actions">
                      <button
                        type="button"
                        className="btn-secondary export-action-btn"
                        disabled={actionId === video.id}
                        onClick={() => handleDownload(video)}
                      >
                        <MdDownload size={14} /> Download
                      </button>
                      {onEdit ? (
                        <button
                          type="button"
                          className="btn-secondary export-action-btn"
                          onClick={() => handleOpenProject(video)}
                        >
                          Open project
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {hasMore && !loading ? (
            <div className="videos-load-more">
              <button
                type="button"
                className="btn-secondary"
                disabled={loadingMore}
                onClick={() => fetchVideos({ page: pagination.page + 1, append: true })}
              >
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          ) : null}
        </main>
      </div>

      {previewVideo ? (
        <div className="videos-preview-modal" role="dialog" aria-modal="true">
          <div className="videos-preview-backdrop" onClick={() => setPreviewVideo(null)} />
          <div className="videos-preview-panel">
            <header className="videos-preview-header">
              <h3>{previewVideo.title}</h3>
              <button type="button" onClick={() => setPreviewVideo(null)} aria-label="Close">
                <MdClose size={22} />
              </button>
            </header>
            {previewLoading ? (
              <p className="videos-preview-status">Loading preview…</p>
            ) : previewUrl ? (
              <video src={previewUrl} controls autoPlay className="videos-preview-player" />
            ) : (
              <p className="videos-preview-status">Preview unavailable.</p>
            )}
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className={`videos-toast videos-toast--${toast.type}`}>
          {toast.type === 'success' ? (
            <MdCheckCircle className="videos-toast-icon" />
          ) : (
            <MdCancel className="videos-toast-icon" />
          )}
          <span>{toast.message}</span>
        </div>
      ) : null}
    </div>
  )
}

export default Videos
