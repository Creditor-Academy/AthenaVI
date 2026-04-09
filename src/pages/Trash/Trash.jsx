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
  ArrowUpRight,
  Play,
  Film
} from 'lucide-react'
import './Trash.css'

const thumbnailUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600'
const folderThumbUrl = 'https://images.unsplash.com/photo-1626544823126-bb96239bc569?auto=format&fit=crop&q=80&w=600'

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
    { id: 'v1', title: 'Feature Pitch Draft', deletedDate: '3 days ago', daysRemaining: 27, duration: '05:12', thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=600', size: '156 MB' },
    { id: 'v2', title: 'Quick Loom Record', deletedDate: '5 days ago', daysRemaining: 25, duration: '01:45', thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600', size: '12 MB' },
    { id: 'v3', title: 'Asset_Final_V4', deletedDate: '1 week ago', daysRemaining: 23, duration: '02:30', thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600', size: '89 MB' },
    { id: 'v4', title: 'Test Export', deletedDate: '2 weeks ago', daysRemaining: 15, duration: '00:15', thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600', size: '4 MB' },
  ], [])

  const filteredAssets = trashVideos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openRestoreDrawer = (type, asset) => {
    setRestoreDrawer({ isOpen: true, data: { ...asset, type } })
  }

  const closeRestoreDrawer = () => {
    setRestoreDrawer(prev => ({ ...prev, isOpen: false }))
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
        <header className="trash-header-new">
          <div className="header-main-row">
            <div className="header-left">

              <div className="title-with-badge">
                <h1>Recovery Center</h1>
                <div className="count-badge">{trashVideos.length + trashFolders.length} items</div>
              </div>
              <p className="subtitle-compact">
                Items are kept for <span className="highlight">30 days</span> before permanent removal.
              </p>
            </div>
            
            <div className="header-right">
              <div className="storage-mini-card">
                <div className="mini-icon"><ShieldAlert size={16} /></div>
                <div className="mini-content">
                  <span className="mini-label">Storage Used</span>
                  <span className="mini-value">420 MB</span>
                </div>
              </div>
              <button className="btn-empty-trash" onClick={emptyTrash}>
                <Trash2 size={16} />
                <span>Empty Trash</span>
              </button>
            </div>
          </div>

          <div className="toolbar-integrated">
            <div className="toolbar-left">
              <div className="search-compact">
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Find in trash..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="tab-switcher">
                <button 
                  className={`tab-item ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  All
                </button>
                <button 
                  className={`tab-item ${activeTab === 'folders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('folders')}
                >
                  Folders
                </button>
                <button 
                  className={`tab-item ${activeTab === 'videos' ? 'active' : ''}`}
                  onClick={() => setActiveTab('videos')}
                >
                  Videos
                </button>
              </div>
            </div>

            <div className="toolbar-right">
              <button className="toolbar-btn">
                <Filter size={16} />
                <span>Filters</span>
              </button>
              <div className="view-toggle">
                <button 
                  className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <Grid size={16} />
                </button>
                <button 
                  className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  <List size={16} />
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
                            <Folder size={24} />
                          </div>
                          <div className="folder-card-info">
                            <h4>{folder.name}</h4>
                            <div className="folder-card-meta">
                              <span className="count-pill">{folder.assetsCount} items</span>
                              <span className="dot-sep"></span>
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

      {/* Modern Centered Recovery Modal */}
      <div className={`recovery-modal-overlay ${restoreDrawer.isOpen ? 'active' : ''}`} onClick={closeRestoreDrawer}>
        <div className={`recovery-modal ${restoreDrawer.isOpen ? 'active' : ''}`} onClick={(e) => e.stopPropagation()}>
          <button className="btn-close-modal" onClick={closeRestoreDrawer}>
            <X size={20} />
          </button>
          
          {restoreDrawer.data && (
            <div className="modal-content-split">
              {/* Left Side: Media Preview */}
              <div className="modal-preview-panel">
                <div className="preview-media-container">
                  <img src={restoreDrawer.data.thumbnail || folderThumbUrl} alt="Preview" />
                  <div className="play-overlay-glass">
                    <Play size={28} fill="currentColor" />
                  </div>
                  <div className="preview-header-overlay">
                    <div className="glass-badge">
                      <span className="live-dot"></span>
                      <span>PREVIEW MODE</span>
                    </div>
                  </div>
                </div>
                <div className="preview-footer-info">
                   <div className="info-bits">
                     <Clock size={12} />
                     <span>{restoreDrawer.data.duration || '00:00'}</span>
                     <span className="dot"></span>
                     <span>4K Resolution</span>
                   </div>
                </div>
              </div>

              {/* Right Side: Details & Actions */}
              <div className="modal-details-panel">
                <div className="panel-header-new">
                  <h2 className="asset-title-truncate" title={restoreDrawer.data.title || restoreDrawer.data.name}>
                    {restoreDrawer.data.title || restoreDrawer.data.name}
                  </h2>
                  <div className="header-meta-tags">
                     <div className="meta-pill">
                       {restoreDrawer.data.type === 'folder' ? <Folder size={12} /> : <Film size={12} />}
                       <span>{restoreDrawer.data.type.toUpperCase()}</span>
                     </div>
                     <span className="meta-sep"></span>
                     <span className="deleted-date-text">Deleted {restoreDrawer.data.deletedDate}</span>
                  </div>
                </div>

                <div className="panel-stats-compact">
                  <div className="stat-item-premium">
                    <label>Current Status</label>
                    <div className="status-with-pulse">
                      <span className="pulse-dot warning"></span>
                      <span className="status-val warning">Pending Recovery</span>
                    </div>
                  </div>
                  
                  <div className="stat-grid-row">
                    <div className="mini-stat-box">
                      <label>Total Size</label>
                      <span className="val">{restoreDrawer.data.size || '14 items'}</span>
                    </div>
                    <div className="mini-stat-box highlight">
                      <label>Auto-Cleanup In</label>
                      <span className="val">{restoreDrawer.data.daysRemaining} Days</span>
                    </div>
                  </div>
                </div>

                <div className="modal-action-footer">
                  <button className="btn-restore-primary" onClick={handleRestore}>
                    <RotateCcw size={18} />
                    <span>Restore Asset to Library</span>
                  </button>
                  
                  <div className="danger-zone-compact">
                    <button className="btn-delete-ghost" onClick={() => {
                      handleDeletePermanent(restoreDrawer.data.type, restoreDrawer.data.id);
                      closeRestoreDrawer();
                    }}>
                      <Trash2 size={16} />
                      <span>Delete Permanently</span>
                    </button>
                    <p className="deletion-warning">
                      This action cannot be undone. System links will be severed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
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

