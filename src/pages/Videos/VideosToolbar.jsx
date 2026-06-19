import { useEffect, useRef, useState } from 'react';
import { MdFilterList, MdKeyboardArrowDown, MdSearch, MdSort, MdViewModule } from 'react-icons/md';

function VideosToolbarDropdown({
  label,
  icon: Icon,
  value,
  options,
  onChange,
  menuLabel,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const current = options.find((option) => option.value === value)?.label || label;

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
        className={`workspace-header-control__trigger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="workspace-header-control__icon" aria-hidden>
          <Icon size={16} />
        </span>
        <span className="workspace-header-control__body">
          <span className="workspace-header-control__label">{label}</span>
          <span className="workspace-header-control__value">{current}</span>
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
  filterBy,
  onFilterChange,
  sortBy,
  onSortChange,
  groupBy,
  onGroupChange,
  filterOptions,
  sortOptions,
  groupOptions,
  searchPlaceholder = 'Search exports, workspaces, or people…',
  searchAriaLabel = 'Search videos',
}) {
  return (
    <div className="videos-toolbar">
      <label className="videos-search-bar">
        <MdSearch size={20} className="videos-search-bar__icon" aria-hidden />
        <input
          type="search"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          aria-label={searchAriaLabel}
        />
      </label>

      <div className="videos-toolbar__controls">
        <VideosToolbarDropdown
          label="Filter"
          icon={MdFilterList}
          value={filterBy}
          options={filterOptions}
          onChange={onFilterChange}
          menuLabel="Filter options"
        />
        <VideosToolbarDropdown
          label="Sort"
          icon={MdSort}
          value={sortBy}
          options={sortOptions}
          onChange={onSortChange}
          menuLabel="Sort options"
        />
        <VideosToolbarDropdown
          label="Group by"
          icon={MdViewModule}
          value={groupBy}
          options={groupOptions}
          onChange={onGroupChange}
          menuLabel="Group by options"
        />
      </div>
    </div>
  );
}

export default VideosToolbar;
