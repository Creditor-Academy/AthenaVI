import { useState, useRef, useEffect } from 'react'
import {
  MdMoreVert,
  MdEdit,
  MdDelete,
  MdAdd,
  MdGridView,
  MdViewList,
  MdPlayArrow,
  MdFolder,
  MdClose,
  MdSearch,
  MdVideoLibrary
} from 'react-icons/md'
import workspaceService from '../../services/workspaceService'
import './Videos.css'

const thumbnailUrl = 'https://media.istockphoto.com/id/1475888355/video/timelapse-of-the-creation-of-an-online-avatar-start-to-finish.jpg?s=640x640&k=20&c=pFzBOkU7LjC1DF0DeNCAUhS8MCiNwSDwkqI9v9C7IgQ='

function Videos({ onCreate }) {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [cardMenu, setCardMenu] = useState(null)
  const [renameDialog, setRenameDialog] = useState(null) // { videoId, workspaceId, title }
  const [newName, setNewName] = useState('')
  const menuRefs = useRef({})

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const data = await workspaceService.listAllVideosAcrossWorkspaces()
      setVideos(data)
    } catch (error) {
      console.error('Failed to fetch videos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardMenu) {
        const ref = menuRefs.current[cardMenu]
        if (ref && !ref.contains(event.target)) {
          setCardMenu(null)
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [cardMenu])

  const handleRename = async () => {
    if (!newName.trim() || !renameDialog) return
    try {
      await workspaceService.renameVideo(renameDialog.workspaceId, renameDialog.videoId, newName.trim())
      window.location.reload()
    } catch (error) {
      alert('Failed to rename video')
    }
  }

  const handleDelete = async (workspaceId, videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return
    try {
      await workspaceService.deleteVideo(workspaceId, videoId)
      window.location.reload()
    } catch (error) {
      alert('Failed to delete video')
    }
  }

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.workspaceName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="videos-page">
      <div className="videos-shell">
        <header className="videos-page-header">
          <div className="videos-title-section">
            <h1 className="videos-page-title">My Videos</h1>
            <p className="videos-page-subtitle">Manage all your videos across different workspaces</p>
          </div>
          <div className="videos-actions">
            <div className="view-toggle">
              <button
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <MdGridView />
              </button>
              <button
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <MdViewList />
              </button>
            </div>
            <button className="new-folder-btn" onClick={onCreate}>
              <MdAdd size={18} />
              New Video
            </button>
          </div>
        </header>

        <div className="videos-search-bar" style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '8px 16px',
          marginBottom: '24px',
          gap: '12px'
        }}>
          <MdSearch size={22} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search videos or workspaces..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              fontSize: '15px',
              width: '100%',
              outline: 'none'
            }}
          />
        </div>

        <main className="videos-main">
          {loading ? (
            <div className="empty-videos">
              <p>Loading your videos...</p>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="empty-videos">
              <MdVideoLibrary className="empty-videos-icon" />
              <h3 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>No videos found</h3>
              <p>Try Adjusting your search or create a new video</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'videos-grid' : 'videos-list'}>
              {filteredVideos.map((video) => (
                <div 
                  className={`video-card ${viewMode === 'list' ? 'list-view' : ''}`} 
                  key={video.id}
                  ref={el => menuRefs.current[`video-${video.id}`] = el}
                >
                  <div className="video-thumb">
                    <img
                      src={video.thumbnail || thumbnailUrl}
                      alt={video.title}
                      className="video-thumb-image"
                    />
                    <div className="video-thumb-overlay">
                      <div className={`video-badge ${video.status || 'draft'}`}>
                        {video.status?.toUpperCase() || 'DRAFT'}
                      </div>
                      <button
                        className="video-menu-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          setCardMenu(cardMenu === `video-${video.id}` ? null : `video-${video.id}`)
                        }}
                      >
                        <MdMoreVert />
                      </button>
                      {cardMenu === `video-${video.id}` && (
                        <div className="video-menu" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="video-menu-item"
                            onClick={() => {
                              setRenameDialog({ 
                                videoId: video.id, 
                                workspaceId: video.workspaceId, 
                                title: video.title 
                              })
                              setNewName(video.title)
                              setCardMenu(null)
                            }}
                          >
                            <MdEdit className="video-menu-icon" />
                            Rename
                          </button>
                          <button
                            className="video-menu-item delete"
                            onClick={() => handleDelete(video.workspaceId, video.id)}
                          >
                            <MdDelete className="video-menu-icon" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1e293b',
                      fontSize: '24px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                      <MdPlayArrow />
                    </div>
                    {video.duration && (
                      <div className="video-duration">
                        {video.duration}
                      </div>
                    )}
                  </div>
                  <div className="video-info">
                    <h4 className="video-title" title={video.title}>{video.title}</h4>
                    <p className="video-meta">Updated {video.updatedAt || video.updated || 'recently'}</p>
                    <div className="workspace-badge" title={`In workspace: ${video.workspaceName}`}>
                      <MdFolder size={12} style={{ marginRight: '4px' }} />
                      {video.workspaceName}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {renameDialog && (
        <div className="rename-dialog-overlay" onClick={() => setRenameDialog(null)}>
          <div className="rename-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '20px' }}>Rename Video</h3>
              <button 
                onClick={() => setRenameDialog(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <MdClose size={24} />
              </button>
            </div>
            <input
              type="text"
              className="rename-input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename()
                if (e.key === 'Escape') setRenameDialog(null)
              }}
              autoFocus
            />
            <div className="rename-dialog-actions">
              <button className="btn-secondary" onClick={() => setRenameDialog(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleRename}>Rename</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Videos
