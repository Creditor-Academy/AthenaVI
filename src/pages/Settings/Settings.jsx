import React, { useState, useEffect, useCallback } from 'react'
import {
  MdNotifications,
  MdSecurity,
  MdCreditCard,
  MdPalette
} from 'react-icons/md'
import ThemePage from '../../components/features/settings/settings/ThemePage'
import NotificationSettings from '../../components/features/settings/settings/NotificationSettings'
import SecuritySettings from '../../components/features/settings/settings/SecuritySettings'
import BillingSettings from '../../components/features/settings/settings/BillingSettings'
import { consumeDashboardSearchContext } from '../../utils/dashboardSearchNavigate.js'
import {
  isValidSettingsTab,
  resolveSettingsTabFromSearch,
  syncSettingsTabInUrl,
} from '../../utils/dashboardRouting.js'
import './Settings.css'

const Settings = ({ onBack, initialTab = 'preferences' }) => {
  const [activeTab, setActiveTab] = useState(() => {
    const fromUrl = resolveSettingsTabFromSearch()
    if (fromUrl !== 'preferences') return fromUrl
    return isValidSettingsTab(initialTab) ? initialTab : 'preferences'
  })

  const selectTab = useCallback((tabId) => {
    if (!isValidSettingsTab(tabId)) return
    setActiveTab(tabId)
    syncSettingsTabInUrl(tabId)
  }, [])

  // Deep-link / search context can override the tab once on mount.
  useEffect(() => {
    const ctx = consumeDashboardSearchContext('settings')
    if (ctx?.settingsTab && isValidSettingsTab(ctx.settingsTab)) {
      selectTab(ctx.settingsTab)
    }
  }, [selectTab])

  // Parent-driven navigation (inbox, search, credits → billing).
  useEffect(() => {
    if (!isValidSettingsTab(initialTab)) return
    setActiveTab(initialTab)
    syncSettingsTabInUrl(initialTab)
  }, [initialTab])

  // Keep URL in sync on first paint when opened via refresh with ?tab=.
  useEffect(() => {
    syncSettingsTabInUrl(activeTab)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on mount
  }, [])

  const menuItems = [
    { id: 'preferences', label: 'Appearance', icon: <MdPalette /> },
    { id: 'notifications', label: 'Notifications', icon: <MdNotifications /> },
    { id: 'security', label: 'Security', icon: <MdSecurity /> },
    { id: 'billing', label: 'Billing', icon: <MdCreditCard /> }
  ]

  return (
    <div className="settings-page">
      <div className="settings-shell">
        <header className="settings-page-header">
          <h1 className="settings-page-title">Settings</h1>
        </header>

        <div className="settings-tab-switch" role="tablist" aria-label="Settings sections">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`settings-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => selectTab(item.id)}
              >
                <span className="settings-tab-icon" aria-hidden>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>

        <main className="settings-main">
        {activeTab === 'preferences' && <ThemePage />}
        {activeTab === 'notifications' && <NotificationSettings />}
        {activeTab === 'security' && <SecuritySettings />}
        {activeTab === 'billing' && <BillingSettings />}
        </main>
      </div>
    </div>
  )
}

export default Settings
