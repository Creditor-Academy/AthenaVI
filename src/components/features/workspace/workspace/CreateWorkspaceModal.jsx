import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdAdd, MdGroupWork } from 'react-icons/md';
import './PremiumModal.css';

const CreateWorkspaceModal = ({ isOpen, onClose, onCreate, workspaces = [] }) => {
    const [name, setName] = useState('');
    const [invites, setInvites] = useState([]);
    const [emailInput, setEmailInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isDuplicate = workspaces.some(w => w.name.toLowerCase() === name.trim().toLowerCase());

    const handleAddEmail = (e) => {
        e.preventDefault();
        if (emailInput && !invites.includes(emailInput)) {
            setInvites([...invites, emailInput]);
            setEmailInput('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || isDuplicate) return;
        setIsSubmitting(true);
        try {
            await onCreate({ name, invites });
            setName('');
            setInvites([]);
            onClose();
        } catch (err) {
            console.error('Failed to create workspace:', err);
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
                                    <MdGroupWork size={20} />
                                </div>
                                <div>
                                    <h2>Create New Workspace</h2>
                                    <p className="astryd-subtitle">Set up a collaborative workspace for your team</p>
                                </div>
                            </div>
                            <button className="astryd-close-btn" onClick={onClose} title="Close">
                                <MdClose size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="astryd-form">
                            <div className="astryd-form-group">
                                <label htmlFor="workspace-name">Workspace Name</label>
                                <input
                                    id="workspace-name"
                                    type="text"
                                    autoFocus
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="e.g. Marketing Team"
                                    required
                                    className={`astryd-input ${isDuplicate ? 'astryd-input-error' : ''}`}
                                    disabled={isSubmitting}
                                />
                                {isDuplicate && <span className="astryd-error">This workspace name already exists</span>}
                                {!isDuplicate && <span className="astryd-hint">Choose a clear name that describes your team or project</span>}
                            </div>

                            <div className="astryd-form-group">
                                <label>Invite Members (Optional)</label>
                                <div className="astryd-email-group">
                                    <input
                                        type="email"
                                        value={emailInput}
                                        onChange={e => setEmailInput(e.target.value)}
                                        placeholder="colleague@example.com"
                                        className="astryd-input"
                                        disabled={isSubmitting}
                                    />
                                    <button type="button" className="astryd-email-btn" onClick={handleAddEmail} title="Add member" disabled={isSubmitting}>
                                        <MdAdd size={20} />
                                    </button>
                                </div>
                                {invites.length > 0 && (
                                    <div className="astryd-chips-container">
                                        {invites.map(email => (
                                            <span key={email} className="astryd-chip">
                                                {email}
                                                <button type="button" onClick={() => setInvites(invites.filter(e => e !== email))}>
                                                    <MdClose size={12} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
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
                                    disabled={!name || isDuplicate || isSubmitting}
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Workspace'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CreateWorkspaceModal;
