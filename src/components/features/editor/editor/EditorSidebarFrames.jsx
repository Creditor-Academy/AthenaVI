import { useMemo, useState } from 'react';
import { MdSearch } from 'react-icons/md';
import { FRAME_CATEGORIES, FRAME_LIBRARY } from '../../../../constants/frameLibrary';

const FRAME_PLACEHOLDER =
  'linear-gradient(180deg, #7dd3fc 0%, #7dd3fc 38%, #86efac 38%, #86efac 100%)';

const FramePreview = ({ style }) => {
  const previewStyle = {
    ...style,
    width: '40px',
    height: '40px',
    maxWidth: '40px',
    maxHeight: '40px',
    background: FRAME_PLACEHOLDER,
    overflow: 'hidden',
  };

  return <div className="frame-tool-preview" style={previewStyle} aria-hidden />;
};

const EditorSidebarFrames = ({ addLayer }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('basic');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FRAME_LIBRARY.filter((frame) => {
      if (category !== 'all' && frame.category !== category) return false;
      if (!q) return true;
      return frame.name.toLowerCase().includes(q) || frame.id.includes(q);
    });
  }, [query, category]);

  const handleAdd = (frame) => {
    addLayer('shape', frame, { role: 'frame' });
  };

  return (
    <div className="graphic-section-panel">
      <p className="graphic-section-hint">
        Add a frame to the canvas, then drag an image from Images or Uploads onto it.
      </p>

      <div className="shape-tool-search">
        <MdSearch size={18} className="shape-tool-search-icon" aria-hidden />
        <input
          type="search"
          className="shape-tool-search-input"
          placeholder="Search frames"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="shape-tool-tabs" role="tablist" aria-label="Frame categories">
        {FRAME_CATEGORIES.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={category === tab.id}
            className={`shape-tool-tab ${category === tab.id ? 'shape-tool-tab--active' : ''}`}
            onClick={() => setCategory(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <p className="shape-tool-results-label">
        {filtered.length} {filtered.length === 1 ? 'frame' : 'frames'}
      </p>

      <div className="shape-tool-grid premium-scrollbar">
        {filtered.map((frame) => (
          <button
            key={frame.id}
            type="button"
            className="shape-tool-cell frame-tool-cell"
            title={`${frame.name} — drag an image onto it after adding`}
            onClick={() => handleAdd(frame)}
          >
            <FramePreview style={frame.style} />
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="shape-tool-empty">No frames match your search.</p>
        )}
      </div>
    </div>
  );
};

export default EditorSidebarFrames;
