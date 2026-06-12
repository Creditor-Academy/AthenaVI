import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdDriveFileMove } from 'react-icons/md';
import './PremiumModal.css';

const MoveProjectModal = ({ isOpen, onClose, onMove, folders = [], currentFolderId = null, videoTitle = '' }) => {
    const [targetFolderId, setTargetFolderId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setTargetFolderId(currentFolderId || '');
            setError('');
        }
    }, [isOpen, currentFolderId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            await onMove(targetFolderId === '' ? null : targetFolderId);
            onClose();
        } catch (err) {
            console.error('Failed to move project:', err);
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
                                    <MdDriveFileMove size={20} />
                                </div>
                                <div>
                                    <h2>Move Video</h2>
                                    <p className="astryd-subtitle">Move "{videoTitle || 'Untitled Video'}" to another folder</p>
                                </div>
                            </div>
                            <button className="astryd-close-btn" onClick={onClose} title="Close">
                                <MdClose size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="astryd-form">
                            <div className="astryd-form-group">
                                <label htmlFor="target-folder">Select Destination Folder</label>
                                <select
                                    id="target-folder"
                                    value={targetFolderId}
                                    onChange={e => {
                                        setTargetFolderId(e.target.value);
                                        if (error) setError('');
                                    }}
                                    className="astryd-input"
                                    disabled={isSubmitting}
                                >
                                    <option value="">Workspace Root (No Folder)</option>
                                    {folders.map(folder => (
                                        <option key={folder.id} value={folder.id}>
                                            {folder.name}
                                        </option>
                                    ))}
                                </select>
                                {error && <span className="astryd-error">{error}</span>}
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
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Moving...' : 'Move Video'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default MoveProjectModal;
