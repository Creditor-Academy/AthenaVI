import { useState } from 'react';
import EditorSidebarShapes from './EditorSidebarShapes';
import EditorSidebarIcons from './EditorSidebarIcons';
import EditorSidebarFrames from './EditorSidebarFrames';

const GRAPHIC_SECTIONS = [
  { id: 'shapes', label: 'Shapes' },
  { id: 'icons', label: 'Icons' },
  { id: 'frames', label: 'Frames' },
];

const EditorSidebarGraphic = ({ addLayer, activeSceneId, updateScene, activeScene }) => {
  const [section, setSection] = useState('shapes');

  return (
    <div className="graphic-tool-panel">
      <div className="graphic-section-tabs" role="tablist" aria-label="Graphic sections">
        {GRAPHIC_SECTIONS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={section === tab.id}
            className={`graphic-section-tab ${section === tab.id ? 'graphic-section-tab--active' : ''}`}
            onClick={() => setSection(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {section === 'shapes' && (
        <EditorSidebarShapes
          addLayer={addLayer}
          activeSceneId={activeSceneId}
          updateScene={updateScene}
          activeScene={activeScene}
        />
      )}
      {section === 'icons' && <EditorSidebarIcons addLayer={addLayer} />}
      {section === 'frames' && <EditorSidebarFrames addLayer={addLayer} />}
    </div>
  );
};

export default EditorSidebarGraphic;
