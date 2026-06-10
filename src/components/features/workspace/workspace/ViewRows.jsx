import React from 'react';
import { MdFolder, MdVideoLibrary, MdPerson, MdPeople, MdAccountBalanceWallet } from 'react-icons/md';
import ContextMenu from './ContextMenu.jsx';
import UserIdentity from './UserIdentity.jsx';
import { formatFolderSize, formatProjectSize } from '../../../../utils/formatSize.js';

const formatSize = (item) => {
    if (!item) return '-';
    if (Array.isArray(item.members)) {
        const hasOwner = item.members.some(m => String(m.role || '').toUpperCase() === 'OWNER');
        const count = item.members.length;
        const finalCount = hasOwner ? count : count + 1;
        return `${finalCount} ${finalCount === 1 ? 'member' : 'members'}`;
    }
    if (Array.isArray(item.videos)) return `${item.videos.length} items`;
    return '-';
};

export const formatOnlyDate = (dateStr) => {
    if (!dateStr || dateStr === '-') return '-';
    try {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
            return d.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
        if (dateStr.includes(',')) {
            return dateStr.split(',')[0].trim();
        }
        return dateStr;
    } catch {
        return dateStr;
    }
};

export const WorkspaceRow = ({ workspace, onClick, contextProps, onAllocateCredits, showAllocateCredits = false }) => {
    return (
        <div className="workspace-item-row" onClick={onClick}>
            <div className="row-icon-container">
                {workspace.type === 'personal' ? <MdPerson size={24} /> : <MdPeople size={24} />}
            </div>

            <div className="col col-name">
                <h4>{workspace.name}</h4>
                {showAllocateCredits && onAllocateCredits && (
                    <button
                        type="button"
                        className="workspace-allocate-btn workspace-allocate-btn--inline"
                        onClick={(event) => {
                            event.stopPropagation();
                            onAllocateCredits(workspace);
                        }}
                    >
                        <MdAccountBalanceWallet size={14} />
                        Transfer credits
                    </button>
                )}
            </div>

            <div className="col col-owner">{workspace.ownerName || workspace.ownerId || '-'}</div>

            <div className="col col-modified">{formatOnlyDate(workspace.lastModifiedAt || workspace.updatedAt)}</div>

            <div className="col col-size">{formatSize(workspace)}</div>

            <div className="row-actions">
                <ContextMenu type="workspace" {...contextProps} />
            </div>
        </div>
    );
};

export const FolderRow = ({ folder, onClick, contextProps }) => {
    return (
        <div className="workspace-item-row folder-item-row" onClick={onClick}>
            <div className="row-icon-container">
                <MdFolder size={24} />
            </div>

            <div className="col col-name">
                <h4>{folder.name}</h4>
            </div>

            <div className="col col-owner">
                <UserIdentity name={folder.createdBy} compact />
            </div>

            <div className="col col-created">{formatOnlyDate(folder.createdAt)}</div>

            <div className="col col-modified-by">
                <UserIdentity name={folder.lastModifiedBy} compact />
            </div>

            <div className="col col-modified">{formatOnlyDate(folder.lastModifiedAt)}</div>

            <div className="col col-size">{folder.displaySize || formatFolderSize(folder)}</div>

            <div className="row-actions">
                <ContextMenu type="folder" {...contextProps} />
            </div>
        </div>
    );
};

export const VideoRow = ({ video, onClick, contextProps }) => {
    const modifiedBy = video.lastModifiedBy || video.lastEditedBy || '-';
    const modifiedAt = video.lastModifiedAt || video.lastEditedAt;

    return (
        <div className="workspace-item-row project-item-row" onClick={onClick}>
            <div className="row-icon-container">
                <MdVideoLibrary size={24} />
            </div>

            <div className="col col-name">
                <h4>{video.name}</h4>
            </div>

            <div className="col col-owner">
                <UserIdentity name={video.createdBy} compact />
            </div>

            <div className="col col-created">{formatOnlyDate(video.createdAt)}</div>

            <div className="col col-modified-by">
                <UserIdentity name={modifiedBy} compact />
            </div>

            <div className="col col-modified">{formatOnlyDate(modifiedAt)}</div>

            <div className="col col-size">{formatProjectSize(video)}</div>

            <div className="row-actions">
                <ContextMenu type="video" {...contextProps} />
            </div>
        </div>
    );
};
