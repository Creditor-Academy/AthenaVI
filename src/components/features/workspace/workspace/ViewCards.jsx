import React from 'react';
import { MdFolder, MdVideoLibrary, MdPerson, MdPeople } from 'react-icons/md';
import ContextMenu from './ContextMenu.jsx';
import UserIdentity from './UserIdentity.jsx';

export const WorkspaceCard = ({ workspace, onClick, contextProps }) => {
    return (
        <div className="workspace-item-card" onClick={onClick}>
            <div className="card-thumb-container">
                <div className="workspace-card-icon">
                    {workspace.type === 'personal' ? <MdPerson size={36} /> : <MdPeople size={36} />}
                </div>
                <div className="project-overlay">
                    <button className="btn-edit-premium">Open Workspace</button>
                </div>
            </div>
            <div className="workspace-item-meta">
                <div className="meta-left">
                    <h4>{workspace.name}</h4>
                    <UserIdentity name={workspace.ownerName} compact />
                </div>
                <ContextMenu type="workspace" {...contextProps} />
            </div>
        </div>
    );
};

export const FolderCard = ({ folder, onClick, contextProps }) => {
    return (
        <div className="workspace-item-card" onClick={onClick}>
            <div className="card-thumb-container folder-thumb">
                <MdFolder size={48} className="folder-icon" />
                <div className="project-overlay">
                    <button className="btn-edit-premium">Open Folder</button>
                </div>
            </div>
            <div className="workspace-item-meta">
                <div className="meta-left">
                    <h4>{folder.name}</h4>
                    <UserIdentity name={folder.createdBy} compact />
                </div>
                <ContextMenu type="folder" {...contextProps} />
            </div>
        </div>
    );
};

export const VideoCard = ({ video, onClick, contextProps }) => {
    return (
        <div className="workspace-item-card" onClick={onClick}>
            <div className="card-thumb-container video-thumb">
                <MdVideoLibrary size={48} className="video-icon" />
                <div className="project-overlay">
                    <button className="btn-edit-premium">Watch Video</button>
                </div>
            </div>
            <div className="workspace-item-meta">
                <div className="meta-left">
                    <h4>{video.name}</h4>
                    <UserIdentity name={video.createdBy} compact />
                </div>
                <ContextMenu type="video" {...contextProps} />
            </div>
        </div>
    );
};
