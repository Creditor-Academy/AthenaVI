import React from 'react';
import { MdFolder, MdVideoLibrary, MdPerson, MdPeople } from 'react-icons/md';
import ContextMenu from './ContextMenu.jsx';

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
                    <span className="subtitle">
                        {workspace.type === 'personal' ? 'Private' : `${(workspace.members?.length || 0) + 1} Members`}
                    </span>
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
                    <span className="subtitle">By {folder.createdBy}</span>
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
                    <span className="subtitle">Last edited by {video.lastEditedBy}</span>
                </div>
                <ContextMenu type="video" {...contextProps} />
            </div>
        </div>
    );
};
