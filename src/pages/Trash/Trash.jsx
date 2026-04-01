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
  Calendar
} from 'lucide-react'
import './Trash.css' // We'll create this file

const thumbnailUrl = 'https://media.istockphoto.com/id/1480023591/video/creating-a-female-video-game-character.jpg?s=640x640&k=20&c=S1LW6oZZDQYgsqp4GRL0bj9wE1oRIaBfQSV-UQXv2II='

function Trash() {
  const [activeTab, setActiveTab] = useState('videos')
  const [viewMode, setViewMode] = useState('grid')
  const [cardMenu, setCardMenu] = useState(null)
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setCardMenu(null)
      }
    }
    if (cardMenu) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [cardMenu])

  const trashFolders = useMemo(() => [
    {
      id: 'f1',
      name: 'Recruitment & Training',
      deletedDate: '5 days ago',
      videosCount: 12,
      videos: [
        { id: 'v1-1', title: 'HR Introduction Video', deletedDate: '5 days ago', duration: '02:15', thumbnail: thumbnailUrl },
        { id: 'v1-2', title: 'Training Module 1', deletedDate: '5 days ago', duration: '05:30', thumbnail: thumbnailUrl },
      ],
    },
    {
      id: 'f2',
      name: 'Marketing Campaigns',
      deletedDate: '1 week ago',
      videosCount: 8,
      videos: [
        { id: 'v2-1', title: 'Summer Campaign 2024', deletedDate: '1 week ago', duration: '01:30', thumbnail: thumbnailUrl },
      ],
    }
  ], [])

  const trashVideos = useMemo(() => [
    { id: 'v1', title: 'Copy of Lesson 15', deletedDate: '2 days ago', duration: '00:07', thumbnail: thumbnailUrl },
    { id: 'v2', title: 'Untitled Project', deletedDate: '3 days ago', duration: '—', thumbnail: thumbnailUrl },
    { id: 'v3', title: 'Summary Copy', deletedDate: '1 week ago', duration: '01:23', thumbnail: thumbnailUrl, hasText: 'Summary' },
    { id: 'v4', title: 'Project Beta', deletedDate: '2 weeks ago', duration: '00:45', thumbnail: thumbnailUrl },
  ], [])

  const filteredVideos = trashVideos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const restoreItem = (type, id) => {
    console.log(`Restoring ${type}: ${id}`)
    setCardMenu(null)
  }

  const permanentlyDelete = (type, id) => {
    if (window.confirm(`Permanently delete this ${type}? This cannot be undone.`)) {
      console.log(`Deleting ${type}: ${id}`)
      setCardMenu(null)
    }
  }

  const emptyTrash = () => {
    if (window.confirm('Empty all items from trash? This action is permanent.')) {
      console.log('Emptying trash')
    }
  }

  const currentFolder = trashFolders.find(f => f.id === selectedFolder)

  return (
    <div className="trash-container">
      <header className="trash-header">
        <div className="header-main">
          <div className="title-area">
            <h1>Trash</h1>
            <div className="trash-stats">
              <span className="stat-badge">{trashVideos.length + trashFolders.length} items</span>
              <span className="divider">•</span>
              <span className="policy-note">Auto-deletes after 30 days</span>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-empty" onClick={emptyTrash}>
              <Trash2 size={16} />
              Empty Trash
            </button>
          </div>
        </div>

        <div className="header-toolbar">
          <div className="tab-group">
            <button 
              className={`tab-item ${activeTab === 'videos' ? 'active' : ''}`}
              onClick={() => setActiveTab('videos')}
            >
              All Assets
            </button>
            <button 
              className={`tab-item ${activeTab === 'templates' ? 'active' : ''}`}
              onClick={() => setActiveTab('templates')}
            >
              Templates
            </button>
          </div>

          <div className="toolbar-right">
            <div className="search-box">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search trash..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="view-toggle">
              <button 
                className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid size={18} />
              </button>
              <button 
                className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="trash-content">
        {selectedFolder && currentFolder ? (
          <div className="folder-detail-view">
            <button className="back-link" onClick={() => setSelectedFolder(null)}>
              <ArrowLeft size={16} />
              Back to all items
            </button>
            
            <div className="folder-hero">
              <div className="folder-hero-icon"><Folder size={40} /></div>
              <div className="folder-hero-info">
                <h2>{currentFolder.name}</h2>
                <p>{currentFolder.videos.length} videos • Deleted {currentFolder.deletedDate}</p>
              </div>
            </div>

            <div className="asset-grid">
              {currentFolder.videos.map(video => (
                <AssetCard 
                  key={video.id} 
                  asset={video} 
                  type="video" 
                  onRestore={restoreItem} 
                  onDelete={permanentlyDelete} 
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="default-view">
            {filteredVideos.length === 0 && trashFolders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-illustration">
                  <div className="icon-shadow"><Trash2 size={64} /></div>
                </div>
                <h3>Trash is empty</h3>
                <p>Deleted items will appear here for 30 days before being permanently removed.</p>
              </div>
            ) : (
              <>
                {trashFolders.length > 0 && (
                  <section className="trash-section">
                    <h3 className="section-label">Folders</h3>
                    <div className="folder-grid">
                      {trashFolders.map(folder => (
                        <div 
                          key={folder.id} 
                          className="folder-item" 
                          onClick={() => setSelectedFolder(folder.id)}
                        >
                          <div className="folder-visual">
                            <Folder size={32} />
                          </div>
                          <div className="folder-info">
                            <h4>{folder.name}</h4>
                            <span>{folder.videosCount} assets</span>
                          </div>
                          <button className="item-more" onClick={(e) => {
                            e.stopPropagation();
                            setCardMenu(`folder-${folder.id}`);
                          }}>
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <section className="trash-section">
                  <h3 className="section-label">Recently Deleted</h3>
                  <div className={viewMode === 'grid' ? 'asset-grid' : 'asset-list'}>
                    {filteredVideos.map(video => (
                      <AssetCard 
                        key={video.id} 
                        asset={video} 
                        type="video" 
                        viewMode={viewMode}
                        onRestore={restoreItem} 
                        onDelete={permanentlyDelete} 
                      />
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function AssetCard({ asset, type, onRestore, onDelete, viewMode = 'grid' }) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false)
    }
    if (showMenu) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showMenu])

  if (viewMode === 'list') {
    return (
      <div className="list-item">
        <div className="list-thumb">
          <img src={asset.thumbnail} alt="" />
        </div>
        <div className="list-info">
          <h4>{asset.title}</h4>
          <p><Calendar size={12} /> {asset.deletedDate}</p>
        </div>
        <div className="list-actions">
          <button className="btn-restore" onClick={() => onRestore(type, asset.id)}>
            <RotateCcw size={14} /> Restore
          </button>
          <button className="btn-delete" onClick={() => onDelete(type, asset.id)}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="asset-card">
      <div className="card-media">
        <img src={asset.thumbnail} alt={asset.title} />
        <div className="card-overlay">
          <button className="overlay-restore" onClick={() => onRestore(type, asset.id)}>
            <RotateCcw size={18} />
            <span>Restore</span>
          </button>
        </div>
        {asset.duration && <span className="duration-badge">{asset.duration}</span>}
      </div>
      <div className="card-footer">
        <div className="card-info">
          <h4>{asset.title}</h4>
          <p>Deleted {asset.deletedDate}</p>
        </div>
        <div className="card-actions" ref={menuRef}>
          <button className="action-trigger" onClick={() => setShowMenu(!showMenu)}>
            <MoreVertical size={16} />
          </button>
          {showMenu && (
            <div className="action-menu">
              <button onClick={() => onRestore(type, asset.id)}>
                <RotateCcw size={14} /> Restore
              </button>
              <button 
                className="delete-forever"
                onClick={() => onDelete(type, asset.id)}
              >
                <Trash2 size={14} /> Delete Forever
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Trash
