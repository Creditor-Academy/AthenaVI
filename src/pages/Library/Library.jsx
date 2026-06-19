import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Image, Music2, Type, LayoutGrid } from 'lucide-react'
import {
  MdCloudUpload,
  MdImage,
  MdSearch,
  MdPlayCircleFilled,
  MdMusicNote,
  MdGridView,
  MdViewList,
  MdClose,
  MdDeleteOutline,
  MdVideocam,
  MdDriveFileRenameOutline,
  MdStorage,
} from 'react-icons/md'
import assetService, { isAssetInUseError, formatAssetInUseMessage } from '../../services/assetService'
import workspaceService from '../../services/workspaceService'
import { useAuth } from '../../contexts/AuthContext'
import { extractUserId } from '../TeamWorkspace/workspaceUtils'
import { canManageAsset, shouldShowUploader } from '../../utils/assetPermissions'
import { assertUploadFits, dispatchStorageRefresh, formatStorageLimitMessage, isStorageLimitError } from '../../utils/storageQuota'
import { useWorkspaceStorage } from '../../hooks/useStorageQuota'
import StorageUsageBar from '../../components/ui/StorageUsageBar/StorageUsageBar'
import '../../components/ui/StorageUsageBar/StorageUsageBar.css'
import { formatBytes } from '../../utils/formatSize'
import LibraryComingSoon from './LibraryComingSoon'
import './Library.css'

const MASONRY_SKELETON_HEIGHTS = [168, 224, 192, 256, 180, 240, 200, 272, 176, 208, 232, 188]

const CATEGORY_CARDS = [
  { id: 'media', label: 'Media', Icon: Image },
  { id: 'music', label: 'Music', Icon: Music2 },
  { id: 'fonts', label: 'Fonts', Icon: Type },
  { id: 'templates', label: 'Templates', Icon: LayoutGrid },
]

const mediaTabs = [
  { id: 'images', label: 'Photos' },
  { id: 'videos', label: 'Videos' },
]

function Library() {
  const { user } = useAuth()
  const currentUserId = extractUserId(user)
  const [activeView, setActiveView] = useState('grid')
  const [activeTab, setActiveTab] = useState('images')
  const [searchQuery, setSearchQuery] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const fileInputRef = useRef(null)
  const searchRef = useRef(null)
  const [uploadType, setUploadType] = useState('images')
  const [selectedCategory, setSelectedCategory] = useState('media')

  const [workspaces, setWorkspaces] = useState([])
  const [workspaceId, setWorkspaceId] = useState('')
  const [workspaceLoading, setWorkspaceLoading] = useState(true)

  const [assets, setAssets] = useState([])
  const [assetsLoading, setAssetsLoading] = useState(false)
  const [assetsError, setAssetsError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [renamingId, setRenamingId] = useState(null)

  const { storage: workspaceStorage, loading: storageLoading } = useWorkspaceStorage(workspaceId)

  const loadWorkspaces = useCallback(async () => {
    setWorkspaceLoading(true)
    try {
      const list = await workspaceService.listWorkspaces()
      setWorkspaces(list || [])
      if (list?.length) {
        setWorkspaceId((prev) => {
          if (prev && list.some((ws) => String(ws.id) === String(prev))) return prev
          const personal = list.find((ws) => String(ws.type || ws.workspaceType).toUpperCase() === 'PRIVATE')
          return personal?.id || list[0].id
        })
      }
    } catch {
      setWorkspaces([])
    } finally {
      setWorkspaceLoading(false)
    }
  }, [])

  const refreshAssets = useCallback(async () => {
    if (!workspaceId) {
      setAssets([])
      return
    }
    setAssetsLoading(true)
    setAssetsError('')
    try {
      const list = await assetService.listAssets(workspaceId, { take: 100, source: 'all' })
      setAssets(list.map((item) => assetService.normalizeAsset(item)).filter(Boolean))
    } catch (err) {
      setAssets([])
      setAssetsError(err?.message || 'Failed to load assets')
    } finally {
      setAssetsLoading(false)
    }
  }, [workspaceId])

  useEffect(() => {
    loadWorkspaces()
  }, [loadWorkspaces])

  useEffect(() => {
    refreshAssets()
  }, [refreshAssets])

  useEffect(() => {
    if (searchRef?.current) searchRef.current.focus()
  }, [])

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat.id)
    if (cat.id === 'media') setActiveTab('images')
    if (cat.id === 'music') setActiveTab('music')
    if (cat.id === 'fonts') setActiveTab('fonts')
    if (cat.id === 'templates') setActiveTab('templates')
  }

  const visibleTabs = () => {
    if (!selectedCategory) return []
    if (selectedCategory === 'media') return mediaTabs
    if (selectedCategory === 'music') return [{ id: 'music', label: 'Music' }]
    if (selectedCategory === 'fonts') return [{ id: 'fonts', label: 'Fonts' }]
    if (selectedCategory === 'templates') return [{ id: 'templates', label: 'Templates' }]
    return mediaTabs
  }

  const filteredAssets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return assets.filter((asset) => {
      const tab = assetService.toLibraryTab(asset.mediaType)
      if (tab !== activeTab) return false
      if (!q) return true
      return (
        asset.name.toLowerCase().includes(q) ||
        String(asset.id).toLowerCase().includes(q)
      )
    })
  }, [assets, activeTab, searchQuery])

  const handleDeleteAsset = async (assetId) => {
    if (!workspaceId || !assetId) return
    setDeletingId(assetId)
    try {
      await assetService.deleteAsset(workspaceId, assetId)
      setAssets((prev) => prev.filter((asset) => asset.id !== assetId))
      dispatchStorageRefresh()
    } catch (err) {
      setAssetsError(
        isAssetInUseError(err)
          ? formatAssetInUseMessage(err)
          : err?.message || 'Failed to delete asset'
      )
    } finally {
      setDeletingId(null)
    }
  }

  const handleRenameAsset = async (asset) => {
    if (!workspaceId || !asset?.id || renamingId) return
    const nextName = window.prompt('Rename asset', asset.name)
    if (nextName == null) return
    const trimmed = nextName.trim()
    if (!trimmed || trimmed === asset.name) return

    setRenamingId(asset.id)
    setAssetsError('')
    try {
      const updated = await assetService.renameAsset(workspaceId, asset.id, trimmed)
      const normalized = assetService.normalizeAsset(updated)
      if (normalized) {
        setAssets((prev) =>
          prev.map((item) => (item.id === normalized.id ? normalized : item))
        )
      }
    } catch (err) {
      setAssetsError(err?.message || 'Failed to rename asset')
    } finally {
      setRenamingId(null)
    }
  }

  const handleFileInputChange = async (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length) return

    if (!workspaceId) {
      setAssetsError('Select a workspace before uploading.')
      return
    }

    setUploading(true)
    setAssetsError('')
    try {
      for (const file of files) {
        await assertUploadFits(workspaceId, file.size)
        const uploaded = await assetService.uploadAsset(workspaceId, file)
        const normalized = assetService.normalizeAsset(uploaded)
        if (!normalized) continue
        setAssets((prev) => {
          const without = prev.filter((item) => item.id !== normalized.id)
          return [normalized, ...without]
        })
      }
      dispatchStorageRefresh()
    } catch (err) {
      setAssetsError(
        isStorageLimitError(err) ? formatStorageLimitMessage(err) : err?.message || 'Upload failed'
      )
    } finally {
      setUploading(false)
    }
  }

  const openUploadPicker = (type) => {
    setUploadType(type)
    setShowUploadModal(false)
    requestAnimationFrame(() => fileInputRef.current?.click())
  }

  const isUnsupportedCategory = selectedCategory === 'fonts' || selectedCategory === 'templates'
  const isCurrentTabEmpty = !assetsLoading && filteredAssets.length === 0

  const assetIcon = (asset) => {
    if (asset.mediaType === 'video') return <MdVideocam />
    if (asset.mediaType === 'audio') return <MdMusicNote />
    return <MdImage />
  }

  const selectedWorkspace = workspaces.find((ws) => String(ws.id) === String(workspaceId))
  const showUploaderColumn = shouldShowUploader(selectedWorkspace)

  const assetCanManage = useCallback(
    (asset) => canManageAsset(asset, selectedWorkspace, currentUserId),
    [selectedWorkspace, currentUserId]
  )

  const storageUsedBytes = Number(workspaceStorage?.quota?.usedBytes) || 0
  const storageLimitBytes = Number(workspaceStorage?.quota?.limitBytes) || 0
  const storagePercent =
    storageLimitBytes > 0
      ? Math.min(100, Math.round((storageUsedBytes / storageLimitBytes) * 100))
      : 0

  const renderMasonrySkeleton = () => (
    <div className="assets-masonry" aria-busy="true" aria-label="Loading assets">
      {MASONRY_SKELETON_HEIGHTS.map((height, index) => (
        <div
          key={`skeleton-${index}`}
          className="library-masonry-skeleton"
          style={{ height }}
          aria-hidden
        />
      ))}
    </div>
  )

  const renderGridAsset = (asset) => (
    <div key={asset.id} className="asset-card grid masonry-card">
      <div className="asset-preview">
        {asset.mediaType === 'video' ? (
          <video src={asset.url} muted playsInline />
        ) : asset.mediaType === 'audio' ? (
          <div className="asset-preview-icon asset-preview-icon--audio">{assetIcon(asset)}</div>
        ) : asset.url ? (
          <img src={asset.url} alt={asset.name} loading="lazy" />
        ) : (
          <div className="asset-preview-icon">{assetIcon(asset)}</div>
        )}

        {asset.source === 'stock' ? (
          <span className="asset-source-badge">Stock</span>
        ) : null}

        <div className="masonry-card-overlay">
          <div className="asset-name" title={asset.name}>
            {asset.name}
          </div>
          <div className="asset-meta">
            {asset.source === 'stock' ? <span>Stock</span> : null}
            {showUploaderColumn && asset.owner ? <span>{asset.owner}</span> : null}
            {asset.modified ? <span>{asset.modified}</span> : null}
            {asset.sizeLabel ? <span>{asset.sizeLabel}</span> : null}
          </div>
        </div>

        {assetCanManage(asset) ? (
          <div className="masonry-card-actions">
            <button
              type="button"
              className="asset-delete-btn asset-delete-btn--grid asset-action-btn--rename"
              aria-label={`Rename ${asset.name}`}
              disabled={renamingId === asset.id}
              onClick={() => handleRenameAsset(asset)}
            >
              <MdDriveFileRenameOutline />
            </button>
            <button
              type="button"
              className="asset-delete-btn asset-delete-btn--grid"
              aria-label={`Delete ${asset.name}`}
              disabled={deletingId === asset.id}
              onClick={() => handleDeleteAsset(asset.id)}
            >
              <MdDeleteOutline />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )

  return (
    <div className="library-page">
      <div className="library-shell">
        <header className="library-page-header">
          <div className="library-page-header-row">
            <h1 className="library-page-title">Library</h1>
            <div className="library-header-actions">
              {workspaces.length > 0 ? (
                <label className="library-workspace-select">
                  <span className="visually-hidden">Workspace</span>
                  <select
                    value={workspaceId}
                    onChange={(e) => setWorkspaceId(e.target.value)}
                    disabled={workspaceLoading}
                  >
                    {workspaces.map((ws) => (
                      <option key={ws.id} value={ws.id}>
                        {ws.name || 'Workspace'}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              {workspaceId ? (
                <div
                  className="library-storage-compact"
                  title={
                    workspaceStorage?.owner?.name
                      ? `${selectedWorkspace?.name || 'Workspace'} · counts against ${workspaceStorage.owner.name}'s quota`
                      : selectedWorkspace?.name || 'Workspace storage'
                  }
                >
                  <MdStorage size={16} aria-hidden />
                  <div className="library-storage-compact__body">
                    <div className="library-storage-compact__row">
                      <span className="library-storage-compact__label">Storage</span>
                      <span className="library-storage-compact__percent">
                        {storageLoading ? '…' : `${storagePercent}%`}
                      </span>
                    </div>
                    <StorageUsageBar
                      loading={storageLoading}
                      usedBytes={storageUsedBytes}
                      limitBytes={storageLimitBytes}
                      percentUsed={storagePercent}
                      label="Storage used"
                      compact
                      className="library-storage-compact__bar"
                    />
                    <span className="library-storage-compact__detail">
                      {storageLoading
                        ? 'Loading…'
                        : storageLimitBytes > 0
                          ? `${formatBytes(storageUsedBytes)} of ${formatBytes(storageLimitBytes)}`
                          : 'Quota unavailable'}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          {selectedWorkspace ? (
            <p className="library-page-subtitle">
              {uploading
                ? 'Uploading…'
                : assetsLoading
                  ? 'Loading workspace assets…'
                  : `${assets.length} asset${assets.length === 1 ? '' : 's'} in ${selectedWorkspace.name || 'workspace'}`}
            </p>
          ) : !workspaceLoading ? (
            <p className="library-page-subtitle library-page-subtitle--muted">
              Create a workspace to upload and manage assets.
            </p>
          ) : null}
        </header>

        {assetsError ? (
          <div className="library-status-banner library-status-banner--error" role="alert">
            {assetsError}
            <button type="button" onClick={() => setAssetsError('')} aria-label="Dismiss">
              <MdClose />
            </button>
          </div>
        ) : null}

        <div className="library-category-row">
          {CATEGORY_CARDS.map((cat) => {
            const Icon = cat.Icon
            const isSelected = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                className={`library-category-card ${isSelected ? 'library-category-card--selected' : ''}`}
                onClick={() => handleCategoryClick(cat)}
                aria-pressed={isSelected}
              >
                <span className="library-category-card-shine" aria-hidden />
                <Icon className="library-category-card-icon" size={20} strokeWidth={1.75} aria-hidden />
                <span className="library-category-label">{cat.label}</span>
              </button>
            )
          })}
        </div>

        {selectedCategory && !isUnsupportedCategory ? (
          <div className="library-filters-bar">
            <div className="filters-top-row">
              <div className="asset-type-tabs">
                {visibleTabs().map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`type-tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="filters-right-actions">
                <div className="library-search" style={{ marginRight: 12, position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <MdSearch style={{ position: 'absolute', left: 12, color: '#9CA3AF' }} />
                  <input
                    ref={searchRef}
                    type="text"
                    className="library-search-input"
                    placeholder="Search assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search assets"
                    style={{ padding: '8px 12px 8px 36px', borderRadius: 999, border: '1px solid #E5E7EB', width: 220 }}
                  />
                </div>
                <button
                  type="button"
                  className="btn-upload-primary"
                  onClick={() => setShowUploadModal(true)}
                  disabled={!workspaceId || uploading || isUnsupportedCategory}
                >
                  <MdCloudUpload /> {uploading ? 'Uploading…' : 'Upload'}
                </button>
                <div className="view-toggle">
                  <button
                    type="button"
                    className={`view-toggle-btn ${activeView === 'grid' ? 'active' : ''}`}
                    onClick={() => setActiveView('grid')}
                    aria-label="Grid view"
                  >
                    <MdGridView />
                  </button>
                  <button
                    type="button"
                    className={`view-toggle-btn ${activeView === 'list' ? 'active' : ''}`}
                    onClick={() => setActiveView('list')}
                    aria-label="List view"
                  >
                    <MdViewList />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {selectedCategory && (
          <div className="library-browse">
            <input
              type="file"
              style={{ display: 'none' }}
              ref={fileInputRef}
              multiple
              accept={assetService.acceptForTab(uploadType)}
              onChange={handleFileInputChange}
            />

            <div className="assets-scroller">
              {isUnsupportedCategory ? (
                <LibraryComingSoon
                  category={selectedCategory}
                  onBrowseMedia={() => handleCategoryClick(CATEGORY_CARDS[0])}
                />
              ) : assetsLoading && filteredAssets.length === 0 ? (
                renderMasonrySkeleton()
              ) : isCurrentTabEmpty ? (
                <div className="library-empty-state">
                  <p className="library-empty-title">No {activeTab === 'images' ? 'photos' : activeTab} yet</p>
                  <button
                    type="button"
                    className="library-empty-add-btn"
                    onClick={() => setShowUploadModal(true)}
                    disabled={!workspaceId || uploading}
                  >
                    <span className="library-empty-plus" aria-hidden>+</span>
                    <span>Upload assets</span>
                  </button>
                </div>
              ) : (
                <div
                  className={
                    activeView === 'grid'
                      ? `assets-masonry${assetsLoading ? ' assets-masonry--refreshing' : ''}`
                      : 'assets-list'
                  }
                  aria-busy={assetsLoading || undefined}
                >
                  {activeView === 'list' && (
                    <div className="list-header">
                      <div className="col name">Name</div>
                      <div className="col owner">{showUploaderColumn ? 'Uploader' : 'Source'}</div>
                      <div className="col modified">Date modified</div>
                      <div className="col size">Size</div>
                      <div className="col actions" />
                    </div>
                  )}

                  {filteredAssets.map((asset) =>
                    activeView === 'grid' ? (
                      renderGridAsset(asset)
                    ) : (
                      <div key={asset.id} className={`asset-card ${activeView}`}>
                        <>
                          <div className="col name" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: 'var(--bg-surface)', overflow: 'hidden' }}>
                              {asset.mediaType === 'video' && asset.url ? (
                                <video src={asset.url} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : asset.url && asset.mediaType === 'image' ? (
                                <img src={asset.url} alt={asset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <div className="asset-preview-icon">{assetIcon(asset)}</div>
                              )}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div className="asset-name" title={asset.name}>{asset.name}</div>
                            </div>
                          </div>

                          <div className="col owner" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                            {asset.source === 'stock'
                              ? 'Stock'
                              : showUploaderColumn && asset.owner
                                ? asset.owner
                                : '—'}
                          </div>
                          <div className="col modified" style={{ color: 'var(--text-muted)', fontSize: 13 }}>{asset.modified || ''}</div>
                          <div className="col size" style={{ color: 'var(--text-muted)', fontSize: 13 }}>{asset.sizeLabel || ''}</div>

                          <div className="col actions">
                            {assetCanManage(asset) ? (
                              <>
                                <button
                                  type="button"
                                  className="asset-delete-btn asset-delete-btn--list"
                                  aria-label={`Rename ${asset.name}`}
                                  disabled={renamingId === asset.id}
                                  onClick={() => handleRenameAsset(asset)}
                                >
                                  <MdDriveFileRenameOutline />
                                </button>
                                <button
                                  type="button"
                                  className="asset-delete-btn asset-delete-btn--list"
                                  aria-label={`Delete ${asset.name}`}
                                  disabled={deletingId === asset.id}
                                  onClick={() => handleDeleteAsset(asset.id)}
                                >
                                  <MdDeleteOutline />
                                </button>
                              </>
                            ) : null}
                          </div>
                        </>
                      </div>
                    )
                  )}

                  {activeView === 'grid' && !assetsLoading && workspaceId && !isUnsupportedCategory ? (
                    <button
                      type="button"
                      className="upload-placeholder masonry-upload-tile"
                      onClick={() => setShowUploadModal(true)}
                      disabled={uploading}
                    >
                      <MdCloudUpload className="upload-placeholder-icon" />
                      <div className="upload-placeholder-text">{uploading ? 'Uploading…' : 'Upload more'}</div>
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showUploadModal && (
        <div className="upload-modal-overlay" role="presentation" onClick={() => setShowUploadModal(false)}>
          <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
            <div className="upload-modal-header">
              <h3>Upload asset</h3>
              <button type="button" className="close-modal" onClick={() => setShowUploadModal(false)} aria-label="Close">
                <MdClose />
              </button>
            </div>
            <p className="upload-modal-hint">JPEG, PNG, WebP, MP4, or MP3 · max 50 MB</p>
            <div className="upload-options">
              {selectedCategory !== 'music' && (
                <>
                  <button
                    type="button"
                    className="upload-option"
                    onClick={() => openUploadPicker('images')}
                  >
                    <div className="option-icon image">
                      <MdImage />
                    </div>
                    <span>{selectedCategory === 'media' ? 'Photos' : 'Images'}</span>
                  </button>
                  <button
                    type="button"
                    className="upload-option"
                    onClick={() => openUploadPicker('videos')}
                  >
                    <div className="option-icon video">
                      <MdPlayCircleFilled />
                    </div>
                    <span>Videos</span>
                  </button>
                </>
              )}
              {selectedCategory !== 'media' && (
                <button
                  type="button"
                  className="upload-option"
                  onClick={() => openUploadPicker('music')}
                >
                  <div className="option-icon music">
                    <MdMusicNote />
                  </div>
                  <span>Music</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Library
