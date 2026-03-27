import React, { useState } from 'react';
import { MdClose } from 'react-icons/md';

const GlobalCreateModal = ({ isOpen, onClose, onCreateVideo, workspaces }) => {
    const [videoName, setVideoName] = useState('');
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('');
    const [selectedFolderId, setSelectedFolderId] = useState('');
    const [newFolderName, setNewFolderName] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);

    if (!isOpen) return null;

    const selectedWorkspace = workspaces.find(w => w.id === selectedWorkspaceId);
    const folders = selectedWorkspace?.folders || [];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!videoName || !selectedWorkspaceId) return;
        if (!isCreatingFolder && !selectedFolderId) return;
        if (isCreatingFolder && !newFolderName) return;

        onCreateVideo({
            videoName,
            workspaceId: selectedWorkspaceId,
            folderId: isCreatingFolder ? null : selectedFolderId,
            newFolderName: isCreatingFolder ? newFolderName : null
        });

        // Reset state
        setVideoName('');
        setSelectedWorkspaceId('');
        setSelectedFolderId('');
        setNewFolderName('');
        setIsCreatingFolder(false);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create New Video</h2>
                    <button className="icon-btn" onClick={onClose}><MdClose size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label>Video Name *</label>
                        <input
                            type="text"
                            value={videoName}
                            onChange={e => setVideoName(e.target.value)}
                            placeholder="e.g. Q3 Marketing Campaign"
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Select Workspace *</label>
                        <select
                            value={selectedWorkspaceId}
                            onChange={e => {
                                setSelectedWorkspaceId(e.target.value);
                                setSelectedFolderId('');
                                setIsCreatingFolder(false);
                            }}
                            required
                            className="form-input"
                        >
                            <option value="">-- Choose a workspace --</option>
                            {workspaces.map(w => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>
                    </div>

                    {selectedWorkspaceId && (
                        <div className="form-group">
                            <label>Select or Create Folder *</label>
                            {!isCreatingFolder ? (
                                <div className="folder-selection">
                                    <select
                                        value={selectedFolderId}
                                        onChange={e => setSelectedFolderId(e.target.value)}
                                        required
                                        className="form-input"
                                    >
                                        <option value="">-- Choose a folder --</option>
                                        {folders.map(f => (
                                            <option key={f.id} value={f.id}>{f.name}</option>
                                        ))}
                                    </select>
                                    <button type="button" className="btn-text mt-2" onClick={() => setIsCreatingFolder(true)}>
                                        + Or create a new folder
                                    </button>
                                </div>
                            ) : (
                                <div className="folder-creation">
                                    <input
                                        type="text"
                                        value={newFolderName}
                                        onChange={e => setNewFolderName(e.target.value)}
                                        placeholder="New folder name"
                                        required
                                        className="form-input"
                                    />
                                    <button type="button" className="btn-text mt-2" onClick={() => {
                                        setIsCreatingFolder(false);
                                        setNewFolderName('');
                                    }}>
                                        Cancel creating new folder
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="modal-footer mt-4">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={
                            !videoName || !selectedWorkspaceId || (!isCreatingFolder && !selectedFolderId) || (isCreatingFolder && !newFolderName)
                        }>Create Video</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GlobalCreateModal;
