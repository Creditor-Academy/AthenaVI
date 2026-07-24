import { useState } from 'react'
import { MdHelpOutline } from 'react-icons/md'
import { ChevronDown, Plus } from 'lucide-react'
import { getSlidesParentForSection, slidesSidebarGroups } from '../../../constants/slidesNav'
import ProductMoveButton from '../../ui/ProductMoveButton/ProductMoveButton.jsx'
import './SlidesSidebar.css'

function SlidesSidebar({
  section,
  onNavigate,
  onCloseMobile,
  onMoveToVi,
  collapsed = false,
  onRequestExpand,
}) {
  const [openGroups, setOpenGroups] = useState({})
  const activeParent = getSlidesParentForSection(section)

  const isGroupOpen = (id) => {
    if (collapsed) return false
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

  const handleParentClick = (id) => {
    if (collapsed) {
      onRequestExpand?.()
      setOpenGroups((prev) => ({ ...prev, [id]: true }))
      return
    }
    toggleGroup(id)
  }

  return (
    <aside
      className={`dashboard-sidebar-nav slides-sidebar-nav ${collapsed ? 'slides-sidebar-nav--collapsed' : ''}`}
      aria-label="Slides navigation"
    >
      {/* ── Navigation Scroll Area ───────────────────────────────────────── */}
      <div className="dashboard-sidebar-nav-scroll slides-sidebar-nav-scroll">
        {slidesSidebarGroups.map((group, gi) => (
          <div key={gi} className="dashboard-sidebar-group slides-sidebar-group">
            {group.label && (
              <div className="dashboard-sidebar-section-label slides-sidebar-section-label" aria-hidden={collapsed}>
                {group.label}
              </div>
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
                    className={`dashboard-nav-item slides-nav-item ${active ? 'dashboard-nav-item--active slides-nav-item--active' : ''}`}
                    onClick={() => go(item.id)}
                    aria-label={item.label}
                    aria-current={active ? 'page' : undefined}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="slides-nav-icon-box">
                      <Icon className="dashboard-nav-item-icon slides-nav-item-icon" size={20} strokeWidth={1.75} aria-hidden />
                    </span>
                    <span className="dashboard-nav-item-label slides-nav-item-label">{item.label}</span>
                  </button>
                )
              }

              return (
                <div key={item.id} className="slides-nav-branch">
                  <button
                    type="button"
                    className={`dashboard-nav-item slides-nav-item slides-nav-parent ${active ? 'dashboard-nav-item--active slides-nav-item--active' : ''}`}
                    onClick={() => handleParentClick(item.id)}
                    aria-expanded={collapsed ? undefined : isOpen}
                    aria-label={item.label}
                    title={collapsed ? `${item.label} — expand to show options` : undefined}
                  >
                    <span className="slides-nav-icon-box">
                      <Icon className="dashboard-nav-item-icon slides-nav-item-icon" size={20} strokeWidth={1.75} aria-hidden />
                    </span>
                    <span className="dashboard-nav-item-label slides-nav-item-label">{item.label}</span>
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
                            className={`dashboard-nav-item slides-nav-item slides-nav-child ${childIsActive ? 'dashboard-nav-item--active slides-nav-item--active' : ''}`}
                            onClick={() => go(child.id)}
                            aria-label={child.label}
                            aria-current={childIsActive ? 'page' : undefined}
                            title={collapsed ? child.label : undefined}
                          >
                            <span className="slides-nav-icon-box">
                              <ChildIcon className="dashboard-nav-item-icon slides-nav-item-icon" size={18} strokeWidth={1.75} aria-hidden />
                            </span>
                            <span className="dashboard-nav-item-label slides-nav-item-label">{child.label}</span>
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

      {/* ── 3. Footer ───────────────────────────────────────────────────────── */}
      <div className="dashboard-sidebar-footer slides-sidebar-footer">
        <button
          type="button"
          className={`dashboard-nav-item slides-nav-item dashboard-sidebar-help ${section === 'help' ? 'dashboard-nav-item--active slides-nav-item--active' : ''}`}
          onClick={() => go('help')}
          aria-label="Help"
          aria-current={section === 'help' ? 'page' : undefined}
          title={collapsed ? 'Help' : undefined}
        >
          <span className="slides-nav-icon-box">
            <MdHelpOutline className="dashboard-nav-item-icon slides-nav-item-icon dashboard-sidebar-help-icon" size={20} aria-hidden />
          </span>
          <span className="dashboard-nav-item-label slides-nav-item-label">Help</span>
        </button>

        <ProductMoveButton
          target="vi"
          compact={collapsed}
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
