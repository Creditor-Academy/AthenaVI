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
} from 'react-icons/md'
import assetService from '../../services/assetService'
import workspaceService from '../../services/workspaceService'
import './Library.css'

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
      setAssets(list.map(assetService.normalizeAsset).filter(Boolean))
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
    } catch (err) {
      setAssetsError(err?.message || 'Failed to delete asset')
    } finally {
      setDeletingId(null)
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
        const uploaded = await assetService.uploadAsset(workspaceId, file)
        const normalized = assetService.normalizeAsset(uploaded)
        if (!normalized) continue
        setAssets((prev) => {
          const without = prev.filter((item) => item.id !== normalized.id)
          return [normalized, ...without]
        })
      }
    } catch (err) {
      setAssetsError(err?.message || 'Upload failed')
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

  return (
    <div className="library-page">
      <div className="library-shell">
        <header className="library-page-header">
          <div className="library-page-header-row">
            <h1 className="library-page-title">Library</h1>
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

        {selectedCategory && (
          <div className="library-browse">
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
                <div className="library-empty-state">
                  <p className="library-empty-title">Coming soon</p>
                  <p className="library-empty-copy">Fonts and templates are not available in the asset library yet.</p>
                </div>
              ) : assetsLoading && filteredAssets.length === 0 ? (
                <div className="library-empty-state">
                  <p className="library-empty-title">Loading assets…</p>
                </div>
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
                <div className={activeView === 'grid' ? 'assets-grid' : 'assets-list'}>
                  {activeView === 'list' && (
                    <div className="list-header">
                      <div className="col name">Name</div>
                      <div className="col owner">Source</div>
                      <div className="col modified">Date modified</div>
                      <div className="col size">Size</div>
                      <div className="col actions" />
                    </div>
                  )}

                  {filteredAssets.map((asset) => (
                    <div key={asset.id} className={`asset-card ${activeView}`}>
                      {activeView === 'grid' ? (
                        <>
                          <div className="asset-preview">
                            {asset.mediaType === 'video' ? (
                              <video src={asset.url} muted playsInline />
                            ) : asset.mediaType === 'audio' ? (
                              <div className="asset-preview-icon">{assetIcon(asset)}</div>
                            ) : asset.url ? (
                              <img src={asset.url} alt={asset.name} />
                            ) : (
                              <div className="asset-preview-icon">{assetIcon(asset)}</div>
                            )}
                            {asset.source === 'stock' ? (
                              <span className="asset-source-badge">Stock</span>
                            ) : null}
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

                          <div style={{ padding: '12px' }}>
                            <div className="asset-name" title={asset.name} style={{ fontSize: 14, fontWeight: 700 }}>
                              {asset.name}
                            </div>
                            <div className="asset-meta" style={{ marginTop: 8 }}>
                              <span>{asset.source === 'stock' ? 'Stock' : 'Upload'}</span>
                              <span>{asset.modified || ''}</span>
                              <span>{asset.sizeLabel || ''}</span>
                            </div>
                          </div>
                        </>
                      ) : (
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
                            {asset.source === 'stock' ? 'Stock' : 'Upload'}
                          </div>
                          <div className="col modified" style={{ color: 'var(--text-muted)', fontSize: 13 }}>{asset.modified || ''}</div>
                          <div className="col size" style={{ color: 'var(--text-muted)', fontSize: 13 }}>{asset.sizeLabel || ''}</div>

                          <div className="col actions">
                            <button
                              type="button"
                              className="asset-delete-btn asset-delete-btn--list"
                              aria-label={`Delete ${asset.name}`}
                              disabled={deletingId === asset.id}
                              onClick={() => handleDeleteAsset(asset.id)}
                            >
                              <MdDeleteOutline />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {activeView === 'grid' && workspaceId && !isUnsupportedCategory ? (
                    <button
                      type="button"
                      className="upload-placeholder"
                      onClick={() => setShowUploadModal(true)}
                      disabled={uploading}
                    >
                      <MdCloudUpload className="upload-placeholder-icon" />
                      <div className="upload-placeholder-text">{uploading ? 'Uploading…' : 'Drop files here'}</div>
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
