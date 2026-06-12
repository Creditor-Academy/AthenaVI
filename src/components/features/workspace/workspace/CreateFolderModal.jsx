import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdFolderOpen } from 'react-icons/md';
import './PremiumModal.css';

const CreateFolderModal = ({ isOpen, onClose, onCreate, existingFolders = [] }) => {
    const [folderName, setFolderName] = useState('Default');
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
            setFolderName('Default');
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
                        className="modal-content astryd-modal"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="astryd-header">
                            <div className="astryd-title-group">
                                <div className="astryd-icon-container">
                                    <MdFolderOpen size={20} />
                                </div>
                                <div>
                                    <h2>Create Folder</h2>
                                    <p className="astryd-subtitle">Organize your work with a new folder</p>
                                </div>
                            </div>
                            <button className="astryd-close-btn" onClick={onClose} title="Close">
                                <MdClose size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="astryd-form">
                            <div className="astryd-form-group">
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
                                    className={`astryd-input ${error || isDuplicate ? 'astryd-input-error' : ''}`}
                                    disabled={isSubmitting}
                                    required
                                />
                                {isDuplicate && <span className="astryd-error">This folder name already exists in this workspace</span>}
                                {error && <span className="astryd-error">{error}</span>}
                                {!error && !isDuplicate && <span className="astryd-hint">Give your folder a clear, descriptive name</span>}
                            </div>

                            <div className="astryd-footer">
                                <button 
                                    type="button" 
                                    className="astryd-btn-secondary" 
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="astryd-btn-primary"
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
