import React, { useState, useRef, useEffect } from 'react';
import {
  MdMoreVert,
  MdEdit,
  MdPersonAdd,
  MdSort,
  MdViewModule,
  MdDelete,
  MdPeople,
  MdFolder,
  MdInfo,
  MdMonetizationOn,
  MdChevronLeft,
  MdOutlineBolt,
  MdSwapHoriz,
} from 'react-icons/md';

const ContextMenu = ({
  type,
  onRename,
  onAddMembers,
  onSort,
  onView,
  onDelete,
  onMembers,
  onMove,
  onDetails,
  onCreditsTransfer,
  onCreditsUsage,
  showCreditsTransfer = false,
  showCreditsUsage = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [creditsSubmenuOpen, setCreditsSubmenuOpen] = useState(false);
  const menuRef = useRef(null);

  const showCreditsMenu = type === 'workspace' && (showCreditsTransfer || showCreditsUsage);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
        setCreditsSubmenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (e, action) => {
    e.preventDefault();
    e.stopPropagation();
    action();
    setIsOpen(false);
    setCreditsSubmenuOpen(false);
  };

  const toggleMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((prev) => {
      if (prev) setCreditsSubmenuOpen(false);
      return !prev;
    });
  };

  return (
    <div
      className={`context-menu-wrapper${isOpen ? ' is-open' : ''}`}
      ref={menuRef}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <button className="context-menu-btn" onClick={toggleMenu}>
        <MdMoreVert size={20} />
      </button>

      {isOpen && (
        <div className="context-menu-dropdown fade-in-fast">
          {onRename && (
            <button className="menu-item" onClick={(e) => handleAction(e, onRename)}>
              <MdEdit size={16} /> Rename
            </button>
          )}
          {type === 'workspace' && onMembers && (
            <button className="menu-item" onClick={(e) => handleAction(e, onMembers)}>
              <MdPeople size={16} /> Members
            </button>
          )}
          {showCreditsMenu && (
            <div
              className={`context-menu-submenu${creditsSubmenuOpen ? ' is-open' : ''}`}
              onMouseEnter={() => setCreditsSubmenuOpen(true)}
              onMouseLeave={() => setCreditsSubmenuOpen(false)}
            >
              <button
                type="button"
                className="menu-item context-menu-submenu__trigger"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCreditsSubmenuOpen((prev) => !prev);
                }}
              >
                <MdMonetizationOn size={16} />
                Credits
                <MdChevronLeft size={16} className="context-menu-submenu__chevron" />
              </button>
              <div className="context-menu-submenu__panel">
                {showCreditsTransfer && onCreditsTransfer && (
                  <button
                    type="button"
                    className="menu-item"
                    onClick={(e) => handleAction(e, onCreditsTransfer)}
                  >
                    <MdSwapHoriz size={16} /> Transfer credit
                  </button>
                )}
                {showCreditsUsage && onCreditsUsage && (
                  <button
                    type="button"
                    className="menu-item"
                    onClick={(e) => handleAction(e, onCreditsUsage)}
                  >
                    <MdOutlineBolt size={16} /> Usage
                  </button>
                )}
              </div>
            </div>
          )}
          {onDetails && (
            <button className="menu-item" onClick={(e) => handleAction(e, onDetails)}>
              <MdInfo size={16} /> Details
            </button>
          )}
          {onMove && (
            <button className="menu-item" onClick={(e) => handleAction(e, onMove)}>
              <MdFolder size={16} /> Move to Folder
            </button>
          )}
          {type === 'workspace' && onAddMembers && (
            <button className="menu-item" onClick={(e) => handleAction(e, onAddMembers)}>
              <MdPersonAdd size={16} /> Add Members
            </button>
          )}
          {(type === 'workspace' || type === 'folder') && onSort && (
            <button className="menu-item" onClick={(e) => handleAction(e, onSort)}>
              <MdSort size={16} /> Sort Items
            </button>
          )}
          {(type === 'workspace' || type === 'folder') && onView && (
            <button className="menu-item" onClick={(e) => handleAction(e, onView)}>
              <MdViewModule size={16} /> Change View
            </button>
          )}
          {onDelete && (
            <button className="menu-item text-danger" onClick={(e) => handleAction(e, onDelete)}>
              <MdDelete size={16} /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ContextMenu;
