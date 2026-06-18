import React, { useState, useRef, useEffect } from 'react';
import {
    MdViewModule,
    MdViewList,
    MdSort,
    MdKeyboardArrowDown,
    MdMail,
    MdMonetizationOn,
    MdArrowBack,
    MdMovieCreation,
} from 'react-icons/md';

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
        { value: 'last_modified', label: 'Last Modified' },
    ];

    const currentSortLabel = sortOptions.find((opt) => opt.value === sortBy)?.label || 'Sort By';

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
                <div
                    className="workspace-header-control workspace-header-control--primary"
                    title="Total credits available"
                    role="status"
                    aria-label="Total credits available"
                >
                    <span className="workspace-header-control__icon" aria-hidden>
                        <MdMonetizationOn size={16} />
                    </span>
                    <span className="workspace-header-control__body">
                        <span className="workspace-header-control__label">Credits</span>
                        <span className="workspace-header-control__value">
                            {creditsLoading ? '—' : Number(totalCredits).toLocaleString()}
                        </span>
                    </span>
                </div>

                <div className="view-toggle" role="group" aria-label="View mode">
                    <button
                        type="button"
                        className={`view-toggle-btn ${viewMode === 'tile' ? 'active' : ''}`}
                        onClick={() => onViewChange('tile')}
                        title="Grid View"
                        aria-label="Grid view"
                        aria-pressed={viewMode === 'tile'}
                    >
                        <MdViewModule size={18} />
                    </button>
                    <button
                        type="button"
                        className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => onViewChange('list')}
                        title="List View"
                        aria-label="List view"
                        aria-pressed={viewMode === 'list'}
                    >
                        <MdViewList size={18} />
                    </button>
                </div>

                <div className="workspace-header-control workspace-header-control--dropdown" ref={sortRef}>
                    <button
                        type="button"
                        className={`workspace-header-control__trigger ${isSortOpen ? 'is-open' : ''}`}
                        onClick={() => setIsSortOpen((prev) => !prev)}
                        aria-expanded={isSortOpen}
                        aria-haspopup="listbox"
                    >
                        <span className="workspace-header-control__icon" aria-hidden>
                            <MdSort size={16} />
                        </span>
                        <span className="workspace-header-control__body">
                            <span className="workspace-header-control__label">Sort</span>
                            <span className="workspace-header-control__value">{currentSortLabel}</span>
                        </span>
                        <MdKeyboardArrowDown
                            size={18}
                            aria-hidden
                            className={`workspace-header-control__chevron ${isSortOpen ? 'open' : ''}`}
                        />
                    </button>

                    {isSortOpen ? (
                        <div className="workspace-header-dropdown fade-in-fast" role="listbox" aria-label="Sort options">
                            {sortOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="option"
                                    aria-selected={sortBy === option.value}
                                    className={`workspace-header-dropdown__item ${sortBy === option.value ? 'active' : ''}`}
                                    onClick={() => {
                                        onSortChange(option.value);
                                        setIsSortOpen(false);
                                    }}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    ) : null}
                </div>

                {onInviteClick ? (
                    <button
                        type="button"
                        className="workspace-header-control workspace-header-control--interactive"
                        onClick={onInviteClick}
                        title="Invitations"
                        aria-label={`Invitations${invitationCount > 0 ? `, ${invitationCount} pending` : ''}`}
                    >
                        <span className="workspace-header-control__icon" aria-hidden>
                            <MdMail size={16} />
                        </span>
                        <span className="workspace-header-control__body">
                            <span className="workspace-header-control__label">Invites</span>
                            <span className="workspace-header-control__value">
                                {invitationCount > 0 ? `${invitationCount} new` : 'Inbox'}
                            </span>
                        </span>
                        {invitationCount > 0 ? (
                            <span className="workspace-header-control__badge" aria-hidden>
                                {invitationCount}
                            </span>
                        ) : null}
                    </button>
                ) : null}

                <button
                    type="button"
                    className="workspace-header-control workspace-header-control--primary workspace-header-control--interactive"
                    onClick={onCreateClick}
                >
                    <span className="workspace-header-control__icon" aria-hidden>
                        <MdMovieCreation size={16} />
                    </span>
                    <span className="workspace-header-control__body">
                        <span className="workspace-header-control__label">Create</span>
                        <span className="workspace-header-control__value">New Video</span>
                    </span>
                </button>
            </div>
        </div>
    );
};

export default WorkspaceHeader;
