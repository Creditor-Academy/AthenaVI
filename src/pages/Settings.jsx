import React, { useState } from 'react';
import { 
  MdNotifications, 
  MdSecurity, 
  MdCreditCard, 
  MdPalette,
  MdHelp
} from 'react-icons/md';
import ThemePage from '../components/settings/ThemePage'; // what user called themepage.jsx
import NotificationSettings from '../components/settings/NotificationSettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import './Settings.css';

const Settings = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('preferences');

  const menuItems = [
    { id: 'preferences', label: 'Appearance', icon: <MdPalette /> },
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
        {activeTab === 'preferences' && <ThemePage />}
        {activeTab === 'notifications' && <NotificationSettings />}
        {activeTab === 'security' && <SecuritySettings />}
        {activeTab === 'billing' && (
           <div className="settings-section">
             <header className="settings-section-header">
               <h3>Billing</h3>
               <p>Manage your subscription and payment methods.</p>
             </header>
             <div className="settings-card">
               <div className="settings-group">
                 <p style={{ color: 'var(--text-muted)' }}>No billing information available.</p>
               </div>
             </div>
           </div>
        )}
      </main>
    </div>
  );
};

export default Settings;
