import React, { useState, useEffect } from 'react';
import userService from '../../../../services/userService';

const NotificationSettings = () => {
    const [toggles, setToggles] = useState({
      pushNotifications: true,
      commentsAndMentions: true,
      weeklyDigestEmail: false,
      productEmails: false
    });
    const [loading, setLoading] = useState(true);

    // Fetch notification settings on mount
    useEffect(() => {
      const fetchSettings = async () => {
        try {
          const settings = await userService.getNotificationSettings();
          if (settings) {
            setToggles(settings);
          }
        } catch (error) {
          console.error('Failed to fetch notification settings:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchSettings();
    }, []);

    const handleToggle = async (key) => {
      const newValue = !toggles[key];
      setToggles(prev => ({ ...prev, [key]: newValue }));

      try {
        await userService.updateNotificationSettings({ [key]: newValue });
      } catch (error) {
        console.error('Failed to update notification settings:', error);
        // Revert on error
        setToggles(prev => ({ ...prev, [key]: !newValue }));
      }
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
              className={`toggle-switch ${toggles.pushNotifications ? 'active' : ''}`}
              role="switch"
              aria-checked={toggles.pushNotifications}
              onClick={() => handleToggle('pushNotifications')}
              disabled={loading}
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
              className={`toggle-switch ${toggles.commentsAndMentions ? 'active' : ''}`}
              role="switch"
              aria-checked={toggles.commentsAndMentions}
              onClick={() => handleToggle('commentsAndMentions')}
              disabled={loading}
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
              className={`toggle-switch ${toggles.weeklyDigestEmail ? 'active' : ''}`}
              role="switch"
              aria-checked={toggles.weeklyDigestEmail}
              onClick={() => handleToggle('weeklyDigestEmail')}
              disabled={loading}
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
              className={`toggle-switch ${toggles.productEmails ? 'active' : ''}`}
              role="switch"
              aria-checked={toggles.productEmails}
              onClick={() => handleToggle('productEmails')}
              disabled={loading}
            >
              <div className="toggle-knob" />
            </button>
          </div>
        </div>
      </div>
    );
};

export default NotificationSettings;
