import { useState, useEffect, useCallback } from 'react'
import DashboardTopbar from '../../components/layout/DashboardTopbar/DashboardTopbar.jsx'
import SlidesSidebar from '../../components/layout/SlidesSidebar/SlidesSidebar.jsx'
import Settings from '../Settings/Settings.jsx'
import Help from '../UserHelp/Help.jsx'
import SlidesHome from './SlidesHome.jsx'
import SlidesComingSoon from './SlidesComingSoon.jsx'
import {
  resolveSlidesSectionFromPath,
  slidesPathForSection,
} from '../../utils/slidesRouting.js'
import '../Dashboard/Dashboard.css'

const TOOL_SECTIONS = new Set(['ppt-generator', 'image-generator'])

function SlidesDashboard({ onSwitchToStudio, onChooseProduct }) {
  const [section, setSection] = useState(() => resolveSlidesSectionFromPath() ?? 'home')
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false)
  const [topbarMobileOpen, setTopbarMobileOpen] = useState(false)

  const goToSection = useCallback((id) => {
    setTopbarMobileOpen(false)
    setSidebarMobileOpen(false)
    setSection(id)
  }, [])

  useEffect(() => {
    const path = slidesPathForSection(section)
    const current = window.location.pathname + window.location.search
    if (current.split('?')[0] !== path) {
      window.history.pushState({ view: 'slides', section }, '', path)
    }
  }, [section])

  useEffect(() => {
    const onPopState = () => {
      const next = resolveSlidesSectionFromPath()
      if (next) setSection(next)
    }
    const onNavigate = (event) => {
      const next = event?.detail?.section
      if (next) goToSection(next)
    }
    window.addEventListener('popstate', onPopState)
    window.addEventListener('athena:slides-navigate', onNavigate)
    return () => {
      window.removeEventListener('popstate', onPopState)
      window.removeEventListener('athena:slides-navigate', onNavigate)
    }
  }, [goToSection])

  return (
    <div
      className={`dashboard-shell ${sidebarMobileOpen ? 'dashboard-shell--sidebar-open' : ''}`}
    >
      {sidebarMobileOpen && (
        <button
          type="button"
          className="dashboard-sidebar-backdrop"
          aria-label="Close menu"
          onClick={() => setSidebarMobileOpen(false)}
        />
      )}

      <div className="dashboard-sidebar-column">
        <div className="dashboard-sidebar-header">
          <button
            type="button"
            className="dashboard-sidebar-brand"
            onClick={() => goToSection('home')}
            onDoubleClick={() => onChooseProduct?.()}
            aria-label="Slides, go to home"
            title="Double-click to switch products"
          >
            <span className="dashboard-sidebar-brand-logo" aria-hidden>
              S
            </span>
            <span className="dashboard-sidebar-brand-name">Slides</span>
          </button>
        </div>

        <SlidesSidebar
          section={section}
          onNavigate={goToSection}
          onCloseMobile={() => setSidebarMobileOpen(false)}
          onMoveToVi={onSwitchToStudio}
        />
      </div>

      <div className="dashboard-main-column">
        <DashboardTopbar
          sidebarMobileOpen={sidebarMobileOpen}
          setSidebarMobileOpen={setSidebarMobileOpen}
          topbarMobileOpen={topbarMobileOpen}
          setTopbarMobileOpen={setTopbarMobileOpen}
          onCreate={() => goToSection('ppt-generator')}
          notificationCount={0}
          cartCount={0}
          goToSection={goToSection}
          onNotificationClick={() => {}}
          onCartClick={() => goToSection('settings')}
          isAdminPortal={false}
          searchQuery=""
          onSearchQueryChange={() => {}}
          searchIsOpen={false}
          onSearchFocus={() => {}}
          onSearchClose={() => {}}
          onSearchSelect={() => {}}
          searchIsIndexing={false}
          searchIndexError={null}
          searchResultsByCategory={{}}
          searchFlatResults={[]}
          searchCategoryLabels={{}}
          searchActiveIndex={-1}
          onSearchActiveIndexChange={() => {}}
          onSearchMoveActive={() => {}}
        />

        <main
          className={`content with-padding ${section === 'home' ? 'content--home' : ''} content--workspace-consistent`}
        >
          {section === 'home' && (
            <SlidesHome
              onNavigate={goToSection}
              onCreate={() => goToSection('ppt-generator')}
            />
          )}
          {TOOL_SECTIONS.has(section) && (
            <SlidesComingSoon
              section={section}
              onBackHome={() => goToSection('home')}
            />
          )}
          {section === 'settings' && (
            <Settings onBack={() => goToSection('home')} />
          )}
          {section === 'help' && (
            <Help embedded onOpenBilling={() => goToSection('settings')} />
          )}
        </main>
      </div>
    </div>
  )
}

export default SlidesDashboard
