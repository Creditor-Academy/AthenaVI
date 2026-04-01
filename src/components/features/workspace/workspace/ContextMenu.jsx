import React, { useState, useRef, useEffect } from 'react';
import { MdMoreVert, MdEdit, MdPersonAdd, MdSort, MdViewModule, MdDelete } from 'react-icons/md';

const ContextMenu = ({ type, onRename, onAddMembers, onSort, onView, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
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
    };

    return (
        <div className="context-menu-wrapper" ref={menuRef} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <button className="context-menu-btn" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen(!isOpen);
            }}>
                <MdMoreVert size={20} />
            </button>

            {isOpen && (
                <div className="context-menu-dropdown fade-in-fast">
                    {onRename && (
                        <button className="menu-item" onClick={(e) => handleAction(e, onRename)}>
                            <MdEdit size={16} /> Rename
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
                            <MdDelete size={16} /> Move to Trash
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ContextMenu;
