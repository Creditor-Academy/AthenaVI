import React from 'react';
import {
  MdPerson,
  MdMic,
  MdPhotoLibrary,
  MdVideoLibrary,
  MdCloudUpload,
  MdTextFields,
  MdShapeLine,
  MdLayers
} from 'react-icons/md';

import EditorSidebarAvatar from './EditorSidebarAvatar';
import EditorSidebarImage from './EditorSidebarImage';
import EditorSidebarUploads from './EditorSidebarUploads';
import EditorSidebarTemplates from './EditorSidebarTemplates';
import EditorSidebarText from './EditorSidebarText';
import EditorSidebarLayers from './EditorSidebarLayers';
import EditorSidebarVideo from './EditorSidebarVideo';
import EditorSidebarVoice from './EditorSidebarVoice';
import EditorSidebarStock from './EditorSidebarStock';
import EditorSidebarShapes from './EditorSidebarShapes';
import EditorSidebarMagic from './EditorSidebarMagic';

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
  const tools = [
    { id: 'avatar', icon: MdPerson, label: 'Avatar' },
    { id: 'mic', icon: MdMic, label: 'Voice' },
    { id: 'image', icon: MdPhotoLibrary, label: 'Images' },
    { id: 'video', icon: MdVideoLibrary, label: 'Videos' },
    { id: 'uploads', icon: MdCloudUpload, label: 'Uploads' },
    { id: 'text', icon: MdTextFields, label: 'Text' },
    { id: 'shapes', icon: MdShapeLine, label: 'Shapes' },
    { id: 'layers', icon: MdLayers, label: 'Layers' }
  ];

  const renderToolPanel = () => {
    if (!selectedTool) return null;

    switch (selectedTool) {
      case 'avatar':
        return <EditorSidebarAvatar 
          activeScene={activeScene} 
          activeSceneId={activeSceneId} 
          scenes={scenes} 
          autoCreateScene={autoCreateScene} 
          updateScene={updateScene} 
          setShowTemplateModal={setShowTemplateModal} 
          addLayer={addLayer}
        />;
      case 'image':
        return <EditorSidebarImage addLayer={addLayer} />;
      case 'uploads':
        return <EditorSidebarUploads addLayer={addLayer} />;
      case 'templates':
        return <EditorSidebarTemplates handleAddTemplateScene={handleAddTemplateScene} setShowTemplateModal={setShowTemplateModal} />;
      case 'text':
        return <EditorSidebarText addLayer={addLayer} activeSceneId={activeSceneId} activeScene={activeScene} updateScene={updateScene} />;
      case 'layers':
        return <EditorSidebarLayers activeScene={activeScene} activeSceneId={activeSceneId} updateScene={updateScene} />;
      case 'video':
        return <EditorSidebarVideo addLayer={addLayer} />;
      case 'mic':
        return <EditorSidebarVoice />;
      case 'stock':
        return <EditorSidebarStock addLayer={addLayer} />;
      case 'shapes':
        return <EditorSidebarShapes addLayer={addLayer} />;
      case 'magic':
        return <EditorSidebarMagic />;
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
        );
    }
  };

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
  );
};

export default EditorSidebar;
