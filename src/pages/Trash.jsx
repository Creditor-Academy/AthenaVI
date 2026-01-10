import { useState, useMemo, useEffect, useRef } from 'react'
import {
  MdInfo,
  MdFolder,
  MdPlayCircleFilled,
  MdMoreVert,
  MdRestore,
  MdDeleteForever,
  MdGridOn,
  MdViewList,
  MdArrowBack,
} from 'react-icons/md'

const thumbnailUrl =
  'https://media.istockphoto.com/id/1480023591/video/creating-a-female-video-game-character.jpg?s=640x640&k=20&c=S1LW6oZZDQYgsqp4GRL0bj9wE1oRIaBfQSV-UQXv2II='

function Trash() {
  const [activeTab, setActiveTab] = useState('videos')
  const [viewMode, setViewMode] = useState('grid')
  const [cardMenu, setCardMenu] = useState(null)
  const [selectedFolder, setSelectedFolder] = useState(null)
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

  const trashFolders = useMemo(
    () => [
      {
        id: 'f1',
        name: 'Recruitment, Staffing & Training',
        deletedDate: '5 days ago',
        videosCount: 12,
        videos: [
          { id: 'v1-1', title: 'HR Introduction Video', deletedDate: '5 days ago', duration: '02:15', thumbnail: thumbnailUrl },
          { id: 'v1-2', title: 'Training Module 1', deletedDate: '5 days ago', duration: '05:30', thumbnail: thumbnailUrl },
          { id: 'v1-3', title: 'Staff Onboarding', deletedDate: '5 days ago', duration: '03:45', thumbnail: thumbnailUrl },
          { id: 'v1-4', title: 'Recruitment Process', deletedDate: '5 days ago', duration: '04:20', thumbnail: thumbnailUrl },
        ],
      },
      {
        id: 'f2',
        name: 'Marketing Campaigns',
        deletedDate: '1 week ago',
        videosCount: 8,
        videos: [
          { id: 'v2-1', title: 'Summer Campaign 2024', deletedDate: '1 week ago', duration: '01:30', thumbnail: thumbnailUrl },
          { id: 'v2-2', title: 'Product Launch Video', deletedDate: '1 week ago', duration: '02:00', thumbnail: thumbnailUrl },
          { id: 'v2-3', title: 'Brand Awareness Ad', deletedDate: '1 week ago', duration: '00:45', thumbnail: thumbnailUrl },
        ],
      },
      {
        id: 'f3',
        name: 'Product Demos',
        deletedDate: '2 weeks ago',
        videosCount: 15,
        videos: [
          { id: 'v3-1', title: 'Product Overview', deletedDate: '2 weeks ago', duration: '03:20', thumbnail: thumbnailUrl },
          { id: 'v3-2', title: 'Feature Walkthrough', deletedDate: '2 weeks ago', duration: '04:15', thumbnail: thumbnailUrl },
          { id: 'v3-3', title: 'Demo Video 1', deletedDate: '2 weeks ago', duration: '02:45', thumbnail: thumbnailUrl },
        ],
      },
      {
        id: 'f4',
        name: 'Client Testimonials',
        deletedDate: '3 weeks ago',
        videosCount: 6,
        videos: [
          { id: 'v4-1', title: 'Customer Success Story', deletedDate: '3 weeks ago', duration: '02:30', thumbnail: thumbnailUrl },
          { id: 'v4-2', title: 'Client Review Video', deletedDate: '3 weeks ago', duration: '01:45', thumbnail: thumbnailUrl },
        ],
      },
      {
        id: 'f5',
        name: 'Training Materials',
        deletedDate: '1 month ago',
        videosCount: 24,
        videos: [
          { id: 'v5-1', title: 'Training Course 1', deletedDate: '1 month ago', duration: '10:00', thumbnail: thumbnailUrl },
          { id: 'v5-2', title: 'Training Course 2', deletedDate: '1 month ago', duration: '08:30', thumbnail: thumbnailUrl },
          { id: 'v5-3', title: 'Tutorial Series', deletedDate: '1 month ago', duration: '15:20', thumbnail: thumbnailUrl },
        ],
      },
      {
        id: 'f6',
        name: 'Social Media Content',
        deletedDate: '1 month ago',
        videosCount: 18,
        videos: [
          { id: 'v6-1', title: 'Instagram Reel 1', deletedDate: '1 month ago', duration: '00:30', thumbnail: thumbnailUrl },
          { id: 'v6-2', title: 'TikTok Video', deletedDate: '1 month ago', duration: '00:15', thumbnail: thumbnailUrl },
          { id: 'v6-3', title: 'YouTube Short', deletedDate: '1 month ago', duration: '00:60', thumbnail: thumbnailUrl },
        ],
      },
    ],
    []
  )

  const trashVideos = useMemo(
    () => [
      {
        id: 'v1',
        title: 'Copy of Copy of lesson 15 s...',
        deletedDate: '2 days ago',
        duration: '00:07',
        thumbnail: thumbnailUrl,
      },
      {
        id: 'v2',
        title: 'Untitled',
        deletedDate: '3 days ago',
        duration: '—',
        thumbnail: thumbnailUrl,
      },
      {
        id: 'v3',
        title: 'Copy of Summary',
        deletedDate: '1 week ago',
        duration: '01:23',
        thumbnail: thumbnailUrl,
        hasText: 'Summary',
      },
      {
        id: 'v4',
        title: 'Copy of 1',
        deletedDate: '2 weeks ago',
        duration: '00:45',
        thumbnail: thumbnailUrl,
      },
      {
        id: 'v5',
        title: 'Deleted Project',
        deletedDate: '3 weeks ago',
        duration: '02:15',
        thumbnail: thumbnailUrl,
      },
      {
        id: 'v6',
        title: 'Old Tutorial',
        deletedDate: '1 month ago',
        duration: '00:30',
        thumbnail: thumbnailUrl,
      },
    ],
    []
  )

  const restoreItem = (type, id) => {
    // Implementation for restoring items
    alert(`Restoring ${type} with id: ${id}`)
    setCardMenu(null)
  }

  const permanentlyDelete = (type, id) => {
    // Implementation for permanent deletion
    if (window.confirm(`Are you sure you want to permanently delete this ${type}? This action cannot be undone.`)) {
      alert(`Permanently deleting ${type} with id: ${id}`)
    setCardMenu(null)
    }
  }

  const currentFolder = trashFolders.find(f => f.id === selectedFolder)

  return (
    <>
      <div className="trash-header">
        <h1 className="trash-title">Trash</h1>
        
        <div className="trash-tabs">
          <button
            className={`tab ${activeTab === 'videos' ? 'active' : ''}`}
            onClick={() => setActiveTab('videos')}
          >
            Videos
          </button>
          <button
            className={`tab ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            Templates
          </button>
        </div>

        <div className="view-controls">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <MdGridOn />
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <MdViewList />
          </button>
        </div>
      </div>

      <div className="info-banner">
        <MdInfo className="info-icon" />
        <span>Items in Trash are permanently deleted after 30 days</span>
      </div>

      {activeTab === 'videos' && (
        <>
          {selectedFolder && currentFolder ? (
            <>
              <button 
                className="back-button"
                onClick={() => setSelectedFolder(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  marginBottom: '24px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <MdArrowBack size={18} />
                Back to folders
              </button>
              
              <div className="trash-section">
                <h2 className="section-title">{currentFolder.name}</h2>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
                  {currentFolder.videos.length} {currentFolder.videos.length === 1 ? 'video' : 'videos'} • Deleted {currentFolder.deletedDate}
                </p>
                <div className="video-list">
                  {currentFolder.videos.map((video) => (
                    <div className="video-list-item" key={video.id}>
                      <div className="video-list-info">
                        <h3 className="video-list-title">{video.title}</h3>
                        <p className="video-list-meta">Deleted {video.deletedDate}</p>
                      </div>
                      <div className="video-list-actions">
                        <button
                          className="action-btn restore-btn"
                          onClick={() => restoreItem('video', video.id)}
                        >
                          <MdRestore size={18} />
                          Restore
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => permanentlyDelete('video', video.id)}
                        >
                          <MdDeleteForever size={18} />
                          Delete forever
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
        <>
          {trashFolders.length > 0 && (
            <div className="trash-section">
              <h2 className="section-title">Folders</h2>
              <div className="folders-grid">
                {trashFolders.map((folder) => (
                      <div 
                        className="folder-card" 
                        key={folder.id}
                        onClick={() => setSelectedFolder(folder.id)}
                        style={{ cursor: 'pointer' }}
                      >
                    <button
                      className="dot-btn"
                      aria-label="Folder actions"
                          onClick={(e) => {
                            e.stopPropagation()
                            setCardMenu((m) => (m === `folder-${folder.id}` ? null : `folder-${folder.id}`))
                          }}
                    >
                      <MdMoreVert />
                    </button>
                    {cardMenu === `folder-${folder.id}` && (
                          <div className="card-menu" ref={menuRef} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => restoreItem('folder', folder.id)}
                        >
                          <MdRestore /> Restore
                        </button>
                        <button
                          onClick={() => permanentlyDelete('folder', folder.id)}
                          style={{ color: '#dc2626' }}
                        >
                          <MdDeleteForever /> Delete forever
                        </button>
                      </div>
                    )}
                    <div className="folder-icon">
                      <MdFolder />
                    </div>
                    <div className="folder-body">
                      <h3 className="folder-name">{folder.name}</h3>
                      <p className="folder-meta">{folder.videosCount} videos • Deleted {folder.deletedDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="trash-section">
            <h2 className="section-title">Videos</h2>
            <div className="video-grid">
              {trashVideos.map((video) => (
                <div className="video-card" key={video.id}>
                  <button
                    className="dot-btn"
                    aria-label="Video actions"
                    onClick={() => setCardMenu((m) => (m === `video-${video.id}` ? null : `video-${video.id}`))}
                  >
                    <MdMoreVert />
                  </button>
                  {cardMenu === `video-${video.id}` && (
                    <div className="card-menu" ref={menuRef}>
                      <button
                        onClick={() => restoreItem('video', video.id)}
                      >
                        <MdRestore /> Restore
                      </button>
                      <button
                        onClick={() => permanentlyDelete('video', video.id)}
                        style={{ color: '#dc2626' }}
                      >
                        <MdDeleteForever /> Delete forever
                      </button>
                    </div>
                  )}
                  <div className="thumb" style={{ backgroundImage: `url('${video.thumbnail}')` }}>
                    <div className="badge">DRAFT</div>
                    {video.hasText && (
                      <div className="thumb-text">{video.hasText}</div>
                    )}
                    {video.duration !== '—' && (
                      <div className="duration">{video.duration}</div>
                    )}
                  </div>
                  <div className="video-body">
                    <h3 className="video-title">{video.title}</h3>
                    <p className="video-meta">Deleted {video.deletedDate}</p>
                    <div className="video-footer">
                      <span className="label primary">
                        <MdPlayCircleFilled /> Preview
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
            </>
          )}
        </>
      )}

      {activeTab === 'templates' && (
        <div className="empty-state">
          <p>No templates in trash</p>
        </div>
      )}

      <style jsx>{`
        .trash-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .trash-title {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .trash-tabs {
          display: flex;
          gap: 8px;
        }

        .tab {
          padding: 8px 16px;
          border: none;
          background: transparent;
          color: #6b7280;
          font-weight: 500;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .tab.active {
          background: #f3f4f6;
          color: #1f2937;
          font-weight: 600;
        }

        .view-controls {
          display: flex;
          gap: 4px;
        }

        .view-btn {
          padding: 8px;
          border: none;
          background: transparent;
          color: #6b7280;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .view-btn.active {
          background: #f3f4f6;
          color: #1f2937;
        }

        .info-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: #dbeafe;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          margin-bottom: 32px;
          color: #1e40af;
          font-size: 14px;
        }

        .info-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .trash-section {
          margin-bottom: 40px;
        }

        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 20px;
        }

        .folders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
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
          background: linear-gradient(90deg, #ef4444, #f97316, #eab308);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .folder-card:hover::before {
          transform: scaleX(1);
        }

        .folder-card:hover {
          border-color: #ef4444;
          box-shadow: 
            0 8px 25px rgba(239, 68, 68, 0.15),
            0 4px 12px rgba(0, 0, 0, 0.08);
          transform: translateY(-4px);
        }

        .folder-icon {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
          color: #ef4444;
          position: relative;
        }

        .folder-icon svg {
          font-size: 48px;
          filter: drop-shadow(0 2px 4px rgba(239, 68, 68, 0.2));
          transition: all 0.3s ease;
        }

        .folder-card:hover .folder-icon svg {
          transform: scale(1.1);
          filter: drop-shadow(0 4px 8px rgba(239, 68, 68, 0.3));
        }

        .folder-body {
          text-align: center;
        }

        .folder-name {
          font-weight: 700;
          font-size: 16px;
          color: #374151;
          margin: 0 0 8px;
          line-height: 1.3;
          transition: color 0.2s ease;
        }

        .folder-card:hover .folder-name {
          color: #ef4444;
        }

        .folder-meta {
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
          margin: 0;
        }

        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }

        .video-card {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          position: relative;
          transition: all 0.2s ease;
        }

        .video-card:hover {
          border-color: #d1d5db;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .thumb {
          position: relative;
          height: 135px;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: #fef3c7;
          color: #92400e;
          border-radius: 6px;
          padding: 4px 8px;
          font-weight: 600;
          font-size: 11px;
        }

        .thumb-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
        }

        .duration {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .video-body {
          padding: 12px 16px;
        }

        .video-title {
          font-weight: 600;
          font-size: 14px;
          color: #374151;
          margin: 0 0 6px;
          line-height: 1.4;
        }

        .video-meta {
          color: #9ca3af;
          font-size: 12px;
          margin: 0 0 8px;
        }

        .video-footer {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .label {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }

        .label.primary {
          background: #e0e7ff;
          color: #3730a3;
        }

        .dot-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          border: none;
          background: rgba(0, 0, 0, 0.6);
          color: #ffffff;
          border-radius: 6px;
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          cursor: pointer;
          z-index: 4;
        }

        .card-menu {
          position: absolute;
          top: 40px;
          right: 8px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
          display: grid;
          min-width: 140px;
          overflow: hidden;
          z-index: 10;
        }

        .card-menu button {
          border: none;
          background: transparent;
          padding: 8px 12px;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          font-size: 14px;
        }

        .card-menu button:hover {
          background: #f9fafb;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #9ca3af;
          font-size: 16px;
        }

        .back-button:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          transform: translateX(-2px);
        }

        .video-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .video-list-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .video-list-item:hover {
          border-color: #d1d5db;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .video-list-info {
          flex: 1;
        }

        .video-list-title {
          font-size: 15px;
          font-weight: 600;
          color: #374151;
          margin: 0 0 4px;
        }

        .video-list-meta {
          font-size: 13px;
          color: #6b7280;
          margin: 0;
        }

        .video-list-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #ffffff;
        }

        .restore-btn {
          color: #3b82f6;
          border-color: #bfdbfe;
        }

        .restore-btn:hover {
          background: #eff6ff;
          border-color: #93c5fd;
          color: #2563eb;
        }

        .delete-btn {
          color: #dc2626;
          border-color: #fecaca;
        }

        .delete-btn:hover {
          background: #fef2f2;
          border-color: #fca5a5;
          color: #b91c1c;
        }

        @media (max-width: 768px) {
          .video-list-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .video-list-actions {
            width: 100%;
            justify-content: flex-end;
          }

          .action-btn {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
    </>
  )
}

export default Trash
