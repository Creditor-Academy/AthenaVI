import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { sanitizeUserFacingMessage } from '../../utils/userFacingMessage'
import {
  MdAdd,
  MdApps,
  MdGridView,
  MdPeople,
  MdPerson,
  MdVideoLibrary,
  MdViewList,
  MdWorkspaces,
  MdClose,
  MdCheckCircle,
  MdCancel,
} from 'react-icons/md'
import { useAuth } from '../../contexts/AuthContext'
import videoLibraryService from '../../services/videoLibraryService'
import workspaceService from '../../services/workspaceService'
import { extractUserId, normalizeWorkspace } from '../TeamWorkspace/workspaceUtils'
import '../../components/features/workspace/workspace/WorkspaceStyles.css'
import VideosSkeleton from '../page-skeleton/VideosSkeleton'
import ExportVideoCard from './ExportVideoCard.jsx'
import ExportVideoRow from './ExportVideoRow.jsx'
import VideosToolbar from './VideosToolbar.jsx'
import {
  applyVideoFilters,
  getVideoEmptyHint,
  getVideoEmptyTitle,
  getVideoSectionSubtitle,
  groupVideos,
  sortVideos,
  VIDEO_FILTER_OPTIONS,
  VIDEO_GROUP_OPTIONS,
  VIDEO_SECTION_TABS,
  VIDEO_SORT_OPTIONS,
} from './videosUtils'
import './Videos.css'

const PAGE_SIZE = 20

const TAB_ICONS = {
  all: MdApps,
  personal: MdPerson,
  'my-workspace': MdWorkspaces,
  'shared-with-me': MdPeople,
}

function Videos({ onCreate, onEdit }) {
  const { user: authUser } = useAuth()
  const currentUserId = extractUserId(authUser)
  const [videos, setVideos] = useState([])
  const [workspaceMap, setWorkspaceMap] = useState(() => new Map())
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [activeSection, setActiveSection] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBy, setFilterBy] = useState('all')
  const [sortBy, setSortBy] = useState('completed_desc')
  const [groupBy, setGroupBy] = useState('none')
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [previewVideo, setPreviewVideo] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [actionId, setActionId] = useState(null)
  const [toast, setToast] = useState(null)
  const toastTimeoutRef = useRef(null)

  const showToast = (message, type = 'success') => {
    setToast({ message: sanitizeUserFacingMessage(message), type })
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

  useEffect(() => {
    let cancelled = false

    const loadWorkspaces = async () => {
      try {
        const rawWorkspaces = await workspaceService.listWorkspaces()
        if (cancelled) return
        const mapped = (rawWorkspaces || []).map((ws) =>
          normalizeWorkspace(ws, currentUserId, authUser)
        )
        setWorkspaceMap(new Map(mapped.map((ws) => [ws.id, ws])))
      } catch (error) {
        console.warn('Failed to load workspaces for video filters:', error)
      }
    }

    loadWorkspaces()
    return () => {
      cancelled = true
    }
  }, [currentUserId, authUser])

  const filteredVideos = useMemo(() => {
    const filtered = applyVideoFilters(videos, {
      searchQuery,
      filterBy,
      currentUserId,
      workspaceMap,
      activeSection,
    });
    return sortVideos(filtered, sortBy);
  }, [videos, workspaceMap, currentUserId, activeSection, searchQuery, filterBy, sortBy]);

  const videoGroups = useMemo(
    () => groupVideos(filteredVideos, groupBy),
    [filteredVideos, groupBy]
  );

  const hasSearch = Boolean(searchQuery.trim()) || filterBy !== 'all';

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

  const renderVideoCollection = (collection) => (
    <div
      className={`items-container videos-export-items ${
        viewMode === 'grid' ? 'tile-view' : 'list-view export-list-view'
      }`}
    >
      {viewMode === 'list' ? (
        <div className="list-header export-list-header">
          <div className="col" />
          <div className="col">Name</div>
          <div className="col">Workspace</div>
          <div className="col">Completed</div>
          <div className="col">Size</div>
          <div className="col">Rendered by</div>
          <div className="col" />
        </div>
      ) : null}

      {collection.map((video) => {
        const handlers = {
          onPreview: () => openPreview(video),
          onDownload: () => handleDownload(video),
          onOpenProject: onEdit ? () => handleOpenProject(video) : null,
          downloading: actionId === video.id,
        };

        return viewMode === 'grid' ? (
          <ExportVideoCard key={video.id} video={video} {...handlers} />
        ) : (
          <ExportVideoRow key={video.id} video={video} {...handlers} />
        );
      })}
    </div>
  );

  return (
    <div className="videos-page">
      <div className="videos-shell">
        <header className="videos-page-header">
          <div className="videos-title-section">
            <h1 className="videos-page-title">My Videos</h1>
            <p className="videos-page-subtitle">
              {getVideoSectionSubtitle(activeSection)}
            </p>
          </div>
          <div className="videos-actions">
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

        <div className="videos-tab-switch" role="tablist" aria-label="Video sections">
          {VIDEO_SECTION_TABS.map((tab) => {
            const Icon = TAB_ICONS[tab.id]
            const isActive = activeSection === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`videos-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveSection(tab.id)}
              >
                <span className="videos-tab-icon" aria-hidden>
                  <Icon size={18} />
                </span>
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        <VideosToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterBy={filterBy}
          onFilterChange={setFilterBy}
          sortBy={sortBy}
          onSortChange={setSortBy}
          groupBy={groupBy}
          onGroupChange={setGroupBy}
          filterOptions={VIDEO_FILTER_OPTIONS}
          sortOptions={VIDEO_SORT_OPTIONS}
          groupOptions={VIDEO_GROUP_OPTIONS}
        />

        <main className="videos-main">
          {loading && videos.length === 0 ? (
            <VideosSkeleton viewMode={viewMode} />
          ) : filteredVideos.length === 0 ? (
            <div className="videos-empty-state">
              <div className="videos-empty-state__card">
                <span className="videos-empty-state__icon-wrap" aria-hidden>
                  <MdVideoLibrary size={28} />
                </span>
                <p className="videos-empty-state__eyebrow">
                  {hasSearch ? 'No results' : 'Nothing here yet'}
                </p>
                <h3 className="videos-empty-state__title">
                  {getVideoEmptyTitle(activeSection, hasSearch)}
                </h3>
                <p className="videos-empty-state__description">
                  {getVideoEmptyHint(activeSection, hasSearch)}
                </p>
                {!hasSearch && onCreate ? (
                  <button type="button" className="videos-empty-state__cta" onClick={onCreate}>
                    <MdAdd size={16} aria-hidden />
                    Create Video
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="videos-groups">
              {videoGroups.map((group) => (
                <section key={group.key} className="videos-group">
                  {group.label ? (
                    <h3 className="videos-group__heading">{group.label}</h3>
                  ) : null}
                  {renderVideoCollection(group.videos)}
                </section>
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
