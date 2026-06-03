import { useState, useRef, useEffect } from 'react'
import { Image, Music2, Type, LayoutGrid } from 'lucide-react'
import {
  MdCloudUpload,
  MdImage,
  MdSearch,
  MdFolder,
  MdPlayCircleFilled,
  MdMusicNote,
  MdGridView,
  MdViewList,
  MdClose,
  MdDeleteOutline
} from 'react-icons/md'
import './Library.css'

/* ── Assets API Docs Component ── */
function AssetsApiDocs() {
  const box = {
    background: '#FFFFFF', padding: '16px', borderRadius: '12px', boxShadow: '0 6px 18px rgba(16,24,40,0.04)',
    border: '1px solid #F1F5F9', marginTop: '20px', fontSize: '13px', color: '#111827'
  }

  return (
    <div style={box}>
      <h3 style={{ margin: 0, marginBottom: 8 }}>Assets API</h3>
      <div style={{ color: '#6B7280', marginBottom: 12 }}>Base path: <strong>/api/assets</strong></div>

      <section style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 700 }}>Upload asset</div>
        <div style={{ color: '#6B7280', marginBottom: 6 }}><strong>POST</strong> /api/assets/:workspaceId/upload</div>
        <div>multipart/form-data with a single file field <code>file</code>. Allowed MIME: image/jpeg, image/png, image/webp, video/mp4, audio/mp3. Max size 50 MB.</div>
        <div style={{ color: '#6B7280', marginTop: 6 }}>Responses: <strong>201</strong> (created) with asset metadata, <strong>400</strong> for invalid type or limit exceeded.</div>
      </section>

      <section style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 700 }}>List assets</div>
        <div style={{ color: '#6B7280', marginBottom: 6 }}><strong>GET</strong> /api/assets/:workspaceId</div>
        <div>Optional query: <code>take</code> (1–100, default 20), <code>skip</code> (offset, default 0). PRIVATE workspaces return only current user's uploads; TEAM returns all workspace assets.</div>
        <div style={{ color: '#6B7280', marginTop: 6 }}>Response: <strong>200</strong> with <code>{'{ "assets": [...] }'}</code>.</div>
      </section>

      <section style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 700 }}>Rename asset</div>
        <div style={{ color: '#6B7280', marginBottom: 6 }}><strong>PATCH</strong> /api/assets/:workspaceId/:assetId/rename</div>
        <div>Body JSON: <code>{'{ "name": "new-name.webp" }'}</code>. Name length 1–255 characters (trimmed).</div>
        <div style={{ color: '#6B7280', marginTop: 6 }}>Response: <strong>200</strong> with updated asset metadata.</div>
      </section>

      <section>
        <div style={{ fontWeight: 700 }}>Delete asset</div>
        <div style={{ color: '#6B7280', marginBottom: 6 }}><strong>DELETE</strong> /api/assets/:workspaceId/:assetId</div>
        <div>Removes object from storage and decrements the owner&apos;s storageUsed. Response: <strong>200</strong> with deleted asset metadata.</div>
      </section>

      <div style={{ marginTop: 12, color: '#6B7280', fontSize: 12 }}>
        All routes require <code>Authorization: Bearer &lt;access_token&gt;</code> and <code>checkWorkspaceAccess</code>. PRIVATE workspaces: owner only. TEAM workspaces: any member.
      </div>

      {/* Assets API docs (dashboard) */}
      <div style={{ maxWidth: 1300, margin: '22px auto', padding: '0 16px' }}>
        <AssetsApiDocs />
      </div>
    </div>
  )
}

const CATEGORY_CARDS = [
  { id: 'media', label: 'Media', Icon: Image },
  { id: 'music', label: 'Music', Icon: Music2 },
  { id: 'fonts', label: 'Fonts', Icon: Type },
  { id: 'templates', label: 'Templates', Icon: LayoutGrid }
]

function Library() {
  const [activeView, setActiveView] = useState('grid')
  const [activeTab, setActiveTab] = useState('images')
  const [searchQuery, setSearchQuery] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const fileInputRef = useRef(null)
  const searchRef = useRef(null)
  const [uploadType, setUploadType] = useState('images')
  // default to media so Photos/Videos are selected on first open
  const [selectedCategory, setSelectedCategory] = useState('media')

  const mediaTabs = [
    { id: 'images', label: 'Photos' },
    { id: 'videos', label: 'Videos' }
  ]

  const [assets, setAssets] = useState({
    images: [
      { id: 1, name: 'instructor_profile_01.png', size: '2.4 MB', type: 'PNG', thumb: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200', owner: 'me', modified: '12 Apr' },
      { id: 2, name: 'modern_office_backdrop.jpg', size: '1.8 MB', type: 'JPG', thumb: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=200', owner: 'me', modified: '11 Apr' },
      { id: 3, name: 'project_folder', size: '--', type: 'FOLDER', isFolder: true, icon: <MdFolder />, owner: 'me', modified: '30 May' }
    ],
    videos: [
      { id: 4, name: 'intro_animation_hq.mp4', size: '12.4 MB', type: 'MP4', thumb: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=200', owner: 'me', modified: '18 May' }
    ],
    music: [
      { id: 5, name: 'uplifting_background.mp3', size: '4.1 MB', type: 'MP3', icon: <MdMusicNote /> }
    ],
    fonts: [],
    templates: []
  })

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

  const currentAssetList = () => {
    const t = activeTab
    if (t === 'fonts' || t === 'templates') return assets[t] || []
    return assets[t] || []
  }

  const handleDeleteAsset = (assetId) => {
    setAssets((prev) => ({
      ...prev,
      [activeTab]: (prev[activeTab] || []).filter((asset) => asset.id !== assetId)
    }))
  }

  const isCurrentTabEmpty = currentAssetList().length === 0

  useEffect(() => {
    // focus the search input when the library opens
    if (searchRef && searchRef.current) searchRef.current.focus()
  }, [])

  return (
    <div className="library-page">
      <div className="library-shell">
        <header className="library-page-header">
          <h1 className="library-page-title">Library</h1>
        </header>

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
                  <button type="button" className="btn-upload-primary" onClick={() => setShowUploadModal(true)}>
                    <MdCloudUpload /> Upload
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
              accept={
                uploadType === 'images'
                  ? 'image/*'
                  : uploadType === 'videos'
                    ? 'video/*'
                    : uploadType === 'music'
                      ? 'audio/*'
                      : '*'
              }
            />

            <div className="assets-scroller">
              {isCurrentTabEmpty ? (
                <div className="library-empty-state">
                  <p className="library-empty-title">Library is empty</p>
                  <button
                    type="button"
                    className="library-empty-add-btn"
                    onClick={() => setShowUploadModal(true)}
                  >
                    <span className="library-empty-plus" aria-hidden>+</span>
                    <span>Add assets</span>
                  </button>
                </div>
              ) : (
                <div className={activeView === 'grid' ? 'assets-grid' : 'assets-list'}>
                  {activeView === 'list' && (
                    <div className="list-header">
                      <div className="col name">Name</div>
                      <div className="col owner">Owner</div>
                      <div className="col modified">Date modified</div>
                      <div className="col size">Size</div>
                      <div className="col actions" />
                    </div>
                  )}

                  {currentAssetList().map((asset) => (
                    <div key={asset.id} className={`asset-card ${activeView} ${asset.isFolder ? 'asset-folder' : ''}`}>
                      {activeView === 'grid' ? (
                        <>
                          <div className="asset-preview">
                            {asset.thumb ? (
                              <img src={asset.thumb} alt={asset.name} />
                            ) : (
                              <div className="asset-preview-icon">{asset.icon}</div>
                            )}
                          </div>

                          <div style={{ padding: '12px' }}>
                            <div className="asset-name" title={asset.name} style={{ fontSize: 14, fontWeight: 700 }}>{asset.name}</div>
                            <div className="asset-meta" style={{ marginTop: 8 }}>
                              <span>{asset.owner || ''}</span>
                              <span>{asset.modified || ''}</span>
                              <span>{asset.size || ''}</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="col name" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: 'var(--bg-surface)' }}>
                              {asset.isFolder ? (asset.icon || <MdFolder />) : (asset.thumb ? <img src={asset.thumb} alt={asset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div className="asset-preview-icon">{asset.icon}</div>)}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div className="asset-name" title={asset.name}>{asset.name}</div>
                            </div>
                          </div>

                          <div className="col owner" style={{ color: 'var(--text-muted)', fontSize: 13 }}>{asset.owner || ''}</div>
                          <div className="col modified" style={{ color: 'var(--text-muted)', fontSize: 13 }}>{asset.modified || ''}</div>
                          <div className="col size" style={{ color: 'var(--text-muted)', fontSize: 13 }}>{asset.size || ''}</div>

                          <div className="col actions">
                            <button
                              type="button"
                              className="asset-delete-btn asset-delete-btn--list"
                              aria-label={`Delete ${asset.name}`}
                              onClick={() => handleDeleteAsset(asset.id)}
                            >
                              <MdDeleteOutline />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {activeView === 'grid' && (
                    <button
                      type="button"
                      className="upload-placeholder"
                      onClick={() => setShowUploadModal(true)}
                    >
                      <MdCloudUpload className="upload-placeholder-icon" />
                      <div className="upload-placeholder-text">Drop files here</div>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showUploadModal && (
        <div className="upload-modal-overlay" role="presentation">
          <div className="upload-modal">
            <div className="upload-modal-header">
              <h3>Select Upload Type</h3>
              <button type="button" className="close-modal" onClick={() => setShowUploadModal(false)} aria-label="Close">
                <MdClose />
              </button>
            </div>
            <div className="upload-options">
              {selectedCategory !== 'music' && (
                <>
                  <button
                    type="button"
                    className="upload-option"
                    onClick={() => {
                      setUploadType('images')
                      fileInputRef.current?.click()
                      setShowUploadModal(false)
                    }}
                  >
                    <div className="option-icon image">
                      <MdImage />
                    </div>
                    <span>{selectedCategory === 'media' ? 'Photos' : 'Images'}</span>
                  </button>
                  <button
                    type="button"
                    className="upload-option"
                    onClick={() => {
                      setUploadType('videos')
                      fileInputRef.current?.click()
                      setShowUploadModal(false)
                    }}
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
                  onClick={() => {
                    setUploadType('music')
                    fileInputRef.current?.click()
                    setShowUploadModal(false)
                  }}
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
