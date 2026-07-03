import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import userService from '../../../../services/userService';

const DEFAULT_NOTIFICATION_SETTINGS = {
  pushNotifications: true,
  commentsAndMentions: true,
  weeklyDigestEmail: false,
  productEmails: false,
  videoExportAlerts: true,
  workspaceVideoExportAlerts: true,
  creditsAlerts: true,
  storageAlerts: true,
  workspaceTeamAlerts: true,
  platformAdminAlerts: true,
};

const IN_APP_SETTING_KEYS = new Set([
  'commentsAndMentions',
  'videoExportAlerts',
  'workspaceVideoExportAlerts',
  'creditsAlerts',
  'storageAlerts',
  'workspaceTeamAlerts',
  'platformAdminAlerts',
]);

const NOTIFICATION_SECTIONS = [
  {
    title: 'In-app',
    description: 'Turn each alert type on or off. Disable the master switch to stop all in-app notifications.',
    items: [
      {
        key: 'pushNotifications',
        title: 'Push Notifications',
        description: 'Master switch for in-app notifications.',
      },
      {
        key: 'commentsAndMentions',
        title: 'Comments and Mentions',
        description: 'Teammate comments and @mentions.',
      },
    ],
  },
  {
    title: 'Email',
    description: 'Choose which updates arrive in your inbox.',
    items: [
      {
        key: 'weeklyDigestEmail',
        title: 'Weekly Digest Email',
        description: 'Weekly usage and activity summary email.',
      },
      {
        key: 'productEmails',
        title: 'Product Emails',
        description: 'Feature announcements and product updates.',
      },
    ],
  },
  {
    title: 'Exports and usage',
    description: 'Alerts for renders, credits, and storage.',
    items: [
      {
        key: 'videoExportAlerts',
        title: 'Video Export Alerts',
        description: 'Final Remotion export complete or failed (your exports).',
      },
      {
        key: 'workspaceVideoExportAlerts',
        title: 'Workspace Video Export Alerts',
        description: 'Teammate final exports (workspace owners and admins).',
      },
      {
        key: 'creditsAlerts',
        title: 'Credits Alerts',
        description: 'Credit grants, revokes, and low balance warnings.',
      },
      {
        key: 'storageAlerts',
        title: 'Storage Alerts',
        description: 'Storage quota warnings and upload blocked notices.',
      },
    ],
  },
  {
    title: 'Workspace',
    description: 'Team membership and collaboration updates.',
    items: [
      {
        key: 'workspaceTeamAlerts',
        title: 'Workspace Team Alerts',
        description: 'Invitations, members joined or removed, and role changes.',
      },
    ],
  },
  {
    title: 'Platform',
    description: 'Superadmin portal alerts.',
    superadminOnly: true,
    items: [
      {
        key: 'platformAdminAlerts',
        title: 'Platform Admin Alerts',
        description: 'Platform alerts for the superadmin portal.',
      },
    ],
  },
];

const NotificationToggle = ({
  title,
  description,
  checked,
  disabled,
  blockedReason,
  onToggle,
}) => (
  <div className={`settings-toggle-row${disabled && blockedReason ? ' settings-toggle-row--blocked' : ''}`}>
    <div className="toggle-info">
      <h4>{title}</h4>
      <p>{description}</p>
      {blockedReason && <p className="toggle-blocked-note">{blockedReason}</p>}
    </div>
    <div className="toggle-control">
      <span className={`toggle-status ${checked ? 'toggle-status--on' : 'toggle-status--off'}`}>
        {checked ? 'On' : 'Off'}
      </span>
      <button
        type="button"
        className={`toggle-switch ${checked ? 'active' : ''}`}
        role="switch"
        aria-checked={checked}
        aria-label={`${title}: ${checked ? 'on' : 'off'}`}
        onClick={onToggle}
        disabled={disabled}
      >
        <div className="toggle-knob" />
      </button>
    </div>
  </div>
);

const NotificationSettings = () => {
  const { canAccessSuperadminPortal } = useAuth();
  const [toggles, setToggles] = useState(DEFAULT_NOTIFICATION_SETTINGS);
  const [loading, setLoading] = useState(true);

  const visibleSections = useMemo(
    () =>
      NOTIFICATION_SECTIONS.filter(
        (section) => !section.superadminOnly || canAccessSuperadminPortal
      ),
    [canAccessSuperadminPortal]
  );

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await userService.getNotificationSettings();
        if (settings) {
          setToggles((prev) => ({ ...prev, ...settings }));
        }
      } catch (error) {
        console.error('Failed to fetch notification settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const pushEnabled = Boolean(toggles.pushNotifications);

  const isToggleDisabled = (key) => {
    if (loading) return true;
    if (IN_APP_SETTING_KEYS.has(key) && !pushEnabled) return true;
    return false;
  };

  const getBlockedReason = (key) => {
    if (IN_APP_SETTING_KEYS.has(key) && !pushEnabled) {
      return 'Turn on Push Notifications above to control this alert.';
    }
    return null;
  };

  const handleToggle = async (key) => {
    if (isToggleDisabled(key)) return;

    const newValue = !toggles[key];
    setToggles((prev) => ({ ...prev, [key]: newValue }));

    try {
      const updated = await userService.updateNotificationSettings({ [key]: newValue });
      if (updated) {
        setToggles((prev) => ({ ...prev, ...updated }));
      }
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      setToggles((prev) => ({ ...prev, [key]: !newValue }));
    }
  };

  return (
    <div className="settings-section">
      <header className="settings-section-header">
        <h3>Notifications</h3>
        <p>Each notification type can be turned on or off individually. Changes save automatically.</p>
      </header>

      <div className="settings-flow">
        {visibleSections.map((section) => (
          <div key={section.title} className="appearance-block">
            <header className="block-header">
              <div>
                <h4>{section.title}</h4>
                <p>{section.description}</p>
              </div>
            </header>

            {section.items.map((item) => (
              <NotificationToggle
                key={item.key}
                title={item.title}
                description={item.description}
                checked={Boolean(toggles[item.key])}
                disabled={isToggleDisabled(item.key)}
                blockedReason={getBlockedReason(item.key)}
                onToggle={() => handleToggle(item.key)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationSettings;
