import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdEdit } from 'react-icons/md';
import './PremiumModal.css';

const RenameModal = ({ isOpen, onClose, onRename, currentName, itemType }) => {
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName(currentName || '');
            setError('');
            setIsSubmitting(false);
        }
    }, [isOpen, currentName]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || name.trim() === currentName) return;

        setIsSubmitting(true);
        setError('');
        try {
            await onRename(name.trim());
            onClose();
        } catch (err) {
            console.error('Failed to rename:', err);
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const label = itemType === 'workspace' ? 'Workspace' : itemType === 'folder' ? 'Folder' : 'Video';

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
                                    <MdEdit size={20} />
                                </div>
                                <div>
                                    <h2>Rename {label}</h2>
                                    <p className="astryd-subtitle">Enter a new name for this {label.toLowerCase()}</p>
                                </div>
                            </div>
                            <button className="astryd-close-btn" onClick={onClose} title="Close">
                                <MdClose size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="astryd-form">
                            <div className="astryd-form-group">
                                <label htmlFor="rename-input">{label} Name</label>
                                <input
                                    id="rename-input"
                                    type="text"
                                    autoFocus
                                    value={name}
                                    onChange={e => {
                                        setName(e.target.value);
                                        if (error) setError('');
                                    }}
                                    placeholder={`Enter new ${label.toLowerCase()} name`}
                                    className={`astryd-input ${error ? 'astryd-input-error' : ''}`}
                                    disabled={isSubmitting}
                                    required
                                />
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
                                    disabled={!name.trim() || name.trim() === currentName || isSubmitting}
                                >
                                    {isSubmitting ? 'Renaming...' : 'Rename'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default RenameModal;
