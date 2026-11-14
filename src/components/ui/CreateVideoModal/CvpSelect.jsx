import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { MdCheck, MdExpandMore } from 'react-icons/md';

/** Space kept free below the menu for the page's bottom button bar. */
const BOTTOM_RESERVED = 96;
const MENU_MAX_HEIGHT = 300;

/**
 * A dropdown drawn with the page's own styles (a native <select> list can't be styled).
 * Works like a select: click or Enter/Space/Arrow keys to open, arrows to move, Enter to pick,
 * Escape or Tab to close, and typing a letter jumps to the next option starting with it.
 *
 * @param {object} props
 * @param {string} props.labelId  id of the visible label
 * @param {string} props.value
 * @param {Array<{ label?: string, options: Array<{ value: string, label: string, badge?: string, icon?: React.ReactNode }> }>} props.groups
 * @param {Array<{ value: string, label: string, icon?: React.ReactNode }>} [props.actions]  shown after the options, e.g. "Create new folder"
 * @param {(value: string) => void} props.onChange
 * @param {string} [props.placeholder]
 * @param {boolean} [props.disabled]
 * @param {React.ReactNode} [props.icon]  shown before the selected label
 */
export default function CvpSelect({
  labelId,
  value,
  groups = [],
  actions = [],
  onChange,
  placeholder = 'Select…',
  disabled = false,
  icon = null,
}) {
  const baseId = useId();
  const listId = `${baseId}-list`;
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [placeAbove, setPlaceAbove] = useState(false);
  const [maxHeight, setMaxHeight] = useState(MENU_MAX_HEIGHT);

  // Every pickable row in order (options, then actions), for keyboard movement.
  const items = useMemo(() => {
    const rows = [];
    groups.forEach((group) => group.options.forEach((option) => rows.push({ ...option, kind: 'option' })));
    actions.forEach((action) => rows.push({ ...action, kind: 'action' }));
    return rows;
  }, [groups, actions]);

  const selected = items.find((item) => item.kind === 'option' && String(item.value) === String(value)) || null;
  const optionId = (index) => `${baseId}-opt-${index}`;

  const openMenu = (startAt) => {
    if (disabled) return;
    const selectedIndex = items.findIndex((item) => item.kind === 'option' && String(item.value) === String(value));
    setActiveIndex(startAt ?? (selectedIndex >= 0 ? selectedIndex : 0));
    setOpen(true);
  };

  const closeMenu = ({ focus = true } = {}) => {
    setOpen(false);
    setActiveIndex(-1);
    if (focus) triggerRef.current?.focus();
  };

  const pick = (item) => {
    if (!item) return;
    closeMenu();
    if (item.kind === 'action' || String(item.value) !== String(value)) onChange?.(item.value);
  };

  // Open downward when the list fits, otherwise upward when that fits, otherwise on the roomier
  // side with the list scrolling. Space is measured inside the area that clips the menu (the
  // page's scrolling area sits below a fixed header) and above the bottom button bar.
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    let clipTop = 0;
    let clipBottom = window.innerHeight - BOTTOM_RESERVED;
    for (let node = rootRef.current?.parentElement; node && node !== document.body; node = node.parentElement) {
      const { overflowY } = window.getComputedStyle(node);
      if (/(auto|scroll|hidden)/.test(overflowY)) {
        const clip = node.getBoundingClientRect();
        clipTop = Math.max(clipTop, clip.top + 16);
        clipBottom = Math.min(clipBottom, clip.bottom);
        break;
      }
    }
    const gap = 8;
    const below = clipBottom - rect.bottom - gap;
    const above = rect.top - clipTop - gap;
    const wanted = Math.min(MENU_MAX_HEIGHT, listRef.current?.scrollHeight || MENU_MAX_HEIGHT);
    const goAbove = below < wanted && (above >= wanted || above > below);
    setPlaceAbove(goAbove);
    setMaxHeight(Math.max(120, Math.min(wanted, goAbove ? above : below)));
  }, [open, items.length]);

  // Keep the highlighted row in view.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    document.getElementById(optionId(activeIndex))?.scrollIntoView?.({ block: 'nearest' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeIndex]);

  // Close when clicking anywhere else.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) closeMenu({ focus: false });
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [open]);

  const onKeyDown = (event) => {
    if (disabled) return;
    const { key } = event;

    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(key)) {
        event.preventDefault();
        openMenu(key === 'ArrowUp' ? items.length - 1 : undefined);
      }
      return;
    }

    if (key === 'Escape') {
      // Only the menu closes; the page's own Escape handling must not see this key.
      event.preventDefault();
      event.stopPropagation();
      closeMenu();
    } else if (key === 'Tab') {
      closeMenu({ focus: false });
    } else if (key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(items.length - 1, index + 1));
    } else if (key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(0, index - 1));
    } else if (key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
    } else if (key === 'End') {
      event.preventDefault();
      setActiveIndex(items.length - 1);
    } else if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      pick(items[activeIndex]);
    } else if (key.length === 1 && /\S/.test(key)) {
      // Jump to the next option whose name starts with the typed letter.
      const letter = key.toLowerCase();
      const start = activeIndex + 1;
      for (let step = 0; step < items.length; step += 1) {
        const index = (start + step) % items.length;
        if (items[index].kind === 'option' && String(items[index].label).toLowerCase().startsWith(letter)) {
          setActiveIndex(index);
          break;
        }
      }
    }
  };

  let rowIndex = -1;
  const renderRow = (item) => {
    rowIndex += 1;
    const index = rowIndex;
    const isSelected = item.kind === 'option' && String(item.value) === String(value);
    return (
      <li
        key={`${item.kind}-${item.value}`}
        id={optionId(index)}
        role="option"
        aria-selected={isSelected}
        className={`cvp-select-option${item.kind === 'action' ? ' cvp-select-option--action' : ''}${isSelected ? ' selected' : ''}${index === activeIndex ? ' active' : ''}`}
        onMouseEnter={() => setActiveIndex(index)}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => pick(item)}
      >
        {item.icon ? <span className="cvp-select-option__icon" aria-hidden>{item.icon}</span> : null}
        <span className="cvp-select-option__label">{item.label}</span>
        {item.badge ? <span className="cvp-select-option__badge">{item.badge}</span> : null}
        {isSelected ? <MdCheck className="cvp-select-option__check" size={18} aria-hidden /> : null}
      </li>
    );
  };

  return (
    <div className={`cvp-select${open ? ' open' : ''}${disabled ? ' disabled' : ''}`} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        className="cvp-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={labelId}
        aria-activedescendant={open && activeIndex >= 0 ? optionId(activeIndex) : undefined}
        disabled={disabled}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={onKeyDown}
      >
        {icon || selected?.icon ? (
          <span className="cvp-select-trigger__icon" aria-hidden>{selected?.icon || icon}</span>
        ) : null}
        <span className={`cvp-select-trigger__value${selected ? '' : ' placeholder'}`}>
          {selected ? selected.label : placeholder}
        </span>
        {selected?.badge ? <span className="cvp-select-option__badge">{selected.badge}</span> : null}
        <MdExpandMore className="cvp-select-trigger__chevron" size={20} aria-hidden />
      </button>

      {open ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-labelledby={labelId}
          className={`cvp-select-menu${placeAbove ? ' above' : ''}`}
          style={{ maxHeight }}
          tabIndex={-1}
        >
          {groups.map((group, groupIndex) =>
            group.options.length ? (
              <li key={group.label || groupIndex} role="presentation" className="cvp-select-group">
                {group.label ? <span className="cvp-select-group__label" aria-hidden>{group.label}</span> : null}
                <ul role="group" aria-label={group.label || undefined}>
                  {group.options.map((option) => renderRow({ ...option, kind: 'option' }))}
                </ul>
              </li>
            ) : null
          )}
          {!items.some((item) => item.kind === 'option') ? (
            <li role="presentation" className="cvp-select-empty">{placeholder}</li>
          ) : null}
          {actions.length ? <li role="separator" className="cvp-select-divider" /> : null}
          {actions.map((action) => renderRow({ ...action, kind: 'action' }))}
        </ul>
      ) : null}
    </div>
  );
}
