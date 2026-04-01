import React, { useState, useRef, useEffect } from 'react';
import { MdViewModule, MdViewList, MdSort, MdAdd, MdKeyboardArrowDown, MdMail } from 'react-icons/md';

const WorkspaceHeader = ({ viewMode, onViewChange, sortBy, onSortChange, onCreateClick, invitationCount = 0, onInviteClick }) => {
    const [isSortOpen, setIsSortOpen] = useState(false);
    const sortRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortRef.current && !sortRef.current.contains(event.target)) {
                setIsSortOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const sortOptions = [
        { value: 'name_asc', label: 'Name (A-Z)' },
        { value: 'name_desc', label: 'Name (Z-A)' },
        { value: 'date_created', label: 'Date Created' },
        { value: 'last_modified', label: 'Last Modified' }
    ];

    const currentSortLabel = sortOptions.find(opt => opt.value === sortBy)?.label || 'Sort By';

    return (
        <div className="workspace-header-container">
            <div className="workspace-header-title">
                <h2>Workspaces</h2>
            </div>
            <div className="workspace-header-actions">
                <div className="view-toggle">
                    <button
                        className={`view-toggle-btn ${viewMode === 'tile' ? 'active' : ''}`}
                        onClick={() => onViewChange('tile')}
                        title="Grid View"
                    >
                        <MdViewModule size={18} />
                    </button>
                    <button
                        className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => onViewChange('list')}
                        title="List View"
                    >
                        <MdViewList size={18} />
                    </button>
                </div>

                <div className="custom-sort-dropdown" ref={sortRef}>
                    <button
                        className="sort-dropdown-btn"
                        onClick={() => setIsSortOpen(!isSortOpen)}
                    >
                        <MdSort size={18} className="sort-icon" />
                        <span className="sort-label">{currentSortLabel}</span>
                        <MdKeyboardArrowDown size={18} className={`sort-arrow ${isSortOpen ? 'open' : ''}`} />
                    </button>

                    {isSortOpen && (
                        <div className="sort-dropdown-menu fade-in-fast">
                            {sortOptions.map(option => (
                                <button
                                    key={option.value}
                                    className={`sort-menu-item ${sortBy === option.value ? 'active' : ''}`}
                                    onClick={() => {
                                        onSortChange(option.value);
                                        setIsSortOpen(false);
                                    }}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {onInviteClick && (
                    <button className="invite-icon-btn" onClick={onInviteClick} title="Invitations">
                        <MdMail size={18} />
                        {invitationCount > 0 && (
                            <span className="invite-badge">{invitationCount}</span>
                        )}
                    </button>
                )}

                <button className="btn-primary" onClick={onCreateClick}>
                    <MdAdd size={18} /> Create
                </button>
            </div>
        </div>
    );
};

export default WorkspaceHeader;
