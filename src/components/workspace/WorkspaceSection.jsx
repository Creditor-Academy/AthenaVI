import React from 'react';
import { MdAdd } from 'react-icons/md';

const WorkspaceSection = ({ title, count, viewMode, emptyMessage, onEmptyAction, emptyActionLabel, children }) => {
    return (
        <div className="workspace-section">
            <div className="section-header-compact">
                <h3>{title} <span className="item-count">({count})</span></h3>
            </div>

            {count === 0 ? (
                <div className="section-empty-state">
                    <p className="empty-text">{emptyMessage}</p>
                    {onEmptyAction && (
                        <button className="btn-secondary add-btn-small" onClick={onEmptyAction}>
                            <MdAdd size={16} /> {emptyActionLabel}
                        </button>
                    )}
                </div>
            ) : (
                <div className={`items-container ${viewMode === 'tile' ? 'tile-view' : 'list-view'}`}>
                    {children}
                </div>
            )}
        </div>
    );
};

export default WorkspaceSection;
