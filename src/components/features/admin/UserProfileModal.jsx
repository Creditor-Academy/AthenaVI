import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdSecurity, MdAttachMoney, MdOutlineVpnKey, MdDeleteForever } from 'react-icons/md';
import './UserProfileModal.css';

const UserProfileModal = ({ user, onClose, onUpdateUser, onDeleteUser }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [creditsToAdd, setCreditsToAdd] = useState(0);

  if (!user) return null;

  const handleAddCredits = () => {
    if (creditsToAdd !== 0) {
      onUpdateUser({ ...user, credits: user.credits + parseInt(creditsToAdd) });
      setCreditsToAdd(0);
      alert(`Successfully added ${creditsToAdd} credits.`);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to permanently delete ${user.name}? This cannot be undone.`)) {
      onDeleteUser(user.id);
    }
  };

  const handleChangePassword = () => {
    alert(`Password reset link sent to ${user.email}`);
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
            </div>
            <span className={`status-badge ${user.status === 'Active' ? 'status-active' : 'status-suspended'}`}>
              {user.status}
            </span>
          </div>

          <div className="modal-tabs">
            <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
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
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="modal-section">
                <h3>Account Actions</h3>
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
