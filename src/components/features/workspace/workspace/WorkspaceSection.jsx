import React from 'react';
import { MdAdd } from 'react-icons/md';

const WorkspaceSection = ({ 
    title, 
    count, 
    viewMode, 
    emptyMessage, 
    onEmptyAction, 
    emptyActionLabel, 
    children, 
    showCreateButton = false, 
    onCreateClick, 
    emptyIcon: EmptyIcon, 
    createButtonLabel = "Create", 
    createButtonClass = "btn-secondary add-btn-small",
    emptyActionClass = "btn-secondary add-btn-small",
    listClassName = '',
    showCountBadge = true
}) => {
    return (
        <div className="workspace-section">
            <div className="section-header-compact">
                <div className="section-title-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3>{title}</h3>
                    {showCountBadge && count !== undefined && count !== null && (
                        <span className="section-count-circle">{count}</span>
                    )}
                </div>
                {showCreateButton && onCreateClick && (
                    <button className={createButtonClass} onClick={onCreateClick}>
                        <MdAdd size={16} /> {createButtonLabel}
                    </button>
                )}
            </div>

            {count === 0 ? (
                <div className="section-empty-state">
                    {EmptyIcon && <EmptyIcon className="empty-state-icon" size={48} />}
                    <p className="empty-text">{emptyMessage}</p>
                    {onEmptyAction && (
                        <button className={emptyActionClass} onClick={onEmptyAction}>
                            <MdAdd size={16} /> {emptyActionLabel}
                        </button>
                    )}
                </div>
            ) : (
                <div className={`items-container ${viewMode === 'tile' ? 'tile-view' : 'list-view'} ${listClassName}`.trim()}>
                    {children}
                </div>
            )}
        </div>
    );
};

export default WorkspaceSection;
