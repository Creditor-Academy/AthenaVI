import { MdHelpOutline } from 'react-icons/md'
import { slidesSidebarGroups } from '../../../constants/slidesNav'
import ProductMoveButton from '../../ui/ProductMoveButton/ProductMoveButton.jsx'

function SlidesSidebar({ section, onNavigate, onCloseMobile, onMoveToVi }) {
  const handleItem = (item) => {
    onNavigate(item.id)
    onCloseMobile?.()
  }

  return (
    <aside className="dashboard-sidebar-nav" aria-label="Slides navigation">
      <div className="dashboard-sidebar-nav-scroll">
        {slidesSidebarGroups.map((group, gi) => (
          <div key={gi} className="dashboard-sidebar-group">
            {group.label && (
              <div className="dashboard-sidebar-section-label">{group.label}</div>
            )}
            {group.items.map((item) => {
              const Icon = item.Icon
              const active = section === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`dashboard-nav-item ${active ? 'dashboard-nav-item--active' : ''}`}
                  onClick={() => handleItem(item)}
                >
                  <Icon className="dashboard-nav-item-icon" size={16} strokeWidth={1.75} aria-hidden />
                  <span className="dashboard-nav-item-label">{item.label}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <div className="dashboard-sidebar-footer">
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

        <ProductMoveButton
          target="vi"
          onClick={() => {
            onMoveToVi?.()
            onCloseMobile?.()
          }}
        />
      </div>
    </aside>
  )
}

export default SlidesSidebar
