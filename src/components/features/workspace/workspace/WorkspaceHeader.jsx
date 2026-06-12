import React, { useState, useRef, useEffect } from 'react';
import { MdViewModule, MdViewList, MdSort, MdAdd, MdKeyboardArrowDown, MdMail, MdMonetizationOn, MdArrowBack } from 'react-icons/md';

const WorkspaceHeader = ({
    viewMode,
    onViewChange,
    sortBy,
    onSortChange,
    onCreateClick,
    invitationCount = 0,
    onInviteClick,
    totalCredits = 0,
    creditsLoading = false,
    showBack = false,
    onBack,
    backLabel = 'Back',
}) => {
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
                {showBack && onBack && (
                    <button
                        type="button"
                        className="workspace-back-btn"
                        onClick={onBack}
                        title={backLabel}
                        aria-label={backLabel}
                    >
                        <MdArrowBack size={20} />
                    </button>
                )}
                <h2>Workspaces</h2>
            </div>
            <div className="workspace-header-actions">
                <div className="workspace-header-credits" title="Total credits available">
                    <MdMonetizationOn className="workspace-header-credits__icon" size={16} aria-hidden />
                    <span className="workspace-header-credits__label">Credits:</span>
                    <span className="workspace-header-credits__amount">
                        {creditsLoading ? '—' : Number(totalCredits).toLocaleString()}
                    </span>
                </div>

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
                    <MdAdd size={18} /> Video
                </button>
            </div>
        </div>
    );
};

export default WorkspaceHeader;
