import React from 'react';
import { MdLayersClear, MdPhotoLibrary, MdVideoLibrary } from 'react-icons/md';

const EditorSidebarLayers = ({ activeScene, activeSceneId, updateScene }) => {
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
                });
              }}>
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EditorSidebarLayers;
