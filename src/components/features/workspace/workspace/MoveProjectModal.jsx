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
                                <div className="header-icon-container folder-icon-bg" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
                                    <MdDriveFileMove size={24} />
                                </div>
                                <div>
                                    <h2>Move Video</h2>
                                    <p className="modal-subtitle">Move "{videoTitle || 'Untitled Video'}" to another folder</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-body-premium">
                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label htmlFor="target-folder" style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text-main)' }}>Select Destination Folder</label>
                                <select
                                    id="target-folder"
                                    value={targetFolderId}
                                    onChange={e => {
                                        setTargetFolderId(e.target.value);
                                        if (error) setError('');
                                    }}
                                    className="form-input-premium"
                                    disabled={isSubmitting}
                                    style={{
                                        width: '100%',
                                        height: '42px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-card)',
                                        color: 'var(--text-main)',
                                        padding: '0 12px',
                                        fontSize: '14px',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="">Workspace Root (No Folder)</option>
                                    {folders.map(folder => (
                                        <option key={folder.id} value={folder.id}>
                                            {folder.name}
                                        </option>
                                    ))}
                                </select>
                                {error && <span className="error-message-modal" style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', display: 'block' }}>{error}</span>}
                            </div>

                            <div className="modal-footer-premium" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button 
                                    type="button" 
                                    className="btn-secondary-premium" 
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        background: 'transparent',
                                        color: 'var(--text-main)',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-primary-premium"
                                    disabled={isSubmitting}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: 'var(--primary)',
                                        color: '#fff',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
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
