import React from 'react';
import { MdFolder, MdVideoLibrary, MdPerson, MdPeople } from 'react-icons/md';
import ContextMenu from './ContextMenu.jsx';

const formatSize = (item) => {
    if (!item) return '-';
    if (Array.isArray(item.videos)) return `${item.videos.length} items`;
    if (Array.isArray(item.members)) return `${(item.members.length || 0) + 1} members`;
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

export const WorkspaceRow = ({ workspace, onClick, contextProps }) => {
    return (
        <div className="workspace-item-row" onClick={onClick}>
            <div className="row-icon-container">
                {workspace.type === 'personal' ? <MdPerson size={24} /> : <MdPeople size={24} />}
            </div>

            <div className="col col-name">
                <h4>{workspace.name}</h4>
                <span className="row-meta">{workspace.type === 'personal' ? 'Private' : `${(workspace.members?.length || 0) + 1} Members`}</span>
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
        <div className="workspace-item-row" onClick={onClick}>
            <div className="row-icon-container">
                <MdFolder size={24} />
            </div>

            <div className="col col-name">
                <h4>{folder.name}</h4>
            </div>

            <div className="col col-owner">{folder.createdBy || '-'}</div>

            <div className="col col-modified">{formatOnlyDate(folder.lastModifiedAt)}</div>

            <div className="col col-size">{Array.isArray(folder.videos) ? `${folder.videos.length} items` : '-'}</div>

            <div className="row-actions">
                <ContextMenu type="folder" {...contextProps} />
            </div>
        </div>
    );
};

export const VideoRow = ({ video, onClick, contextProps }) => {
    return (
        <div className="workspace-item-row" onClick={onClick}>
            <div className="row-icon-container">
                <MdVideoLibrary size={24} />
            </div>

            <div className="col col-name">
                <h4>{video.name}</h4>
            </div>

            <div className="col col-owner">{video.createdBy || '-'}</div>

            <div className="col col-modified">{formatOnlyDate(video.lastEditedAt)}</div>

            <div className="col col-size">{video.size || '-'}</div>

            <div className="row-actions">
                <ContextMenu type="video" {...contextProps} />
            </div>
        </div>
    );
};
