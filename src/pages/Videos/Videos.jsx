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
  MdSlideshow,
  MdSort,
  MdVideoLibrary,
  MdViewList,
  MdViewModule,
} from 'react-icons/md'
import { useAuth } from '../../contexts/AuthContext'
import workspaceService from '../../services/workspaceService'
import { extractUserId, normalizeWorkspace } from '../TeamWorkspace/workspaceUtils'
import {
  normalizeLibraryItem,
  normalizeLibraryCategories,
  normalizeLibraryCategoryId,
} from '../../utils/workspaceLibrary.js'
import '../../components/features/workspace/workspace/WorkspaceStyles.css'
import VideosSkeleton from '../page-skeleton/VideosSkeleton'
import ExportVideoCard from './ExportVideoCard.jsx'
import ExportVideoRow from './ExportVideoRow.jsx'
import PresentationDeckPreviewModal from './PresentationDeckPreviewModal.jsx'
import { VideosToolbarDropdown } from './VideosToolbar.jsx'
import {
  applyVideoFilters,
  getCategoryFilterOptions,
  getVideoEmptyHint,
  getVideoEmptyTitle,
  groupVideos,
  normalizeWorkCategoryId,
  sortVideos,
  VIDEO_GROUP_OPTIONS,
  VIDEO_SORT_OPTIONS,
  WORK_CATEGORY_TABS,
} from './videosUtils'
import './Videos.css'

const CATEGORY_TAB_ICONS = {
  all: MdApps,
  video: MdVideoLibrary,
  presentation: MdSlideshow,
  image: MdImage,
}

function toWorkCardItem(item, workspace) {
  const normalized = normalizeLibraryItem(item, { workspaceId: workspace?.id })
  const kind = normalizeLibraryCategoryId(normalized.kind) || 'video'
  return {
    ...normalized,
    category: kind,
    kind,
    title: normalized.title || normalized.name,
    workspaceId: workspace?.id || normalized.workspaceId,
    workspaceName: workspace?.name || item.workspaceName || '',
    workspaceType: workspace?.type,
    completedAt: normalized.lastModifiedAt || normalized.createdAt,
    fileSizeBytes: normalized.storageBytes ?? normalized.sizeBytes ?? null,
    thumbnailUrl: normalized.thumbnailUrl || normalized.thumbnail || null,
    slideCount: normalized.slideCount,
    triggeredBy: item.owner || item.lastModifiedBy || item.triggeredBy || null,
  }
}

function Videos({ onEdit, onOpenImage }) {
  const { user: authUser } = useAuth()
  const currentUserId = extractUserId(authUser)
  const [fetchedVideos, setFetchedVideos] = useState([])
  const [workspaceMap, setWorkspaceMap] = useState(() => new Map())
  const [categoryCounts, setCategoryCounts] = useState({
    all: 0,
    video: 0,
    presentation: 0,
    image: 0,
  })
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [activeSection, setActiveSection] = useState('all')
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBy, setFilterBy] = useState('all')
  const [sortBy, setSortBy] = useState('completed_desc')
  const [groupBy, setGroupBy] = useState('none')
  const [previewItem, setPreviewItem] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [actionId, setActionId] = useState(null)
  const [toast, setToast] = useState(null)
  const toastTimeoutRef = useRef(null)
  const workspacesRef = useRef([])

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

  const loadLibraryForWorkspaces = useCallback(async (workspaces, category) => {
    const catsToLoad =
      category === 'all' ? ['video', 'presentation', 'image'] : [normalizeWorkCategoryId(category)]

    const results = await Promise.all(
      workspaces.map(async (ws) => {
        try {
          const [catData, ...lists] = await Promise.all([
            workspaceService.getLibrary(ws.id).catch(() => ({ categories: [] })),
            ...catsToLoad.map((cat) =>
              workspaceService
                .getLibrary(ws.id, {
                  category: cat,
                  ...(cat === 'image' ? { take: 40, skip: 0 } : {}),
                })
                .catch(() => ({ items: [] }))
            ),
          ])

          const categories = normalizeLibraryCategories(catData.categories)
          const items = lists.flatMap((list, index) => {
            const kind = catsToLoad[index]
            return (list.items || []).map((item) =>
              toWorkCardItem({ ...item, kind: item.kind || kind }, ws)
            )
          })

          return { workspaceId: ws.id, categories, items }
        } catch (error) {
          console.warn(`Library load failed for workspace ${ws.id}:`, error)
          return { workspaceId: ws.id, categories: normalizeLibraryCategories([]), items: [] }
        }
      })
    )

    const counts = { all: 0, video: 0, presentation: 0, image: 0 }
    results.forEach((result) => {
      result.categories.forEach((cat) => {
        if (counts[cat.id] != null) counts[cat.id] += Number(cat.count) || 0
      })
    })
    counts.all = counts.video + counts.presentation + counts.image

    const items = results.flatMap((r) => r.items)
    return { counts, items }
  }, [])

  const fetchWorkItems = useCallback(async () => {
    setLoading(true)
    try {
      let workspaces = workspacesRef.current
      if (!workspaces.length) {
        const rawWorkspaces = await workspaceService.listWorkspaces()
        workspaces = (rawWorkspaces || []).map((ws) =>
          normalizeWorkspace(ws, currentUserId, authUser)
        )
        workspacesRef.current = workspaces
        setWorkspaceMap(new Map(workspaces.map((ws) => [ws.id, ws])))
      }

      const { counts, items } = await loadLibraryForWorkspaces(workspaces, activeCategory)
      setCategoryCounts(counts)
      setFetchedVideos(items)
    } catch (error) {
      console.error('Failed to fetch workspace library:', error)
      showToast(error.message || 'Failed to load work items', 'error')
      setFetchedVideos([])
    } finally {
      setLoading(false)
    }
  }, [activeCategory, authUser, currentUserId, loadLibraryForWorkspaces])

  useEffect(() => {
    fetchWorkItems()
  }, [fetchWorkItems])

  const allWorkItems = fetchedVideos

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
  }, [
    allWorkItems,
    workspaceMap,
    currentUserId,
    activeSection,
    activeCategory,
    searchQuery,
    filterBy,
    sortBy,
  ])

  const workGroups = useMemo(
    () => groupVideos(filteredWorkItems, groupBy),
    [filteredWorkItems, groupBy]
  )

  const hasSearch =
    Boolean(searchQuery.trim()) ||
    filterBy !== 'all' ||
    activeCategory !== 'all' ||
    activeSection !== 'all'

  const handleResetFilters = () => {
    setSearchQuery('')
    setFilterBy('all')
    setActiveSection('all')
    setGroupBy('none')
  }

  const openPreview = (item) => {
    setPreviewItem(item)
    const kind = normalizeWorkCategoryId(item.category || item.kind)
    if (kind === 'presentation') {
      // Deck images load via GET .../presentations/:id/preview — never list thumbnailUrl.
      setPreviewUrl('')
      return
    }
    if (kind === 'image') {
      setPreviewUrl(item.url || item.thumbnailUrl || item.thumbnail || '')
      return
    }
    setPreviewUrl(item.thumbnailUrl || item.thumbnail || '')
  }

  const handleDownload = async (item) => {
    setActionId(item.id)
    try {
      const kind = normalizeWorkCategoryId(item.category || item.kind)
      const href = item.url || item.thumbnailUrl || item.thumbnail
      if (!href) {
        showToast('No downloadable file for this item', 'error')
        return
      }
      const link = document.createElement('a')
      link.href = href
      link.download = `${String(item.title || item.name || kind).replace(/\s+/g, '_')}`
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      document.body.appendChild(link)
      link.click()
      link.remove()
      showToast(
        kind === 'presentation'
          ? 'Presentation download started'
          : kind === 'image'
            ? 'Image download started'
            : 'Download started',
        'success'
      )
    } catch (err) {
      showToast(err.message || 'Download failed', 'error')
    } finally {
      setActionId(null)
    }
  }

  const handleOpenProject = (item) => {
    const kind = normalizeWorkCategoryId(item.category || item.kind)
    if (kind === 'image') {
      onOpenImage?.(item)
      return
    }
    if (!onEdit) return
    onEdit({
      ...item,
      id: item.id,
      workspaceId: item.workspaceId,
      folderId: item.folderId,
      title: item.title || item.name,
      type: item.type || (kind === 'presentation' ? 'PRESENTATION' : 'VIDEO'),
      kind,
      category: kind,
    })
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
          <div className="col">Name</div>
          <div className="col">Type</div>
          <div className="col">Workspace</div>
          <div className="col">Updated</div>
          <div className="col">Details / Size</div>
          <div className="col">Author</div>
          <div className="col" />
        </div>
      ) : null}

      {collection.map((item) => {
        const handlers = {
          onPreview: () => openPreview(item),
          onDownload: () => handleDownload(item),
          onOpenProject: onEdit || onOpenImage ? () => handleOpenProject(item) : null,
          downloading: actionId === item.id,
        }

        return viewMode === 'grid' ? (
          <ExportVideoCard
            key={`${item.kind}-${item.workspaceId}-${item.id}`}
            video={item}
            {...handlers}
          />
        ) : (
          <ExportVideoRow
            key={`${item.kind}-${item.workspaceId}-${item.id}`}
            video={item}
            {...handlers}
          />
        )
      })}
    </div>
  )

  const previewKind = previewItem
    ? normalizeWorkCategoryId(previewItem.category || previewItem.kind)
    : null

  return (
    <div className="videos-page my-work-page">
      <div className="videos-shell">
        <header className="videos-page-header">
          <div className="videos-title-section">
            <h1 className="videos-page-title">My Work</h1>
          </div>

          <div className="videos-actions">
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

            <VideosToolbarDropdown
              label="Filter"
              icon={MdFilterList}
              value={filterBy}
              defaultValue="all"
              options={dynamicFilterOptions}
              onChange={setFilterBy}
              menuLabel="Filter options"
            />

            <VideosToolbarDropdown
              label="Sort"
              icon={MdSort}
              value={sortBy}
              defaultValue="completed_desc"
              options={VIDEO_SORT_OPTIONS}
              onChange={setSortBy}
              menuLabel="Sort options"
            />

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

        <div
          className="workspace-root-tabs-wrapper work-root-tabs-wrapper"
          role="tablist"
          aria-label="Work categories"
        >
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
                  {activeCategory === 'presentation' ? (
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
        </main>
      </div>

      {previewItem && previewKind === 'presentation' ? (
        <PresentationDeckPreviewModal
          item={previewItem}
          onClose={() => setPreviewItem(null)}
          onEdit={onEdit || onOpenImage ? handleOpenProject : undefined}
        />
      ) : null}

      {previewItem && previewKind !== 'presentation' ? (
        <div className="videos-preview-modal work-preview-modal" role="dialog" aria-modal="true">
          <div className="videos-preview-backdrop" onClick={() => setPreviewItem(null)} />
          <div className="videos-preview-panel work-preview-panel">
            <header className="videos-preview-header">
              <div className="preview-header-meta">
                <span className={`preview-cat-badge badge-${previewKind || 'video'}`}>
                  {previewKind === 'image' ? 'Image' : 'Video'}
                </span>
                <h3>{previewItem.title || previewItem.name}</h3>
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

            {previewKind === 'image' ? (
              <div className="image-preview-container">
                {previewUrl ? (
                  <img src={previewUrl} alt={previewItem.title || previewItem.name} />
                ) : (
                  <div className="ppt-slide-placeholder">
                    <MdImage size={64} />
                    <p>No preview available</p>
                  </div>
                )}
                {(onEdit || onOpenImage) && (
                  <div className="ppt-preview-footer">
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => {
                        handleOpenProject(previewItem)
                        setPreviewItem(null)
                      }}
                    >
                      Open in Image Gen
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="image-preview-container">
                {previewUrl ? (
                  <img src={previewUrl} alt={previewItem.title || previewItem.name} />
                ) : (
                  <div className="ppt-slide-placeholder">
                    <MdVideoLibrary size={64} />
                    <p>Open the project to view or edit this video.</p>
                  </div>
                )}
                {onEdit && (
                  <div className="ppt-preview-footer">
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => {
                        handleOpenProject(previewItem)
                        setPreviewItem(null)
                      }}
                    >
                      Open Project
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {toast ? (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      ) : null}
    </div>
  )
}

export default Videos
