import { useMemo, useState } from 'react';
import { MdSearch } from 'react-icons/md';
import { DOODLE_ICON_LIBRARY, ICON_CATEGORIES } from '../../../../constants/iconLibrary';

const EditorSidebarIcons = ({ addLayer }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DOODLE_ICON_LIBRARY.filter((icon) => {
      if (category !== 'all' && icon.category !== category) return false;
      if (!q) return true;
      return icon.name.toLowerCase().includes(q) || icon.id.includes(q);
    });
  }, [query, category]);

  const handleAdd = (icon) => {
    addLayer('icon', icon.src, { role: 'icon' });
  };

  return (
    <div className="shape-tool-panel">
      <div className="shape-tool-search">
        <MdSearch size={18} className="shape-tool-search-icon" aria-hidden />
        <input
          type="search"
          className="shape-tool-search-input"
          placeholder="Search hand-drawn icons"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="shape-tool-tabs" role="tablist" aria-label="Icon categories">
        {ICON_CATEGORIES.map((tab) => (
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
        {filtered.length} {filtered.length === 1 ? 'icon' : 'icons'}
      </p>

      <div className="shape-tool-grid premium-scrollbar">
        {filtered.map((icon) => (
          <button
            key={icon.id}
            type="button"
            className="shape-tool-cell"
            title={icon.name}
            onClick={() => handleAdd(icon)}
          >
            <span className="shape-tool-icon-preview shape-tool-icon-preview--doodle" aria-hidden>
              <img src={icon.src} alt="" />
            </span>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="shape-tool-empty">No icons match your search.</p>
        )}
      </div>
    </div>
  );
};

export default EditorSidebarIcons;
