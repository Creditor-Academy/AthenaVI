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
                                    <MdGroupWork size={24} />
                                </div>
                                <div>
                                    <h2>Create New Workspace</h2>
                                    <p className="modal-subtitle">Set up a collaborative workspace for your team</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-body-premium">
                            <div className="form-group">
                                <label htmlFor="workspace-name">Workspace Name</label>
                                <input
                                    id="workspace-name"
                                    type="text"
                                    autoFocus
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="e.g. Marketing Team"
                                    required
                                    className={`form-input-premium ${isDuplicate ? 'input-error' : ''}`}
                                    disabled={isSubmitting}
                                />
                                {isDuplicate && <span className="error-message-modal">This workspace name already exists</span>}
                                {!isDuplicate && <span className="input-hint">Choose a clear name that describes your team or project</span>}
                            </div>

                            <div className="form-group">
                                <label>Invite Members (Optional)</label>
                                <div className="email-input-group">
                                    <input
                                        type="email"
                                        value={emailInput}
                                        onChange={e => setEmailInput(e.target.value)}
                                        placeholder="colleague@example.com"
                                        className="form-input-premium"
                                        disabled={isSubmitting}
                                    />
                                    <button type="button" className="btn-add-circle" onClick={handleAddEmail} title="Add member" disabled={isSubmitting}>
                                        <MdAdd size={20} />
                                    </button>
                                </div>
                                {invites.length > 0 && (
                                    <div className="invites-list">
                                        {invites.map(email => (
                                            <span key={email} className="invite-chip">
                                                {email}
                                                <button type="button" onClick={() => setInvites(invites.filter(e => e !== email))}>
                                                    <MdClose size={12} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
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
