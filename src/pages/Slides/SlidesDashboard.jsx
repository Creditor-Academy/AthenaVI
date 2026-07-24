import { useState, useEffect, useCallback } from 'react'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import DashboardTopbar from '../../components/layout/DashboardTopbar/DashboardTopbar.jsx'
import SlidesSidebar from '../../components/layout/SlidesSidebar/SlidesSidebar.jsx'
import Settings from '../Settings/Settings.jsx'
import Help from '../UserHelp/Help.jsx'
import SlidesHome from './SlidesHome.jsx'
import SlidesComingSoon from './SlidesComingSoon.jsx'
import AIPptGenerator from './AIPptGenerator.jsx'
import AIPptEditor from './AIPptComponents/AIPptEditor.jsx'
import PptBuilder from './PptBuilder/PptBuilder.jsx'
import {
  resolveSlidesSectionFromPath,
  slidesPathForSection,
  SLIDES_TOOL_SECTIONS,
} from '../../utils/slidesRouting.js'
import '../Dashboard/Dashboard.css'
import '../../components/layout/SlidesSidebar/SlidesSidebar.css'

const SLIDES_SIDEBAR_COLLAPSED_KEY = 'athena.slides.sidebarCollapsed'

function SlidesDashboard({ onSwitchToStudio, onChooseProduct }) {
  const [section, setSection] = useState(() => resolveSlidesSectionFromPath() ?? 'home')
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false)
  const [topbarMobileOpen, setTopbarMobileOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return window.localStorage.getItem(SLIDES_SIDEBAR_COLLAPSED_KEY) === '1'
    } catch {
      return false
    }
  })
  const [editorData, setEditorData] = useState(null)

  const goToSection = useCallback((id) => {
    setTopbarMobileOpen(false)
    setSidebarMobileOpen(false)
    setSection(id)
  }, [])

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      try {
        window.localStorage.setItem(SLIDES_SIDEBAR_COLLAPSED_KEY, next ? '1' : '0')
      } catch {
        /* ignore storage failures */
      }
      return next
    })
  }, [])

  const expandSidebar = useCallback(() => {
    setSidebarCollapsed(false)
    try {
      window.localStorage.setItem(SLIDES_SIDEBAR_COLLAPSED_KEY, '0')
    } catch {
      /* ignore storage failures */
    }
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

  if (section === 'ppt-ai') {
    return (
      <AIPptGenerator 
        onBack={() => goToSection('home')} 
        onComplete={(data) => {
          setEditorData(data)
          goToSection('editor')
        }} 
      />
    )
  }

  if (section === 'ppt-builder') {
    return (
      <PptBuilder onBack={() => goToSection('home')} />
    )
  }

  if (section === 'editor') {
    return (
      <AIPptEditor 
        outline={editorData?.outline || []}
        config={editorData?.config || {}}
        onBack={() => goToSection('home')}
      />
    )
  }

  const shellClass = [
    'dashboard-app-viewport',
    'slides-app-viewport',
    sidebarMobileOpen ? 'dashboard-shell--sidebar-open' : '',
    sidebarCollapsed ? 'slides-shell--collapsed' : 'slides-shell--expanded',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={shellClass}>
      {sidebarMobileOpen && (
        <button
          type="button"
          className="dashboard-sidebar-backdrop"
          aria-label="Close menu"
          onClick={() => setSidebarMobileOpen(false)}
        />
      )}

      {/* ── 1. TOPBAR (Outside the content container, attached to top rail) ───── */}
      <DashboardTopbar
        sidebarMobileOpen={sidebarMobileOpen}
        setSidebarMobileOpen={setSidebarMobileOpen}
        topbarMobileOpen={topbarMobileOpen}
        setTopbarMobileOpen={setTopbarMobileOpen}
        onCreate={() => goToSection('ppt-ai')}
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
        searchPlaceholder="Search apps, games, and more"
        className="slides-topbar"
      />

      {/* ── 2. DASHBOARD BODY (Sidebar outside + Main Page Container Card) ──── */}
      <div className="dashboard-body slides-body">
        {/* Sidebar Column (Outside the main page container card) */}
        <div className="dashboard-sidebar-column slides-sidebar-column">
          <div className="dashboard-sidebar-header slides-sidebar-header">
            <button
              type="button"
              className="slides-sidebar-collapse-btn"
              onClick={toggleSidebarCollapsed}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!sidebarCollapsed}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <span className="slides-nav-icon-box">
                {sidebarCollapsed ? (
                  <PanelLeftOpen size={20} strokeWidth={1.75} aria-hidden />
                ) : (
                  <PanelLeftClose size={20} strokeWidth={1.75} aria-hidden />
                )}
              </span>
            </button>
          </div>

          <SlidesSidebar
            section={section}
            onNavigate={goToSection}
            onCloseMobile={() => setSidebarMobileOpen(false)}
            onMoveToVi={onSwitchToStudio}
            collapsed={sidebarCollapsed}
            onRequestExpand={expandSidebar}
          />
        </div>

        {/* ── 3. MAIN PAGE CONTAINER CARD (Rounded Container Card with Margins) ─ */}
        <div
          className="dashboard-page-card"
          onClick={() => {
            if (!sidebarCollapsed) {
              setSidebarCollapsed(true)
              try {
                window.localStorage.setItem(SLIDES_SIDEBAR_COLLAPSED_KEY, '1')
              } catch {
                /* ignore storage failures */
              }
            }
          }}
        >
          <main
            className={`dashboard-main-content content ${
              section === 'home' ? 'content--home content--slides-home' : 'with-padding content--workspace-consistent'
            }`}
          >
            {section === 'home' && (
              <SlidesHome
                onNavigate={goToSection}
                onCreate={() => goToSection('ppt-ai')}
              />
            )}
            {SLIDES_TOOL_SECTIONS.has(section) && section !== 'ppt-ai' && section !== 'ppt-builder' && (
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
    </div>
  )
}

export default SlidesDashboard
