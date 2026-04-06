import { useState, useMemo, useEffect, useRef } from 'react'
import { 
  Trash2, 
  RotateCcw, 
  X, 
  Info, 
  Folder, 
  Video, 
  Grid, 
  List, 
  Search, 
  MoreVertical, 
  ArrowLeft,
  ChevronRight,
  ShieldAlert,
  Calendar,
  Clock,
  Filter,
  ArrowUpRight
} from 'lucide-react'
import './Trash.css'

const thumbnailUrl = 'https://images.unsplash.com/photo-1626544823126-bb96239bc569?q=80&w=2600&auto=format&fit=crop'
const folderThumbUrl = 'https://images.unsplash.com/photo-1544383333-5452d3d94bb4?q=80&w=2600&auto=format&fit=crop'

function Trash() {
  const [activeTab, setActiveTab] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [restoreDrawer, setRestoreDrawer] = useState({ isOpen: false, data: null })

  const trashFolders = useMemo(() => [
    {
      id: 'f1',
      name: 'Product Walkthroughs',
      deletedDate: 'Mar 24, 2024',
      daysRemaining: 18,
      assetsCount: 14,
      thumbnail: folderThumbUrl,
      videos: [
        { id: 'v1-1', title: 'Onboarding Flow v2', deletedDate: 'Mar 24, 2024', duration: '03:45', thumbnail: thumbnailUrl, size: '24.5 MB' },
        { id: 'v1-2', title: 'Dashboard Tutorial', deletedDate: 'Mar 24, 2024', duration: '01:20', thumbnail: thumbnailUrl, size: '12.8 MB' },
      ],
    },
    {
      id: 'f2',
      name: 'Marketing Assets',
      deletedDate: 'Apr 02, 2024',
      daysRemaining: 26,
      assetsCount: 8,
      thumbnail: folderThumbUrl,
      videos: [
        { id: 'v2-1', title: 'Spring Promo', deletedDate: 'Apr 02, 2024', duration: '00:30', thumbnail: thumbnailUrl, size: '45.2 MB' },
      ],
    }
  ], [])

  const trashVideos = useMemo(() => [
    { id: 'v1', title: 'Feature Pitch Draft', deletedDate: '3 days ago', daysRemaining: 27, duration: '05:12', thumbnail: thumbnailUrl, size: '156 MB' },
    { id: 'v2', title: 'Quick Loom Record', deletedDate: '5 days ago', daysRemaining: 25, duration: '01:45', thumbnail: thumbnailUrl, size: '12 MB' },
    { id: 'v3', title: 'Asset_Final_V4', deletedDate: '1 week ago', daysRemaining: 23, duration: '02:30', thumbnail: thumbnailUrl, size: '89 MB' },
    { id: 'v4', title: 'Test Export', deletedDate: '2 weeks ago', daysRemaining: 15, duration: '00:15', thumbnail: thumbnailUrl, size: '4 MB' },
  ], [])

  const filteredAssets = trashVideos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openRestoreDrawer = (type, asset) => {
    setRestoreDrawer({ isOpen: true, data: { ...asset, type } })
  }

  const closeRestoreDrawer = () => {
    setRestoreDrawer({ isOpen: false, data: null })
  }

  const handleRestore = () => {
    console.log('Restoring:', restoreDrawer.data)
    closeRestoreDrawer()
  }

  const handleDeletePermanent = (type, asset) => {
    if (window.confirm(`Are you sure you want to permanently delete "${asset.title}"?`)) {
      console.log('Permanently deleting:', asset)
    }
  }

  const emptyTrash = () => {
    if (window.confirm('This will permanently delete all items in the trash. Continue?')) {
      console.log('Emptying trash')
    }
  }

  const currentFolder = trashFolders.find(f => f.id === selectedFolder)

  return (
    <div className="athena-trash-view">
      <div className="trash-glow-1"></div>
      <div className="trash-glow-2"></div>
      
      <div className="trash-page-layout">
        <header className="page-header">
          <div className="header-top">
            <div className="title-group">
              <div className="breadcrumb">
                <span>Dashboard</span>
                <ChevronRight size={14} />
                <span className="current">Trash</span>
              </div>
              <h1>Recovery Center</h1>
              <p className="subtitle">
                Manage your deleted assets. Items are kept for <span className="highlight">30 days</span> before permanent removal.
              </p>
            </div>
            
            <div className="header-actions">
              <div className="stat-pills">
                <div className="stat-pill">
                  <span className="label">Total Items</span>
                  <span className="value">{trashVideos.length + trashFolders.length}</span>
                </div>
                <div className="stat-pill">
                  <span className="label">Storage</span>
                  <span className="value">420 MB</span>
                </div>
              </div>
              <button className="btn-empty-all" onClick={emptyTrash}>
                <Trash2 size={16} />
                <span>Empty Trash</span>
              </button>
            </div>
          </div>

          <div className="header-controls">
            <div className="control-left">
              <div className="search-wrapper">
                <Search className="search-icon" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by name, type, or date..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="tabs-wrapper">
                <button 
                  className={`tab-pill ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  All Assets
                </button>
                <button 
                  className={`tab-pill ${activeTab === 'folders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('folders')}
                >
                  Folders
                </button>
                <button 
                  className={`tab-pill ${activeTab === 'videos' ? 'active' : ''}`}
                  onClick={() => setActiveTab('videos')}
                >
                  Videos
                </button>
              </div>
            </div>

            <div className="control-right">
              <button className="btn-filter">
                <Filter size={16} />
                <span>Filter</span>
              </button>
              <div className="view-switcher">
                <button 
                  className={`switch-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={18} />
                </button>
                <button 
                  className={`switch-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="trash-content-area">
          {selectedFolder && currentFolder ? (
            <div className="folder-detail-container">
              <button className="btn-back" onClick={() => setSelectedFolder(null)}>
                <ArrowLeft size={16} />
                <span>Back to Recovery</span>
              </button>
              
              <div className="folder-hero-section">
                <div className="folder-hero-card">
                  <div className="hero-icon"><Folder size={40} /></div>
                  <div className="hero-text">
                    <h2>{currentFolder.name}</h2>
                    <div className="hero-meta">
                      <span>{currentFolder.assetsCount} items</span>
                      <span className="dot"></span>
                      <span>Deleted on {currentFolder.deletedDate}</span>
                    </div>
                  </div>
                  <button className="btn-restore-folder" onClick={() => openRestoreDrawer('folder', currentFolder)}>
                    <RotateCcw size={16} />
                    Restore Folder
                  </button>
                </div>
              </div>

              <div className="assets-grid-layout">
                {currentFolder.videos.map(video => (
                  <PremiumAssetCard 
                    key={video.id} 
                    asset={video} 
                    onOpenDrawer={() => openRestoreDrawer('video', video)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="trash-items-view">
              {trashFolders.length > 0 && activeTab !== 'videos' && (
                <section className="trash-groups">
                  <div className="group-header">
                    <h3>Folders</h3>
                    <div className="divider"></div>
                  </div>
                  <div className="folders-container">
                    {trashFolders.map(folder => (
                      <div key={folder.id} className="premium-folder-card" onClick={() => setSelectedFolder(folder.id)}>
                        <div className="folder-card-inner">
                          <div className="folder-preview">
                            <Folder size={32} />
                            <div className="item-count">{folder.assetsCount}</div>
                          </div>
                          <div className="folder-card-info">
                            <h4>{folder.name}</h4>
                            <div className="folder-card-meta">
                              <Clock size={12} />
                              <span>{folder.daysRemaining} days left</span>
                            </div>
                          </div>
                          <div className="folder-card-actions">
                            <button className="btn-icon-restore" onClick={(e) => {
                              e.stopPropagation();
                              openRestoreDrawer('folder', folder);
                            }}>
                              <RotateCcw size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="trash-groups">
                <div className="group-header">
                  <h3>Recent Assets</h3>
                  <div className="divider"></div>
                </div>
                
                {filteredAssets.length === 0 ? (
                  <div className="empty-trash-state">
                    <div className="empty-icon-wrapper">
                      <Trash2 size={48} />
                    </div>
                    <h3>No assets found</h3>
                    <p>Your search didn't match any items in the trash.</p>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' ? 'assets-grid-layout' : 'assets-list-layout'}>
                    {filteredAssets.map(asset => (
                      <PremiumAssetCard 
                        key={asset.id} 
                        asset={asset} 
                        viewMode={viewMode}
                        onOpenDrawer={() => openRestoreDrawer('video', asset)}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </main>
      </div>

      {/* Side Drawer Component */}
      <div className={`recovery-drawer-overlay ${restoreDrawer.isOpen ? 'active' : ''}`} onClick={closeRestoreDrawer}>
        <aside className={`recovery-drawer ${restoreDrawer.isOpen ? 'active' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="drawer-header-compact">
            <button className="btn-close-drawer" onClick={closeRestoreDrawer}>
              <X size={20} />
            </button>
            <span className="drawer-title-label">Asset Intelligence</span>
          </div>

          {restoreDrawer.data && (
            <div className="drawer-body">
              <div className="asset-preview-hero">
                <img src={restoreDrawer.data.thumbnail} alt="" />
                <div className="hero-overlay-blur"></div>
                {restoreDrawer.data.type === 'video' && <div className="play-icon-static"><Video size={24} /></div>}
              </div>

              <div className="asset-details-section">
                <div className="asset-header-info">
                  <div className="type-badge">
                    {restoreDrawer.data.type === 'video' ? <Video size={12} /> : <Folder size={12} />}
                    {restoreDrawer.data.type.toUpperCase()}
                  </div>
                  <h2>{restoreDrawer.data.title || restoreDrawer.data.name}</h2>
                </div>

                <div className="info-grid-premium">
                  <div className="info-box-item">
                    <span className="info-label">Status</span>
                    <div className="status-indicator">
                      <div className="pulse-dot"></div>
                      <span className="status-text">Pending Recovery</span>
                    </div>
                  </div>
                  <div className="info-box-item">
                    <span className="info-label">Size</span>
                    <span className="info-value">{restoreDrawer.data.size || 'N/A'}</span>
                  </div>
                  <div className="info-box-item">
                    <span className="info-label">Auto-delete</span>
                    <span className="info-value text-warning">{restoreDrawer.data.daysRemaining} days</span>
                  </div>
                  <div className="info-box-item">
                    <span className="info-label">Deleted</span>
                    <span className="info-value">{restoreDrawer.data.deletedDate}</span>
                  </div>
                </div>

                <div className="asset-insight-card">
                  <div className="insight-header">
                    <Info size={14} />
                    <span>Recovery Insight</span>
                  </div>
                  <p>
                    Restoring this {restoreDrawer.data.type} will return it to its original workspace. 
                    Links, analytics, and collaborations associated with this item will be re-activated instantly.
                  </p>
                </div>
              </div>

              <div className="drawer-footer-actions">
                <button className="btn-primary-restore" onClick={handleRestore}>
                  <RotateCcw size={18} />
                  <span>Restore Asset Now</span>
                </button>
                <button className="btn-secondary-delete" onClick={() => handleDeletePermanent(restoreDrawer.data.type, restoreDrawer.data)}>
                  <Trash2 size={16} />
                  <span>Delete Permanently</span>
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

function PremiumAssetCard({ asset, viewMode = 'grid', onOpenDrawer }) {
  if (viewMode === 'list') {
    return (
      <div className="premium-list-item" onClick={onOpenDrawer}>
        <div className="list-item-thumb">
          <img src={asset.thumbnail} alt="" />
          {asset.duration && <span className="list-time">{asset.duration}</span>}
        </div>
        <div className="list-item-main">
          <h4>{asset.title}</h4>
          <div className="list-item-meta">
            <span>{asset.size}</span>
            <span className="dot"></span>
            <span>Deleted {asset.deletedDate}</span>
          </div>
        </div>
        <div className="list-item-actions">
          <div className="expiration-warn">
            <Clock size={12} />
            <span>{asset.daysRemaining}d</span>
          </div>
          <button className="btn-list-restore">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="premium-asset-card" onClick={onOpenDrawer}>
      <div className="card-media-wrapper">
        <img src={asset.thumbnail} alt={asset.title} />
        <div className="card-interactions">
          <div className="interaction-btn-group">
            <button className="btn-card-action">
              <RotateCcw size={18} />
            </button>
            <button className="btn-card-action delete">
              <Trash2 size={18} />
            </button>
          </div>
        </div>
        <div className="badge-overlay countdown">
          <Clock size={12} />
          <span>{asset.daysRemaining} days left</span>
        </div>
        {asset.duration && <div className="badge-overlay duration">{asset.duration}</div>}
      </div>
      <div className="card-content-compact">
        <div className="card-main-info">
          <h4>{asset.title}</h4>
          <div className="card-sub-info">
            <span>{asset.size}</span>
            <span className="dot"></span>
            <span>Video</span>
          </div>
        </div>
        <button className="btn-more-info">
          <ArrowUpRight size={16} />
        </button>
      </div>
    </div>
  )
}

export default Trash

