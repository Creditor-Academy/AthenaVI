import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdVideoLibrary, MdFolderOpen, MdWorkspaces } from 'react-icons/md';
import './PremiumModal.css';

const GlobalCreateModal = ({ isOpen, onClose, onCreateVideo, workspaces, initialWorkspaceId = '', initialFolderId = '' }) => {
    const [videoName, setVideoName] = useState('');
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(initialWorkspaceId);
    const [selectedFolderId, setSelectedFolderId] = useState(initialFolderId);
    const [newFolderName, setNewFolderName] = useState('');
    const [newWorkspaceName, setNewWorkspaceName] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Sync with props if they change
    React.useEffect(() => {
        if (isOpen) {
            setSelectedWorkspaceId(initialWorkspaceId);
            setSelectedFolderId(initialFolderId);
            setIsCreatingWorkspace(false);
            setIsCreatingFolder(false);
        }
    }, [isOpen, initialWorkspaceId, initialFolderId]);

    if (!isOpen) return null;

    const selectedWorkspace = workspaces.find(w => w.id === selectedWorkspaceId);
    const folders = selectedWorkspace?.folders || [];

    // Real-time validation checks
    const isWSNameDuplicate = isCreatingWorkspace && workspaces.some(w => w.name.toLowerCase() === newWorkspaceName.trim().toLowerCase());
    const isFolderNameDuplicate = isCreatingFolder && (
        folders.some(f => f.name.toLowerCase() === newFolderName.trim().toLowerCase())
    );
    const selectedFolder = folders.find(f => f.id === selectedFolderId);
    const isVideoNameDuplicate = videoName.trim() !== '' && (
        (selectedFolder?.videos?.some(v => v.name.toLowerCase() === videoName.trim().toLowerCase())) ||
        (isCreatingFolder && false) // Can't easily check new folder's future videos, but we know it's empty
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isWSNameDuplicate || isFolderNameDuplicate || isVideoNameDuplicate) return;
        if (!videoName || (!selectedWorkspaceId && !newWorkspaceName)) return;
        if (!isCreatingFolder && !selectedFolderId && !newFolderName) return;

        setIsSubmitting(true);
        setError('');
        try {
            await onCreateVideo({
                videoName,
                workspaceId: selectedWorkspaceId,
                folderId: isCreatingFolder ? null : selectedFolderId,
                newFolderName: isCreatingFolder ? newFolderName : null,
                newWorkspaceName: isCreatingWorkspace ? newWorkspaceName : null
            });

            // Reset state
            setVideoName('');
            setSelectedWorkspaceId('');
            setSelectedFolderId('');
            setNewFolderName('');
            setNewWorkspaceName('');
            setIsCreatingFolder(false);
            setIsCreatingWorkspace(false);
            onClose();
        } catch (err) {
            console.error('Failed to create:', err);
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-overlay-wrapper">
                    <motion.div 
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div 
                        className="modal-content professional-modal"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button className="icon-btn-close-outside" onClick={onClose} title="Close">
                            <MdClose size={20} />
                        </button>
                        <div className="modal-header">
                            <div className="header-icon-title">
                                <div className="header-icon-container folder-icon-bg">
                                    <MdVideoLibrary size={24} />
                                </div>
                                <div>
                                    <h2>Create New Video</h2>
                                    <p className="modal-subtitle">Set up your workspace, folder and video</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-body-premium">
                            <div className="form-group">
                                <label>Video Name</label>
                                <input
                                    type="text"
                                    value={videoName}
                                    onChange={e => {
                                        setVideoName(e.target.value);
                                        if (error) setError('');
                                    }}
                                    placeholder="e.g. Tutorial for New Users"
                                    required
                                    className={`form-input-premium ${error.includes('video') || isVideoNameDuplicate ? 'input-error' : ''}`}
                                    disabled={isSubmitting}
                                />
                                {isVideoNameDuplicate && <span className="error-message-modal">A video with this name already exists in this folder</span>}
                            </div>

                            <div className="form-group">
                                <label>Workspace</label>
                                {!isCreatingWorkspace ? (
                                    <div className="input-with-action">
                                        <select
                                            value={selectedWorkspaceId}
                                            onChange={e => {
                                                setSelectedWorkspaceId(e.target.value);
                                                setSelectedFolderId('');
                                                setIsCreatingFolder(false);
                                                if (error) setError('');
                                            }}
                                            required={!isCreatingWorkspace}
                                            className={`form-input-premium ${error.includes('workspace') ? 'input-error' : ''}`}
                                            disabled={isSubmitting}
                                        >
                                            <option value="">-- Select a workspace --</option>
                                            {workspaces.map(w => (
                                                <option key={w.id} value={w.id}>{w.name}</option>
                                            ))}
                                        </select>
                                        <button type="button" className="btn-text mt-2" onClick={() => {
                                            setIsCreatingWorkspace(true);
                                            setSelectedWorkspaceId('');
                                            setSelectedFolderId('');
                                            setIsCreatingFolder(true); // Default to new folder if new workspace
                                        }}>
                                            + Create new workspace
                                        </button>
                                    </div>
                                ) : (
                                    <div className="input-with-action">
                                        <input
                                            type="text"
                                            value={newWorkspaceName}
                                            onChange={e => {
                                                setNewWorkspaceName(e.target.value);
                                                if (error) setError('');
                                            }}
                                            placeholder="Workspace name"
                                            required
                                            className={`form-input-premium ${error.includes('workspace') || isWSNameDuplicate ? 'input-error' : ''}`}
                                            disabled={isSubmitting}
                                        />
                                        {isWSNameDuplicate && <span className="error-message-modal">This workspace name is already taken</span>}
                                        <button type="button" className="btn-text mt-2" onClick={() => {
                                            setIsCreatingWorkspace(false);
                                            setNewWorkspaceName('');
                                        }}>
                                            Cancel new workspace
                                        </button>
                                    </div>
                                )}
                            </div>

                            {(selectedWorkspaceId || isCreatingWorkspace) && (
                                <div className="form-group">
                                    <label>Folder</label>
                                    {!isCreatingFolder ? (
                                        <div className="input-with-action">
                                            <select
                                                value={selectedFolderId}
                                                onChange={e => setSelectedFolderId(e.target.value)}
                                                required={!isCreatingFolder}
                                                className="form-input-premium"
                                                disabled={isSubmitting}
                                            >
                                                <option value="">-- Select a folder --</option>
                                                {folders.map(f => (
                                                    <option key={f.id} value={f.id}>{f.name}</option>
                                                ))}
                                            </select>
                                            <button type="button" className="btn-text mt-2" onClick={() => setIsCreatingFolder(true)}>
                                                + Create new folder
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="input-with-action">
                                            <input
                                                type="text"
                                                value={newFolderName}
                                                onChange={e => {
                                                    setNewFolderName(e.target.value);
                                                    if (error) setError('');
                                                }}
                                                placeholder="Folder name"
                                                required
                                                className={`form-input-premium ${error.includes('folder') || isFolderNameDuplicate ? 'input-error' : ''}`}
                                                disabled={isSubmitting}
                                            />
                                            {isFolderNameDuplicate && <span className="error-message-modal">This folder name already exists in the selected workspace</span>}
                                            {!isCreatingWorkspace && (
                                                <button type="button" className="btn-text mt-2" onClick={() => {
                                                    setIsCreatingFolder(false);
                                                    setNewFolderName('');
                                                }}>
                                                    Cancel new folder
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {error && <div className="error-message-modal" style={{ marginBottom: '16px' }}>{error}</div>}

                            <div className="modal-footer-premium">
                                <button type="button" className="btn-secondary-premium" onClick={onClose} disabled={isSubmitting}>
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-primary-premium" 
                                    disabled={
                                        isSubmitting ||
                                        !videoName || 
                                        (!selectedWorkspaceId && !newWorkspaceName) || 
                                        (!selectedFolderId && !newFolderName) ||
                                        isWSNameDuplicate ||
                                        isFolderNameDuplicate ||
                                        isVideoNameDuplicate
                                    }
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Video'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default GlobalCreateModal;
