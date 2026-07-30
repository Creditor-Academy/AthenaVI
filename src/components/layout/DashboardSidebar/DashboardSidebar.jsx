import { MdHelpOutline } from 'react-icons/md'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { mainDashboardSidebarGroups } from '../../../constants/dashboardNav'
import DashboardSidebarStorage from './DashboardSidebarStorage.jsx'

function DashboardSidebar({
  section,
  onNavigate,
  onOpenTranslate,
  onOpenAI,
  onCloseMobile,
  collapsed = false,
  onToggleCollapse,
}) {
  const handleItem = (item) => {
    if (item.id === '__translate__') {
      onOpenTranslate?.();
      onCloseMobile?.();
      return;
    }
    if (item.id === '__ai__') {
      onOpenAI?.();
      onCloseMobile?.();
      return;
    }
    onNavigate(item.id);
    onCloseMobile?.();
  };

  return (
    <aside className="dashboard-sidebar-nav" aria-label="Dashboard navigation">
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
        {mainDashboardSidebarGroups.map((group, gi) => (
          <div key={gi} className="dashboard-sidebar-group">
            {group.label && (
              <div className="dashboard-sidebar-section-label">{group.label}</div>
            )}
            {group.items.map((item) => {
              const Icon = item.Icon;
              const active = isNavActive(section, item.id);
              const showHomeCollapse = item.id === 'home' && onToggleCollapse && !collapsed;

              return (
                <div
                  key={item.id}
                  className={showHomeCollapse ? 'dashboard-sidebar-home-row' : undefined}
                >
                  <button
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
                  {showHomeCollapse && (
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
              );
            })}
          </div>
        ))}
      </div>

      <div className="dashboard-sidebar-footer">
        <DashboardSidebarStorage
          onUpgrade={() => {
            onNavigate('credits');
            onCloseMobile?.();
          }}
        />

        <button
          type="button"
          className={`dashboard-nav-item dashboard-sidebar-help ${section === 'help' ? 'dashboard-nav-item--active' : ''}`}
          onClick={() => {
            onNavigate('help')
            onCloseMobile?.()
          }}
          aria-label="Help"
        >
          <MdHelpOutline className="dashboard-nav-item-icon dashboard-sidebar-help-icon" size={18} aria-hidden />
          <span className="dashboard-nav-item-label">Help</span>
        </button>
      </div>
    </aside>
  );
}

function isNavActive(section, itemId) {
  if (itemId === '__translate__' || itemId === '__ai__') return false;
  if (itemId === 'templates' && section === 'template-details') return true;
  return section === itemId;
}

export default DashboardSidebar;
