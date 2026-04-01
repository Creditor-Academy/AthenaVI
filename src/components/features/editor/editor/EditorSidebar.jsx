import { useState } from 'react'
import {
  MdPerson,
  MdMic,
  MdPhotoLibrary,
  MdVideoLibrary,
  MdCloudUpload,
  MdFolder,
  MdClosedCaption,
  MdTextFields,
  MdAutoAwesome,
  MdShapeLine,
  MdLayers,
  MdClose,
  MdSearch,
  MdFormatAlignLeft,
  MdFormatAlignCenter,
  MdFormatAlignRight,
  MdLayersClear,
  MdChatBubbleOutline,
  MdOutlineImageSearch,
  MdAdd
} from 'react-icons/md'
import { predefinedAvatars, predefinedMedia, pageTemplates, predefinedVideos, predefinedAudios, predefinedShapes } from '../../../../constants/editorData'
import StaticPreview from './StaticPreview'
import avatar1 from '../../../../assets/avatar1.png'

const EditorSidebar = ({
  selectedTool,
  setSelectedTool,
  activeSceneId,
  addLayer,
  updateScene,
  activeScene,
  handleAddTemplateScene,
  setShowTemplateModal,
  showPanelOnly = false,
  scenes = [],
  autoCreateScene
}) => {
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const tools = [
    { id: 'avatar', icon: MdPerson, label: 'Avatar' },
    { id: 'mic', icon: MdMic, label: 'Voice' },
    { id: 'image', icon: MdPhotoLibrary, label: 'Images' },
    { id: 'video', icon: MdVideoLibrary, label: 'Videos' },
    { id: 'uploads', icon: MdCloudUpload, label: 'Uploads' },
    { id: 'text', icon: MdTextFields, label: 'Text' },
    { id: 'shapes', icon: MdShapeLine, label: 'Shapes' },
    { id: 'layers', icon: MdLayers, label: 'Layers' }
  ]

  const renderToolPanel = () => {
    if (!selectedTool) return null

    switch (selectedTool) {
      case 'avatar':
        return (
          <div className="tool-panel-content elements-ui">
            <div className="elements-search-container">
              <div className="elements-search-bar">
                <MdAdd className="search-plus" />
                <input type="text" placeholder="Search avatars..." />
                <MdMic className="search-mic" />
              </div>
            </div>

            <div className="elements-section">
              <h4 className="elements-section-title">Popular categories</h4>
              <div className="elements-chips-scroll">
                <button className="elements-chip">Realistic</button>
                <button className="elements-chip">Cartoon</button>
                <button className="elements-chip">3D Render</button>
                <button className="elements-chip">Business</button>
              </div>
            </div>

            <div className="elements-section">
              <h4 className="elements-section-title">AI Avatars</h4>
              <div className="elements-category-grid">
                {predefinedAvatars.map((avatar) => (
                  <div
                    key={avatar.id}
                    className={`elements-category-item ${activeScene?.avatarType === avatar.id ? 'active' : ''}`}
                    onClick={() => {
                        if (!activeSceneId || scenes.length === 0) {
                            // Auto-create scene, then update the avatar on it
                            if (autoCreateScene) {
                                const { newScene } = autoCreateScene();
                                updateScene(newScene.id, {
                                    avatar: avatar.image,
                                    avatarType: avatar.id
                                });
                            } else {
                                alert('Please add a scene or template first!');
                                if (setShowTemplateModal) setShowTemplateModal(true);
                            }
                            return;
                        }
                        updateScene(activeSceneId, {
                            avatar: avatar.image,
                            avatarType: avatar.id
                        });
                    }}
                  >
                    <div className="category-image-stack">
                        <img src={avatar.image} alt={avatar.name} />
                    </div>
                    <span>{avatar.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'image':
        return (
          <div className="tool-panel-content">
            <div className="search-box">
              <MdSearch className="search-icon" size={18} />
              <input type="text" placeholder="Search images..." className="search-input" />
            </div>
            <div className="media-grid">
              {predefinedMedia.map((media) => (
                <div
                  key={media.id}
                  className="media-item"
                  onClick={() => {
                      // addLayer now auto-creates a scene if needed
                      addLayer('image', media.full);
                  }}
                  title={`Add ${media.name}`}
                >
                  <img src={media.image} alt={media.name} />
                </div>
              ))}
            </div>
          </div>
        )

      case 'uploads':
        return (
          <div className="tool-panel-content">
            <div className="tool-section">
              <div
                className="premium-upload-zone"
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*,video/*,audio/*'
                  input.multiple = true
                  input.onchange = (e) => {
                    const files = Array.from(e.target.files)
                    files.forEach(file => {
                      const url = URL.createObjectURL(file)
                      addLayer(file.type.split('/')[0], url)
                    })
                  }
                  input.click()
                }}
              >
                <div className="upload-icon-circle">
                  <MdCloudUpload size={24} />
                </div>
                <div className="upload-text">
                  <h5>Upload Assets</h5>
                  <p>Support for Image, Video and Audio</p>
                </div>
              </div>
            </div>

            <div className="tool-section">
              <h4 className="tool-section-title">My Assets</h4>
              <div className="media-grid premium-scrollbar">
                {predefinedMedia.map((media) => (
                  <div
                    key={media.id}
                    className="media-item"
                    onClick={() => addLayer('image', media.full)}
                    title={`Add ${media.name}`}
                  >
                    <img src={media.image} alt={media.name} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'templates':
        return (
          <div className="tool-panel-content">
            <div className="media-grid">
              {pageTemplates.map(template => (
                <div
                  key={template.id}
                  className="media-item"
                  title={template.name}
                  onClick={() => setPreviewTemplate(template)}
                >
                  {template.icon}
                </div>
              ))}
            </div>

            {/* Short Preview Modal */}
            {previewTemplate && (
              <div className="modal-overlay" style={{ zIndex: 110 }}>
                <div className="template-modal" style={{ maxWidth: '400px', width: '90%' }}>
                  <div className="preview-modal-header">
                    <h3 className="preview-modal-title" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--primary)', display: 'flex' }}>{previewTemplate.icon}</span>
                      {previewTemplate.name}
                    </h3>
                    <button className="preview-modal-close" onClick={() => setPreviewTemplate(null)}>
                      <MdClose size={24} />
                    </button>
                  </div>

                  <div style={{ padding: '0 24px 16px 24px' }}>
                    <div style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      position: 'relative',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-surface)',
                      pointerEvents: 'none',
                      marginBottom: '16px'
                    }}>
                      <StaticPreview scene={{
                        layout: previewTemplate.layout,
                        titleText: previewTemplate.fields.find(f => f.key === 'titleText')?.default || previewTemplate.name,
                        subtitleText: previewTemplate.fields.find(f => f.key === 'subtitleText')?.default || '',
                        avatar: avatar1,
                        ...previewTemplate.fields.reduce((acc, f) => ({ ...acc, [f.key]: f.default }), {})
                      }} />
                    </div>

                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                      {previewTemplate.description}
                    </p>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button
                        className="btn-secondary"
                        onClick={() => {
                          setPreviewTemplate(null)
                          if (setShowTemplateModal) setShowTemplateModal(true)
                        }}
                      >
                        See more
                      </button>
                      <button
                        className="btn-primary"
                        onClick={() => {
                          handleAddTemplateScene(previewTemplate)
                          setPreviewTemplate(null)
                        }}
                      >
                        Add this template
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'text':
        return (
          <div className="tool-panel-content elements-ui">
            <div className="elements-search-container">
              <div className="elements-search-bar">
                <MdAdd className="search-plus" />
                <input type="text" placeholder="Search fonts & styles..." />
              </div>
            </div>

            <div className="elements-section">
              <h4 className="elements-section-title">Add text to scene</h4>
              <div className="text-presets-stack">
                <button 
                  className="text-preset-btn heading"
                  onClick={() => addLayer('text', 'Add a heading')}
                >
                  Add a heading
                </button>
                <button 
                  className="text-preset-btn subheading"
                  onClick={() => addLayer('text', 'Add a subheading')}
                >
                  Add a subheading
                </button>
                <button 
                  className="text-preset-btn body"
                  onClick={() => addLayer('text', 'Add a little bit of body text')}
                >
                  Add a little bit of body text
                </button>
              </div>
            </div>

            {activeSceneId && (
              <div className="elements-section">
                <h4 className="elements-section-title" style={{ marginTop: '24px' }}>Scene Text Properties</h4>
                <div className="text-properties-wrapper">
                    {(pageTemplates.find(t => t.layout === (activeScene?.layout || 'split-right'))?.fields || []).map(field => (
                    <div key={field.key} className="premium-property-row">
                        <label className="premium-property-label">{field.label}</label>
                        {field.type === 'textarea' ? (
                        <textarea
                            className="premium-property-input"
                            style={{ minHeight: '80px', resize: 'vertical' }}
                            value={activeScene?.[field.key] || ''}
                            onChange={(e) => updateScene(activeSceneId, { [field.key]: e.target.value })}
                            placeholder={`Enter ${field.label.toLowerCase()}...`}
                        />
                        ) : (
                        <input
                            className="premium-property-input"
                            value={activeScene?.[field.key] || ''}
                            onChange={(e) => updateScene(activeSceneId, { [field.key]: e.target.value })}
                            placeholder={`Enter ${field.label.toLowerCase()}...`}
                        />
                        )}
                    </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'layers':
        return (
          <div className="tool-panel-content">
            <div className="layers-list">
              {(activeScene?.layers || []).length === 0 ? (
                <div className="empty-state-panel">
                  <MdLayersClear size={42} className="empty-state-icon" />
                  <h4>No External Layers</h4>
                  <p>Add media, shapes, or text from the library to build your scene composition.</p>
                </div>
              ) : (
                activeScene.layers.map(layer => (
                  <div key={layer.id} className="layer-item-preview">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {layer.type === 'image' ? <MdPhotoLibrary size={14} /> : <MdVideoLibrary size={14} />}
                      <span>{layer.type}</span>
                    </div>
                    <button onClick={() => {
                      updateScene(activeSceneId, {
                        layers: activeScene.layers.filter(l => l.id !== layer.id)
                      })
                    }}>
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )

      case 'video':
        return (
          <div className="tool-panel-content">
            <div className="media-grid">
              {predefinedVideos.map((video) => (
                <div
                  key={video.id}
                  className="media-item"
                  onClick={() => addLayer('video', video.full)}
                  title={`Add ${video.name}`}
                >
                  <img src={video.image} alt={video.name} />
                  <div className="media-badge">VIDEO</div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'mic':
        return (
          <div className="tool-panel-content">
            <div className="tool-section">
              <h4 className="tool-section-title">AI Voices</h4>
              <div className="voice-tabs">
                <button className="voice-tab active">SULTAN</button>
                <button className="voice-tab">MODERN</button>
              </div>
              <div className="audio-list">
                {[
                  { id: 'v1', name: 'James', type: 'Professional', gender: 'Male' },
                  { id: 'v2', name: 'Sarah', type: 'Natural', gender: 'Female' },
                  { id: 'v3', name: 'Michael', type: 'Deep', gender: 'Male' },
                  { id: 'v4', name: 'Emma', type: 'Friendly', gender: 'Female' }
                ].map((voice) => (
                  <div key={voice.id} className="audio-item">
                    <div className="audio-info">
                      <div className="voice-avatar">
                        {voice.name[0]}
                      </div>
                      <div className="voice-details">
                        <span className="voice-name">{voice.name}</span>
                        <span className="voice-meta">{voice.type} • {voice.gender}</span>
                      </div>
                    </div>
                    <button className="play-preview-btn">▶</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="tool-section" style={{ marginTop: '24px' }}>
              <h4 className="tool-section-title">Background Music</h4>
              <div className="audio-list">
                {predefinedAudios.map((audio) => (
                  <div
                    key={audio.id}
                    className="audio-item"
                    onClick={() => alert(`Applied ${audio.name}`)}
                  >
                    <div className="audio-info">
                      <MdMic size={20} color="var(--primary)" />
                      <span>{audio.name}</span>
                    </div>
                    <span className="audio-duration">
                      {Math.floor(audio.duration / 60)}:{(audio.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'stock':
        return (
          <div className="tool-panel-content">
            <div className="media-grid">
              {[...predefinedMedia, ...predefinedVideos].map((media) => (
                <div
                  key={media.id}
                  className="media-item"
                  onClick={() => addLayer(media.type, media.full)}
                  title={`Add ${media.name}`}
                >
                  <img src={media.image} alt={media.name} />
                  {media.type === 'video' && <div className="media-badge">VIDEO</div>}
                </div>
              ))}
            </div>
          </div>
        )

      case 'shapes':
        return (
          <div className="tool-panel-content">
            <div className="shape-grid">
              {predefinedShapes.map((shape) => (
                <div
                  key={shape.id}
                  className="shape-item"
                  onClick={() => addLayer('shape', shape)}
                  title={`Add ${shape.name}`}
                >
                  <div className="shape-preview" style={{
                    ...shape.style,
                    width: '40px',
                    height: '40px',
                    transform: 'scale(0.8)'
                  }} />
                  <span style={{ fontSize: '11px', marginTop: '4px' }}>{shape.name}</span>
                </div>
              ))}
            </div>
          </div>
        )

      case 'magic':
        return (
          <div className="tool-panel-content">
            <div className="tool-section">
              <h4 className="tool-section-title">
                <MdAutoAwesome className="magic-icon" /> AI Studio
              </h4>
              <p className="magic-subtitle">Supercharge your video creation with AI.</p>

              <div className="magic-card">
                <div className="magic-card-header">
                  <MdChatBubbleOutline size={18} />
                  <h5>Script Generator</h5>
                </div>
                <textarea
                  className="premium-property-input"
                  placeholder="What is your video about? e.g. 'A 30 second intro about digital marketing...'"
                  style={{ minHeight: '80px', marginBottom: '8px' }}
                />
                <button className="btn-primary magic-btn w-100" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', border: 'none' }}>
                  <MdAutoAwesome /> Generate Script
                </button>
              </div>

              <div className="magic-card">
                <div className="magic-card-header">
                  <MdClosedCaption size={18} />
                  <h5>Auto-Captions</h5>
                </div>
                <p className="magic-desc">Automatically transcribe and sync subtitles based on the audio track.</p>
                <button className="btn-secondary magic-btn w-100" style={{ borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>
                  Fetch Audio & Caption
                </button>
              </div>

              <div className="magic-card">
                <div className="magic-card-header">
                  <MdOutlineImageSearch size={18} />
                  <h5>AI Image Generator</h5>
                </div>
                <input
                  className="premium-property-input"
                  placeholder="Describe an image..."
                  style={{ marginBottom: '8px' }}
                />
                <button className="btn-secondary magic-btn w-100" style={{ borderColor: 'rgba(168, 85, 247, 0.4)', color: '#d8b4fe' }}>
                  <MdAutoAwesome /> Dream Image
                </button>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="tool-panel-content">
            <div style={{
              padding: '32px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ fontSize: '36px', opacity: 0.3 }}>🔧</div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-main)' }}>
                {tools.find(t => t.id === selectedTool)?.label}
              </div>
              <div style={{ fontSize: '13px' }}>This tool panel is coming soon.</div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="tools-panel-new">
      <div className="sidebar-nav">
        {tools.map(tool => (
          <button
            key={tool.id}
            className={`nav-item ${selectedTool === tool.id ? 'active' : ''}`}
            onClick={() => setSelectedTool(selectedTool === tool.id ? null : tool.id)}
          >
            <div className="nav-icon-box">
              <tool.icon />
            </div>
            <span className="nav-label">{tool.label}</span>
          </button>
        ))}
      </div>

      {selectedTool && (
        <div className="content-side-panel">
          <div className="panel-header-new">
            <h3 className="panel-title-new">
              {tools.find(t => t.id === selectedTool)?.label || 'Library'}
            </h3>
            <button className="panel-close-new" onClick={() => setSelectedTool(null)}>✕</button>
          </div>
          <div className="panel-body-new premium-scrollbar">
            {renderToolPanel()}
          </div>
        </div>
      )}
    </div>
  )
}

export default EditorSidebar
