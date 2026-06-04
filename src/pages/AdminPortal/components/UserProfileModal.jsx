import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdSecurity, MdAttachMoney, MdOutlineVpnKey, MdDeleteForever, MdOutlineFolderShared, MdAdd, MdRemoveCircleOutline } from 'react-icons/md';
import './UserProfileModal.css';

const UserProfileModal = ({ user, onClose, onUpdateUser, onDeleteUser }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [creditsToAdd, setCreditsToAdd] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');

  // Workspace management state
  const availableWorkspaces = ['Global', 'Forge Studio', 'Pulse CRM', 'Beacon Media', 'Astra Ventures', 'Hydra Labs', 'Alpha Design'];
  const availableRoles = ['Owner', 'Admin', 'Editor', 'Viewer', 'Member', 'Workspace Admin'];
  const [newWsName, setNewWsName] = useState('');
  const [newWsRole, setNewWsRole] = useState('Member');

  const userWorkspaces = user.workspaces || (user.workspace ? [{ name: user.workspace, role: user.role }] : []);

  const handleAddWorkspace = () => {
    if (!newWsName) return;
    if (userWorkspaces.some(ws => ws.name === newWsName)) {
      setSuccessMessage(`User is already in "${newWsName}".`);
      setTimeout(() => setSuccessMessage(''), 3000);
      return;
    }
    const updated = [...userWorkspaces, { name: newWsName, role: newWsRole }];
    onUpdateUser({ ...user, workspaces: updated });
    setNewWsName('');
    setNewWsRole('Member');
    setSuccessMessage(`Added to "${newWsName}" as ${newWsRole}.`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleRemoveWorkspace = (wsName) => {
    const updated = userWorkspaces.filter(ws => ws.name !== wsName);
    onUpdateUser({ ...user, workspaces: updated });
    setSuccessMessage(`Removed from "${wsName}".`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleChangeWsRole = (wsName, newRole) => {
    const updated = userWorkspaces.map(ws => ws.name === wsName ? { ...ws, role: newRole } : ws);
    onUpdateUser({ ...user, workspaces: updated });
  };

  if (!user) return null;

  const handleAddCredits = () => {
    if (creditsToAdd !== 0) {
      onUpdateUser({ ...user, credits: user.credits + parseInt(creditsToAdd) });
      setSuccessMessage(`Successfully updated credits by ${creditsToAdd}.`);
      setCreditsToAdd(0);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to permanently delete ${user.name}? This cannot be undone.`)) {
      onDeleteUser(user.id);
    }
  };

  const handleChangePassword = () => {
    setSuccessMessage(`Password reset link sent to ${user.email}`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <AnimatePresence>
      <div className="user-profile-modal modal-overlay" onClick={onClose}>
        <Motion.div 
          className="modal-content"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close" onClick={onClose}><MdClose /></button>
          
          <div className="modal-header">
            <div className="modal-header-top">
              <div className="user-avatar-large">{user.name.charAt(0)}</div>
              <div className="user-info">
                <h2 style={{ margin: 0 }}>{user.name}</h2>
                <p className="modal-subtitle">{user.email}</p>
              </div>
              <span className={`status-badge ${user.status === 'Active' ? 'status-active' : 'status-suspended'}`}>
                {user.status}
              </span>
            </div>
          </div>

          <div className="modal-tabs">
            <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
            <button className={activeTab === 'workspaces' ? 'active' : ''} onClick={() => setActiveTab('workspaces')}>
              <MdOutlineFolderShared size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Workspaces
            </button>
            <button className={activeTab === 'credits' ? 'active' : ''} onClick={() => setActiveTab('credits')}>Credits & Billing</button>
            <button className={activeTab === 'security' ? 'active' : ''} onClick={() => setActiveTab('security')}>Security</button>
          </div>

          <div className="modal-body">
            {activeTab === 'overview' && (
              <div className="modal-section">
                <h3>Subscription Info</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Current Plan</label>
                    <div><span className="plan-tag">{user.plan}</span></div>
                  </div>
                  <div className="info-item">
                    <label>Joined Date</label>
                    <div>{user.joined}</div>
                  </div>
                  <div className="info-item">
                    <label>Next Billing Date</label>
                    <div>2026-06-01</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'workspaces' && (
              <div className="modal-section">
                <h3>Workspace Memberships</h3>
                <p className="hint-text" style={{ marginBottom: 20 }}>Manage which workspaces this user belongs to and their role in each.</p>

                {successMessage && (
                  <div className="success-message" style={{ marginBottom: '16px', color: '#10b981', fontSize: '14px', fontWeight: '500', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>{successMessage}</div>
                )}

                {/* Current workspaces list */}
                <div className="ws-list-container">
                  {userWorkspaces.length === 0 ? (
                    <div className="ws-empty-state">
                      <MdOutlineFolderShared size={40} />
                      <p>No workspaces assigned yet.</p>
                    </div>
                  ) : (
                    userWorkspaces.map((ws, idx) => (
                      <div key={idx} className="ws-list-item">
                        <div className="ws-list-item-icon">
                          <MdOutlineFolderShared size={22} />
                        </div>
                        <div className="ws-list-item-info">
                          <span className="ws-list-item-name">{ws.name}</span>
                          <select
                            className="ws-role-select"
                            value={ws.role}
                            onChange={(e) => handleChangeWsRole(ws.name, e.target.value)}
                          >
                            {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                        <button
                          className="ws-remove-btn"
                          title={`Remove from ${ws.name}`}
                          onClick={() => handleRemoveWorkspace(ws.name)}
                        >
                          <MdRemoveCircleOutline size={20} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add workspace form */}
                <div className="ws-add-form">
                  <h4>Assign to Workspace</h4>
                  <div className="ws-add-controls">
                    <select
                      className="modal-input ws-add-select"
                      value={newWsName}
                      onChange={(e) => setNewWsName(e.target.value)}
                    >
                      <option value="" disabled>Select workspace…</option>
                      {availableWorkspaces
                        .filter(w => !userWorkspaces.some(uw => uw.name === w))
                        .map(w => <option key={w} value={w}>{w}</option>)
                      }
                    </select>
                    <select
                      className="modal-input ws-add-role"
                      value={newWsRole}
                      onChange={(e) => setNewWsRole(e.target.value)}
                    >
                      {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <button className="btn-primary ws-add-btn" onClick={handleAddWorkspace} disabled={!newWsName}>
                      <MdAdd size={18} /> Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'credits' && (
              <div className="modal-section">
                <h3>Credit Management</h3>
                <div className="credit-balance">
                  <MdAttachMoney size={24} color="#10b981" />
                  <span className="balance-text">{user.credits.toLocaleString()} Credits Available</span>
                </div>
                
                <div className="credit-action-box">
                  <label>Grant / Revoke Credits</label>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <input 
                      type="number" 
                      value={creditsToAdd} 
                      onChange={(e) => setCreditsToAdd(e.target.value)} 
                      placeholder="Amount (e.g. 500 or -500)"
                      className="modal-input"
                    />
                    <button className="btn-primary" onClick={handleAddCredits}>Apply</button>
                  </div>
                  <p className="hint-text">Use negative numbers to revoke credits.</p>
                  {successMessage && <div className="success-message" style={{ marginTop: '12px', color: '#10b981', fontSize: '14px', fontWeight: '500' }}>{successMessage}</div>}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="modal-section">
                <h3>Account Actions</h3>
                {successMessage && <div className="success-message" style={{ marginBottom: '16px', color: '#10b981', fontSize: '14px', fontWeight: '500', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>{successMessage}</div>}
                <div className="action-list">
                  <button className="btn-action-outline" onClick={handleChangePassword}>
                    <MdOutlineVpnKey /> Send Password Reset Email
                  </button>
                  <button className="btn-action-outline" onClick={() => onUpdateUser({...user, status: user.status === 'Active' ? 'Suspended' : 'Active'})}>
                    <MdSecurity /> {user.status === 'Active' ? 'Suspend Account' : 'Reactivate Account'}
                  </button>
                  <button className="btn-action-danger" onClick={handleDelete}>
                    <MdDeleteForever /> Delete User Permanently
                  </button>
                </div>
              </div>
            )}
          </div>
        </Motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UserProfileModal;
