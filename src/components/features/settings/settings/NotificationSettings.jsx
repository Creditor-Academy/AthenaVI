import React, { useState } from 'react';

const NotificationSettings = () => {
    const [toggles, setToggles] = useState({
      notifications: true,
      emailMarketing: false
    });
  
    const handleToggle = (key) => {
      setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
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
    );
};

export default NotificationSettings;
