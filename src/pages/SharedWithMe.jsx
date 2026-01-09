import { useState, useRef, useEffect } from 'react'
import {
  MdGridView,
  MdViewList,
  MdKeyboardArrowDown,
  MdPerson,
  MdMoreVert,
  MdDownload,
  MdDelete,
  MdShare,
  MdAccessTime,
} from 'react-icons/md'

const styles = `
.shared-container {
  padding: 32px 40px;
  height: 100%;
  overflow-y: auto;
  max-width: 1400px;
  margin: 0 auto;
}

.shared-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.shared-title {
  font-size: 28px;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  letter-spacing: -0.01em;
}

.shared-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sort-dropdown {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.sort-dropdown:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.sort-dropdown-icon {
  color: #94a3b8;
  font-size: 18px;
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

.shared-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.shared-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shared-item {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
}

.shared-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.shared-item.list-view {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 16px;
}

.item-preview {
  width: 100%;
  height: 140px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.shared-item.list-view .item-preview {
  width: 120px;
  height: 80px;
  border-radius: 8px;
}

.item-preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-preview-icon {
  font-size: 40px;
  color: #94a3b8;
}

.item-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

.item-menu-btn {
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
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  font-size: 18px;
}

.item-menu-btn:hover {
  background: #ffffff;
  transform: scale(1.08);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.item-info {
  padding: 14px;
  flex: 1;
}

.shared-item.list-view .item-info {
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
}

.item-details {
  flex: 1;
}

.item-name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.shared-item.list-view .item-name {
  font-size: 15px;
  margin-bottom: 6px;
}

.item-meta {
  font-size: 11px;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 8px;
}

.shared-item.list-view .item-meta {
  font-size: 13px;
}

.item-shared-by {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
}

.shared-item.list-view .item-shared-by {
  margin-top: 0;
  margin-left: 16px;
}

.shared-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.shared-by-name {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.shared-item.list-view .shared-by-name {
  font-size: 13px;
}

.item-menu {
  position: absolute;
  top: 40px;
  right: 8px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  min-width: 160px;
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

.item-menu-option {
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
  font-weight: 600;
  color: #334155;
}

.item-menu-option:hover {
  background: #f8fafc;
}

.item-menu-option.delete {
  color: #ef4444;
}

.item-menu-option.delete:hover {
  background: #fef2f2;
}

.item-menu-icon {
  font-size: 18px;
  color: #64748b;
  flex-shrink: 0;
}

.item-menu-option.delete .item-menu-icon {
  color: #ef4444;
}

.empty-state {
  text-align: center;
  padding: 80px 40px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 12px;
  border: 1.5px dashed #cbd5e1;
}

.empty-state-icon {
  font-size: 64px;
  color: #cbd5e1;
  margin-bottom: 20px;
}

.empty-state-title {
  font-size: 20px;
  font-weight: 600;
  color: #334155;
  margin: 0 0 8px;
}

.empty-state-text {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}
`

function SharedWithMe() {
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('last-updated')
  const [openMenuId, setOpenMenuId] = useState(null)
  const menuRefs = useRef({})

  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(menuRefs.current).forEach((itemId) => {
        if (menuRefs.current[itemId] && !menuRefs.current[itemId].contains(event.target)) {
          setOpenMenuId(null)
        }
      })
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const sharedItems = [
    {
      id: 1,
      name: 'Project Presentation.pptx',
      type: 'presentation',
      size: '12.5 MB',
      sharedBy: 'John Doe',
      lastUpdated: '2 hours ago',
      url: null
    },
    {
      id: 2,
      name: 'Team Video.mp4',
      type: 'video',
      size: '45.2 MB',
      sharedBy: 'Sarah Smith',
      lastUpdated: '1 day ago',
      url: null
    },
    {
      id: 3,
      name: 'Brand Guidelines.pdf',
      type: 'document',
      size: '8.3 MB',
      sharedBy: 'Mike Johnson',
      lastUpdated: '3 days ago',
      url: null
    },
    {
      id: 4,
      name: 'Logo Assets.zip',
      type: 'archive',
      size: '15.7 MB',
      sharedBy: 'Emily Chen',
      lastUpdated: '1 week ago',
      url: null
    },
    {
      id: 5,
      name: 'Meeting Notes.docx',
      type: 'document',
      size: '2.1 MB',
      sharedBy: 'David Wilson',
      lastUpdated: '2 weeks ago',
      url: null
    },
  ]

  const getPreviewIcon = (type) => {
    switch (type) {
      case 'video':
        return <MdAccessTime className="item-preview-icon" />
      case 'document':
        return <MdPerson className="item-preview-icon" />
      case 'presentation':
        return <MdPerson className="item-preview-icon" />
      default:
        return <MdPerson className="item-preview-icon" />
    }
  }

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const toggleMenu = (e, itemId) => {
    e.stopPropagation()
    setOpenMenuId(openMenuId === itemId ? null : itemId)
  }

  const handleDownload = (e, item) => {
    e.stopPropagation()
    setOpenMenuId(null)
    alert(`Downloading ${item.name}...`)
  }

  const handleDelete = (e, item) => {
    e.stopPropagation()
    setOpenMenuId(null)
    if (window.confirm(`Remove "${item.name}" from shared items?`)) {
      // Handle removal
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="shared-container">
        <div className="shared-header">
          <h1 className="shared-title">Shared with me</h1>
          <div className="shared-controls">
            <div className="sort-dropdown">
              <span>Last updated</span>
              <MdKeyboardArrowDown className="sort-dropdown-icon" />
            </div>
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
          </div>
        </div>

        {sharedItems.length === 0 ? (
          <div className="empty-state">
            <MdPerson className="empty-state-icon" />
            <h3 className="empty-state-title">No shared items yet</h3>
            <p className="empty-state-text">Files and folders shared with you will appear here</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'shared-grid' : 'shared-list'}>
            {sharedItems.map((item) => (
              <div
                key={item.id}
                className={`shared-item ${viewMode === 'list' ? 'list-view' : ''}`}
                ref={el => menuRefs.current[item.id] = el}
              >
                <div className="item-preview">
                  {item.url && item.type === 'image' ? (
                    <img src={item.url} alt={item.name} className="item-preview-image" />
                  ) : (
                    getPreviewIcon(item.type)
                  )}
                  <div className="item-actions">
                    <button
                      className="item-menu-btn"
                      onClick={(e) => toggleMenu(e, item.id)}
                    >
                      <MdMoreVert />
                    </button>
                    {openMenuId === item.id && (
                      <div className="item-menu">
                        <button
                          className="item-menu-option"
                          onClick={(e) => handleDownload(e, item)}
                        >
                          <MdDownload className="item-menu-icon" />
                          Download
                        </button>
                        <button
                          className="item-menu-option"
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenMenuId(null)
                            alert(`Sharing ${item.name}...`)
                          }}
                        >
                          <MdShare className="item-menu-icon" />
                          Share
                        </button>
                        <button
                          className="item-menu-option delete"
                          onClick={(e) => handleDelete(e, item)}
                        >
                          <MdDelete className="item-menu-icon" />
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="item-info">
                  <div className="item-details">
                    <h4 className="item-name">{item.name}</h4>
                    <p className="item-meta">
                      {item.size} • {item.lastUpdated}
                    </p>
                  </div>
                  <div className="item-shared-by">
                    <div className="shared-avatar">
                      {getInitials(item.sharedBy)}
                    </div>
                    <span className="shared-by-name">{item.sharedBy}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default SharedWithMe

