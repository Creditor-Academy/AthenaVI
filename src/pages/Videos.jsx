import { useMemo, useState, useEffect, useRef } from 'react'
import {
  MdMoreVert,
  MdEdit,
  MdDeleteOutline,
  MdPlayCircleFilled,
  MdAdd,
  MdArrowBack,
  MdClose,
} from 'react-icons/md'

const thumbnailUrl =
  'https://media.istockphoto.com/id/1480023591/video/creating-a-female-video-game-character.jpg?s=640x640&k=20&c=S1LW6oZZDQYgsqp4GRL0bj9wE1oRIaBfQSV-UQXv2II='

const initialFolders = [
  {
    id: 'f1',
    name: 'Marketing',
    emoticon: ':)',
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
        duration: '—',
        pinned: false,
      },
    ],
  },
  {
    id: 'f2',
    name: 'Internal',
    emoticon: 'B)',
    videos: [
      {
        id: 'v2',
        title: 'Untitled',
        status: 'draft',
        updated: 'yesterday',
        duration: '—',
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
    emoticon: ':D',
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
    emoticon: 'o_O',
    videos: [
      {
        id: 'v5',
        title: 'Product Walkthrough',
        status: 'draft',
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
  const [renameDialog, setRenameDialog] = useState(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [folders, setFolders] = useState(initialFolders)
  const menuRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setCardMenu(null)
      }
    }

    if (cardMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [cardMenu])

  const renameFolder = (folderId, newName) => {
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === folderId ? { ...folder, name: newName } : folder
      )
    )
    setRenameDialog(null)
    setNewFolderName('')
    setCardMenu(null)
  }

  const deleteFolder = (folderId) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId))
    setCardMenu(null)
  }

  const deleteVideo = (folderId, videoId) => {
    // Implementation for deleting video
    setCardMenu(null)
  }

  const currentFolder = folders.find(f => f.id === selectedFolder)

  if (selectedFolder && currentFolder) {
    return (
      <>
        <div className="section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="pill" 
              onClick={() => setSelectedFolder(null)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <MdArrowBack /> Back to folders
            </button>
            <div>
              <h2 className="section-title">{currentFolder.name}</h2>
              <p className="card-meta" style={{ marginTop: 4 }}>
                {currentFolder.videos.length} videos in this folder
              </p>
            </div>
          </div>
          <div className="section-actions">
            <button className="pill">
              <MdAdd /> New video
            </button>
          </div>
        </div>

        <div className="video-grid">
          {currentFolder.videos.map((video) => (
            <div className="video-card" key={video.id}>
              <button
                className="dot-btn"
                aria-label="Video actions"
                onClick={() => setCardMenu((m) => (m === video.id ? null : video.id))}
              >
                <MdMoreVert />
              </button>
              {cardMenu === video.id && (
                <div className="card-menu" ref={menuRef}>
                  <button
                    onClick={() => {
                      setCardMenu(null)
                      alert('Edit coming soon.')
                    }}
                  >
                    <MdEdit /> Edit
                  </button>
                  <button
                    onClick={() => deleteVideo(currentFolder.id, video.id)}
                  >
                    <MdDeleteOutline /> Delete
                  </button>
                </div>
              )}
              <div className="thumb" style={{ backgroundImage: `url('${thumbnailUrl}')` }}>
                <div className="badge">DRAFT</div>
              </div>
              <div className="video-body">
                <h3 className="video-title">{video.title}</h3>
                <p className="video-meta">Edited {video.updated}</p>
                <div className="video-footer">
                  <span className="label primary">
                    <MdPlayCircleFilled /> {video.duration === '—' ? 'Preview' : video.duration}
                  </span>
                  <span className="label">
                    {currentFolder.emoticon} {currentFolder.name}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <div className="section-header">
        <div>
          <h2 className="section-title">Videos</h2>
          <p className="card-meta" style={{ marginTop: 4 }}>
            Organize your videos in folders for better management.
          </p>
        </div>
        <div className="section-actions">
          <button className="pill">
            <MdAdd /> New folder
          </button>
        </div>
      </div>

      <div className="folders-grid">
        {folders.map((folder) => (
          <div 
            className="folder-card" 
            key={folder.id}
            onClick={() => setSelectedFolder(folder.id)}
          >
            <button
              className="dot-btn"
              aria-label="Folder actions"
              onClick={(e) => {
                e.stopPropagation()
                setCardMenu((m) => (m === folder.id ? null : folder.id))
              }}
            >
              <MdMoreVert />
            </button>
            {cardMenu === folder.id && (
              <div className="card-menu" ref={menuRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const currentFolder = folders.find(f => f.id === folder.id)
                    setRenameDialog(folder.id)
                    setNewFolderName(currentFolder.name)
                    setCardMenu(null)
                  }}
                >
                  <MdEdit /> Rename
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteFolder(folder.id)
                  }}
                >
                  <MdDeleteOutline /> Delete
                </button>
              </div>
            )}
            <div className="folder-icon">
              <span className="emoticon">{folder.emoticon}</span>
            </div>
            <div className="folder-body">
              <h3 className="folder-name">{folder.name}</h3>
              <p className="folder-meta">{folder.videos.length} videos</p>
              <div className="folder-preview">
                {folder.videos.slice(0, 3).map((video, index) => (
                  <div 
                    key={video.id}
                    className="preview-thumb"
                    style={{ 
                      backgroundImage: `url('${thumbnailUrl}')`,
                      left: `${index * 20}px`,
                      zIndex: 3 - index
                    }}
                  />
                ))}
                {folder.videos.length > 3 && (
                  <div className="more-count">
                    +{folder.videos.length - 3}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .folders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
          margin-top: 24px;
        }

        @media (max-width: 768px) {
          .folders-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 16px;
          }
        }

        @media (max-width: 480px) {
          .folders-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }

        .folder-card {
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 24px;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          box-shadow: 
            0 1px 3px rgba(0, 0, 0, 0.05),
            0 4px 12px rgba(0, 0, 0, 0.03);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .folder-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .folder-card:hover::before {
          transform: scaleX(1);
        }

        .folder-card:hover {
          border-color: #3b82f6;
          box-shadow: 
            0 8px 25px rgba(59, 130, 246, 0.15),
            0 4px 12px rgba(0, 0, 0, 0.08);
          transform: translateY(-4px);
        }

        .folder-icon {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
          position: relative;
        }

        .emoticon {
          font-size: 40px;
          font-weight: 400;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 2px 4px rgba(59, 130, 246, 0.2));
          transition: all 0.3s ease;
        }

        .folder-card:hover .emoticon {
          transform: scale(1.1);
          filter: drop-shadow(0 4px 8px rgba(59, 130, 246, 0.3));
        }

        .folder-body {
          text-align: center;
        }

        .folder-name {
          font-weight: 700;
          font-size: 18px;
          color: #1e293b;
          margin: 0 0 8px;
          line-height: 1.3;
          transition: color 0.2s ease;
        }

        .folder-card:hover .folder-name {
          color: #3b82f6;
        }

        .folder-meta {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
          margin: 0 0 20px;
        }

        .folder-preview {
          position: relative;
          height: 70px;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 16px;
        }

        .preview-thumb {
          position: absolute;
          width: 42px;
          height: 42px;
          border-radius: 8px;
          background-size: cover;
          background-position: center;
          border: 3px solid #ffffff;
          box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.1),
            0 1px 3px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        .folder-card:hover .preview-thumb {
          transform: scale(1.05);
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.15),
            0 2px 6px rgba(0, 0, 0, 0.1);
        }

        .more-count {
          position: absolute;
          width: 42px;
          height: 42px;
          border-radius: 8px;
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          border: 3px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: #475569;
          left: 63px;
          box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.1),
            0 1px 3px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        .folder-card:hover .more-count {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #ffffff;
          transform: scale(1.05);
        }
      `}</style>

      {/* Rename Dialog */}
      {renameDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            width: '400px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#374151' }}>
                Rename Folder
              </h3>
              <button
                onClick={() => {
                  setRenameDialog(null)
                  setNewFolderName('')
                }}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  color: '#6b7280'
                }}
              >
                <MdClose size={20} />
              </button>
            </div>
            
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter new folder name"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                marginBottom: '20px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              autoFocus
            />
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setRenameDialog(null)
                  setNewFolderName('')
                }}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e5e7eb',
                  background: '#ffffff',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#6b7280'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newFolderName.trim()) {
                    renameFolder(renameDialog, newFolderName.trim())
                  }
                }}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  background: '#2d6cf6',
                  color: '#ffffff',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
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
