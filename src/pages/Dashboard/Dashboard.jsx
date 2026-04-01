import { useState, useEffect, useCallback } from 'react'
import Home from '../Home/Home.jsx'
import Videos from '../Videos/Videos.jsx'
import Trash from '../Trash/Trash.jsx'
import Avatars from '../Avatars/Avatars.jsx'
import Voices from '../Voices/Voices.jsx'
import Library from '../Library/Library.jsx'
import Templates from '../Templates/Templates.jsx'
import TemplateDetails from '../TemplateDetails/TemplateDetails.jsx'
import SharedWithMe from '../SharedWithMe/SharedWithMe.jsx'
import Workspace from '../Workspace/Workspace.jsx'
import Profile from '../Profile/Profile.jsx'
import Settings from '../Settings/Settings.jsx'
import BrandKits from '../BrandKits/BrandKits.jsx'
import Credits from '../Credits/Credits.jsx'
import TeamWorkspace from '../TeamWorkspace/TeamWorkspace.jsx'
import AdminPortal from '../AdminPortal/AdminPortal.jsx'
import DashboardTopbar from '../../components/layout/DashboardTopbar/DashboardTopbar.jsx'
import DashboardSidebar from '../../components/layout/DashboardSidebar/DashboardSidebar.jsx'
import VoiceCreatePanel from '../../components/ui/VoiceCreatePanel/VoiceCreatePanel.jsx'
import AIVideoAssistant from '../../components/ui/AIVideoAssistant/AIVideoAssistant.jsx'
import ImportPowerPointModal from '../../components/ui/ImportPowerPointModal/ImportPowerPointModal.jsx'
import TranslateVideoModal from '../../components/ui/TranslateVideoModal/TranslateVideoModal.jsx'
import { X } from 'lucide-react'
import userService from '../../services/userService.js'
import { useAuth } from '../../contexts/AuthContext'
import './Dashboard.css'


function Dashboard({ onLogout, onCreate, initialSection }) {
  const { user, updateUser } = useAuth()
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
  const [showProcessingModal, setShowProcessingModal] = useState(false)
  const [showNotificationsModal, setShowNotificationsModal] = useState(false)
  const [showCreditsModal, setShowCreditsModal] = useState(false)
  const [pendingSection, setPendingSection] = useState(null)
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

  const handleNavigationWithModal = (targetSection) => {
    setPendingSection(targetSection)
    setShowProcessingModal(true)
    
    // Auto-proceed after a short "processing" delay to feel premium but fast
    setTimeout(() => {
      setShowProcessingModal(false)
      goToSection(targetSection)
      setPendingSection(null)
    }, 1200)
  }

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

  // Eagerly fetch and sync user profile on dashboard mount
  useEffect(() => {
    const syncProfile = async () => {
      try {
        const profileData = await userService.getUserProfile()
        if (profileData) {
          updateUser(profileData)
        }
      } catch (err) {
        console.error('Failed to sync profile on mount:', err)
      }
    }
    syncProfile()
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
          goToSection={handleNavigationWithModal}
          onNotificationClick={() => setShowNotificationsModal(true)}
          onCartClick={() => setShowCreditsModal(true)}
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
          {section === 'avatars' && <Avatars onCreate={onCreate} goToSection={goToSection} />}
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
          {section === 'credits' && <Settings onBack={() => goToSection('home')} initialTab="billing" />}
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
      {showTranslateModal && <TranslateVideoModal onClose={() => setShowTranslateModal(true)} />}

      {/* Navigation Processing Modal */}
      {showProcessingModal && (
        <div className="processing-navigation-modal">
          <div className="processing-content">
            <div className="processing-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-center">V</div>
            </div>
            <h4>Preparing {pendingSection?.charAt(0).toUpperCase() + pendingSection?.slice(1)}</h4>
            <p>Optimizing your workspace for excellence...</p>
          </div>
        </div>
      )}

      {/* Notifications Modal Overlay */}
      {showNotificationsModal && (
        <div className="quick-access-modal-overlay" onClick={() => setShowNotificationsModal(false)}>
          <div className="quick-access-modal notifications-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header-sleek">
              <h4>Notifications</h4>
              <button className="close-mini-btn" onClick={() => setShowNotificationsModal(false)}><X size={18} /></button>
            </div>
            <div className="notifications-list-mini">
              {[1, 2, 3].map(i => (
                <div key={i} className="notification-item-mini">
                  <div className="notif-dot"></div>
                  <div className="notif-content-mini">
                    <h6>Video Generated Successfully</h6>
                    <p>Your video "Project Athena" is ready for review.</p>
                    <span>2 hours ago</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer-sleek">
              <button className="btn-link-action" onClick={() => { setShowNotificationsModal(false); handleNavigationWithModal('profile'); }}>View All History</button>
            </div>
          </div>
        </div>
      )}

      {/* Credits Modal Overlay */}
      {showCreditsModal && (
        <div className="quick-access-modal-overlay" onClick={() => setShowCreditsModal(false)}>
          <div className="quick-access-modal credits-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header-sleek">
              <h4>Credits & Billing</h4>
              <button className="close-mini-btn" onClick={() => setShowCreditsModal(false)}><X size={18} /></button>
            </div>
            <div className="credits-display-mini">
              <div className="credits-amount-card">
                <span className="credits-value">1,240</span>
                <span className="credits-label">Available Credits</span>
              </div>
              <p className="credits-subtext">Credits are used for generating videos and high-quality avatars.</p>
            </div>
            <div className="modal-footer-sleek">
              <button className="btn-primary-apply full-width" onClick={() => { setShowCreditsModal(false); handleNavigationWithModal('credits'); }}>View More & Upgrade</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
