import {
  Home,
  Video,
  Building2,
  User,
  Volume2,
  Library,
  LayoutGrid,
  BookOpen,
  Settings,
  Loader2,
} from 'lucide-react';
import { SEARCH_CATEGORIES } from '../../../utils/dashboardSearchIndex';
import './DashboardSearchPanel.css';

const CATEGORY_ICONS = {
  pages: Home,
  videos: Video,
  workspaces: Building2,
  avatars: User,
  voices: Volume2,
  library: Library,
  templates: LayoutGrid,
  help: BookOpen,
  settings: Settings,
};

function highlightMatch(text, query) {
  const q = query.trim();
  if (!q || !text) return text;
  const lower = text.toLowerCase();
  const idx = lower.indexOf(q.toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="dash-search-mark">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

function ResultRow({ result, query, isActive, rowIndex, onSelect, onHover }) {
  const Icon = CATEGORY_ICONS[result.category] || Home;
  const rowId = `dash-search-row-${rowIndex}`;

  return (
    <button
      type="button"
      id={rowId}
      role="option"
      aria-selected={isActive}
      className={`dash-search-row ${isActive ? 'dash-search-row--active' : ''}`}
      onMouseEnter={() => onHover(rowIndex)}
      onClick={() => onSelect(result)}
    >
      <span className="dash-search-row__icon" aria-hidden>
        <Icon size={16} strokeWidth={1.75} />
      </span>
      <span className="dash-search-row__text">
        <span className="dash-search-row__title">{highlightMatch(result.title, query)}</span>
        <span className="dash-search-row__location">{result.location}</span>
      </span>
    </button>
  );
}

export default function DashboardSearchPanel({
  query,
  isOpen,
  isIndexing,
  indexError,
  resultsByCategory,
  flatResults,
  categoryLabels,
  activeIndex,
  onSelect,
  onHover,
  showSuggestions = false,
}) {
  if (!isOpen) return null;

  const hasQuery = Boolean(query.trim());
  const isEmpty = hasQuery && flatResults.length === 0 && !isIndexing;

  let rowCounter = 0;

  return (
    <div className="dash-search-panel" role="listbox" aria-label="Dashboard search results">
      {isIndexing && (
        <div className="dash-search-panel__status" aria-live="polite">
          <Loader2 size={14} className="dash-search-spin" aria-hidden />
          Indexing dashboard content…
        </div>
      )}

      {indexError && (
        <div className="dash-search-panel__warn" role="status">
          {indexError}
        </div>
      )}

      {!hasQuery && showSuggestions && (
        <>
          <div className="dash-search-panel__hint">Quick links</div>
          {flatResults.map((result, i) => {
            const idx = rowCounter;
            rowCounter += 1;
            return (
              <ResultRow
                key={result.id}
                result={result}
                query={query}
                isActive={activeIndex === idx}
                rowIndex={idx}
                onSelect={onSelect}
                onHover={onHover}
              />
            );
          })}
        </>
      )}

      {hasQuery &&
        SEARCH_CATEGORIES.map((cat) => {
          const items = resultsByCategory[cat.id];
          if (!items?.length) return null;
          return (
            <div key={cat.id} className="dash-search-group">
              <div className="dash-search-group__label">{categoryLabels[cat.id] || cat.label}</div>
              {items.map((result) => {
                const idx = rowCounter;
                rowCounter += 1;
                return (
                  <ResultRow
                    key={result.id}
                    result={result}
                    query={query}
                    isActive={activeIndex === idx}
                    rowIndex={idx}
                    onSelect={onSelect}
                    onHover={onHover}
                  />
                );
              })}
            </div>
          );
        })}

      {isEmpty && (
        <div className="dash-search-panel__empty">
          No results for &ldquo;{query.trim()}&rdquo;
        </div>
      )}
    </div>
  );
}
