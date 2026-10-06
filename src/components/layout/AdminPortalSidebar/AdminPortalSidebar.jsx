import { useEffect, useState } from 'react'
import { MdHelpOutline } from 'react-icons/md'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { adminPortalSidebarGroups } from '../../../constants/adminPortalNav'
import superadminService from '../../../services/superadminService'

function AdminPortalSidebar({
  activeTab,
  onTabChange,
  onNavigateHelp,
  onCloseMobile,
  collapsed = false,
  onToggleCollapse,
}) {
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
        {onToggleCollapse && collapsed && (
          <button
            type="button"
            className="dashboard-nav-item dashboard-sidebar-collapse-btn"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <PanelLeftOpen className="dashboard-nav-item-icon" size={16} strokeWidth={1.75} aria-hidden />
          </button>
        )}
        {adminPortalSidebarGroups.map((group, gi) => (
          <div key={gi} className="dashboard-sidebar-group">
            {group.label && (
              <div className="dashboard-sidebar-section-label">{group.label}</div>
            )}
            {group.items.map((item) => {
              const Icon = item.Icon
              const active = activeTab === item.id
              const badgeCount = item.badgeKey ? (alertCounts[item.badgeKey] ?? 0) : 0
              const showOverviewCollapse = item.id === 'overview' && onToggleCollapse && !collapsed

              return (
                <div
                  key={item.id}
                  className={showOverviewCollapse ? 'dashboard-sidebar-home-row' : undefined}
                >
                  <button
                    type="button"
                    className={`dashboard-nav-item ${active ? 'dashboard-nav-item--active' : ''}`}
                    onClick={() => handleTab(item.id)}
                  >
                    <Icon className="dashboard-nav-item-icon" size={16} strokeWidth={1.75} aria-hidden />
                    <span className="dashboard-nav-item-label">{item.label}</span>
                    {badgeCount > 0 && (
                      <span
                        className="dashboard-nav-item-badge"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: 18,
                          height: 18,
                          padding: '0 5px',
                          borderRadius: 999,
                          background: 'color-mix(in srgb, var(--primary) 18%, transparent)',
                          border: '1px solid color-mix(in srgb, var(--primary) 45%, var(--border-color))',
                          color: 'var(--primary)',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          marginLeft: 'auto',
                        }}
                      >
                        {badgeCount}
                      </span>
                    )}
                  </button>
                  {showOverviewCollapse && (
                    <button
                      type="button"
                      className="dashboard-sidebar-collapse-icon-btn"
                      onClick={onToggleCollapse}
                      aria-label="Collapse sidebar"
                      title="Collapse sidebar"
                    >
                      <PanelLeftClose size={16} strokeWidth={1.75} aria-hidden />
                    </button>
                  )}
                </div>
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

