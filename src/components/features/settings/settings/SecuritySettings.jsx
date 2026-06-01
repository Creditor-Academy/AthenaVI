import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import userService from '../../../../services/userService.js';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdWarning, MdInfo, MdCheckCircle, MdError } from 'react-icons/md';

const SecuritySettings = () => {
  const { logoutAll, logout } = useAuth();
  
  // Settings Status State
  const [securityLoading, setSecurityLoading] = useState(true);
  const [canChangePassword, setCanChangePassword] = useState(true);
  const [hasPassword, setHasPassword] = useState(true);
  const [accountDeletion, setAccountDeletion] = useState(null);

  // Form inputs State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Action Feedback States
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Deletion Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Fetch security settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await userService.getSecuritySettings();
        if (data) {
          setCanChangePassword(data.canChangePassword);
          setHasPassword(data.hasPassword);
          setAccountDeletion(data.accountDeletion);
        }
      } catch (error) {
        console.error('Failed to load security settings:', error);
      } finally {
        setSecurityLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      await userService.changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordError(error.message || 'Failed to update password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCancelPasswordChange = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handleLogoutAll = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logoutAll();
      window.location.hash = '#/';
    } catch (error) {
      console.error('Logout all error:', error);
      setIsLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'delete') {
      setDeleteError("Please type 'delete' to confirm.");
      return;
    }

    setDeleteLoading(true);
    setDeleteError('');
    try {
      await userService.deleteAccount('delete');
      // Revoke and clear local auth context, which triggers automatic redirect
      await logout();
    } catch (error) {
      setDeleteError(error.message || 'Failed to delete account. Please try again.');
      setDeleteLoading(false);
    }
  };

  const openDeleteModal = () => {
    setDeleteConfirmationText('');
    setDeleteError('');
    setDeleteLoading(false);
    setShowDeleteModal(true);
  };

  if (securityLoading) {
    return (
      <div className="settings-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-color)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading security settings...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="settings-section">
      <header className="settings-section-header">
        <h3>Security</h3>
        <p>Protect your account with advanced security features.</p>
      </header>

      <div className="settings-flow">
        {/* Account Deletion Pending Alert Banner */}
        {accountDeletion?.pending && (
          <div className="info-zone-panel" style={{ borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
            <MdWarning size={20} style={{ color: '#ef4444', marginTop: '2px', flexShrink: 0 }} />
            <div>
              <h4 style={{ color: '#ef4444' }}>Account Deletion Scheduled</h4>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.4, marginTop: '4px' }}>
                Your account is scheduled for permanent deletion in {accountDeletion.daysRemaining} days (on {new Date(accountDeletion.permanentDeletionAt).toLocaleDateString()}).
                To cancel deletion, please log out and log back in before this date.
              </p>
            </div>
          </div>
        )}

        {/* Change Password Block */}
        {!canChangePassword ? (
          <div className="info-zone-panel">
            <MdInfo size={20} style={{ color: 'var(--primary)', marginTop: '2px', flexShrink: 0 }} />
            <div>
              <h4>Authentication via Google</h4>
              <p>Your account is linked with Google OAuth. Password changes are managed securely through Google. Local password settings are disabled.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword}>
            {passwordError && (
              <div className="settings-alert settings-alert-error">
                <MdError size={18} />
                <span>{passwordError}</span>
              </div>
            )}
            {passwordSuccess && (
              <div className="settings-alert settings-alert-success">
                <MdCheckCircle size={18} />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <div className="security-password-grid">
              <div className="settings-field">
                <label>Current Password</label>
                <input 
                  type="password" 
                  placeholder="Enter current password" 
                  value={currentPassword}
                  onChange={e => {
                    setCurrentPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                    if (passwordSuccess) setPasswordSuccess('');
                  }}
                  disabled={passwordLoading}
                  required
                />
              </div>
              <div className="settings-field">
                <label>New Password</label>
                <input 
                  type="password" 
                  placeholder="Choose a stronger password" 
                  value={newPassword}
                  onChange={e => {
                    setNewPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                    if (passwordSuccess) setPasswordSuccess('');
                  }}
                  disabled={passwordLoading}
                  required
                />
              </div>
              <div className="settings-field">
                <label>Confirm Password</label>
                <input 
                  type="password" 
                  placeholder="Re-enter new password" 
                  value={confirmPassword}
                  onChange={e => {
                    setConfirmPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                    if (passwordSuccess) setPasswordSuccess('');
                  }}
                  disabled={passwordLoading}
                  required
                />
              </div>
            </div>

            <div className="settings-action-bar-inline" style={{ marginTop: '14px' }}>
              <button 
                type="button" 
                className="btn-premium btn-premium-ghost"
                onClick={handleCancelPasswordChange}
                disabled={passwordLoading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-premium btn-premium-primary"
                disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}

        <div className="appearance-divider" />

        {/* Login Alerts Toggle switch */}
        <div className="settings-toggle-row">
          <div className="toggle-info">
            <h4>Login Alerts</h4>
            <p>Send security alerts whenever a new device signs in to your account.</p>
          </div>
          <button
            type="button"
            className={`toggle-switch ${loginAlerts ? 'active' : ''}`}
            role="switch"
            aria-checked={loginAlerts}
            onClick={() => setLoginAlerts(!loginAlerts)}
          >
            <div className="toggle-knob" />
          </button>
        </div>

        {/* Logout from All Devices */}
        <div className="settings-toggle-row">
          <div className="toggle-info">
            <h4>Logout from All Devices</h4>
            <p>Log out of all active sessions across all devices, including this one.</p>
          </div>
          <button
            type="button"
            className="btn-premium btn-premium-ghost"
            onClick={handleLogoutAll}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Logging out...' : 'Logout All'}
          </button>
        </div>

        {/* Danger Zone: Delete Account */}
        <div className="danger-zone-panel">
          <div>
            <h4>Danger Zone</h4>
            <p>Permanently delete your account and all associated videos, workspaces, and history.</p>
          </div>
          <button 
            type="button" 
            className="btn-premium btn-danger"
            onClick={openDeleteModal}
            disabled={accountDeletion?.pending}
          >
            {accountDeletion?.pending ? 'Deletion Scheduled' : 'Delete Account'}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="modal-overlay-wrapper" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2500, padding: '20px' }}>
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(15, 23, 42, 0.4)',
                backdropFilter: 'blur(4px)',
                zIndex: 2500
              }}
            />
            <motion.div
              className="modal-content professional-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--bg-card)',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '500px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                border: '1px solid var(--border-color)',
                zIndex: 2600,
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <button 
                type="button"
                className="icon-btn-close-outside" 
                onClick={() => setShowDeleteModal(false)} 
                title="Close"
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <MdClose size={20} />
              </button>
              
              <div className="modal-header" style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="header-icon-container" style={{ background: '#fef2f2', color: '#ef4444', borderRadius: '12px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MdWarning size={24} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>Delete Account</h2>
                  <p className="modal-subtitle" style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>This action schedules your account for deletion.</p>
                </div>
              </div>

              <div className="modal-body-premium" style={{ padding: '24px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: 1.5, marginBottom: '12px' }}>
                  Your account, owned workspaces, projects, and assets will be scheduled for permanent deletion in <strong>7 days</strong>.
                </p>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
                  All active sessions will be revoked and you will be logged out immediately. You can restore your account at any time by signing back in before the 7-day period expires.
                </p>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                    Type <strong>delete</strong> to confirm:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmationText}
                    onChange={e => {
                      setDeleteConfirmationText(e.target.value);
                      if (deleteError) setDeleteError('');
                    }}
                    placeholder="Type delete"
                    className="form-input-premium"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '2px solid var(--border-color)',
                      background: 'var(--bg-surface)',
                      color: 'var(--text-main)',
                      outline: 'none',
                      fontSize: '14px'
                    }}
                    disabled={deleteLoading}
                    autoFocus
                  />
                  {deleteError && (
                    <span className="error-message-modal" style={{ display: 'block', fontSize: '12px', color: '#ef4444', marginTop: '6px', fontWeight: 600 }}>
                      {deleteError}
                    </span>
                  )}
                </div>

                <div className="modal-footer-premium" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                  <button
                    type="button"
                    className="btn-secondary-premium"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={deleteLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-premium btn-danger"
                    disabled={deleteConfirmationText !== 'delete' || deleteLoading}
                    onClick={handleDeleteAccount}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '12px',
                      border: 'none',
                      background: deleteConfirmationText === 'delete' ? '#ef4444' : 'color-mix(in srgb, #ef4444 50%, transparent)',
                      color: '#ffffff',
                      cursor: deleteConfirmationText === 'delete' && !deleteLoading ? 'pointer' : 'not-allowed',
                      fontWeight: 700
                    }}
                  >
                    {deleteLoading ? 'Processing...' : 'Request Deletion'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SecuritySettings;
