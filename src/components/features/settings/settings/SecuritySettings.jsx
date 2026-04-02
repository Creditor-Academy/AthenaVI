import React, { useState } from 'react';

const SecuritySettings = () => {
  const [twoFactor, setTwoFactor] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);

  return (
    <div className="settings-section">
      <header className="settings-section-header">
        <h3>Security</h3>
        <p>Protect your account with advanced security features.</p>
      </header>

      <div className="settings-flow">
        <div className="security-password-grid">
          <div className="settings-field">
            <label>Current Password</label>
            <input type="password" placeholder="Enter current password" />
          </div>
          <div className="settings-field">
            <label>New Password</label>
            <input type="password" placeholder="Choose a stronger password" />
          </div>
          <div className="settings-field">
            <label>Confirm Password</label>
            <input type="password" placeholder="Re-enter new password" />
          </div>
        </div>

        <div className="settings-action-bar-inline">
          <button className="btn-premium btn-premium-ghost">Cancel</button>
          <button className="btn-premium btn-premium-primary">Update Password</button>
        </div>

        <div className="appearance-divider" />

        <div className="settings-toggle-row">
          <div className="toggle-info">
            <h4>Two-Factor Authentication</h4>
            <p>Add an extra layer of sign-in protection with authenticator app verification.</p>
          </div>
          <button
            type="button"
            className={`toggle-switch ${twoFactor ? 'active' : ''}`}
            role="switch"
            aria-checked={twoFactor}
            onClick={() => setTwoFactor(!twoFactor)}
          >
            <div className="toggle-knob" />
          </button>
        </div>

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

        <div className="danger-zone-panel">
          <div>
            <h4>Danger Zone</h4>
            <p>Permanently delete your account and all associated videos, workspaces, and history.</p>
          </div>
          <button className="btn-premium btn-danger">Delete Account</button>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
