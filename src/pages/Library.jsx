import { useState, useRef, useEffect } from 'react'
import {
  MdImage,
  MdMusicNote,
  MdTextFields,
  MdGridOn,
  MdCloudUpload,
  MdClose,
  MdMoreVert,
  MdDelete,
  MdDownload,
  MdPlayArrow,
  MdFilePresent,
} from 'react-icons/md'

const styles = `
.library-container {
  padding: 32px 40px;
  height: 100%;
  overflow-y: auto;
  max-width: 1400px;
  margin: 0 auto;
}

.library-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.library-title {
  font-size: 28px;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  letter-spacing: -0.01em;
}

.library-categories {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 48px;
}

.category-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.category-card:hover::before {
  transform: scaleX(1);
}

.category-card.active {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #e0ecff 0%, #f0f9ff 100%);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
}

.category-card.active::before {
  transform: scaleX(1);
}

.category-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #3b82f6;
  background: linear-gradient(135deg, #e0ecff 0%, #f0f9ff 100%);
  border-radius: 10px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.category-card:hover .category-icon,
.category-card.active .category-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.25);
}

.category-label {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.library-content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}

.content-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.breadcrumb-separator {
  color: #94a3b8;
  font-size: 16px;
  font-weight: 400;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.upload-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.library-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 18px;
}

.library-item {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
}

.library-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
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

.item-preview-video {
  position: absolute;
  bottom: 6px;
  right: 6px;
  background: rgba(0, 0, 0, 0.75);
  color: #ffffff;
  padding: 3px 7px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 3px;
  backdrop-filter: blur(4px);
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

.item-meta {
  font-size: 11px;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
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
  padding: 60px 40px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 12px;
  border: 1.5px dashed #cbd5e1;
}

.empty-state-icon {
  font-size: 56px;
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
  color: #64748b;
  margin: 0 0 20px;
  line-height: 1.5;
}

.file-input {
  display: none;
}
`

function Library() {
  const [selectedCategory, setSelectedCategory] = useState('media')
  const [openMenuId, setOpenMenuId] = useState(null)
  const fileInputRef = useRef(null)
  const menuRefs = useRef({})

  const [libraryItems, setLibraryItems] = useState({
    media: [
      { id: 1, name: 'equifax-logo.png', type: 'image', url: null, size: '2.4 MB', date: '2 days ago' },
      { id: 2, name: 'cityscape-video.mp4', type: 'video', url: null, size: '15.2 MB', date: '1 week ago', duration: '00:17' },
      { id: 3, name: 'office-photo.jpg', type: 'image', url: null, size: '1.8 MB', date: '3 days ago' },
    ],
    music: [
      { id: 4, name: 'background-music.mp3', type: 'audio', url: null, size: '4.2 MB', date: '5 days ago' },
      { id: 5, name: 'intro-sound.wav', type: 'audio', url: null, size: '2.1 MB', date: '1 week ago' },
    ],
    fonts: [
      { id: 6, name: 'Roboto-Bold.ttf', type: 'font', url: null, size: '156 KB', date: '2 weeks ago' },
      { id: 7, name: 'Inter-Regular.otf', type: 'font', url: null, size: '189 KB', date: '1 week ago' },
    ],
    templates: [
      { id: 8, name: 'presentation-template.pptx', type: 'template', url: null, size: '8.5 MB', date: '3 days ago' },
      { id: 9, name: 'video-template.json', type: 'template', url: null, size: '124 KB', date: '1 week ago' },
    ]
  })

  const categories = [
    { id: 'media', label: 'Media', icon: <MdImage /> },
    { id: 'music', label: 'Music', icon: <MdMusicNote /> },
    { id: 'fonts', label: 'Fonts', icon: <MdTextFields /> },
    { id: 'templates', label: 'Templates', icon: <MdGridOn /> },
  ]

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    const newItems = files.map((file, index) => {
      const category = getCategoryFromFile(file)
      return {
        id: Date.now() + index,
        name: file.name,
        type: getFileType(file),
        url: URL.createObjectURL(file),
        size: formatFileSize(file.size),
        date: 'Just now',
        duration: file.type.startsWith('video/') ? '00:00' : null
      }
    })

    files.forEach((file, index) => {
      const category = getCategoryFromFile(file)
      setLibraryItems(prev => ({
        ...prev,
        [category]: [...(prev[category] || []), newItems[index]]
      }))
    })
  }

  const getCategoryFromFile = (file) => {
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) return 'media'
    if (file.type.startsWith('audio/')) return 'music'
    if (file.name.endsWith('.ttf') || file.name.endsWith('.otf') || file.name.endsWith('.woff')) return 'fonts'
    return 'templates'
  }

  const getFileType = (file) => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('video/')) return 'video'
    if (file.type.startsWith('audio/')) return 'audio'
    if (file.name.endsWith('.ttf') || file.name.endsWith('.otf') || file.name.endsWith('.woff')) return 'font'
    return 'template'
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const toggleMenu = (e, itemId) => {
    e.stopPropagation()
    setOpenMenuId(openMenuId === itemId ? null : itemId)
  }

  const handleDelete = (e, item) => {
    e.stopPropagation()
    setOpenMenuId(null)
    if (window.confirm(`Delete "${item.name}"?`)) {
      setLibraryItems(prev => ({
        ...prev,
        [selectedCategory]: prev[selectedCategory].filter(i => i.id !== item.id)
      }))
    }
  }

  const handleDownload = (e, item) => {
    e.stopPropagation()
    setOpenMenuId(null)
    if (item.url) {
      const link = document.createElement('a')
      link.href = item.url
      link.download = item.name
      link.click()
    } else {
      alert('File download coming soon!')
    }
  }

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

  const getPreviewIcon = (type) => {
    switch (type) {
      case 'image':
        return <MdImage className="item-preview-icon" />
      case 'video':
        return <MdPlayArrow className="item-preview-icon" />
      case 'audio':
        return <MdMusicNote className="item-preview-icon" />
      case 'font':
        return <MdTextFields className="item-preview-icon" />
      default:
        return <MdFilePresent className="item-preview-icon" />
    }
  }

  const currentItems = libraryItems[selectedCategory] || []

  return (
    <>
      <style>{styles}</style>
      <div className="library-container">
        <div className="library-header">
          <h1 className="library-title">Library</h1>
        </div>

        <div className="library-categories">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`category-card ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <div className="category-icon">
                {category.icon}
              </div>
              <h3 className="category-label">{category.label}</h3>
            </div>
          ))}
        </div>

        <div className="library-content-header">
          <div className="content-title">
            <span>Library</span>
            <span className="breadcrumb-separator">›</span>
            <span>{categories.find(c => c.id === selectedCategory)?.label}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="file-input"
              onChange={handleFileUpload}
              accept={
                selectedCategory === 'media' ? 'image/*,video/*' :
                selectedCategory === 'music' ? 'audio/*' :
                selectedCategory === 'fonts' ? '.ttf,.otf,.woff,.woff2' :
                '*/*'
              }
            />
            <button
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <MdCloudUpload size={20} />
              Upload file
            </button>
          </div>
        </div>

        {currentItems.length === 0 ? (
          <div className="empty-state">
            <MdCloudUpload className="empty-state-icon" />
            <h3 className="empty-state-title">No {categories.find(c => c.id === selectedCategory)?.label.toLowerCase()} yet</h3>
            <p className="empty-state-text">Upload your first file to get started</p>
            <button
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <MdCloudUpload size={20} />
              Upload file
            </button>
          </div>
        ) : (
          <div className="library-grid">
            {currentItems.map((item) => (
              <div
                key={item.id}
                className="library-item"
                ref={el => menuRefs.current[item.id] = el}
              >
                <div className="item-preview">
                  {item.url && item.type === 'image' ? (
                    <img src={item.url} alt={item.name} className="item-preview-image" />
                  ) : (
                    getPreviewIcon(item.type)
                  )}
                  {item.type === 'video' && (
                    <div className="item-preview-video">
                      <MdPlayArrow size={12} />
                      {item.duration || '00:00'}
                    </div>
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
                          className="item-menu-option delete"
                          onClick={(e) => handleDelete(e, item)}
                        >
                          <MdDelete className="item-menu-icon" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="item-info">
                  <h4 className="item-name">{item.name}</h4>
                  <p className="item-meta">{item.size} • {item.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default Library

