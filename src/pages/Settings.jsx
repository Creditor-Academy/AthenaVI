import React, { useState } from 'react';
import { 
  MdSettings, 
  MdPerson, 
  MdNotifications, 
  MdSecurity, 
  MdCreditCard, 
  MdPalette,
  MdHelp,
  MdCloudUpload,
  MdSave
} from 'react-icons/md';
import './Settings.css';

const Settings = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('account');
  const [toggles, setToggles] = useState({
    notifications: true,
    emailMarketing: false,
    autoSave: true,
    twoFactor: false
  });

  const handleToggle = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const menuItems = [
    { id: 'account', label: 'Account', icon: <MdPerson /> },
    { id: 'preferences', label: 'Preferences', icon: <MdPalette /> },
    { id: 'notifications', label: 'Notifications', icon: <MdNotifications /> },
    { id: 'security', label: 'Security', icon: <MdSecurity /> },
    { id: 'billing', label: 'Billing', icon: <MdCreditCard /> },
  ];

  return (
    <div className="settings-container">
      <aside className="settings-sidebar">
        <h2>Settings</h2>
        <nav>
          {menuItems.map(item => (
            <div 
              key={item.id}
              className={`settings-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              {item.label}
            </div>
          ))}
        </nav>
        
        <div style={{ marginTop: 'auto', padding: '12px' }}>
          <div className="settings-nav-item">
            <MdHelp />
            Help Center
          </div>
        </div>
      </aside>

      <main className="settings-main">
        {activeTab === 'account' && (
          <div className="settings-section">
            <header className="settings-section-header">
              <h3>Account Settings</h3>
              <p>Manage your profile information and account details.</p>
            </header>

            <div className="settings-card">
              <div className="settings-group">
                <div style={{ display: 'flex', gap: '32px', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ 
                    width: '100px', 
                    height: '100px', 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '40px',
                    color: 'white',
                    fontWeight: '800'
                  }}>
                    A
                  </div>
                  <button className="btn-premium btn-premium-ghost">
                    <MdCloudUpload /> Change Avatar
                  </button>
                </div>

                <div className="settings-field">
                  <label>Full Name</label>
                  <input type="text" placeholder="Alex Thompson" />
                </div>

                <div className="settings-field">
                  <label>Email Address</label>
                  <input type="email" placeholder="alex@athenavi.ai" />
                </div>

                <div className="settings-field">
                  <label>Bio</label>
                  <textarea rows="3" placeholder="I create cinematic educational content with AI instructors." />
                </div>
              </div>
            </div>

            <div className="settings-action-bar">
              <button className="btn-premium btn-premium-ghost">Discard Changes</button>
              <button className="btn-premium btn-premium-primary">
                <MdSave /> Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="settings-section">
            <header className="settings-section-header">
              <h3>Notifications</h3>
              <p>Control how and when you receive updates.</p>
            </header>

            <div className="settings-card">
              <div className="settings-group">
                <div className="settings-toggle-row">
                  <div className="toggle-info">
                    <h4>Push Notifications</h4>
                    <p>Receive live updates on project rendering and status.</p>
                  </div>
                  <div 
                    className={`toggle-switch ${toggles.notifications ? 'active' : ''}`}
                    onClick={() => handleToggle('notifications')}
                  >
                    <div className="toggle-knob" />
                  </div>
                </div>

                <div className="settings-toggle-row">
                  <div className="toggle-info">
                    <h4>Email Marketing</h4>
                    <p>Stay updated with our latest features and instructor drops.</p>
                  </div>
                  <div 
                    className={`toggle-switch ${toggles.emailMarketing ? 'active' : ''}`}
                    onClick={() => handleToggle('emailMarketing')}
                  >
                    <div className="toggle-knob" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
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
                
                <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '8px 0' }} />

                <div className="settings-toggle-row">
                  <div className="toggle-info">
                    <h4>Two-Factor Authentication</h4>
                    <p>Add an extra layer of protection to your account.</p>
                  </div>
                  <div 
                    className={`toggle-switch ${toggles.twoFactor ? 'active' : ''}`}
                    onClick={() => handleToggle('twoFactor')}
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
        )}
      </main>
    </div>
  );
};

export default Settings;
