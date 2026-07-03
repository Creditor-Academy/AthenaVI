import { useEffect, useState } from 'react'
import { MdHelpOutline } from 'react-icons/md'
import { adminPortalSidebarGroups } from '../../../constants/adminPortalNav'
import superadminService from '../../../services/superadminService'

function AdminPortalSidebar({ activeTab, onTabChange, onNavigateHelp, onCloseMobile }) {
  const [alertCounts, setAlertCounts] = useState({})

  useEffect(() => {
    let cancelled = false
    superadminService.getAlertsSummary()
      .then(data => { if (!cancelled) setAlertCounts(data || {}) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const handleTab = (tabId) => {
    onTabChange?.(tabId)
    onCloseMobile?.()
  }

  return (
    <aside className="dashboard-sidebar-nav" aria-label="Admin portal navigation">
      <div className="dashboard-sidebar-nav-scroll">
        {adminPortalSidebarGroups.map((group, gi) => (
          <div key={gi} className="dashboard-sidebar-group">
            {group.label && (
              <div className="dashboard-sidebar-section-label">{group.label}</div>
            )}
            {group.items.map((item) => {
              const Icon = item.Icon
              const active = activeTab === item.id
              const badgeCount = item.badgeKey ? (alertCounts[item.badgeKey] ?? 0) : 0
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`dashboard-nav-item ${active ? 'dashboard-nav-item--active' : ''}`}
                  onClick={() => handleTab(item.id)}
                >
                  <Icon className="dashboard-nav-item-icon" size={16} strokeWidth={1.75} aria-hidden />
                  <span className="dashboard-nav-item-label">{item.label}</span>
                  {badgeCount > 0 && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      minWidth: 18, height: 18, padding: '0 5px', borderRadius: 999,
                      background: 'color-mix(in srgb, #f59e0b 20%, transparent)',
                      border: '1px solid color-mix(in srgb, #f59e0b 40%, var(--border-color))',
                      color: '#f59e0b', fontSize: '0.65rem', fontWeight: 700, marginLeft: 'auto',
                    }}>
                      {badgeCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <div className="dashboard-sidebar-footer">
        <button
          type="button"
          className="dashboard-nav-item dashboard-sidebar-help"
          onClick={() => {
            onNavigateHelp?.()
            onCloseMobile?.()
          }}
          aria-label="Help"
        >
          <MdHelpOutline className="dashboard-nav-item-icon dashboard-sidebar-help-icon" size={18} aria-hidden />
          <span className="dashboard-nav-item-label">Help</span>
        </button>
      </div>
    </aside>
  )
}

export default AdminPortalSidebar
