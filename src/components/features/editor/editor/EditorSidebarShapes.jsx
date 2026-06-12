import { useEffect, useMemo, useState } from 'react';
import { MdSearch } from 'react-icons/md';
import { SHAPE_CATEGORIES, SHAPE_LIBRARY, shapeMatchesCategory } from '../../../../constants/shapeLibrary';
import { loadPitchAssets, pitchShapesAsLibrary } from '../../../../constants/pitchAssetLibrary';

const ShapePreview = ({ style }) => {
  const isLine = style.height === '0px' || style.borderTop;
  const previewStyle = {
    ...style,
    width: isLine ? '36px' : '36px',
    height: isLine ? '4px' : '36px',
    maxWidth: '36px',
    maxHeight: isLine ? '4px' : '36px',
    background: style.background === 'transparent' && !style.borderTop
      ? 'transparent'
      : isLine
        ? 'transparent'
        : 'var(--shape-preview-fill, var(--text-muted))',
    borderColor: style.border?.includes('solid') ? 'var(--shape-preview-fill, var(--text-muted))' : undefined,
  };

  if (style.borderTop) {
    previewStyle.borderTop = style.borderTop.replace('var(--primary)', 'var(--shape-preview-fill, var(--text-muted))');
  }

  if (style.background === 'transparent' && style.border) {
    previewStyle.border = style.border.replace('var(--primary)', 'var(--shape-preview-fill, var(--text-muted))');
  }

  return <div className="shape-tool-preview" style={previewStyle} aria-hidden />;
};

const EditorSidebarShapes = ({ addLayer, activeSceneId, updateScene }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('shapes');
  const [pitchShapes, setPitchShapes] = useState([]);
  const [pitchBackgrounds, setPitchBackgrounds] = useState([]);

  useEffect(() => {
    loadPitchAssets()
      .then((assets) => {
        setPitchShapes(pitchShapesAsLibrary(assets));
        setPitchBackgrounds(assets.backgrounds || []);
      })
      .catch(() => {
        setPitchShapes([]);
        setPitchBackgrounds([]);
      });
  }, []);

  const allShapes = useMemo(() => [...SHAPE_LIBRARY, ...pitchShapes], [pitchShapes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allShapes.filter((shape) => {
      if (!shapeMatchesCategory(shape, category)) return false;
      if (!q) return true;
      return shape.name.toLowerCase().includes(q) || shape.id.includes(q);
    });
  }, [allShapes, query, category]);

  const handleAdd = (shape) => {
    addLayer('shape', shape);
  };

  return (
    <div className="shape-tool-panel">
      <div className="shape-tool-search">
        <MdSearch size={18} className="shape-tool-search-icon" aria-hidden />
        <input
          type="search"
          className="shape-tool-search-input"
          placeholder="Search shapes"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="shape-tool-tabs" role="tablist" aria-label="Shape categories">
        {SHAPE_CATEGORIES.map((tab) => (
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

      {category === 'pitch' && pitchBackgrounds.length > 0 && updateScene && activeSceneId && (
        <div className="shape-tool-backgrounds">
          <p className="shape-tool-results-label">Scene backgrounds</p>
          <div className="shape-tool-bg-row">
            {pitchBackgrounds.map((bg) => (
              <button
                key={bg.id}
                type="button"
                className="shape-tool-bg-swatch"
                title={bg.name}
                style={{ backgroundColor: bg.value }}
                onClick={() => updateScene(activeSceneId, { background: { type: 'solid', value: bg.value } })}
              />
            ))}
          </div>
        </div>
      )}

      <p className="shape-tool-results-label">
        {filtered.length} {filtered.length === 1 ? 'shape' : 'shapes'}
      </p>

      <div className="shape-tool-grid premium-scrollbar">
        {filtered.map((shape) => (
          <button
            key={shape.id}
            type="button"
            className="shape-tool-cell"
            title={shape.name}
            onClick={() => handleAdd(shape)}
          >
            <ShapePreview style={shape.style} />
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="shape-tool-empty">No shapes match your search.</p>
        )}
      </div>
    </div>
  );
};

export default EditorSidebarShapes;
