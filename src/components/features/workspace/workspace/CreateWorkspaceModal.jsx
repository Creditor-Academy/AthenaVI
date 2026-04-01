import React, { useState } from 'react';
import { MdClose, MdAdd } from 'react-icons/md';



const CreateWorkspaceModal = ({ isOpen, onClose, onCreate, workspaces = [] }) => {
    const [name, setName] = useState('');
    const [invites, setInvites] = useState([]);
    const [emailInput, setEmailInput] = useState('');

    const isDuplicate = workspaces.some(w => w.name.toLowerCase() === name.trim().toLowerCase());

    if (!isOpen) return null;

    const handleAddEmail = (e) => {
        e.preventDefault();
        if (emailInput && !invites.includes(emailInput)) {
            setInvites([...invites, emailInput]);
            setEmailInput('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name) return;
        onCreate({ name, invites });
        setName('');
        setInvites([]);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="icon-btn-close-outside" onClick={onClose} title="Close">
                    <MdClose size={20} />
                </button>
                <div className="modal-header">
                    <h2>Create New Workspace</h2>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label>Workspace Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Marketing Team"
                            required
                            className={`form-input ${isDuplicate ? 'input-error' : ''}`}
                        />
                        {isDuplicate && <span className="error-message-modal" style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>This workspace name already exists</span>}
                    </div>

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
                            <button type="button" className="btn-add-circle" onClick={handleAddEmail} title="Add member">
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

                    <div className="modal-footer mt-4">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={!name || isDuplicate}>Create Workspace</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateWorkspaceModal;
