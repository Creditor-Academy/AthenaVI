import { useEffect, useRef, useState } from 'react';
import {
  MdClose,
  MdKeyboardArrowDown,
  MdSearch,
} from 'react-icons/md';

export function VideosToolbarDropdown({
  label,
  icon: Icon,
  value,
  defaultValue = 'all',
  options,
  onChange,
  menuLabel,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const currentOption = options.find((option) => option.value === value);
  const currentText = currentOption?.label || label;
  const isActive = value !== defaultValue && value !== 'none' && value !== 'completed_desc';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="workspace-header-control workspace-header-control--dropdown videos-toolbar__dropdown" ref={rootRef}>
      <button
        type="button"
        className={`workspace-header-control__trigger ${open ? 'is-open' : ''} ${isActive ? 'has-active-filter' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="workspace-header-control__icon" aria-hidden>
          <Icon size={16} />
        </span>
        <span className="workspace-header-control__body">
          <span className="workspace-header-control__label">{label}</span>
          <span className="workspace-header-control__value">{currentText}</span>
        </span>
        <MdKeyboardArrowDown
          size={18}
          aria-hidden
          className={`workspace-header-control__chevron ${open ? 'open' : ''}`}
        />
      </button>

      {open ? (
        <div className="workspace-header-dropdown fade-in-fast" role="listbox" aria-label={menuLabel}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={value === option.value}
              className={`workspace-header-dropdown__item ${value === option.value ? 'active' : ''}`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function VideosToolbar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  groupBy,
  onGroupChange,
  sortOptions = [],
  groupOptions = [],
  activeCategoryLabel = 'work',
  onResetFilters,
}) {
  const isFiltered = Boolean(searchQuery.trim()) || groupBy !== 'none' || sortBy !== 'completed_desc';

  return (
    <div className="videos-toolbar-wrapper">
      <div className="videos-toolbar videos-toolbar--full-search">
        {/* Full-width Glass Search Input */}
        <div className="videos-search-bar">
          <MdSearch size={20} className="videos-search-bar__icon" aria-hidden />
          <input
            type="search"
            placeholder={`Search ${activeCategoryLabel}…`}
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Search work"
          />
          {searchQuery ? (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              title="Clear search"
            >
              <MdClose size={16} />
            </button>
          ) : (
            <span className="search-kbd-badge">⌘K</span>
          )}
        </div>
      </div>

      {/* Active Filter Chips / Clear Strip */}
      {isFiltered ? (
        <div className="active-filters-strip fade-in-fast">
          <span className="active-filters-label">Active Filters:</span>
          {groupBy !== 'none' ? (
            <span className="filter-chip">
              Grouped: {groupOptions.find((o) => o.value === groupBy)?.label}
              <button type="button" onClick={() => onGroupChange('none')}>
                <MdClose size={12} />
              </button>
            </span>
          ) : null}
          {sortBy !== 'completed_desc' ? (
            <span className="filter-chip">
              Sort: {sortOptions.find((o) => o.value === sortBy)?.label}
              <button type="button" onClick={() => onSortChange('completed_desc')}>
                <MdClose size={12} />
              </button>
            </span>
          ) : null}
          {searchQuery ? (
            <span className="filter-chip">
              Search: "{searchQuery}"
              <button type="button" onClick={() => onSearchChange('')}>
                <MdClose size={12} />
              </button>
            </span>
          ) : null}
          {onResetFilters ? (
            <button type="button" className="reset-all-filters-btn" onClick={onResetFilters}>
              Reset all
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default VideosToolbar;
