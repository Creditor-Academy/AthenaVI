import React, { useState } from 'react';
import { MdClose, MdAdd } from 'react-icons/md';

const PLAN_LIMITS = {
    individual: { maxWorkspaces: 0, canInvite: false },
    team: { maxWorkspaces: 5, canInvite: true },
    organisation: { maxWorkspaces: 15, canInvite: true }
};

const CreateWorkspaceModal = ({ isOpen, onClose, onCreate, userPlan, currentWorkspaceCount }) => {
    const [name, setName] = useState('');
    const [invites, setInvites] = useState([]);
    const [emailInput, setEmailInput] = useState('');

    if (!isOpen) return null;

    const plan = userPlan || 'individual';
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.individual;
    const canCreate = currentWorkspaceCount < limits.maxWorkspaces;

    const handleAddEmail = (e) => {
        e.preventDefault();
        if (emailInput && !invites.includes(emailInput)) {
            setInvites([...invites, emailInput]);
            setEmailInput('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !canCreate) return;
        onCreate({ name, invites });
        setName('');
        setInvites([]);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create New Workspace</h2>
                    <button className="icon-btn" onClick={onClose}><MdClose size={20} /></button>
                </div>

                {!canCreate ? (
                    <div className="modal-body">
                        <div className="upgrade-prompt">
                            <h3>Upgrade Required</h3>
                            <p>Your {plan} plan limits you to {limits.maxWorkspaces} custom workspaces.</p>
                            <button className="btn-primary mt-3">Upgrade Plan</button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="modal-body">
                        <div className="form-group">
                            <label>Workspace Name *</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g. Marketing Team"
                                required
                                className="form-input"
                            />
                        </div>

                        {limits.canInvite && (
                            <div className="form-group">
                                <label>Invite Members (Optional)</label>
                                <div className="email-input-group">
                                    <input
                                        type="email"
                                        value={emailInput}
                                        onChange={e => setEmailInput(e.target.value)}
                                        placeholder="colleague@example.com"
                                        className="form-input"
                                    />
                                    <button type="button" className="btn-secondary" onClick={handleAddEmail}>
                                        <MdAdd size={18} /> Add
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
                        )}

                        <div className="modal-footer mt-4">
                            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn-primary" disabled={!name}>Create Workspace</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default CreateWorkspaceModal;
