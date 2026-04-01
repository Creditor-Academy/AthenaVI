import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdFolderOpen } from 'react-icons/md';
import './PremiumModal.css';

const CreateFolderModal = ({ isOpen, onClose, onCreate, existingFolders = [] }) => {
    const [folderName, setFolderName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const isDuplicate = existingFolders.some(f => f.name.toLowerCase() === folderName.trim().toLowerCase());

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!folderName.trim() || isDuplicate) return;

        setIsSubmitting(true);
        setError('');
        try {
            await onCreate(folderName.trim());
            setFolderName('');
            onClose();
        } catch (err) {
            console.error('Failed to create folder:', err);
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
                                    <MdFolderOpen size={24} />
                                </div>
                                <div>
                                    <h2>Create Folder</h2>
                                    <p className="modal-subtitle">Organize your work with a new folder</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-body-premium">
                            <div className="form-group">
                                <label htmlFor="folder-name">Folder Name</label>
                                <input
                                    id="folder-name"
                                    type="text"
                                    autoFocus
                                    value={folderName}
                                    onChange={e => {
                                        setFolderName(e.target.value);
                                        if (error) setError('');
                                    }}
                                    placeholder="e.g. Q1 Marketing Materials"
                                    className={`form-input-premium ${error || isDuplicate ? 'input-error' : ''}`}
                                    disabled={isSubmitting}
                                    required
                                />
                                {isDuplicate && <span className="error-message-modal">This folder name already exists in this workspace</span>}
                                {error && <span className="error-message-modal">{error}</span>}
                                {!error && !isDuplicate && <span className="input-hint">Give your folder a clear, descriptive name</span>}
                            </div>

                            <div className="modal-footer-premium">
                                <button 
                                    type="button" 
                                    className="btn-secondary-premium" 
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-primary-premium"
                                    disabled={!folderName.trim() || isSubmitting || isDuplicate}
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Folder'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CreateFolderModal;
