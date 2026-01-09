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

const styles = `
.workspace-container {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.workspace-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.workspace-title-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.workspace-title {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.01em;
}

.new-folder-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #334155;
  font-weight: 600;
  font-size: 14px;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.new-folder-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.workspace-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-dropdown {
  position: relative;
}

.dropdown-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #334155;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  min-width: 180px;
  overflow: hidden;
  z-index: 100;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.15s ease;
  font-size: 14px;
  color: #334155;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
}

.dropdown-item:hover {
  background: #f8fafc;
}

.view-toggle {
  display: flex;
  align-items: center;
  gap: 0;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 2px;
}

.view-toggle-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-size: 18px;
}

.view-toggle-btn.active {
  background: #ffffff;
  color: #3b82f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.folders-section {
  margin-top: 8px;
}

.section-heading {
  font-size: 16px;
  font-weight: 600;
  color: #334155;
  margin: 0 0 20px;
}

.folders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.folders-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.folder-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
}

.folder-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.folder-card.list-view {
  padding: 16px 20px;
}

.folder-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  font-size: 24px;
  flex-shrink: 0;
}

.folder-info {
  flex: 1;
  min-width: 0;
}

.folder-name {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.folder-menu-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  font-size: 18px;
  opacity: 0;
}

.folder-card:hover .folder-menu-btn {
  opacity: 1;
}

.folder-menu-btn:hover {
  background: #f1f5f9;
  color: #334155;
}

.folder-menu {
  position: absolute;
  top: 40px;
  right: 10px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  min-width: 160px;
  overflow: hidden;
  z-index: 100;
  animation: slideDown 0.2s ease;
}

.folder-menu-item {
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: background 0.15s ease;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  font-size: 13px;
  font-weight: 500;
  color: #334155;
}

.folder-menu-item:hover {
  background: #f8fafc;
}

.folder-menu-item.delete {
  color: #ef4444;
}

.folder-menu-item.delete:hover {
  background: #fef2f2;
}

.folder-menu-icon {
  font-size: 18px;
  color: #64748b;
  flex-shrink: 0;
}

.folder-menu-item.delete .folder-menu-icon {
  color: #ef4444;
}

.rename-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.rename-dialog {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.2s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.rename-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.rename-dialog-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.rename-dialog-close {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #64748b;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rename-dialog-close:hover {
  background: #f1f5f9;
  color: #334155;
}

.rename-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 20px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}

.rename-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.rename-dialog-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-secondary {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.btn-primary {
  padding: 8px 16px;
  border: none;
  background: #3b82f6;
  color: #ffffff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #2563eb;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #64748b;
}

.empty-state-icon {
  font-size: 64px;
  color: #cbd5e1;
  margin-bottom: 16px;
}

.empty-state-title {
  font-size: 18px;
  font-weight: 600;
  color: #334155;
  margin: 0 0 8px;
}

.empty-state-text {
  font-size: 14px;
  margin: 0;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #334155;
  font-weight: 500;
  font-size: 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 24px;
  width: fit-content;
}

.back-button:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.videos-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.video-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  overflow: hidden;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
}

.video-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.video-card.list-view {
  display: flex;
  align-items: center;
  padding: 12px;
  gap: 16px;
}

.video-card.list-view .video-thumb {
  width: 160px;
  height: 90px;
  flex-shrink: 0;
  border-radius: 6px;
}

.video-card.list-view .video-info {
  padding: 0;
  flex: 1;
}

.video-card.list-view .video-title {
  font-size: 14px;
  margin-bottom: 4px;
  -webkit-line-clamp: 1;
}

.video-card.list-view .video-meta {
  font-size: 12px;
}

.video-thumb {
  width: 100%;
  height: 120px;
  background: #f1f5f9;
  position: relative;
  overflow: hidden;
}

.video-thumb-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 60%);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 8px;
}

.video-badge {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-radius: 4px;
  padding: 3px 7px;
  font-size: 9px;
  font-weight: 600;
  color: #334155;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.video-badge.draft {
  background: rgba(255, 243, 224, 0.95);
  color: #f59e0b;
}

.video-menu-btn {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  color: #334155;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 16px;
}

.video-menu-btn:hover {
  background: #ffffff;
}

.video-duration {
  position: absolute;
  bottom: 6px;
  left: 6px;
  background: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 500;
  font-family: 'Courier New', monospace;
}

.video-info {
  padding: 12px;
}

.video-title {
  font-size: 13px;
  font-weight: 500;
  color: #0f172a;
  margin: 0 0 4px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-meta {
  font-size: 11px;
  color: #64748b;
  margin: 0;
  font-weight: 400;
}

.video-menu {
  position: absolute;
  top: 40px;
  right: 8px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  min-width: 140px;
  overflow: hidden;
  z-index: 100;
  animation: slideDown 0.2s ease;
}

.video-menu-item {
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: background 0.15s ease;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  font-size: 13px;
  font-weight: 500;
  color: #334155;
}

.video-menu-item:hover {
  background: #f8fafc;
}

.video-menu-item.delete {
  color: #ef4444;
}

.video-menu-item.delete:hover {
  background: #fef2f2;
}

.video-menu-icon {
  font-size: 16px;
  color: #64748b;
  flex-shrink: 0;
}

.video-menu-item.delete .video-menu-icon {
  color: #ef4444;
}
`

const thumbnailUrl = 'https://media.istockphoto.com/id/1480023591/video/creating-a-female-video-game-character.jpg?s=640x640&k=20&c=S1LW6oZZDQYgsqp4GRL0bj9wE1oRIaBfQSV-UQXv2II='

const initialFolders = [
  {
    id: 'f1',
    name: 'roadmap series',
    updated: '2 days ago',
    subfolders: [
      {
        id: 'sf1',
        name: 'Marketing',
        videos: [
          {
            id: 'v1',
            title: 'Sustainable Work',
            status: 'draft',
            updated: '23h ago',
            duration: '01:50',
            pinned: false,
          },
          {
            id: 'v4',
            title: 'Client Update',
            status: 'draft',
            updated: '5d ago',
            duration: null,
            pinned: false,
          },
        ],
      },
      {
        id: 'sf2',
        name: 'Internal',
        videos: [
          {
            id: 'v2',
            title: 'Untitled',
            status: 'draft',
            updated: 'yesterday',
            duration: null,
            pinned: true,
          },
          {
            id: 'v6',
            title: 'Welcome Series',
            status: 'draft',
            updated: '1d ago',
            duration: '02:04',
            pinned: false,
          },
        ],
      },
      {
        id: 'sf3',
        name: 'Sales',
        videos: [
          {
            id: 'v3',
            title: 'Holiday Greeting',
            status: 'draft',
            updated: '5d ago',
            duration: '01:50',
            pinned: false,
          },
        ],
      },
      {
        id: 'sf4',
        name: 'Product',
        videos: [
          {
            id: 'v5',
            title: 'Product Walkthrough',
            status: 'published',
            updated: '2d ago',
            duration: '03:12',
            pinned: true,
          },
        ],
      },
    ],
  },
]

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

function Workspace() {
  const [folders, setFolders] = useState(initialFolders)
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [selectedSubfolder, setSelectedSubfolder] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [cardMenu, setCardMenu] = useState(null)
  const [renameDialog, setRenameDialog] = useState(null)
  const [renameType, setRenameType] = useState(null) // 'folder', 'subfolder', or 'video'
  const [newName, setNewName] = useState('')
  const [lastUpdatedOpen, setLastUpdatedOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedLastUpdated, setSelectedLastUpdated] = useState(lastUpdatedOptions[0])
  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0])
  const menuRefs = useRef({})
  const lastUpdatedRef = useRef(null)
  const filtersRef = useRef(null)

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

  const createNewFolder = () => {
    const newFolder = {
      id: `f${Date.now()}`,
      name: 'New Folder',
      updated: 'Just now',
      subfolders: [],
    }
    setFolders([...folders, newFolder])
    setRenameDialog(newFolder.id)
    setRenameType('folder')
    setNewName('New Folder')
  }

  const renameFolder = (folderId, newName) => {
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === folderId ? { ...folder, name: newName } : folder
      )
    )
    setRenameDialog(null)
    setRenameType(null)
    setNewName('')
    setCardMenu(null)
  }

  const renameSubfolder = (folderId, subfolderId, newName) => {
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === folderId
          ? {
              ...folder,
              subfolders: folder.subfolders.map((sf) =>
                sf.id === subfolderId ? { ...sf, name: newName } : sf
              )
            }
          : folder
      )
    )
    setRenameDialog(null)
    setRenameType(null)
    setNewName('')
    setCardMenu(null)
  }

  const renameVideo = (folderId, subfolderId, videoId, newTitle) => {
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === folderId
          ? {
              ...folder,
              subfolders: folder.subfolders.map((sf) =>
                sf.id === subfolderId
                  ? {
                      ...sf,
                      videos: sf.videos.map((v) =>
                        v.id === videoId ? { ...v, title: newTitle } : v
                      )
                    }
                  : sf
              )
            }
          : folder
      )
    )
    setRenameDialog(null)
    setRenameType(null)
    setNewName('')
    setCardMenu(null)
  }

  const deleteFolder = (folderId) => {
    if (window.confirm('Are you sure you want to delete this folder?')) {
      setFolders((prev) => prev.filter((f) => f.id !== folderId))
      setCardMenu(null)
      if (selectedFolder === folderId) {
        setSelectedFolder(null)
      }
    }
  }

  const deleteSubfolder = (folderId, subfolderId) => {
    if (window.confirm('Are you sure you want to delete this subfolder?')) {
      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === folderId
            ? {
                ...folder,
                subfolders: folder.subfolders.filter((sf) => sf.id !== subfolderId)
              }
            : folder
        )
      )
      setCardMenu(null)
      if (selectedSubfolder === subfolderId) {
        setSelectedSubfolder(null)
      }
    }
  }

  const deleteVideo = (folderId, subfolderId, videoId) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === folderId
            ? {
                ...folder,
                subfolders: folder.subfolders.map((sf) =>
                  sf.id === subfolderId
                    ? {
                        ...sf,
                        videos: sf.videos.filter((v) => v.id !== videoId)
                      }
                    : sf
                )
              }
            : folder
        )
      )
      setCardMenu(null)
    }
  }

  const currentFolder = folders.find(f => f.id === selectedFolder)
  const currentSubfolder = currentFolder?.subfolders?.find(sf => sf.id === selectedSubfolder)

  // Render videos view (inside subfolder)
  if (selectedFolder && selectedSubfolder && currentSubfolder) {
    return (
      <>
        <style>{styles}</style>
        <div className="workspace-container">
          <button
            className="back-button"
            onClick={() => setSelectedSubfolder(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#334155',
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
              {currentSubfolder.videos.map((video) => (
                <div
                  key={video.id}
                  className={`video-card ${viewMode === 'list' ? 'list-view' : ''}`}
                  ref={el => menuRefs.current[`video-${video.id}`] = el}
                >
                  <div className="video-thumb">
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94a3b8',
                      fontSize: '32px'
                    }}>
                      <MdPlayArrow />
                    </div>
                    <div className="video-thumb-overlay">
                      <div className={`video-badge ${video.status}`}>
                        {video.status === 'draft' ? 'DRAFT' : 'PUBLISHED'}
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
                            onClick={(e) => {
                              e.stopPropagation()
                              setRenameDialog({ folderId: selectedFolder, subfolderId: selectedSubfolder, videoId: video.id })
                              setRenameType('video')
                              setNewName(video.title)
                              setCardMenu(null)
                            }}
                          >
                            <MdEdit className="video-menu-icon" />
                            Rename
                          </button>
                          <button
                            className="video-menu-item delete"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteVideo(selectedFolder, selectedSubfolder, video.id)
                            }}
                          >
                            <MdDelete className="video-menu-icon" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                    {video.duration && (
                      <div className="video-duration">
                        {video.duration}
                      </div>
                    )}
                  </div>
                  <div className="video-info">
                    <h4 className="video-title">{video.title}</h4>
                    <p className="video-meta">Updated {video.updated}</p>
                  </div>
                </div>
              ))}
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
        <style>{styles}</style>
        <div className="workspace-container">
          <button
            className="back-button"
            onClick={() => setSelectedFolder(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#334155',
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
                      <p className="folder-meta" style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>
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
      <style>{styles}</style>
      <div className="workspace-container">
        <div className="workspace-header">
          <div className="workspace-title-section">
            <h1 className="workspace-title">Workspace</h1>
            <button className="new-folder-btn" onClick={createNewFolder}>
              <MdFolder size={18} />
              New folder
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
                      <p className="folder-meta" style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>
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

