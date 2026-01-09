import { useState, useRef, useEffect } from 'react'
import {
  MdMoreVert,
  MdEdit,
  MdDelete,
  MdPlayCircleFilled,
  MdAdd,
  MdArrowBack,
  MdClose,
  MdFolder,
  MdFolderOpen,
  MdPlayArrow,
  MdAccessTime,
  MdCheckCircle,
  MdGridView,
  MdViewList,
} from 'react-icons/md'

const styles = `
.videos-container {
  padding: 32px;
  height: 100%;
  overflow-y: auto;
  background: #f8fafc;
}

.videos-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.videos-title-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.videos-title {
  font-size: 32px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.02em;
}

.videos-subtitle {
  font-size: 15px;
  color: #64748b;
  margin: 0;
  font-weight: 400;
}

.videos-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.new-folder-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #3b82f6;
  border: none;
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
  padding: 11px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.3);
}

.new-folder-btn:hover {
  background: #2563eb;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

.view-toggle {
  display: flex;
  align-items: center;
  gap: 0;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 3px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.view-toggle-btn {
  width: 38px;
  height: 38px;
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

.view-toggle-btn:hover {
  background: #f8fafc;
  color: #334155;
}

.view-toggle-btn.active {
  background: #3b82f6;
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.folders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.folder-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.folder-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.folder-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.folder-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  font-size: 28px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

.folder-menu-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 18px;
}

.folder-menu-btn:hover {
  background: #f1f5f9;
  color: #334155;
}

.folder-info {
  flex: 1;
}

.folder-name {
  font-size: 17px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px;
  line-height: 1.4;
}

.folder-meta {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 16px;
  font-weight: 400;
}

.folder-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.preview-thumb {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: #f1f5f9;
  background-size: cover;
  background-position: center;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.more-count {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border: 2px solid #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.folder-menu {
  position: absolute;
  top: 50px;
  right: 12px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
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

.folder-menu-item {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background 0.15s ease;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  font-size: 14px;
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

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #334155;
  font-weight: 600;
  font-size: 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 24px;
  width: fit-content;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.back-button:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateX(-2px);
}

.folder-view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.folder-view-title {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px;
  letter-spacing: -0.02em;
}

.folder-view-meta {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.videos-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.video-card.list-view {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 20px;
  border-radius: 12px;
}

.video-card.list-view .video-thumb {
  width: 180px;
  height: 100px;
  flex-shrink: 0;
  border-radius: 8px;
}

.video-card.list-view .video-info {
  padding: 0;
  flex: 1;
}

.video-card.list-view .video-title {
  font-size: 15px;
  margin-bottom: 6px;
  -webkit-line-clamp: 1;
}

.video-card.list-view .video-meta {
  font-size: 13px;
}

.folders-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.folder-card.list-view {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
  padding: 20px;
}

.folder-card.list-view .folder-header {
  flex-direction: row;
  align-items: center;
  gap: 16px;
}

.folder-card.list-view .folder-icon-wrapper {
  width: 48px;
  height: 48px;
}

.folder-card.list-view .folder-info {
  flex: 1;
}

.folder-card.list-view .folder-preview {
  margin-top: 0;
  margin-left: auto;
}

.video-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.video-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.video-thumb {
  width: 100%;
  height: 140px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  position: relative;
  overflow: hidden;
}

.video-thumb-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-thumb-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 50%);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 10px;
}

.video-badge {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 10px;
  font-weight: 700;
  color: #334155;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.video-badge.draft {
  background: rgba(255, 243, 224, 0.95);
  color: #f59e0b;
}

.video-badge.published {
  background: rgba(220, 252, 231, 0.95);
  color: #16a34a;
}

.video-menu-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  color: #334155;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.video-menu-btn:hover {
  background: #ffffff;
  transform: scale(1.05);
}

.video-duration {
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  backdrop-filter: blur(10px);
}

.video-info {
  padding: 16px;
}

.video-title {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 6px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-meta {
  font-size: 12px;
  color: #64748b;
  margin: 0;
  font-weight: 400;
}

.video-menu {
  position: absolute;
  top: 50px;
  right: 10px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  min-width: 160px;
  overflow: hidden;
  z-index: 100;
  animation: slideDown 0.2s ease;
}

.video-menu-item {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background 0.15s ease;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  font-size: 14px;
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
  font-size: 18px;
  color: #64748b;
  flex-shrink: 0;
}

.video-menu-item.delete .video-menu-icon {
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
  backdrop-filter: blur(4px);
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
  border-radius: 16px;
  padding: 28px;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
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
  margin-bottom: 24px;
}

.rename-dialog-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.rename-dialog-close {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
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
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 15px;
  margin-bottom: 24px;
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s ease;
  font-weight: 500;
  color: #0f172a;
}

.rename-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.rename-dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-secondary {
  padding: 10px 20px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.btn-primary {
  padding: 10px 20px;
  border: none;
  background: #3b82f6;
  color: #ffffff;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
  background: #2563eb;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.empty-folder {
  text-align: center;
  padding: 80px 20px;
  color: #64748b;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.empty-folder-icon {
  font-size: 64px;
  color: #cbd5e1;
  margin-bottom: 20px;
}

.empty-folder-title {
  font-size: 20px;
  font-weight: 600;
  color: #334155;
  margin: 0 0 10px;
}

.empty-folder-text {
  font-size: 15px;
  margin: 0;
  color: #64748b;
}
`

const thumbnailUrl = 'https://media.istockphoto.com/id/1480023591/video/creating-a-female-video-game-character.jpg?s=640x640&k=20&c=S1LW6oZZDQYgsqp4GRL0bj9wE1oRIaBfQSV-UQXv2II='

const initialFolders = [
  {
    id: 'f1',
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
    id: 'f2',
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
    id: 'f3',
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
    id: 'f4',
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
]

function Videos() {
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [cardMenu, setCardMenu] = useState(null)
  const [renameDialog, setRenameDialog] = useState(null) // folderId or { folderId, videoId }
  const [renameType, setRenameType] = useState(null) // 'folder' or 'video'
  const [newName, setNewName] = useState('')
  const [folders, setFolders] = useState(initialFolders)
  const [viewMode, setViewMode] = useState('grid')
  const menuRefs = useRef({})

  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(menuRefs.current).forEach((itemId) => {
        if (menuRefs.current[itemId] && !menuRefs.current[itemId].contains(event.target)) {
          setCardMenu(null)
        }
      })
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  const renameVideo = (folderId, videoId, newTitle) => {
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === folderId
          ? {
              ...folder,
              videos: folder.videos.map((v) =>
                v.id === videoId ? { ...v, title: newTitle } : v
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

  const deleteVideo = (folderId, videoId) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === folderId
            ? { ...folder, videos: folder.videos.filter((v) => v.id !== videoId) }
            : folder
        )
      )
      setCardMenu(null)
    }
  }

  const createNewFolder = () => {
    const newFolder = {
      id: `f${Date.now()}`,
      name: 'New Folder',
      videos: []
    }
    setFolders([...folders, newFolder])
    setRenameDialog(newFolder.id)
    setRenameType('folder')
    setNewName('New Folder')
  }

  const currentFolder = folders.find(f => f.id === selectedFolder)

  if (selectedFolder && currentFolder) {
    return (
      <>
        <style>{styles}</style>
        <div className="videos-container">
          <button className="back-button" onClick={() => setSelectedFolder(null)}>
            <MdArrowBack size={18} />
            Back to folders
          </button>

          <div className="folder-view-header">
            <div>
              <h2 className="folder-view-title">{currentFolder.name}</h2>
              <p className="folder-view-meta">
                {currentFolder.videos.length} {currentFolder.videos.length === 1 ? 'video' : 'videos'}
              </p>
            </div>
            <div className="videos-actions">
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
              <button className="new-folder-btn">
                <MdAdd size={18} />
                New video
              </button>
            </div>
          </div>

          {currentFolder.videos.length === 0 ? (
            <div className="empty-folder">
              <MdFolderOpen className="empty-folder-icon" />
              <h3 className="empty-folder-title">No videos in this folder</h3>
              <p className="empty-folder-text">Create your first video to get started</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'videos-grid' : 'videos-list'}>
              {currentFolder.videos.map((video) => (
                <div className={`video-card ${viewMode === 'list' ? 'list-view' : ''}`} key={video.id} ref={el => menuRefs.current[`video-${video.id}`] = el}>
                  <div className="video-thumb">
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: '48px'
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
                              setRenameDialog({ folderId: currentFolder.id, videoId: video.id })
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
                              deleteVideo(currentFolder.id, video.id)
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

  return (
    <>
      <style>{styles}</style>
      <div className="videos-container">
        <div className="videos-header">
          <div className="videos-title-section">
            <h1 className="videos-title">Videos</h1>
            <p className="videos-subtitle">Organize your videos in folders</p>
          </div>
          <div className="videos-actions">
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
              <MdAdd size={18} />
              New folder
            </button>
          </div>
        </div>

        <div className={viewMode === 'grid' ? 'folders-grid' : 'folders-list'}>
          {folders.map((folder) => (
            <div
              key={folder.id}
              className={`folder-card ${viewMode === 'list' ? 'list-view' : ''}`}
              onClick={() => setSelectedFolder(folder.id)}
              ref={el => menuRefs.current[`folder-${folder.id}`] = el}
            >
              <div className="folder-header">
                <div className="folder-icon-wrapper">
                  <MdFolder size={28} />
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
              <div className="folder-info">
                <h3 className="folder-name">{folder.name}</h3>
                <p className="folder-meta">{folder.videos.length} {folder.videos.length === 1 ? 'video' : 'videos'}</p>
                {folder.videos.length > 0 && (
                  <div className="folder-preview">
                    {folder.videos.slice(0, 3).map((video, index) => (
                      <div
                        key={video.id}
                        className="preview-thumb"
                        style={{
                          backgroundImage: `url('${thumbnailUrl}')`,
                          marginLeft: index > 0 ? '-12px' : '0',
                          zIndex: 3 - index
                        }}
                      />
                    ))}
                    {folder.videos.length > 3 && (
                      <div className="more-count" style={{ marginLeft: '-12px' }}>
                        +{folder.videos.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
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
                {renameType === 'folder' ? 'Rename Folder' : 'Rename Video'}
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
                  } else if (renameType === 'video') {
                    renameVideo(renameDialog.folderId, renameDialog.videoId, newName.trim())
                  }
                } else if (e.key === 'Escape') {
                  setRenameDialog(null)
                  setRenameType(null)
                  setNewName('')
                }
              }}
              placeholder={renameType === 'folder' ? 'Enter folder name' : 'Enter video title'}
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
                    } else if (renameType === 'video') {
                      renameVideo(renameDialog.folderId, renameDialog.videoId, newName.trim())
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

export default Videos
