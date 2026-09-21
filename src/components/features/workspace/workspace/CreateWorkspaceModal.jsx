import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdAdd, MdGroupWork } from 'react-icons/md';
import {
  getTeamWorkspaceNames,
  hasConflictingName,
} from '../../../../pages/TeamWorkspace/workspaceUtils.js';
import './PremiumModal.css';

const CreateWorkspaceModal = ({ isOpen, onClose, onCreate, workspaces = [] }) => {
    const [name, setName] = useState('');
    const [invites, setInvites] = useState([]);
    const [emailInput, setEmailInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const teamWorkspaceNames = useMemo(
        () => getTeamWorkspaceNames(workspaces),
        [workspaces]
    );

    const trimmedName = name.trim();
    const isDuplicate =
        !isSubmitting &&
        Boolean(trimmedName) &&
        hasConflictingName(trimmedName, teamWorkspaceNames);

    useEffect(() => {
        if (!isOpen) return;
        setName('');
        setInvites([]);
        setEmailInput('');
        setError('');
        setIsSubmitting(false);
    }, [isOpen]);

    const addEmailToInvites = (rawEmail) => {
        const email = String(rawEmail || '').trim().toLowerCase();
        if (!email) return false;
        if (invites.some((invite) => invite.toLowerCase() === email)) return false;
        setInvites((prev) => [...prev, email]);
        setEmailInput('');
        return true;
    };

    const handleAddEmail = (e) => {
        e.preventDefault();
        addEmailToInvites(emailInput);
    };

    const handleEmailKeyDown = (e) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        addEmailToInvites(emailInput);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!trimmedName || isDuplicate || isSubmitting) return;

        const pendingEmail = emailInput.trim().toLowerCase();
        const allInvites = [...invites];
        if (pendingEmail && !allInvites.some((invite) => invite.toLowerCase() === pendingEmail)) {
            allInvites.push(pendingEmail);
        }

        setIsSubmitting(true);
        setError('');
        try {
            await onCreate({ name: trimmedName, invites: allInvites });
            setName('');
            setInvites([]);
            setEmailInput('');
            onClose();
        } catch (err) {
            console.error('Failed to create workspace:', err);
            setError(err.message || 'Failed to create workspace');
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
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (error) setError('');
                                    }}
                                    placeholder="e.g. Marketing Team"
                                    required
                                    className={`astryd-input ${isDuplicate || error ? 'astryd-input-error' : ''}`}
                                    disabled={isSubmitting}
                                />
                                {isDuplicate && (
                                    <span className="astryd-error">This workspace name already exists</span>
                                )}
                                {error && !isDuplicate && (
                                    <span className="astryd-error">{error}</span>
                                )}
                                {!isDuplicate && !error && (
                                    <span className="astryd-hint">Choose a clear name that describes your team or project</span>
                                )}
                            </div>

                            <div className="astryd-form-group">
                                <label>Invite Members (Optional)</label>
                                <div className="astryd-email-group">
                                    <input
                                        type="email"
                                        value={emailInput}
                                        onChange={(e) => setEmailInput(e.target.value)}
                                        onKeyDown={handleEmailKeyDown}
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
                                    disabled={!trimmedName || isDuplicate || isSubmitting}
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
