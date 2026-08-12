import { useCallback, useEffect, useMemo, useState, Fragment } from 'react'
import {
  MdImage,
  MdMovieCreation,
  MdPresentToAll,
  MdSlideshow,
  MdVideoLibrary,
} from 'react-icons/md'
import workspaceService from '../../../../services/workspaceService.js'
import {
  IMAGE_MODE_FILTERS,
  normalizeLibraryCategories,
  normalizeLibraryItem,
  normalizeLibraryCategoryId,
} from '../../../../utils/workspaceLibrary.js'
import { workspaceCanEdit } from '../../../../pages/TeamWorkspace/workspaceUtils.js'
import WorkspaceSection from './WorkspaceSection.jsx'
import {
  VideoCard,
  CreateVideoCard,
} from './ViewCards.jsx'
import { VideoRow } from './ViewRows.jsx'

const CATEGORY_ICONS = {
  video: MdVideoLibrary,
  presentation: MdSlideshow,
  image: MdImage,
}

const FALLBACK_CATEGORIES = normalizeLibraryCategories([])

function emptyCopy(categoryId) {
  if (categoryId === 'presentation') {
    return {
      message: 'No presentations yet',
      actionLabel: 'Create presentation',
      icon: MdSlideshow,
    }
  }
  if (categoryId === 'image') {
    return {
      message: 'No generated images yet',
      actionLabel: 'Open Image Gen',
      icon: MdImage,
    }
  }
  return {
    message: 'No videos yet',
    actionLabel: 'Create video',
    icon: MdVideoLibrary,
  }
}

/**
 * Workspace content tabs driven by GET /api/workspaces/:id/library
 * Videos = VIDEO projects, Presentations = PRESENTATION projects, Images = Image Gen history.
 */
export default function WorkspaceLibrary({
  workspace,
  folder = null,
  viewMode = 'tile',
  sortItems = (items) => items,
  onOpenItem,
  onCreateVideo,
  onCreatePresentation,
  onCreateImage,
  onDetails,
  onRename,
  onMove,
  onDelete,
  className = '',
}) {
  const workspaceId = workspace?.id
  const folderId = folder?.id || null
  const canEdit = workspaceCanEdit(workspace)

  const [categories, setCategories] = useState(FALLBACK_CATEGORIES)
  const [activeCategory, setActiveCategory] = useState('video')
  const [items, setItems] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingItems, setLoadingItems] = useState(false)
  const [error, setError] = useState(null)
  const [imageMode, setImageMode] = useState('all')

  const loadCategories = useCallback(async () => {
    if (!workspaceId) return
    setLoadingCategories(true)
    setError(null)
    try {
      const data = await workspaceService.getLibrary(workspaceId)
      const next = normalizeLibraryCategories(data.categories)
      setCategories(next)
      setActiveCategory((prev) => {
        if (next.some((c) => c.id === prev)) return prev
        return next[0]?.id || 'video'
      })
    } catch (err) {
      console.error('Failed to load workspace library categories:', err)
      setError(err.message || 'Failed to load library')
      setCategories(FALLBACK_CATEGORIES)
    } finally {
      setLoadingCategories(false)
    }
  }, [workspaceId])

  const loadItems = useCallback(async () => {
    if (!workspaceId || !activeCategory) return
    setLoadingItems(true)
    setError(null)
    setItems([])
    try {
      const params = { category: activeCategory }
      if (
        folderId &&
        (activeCategory === 'video' || activeCategory === 'presentation')
      ) {
        params.folderId = folderId
      }
      if (activeCategory === 'image') {
        params.take = 40
        params.skip = 0
        if (imageMode && imageMode !== 'all') params.mode = imageMode
      }

      const data = await workspaceService.getLibrary(workspaceId, params)
      const normalized = (data.items || []).map((item) =>
        normalizeLibraryItem(item, { workspaceId })
      )
      setItems(normalized)

      // Keep folder-scoped video/PPT badge counts aligned with the filtered list.
      // Image counts stay from categories (paginated list length is not total).
      if (activeCategory === 'video' || activeCategory === 'presentation') {
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === activeCategory ? { ...cat, count: normalized.length } : cat
          )
        )
      }
    } catch (err) {
      console.error('Failed to load workspace library items:', err)
      setError(err.message || 'Failed to load items')
      setItems([])
    } finally {
      setLoadingItems(false)
    }
  }, [workspaceId, activeCategory, folderId, imageMode])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const activeMeta = useMemo(() => {
    return (
      categories.find((c) => c.id === activeCategory) || {
        id: activeCategory,
        label: activeCategory,
        count: items.length,
      }
    )
  }, [categories, activeCategory, items.length])

  const sortedItems = useMemo(() => sortItems(items), [items, sortItems])

  const empty = emptyCopy(activeCategory)

  const handleCreate = () => {
    if (activeCategory === 'presentation') onCreatePresentation?.()
    else if (activeCategory === 'image') onCreateImage?.()
    else onCreateVideo?.()
  }

  const renderItems = () => {
    const Component = viewMode === 'tile' ? VideoCard : VideoRow
    const itemElements = sortedItems.map((item) => {
      const kind = normalizeLibraryCategoryId(item.kind) || 'video'
      const isImage = kind === 'image'
      return (
        <Component
          key={`${kind}-${item.id}`}
          video={item}
          onClick={() => onOpenItem?.(item)}
          contextProps={{
            onDetails: onDetails ? () => onDetails(item) : null,
            onRename:
              canEdit && !isImage && onRename ? () => onRename(item) : null,
            onMove: canEdit && !isImage && onMove ? () => onMove(item) : null,
            onDelete:
              canEdit && !isImage && onDelete ? () => onDelete(item) : null,
          }}
        />
      )
    })

    if (viewMode === 'tile' && canEdit) {
      const createLabel =
        activeCategory === 'presentation'
          ? 'New Presentation'
          : activeCategory === 'image'
            ? 'Generate Image'
            : 'New Video'
      const CreateIcon =
        activeCategory === 'presentation'
          ? MdPresentToAll
          : activeCategory === 'image'
            ? MdImage
            : MdMovieCreation

      return (
        <Fragment>
          <CreateVideoCard
            key="create-library-tile"
            onClick={handleCreate}
            label={createLabel}
            badgeLabel={createLabel}
            icon={CreateIcon}
          />
          {itemElements}
        </Fragment>
      )
    }

    return <Fragment>{itemElements}</Fragment>
  }

  return (
    <div className={`workspace-library ${className}`.trim()}>
      <div
        className="workspace-root-tabs-wrapper"
        role="tablist"
        aria-label="Workspace content categories"
      >
        <div className="workspace-root-tabs">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id] || MdVideoLibrary
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`workspace-root-tab ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveCategory(cat.id)
                  if (cat.id !== 'image') setImageMode('all')
                }}
                disabled={loadingCategories}
              >
                <Icon size={18} />
                <span>{cat.label}</span>
                <span className="tab-count-badge">{cat.count ?? 0}</span>
              </button>
            )
          })}
        </div>
      </div>

      {activeCategory === 'image' && (
        <div className="workspace-library-mode-chips" role="group" aria-label="Image modes">
          {IMAGE_MODE_FILTERS.map((mode) => (
            <button
              key={mode.id}
              type="button"
              className={`workspace-library-mode-chip ${imageMode === mode.id ? 'active' : ''}`}
              onClick={() => setImageMode(mode.id)}
            >
              {mode.label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="workspace-permission-note" style={{ marginBottom: 12 }}>
          <span>{error}</span>
        </div>
      )}

      <WorkspaceSection
        title={activeMeta.label || 'Content'}
        count={activeMeta.count ?? sortedItems.length}
        viewMode={viewMode}
        listClassName="project-list-view"
        emptyMessage={loadingItems ? 'Loading…' : empty.message}
        emptyIcon={empty.icon}
        emptyActionLabel={canEdit ? empty.actionLabel : null}
        emptyActionIcon={
          activeCategory === 'presentation'
            ? MdPresentToAll
            : activeCategory === 'image'
              ? MdImage
              : MdMovieCreation
        }
        emptyActionClass="workspace-create-action-btn"
        onEmptyAction={canEdit && !loadingItems ? handleCreate : null}
        showCreateButton={canEdit && viewMode === 'list' && !loadingItems}
        createButtonLabel={
          activeCategory === 'presentation'
            ? 'New Presentation'
            : activeCategory === 'image'
              ? 'Generate Image'
              : 'New Video'
        }
        createButtonIcon={
          activeCategory === 'presentation'
            ? MdPresentToAll
            : activeCategory === 'image'
              ? MdImage
              : MdMovieCreation
        }
        createButtonClass="workspace-create-action-btn"
        onCreateClick={handleCreate}
        showHeader={viewMode === 'list'}
      >
        {viewMode === 'list' && sortedItems.length > 0 && (
          <div className="list-header project-list-header">
            <div className="col" />
            <div className="col">Name</div>
            <div className="col">Owner</div>
            <div className="col">Date created</div>
            <div className="col">Modified by</div>
            <div className="col">Modified at</div>
            <div className="col">Size</div>
            <div className="col" />
          </div>
        )}
        {loadingItems && sortedItems.length === 0 ? null : renderItems()}
      </WorkspaceSection>
    </div>
  )
}
