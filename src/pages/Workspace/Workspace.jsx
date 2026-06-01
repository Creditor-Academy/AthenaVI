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
  MdCheckCircle,
  MdCancel,
  MdWarning,
} from 'react-icons/md'
import workspaceService from '../../services/workspaceService'
import heygenService from '../../services/heygenService'
import { getAuthHeaders } from '../../config/api.js'
import WorkspaceSkeleton from '../page-skeleton/WorkspaceSkeleton'
import './Workspace.css'

const thumbnailUrl = 'https://media.istockphoto.com/id/1475888355/video/timelapse-of-the-creation-of-an-online-avatar-start-to-finish.jpg?s=640x640&k=20&c=pFzBOkU7LjC1DF0DeNCAUhS8MCiNwSDwkqI9v9C7IgQ='


const lastUpdatedOptions = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
]

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'recent', label: 'Recently updated' },
  { value: 'name', label: 'Name (A-Z)' },
]

const formatDate = (iso) => {
  if (!iso || iso === '-') return '—'
  try {
    const d = new Date(iso)
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }
    if (iso.includes(',')) {
      return iso.split(',')[0].trim()
    }
    return iso
  } catch {
    return iso
  }
}

const getFolderVideosCount = (folder) => {
  if (!folder.subfolders) return 0
  return folder.subfolders.reduce((acc, sf) => acc + (sf.videos?.length || 0), 0)
}

const filterAndSortItems = (items, selectedLastUpdated, selectedFilter, nameField = 'name') => {
  if (!items) return []
  let result = [...items]

  // 1. Filter by Last Updated Date
  if (selectedLastUpdated && selectedLastUpdated.value !== 'all') {
    const now = Date.now()
    const todayStart = new Date().setHours(0,0,0,0)
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000

    result = result.filter(item => {
      const dateStr = item.updatedAt || item.createdAt || item.updated_at || item.updated
      if (!dateStr) return false
      const t = new Date(dateStr).getTime()
      if (selectedLastUpdated.value === 'today') return t >= todayStart
      if (selectedLastUpdated.value === 'week') return t >= oneWeekAgo
      if (selectedLastUpdated.value === 'month') return t >= oneMonthAgo
      return true
    })
  }

  // 2. Sort by Filter
  if (selectedFilter) {
    if (selectedFilter.value === 'name') {
      result.sort((a, b) => {
        const nameA = String(a[nameField] || a.title || '').toLowerCase()
        const nameB = String(b[nameField] || b.title || '').toLowerCase()
        return nameA.localeCompare(nameB)
      })
    } else if (selectedFilter.value === 'recent') {
      result.sort((a, b) => {
        const tA = new Date(a.updatedAt || a.createdAt || a.updated_at || a.updated || 0).getTime()
        const tB = new Date(b.updatedAt || b.createdAt || b.updated_at || b.updated || 0).getTime()
        return tB - tA
      })
    }
  }

  return result
}

function Workspace({ onCreate, onEdit }) {
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
  const [projects, setProjects] = useState([])
  const [toast, setToast] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)
  const menuRefs = useRef({})
  const lastUpdatedRef = useRef(null)
  const filtersRef = useRef(null)
  const toastTimeoutRef = useRef(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null)
    }, 2800)
  }

  const openConfirmDialog = (message, onConfirm) => {
    setConfirmDialog({ message, onConfirm })
  }

  const closeRenameDialog = (showDiscardToast = false) => {
    if (showDiscardToast) {
      showToast('Changes discarded', 'error')
    }
    setRenameDialog(null)
    setRenameType(null)
    setNewName('')
  }

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current)
      }
    }
  }, [])

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

  // Fetch projects when a subfolder is selected
  useEffect(() => {
    if (workspaceId && selectedSubfolder) {
      fetchProjects()
    } else {
      setProjects([])
    }
  }, [workspaceId, selectedSubfolder])

  const fetchProjects = async (silent = false) => {
    if (!workspaceId || !selectedSubfolder) return
    try {
      if (!silent) setLoading(true)
      const fetchedProjects = await workspaceService.listProjects(workspaceId, selectedSubfolder)
      setProjects(fetchedProjects || [])
    } catch (error) {
      console.error('Failed to fetch projects:', error)
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
      showToast('Folder created successfully', 'success')
    } catch (error) {
      console.error('Failed to create folder:', error)
      showToast('Failed to create folder. Please try again.', 'error')
    }
  }

  const createNewSubfolder = async (folderId) => {
    if (!workspaceId) return
    try {
      const name = 'Default'
      // Using the same folder API for now. Adjust if a subfolder-specific endpoint exists.
      await workspaceService.createFolder(workspaceId, name)
      await refreshFolders()
      showToast('Subfolder created successfully', 'success')
    } catch (error) {
      console.error('Failed to create subfolder:', error)
      showToast('Failed to create subfolder. Please try again.', 'error')
    }
  }

  const renameFolder = async (folderId, newName) => {
    if (!workspaceId) return
    try {
      await workspaceService.renameFolder(workspaceId, folderId, newName)
      await refreshFolders()
      closeRenameDialog(false)
      showToast('Folder renamed successfully', 'success')
    } catch (error) {
      console.error('Failed to rename folder:', error)
      showToast('Failed to rename folder. Please try again.', 'error')
    }
  }

  const renameSubfolder = async (folderId, subfolderId, newName) => {
    if (!workspaceId) return
    try {
      // Assuming subfolders use the same folder API
      await workspaceService.renameFolder(workspaceId, subfolderId, newName)
      await refreshFolders()
      closeRenameDialog(false)
      showToast('Subfolder renamed successfully', 'success')
    } catch (error) {
      console.error('Failed to rename subfolder:', error)
      showToast('Failed to rename subfolder. Please try again.', 'error')
    }
  }

  const renameVideo = async (folderId, subfolderId, videoId, newTitle) => {
    if (!workspaceId) return
    try {
      await workspaceService.updateProject(workspaceId, videoId, { name: newTitle })
      await refreshFolders()
      closeRenameDialog(false)
      showToast('Project renamed successfully', 'success')
    } catch (error) {
      console.error('Failed to rename project:', error)
      showToast('Failed to rename project. Please try again.', 'error')
    }
  }

  const deleteFolder = (folderId) => {
    if (!workspaceId) return
    openConfirmDialog('Are you sure you want to delete this folder?', async () => {
      try {
        await workspaceService.deleteFolder(workspaceId, folderId)
        // Clear selection if the deleted folder was active
        if (selectedFolder === folderId) {
          setSelectedFolder(null)
          setSelectedSubfolder(null)
        }
        await refreshFolders()
        showToast('Folder deleted successfully', 'success')
      } catch (error) {
        console.error('Failed to delete folder:', error)
        showToast('Failed to delete folder. Please try again.', 'error')
      }
    })
  }

  const deleteSubfolder = (folderId, subfolderId) => {
    if (!workspaceId) return
    openConfirmDialog('Are you sure you want to delete this subfolder?', async () => {
      try {
        await workspaceService.deleteFolder(workspaceId, subfolderId)
        if (selectedSubfolder === subfolderId) {
          setSelectedSubfolder(null)
        }
        await refreshFolders()
        showToast('Subfolder deleted successfully', 'success')
      } catch (error) {
        console.error('Failed to delete subfolder:', error)
        showToast('Failed to delete subfolder. Please try again.', 'error')
      }
    })
  }

  const deleteVideo = (folderId, subfolderId, videoId) => {
    if (!workspaceId) return
    openConfirmDialog('Are you sure you want to delete this project?', async () => {
      try {
        await workspaceService.deleteProject(workspaceId, videoId)
        await refreshFolders()
        showToast('Project deleted successfully', 'success')
      } catch (error) {
        console.error('Failed to delete project:', error)
        showToast('Failed to delete project. Please try again.', 'error')
      }
    })
  }

  const currentFolder = folders.find(f => f.id === selectedFolder)
  const currentSubfolder = currentFolder?.subfolders?.find(sf => sf.id === selectedSubfolder)

  if (loading) {
    return <WorkspaceSkeleton />
  }

  // Render videos view (inside subfolder)
  if (selectedFolder && selectedSubfolder && currentSubfolder) {
    const displayedProjects = filterAndSortItems(projects, selectedLastUpdated, selectedFilter, 'title');

    return (
      <>
        <div className="workspace-container">
          <div className="workspace-header">
            <div className="workspace-title-section">
              <button
                className="back-button-inline"
                onClick={() => setSelectedSubfolder(null)}
                title={`Back to ${currentFolder.name}`}
              >
                <MdArrowBack size={20} />
              </button>
              <h1 className="workspace-title">{currentSubfolder.name}</h1>
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
              <button 
                className="new-folder-btn" 
                onClick={() => onCreate({ initialWorkspaceId: workspaceId, initialFolderId: selectedSubfolder || selectedFolder })}
                style={{ background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' }}
              >
                <MdAdd size={18} />
                New video
              </button>
            </div>
          </div>

          {displayedProjects.length === 0 ? (
            <div className="empty-state">
              <MdPlayArrow className="empty-state-icon" />
              <h3 className="empty-state-title">No projects in this folder</h3>
              <p className="empty-state-text">Create your first project to get started</p>
            </div>
          ) : (
            <>
              {viewMode === 'list' && (
                <div className="list-view-header">
                  <div className="list-view-header-item">Name</div>
                  <div className="list-view-header-item">Duration</div>
                  <div className="list-view-header-item">Status</div>
                  <div className="list-view-header-item">Last Updated</div>
                  <div className="list-view-header-item" style={{ justifyContent: 'flex-end' }}>Actions</div>
                </div>
              )}
              <div className={viewMode === 'grid' ? 'videos-grid' : 'videos-list'}>
                {displayedProjects.map((video) => {
                  const status = video.status?.toLowerCase();
                  const isProcessing = status === 'processing' || status === 'waiting';
                  const videoId = video.id || video._id;
                  const isHeygen = !!(video.heygenVideoId || video.heygen_video_id || video.video_id || video.id || video._id);
                  
                  if (viewMode === 'list') {
                    return (
                      <div
                        key={videoId}
                        className={`video-card list-view ${isProcessing ? 'processing' : ''}`}
                        onClick={() => !isProcessing && onEdit && onEdit({ ...video, workspaceId })}
                        ref={el => menuRefs.current[`video-${videoId}`] = el}
                      >
                        <div className="list-name-col">
                          <div className="video-thumb-small">
                            <img
                              src={video.thumbnail_url || video.image_url || thumbnailUrl}
                              alt={video.title || video.name}
                            />
                            {isProcessing && (
                              <div className="spinner-overlay-small">
                                <div className="spinner-small"></div>
                              </div>
                            )}
                          </div>
                          <span className="video-title">{video.title || video.name || 'Untitled Video'}</span>
                        </div>

                        <div className="video-duration-col">
                          {video.duration || '—'}
                        </div>

                        <div className="video-status-col">
                          <span className={`status-badge ${status}`}>
                            {status?.toUpperCase() || 'DRAFT'}
                          </span>
                        </div>

                        <div className="video-updated-col">
                          {formatDate(video.updated_at || video.updated || video.updatedAt)}
                        </div>

                        <div className="video-actions-col" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="folder-menu-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              setCardMenu(cardMenu === `video-${videoId}` ? null : `video-${videoId}`)
                            }}
                          >
                            <MdMoreVert />
                          </button>
                          {cardMenu === `video-${videoId}` && (
                            <div className="folder-menu dropdown-right">
                              <button
                                className="folder-menu-item"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setRenameDialog({ folderId: selectedFolder, subfolderId: selectedSubfolder, videoId })
                                  setRenameType('video')
                                  setNewName(video.title || video.name)
                                  setCardMenu(null)
                                }}
                              >
                                <MdEdit className="folder-menu-icon" />
                                Rename
                              </button>
                              
                              {status === 'completed' && (
                                <button
                                  className="folder-menu-item"
                                  onClick={async (e) => {
                                    e.stopPropagation()
                                    try {
                                      const { presignedUrl } = await heygenService.downloadVideo(workspaceId, selectedSubfolder, videoId);
                                      window.open(presignedUrl, '_blank');
                                      showToast('Download started successfully', 'success')
                                    } catch (err) {
                                      showToast('Download failed. Please try again.', 'error')
                                    }
                                    setCardMenu(null)
                                  }}
                                >
                                  <MdPlayCircleFilled className="folder-menu-icon" style={{ transform: 'rotate(90deg)' }} />
                                  Download
                                </button>
                              )}

                              <button
                                className="folder-menu-item delete"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteVideo(selectedFolder, selectedSubfolder, videoId)
                                }}
                              >
                                <MdDelete className="folder-menu-icon" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                      <div
                        key={videoId}
                        className={`video-card ${isProcessing ? 'processing' : ''}`}
                        ref={el => menuRefs.current[`video-${videoId}`] = el}
                        onClick={() => !isProcessing && onEdit && onEdit({ ...video, workspaceId })}
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
                              
                              {status === 'completed' && (
                                <button
                                  className="video-menu-item"
                                  onClick={async (e) => {
                                    e.stopPropagation()
                                    try {
                                      const { presignedUrl } = await heygenService.downloadVideo(workspaceId, selectedSubfolder, videoId);
                                      window.open(presignedUrl, '_blank');
                                      showToast('Download started successfully', 'success')
                                    } catch (err) {
                                      showToast('Download failed. Please try again.', 'error')
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

                        {!isProcessing && (
                          <div 
                            className="video-play-overlay"
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
                          >
                            <MdEdit />
                          </div>
                        )}
                        {isProcessing && (
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
                          {isProcessing ? 'Status: Processing...' : `Updated ${formatDate(video.updated_at || video.updated || video.updatedAt)}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </>
    )
  }

  // Render subfolders view (inside folder)
  if (selectedFolder && currentFolder) {
    const displayedSubfolders = filterAndSortItems(currentFolder.subfolders, selectedLastUpdated, selectedFilter, 'name');

    return (
      <>
        <div className="workspace-container">
          <div className="workspace-header">
            <div className="workspace-title-section">
              <button
                className="back-button-inline"
                onClick={() => setSelectedFolder(null)}
                title="Back to Workspace"
              >
                <MdArrowBack size={20} />
              </button>
              <h1 className="workspace-title">{currentFolder.name}</h1>
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
              <button className="new-folder-btn" onClick={() => createNewSubfolder(selectedFolder)}>
                <MdAdd size={18} />
                New folder
              </button>
              <button 
                className="new-folder-btn" 
                style={{ background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' }} 
                onClick={() => onCreate({ initialWorkspaceId: workspaceId, initialFolderId: selectedFolder })}
              >
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
              <>
                {viewMode === 'list' && (
                  <div className="list-view-header">
                    <div className="list-view-header-item">Name</div>
                    <div className="list-view-header-item">Subfolders</div>
                    <div className="list-view-header-item">Videos</div>
                    <div className="list-view-header-item">Last Updated</div>
                    <div className="list-view-header-item" style={{ justifyContent: 'flex-end' }}>Actions</div>
                  </div>
                )}
                <div className={viewMode === 'grid' ? 'folders-grid' : 'folders-list'}>
                  {displayedSubfolders.map((subfolder) => {
                    const videosCount = subfolder.videos?.length || 0;
                    const updatedDateStr = subfolder.updatedAt || subfolder.createdAt || subfolder.updated_at || subfolder.updated;

                    if (viewMode === 'list') {
                      return (
                        <div
                          key={subfolder.id}
                          className="folder-card list-view"
                          onClick={() => setSelectedSubfolder(subfolder.id)}
                          ref={el => menuRefs.current[`subfolder-${subfolder.id}`] = el}
                        >
                          <div className="list-name-col">
                            <div className="folder-icon-wrapper">
                              <MdFolder size={24} />
                            </div>
                            <span className="folder-name">{subfolder.name}</span>
                          </div>
                          
                          <div className="subfolders-col">
                            —
                          </div>

                          <div className="videos-col">
                            {videosCount} {videosCount === 1 ? 'video' : 'videos'}
                          </div>

                          <div className="updated-col">
                            {formatDate(updatedDateStr)}
                          </div>

                          <div className="actions-col" onClick={(e) => e.stopPropagation()}>
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
                              <div className="folder-menu" style={{ right: '20px', top: '35px' }}>
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
                        </div>
                      );
                    }

                    return (
                      <div
                        key={subfolder.id}
                        className="folder-card"
                        onClick={() => setSelectedSubfolder(subfolder.id)}
                        ref={el => menuRefs.current[`subfolder-${subfolder.id}`] = el}
                      >
                        <div className="folder-icon-wrapper">
                          <MdFolder size={24} />
                        </div>
                        <div className="folder-info">
                          <h3 className="folder-name">{subfolder.name}</h3>
                          <p className="folder-meta">
                            {videosCount} {videosCount === 1 ? 'video' : 'videos'}
                          </p>
                          <p className="folder-updated">
                            Updated {formatDate(updatedDateStr)}
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
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </>
    )
  }

  // Render main folders view
  const displayedFolders = filterAndSortItems(folders, selectedLastUpdated, selectedFilter, 'name');

  return (
    <>
      <div className="workspace-container">
        <div className="workspace-header">
          <div className="workspace-title-section">
            <h1 className="workspace-title">Workspace</h1>
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
            <button className="new-folder-btn" onClick={createNewFolder}>
              <MdFolder size={18} />
              New folder
            </button>
            <button 
              className="new-folder-btn" 
              style={{ background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' }} 
              onClick={() => onCreate({ initialWorkspaceId: workspaceId })}
            >
              <MdAdd size={18} />
              New Video
            </button>
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
            <>
              {viewMode === 'list' && (
                <div className="list-view-header">
                  <div className="list-view-header-item">Name</div>
                  <div className="list-view-header-item">Subfolders</div>
                  <div className="list-view-header-item">Videos</div>
                  <div className="list-view-header-item">Last Updated</div>
                  <div className="list-view-header-item" style={{ justifyContent: 'flex-end' }}>Actions</div>
                </div>
              )}
              <div className={viewMode === 'grid' ? 'folders-grid' : 'folders-list'}>
                {displayedFolders.map((folder) => {
                  const subfoldersCount = folder.subfolders?.length || 0;
                  const videosCount = getFolderVideosCount(folder);
                  const updatedDateStr = folder.updatedAt || folder.createdAt || folder.updated_at || folder.updated;

                  if (viewMode === 'list') {
                    return (
                      <div
                        key={folder.id}
                        className="folder-card list-view"
                        onClick={() => setSelectedFolder(folder.id)}
                        ref={el => menuRefs.current[`folder-${folder.id}`] = el}
                      >
                        <div className="list-name-col">
                          <div className="folder-icon-wrapper">
                            <MdFolder size={24} />
                          </div>
                          <span className="folder-name">{folder.name}</span>
                        </div>
                        
                        <div className="subfolders-col">
                          {subfoldersCount} {subfoldersCount === 1 ? 'subfolder' : 'subfolders'}
                        </div>

                        <div className="videos-col">
                          {videosCount} {videosCount === 1 ? 'video' : 'videos'}
                        </div>

                        <div className="updated-col">
                          {formatDate(updatedDateStr)}
                        </div>

                        <div className="actions-col" onClick={(e) => e.stopPropagation()}>
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
                            <div className="folder-menu" style={{ right: '20px', top: '35px' }}>
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
                      </div>
                    );
                  }

                  return (
                    <div
                      key={folder.id}
                      className="folder-card"
                      onClick={() => setSelectedFolder(folder.id)}
                      ref={el => menuRefs.current[`folder-${folder.id}`] = el}
                    >
                      <div className="folder-icon-wrapper">
                        <MdFolder size={24} />
                      </div>
                      <div className="folder-info">
                        <h3 className="folder-name">{folder.name}</h3>
                        <p className="folder-meta">
                          {subfoldersCount} {subfoldersCount === 1 ? 'subfolder' : 'subfolders'} • {videosCount} {videosCount === 1 ? 'video' : 'videos'}
                        </p>
                        <p className="folder-updated">
                          Updated {formatDate(updatedDateStr)}
                        </p>
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
                  );
                })}
              </div>
            </>
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
                  closeRenameDialog(Boolean(newName.trim()))
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
                  closeRenameDialog(Boolean(newName.trim()))
                }
              }}
              placeholder={renameType === 'video' ? 'Enter video title' : 'Enter folder name'}
              autoFocus
            />
            <div className="rename-dialog-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  closeRenameDialog(Boolean(newName.trim()))
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

      {confirmDialog && (
        <div className="confirm-dialog-overlay" onClick={() => setConfirmDialog(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-dialog-icon-wrap">
              <MdWarning className="confirm-dialog-icon" />
            </div>
            <h3 className="confirm-dialog-title">Please confirm</h3>
            <p className="confirm-dialog-message">{confirmDialog.message}</p>
            <div className="confirm-dialog-actions">
              <button className="btn-secondary" onClick={() => setConfirmDialog(null)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={async () => {
                  const onConfirm = confirmDialog.onConfirm
                  setConfirmDialog(null)
                  if (onConfirm) {
                    await onConfirm()
                  }
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`workspace-toast workspace-toast--${toast.type}`}>
          {toast.type === 'success' ? (
            <MdCheckCircle className="workspace-toast-icon" />
          ) : (
            <MdCancel className="workspace-toast-icon" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </>
  )
}

export default Workspace

