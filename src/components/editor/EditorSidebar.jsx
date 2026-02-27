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
  MdLayers
} from 'react-icons/md'
import { predefinedAvatars, predefinedMedia, pageTemplates } from '../../constants/editorData'

const EditorSidebar = ({ 
  selectedTool, 
  setSelectedTool, 
  activeSceneId, 
  addLayer, 
  updateScene, 
  activeScene,
  handleAddTemplateScene,
  showPanelOnly = false
}) => {
  const tools = [
    { id: 'avatar', icon: MdPerson, label: 'Avatar' },
    { id: 'mic', icon: MdMic, label: 'Voice' },
    { id: 'image', icon: MdPhotoLibrary, label: 'Images' },
    { id: 'video', icon: MdVideoLibrary, label: 'Videos' },
    { id: 'uploads', icon: MdCloudUpload, label: 'Uploads' },
    { id: 'stock', icon: MdFolder, label: 'Stock' },
    { id: 'templates', icon: MdAutoAwesome, label: 'Templates' },
    { id: 'text', icon: MdTextFields, label: 'Text' },
    { id: 'magic', icon: MdAutoAwesome, label: 'AI Tools' },
    { id: 'shapes', icon: MdShapeLine, label: 'Shapes' },
    { id: 'layers', icon: MdLayers, label: 'Layers' }
  ]

  const renderToolPanel = () => {
    if (!selectedTool) return null

    switch (selectedTool) {
      case 'avatar':
        return (
          <div className="tool-panel-content">
            <h3 className="tool-panel-title">Select Avatar</h3>
            <div className="avatar-grid">
              {predefinedAvatars.map((avatar) => (
                <div
                  key={avatar.id}
                  className={`avatar-item ${activeScene?.avatarType === avatar.id ? 'selected' : ''}`}
                  onClick={() => updateScene(activeSceneId, { 
                    avatar: avatar.image, 
                    avatarType: avatar.id 
                  })}
                  title={avatar.name}
                >
                  <img src={avatar.image} alt={avatar.name} />
                </div>
              ))}
            </div>
          </div>
        )

      case 'image':
        return (
          <div className="tool-panel-content">
            <h3 className="tool-panel-title">Image Library</h3>
            <div className="media-grid">
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
        )

      case 'uploads':
        return (
          <div className="tool-panel-content">
            <h3 className="tool-panel-title">Upload Media</h3>
            <div
              className="upload-area"
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
              <MdCloudUpload size={32} />
              <div>Click to Upload Media</div>
              <p>From Drive, Photos or your computer</p>
            </div>
            <div className="media-grid">
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
        )

      case 'templates':
        return (
          <div className="tool-panel-content">
            <h3 className="tool-panel-title">Page Templates</h3>
            <div className="media-grid">
              {pageTemplates.map(template => (
                <div
                  key={template.id}
                  className="media-item"
                  title={template.name}
                  onClick={() => handleAddTemplateScene(template)}
                >
                  {template.icon}
                </div>
              ))}
            </div>
          </div>
        )

      case 'text':
        return (
          <div className="tool-panel-content">
            <h3 className="tool-panel-title">Text Styling</h3>
            {!activeSceneId ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#5f6368' }}>
                Please select a scene first
              </div>
            ) : (
              <>
                {(pageTemplates.find(t => t.layout === (activeScene?.layout || 'split-right'))?.fields || []).map(field => (
                  <div key={field.key} className="property-row">
                    <label className="property-label">{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea
                        className="property-input"
                        style={{ minHeight: '60px', resize: 'vertical' }}
                        value={activeScene?.[field.key] || ''}
                        onChange={(e) => updateScene(activeSceneId, { [field.key]: e.target.value })}
                      />
                    ) : (
                      <input
                        className="property-input"
                        value={activeScene?.[field.key] || ''}
                        onChange={(e) => updateScene(activeSceneId, { [field.key]: e.target.value })}
                      />
                    )}
                  </div>
                ))}
                <div style={{ height: '8px', borderBottom: '1px solid #e8eaed', margin: '16px 0' }} />
                <div className="property-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label className="property-label">Title Size</label>
                    <input
                      className="property-input"
                      type="number"
                      value={activeScene?.titleStyle?.fontSize || 48}
                      onChange={(e) => updateScene(activeSceneId, {
                        titleStyle: { ...(activeScene?.titleStyle || {}), fontSize: Number(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <label className="property-label">Title Color</label>
                    <input
                      className="property-input"
                      type="color"
                      style={{ height: '32px', padding: '2px' }}
                      value={activeScene?.titleStyle?.color || '#1a73e8'}
                      onChange={(e) => updateScene(activeSceneId, {
                        titleStyle: { ...(activeScene?.titleStyle || {}), color: e.target.value }
                      })}
                    />
                  </div>
                </div>
                <div className="property-row">
                  <label className="property-label">Alignment</label>
                  <select
                    className="property-input"
                    value={activeScene?.titleStyle?.textAlign || 'left'}
                    onChange={(e) => updateScene(activeSceneId, {
                      titleStyle: { ...(activeScene?.titleStyle || {}), textAlign: e.target.value }
                    })}
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </>
            )}
          </div>
        )

      case 'layers':
        return (
          <div className="tool-panel-content">
            <h3 className="tool-panel-title">B-Roll & Overlays</h3>
            <div className="layers-list">
              {(activeScene?.layers || []).length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#5f6368', fontSize: '13px', border: '1px dashed #dadce0', borderRadius: '8px', background: '#f8f9fa' }}>
                  No extra layers in this scene. Add media from the library to see them here.
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

      case 'stock':
        return (
          <div className="tool-panel-content">
            <h3 className="tool-panel-title">Stock Media</h3>
            <div className="media-grid">
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
        )

      case 'shapes':
        return (
          <div className="tool-panel-content">
            <h3 className="tool-panel-title">Shapes</h3>
            <div style={{ padding: '20px', textAlign: 'center', color: '#5f6368' }}>
              <MdShapeLine size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p>Shape library coming soon</p>
            </div>
          </div>
        )

      default:
        return (
          <div className="tool-panel-content">
            <h3 className="tool-panel-title">{selectedTool}</h3>
            <div style={{ padding: '20px', textAlign: 'center', color: '#5f6368' }}>
              Tool panel coming soon
            </div>
          </div>
        )
    }
  }

  return (
    <div className="tools-panel">
      {!showPanelOnly && (
        <div className="tools-list">
          {tools.map(tool => (
            <button
              key={tool.id}
              className={`tool-btn ${selectedTool === tool.id ? 'active' : ''}`}
              onClick={() => setSelectedTool(selectedTool === tool.id ? null : tool.id)}
              title={tool.label}
            >
              <tool.icon size={20} />
            </button>
          ))}
        </div>
      )}
      
      {selectedTool && showPanelOnly && (
        <div className="tool-panel">
          <div className="tool-panel-header">
            <h3 className="tool-panel-title">
              {tools.find(t => t.id === selectedTool)?.label || 'Tool Panel'}
            </h3>
            <button 
              className="tool-panel-close"
              onClick={() => setSelectedTool(null)}
              title="Close panel"
            >
              ×
            </button>
          </div>
          <div className="tool-panel-content">
            {renderToolPanel()}
          </div>
        </div>
      )}
    </div>
  )
}

export default EditorSidebar
