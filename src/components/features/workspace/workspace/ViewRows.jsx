import React from 'react';
import { MdFolder, MdVideoLibrary, MdPerson, MdPeople } from 'react-icons/md';
import ContextMenu from './ContextMenu.jsx';

export const WorkspaceRow = ({ workspace, onClick, contextProps }) => {
    return (
        <div className="workspace-item-row" onClick={onClick}>
            <div className="row-icon-container">
                {workspace.type === 'personal' ? <MdPerson size={24} /> : <MdPeople size={24} />}
            </div>
            <div className="row-details">
                <h4>{workspace.name}</h4>
                <span className="row-meta">
                    {workspace.type === 'personal' ? 'Private' : `${workspace.members.length + 1} Members`}
                </span>
            </div>
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
            <div className="row-details">
                <h4>{folder.name}</h4>
                <span className="row-meta">Created by {folder.createdBy}</span>
            </div>
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
            <div className="row-details">
                <h4>{video.name}</h4>
                <span className="row-meta">Last edited by {video.lastEditedBy} • {video.lastEditedAt}</span>
            </div>
            <div className="row-actions">
                <ContextMenu type="video" {...contextProps} />
            </div>
        </div>
    );
};
