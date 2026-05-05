import React from 'react';
import { predefinedShapes } from '../../../../constants/editorData';

const EditorSidebarShapes = ({ addLayer }) => {
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
  );
};

export default EditorSidebarShapes;
