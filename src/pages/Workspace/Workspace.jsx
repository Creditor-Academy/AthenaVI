import { useState, useRef, useEffect } from 'react'
import {
  MdFolder,
  MdAdd,
  MdMoreVert,
  MdEdit,
  MdDelete,
  MdGridView,
  MdViewList,
  MdKeyboardArrowDown,
  MdFilterList,
  MdClose,
  MdArrowBack,
  MdPlayArrow,
  MdPlayCircleFilled,
} from 'react-icons/md'
import workspaceService from '../../services/workspaceService'
import heygenService from '../../services/heygenService'
import { getAuthHeaders } from '../../config/api.js'
import './Workspace.css'

const thumbnailUrl = 'https://media.istockphoto.com/id/1475888355/video/timelapse-of-the-creation-of-an-online-avatar-start-to-finish.jpg?s=640x640&k=20&c=pFzBOkU7LjC1DF0DeNCAUhS8MCiNwSDwkqI9v9C7IgQ='


const lastUpdatedOptions = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
]

const filterOptions = [
  { value: 'all', label: 'All folders' },
  { value: 'recent', label: 'Recently updated' },
  { value: 'name', label: 'Name (A-Z)' },
]

function Workspace({ onCreate }) {
  const [workspaceId, setWorkspaceId] = useState(null)
  const [folders, setFolders] = useState([])
  const [selectedFolder, setSelectedFolder] = useState(() => {
    // Try to restore from localStorage on mount
    const saved = window.localStorage.getItem('workspace:selectedFolder')
    return saved || null
  })
  const [selectedSubfolder, setSelectedSubfolder] = useState(() => {
    // Try to restore from localStorage on mount
    const saved = window.localStorage.getItem('workspace:selectedSubfolder')
    return saved || null
  })
  const [viewMode, setViewMode] = useState('grid')
  const [cardMenu, setCardMenu] = useState(null)
  const [renameDialog, setRenameDialog] = useState(null)
  const [renameType, setRenameType] = useState(null) // 'folder', 'subfolder', or 'video'
  const [newName, setNewName] = useState('')
  const [lastUpdatedOpen, setLastUpdatedOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedLastUpdated, setSelectedLastUpdated] = useState(lastUpdatedOptions[0])
  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0])
  const [loading, setLoading] = useState(true)
  const [heygenVideos, setHeygenVideos] = useState([])
  const [isPolling, setIsPolling] = useState(false)
  const menuRefs = useRef({})
  const lastUpdatedRef = useRef(null)
  const filtersRef = useRef(null)

  // Persist selectedFolder to localStorage whenever it changes
  useEffect(() => {
    if (selectedFolder) {
      window.localStorage.setItem('workspace:selectedFolder', selectedFolder)
    } else {
      window.localStorage.removeItem('workspace:selectedFolder')
    }
  }, [selectedFolder])

  // Persist selectedSubfolder to localStorage whenever it changes
  useEffect(() => {
    if (selectedSubfolder) {
      window.localStorage.setItem('workspace:selectedSubfolder', selectedSubfolder)
    } else {
      window.localStorage.removeItem('workspace:selectedSubfolder')
    }
  }, [selectedSubfolder])

  useEffect(() => {
    fetchInitialData()
  }, [])

  // Fetch HeyGen videos when a subfolder (project) is selected
  useEffect(() => {
    if (workspaceId && selectedSubfolder) {
      fetchHeygenVideos()
    } else {
      setHeygenVideos([])
    }
  }, [workspaceId, selectedSubfolder])

  // Polling logic for videos in progress
  useEffect(() => {
    let pollInterval;
    const processingVideos = heygenVideos.filter(v => v.status === 'processing');
    
    if (processingVideos.length > 0 && !isPolling) {
      setIsPolling(true);
      pollInterval = setInterval(() => {
        fetchHeygenVideos(true); // silent refresh
      }, 5000); // Poll every 5 seconds
    } else if (processingVideos.length === 0 && isPolling) {
      setIsPolling(false);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [heygenVideos, isPolling, workspaceId, selectedSubfolder])

  const fetchHeygenVideos = async (silent = false) => {
    if (!workspaceId || !selectedSubfolder) return
    try {
      if (!silent) setLoading(true)
      const videos = await heygenService.listVideos(workspaceId, selectedSubfolder)
      setHeygenVideos(videos || [])
    } catch (error) {
      console.error('Failed to fetch HeyGen videos:', error)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const workspaces = await workspaceService.listWorkspaces()
      console.log('Workspace.jsx — all workspaces:', workspaces)
      // Use personal workspace or the first one available
      const personalWs = workspaces.find(ws => ws.isPersonal || ws.type === 'PRIVATE') || workspaces[0]
      console.log('Workspace.jsx — selected workspace:', personalWs)
      if (personalWs) {
        const wsId = personalWs.id || personalWs._id
        console.log('Workspace.jsx — using workspace ID:', wsId)
        setWorkspaceId(wsId)
        const fetchedFolders = await workspaceService.listFolders(wsId)
        console.log('Workspace.jsx — fetched folders:', fetchedFolders)
        setFolders(fetchedFolders || [])
      } else {
        console.warn('Workspace.jsx — no workspace found')
      }
    } catch (error) {
      console.error('Failed to fetch initial workspace data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Lightweight refresh — only re-fetches folders, no loading spinner
  const refreshFolders = async () => {
    if (!workspaceId) {
      console.warn('refreshFolders: no workspaceId, skipping')
      return
    }
    try {
      console.log('refreshFolders: fetching folders for workspace', workspaceId)
      const fetchedFolders = await workspaceService.listFolders(workspaceId)
      console.log('refreshFolders: got folders', fetchedFolders)
      setFolders(fetchedFolders || [])
    } catch (error) {
      console.error('Failed to refresh folders:', error)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(menuRefs.current).forEach((itemId) => {
        if (menuRefs.current[itemId] && !menuRefs.current[itemId].contains(event.target)) {
          setCardMenu(null)
        }
      })
      if (lastUpdatedRef.current && !lastUpdatedRef.current.contains(event.target)) {
        setLastUpdatedOpen(false)
      }
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setFiltersOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const createNewFolder = async () => {
    if (!workspaceId) return
    try {
      const name = 'Default'
      await workspaceService.createFolder(workspaceId, name)
      await refreshFolders()
    } catch (error) {
      console.error('Failed to create folder:', error)
      alert('Failed to create folder')
    }
  }

  const createNewSubfolder = async (folderId) => {
    if (!workspaceId) return
    try {
      const name = 'Default'
      // Using the same folder API for now. Adjust if a subfolder-specific endpoint exists.
      await workspaceService.createFolder(workspaceId, name)
      await refreshFolders()
    } catch (error) {
      console.error('Failed to create subfolder:', error)
      alert('Failed to create subfolder')
    }
  }

  const renameFolder = async (folderId, newName) => {
    if (!workspaceId) return
    try {
      await workspaceService.renameFolder(workspaceId, folderId, newName)
      await refreshFolders()
      setRenameDialog(null)
      setRenameType(null)
      setNewName('')
    } catch (error) {
      console.error('Failed to rename folder:', error)
      alert('Failed to rename folder')
    }
  }

  const renameSubfolder = async (folderId, subfolderId, newName) => {
    if (!workspaceId) return
    try {
      // Assuming subfolders use the same folder API
      await workspaceService.renameFolder(workspaceId, subfolderId, newName)
      await refreshFolders()
      setRenameDialog(null)
      setRenameType(null)
      setNewName('')
    } catch (error) {
      console.error('Failed to rename subfolder:', error)
      alert('Failed to rename subfolder')
    }
  }

  const renameVideo = async (folderId, subfolderId, videoId, newTitle) => {
    if (!workspaceId) return
    try {
      await workspaceService.renameVideo(workspaceId, videoId, newTitle)
      await refreshFolders()
      setRenameDialog(null)
      setRenameType(null)
      setNewName('')
    } catch (error) {
      alert('Failed to rename video')
    }
  }

  const deleteFolder = async (folderId) => {
    if (!workspaceId) return
    if (window.confirm('Are you sure you want to delete this folder?')) {
      try {
        await workspaceService.deleteFolder(workspaceId, folderId)
        // Clear selection if the deleted folder was active
        if (selectedFolder === folderId) {
          setSelectedFolder(null)
          setSelectedSubfolder(null)
        }
        await refreshFolders()
      } catch (error) {
        console.error('Failed to delete folder:', error)
        alert('Failed to delete folder')
      }
    }
  }

  const deleteSubfolder = async (folderId, subfolderId) => {
    if (!workspaceId) return
    if (window.confirm('Are you sure you want to delete this subfolder?')) {
      try {
        await workspaceService.deleteFolder(workspaceId, subfolderId)
        if (selectedSubfolder === subfolderId) {
          setSelectedSubfolder(null)
        }
        await refreshFolders()
      } catch (error) {
        console.error('Failed to delete subfolder:', error)
        alert('Failed to delete subfolder')
      }
    }
  }

  const deleteVideo = async (folderId, subfolderId, videoId) => {
    if (!workspaceId) return
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await workspaceService.deleteVideo(workspaceId, videoId)
        await refreshFolders()
      } catch (error) {
        alert('Failed to delete video')
      }
    }
  }

  const currentFolder = folders.find(f => f.id === selectedFolder)
  const currentSubfolder = currentFolder?.subfolders?.find(sf => sf.id === selectedSubfolder)

  if (loading) {
    return (
      <div className="workspace-container" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%' 
      }}>
        <div className="loading-spinner">Loading Workspace...</div>
      </div>
    )
  }

  // Render videos view (inside subfolder)
  if (selectedFolder && selectedSubfolder && currentSubfolder) {
    return (
      <>
        <div className="workspace-container">
          <button
            className="back-button"
            onClick={() => setSelectedSubfolder(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              fontWeight: '500',
              fontSize: '14px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '24px',
              width: 'fit-content',
            }}
          >
            <MdArrowBack size={18} />
            Back to {currentFolder.name}
          </button>

          <div className="workspace-header">
            <div className="workspace-title-section">
              <h1 className="workspace-title">{currentSubfolder.name}</h1>
            </div>
            <div className="workspace-controls">
              <div className="view-toggle">
                <button
                  className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <MdGridView />
                </button>
                <button
                  className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <MdViewList />
                </button>
              </div>
              <button className="new-folder-btn" onClick={onCreate}>
                <MdAdd size={18} />
                New video
              </button>
            </div>
          </div>

          {currentSubfolder.videos.length === 0 ? (
            <div className="empty-state">
              <MdPlayArrow className="empty-state-icon" />
              <h3 className="empty-state-title">No videos in this folder</h3>
              <p className="empty-state-text">Create your first video to get started</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'videos-grid' : 'videos-list'}>
              {/* Merge HeyGen videos with existing videos if any */}
              {[...heygenVideos, ...(currentSubfolder.videos || [])].map((video) => {
                const isHeygen = !!video.heygenVideoId || !!video.video_id;
                const status = video.status?.toLowerCase();
                const isProcessing = status === 'processing' || status === 'waiting';
                const videoId = video.id || video.heygenVideoId || video.video_id;
                
                // For HeyGen videos, use the streaming URL
                const playUrl = isHeygen && status === 'completed' 
                  ? heygenService.getStreamUrl(workspaceId, selectedSubfolder, videoId)
                  : video.videoUrl || video.url;

                return (
                  <div
                    key={videoId}
                    className={`video-card ${viewMode === 'list' ? 'list-view' : ''} ${isProcessing ? 'processing' : ''}`}
                    ref={el => menuRefs.current[`video-${videoId}`] = el}
                  >
                    <div className="video-thumb">
                      <img
                        src={video.thumbnail_url || video.image_url || thumbnailUrl}
                        alt={video.title || video.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          opacity: isProcessing ? 0.5 : 1
                        }}
                      />
                      <div className="video-thumb-overlay">
                        <div className={`video-badge ${status}`}>
                          {status?.toUpperCase() || 'DRAFT'}
                        </div>
                        <button
                          className="video-menu-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            setCardMenu(cardMenu === `video-${videoId}` ? null : `video-${videoId}`)
                          }}
                        >
                          <MdMoreVert />
                        </button>
                        {cardMenu === `video-${videoId}` && (
                          <div className="video-menu" onClick={(e) => e.stopPropagation()}>
                            <button
                              className="video-menu-item"
                              onClick={(e) => {
                                e.stopPropagation()
                                setRenameDialog({ folderId: selectedFolder, subfolderId: selectedSubfolder, videoId })
                                setRenameType('video')
                                setNewName(video.title || video.name)
                                setCardMenu(null)
                              }}
                            >
                              <MdEdit className="video-menu-icon" />
                              Rename
                            </button>
                            
                            {isHeygen && status === 'completed' && (
                              <button
                                className="video-menu-item"
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  try {
                                    const { presignedUrl } = await heygenService.downloadVideo(workspaceId, selectedSubfolder, videoId);
                                    window.open(presignedUrl, '_blank');
                                  } catch (err) {
                                    alert('Download failed. Please try again.');
                                  }
                                  setCardMenu(null)
                                }}
                              >
                                <MdPlayCircleFilled className="video-menu-icon" style={{ transform: 'rotate(90deg)' }} />
                                Download
                              </button>
                            )}

                            <button
                              className="video-menu-item delete"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteVideo(selectedFolder, selectedSubfolder, videoId)
                              }}
                            >
                              <MdDelete className="video-menu-icon" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>

                      {!isProcessing ? (
                        <div 
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.95)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-muted)',
                            fontSize: '24px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            zIndex: 10
                          }}
                          onClick={() => {
                            if (playUrl) window.open(playUrl, '_blank');
                          }}
                        >
                          <MdPlayArrow />
                        </div>
                      ) : (
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          textAlign: 'center',
                          color: '#fff',
                          zIndex: 10
                        }}>
                          <div className="spinner" style={{ margin: '0 auto 8px' }}></div>
                          <div style={{ fontSize: '10px', fontWeight: '700' }}>RENDERING</div>
                        </div>
                      )}

                      {video.duration && (
                        <div className="video-duration">
                          {video.duration}
                        </div>
                      )}
                    </div>
                    <div className="video-info">
                      <h4 className="video-title">{video.title || video.name || 'Untitled Video'}</h4>
                      <p className="video-meta">
                        {isProcessing ? 'Status: Processing...' : `Updated ${video.updated_at || video.updated || 'recently'}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </>
    )
  }

  // Render subfolders view (inside folder)
  if (selectedFolder && currentFolder) {
    return (
      <>
        <div className="workspace-container">
          <button
            className="back-button"
            onClick={() => setSelectedFolder(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              fontWeight: '500',
              fontSize: '14px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '24px',
              width: 'fit-content',
            }}
          >
            <MdArrowBack size={18} />
            Back to Workspace
          </button>

          <div className="workspace-header">
            <div className="workspace-title-section">
              <h1 className="workspace-title">{currentFolder.name}</h1>
            </div>
            <div className="workspace-controls">
              <div className="view-toggle">
                <button
                  className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <MdGridView />
                </button>
                <button
                  className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <MdViewList />
                </button>
              </div>
              <button className="new-folder-btn" onClick={() => createNewSubfolder(selectedFolder)}>
                <MdAdd size={18} />
                New folder
              </button>
              <button className="new-folder-btn" style={{ background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' }} onClick={onCreate}>
                <MdAdd size={18} />
                New Video
              </button>
            </div>
          </div>

          <div className="folders-section">
            <h2 className="section-heading">Subfolders</h2>
            {!currentFolder.subfolders || currentFolder.subfolders.length === 0 ? (
              <div className="empty-state">
                <MdFolder className="empty-state-icon" />
                <h3 className="empty-state-title">No subfolders yet</h3>
                <p className="empty-state-text">This folder is empty</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'folders-grid' : 'folders-list'}>
                {currentFolder.subfolders.map((subfolder) => (
                  <div
                    key={subfolder.id}
                    className={`folder-card ${viewMode === 'list' ? 'list-view' : ''}`}
                    onClick={() => setSelectedSubfolder(subfolder.id)}
                    ref={el => menuRefs.current[`subfolder-${subfolder.id}`] = el}
                  >
                    <div className="folder-icon-wrapper">
                      <MdFolder size={24} />
                    </div>
                    <div className="folder-info">
                      <h3 className="folder-name">{subfolder.name}</h3>
                      <p className="folder-meta" style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                        {subfolder.videos?.length || 0} {subfolder.videos?.length === 1 ? 'video' : 'videos'}
                      </p>
                    </div>
                    <button
                      className="folder-menu-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        setCardMenu(cardMenu === `subfolder-${subfolder.id}` ? null : `subfolder-${subfolder.id}`)
                      }}
                    >
                      <MdMoreVert />
                    </button>
                    {cardMenu === `subfolder-${subfolder.id}` && (
                      <div className="folder-menu" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="folder-menu-item"
                          onClick={(e) => {
                            e.stopPropagation()
                            setRenameDialog({ folderId: selectedFolder, subfolderId: subfolder.id })
                            setRenameType('subfolder')
                            setNewName(subfolder.name)
                            setCardMenu(null)
                          }}
                        >
                          <MdEdit className="folder-menu-icon" />
                          Rename
                        </button>
                        <button
                          className="folder-menu-item delete"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSubfolder(selectedFolder, subfolder.id)
                          }}
                        >
                          <MdDelete className="folder-menu-icon" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </>
    )
  }

  // Render main folders view
  return (
    <>
      <div className="workspace-container">
        <div className="workspace-header">
          <div className="workspace-title-section">
            <h1 className="workspace-title">Workspace</h1>
            <button className="new-folder-btn" onClick={createNewFolder}>
              <MdFolder size={18} />
              New folder
            </button>
            <button className="new-folder-btn" style={{ background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' }} onClick={onCreate}>
              <MdAdd size={18} />
              New Video
            </button>
          </div>
          <div className="workspace-controls">
            <div className="filter-dropdown" ref={lastUpdatedRef}>
              <button
                className="dropdown-btn"
                onClick={() => setLastUpdatedOpen(!lastUpdatedOpen)}
              >
                {selectedLastUpdated.label}
                <MdKeyboardArrowDown size={18} />
              </button>
              {lastUpdatedOpen && (
                <div className="dropdown-menu">
                  {lastUpdatedOptions.map((option) => (
                    <button
                      key={option.value}
                      className="dropdown-item"
                      onClick={() => {
                        setSelectedLastUpdated(option)
                        setLastUpdatedOpen(false)
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="filter-dropdown" ref={filtersRef}>
              <button
                className="dropdown-btn"
                onClick={() => setFiltersOpen(!filtersOpen)}
              >
                <MdFilterList size={18} />
                Filters
                <MdKeyboardArrowDown size={18} />
              </button>
              {filtersOpen && (
                <div className="dropdown-menu">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      className="dropdown-item"
                      onClick={() => {
                        setSelectedFilter(option)
                        setFiltersOpen(false)
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="view-toggle">
              <button
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <MdGridView />
              </button>
              <button
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <MdViewList />
              </button>
            </div>
          </div>
        </div>

        <div className="folders-section">
          <h2 className="section-heading">Folders</h2>
          {folders.length === 0 ? (
            <div className="empty-state">
              <MdFolder className="empty-state-icon" />
              <h3 className="empty-state-title">No folders yet</h3>
              <p className="empty-state-text">Create your first folder to get started</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'folders-grid' : 'folders-list'}>
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className={`folder-card ${viewMode === 'list' ? 'list-view' : ''}`}
                  onClick={() => setSelectedFolder(folder.id)}
                  ref={el => menuRefs.current[`folder-${folder.id}`] = el}
                >
                  <div className="folder-icon-wrapper">
                    <MdFolder size={24} />
                  </div>
                  <div className="folder-info">
                    <h3 className="folder-name">{folder.name}</h3>
                    {folder.subfolders && (
                      <p className="folder-meta" style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                        {folder.subfolders.length} {folder.subfolders.length === 1 ? 'subfolder' : 'subfolders'}
                      </p>
                    )}
                  </div>
                  <button
                    className="folder-menu-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      setCardMenu(cardMenu === `folder-${folder.id}` ? null : `folder-${folder.id}`)
                    }}
                  >
                    <MdMoreVert />
                  </button>
                  {cardMenu === `folder-${folder.id}` && (
                    <div className="folder-menu" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="folder-menu-item"
                        onClick={(e) => {
                          e.stopPropagation()
                          setRenameDialog(folder.id)
                          setRenameType('folder')
                          setNewName(folder.name)
                          setCardMenu(null)
                        }}
                      >
                        <MdEdit className="folder-menu-icon" />
                        Rename
                      </button>
                      <button
                        className="folder-menu-item delete"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteFolder(folder.id)
                        }}
                      >
                        <MdDelete className="folder-menu-icon" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {renameDialog && (
        <div className="rename-dialog-overlay" onClick={() => {
          setRenameDialog(null)
          setRenameType(null)
          setNewName('')
        }}>
          <div className="rename-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="rename-dialog-header">
              <h3 className="rename-dialog-title">
                {renameType === 'folder' ? 'Rename Folder' : renameType === 'subfolder' ? 'Rename Subfolder' : 'Rename Video'}
              </h3>
              <button
                className="rename-dialog-close"
                onClick={() => {
                  setRenameDialog(null)
                  setRenameType(null)
                  setNewName('')
                }}
              >
                <MdClose size={20} />
              </button>
            </div>
            <input
              type="text"
              className="rename-input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newName.trim()) {
                  if (renameType === 'folder') {
                    renameFolder(renameDialog, newName.trim())
                  } else if (renameType === 'subfolder') {
                    renameSubfolder(renameDialog.folderId, renameDialog.subfolderId, newName.trim())
                  } else if (renameType === 'video') {
                    renameVideo(renameDialog.folderId, renameDialog.subfolderId, renameDialog.videoId, newName.trim())
                  }
                } else if (e.key === 'Escape') {
                  setRenameDialog(null)
                  setRenameType(null)
                  setNewName('')
                }
              }}
              placeholder={renameType === 'video' ? 'Enter video title' : 'Enter folder name'}
              autoFocus
            />
            <div className="rename-dialog-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  setRenameDialog(null)
                  setRenameType(null)
                  setNewName('')
                }}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  if (newName.trim()) {
                    if (renameType === 'folder') {
                      renameFolder(renameDialog, newName.trim())
                    } else if (renameType === 'subfolder') {
                      renameSubfolder(renameDialog.folderId, renameDialog.subfolderId, newName.trim())
                    } else if (renameType === 'video') {
                      renameVideo(renameDialog.folderId, renameDialog.subfolderId, renameDialog.videoId, newName.trim())
                    }
                  }
                }}
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Workspace

