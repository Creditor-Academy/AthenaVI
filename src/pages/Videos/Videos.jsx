import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { sanitizeUserFacingMessage } from '../../utils/userFacingMessage'
import { consumeDashboardSearchContext } from '../../utils/dashboardSearchNavigate.js'
import Toast from '../../components/ui/Toast/Toast'
import {
  MdApps,
  MdClose,
  MdDownload,
  MdFilterList,
  MdGridView,
  MdImage,
  MdPresentToAll,
  MdSlideshow,
  MdSort,
  MdVideoLibrary,
  MdViewList,
  MdViewModule,
} from 'react-icons/md'
import { useAuth } from '../../contexts/AuthContext'
import videoLibraryService from '../../services/videoLibraryService'
import workspaceService from '../../services/workspaceService'
import { extractUserId, normalizeWorkspace } from '../TeamWorkspace/workspaceUtils'
import '../../components/features/workspace/workspace/WorkspaceStyles.css'
import VideosSkeleton from '../page-skeleton/VideosSkeleton'
import ExportVideoCard from './ExportVideoCard.jsx'
import ExportVideoRow from './ExportVideoRow.jsx'
import { VideosToolbarDropdown } from './VideosToolbar.jsx'
import {
  applyVideoFilters,
  getCategoryFilterOptions,
  getVideoEmptyHint,
  getVideoEmptyTitle,
  groupVideos,
  sortVideos,
  VIDEO_GROUP_OPTIONS,
  VIDEO_SECTION_OPTIONS,
  VIDEO_SORT_OPTIONS,
  WORK_CATEGORY_TABS,
} from './videosUtils'
import './Videos.css'

const PAGE_SIZE = 20

const CATEGORY_TAB_ICONS = {
  all: MdApps,
  avatar_video: MdVideoLibrary,
  ppt: MdSlideshow,
  image: MdImage,
}

function Videos({ onEdit }) {
  const { user: authUser } = useAuth()
  const currentUserId = extractUserId(authUser)
  const [fetchedVideos, setFetchedVideos] = useState([])
  const [workspaceMap, setWorkspaceMap] = useState(() => new Map())
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [activeSection, setActiveSection] = useState('all')
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBy, setFilterBy] = useState('all')
  const [sortBy, setSortBy] = useState('completed_desc')
  const [groupBy, setGroupBy] = useState('none')
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [previewItem, setPreviewItem] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [actionId, setActionId] = useState(null)
  const [toast, setToast] = useState(null)
  const toastTimeoutRef = useRef(null)

  useEffect(() => {
    const ctx = consumeDashboardSearchContext('videos')
    if (ctx?.searchQuery) setSearchQuery(ctx.searchQuery)
  }, [])

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
      const taggedVideos = (result.videos || []).map((v) => ({
        ...v,
        category: 'avatar_video',
      }))
      setFetchedVideos((prev) => (append ? [...prev, ...taggedVideos] : taggedVideos))
      setPagination(result.pagination)
    } catch (error) {
      console.error('Failed to fetch video exports:', error)
      showToast(error.message || 'Failed to load video exports', 'error')
      if (!append) setFetchedVideos([])
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
        console.warn('Failed to load workspaces for filters:', error)
      }
    }

    loadWorkspaces()
    return () => {
      cancelled = true
    }
  }, [currentUserId, authUser])

  const allWorkItems = useMemo(() => {
    return fetchedVideos
  }, [fetchedVideos])

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: allWorkItems.length, avatar_video: 0, ppt: 0, image: 0 }
    allWorkItems.forEach((item) => {
      const cat = item.category || 'avatar_video'
      if (counts[cat] !== undefined) counts[cat] += 1
    })
    return counts
  }, [allWorkItems])

  // Dynamic filter options based on selected category
  const dynamicFilterOptions = useMemo(
    () => getCategoryFilterOptions(activeCategory),
    [activeCategory]
  )

  const filteredWorkItems = useMemo(() => {
    const filtered = applyVideoFilters(allWorkItems, {
      searchQuery,
      filterBy,
      currentUserId,
      workspaceMap,
      activeSection,
      activeCategory,
    })
    return sortVideos(filtered, sortBy)
  }, [allWorkItems, workspaceMap, currentUserId, activeSection, activeCategory, searchQuery, filterBy, sortBy])

  const workGroups = useMemo(
    () => groupVideos(filteredWorkItems, groupBy),
    [filteredWorkItems, groupBy]
  )

  const hasSearch = Boolean(searchQuery.trim()) || filterBy !== 'all' || activeCategory !== 'all' || activeSection !== 'all'

  const handleResetFilters = () => {
    setSearchQuery('')
    setFilterBy('all')
    setActiveSection('all')
    setGroupBy('none')
  }

  const openPreview = async (item) => {
    setPreviewItem(item)
    setPreviewUrl('')
    if (item.category === 'avatar_video') {
      setPreviewLoading(true)
      try {
        const url = await videoLibraryService.fetchPresignedDownloadUrl(item)
        setPreviewUrl(url || item.downloadPath || '')
      } catch (err) {
        showToast(err.message || 'Failed to load video preview', 'error')
        setPreviewItem(null)
      } finally {
        setPreviewLoading(false)
      }
    }
  }

  const handleDownload = async (item) => {
    setActionId(item.id)
    try {
      if (item.category === 'avatar_video') {
        await videoLibraryService.downloadVideoFile(item, item.title)
        showToast('Video download started', 'success')
      } else if (item.category === 'ppt') {
        const link = document.createElement('a')
        link.href = item.thumbnailUrl || '#'
        link.download = `${item.title.replace(/\s+/g, '_')}`
        document.body.appendChild(link)
        link.click()
        link.remove()
        showToast('Presentation download started', 'success')
      } else {
        const link = document.createElement('a')
        link.href = item.thumbnailUrl || '#'
        link.download = `${item.title.replace(/\s+/g, '_')}`
        document.body.appendChild(link)
        link.click()
        link.remove()
        showToast('Image download started', 'success')
      }
    } catch (err) {
      showToast(err.message || 'Download failed', 'error')
    } finally {
      setActionId(null)
    }
  }

  const handleOpenProject = (item) => {
    if (!onEdit || item.category !== 'avatar_video') return
    onEdit({
      id: item.projectId,
      workspaceId: item.workspaceId,
      folderId: item.folderId,
      title: item.title,
    })
  }

  const hasMore = pagination.page < pagination.totalPages

  const categoryLabels = {
    all: 'work items',
    avatar_video: 'avatar videos',
    ppt: 'PPT presentations',
    image: 'images',
  }

  const renderWorkCollection = (collection) => (
    <div
      className={`items-container videos-export-items ${
        viewMode === 'grid' ? 'tile-view' : 'list-view export-list-view'
      }`}
    >
      {viewMode === 'list' ? (
        <div className="list-header export-list-header">
          <div className="col" />
          <div className="col">Name & Category</div>
          <div className="col">Workspace</div>
          <div className="col">Completed</div>
          <div className="col">Details / Size</div>
          <div className="col">Author</div>
          <div className="col" />
        </div>
      ) : null}

      {collection.map((item) => {
        const handlers = {
          onPreview: () => openPreview(item),
          onDownload: () => handleDownload(item),
          onOpenProject: onEdit ? () => handleOpenProject(item) : null,
          downloading: actionId === item.id,
        }

        return viewMode === 'grid' ? (
          <ExportVideoCard key={item.id} video={item} {...handlers} />
        ) : (
          <ExportVideoRow key={item.id} video={item} {...handlers} />
        )
      })}
    </div>
  )

  return (
    <div className="videos-page my-work-page">
      <div className="videos-shell">
        {/* Executive Header Area */}
        <header className="videos-page-header">
          <div className="videos-title-section">
            <h1 className="videos-page-title">My Work</h1>
          </div>

          <div className="videos-actions">
            {/* View Mode Toggle (First) */}
            <div className="view-toggle" aria-label="View toggle">
              <button
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
                type="button"
              >
                <MdGridView size={18} />
              </button>
              <button
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
                type="button"
              >
                <MdViewList size={18} />
              </button>
            </div>

            {/* Filter Dropdown */}
            <VideosToolbarDropdown
              label="Filter"
              icon={MdFilterList}
              value={filterBy}
              defaultValue="all"
              options={dynamicFilterOptions}
              onChange={setFilterBy}
              menuLabel="Filter options"
            />

            {/* Sort Dropdown */}
            <VideosToolbarDropdown
              label="Sort"
              icon={MdSort}
              value={sortBy}
              defaultValue="completed_desc"
              options={VIDEO_SORT_OPTIONS}
              onChange={setSortBy}
              menuLabel="Sort options"
            />

            {/* Group Dropdown */}
            <VideosToolbarDropdown
              label="Group"
              icon={MdViewModule}
              value={groupBy}
              defaultValue="none"
              options={VIDEO_GROUP_OPTIONS}
              onChange={setGroupBy}
              menuLabel="Group by options"
            />
          </div>
        </header>

        {/* Workspace-Style Category Switch Tabs */}
        <div className="workspace-root-tabs-wrapper work-root-tabs-wrapper" role="tablist" aria-label="Work categories">
          <div className="workspace-root-tabs">
            {WORK_CATEGORY_TABS.map((cat) => {
              const Icon = CATEGORY_TAB_ICONS[cat.id]
              const isActive = activeCategory === cat.id
              const count = categoryCounts[cat.id] || 0
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`workspace-root-tab ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setActiveCategory(cat.id)
                    setFilterBy('all')
                  }}
                >
                  <Icon size={18} />
                  <span>{cat.label}</span>
                  <span className="tab-count-badge">{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        <main className="videos-main">
          {loading && fetchedVideos.length === 0 ? (
            <VideosSkeleton viewMode={viewMode} />
          ) : filteredWorkItems.length === 0 ? (
            <div className="videos-empty-state">
              <div className="videos-empty-state__card">
                <span className="videos-empty-state__icon-wrap" aria-hidden>
                  {activeCategory === 'ppt' ? (
                    <MdSlideshow size={28} />
                  ) : activeCategory === 'image' ? (
                    <MdImage size={28} />
                  ) : (
                    <MdVideoLibrary size={28} />
                  )}
                </span>
                <p className="videos-empty-state__eyebrow">
                  {hasSearch ? 'No matching results' : 'Empty collection'}
                </p>
                <h3 className="videos-empty-state__title">
                  {getVideoEmptyTitle(activeSection, hasSearch, activeCategory)}
                </h3>
                <p className="videos-empty-state__description">
                  {getVideoEmptyHint(activeSection, hasSearch, activeCategory)}
                </p>
                {hasSearch ? (
                  <button
                    type="button"
                    className="videos-empty-state__cta"
                    onClick={handleResetFilters}
                  >
                    Reset All Filters
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="videos-groups">
              {workGroups.map((group) => (
                <section key={group.key} className="videos-group">
                  {group.label ? (
                    <h3 className="videos-group__heading">
                      <span>{group.label}</span>
                      <span className="videos-group__count">({group.videos.length})</span>
                    </h3>
                  ) : null}
                  {renderWorkCollection(group.videos)}
                </section>
              ))}
            </div>
          )}

          {hasMore && !loading && activeCategory === 'all' ? (
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

      {/* Preview Modals for Avatar Video, PPT Presentation, and Image */}
      {previewItem ? (
        <div className="videos-preview-modal work-preview-modal" role="dialog" aria-modal="true">
          <div className="videos-preview-backdrop" onClick={() => setPreviewItem(null)} />
          <div className="videos-preview-panel work-preview-panel">
            <header className="videos-preview-header">
              <div className="preview-header-meta">
                <span className={`preview-cat-badge badge-${previewItem.category || 'avatar_video'}`}>
                  {previewItem.category === 'ppt'
                    ? 'PPT Presentation'
                    : previewItem.category === 'image'
                    ? 'Image Asset'
                    : 'Avatar Video'}
                </span>
                <h3>{previewItem.title}</h3>
              </div>
              <div className="preview-header-actions">
                <button
                  type="button"
                  className="preview-download-btn"
                  onClick={() => handleDownload(previewItem)}
                  title="Download File"
                >
                  <MdDownload size={18} />
                  Download
                </button>
                <button type="button" onClick={() => setPreviewItem(null)} aria-label="Close">
                  <MdClose size={22} />
                </button>
              </div>
            </header>

            {previewItem.category === 'ppt' ? (
              <div className="ppt-preview-container">
                <div className="ppt-preview-stage">
                  {previewItem.thumbnailUrl ? (
                    <img src={previewItem.thumbnailUrl} alt={previewItem.title} className="ppt-slide-preview-img" />
                  ) : (
                    <div className="ppt-slide-placeholder">
                      <MdPresentToAll size={64} />
                      <h4>{previewItem.title}</h4>
                      <p>{previewItem.description || 'PowerPoint Presentation Deck'}</p>
                    </div>
                  )}
                </div>
                <div className="ppt-preview-footer">
                  <div className="ppt-meta-info">
                    <span>📊 {previewItem.slideCount || 14} Presentation Slides</span>
                    <span>16:9 HD Format</span>
                    <span>{previewItem.workspaceName}</span>
                  </div>
                  <p className="ppt-desc-text">{previewItem.description}</p>
                </div>
              </div>
            ) : previewItem.category === 'image' ? (
              <div className="image-preview-container">
                <div className="image-preview-stage">
                  <img
                    src={previewItem.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'}
                    alt={previewItem.title}
                    className="image-lightbox-img"
                  />
                </div>
                <div className="image-preview-footer">
                  <div className="image-meta-info">
                    <span>🖼️ Resolution: {previewItem.dimensions || '3840x2160'}</span>
                    <span>PNG Graphic</span>
                    <span>{previewItem.workspaceName}</span>
                  </div>
                </div>
              </div>
            ) : previewLoading ? (
              <p className="videos-preview-status">Loading video preview…</p>
            ) : previewUrl ? (
              <video src={previewUrl} controls autoPlay className="videos-preview-player" />
            ) : (
              <p className="videos-preview-status">Preview unavailable for this video.</p>
            )}
          </div>
        </div>
      ) : null}

      <Toast toast={toast} />
    </div>
  )
}

export default Videos
