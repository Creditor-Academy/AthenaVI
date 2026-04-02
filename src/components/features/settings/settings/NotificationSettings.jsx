import React, { useState } from 'react';

const NotificationSettings = () => {
    const [toggles, setToggles] = useState({
      notifications: true,
      emailMarketing: false,
      comments: true,
      digest: false
    });
  
    const handleToggle = (key) => {
      setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
      <div className="settings-section">
        <header className="settings-section-header">
          <h3>Notifications</h3>
          <p>Choose exactly which updates you want and where they should be delivered.</p>
        </header>

        <div className="settings-flow">
          <div className="settings-toggle-row">
            <div className="toggle-info">
              <h4>Push Notifications</h4>
              <p>Instant alerts for video render completion and important workspace activity.</p>
            </div>
            <button
              type="button"
              className={`toggle-switch ${toggles.notifications ? 'active' : ''}`}
              role="switch"
              aria-checked={toggles.notifications}
              onClick={() => handleToggle('notifications')}
            >
              <div className="toggle-knob" />
            </button>
          </div>

          <div className="settings-toggle-row">
            <div className="toggle-info">
              <h4>Comments and Mentions</h4>
              <p>Get notified when teammates comment on your videos or tag you.</p>
            </div>
            <button
              type="button"
              className={`toggle-switch ${toggles.comments ? 'active' : ''}`}
              role="switch"
              aria-checked={toggles.comments}
              onClick={() => handleToggle('comments')}
            >
              <div className="toggle-knob" />
            </button>
          </div>

          <div className="settings-toggle-row">
            <div className="toggle-info">
              <h4>Weekly Digest Email</h4>
              <p>Receive a summary of usage, team activity, and publishing insights.</p>
            </div>
            <button
              type="button"
              className={`toggle-switch ${toggles.digest ? 'active' : ''}`}
              role="switch"
              aria-checked={toggles.digest}
              onClick={() => handleToggle('digest')}
            >
              <div className="toggle-knob" />
            </button>
          </div>

          <div className="settings-toggle-row">
            <div className="toggle-info">
              <h4>Product Emails</h4>
              <p>Feature announcements, tutorials, and occasional launch updates.</p>
            </div>
            <button
              type="button"
              className={`toggle-switch ${toggles.emailMarketing ? 'active' : ''}`}
              role="switch"
              aria-checked={toggles.emailMarketing}
              onClick={() => handleToggle('emailMarketing')}
            >
              <div className="toggle-knob" />
            </button>
          </div>
        </div>
      </div>
    );
};

export default NotificationSettings;
