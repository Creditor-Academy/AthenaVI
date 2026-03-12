import { useState, useRef } from 'react'
import {
  MdSearch,
  MdCloudUpload,
  MdSettings,
  MdFolder,
  MdAccessTime,
  MdStar,
  MdDelete,
  MdImage,
  MdPlayCircleFilled,
  MdMusicNote,
  MdGridView,
  MdViewList,
  MdAdd,
  MdPerson,
  MdClose
} from 'react-icons/md'
import './Library.css'

function Library() {
  const [activeView, setActiveView] = useState('grid')
  const [activeTab, setActiveTab] = useState('images')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const fileInputRef = useRef(null)
  const [uploadType, setUploadType] = useState('images')

  const folders = [
    { id: 'all', label: 'Media Library', icon: <MdFolder /> },
    { id: 'recent', label: 'Recently Added', icon: <MdAccessTime /> },
    { id: 'starred', label: 'Starred Assets', icon: <MdStar /> },
    { id: 'trash', label: 'Trash', icon: <MdDelete /> },
  ]

  const tabs = [
    { id: 'images', label: 'Images' },
    { id: 'videos', label: 'Videos' },
    { id: 'music', label: 'Music' },
  ]

  const [assets, setAssets] = useState({
    images: [
      { id: 1, name: 'instructor_profile_01.png', size: '2.4 MB', type: 'PNG', thumb: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200' },
      { id: 2, name: 'modern_office_backdrop.jpg', size: '1.8 MB', type: 'JPG', thumb: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=200' },
      { id: 3, name: 'product_demo_04.jpg', size: '3.1 MB', type: 'JPG', thumb: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200' },
    ],
    videos: [
      { id: 4, name: 'intro_animation_hq.mp4', size: '12.4 MB', type: 'MP4', thumb: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=200' },
    ],
    music: [
      { id: 5, name: 'uplifting_background.mp3', size: '4.1 MB', type: 'MP3', icon: <MdMusicNote /> },
    ]
  })

  const storageUsed = 0.82 // GB
  const storageLimit = 2.0

  return (
    <div className="library-page">
      <aside className="library-sidebar">
        <div className="sidebar-label" style={{ paddingLeft: '16px', marginBottom: '16px' }}>Storage</div>
        <div className="library-nav-group">
          {folders.map(folder => (
            <div key={folder.id} className={`library-nav-item ${folder.id === 'all' ? 'active' : ''}`}>
              {folder.icon} {folder.label}
            </div>
          ))}
        </div>

        <div className="storage-info">
          <div className="storage-label">
            <span>Storage Used</span>
            <span>{Math.round((storageUsed / storageLimit) * 100)}%</span>
          </div>
          <div className="storage-bar">
            <div className="storage-progress" style={{ width: `${(storageUsed / storageLimit) * 100}%` }}></div>
          </div>
          <div className="storage-text">{storageUsed} GB of {storageLimit} GB used</div>
        </div>
      </aside>

      <div className="library-main">
        <div className="library-filters-bar">
          <div className="filters-top-row">
            <div className="asset-type-tabs">
              {tabs.map(tab => (
                <div 
                  key={tab.id} 
                  className={`type-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </div>
              ))}
            </div>
            
            <div className="filters-right-actions">
              <button className="btn-upload-primary" onClick={() => setShowUploadModal(true)}>
                <MdCloudUpload /> Upload
              </button>
              <div className="view-toggles">
                <button 
                  className={`toggle-btn ${activeView === 'grid' ? 'active' : ''}`}
                  onClick={() => setActiveView('grid')}
                >
                  <MdGridView />
                </button>
                <button 
                  className={`toggle-btn ${activeView === 'list' ? 'active' : ''}`}
                  onClick={() => setActiveView('list')}
                >
                  <MdViewList />
                </button>
              </div>
            </div>
          </div>
        </div>
        <input 
          type="file" 
          style={{ display: 'none' }} 
          ref={fileInputRef} 
          multiple 
          accept={uploadType === 'images' ? 'image/*' : uploadType === 'videos' ? 'video/*' : 'audio/*'} 
        />

        <div className="assets-scroller">
          <div className={activeView === 'grid' ? 'assets-grid' : 'assets-list'}>
            {assets[activeTab].map(asset => (
              <div key={asset.id} className={`asset-card ${activeView}`}>
                <div className="asset-preview">
                  {asset.thumb ? (
                    <img src={asset.thumb} alt={asset.name} />
                  ) : (
                    <div className="asset-preview-icon">{asset.icon}</div>
                  )}
                </div>
                <div className="asset-details">
                  <div className="asset-name">{asset.name}</div>
                  <div className="asset-meta">
                    <span>{asset.size}</span>
                    <span>{asset.type}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {activeView === 'grid' && (
              <div className="upload-placeholder" onClick={() => setShowUploadModal(true)}>
                <MdCloudUpload className="upload-placeholder-icon" />
                <div className="upload-placeholder-text">Drop files here</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showUploadModal && (
        <div className="upload-modal-overlay">
          <div className="upload-modal">
            <div className="upload-modal-header">
              <h3>Select Upload Type</h3>
              <button className="close-modal" onClick={() => setShowUploadModal(false)}><MdClose /></button>
            </div>
            <div className="upload-options">
              <div className="upload-option" onClick={() => { setUploadType('images'); fileInputRef.current.click(); setShowUploadModal(false); }}>
                <div className="option-icon image"><MdImage /></div>
                <span>Images</span>
              </div>
              <div className="upload-option" onClick={() => { setUploadType('videos'); fileInputRef.current.click(); setShowUploadModal(false); }}>
                <div className="option-icon video"><MdPlayCircleFilled /></div>
                <span>Videos</span>
              </div>
              <div className="upload-option" onClick={() => { setUploadType('music'); fileInputRef.current.click(); setShowUploadModal(false); }}>
                <div className="option-icon music"><MdMusicNote /></div>
                <span>Music</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Library
