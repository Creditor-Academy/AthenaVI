import { MdHelpOutline } from 'react-icons/md'
import { dashboardSidebarGroups } from '../../../constants/dashboardNav'

const STORAGE_USED_GB = 0.82
const STORAGE_LIMIT_GB = 2.0

function isNavActive(section, itemId) {
  if (itemId === '__translate__' || itemId === '__ai__') return false
  if (itemId === 'templates' && section === 'template-details') return true
  return section === itemId
}

function DashboardSidebar({
  section,
  onNavigate,
  onOpenTranslate,
  onOpenAI,
  onCloseMobile
}) {
  const handleItem = (item) => {
    if (item.id === '__translate__') {
      onOpenTranslate?.()
      onCloseMobile?.()
      return
    }
    if (item.id === '__ai__') {
      onOpenAI?.()
      onCloseMobile?.()
      return
    }
    onNavigate(item.id)
    onCloseMobile?.()
  }

  const storagePct = Math.round((STORAGE_USED_GB / STORAGE_LIMIT_GB) * 100)

  return (
    <aside className="dashboard-sidebar-nav" aria-label="Dashboard navigation">
      <div className="dashboard-sidebar-nav-scroll">
        {dashboardSidebarGroups.map((group, gi) => (
          <div key={gi} className="dashboard-sidebar-group">
            {group.label && (
              <div className="dashboard-sidebar-section-label">{group.label}</div>
            )}
            {group.items.map((item) => {
              const Icon = item.Icon
              const active = isNavActive(section, item.id)
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`dashboard-nav-item ${active ? 'dashboard-nav-item--active' : ''}`}
                  onClick={() => handleItem(item)}
                >
                  <Icon className="dashboard-nav-item-icon" size={16} strokeWidth={1.75} aria-hidden />
                  <span className="dashboard-nav-item-label">{item.label}</span>
                  {item.badge && (
                    <span className="dashboard-nav-item-badge">{item.badge}</span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <div className="dashboard-sidebar-footer">
        <div className="dashboard-sidebar-storage" aria-label="Storage usage">
          <div className="dashboard-storage-label">
            <span>Storage used</span>
            <span>{storagePct}%</span>
          </div>
          <div className="dashboard-storage-bar">
            <div
              className="dashboard-storage-progress"
              style={{ width: `${storagePct}%` }}
            />
          </div>
          <div className="dashboard-storage-text">
            {STORAGE_USED_GB} GB of {STORAGE_LIMIT_GB} GB used
          </div>
          <button
            type="button"
            className="dashboard-storage-upgrade-btn"
            onClick={() => {
              onNavigate('credits')
              onCloseMobile?.()
            }}
          >
            Get more storage
          </button>
        </div>

        <a
          href="/support"
          target="_blank"
          rel="noopener noreferrer"
          className="dashboard-nav-item dashboard-sidebar-help"
          onClick={() => {
            onCloseMobile?.()
          }}
          aria-label="Help"
        >
          <MdHelpOutline className="dashboard-nav-item-icon dashboard-sidebar-help-icon" size={18} aria-hidden />
          <span className="dashboard-nav-item-label">Help</span>
        </a>
      </div>
    </aside>
  )
}

export default DashboardSidebar
