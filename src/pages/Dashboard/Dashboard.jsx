import { useState, useEffect, useCallback } from 'react'
import Home from '../Home/Home.jsx'
import Videos from '../Videos/Videos.jsx'
import Avatars from '../Avatars/Avatars.jsx'
import CreateAvatar from '../Avatars/CreateAvatar.jsx'
import Voices from '../Voices/Voices.jsx'
import CreateVoice from '../Voices/CreateVoice.jsx'
import Library from '../Library/Library.jsx'
import Templates from '../Templates/Templates.jsx'
import TemplateDetails from '../TemplateDetails/TemplateDetails.jsx'
import Profile from '../Profile/Profile.jsx'
import Settings from '../Settings/Settings.jsx'
import BrandKits from '../BrandKits/BrandKits.jsx'
import TeamWorkspace from '../TeamWorkspace/TeamWorkspace.jsx'
import AdminPortal from '../AdminPortal/AdminPortal.jsx'
import DashboardTopbar from '../../components/layout/DashboardTopbar/DashboardTopbar.jsx'
import DashboardSidebar from '../../components/layout/DashboardSidebar/DashboardSidebar.jsx'
import AdminPortalSidebar from '../../components/layout/AdminPortalSidebar/AdminPortalSidebar.jsx'
import PortalModeSwitcher from '../../components/ui/PortalModeSwitcher/PortalModeSwitcher.jsx'

import AIVideoAssistant from '../../components/ui/AIVideoAssistant/AIVideoAssistant.jsx'
import ImportPowerPointModal from '../../components/ui/ImportPowerPointModal/ImportPowerPointModal.jsx'
import TranslateVideoModal from '../../components/ui/TranslateVideoModal/TranslateVideoModal.jsx'
import CreateVideoModal from '../../components/ui/CreateVideoModal/CreateVideoModal.jsx'
import { X } from 'lucide-react'
import userService from '../../services/userService.js'
import CreditsQuickModal from '../../components/ui/CreditsQuickModal/CreditsQuickModal.jsx'
import { useAuth } from '../../contexts/AuthContext'
import './Dashboard.css'


function Dashboard({ onCreate, initialSection }) {
  const {
    updateUser,
    canAccessSuperadminPortal,
    capabilitiesLoading,
  } = useAuth()
  const [section, setSection] = useState(() => {
    // Use initialSection from props if provided, otherwise get from URL
    if (initialSection) {
      return initialSection
    }
    
    // Fallback: Initialize section based on current URL path
    let currentPath = window.location.pathname
    if (window.location.hash && window.location.hash !== '#') {
      currentPath = window.location.hash.replace('#', '') || '/'
      if (currentPath.endsWith('/') && currentPath.length > 1) {
        currentPath = currentPath.slice(0, -1)
      }
    }
    if (currentPath.startsWith('/dashboard/')) {
      return currentPath.replace('/dashboard/', '') || 'home'
    }
    return 'home'
  })
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [showCreateVideoModal, setShowCreateVideoModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showTranslateModal, setShowTranslateModal] = useState(false)
  const [showProcessingModal, setShowProcessingModal] = useState(false)
  const [showNotificationsModal, setShowNotificationsModal] = useState(false)
  const [showCreditsModal, setShowCreditsModal] = useState(false)
  const [createVideoModalContext, setCreateVideoModalContext] = useState(null)
  const [pendingSection, setPendingSection] = useState(null)
  const [selectedTemplateForDetails, setSelectedTemplateForDetails] = useState(null)
  const [topbarMobileOpen, setTopbarMobileOpen] = useState(false)
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false)
  const [lastVoiceCreated, setLastVoiceCreated] = useState(false)
  const [adminTab, setAdminTab] = useState(() => {
    const saved = localStorage.getItem('adminPortalTab')
    const valid = ['users', 'workspaces', 'reports', 'heygen']
    return valid.includes(saved) ? saved : 'users'
  })

  const cartCount = 2
  const notificationCount = 9

  const noPaddingSections = ['templates', 'template-details']
  const workspaceConsistentSections = [
    'home',
    'videos',
    'workspace',
    'library',
    'brandkits',
    'avatars',
    'voices',
    'admin-portal',
    'settings',
  ]

  const isAdminPortal = section === 'admin-portal'

  const goToSection = useCallback((id) => {
    if (id === 'admin-portal' && !canAccessSuperadminPortal) {
      id = 'home'
    }
    setTopbarMobileOpen(false)
    setSidebarMobileOpen(false)
    setSection(id)
  }, [canAccessSuperadminPortal])

  const handlePortalToggle = useCallback(() => {
    if (isAdminPortal) {
      goToSection('home')
    } else {
      goToSection('admin-portal')
    }
  }, [isAdminPortal, goToSection])

  const handleAdminTabChange = useCallback((tabId) => {
    setAdminTab(tabId)
    localStorage.setItem('adminPortalTab', tabId)
  }, [])

  useEffect(() => {
    if (capabilitiesLoading) return
    if (section === 'admin-portal' && !canAccessSuperadminPortal) {
      setSection('home')
    }
  }, [section, canAccessSuperadminPortal, capabilitiesLoading])

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

  const handleOpenCreateVideoModal = useCallback((context = null) => {
    setCreateVideoModalContext(context)
    setShowCreateVideoModal(true)
  }, [])

  const handleCreateVideo = useCallback((config) => {
    setShowCreateVideoModal(false)
    setCreateVideoModalContext(null)
    if (onCreate) {
      onCreate(config)
    }
  }, [onCreate])

  const handleEditVideo = useCallback((video) => {
    if (onCreate) {
      // Reuse the onCreate navigation logic
      onCreate({
        videoId: video.id || video._id,
        workspaceId: video.workspaceId,
        folderId: video.folderId || (video.folder && (video.folder.id || video.folder._id)) || null,
        workspace: video.workspace || video.workspaceName || '',
        folder: video.folder?.name || video.folderName || video.folder || '',
        name: video.title || video.name,
        videoData: video
      })
    }
  }, [onCreate])

  // Update URL when section changes
  useEffect(() => {
    let newPath
    if (section === 'home') {
      newPath = '/dashboard'
    } else if (section === 'profile') {
      newPath = '/profile'
    } else {
      newPath = `/dashboard/${section}`
    }
    
    if (window.location.pathname !== newPath) {
      window.history.pushState({ section }, '', newPath)
    }
  }, [section])

  // Handle browser back/forward for dashboard sections
  useEffect(() => {
    const handlePopState = () => {
      let currentPath = window.location.pathname
      if (window.location.hash && window.location.hash !== '#') {
        currentPath = window.location.hash.replace('#', '') || '/'
        if (currentPath.endsWith('/') && currentPath.length > 1) {
          currentPath = currentPath.slice(0, -1)
        }
      }
      if (currentPath === '/profile') {
        setSection('profile')
      } else if (currentPath.startsWith('/dashboard/')) {
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
  }, [updateUser])

  return (
    <div
      className={`dashboard-shell ${sidebarMobileOpen ? 'dashboard-shell--sidebar-open' : ''} ${isAdminPortal ? 'dashboard-shell--admin-portal' : ''}`}
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
            onClick={() => (isAdminPortal ? handlePortalToggle() : goToSection('home'))}
            aria-label={isAdminPortal ? 'Back to platform' : 'Virtual Instructor, go to home'}
          >
            <span className="dashboard-sidebar-brand-logo" aria-hidden>
              V
            </span>
            <span className="dashboard-sidebar-brand-name">Virtual Instructor</span>
          </button>

          {canAccessSuperadminPortal && (
            <PortalModeSwitcher
              mode={isAdminPortal ? 'admin' : 'main'}
              onSelectMain={handlePortalToggle}
              onSelectAdmin={() => goToSection('admin-portal')}
              onCloseMobile={() => setSidebarMobileOpen(false)}
            />
          )}
        </div>

        {isAdminPortal ? (
          <AdminPortalSidebar
            activeTab={adminTab}
            onTabChange={handleAdminTabChange}
            onCloseMobile={() => setSidebarMobileOpen(false)}
          />
        ) : (
          <DashboardSidebar
            section={section}
            onNavigate={goToSection}
            onOpenTranslate={() => setShowTranslateModal(true)}
            onOpenAI={() => setShowAIAssistant(true)}
            onCloseMobile={() => setSidebarMobileOpen(false)}
          />
        )}
      </div>

      <div className="dashboard-main-column">
        <DashboardTopbar 
          sidebarMobileOpen={sidebarMobileOpen}
          setSidebarMobileOpen={setSidebarMobileOpen}
          topbarMobileOpen={topbarMobileOpen}
          setTopbarMobileOpen={setTopbarMobileOpen}
          onCreate={handleOpenCreateVideoModal}
          notificationCount={notificationCount}
          cartCount={cartCount}
          goToSection={handleNavigationWithModal}
          onNotificationClick={() => setShowNotificationsModal(true)}
          onCartClick={() => setShowCreditsModal(true)}
          isAdminPortal={isAdminPortal}
        />

        <main
          className={`content ${!noPaddingSections.includes(section) ? 'with-padding' : ''} ${section === 'home' ? 'content--home' : ''} ${workspaceConsistentSections.includes(section) ? 'content--workspace-consistent' : ''} ${isAdminPortal ? 'content--superadmin' : ''}`}
        >
          {section === 'home' && (
            <Home 
              onCreate={handleOpenCreateVideoModal}
              onEdit={handleEditVideo}
              onShowAIAssistant={() => setShowAIAssistant(true)}
            />
          )}
          {section === 'videos' && <Videos onCreate={handleOpenCreateVideoModal} onEdit={handleEditVideo} />}
          {section === 'avatars' && (
            <Avatars 
              onCreate={handleOpenCreateVideoModal} 
              onEdit={handleEditVideo}              goToSection={goToSection} 
              onCreateAvatar={() => goToSection('create-avatar')} 
            />
          )}
          {section === 'create-avatar' && (
            <CreateAvatar 
              onBack={(success) => {
                goToSection('avatars');
              }} 
            />
          )}
          {section === 'voices' && (
            <Voices 
              onCreateVoice={() => goToSection('create-voice')} 
              onVoiceClick={(voice) => { setSelectedVoice(voice); }}
              initialFilter={lastVoiceCreated ? 'private' : 'public'} 
            />
          )}
          {section === 'create-voice' && (
            <CreateVoice 
              onBack={(success) => {
                setLastVoiceCreated(success);
                goToSection('voices');
              }} 
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
                handleOpenCreateVideoModal(selectedTemplateForDetails)
              }}
            />
          )}
          {section === 'workspace' && <TeamWorkspace onCreate={handleOpenCreateVideoModal} onEdit={handleEditVideo} />}
          {section === 'admin-portal' && canAccessSuperadminPortal && (
            <AdminPortal
              activeTab={adminTab}
              onTabChange={handleAdminTabChange}
              hideTabBar
            />
          )}
          {section === 'brandkits' && <BrandKits />}
          {section === 'credits' && <Settings onBack={() => goToSection('home')} initialTab="billing" />}
          {section === 'profile' && <Profile onBack={() => goToSection('home')} />}
          {section === 'settings' && <Settings onBack={() => goToSection('home')} />}
        </main>
      </div>


      {showAIAssistant && (
        <AIVideoAssistant
          onClose={() => setShowAIAssistant(false)}
          onCreate={() => {
            setShowAIAssistant(false);
            handleOpenCreateVideoModal();
          }}
        />
      )}
      {showCreateVideoModal && (
        <CreateVideoModal
          isOpen={showCreateVideoModal}
          onClose={() => {
            setShowCreateVideoModal(false)
            setCreateVideoModalContext(null)
          }}
          onImportPowerPoint={() => {
            setShowCreateVideoModal(false)
            setCreateVideoModalContext(null)
            setShowImportModal(true)
          }}
          initialWorkspaceId={createVideoModalContext?.initialWorkspaceId || ''}
          initialFolderId={createVideoModalContext?.initialFolderId || ''}
          onCreateVideo={handleCreateVideo}
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

      {showCreditsModal && (
        <CreditsQuickModal
          onClose={() => setShowCreditsModal(false)}
          onManageBilling={() => {
            setShowCreditsModal(false)
            handleNavigationWithModal('credits')
          }}
        />
      )}
    </div>
  )
}

export default Dashboard
