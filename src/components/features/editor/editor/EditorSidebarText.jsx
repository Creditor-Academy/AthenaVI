import React from 'react';
import { MdAdd } from 'react-icons/md';
import { pageTemplates } from '../../../../constants/editorData';

const EditorSidebarText = ({ addLayer, activeSceneId, activeScene, updateScene, setSelectedLayerId }) => {
  const handleAddText = (label) => {
    const newId = addLayer('text', label);
    if (newId && setSelectedLayerId) {
      setSelectedLayerId(newId);
    }
  };

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
        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 10px', lineHeight: 1.45 }}>
          Select a text clip on the timeline to edit effects and animations in the right panel.
        </p>
        <div className="text-presets-stack">
          <button type="button" className="text-preset-btn heading" onClick={() => handleAddText('Add a heading')}>
            Add a heading
          </button>
          <button type="button" className="text-preset-btn subheading" onClick={() => handleAddText('Add a subheading')}>
            Add a subheading
          </button>
          <button type="button" className="text-preset-btn body" onClick={() => handleAddText('Add a little bit of body text')}>
            Add a little bit of body text
          </button>
        </div>
      </div>

      {activeSceneId && (
        <div className="elements-section">
          <h4 className="elements-section-title" style={{ marginTop: '24px' }}>Scene Text Properties</h4>
          <div className="text-properties-wrapper">
            {(pageTemplates.find((t) => t.layout === (activeScene?.layout || 'split-right'))?.fields || []).map((field) => (
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
  );
};

export default EditorSidebarText;
