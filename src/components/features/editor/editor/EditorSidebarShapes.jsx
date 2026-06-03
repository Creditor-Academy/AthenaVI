import { useMemo, useState } from 'react';
import { MdSearch } from 'react-icons/md';
import { SHAPE_CATEGORIES, SHAPE_LIBRARY } from '../../../../constants/shapeLibrary';

const ShapePreview = ({ style }) => {
  const previewStyle = {
    ...style,
    width: '36px',
    height: '36px',
    maxWidth: '36px',
    maxHeight: '36px',
    background: style.background === 'transparent' ? 'transparent' : 'var(--shape-preview-fill, var(--text-muted))',
    borderColor: style.border?.includes('solid') ? 'var(--shape-preview-fill, var(--text-muted))' : undefined,
  };

  if (style.background === 'transparent' && style.border) {
    previewStyle.border = style.border.replace('var(--primary)', 'var(--shape-preview-fill, var(--text-muted))');
  }

  return <div className="shape-tool-preview" style={previewStyle} aria-hidden />;
};

const EditorSidebarShapes = ({ addLayer }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('shapes');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SHAPE_LIBRARY.filter((shape) => {
      if (category === 'all') {
        /* all */
      } else if (category === 'shapes') {
        if (shape.category === 'arrows') return false;
      } else if (shape.category !== category) {
        return false;
      }
      if (!q) return true;
      return shape.name.toLowerCase().includes(q) || shape.id.includes(q);
    });
  }, [query, category]);

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
