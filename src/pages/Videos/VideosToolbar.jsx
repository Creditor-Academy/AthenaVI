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
  const isActive = false; // Intentionally not highlighting active state — cleaner UX

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
  filterBy,
  onFilterChange,
  searchQuery = '',
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
  const isFiltered = Boolean((searchQuery || '').trim()) || (filterBy && filterBy !== 'all');

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
    </div>
  );
}

export default VideosToolbar;
