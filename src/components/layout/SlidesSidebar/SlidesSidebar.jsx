import { useState } from 'react'
import { MdHelpOutline } from 'react-icons/md'
import { ChevronDown } from 'lucide-react'
import { getSlidesParentForSection, slidesSidebarGroups } from '../../../constants/slidesNav'
import ProductMoveButton from '../../ui/ProductMoveButton/ProductMoveButton.jsx'
import './SlidesSidebar.css'

function SlidesSidebar({ section, onNavigate, onCloseMobile, onMoveToVi }) {
  const [openGroups, setOpenGroups] = useState({})
  const activeParent = getSlidesParentForSection(section)

  const isGroupOpen = (id) => {
    if (openGroups[id] !== undefined) return openGroups[id]
    return activeParent === id || id === 'ppt-generator'
  }

  const toggleGroup = (id) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !isGroupOpen(id) }))
  }

  const go = (id) => {
    onNavigate(id)
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
              const hasChildren = Array.isArray(item.children) && item.children.length > 0
              const isOpen = isGroupOpen(item.id)
              const childActive = item.children?.some((c) => c.id === section)
              const active = section === item.id || childActive

              if (!hasChildren) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`dashboard-nav-item ${active ? 'dashboard-nav-item--active' : ''}`}
                    onClick={() => go(item.id)}
                  >
                    <Icon className="dashboard-nav-item-icon" size={16} strokeWidth={1.75} aria-hidden />
                    <span className="dashboard-nav-item-label">{item.label}</span>
                  </button>
                )
              }

              return (
                <div key={item.id} className="slides-nav-branch">
                  <button
                    type="button"
                    className={`dashboard-nav-item slides-nav-parent ${active ? 'dashboard-nav-item--active' : ''}`}
                    onClick={() => toggleGroup(item.id)}
                    aria-expanded={isOpen}
                  >
                    <Icon className="dashboard-nav-item-icon" size={16} strokeWidth={1.75} aria-hidden />
                    <span className="dashboard-nav-item-label">{item.label}</span>
                    <ChevronDown
                      className={`slides-nav-chevron ${isOpen ? 'slides-nav-chevron--open' : ''}`}
                      size={14}
                      strokeWidth={2}
                      aria-hidden
                    />
                  </button>

                  {isOpen && (
                    <div className="slides-nav-children" role="group" aria-label={`${item.label} options`}>
                      {item.children.map((child) => {
                        const ChildIcon = child.Icon
                        const childIsActive = section === child.id
                        return (
                          <button
                            key={child.id}
                            type="button"
                            className={`dashboard-nav-item slides-nav-child ${childIsActive ? 'dashboard-nav-item--active' : ''}`}
                            onClick={() => go(child.id)}
                          >
                            <ChildIcon className="dashboard-nav-item-icon" size={14} strokeWidth={1.75} aria-hidden />
                            <span className="dashboard-nav-item-label">{child.label}</span>
                          </button>
                        )
                      })}
                    </div>
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
          className={`dashboard-nav-item dashboard-sidebar-help ${section === 'help' ? 'dashboard-nav-item--active' : ''}`}
          onClick={() => go('help')}
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
