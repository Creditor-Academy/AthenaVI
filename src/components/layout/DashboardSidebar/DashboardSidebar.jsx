import { MdHelpOutline } from 'react-icons/md'
import { mainDashboardSidebarGroups } from '../../../constants/dashboardNav'
import DashboardSidebarStorage from './DashboardSidebarStorage.jsx'

function DashboardSidebar({
  section,
  onNavigate,
  onOpenTranslate,
  onOpenAI,
  onCloseMobile,
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
        {mainDashboardSidebarGroups.map((group, gi) => (
          <div key={gi} className="dashboard-sidebar-group">
            {group.label && (
              <div className="dashboard-sidebar-section-label">{group.label}</div>
            )}
            {group.items.map((item) => {
              const Icon = item.Icon;
              const active = isNavActive(section, item.id);
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
