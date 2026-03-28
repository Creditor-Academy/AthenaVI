import React, { useState } from 'react';

const SecuritySettings = () => {
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <div className="settings-section">
      <header className="settings-section-header">
        <h3>Security</h3>
        <p>Protect your account with advanced security features.</p>
      </header>

      <div className="settings-card">
        <div className="settings-group">
          <div className="settings-field">
            <label>Current Password</label>
            <input type="password" />
          </div>
          <div className="settings-field">
            <label>New Password</label>
            <input type="password" />
          </div>
          
          <div className="appearance-divider" style={{ margin: '8px 0' }} />

          <div className="settings-toggle-row">
            <div className="toggle-info">
              <h4>Two-Factor Authentication</h4>
              <p>Add an extra layer of protection to your account.</p>
            </div>
            <div 
              className={`toggle-switch ${twoFactor ? 'active' : ''}`}
              onClick={() => setTwoFactor(!twoFactor)}
            >
              <div className="toggle-knob" />
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section" style={{ marginTop: '60px' }}>
        <div className="settings-card danger-zone">
          <header className="settings-section-header" style={{ marginBottom: '24px' }}>
            <h3>Danger Zone</h3>
            <p>Permanently delete your account and all associated data.</p>
          </header>
          <button className="btn-premium btn-danger">Delete Account</button>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
