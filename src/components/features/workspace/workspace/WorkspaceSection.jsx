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
    createButtonLabel = 'Create',
    createButtonIcon: CreateButtonIcon = MdAdd,
    emptyActionIcon: EmptyActionIcon = MdAdd,
    createButtonClass = 'btn-secondary add-btn-small',
    emptyActionClass = 'btn-secondary add-btn-small',
    listClassName = '',
    showCountBadge = true,
}) => {
    const isAccentCreate = createButtonClass.includes('workspace-create-action-btn');

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
                    <button type="button" className={createButtonClass} onClick={onCreateClick}>
                        {isAccentCreate ? (
                            <span className="workspace-create-action-btn__icon" aria-hidden>
                                <CreateButtonIcon size={16} />
                            </span>
                        ) : (
                            <CreateButtonIcon size={16} aria-hidden />
                        )}
                        <span>{createButtonLabel}</span>
                    </button>
                )}
            </div>

            {count === 0 ? (
                <div className="section-empty-state">
                    {EmptyIcon && <EmptyIcon className="empty-state-icon" size={48} />}
                    <p className="empty-text">{emptyMessage}</p>
                    {onEmptyAction && (
                        <button type="button" className={emptyActionClass} onClick={onEmptyAction}>
                            {emptyActionClass.includes('workspace-create-action-btn') ? (
                                <span className="workspace-create-action-btn__icon" aria-hidden>
                                    <EmptyActionIcon size={16} />
                                </span>
                            ) : (
                                <EmptyActionIcon size={16} aria-hidden />
                            )}
                            <span>{emptyActionLabel}</span>
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
