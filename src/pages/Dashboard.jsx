import { useState, useEffect, useCallback } from 'react'
import Home from './Home.jsx'
import Videos from './Videos.jsx'
import Trash from './Trash.jsx'
import Avatars from './Avatars.jsx'
import Voices from './Voices.jsx'
import Library from './Library.jsx'
import Templates from './Templates.jsx'
import TemplateDetails from './TemplateDetails.jsx'
import SharedWithMe from './SharedWithMe.jsx'
import Workspace from './Workspace.jsx'
import Profile from './Profile.jsx'
import Settings from './Settings.jsx'
import BrandKits from './BrandKits.jsx'
import Credits from './Credits.jsx'
import TeamWorkspace from './TeamWorkspace.jsx'
import AdminPortal from './AdminPortal.jsx'
import DashboardTopbar from '../components/DashboardTopbar.jsx'
import DashboardSidebar from '../components/DashboardSidebar.jsx'
import VoiceCreatePanel from '../components/VoiceCreatePanel.jsx'
import AIVideoAssistant from '../components/AIVideoAssistant.jsx'
import ImportPowerPointModal from '../components/ImportPowerPointModal.jsx'
import TranslateVideoModal from '../components/TranslateVideoModal.jsx'
import './Dashboard.css'


function Dashboard({ onLogout, onCreate, initialSection }) {
  const [section, setSection] = useState(() => {
    // Use initialSection from props if provided, otherwise get from URL
    if (initialSection) {
      return initialSection
    }
    
    // Fallback: Initialize section based on current URL path
    const currentPath = window.location.pathname
    if (currentPath.startsWith('/dashboard/')) {
      return currentPath.replace('/dashboard/', '') || 'home'
    }
    return 'home'
  })
  const [showVoicePanel, setShowVoicePanel] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showTranslateModal, setShowTranslateModal] = useState(false)
  const [selectedTemplateForDetails, setSelectedTemplateForDetails] = useState(null)
  const [topbarMobileOpen, setTopbarMobileOpen] = useState(false)
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false)

  const cartCount = 2
  const notificationCount = 9

  const goToSection = useCallback((id) => {
    setTopbarMobileOpen(false)
    setSidebarMobileOpen(false)
    setSection(id)
  }, [])

  // Update URL when section changes
  useEffect(() => {
    const newPath = section === 'home' ? '/dashboard' : `/dashboard/${section}`
    if (window.location.pathname !== newPath) {
      window.history.pushState({ section }, '', newPath)
    }
  }, [section])

  // Handle browser back/forward for dashboard sections
  useEffect(() => {
    const handlePopState = () => {
      const currentPath = window.location.pathname
      if (currentPath.startsWith('/dashboard/')) {
        const newSection = currentPath.replace('/dashboard/', '') || 'home'
        setSection(newSection)
      } else if (currentPath === '/dashboard') {
        setSection('home')
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

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
            aria-label="Virtual Instructor, go to home"
          >
            <span className="dashboard-sidebar-brand-logo" aria-hidden>
              V
            </span>
            <span className="dashboard-sidebar-brand-name">Virtual Instructor</span>
          </button>
        </div>

        <DashboardSidebar
          section={section}
          onNavigate={goToSection}
          onOpenTranslate={() => setShowTranslateModal(true)}
          onOpenAI={() => setShowAIAssistant(true)}
          onCloseMobile={() => setSidebarMobileOpen(false)}
        />
      </div>

      <div className="dashboard-main-column">
        <DashboardTopbar 
          sidebarMobileOpen={sidebarMobileOpen}
          setSidebarMobileOpen={setSidebarMobileOpen}
          topbarMobileOpen={topbarMobileOpen}
          setTopbarMobileOpen={setTopbarMobileOpen}
          onCreate={onCreate}
          notificationCount={notificationCount}
          cartCount={cartCount}
          goToSection={goToSection}
        />

        <main
          className={`content ${!['avatars', 'templates', 'template-details', 'team-workspace', 'admin-portal', 'settings'].includes(section) ? 'with-padding' : ''}`}
        >
          {section === 'home' && (
            <Home 
              onCreate={onCreate}
              onShowAIAssistant={() => setShowAIAssistant(true)}
            />
          )}
          {section === 'videos' && <Videos onCreate={onCreate} />}
          {section === 'avatars' && <Avatars />}
          {section === 'trash' && <Trash />}
          {section === 'voices' && (
            <Voices
              onCreateVoice={() => { setSelectedVoice(null); setShowVoicePanel(true); }}
              onVoiceClick={(voice) => { setSelectedVoice(voice); setShowVoicePanel(true); }}
            />
          )}
          {section === 'library' && <Library />}
          {section === 'templates' && (
            <Templates 
              onSelect={(template) => {
                setSelectedTemplateForDetails(template)
                goToSection('template-details')
              }} 
            />
          )}
          {section === 'template-details' && (
            <TemplateDetails 
              template={selectedTemplateForDetails} 
              onBack={() => goToSection('templates')}
              onUse={() => {
                // Future implementation for using template
                onCreate()
              }}
            />
          )}
          {section === 'shared' && <SharedWithMe />}
          {section === 'workspace' && <Workspace onCreate={onCreate} />}
          {section === 'team-workspace' && <TeamWorkspace onCreate={onCreate} />}
          {section === 'admin-portal' && <AdminPortal />}
          {section === 'brandkits' && <BrandKits />}
          {section === 'credits' && <Credits onBack={() => goToSection('home')} />}
          {section === 'profile' && <Profile onBack={() => goToSection('home')} />}
          {section === 'settings' && <Settings onBack={() => goToSection('home')} />}
        </main>
      </div>

      {showVoicePanel && (
        <VoiceCreatePanel
          voice={selectedVoice}
          onClose={() => { setShowVoicePanel(false); setSelectedVoice(null); }}
          onNext={() => { setShowVoicePanel(false); setSelectedVoice(null); }}
        />
      )}
      {showAIAssistant && (
        <AIVideoAssistant
          onClose={() => setShowAIAssistant(false)}
          onCreate={() => {
            setShowAIAssistant(false);
            if (onCreate) onCreate();
          }}
        />
      )}
      {showImportModal && <ImportPowerPointModal onClose={() => setShowImportModal(false)} />}
      {showTranslateModal && <TranslateVideoModal onClose={() => setShowTranslateModal(false)} />}
    </div>
  )
}

export default Dashboard
