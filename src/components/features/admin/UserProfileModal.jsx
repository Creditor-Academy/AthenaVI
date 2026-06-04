import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdSecurity, MdAttachMoney, MdOutlineVpnKey, MdDeleteForever, MdOutlineFolderShared, MdAdd, MdRemoveCircleOutline } from 'react-icons/md';
import './UserProfileModal.css';

const roleOptions = ['Owner', 'Admin', 'Editor', 'Viewer', 'Super Admin', 'Workspace Admin', 'Member'];
const workspaceOptions = ['Global', 'Forge Studio', 'Pulse CRM', 'Beacon Media', 'Astra Ventures'];
const statusOptions = ['Active', 'Suspended', 'Deactivated'];

const UserProfileModal = ({ user, onClose, onUpdateUser, onDeleteUser }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [creditAmount, setCreditAmount] = useState('');
  const [creditOperation, setCreditOperation] = useState('add');
  const [editableUser, setEditableUser] = useState(user);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setEditableUser(user);
    setCreditAmount('');
    setCreditOperation('add');
    setSuccessMessage('');
    setErrorMessage('');
    setNewWsName('');
    setNewWsRole('Member');
  }, [user]);

  // Workspace management state
  const availableRoles = ['Owner', 'Admin', 'Editor', 'Viewer', 'Member', 'Workspace Admin'];
  const [newWsName, setNewWsName] = useState('');
  const [newWsRole, setNewWsRole] = useState('Member');

  const userWorkspaces = editableUser?.workspaces || (editableUser?.workspace ? [{ name: editableUser.workspace, role: editableUser.role }] : []);

  const handleAddWorkspace = () => {
    if (!newWsName) return;
    if (userWorkspaces.some(ws => ws.name === newWsName)) {
      setSuccessMessage(`User is already in "${newWsName}".`);
      setTimeout(() => setSuccessMessage(''), 3000);
      return;
    }
    const updated = [...userWorkspaces, { name: newWsName, role: newWsRole }];
    const updatedUser = { ...editableUser, workspaces: updated };
    setEditableUser(updatedUser);
    onUpdateUser(updatedUser);
    setNewWsName('');
    setNewWsRole('Member');
    setSuccessMessage(`Added to "${newWsName}" as ${newWsRole}.`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleRemoveWorkspace = (wsName) => {
    const updated = userWorkspaces.filter(ws => ws.name !== wsName);
    const updatedUser = { ...editableUser, workspaces: updated };
    setEditableUser(updatedUser);
    onUpdateUser(updatedUser);
    setSuccessMessage(`Removed from "${wsName}".`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleChangeWsRole = (wsName, newRole) => {
    const updated = userWorkspaces.map(ws => ws.name === wsName ? { ...ws, role: newRole } : ws);
    const updatedUser = { ...editableUser, workspaces: updated };
    setEditableUser(updatedUser);
    onUpdateUser(updatedUser);
  };

  if (!user) return null;

  const handleFieldChange = (field) => (event) => {
    const value = event.target.value;
    setEditableUser({ ...editableUser, [field]: field === 'credits' ? Number(value) : value });
  };

  const handleSave = () => {
    onUpdateUser(editableUser);
    setSuccessMessage('User profile updated successfully.');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCreditAmountChange = (e) => {
    let val = e.target.value;
    val = val.replace(/[^0-9]/g, '');
    if (val === '') {
      setCreditAmount('');
      return;
    }
    
    let num = Number(val);
    if (creditOperation === 'deduct' && num > editableUser.credits) {
      num = editableUser.credits;
    }
    setCreditAmount(num.toString());
  };

  const handleOperationChange = (e) => {
    const op = e.target.value;
    setCreditOperation(op);
    if (op === 'deduct' && Number(creditAmount) > editableUser.credits) {
      setCreditAmount(editableUser.credits.toString());
    }
  };

  const handleApplyCredits = () => {
    const amount = Number(creditAmount);
    if (amount > 0) {
      const finalAmount = creditOperation === 'add' ? amount : -amount;
      
      onUpdateUser({ ...editableUser, credits: editableUser.credits + finalAmount });
      setSuccessMessage(`Successfully ${creditOperation === 'add' ? 'added' : 'deducted'} ${amount} credits.`);
      setErrorMessage('');
      setCreditAmount('');
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
          className="modal-content slide-panel"
          initial={{ opacity: 0, x: 460 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 460 }}
          transition={{ type: 'tween', duration: 0.24 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close" onClick={onClose}><MdClose /></button>

          <div className="modal-header">
            <div className="modal-header-top">
              <div className="user-avatar-large">{user.name.charAt(0)}</div>
              <div className="user-info">
                <h2 style={{ margin: 0 }}>{editableUser.name}</h2>
                <div className="user-info-row">
                  <p className="modal-subtitle">{editableUser.email}</p>
                  <span className={`status-badge ${editableUser.status === 'Active' ? 'status-active' : 'status-suspended'}`}>
                    {editableUser.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-tabs">
            <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
            <button className={activeTab === 'workspaces' ? 'active' : ''} onClick={() => setActiveTab('workspaces')}>
              <MdOutlineFolderShared size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Workspaces
              <span className="ws-count-badge">{userWorkspaces.length}</span>
            </button>
            <button className={activeTab === 'credits' ? 'active' : ''} onClick={() => setActiveTab('credits')}>Credits & Billing</button>
            <button className={activeTab === 'security' ? 'active' : ''} onClick={() => setActiveTab('security')}>Security</button>
          </div>

          <div className="modal-body">
            {activeTab === 'overview' && (
              <div className="modal-section">
                <h3>User profile</h3>
                {successMessage && <div className="success-message" style={{ marginBottom: '16px', color: '#10b981', fontSize: '14px', fontWeight: '500', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>{successMessage}</div>}
                <div className="profile-fields">
                  <div className="field-row">
                    <div className="field-group">
                      <label>Name</label>
                      <input className="modal-input" value={editableUser.name} onChange={handleFieldChange('name')} />
                    </div>
                    <div className="field-group">
                      <label>Email</label>
                      <input className="modal-input" value={editableUser.email} onChange={handleFieldChange('email')} />
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field-group">
                      <label>Role</label>
                      <select className="modal-input" value={editableUser.role} onChange={handleFieldChange('role')}>
                        {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
                      </select>
                    </div>
                    <div className="field-group">
                      <label>Workspace</label>
                      <select className="modal-input" value={editableUser.workspace} onChange={handleFieldChange('workspace')}>
                        {workspaceOptions.map((workspace) => <option key={workspace} value={workspace}>{workspace}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field-group">
                      <label>Plan</label>
                      <select className="modal-input" value={editableUser.plan} onChange={handleFieldChange('plan')}>
                        {['Free', 'Pro', 'Enterprise'].map((plan) => <option key={plan} value={plan}>{plan}</option>)}
                      </select>
                    </div>
                    <div className="field-group">
                      <label>Status</label>
                      <select className="modal-input" value={editableUser.status} onChange={handleFieldChange('status')}>
                        {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '22px' }}>
                  <button className="btn-primary" onClick={handleSave}>Save changes</button>
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
                      {workspaceOptions
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
                  <span className="balance-text">{editableUser.credits.toLocaleString()} Credits Available</span>
                </div>

                <div className="credit-actions-container">
                  <div className="credit-action-card credit-grant">
                    <div className="credit-action-header">
                      <MdAttachMoney size={20} color="#10b981" />
                      <span>Grant Credits</span>
                    </div>
                    <div className="credit-action-inputs">
                      <input
                        type="text"
                        value={creditOperation === 'add' ? creditAmount : ''}
                        onChange={(e) => {
                          setCreditOperation('add');
                          handleCreditAmountChange(e);
                        }}
                        placeholder="Amount (e.g. 500)"
                        className="modal-input"
                      />
                      <button className="btn-grant" onClick={() => creditOperation === 'add' && handleApplyCredits()}>Grant</button>
                    </div>
                  </div>

                  <div className="credit-action-card credit-revoke">
                    <div className="credit-action-header">
                      <MdAttachMoney size={20} color="#ef4444" />
                      <span>Revoke Credits</span>
                    </div>
                    <div className="credit-action-inputs">
                      <input
                        type="text"
                        value={creditOperation === 'deduct' ? creditAmount : ''}
                        onChange={(e) => {
                          setCreditOperation('deduct');
                          handleCreditAmountChange(e);
                        }}
                        placeholder="Amount (e.g. 500)"
                        className="modal-input"
                      />
                      <button className="btn-revoke" onClick={() => creditOperation === 'deduct' && handleApplyCredits()}>Revoke</button>
                    </div>
                  </div>
                </div>
                {errorMessage && <div className="error-message" style={{ marginTop: '12px', color: '#ef4444', fontSize: '14px', fontWeight: '500' }}>{errorMessage}</div>}
                {successMessage && <div className="success-message" style={{ marginTop: '12px', color: '#10b981', fontSize: '14px', fontWeight: '500' }}>{successMessage}</div>}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="modal-section">
                <h3>Account actions</h3>
                {successMessage && <div className="success-message" style={{ marginBottom: '16px', color: '#10b981', fontSize: '14px', fontWeight: '500', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>{successMessage}</div>}
                <div className="action-list">
                  <button className="btn-action-outline" onClick={handleChangePassword}>
                    <MdOutlineVpnKey /> Send Password Reset Email
                  </button>
                  <button className="btn-action-outline" onClick={() => onUpdateUser({ ...editableUser, status: editableUser.status === 'Active' ? 'Suspended' : 'Active' })}>
                    <MdSecurity /> {editableUser.status === 'Active' ? 'Suspend Account' : 'Reactivate Account'}
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
