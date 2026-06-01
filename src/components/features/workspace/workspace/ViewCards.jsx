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
                        {workspace.type === 'personal'
                            ? 'Private'
                            : (() => {
                                  const hasOwner = (workspace.members || []).some(m => String(m.role || '').toUpperCase() === 'OWNER');
                                  const count = (workspace.members || []).length;
                                  const finalCount = hasOwner ? count : count + 1;
                                  return `${finalCount} ${finalCount === 1 ? 'Member' : 'Members'}`;
                              })()}
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
                    <span className="subtitle">Owner: {folder.createdBy}</span>
                    <div className="meta-row-small">
                        <span className="meta-small">{folder.lastModifiedBy || '-'}</span>
                        <span className="meta-small">{folder.lastModifiedAt || '-'}</span>
                        <span className="meta-small">{Array.isArray(folder.videos) ? `${folder.videos.length} items` : '-'}</span>
                    </div>
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
                    <div className="meta-row-small">
                        <span className="meta-small">{video.lastEditedBy || '-'}</span>
                        <span className="meta-small">{video.lastEditedAt || '-'}</span>
                        <span className="meta-small">{video.size || '-'}</span>
                    </div>
                </div>
                <ContextMenu type="video" {...contextProps} />
            </div>
        </div>
    );
};
