import { useState, useEffect, useCallback } from 'react'
import Home from '../Home/Home.jsx'
import Videos from '../Videos/Videos.jsx'
import Avatars from '../Avatars/Avatars.jsx'
import CreateAvatar from '../Avatars/CreateAvatar.jsx'
import CreateAvatarLook from '../Avatars/CreateAvatarLook.jsx'
import Voices from '../Voices/Voices.jsx'
import CreateVoice from '../Voices/CreateVoice.jsx'
import Library from '../Library/Library.jsx'
import Templates from '../Templates/Templates.jsx'
import TemplateDetails from '../TemplateDetails/TemplateDetails.jsx'
import Profile from '../Profile/Profile.jsx'
import Settings from '../Settings/Settings.jsx'
import Help from '../UserHelp/Help.jsx'
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
import CreateAvatarModal from '../../components/ui/CreateAvatarModal/CreateAvatarModal.jsx'
import { getAvatarTypeOption } from '../Avatars/avatarTypeOptions.js'
import NotificationsQuickModal from '../../components/ui/NotificationsQuickModal/NotificationsQuickModal.jsx'
import CreditsQuickModal from '../../components/ui/CreditsQuickModal/CreditsQuickModal.jsx'
import { useInboxUnreadCount } from '../../hooks/useInboxUnreadCount.js'
import userService from '../../services/userService.js'
import { useAuth } from '../../contexts/AuthContext'
import { bundleToDetailsTemplate } from '../../utils/fetchTemplateBundles.js'
import {
  clearAvatarLookContext,
  clearAvatarsListNavigation,
  loadAvatarLookContext,
  saveAvatarLookContext,
  saveAvatarsActiveSection,
} from '../../utils/avatarsNavigationStorage.js'
import { clearWorkspaceNavigation } from '../../utils/workspaceNavigationStorage.js'
import {
  dashboardPathForSection,
  resolveDashboardSectionFromPath,
} from '../../utils/dashboardRouting.js'
import './Dashboard.css'

const AVATAR_FLOW_SECTIONS = new Set(['avatars', 'create-avatar-look', 'create-avatar'])


function Dashboard({ onCreate, initialSection }) {
  const {
    updateUser,
    canAccessSuperadminPortal,
    capabilitiesLoading,
  } = useAuth()
  const [section, setSection] = useState(() => {
    return resolveDashboardSectionFromPath() ?? initialSection ?? 'home'
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
  const [avatarLookContext, setAvatarLookContext] = useState(() => loadAvatarLookContext())
  const [avatarCreateTypeId, setAvatarCreateTypeId] = useState(null)
  const [adminTab, setAdminTab] = useState(() => {
    const saved = localStorage.getItem('adminPortalTab')
    const valid = ['overview', 'users', 'workspaces', 'storage-requests', 'reports', 'platform-actions', 'heygen']
    return valid.includes(saved) ? saved : 'overview'
  })

  const cartCount = 2
  const { unreadCount: notificationCount, refresh: refreshInboxUnread, setUnreadCount: setInboxUnreadCount } =
    useInboxUnreadCount()

  const noPaddingSections = ['templates', 'template-details']
  const workspaceConsistentSections = [
    'home',
    'videos',
    'workspace',
    'library',
    'brandkits',
    'avatars',
    'create-avatar',
    'create-avatar-look',
    'voices',
    'admin-portal',
    'settings',
    'help',
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

  const openCreateAvatarLook = useCallback((ctx) => {
    saveAvatarLookContext(ctx)
    saveAvatarsActiveSection('private')
    setAvatarLookContext(ctx)
    goToSection('create-avatar-look')
  }, [goToSection])

  const closeCreateAvatarLook = useCallback(() => {
    clearAvatarLookContext()
    setAvatarLookContext(null)
    goToSection('avatars')
  }, [goToSection])

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

  // Keep section aligned with the URL on hard refresh / direct links.
  useEffect(() => {
    const sectionFromUrl = resolveDashboardSectionFromPath()
    if (!sectionFromUrl) return
    setSection((current) => (current === sectionFromUrl ? current : sectionFromUrl))
  }, [])

  // Update URL when section changes
  useEffect(() => {
    const newPath = dashboardPathForSection(section)

    if (window.location.pathname !== newPath) {
      window.history.pushState({ section }, '', newPath)
    }
  }, [section])

  // Handle browser back/forward for dashboard sections
  useEffect(() => {
    const handlePopState = () => {
      const sectionFromUrl = resolveDashboardSectionFromPath()
      if (sectionFromUrl) {
        setSection(sectionFromUrl)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    if (!AVATAR_FLOW_SECTIONS.has(section)) {
      clearAvatarsListNavigation()
    }
  }, [section])

  useEffect(() => {
    if (section !== 'workspace') {
      clearWorkspaceNavigation()
    }
  }, [section])

  useEffect(() => {
    if (avatarLookContext) {
      saveAvatarLookContext(avatarLookContext)
    } else {
      clearAvatarLookContext()
    }
  }, [avatarLookContext])

  useEffect(() => {
    if (section === 'create-avatar-look' && !avatarLookContext) {
      goToSection('avatars')
    }
  }, [section, avatarLookContext, goToSection])

  useEffect(() => {
    if (section === 'template-details' && !selectedTemplateForDetails) {
      goToSection('templates')
    }
  }, [section, selectedTemplateForDetails, goToSection])

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
            aria-label={isAdminPortal ? 'Back to platform' : 'Virtual Studio, go to home'}
          >
            <span className="dashboard-sidebar-brand-logo" aria-hidden>
              V
            </span>
            <span className="dashboard-sidebar-brand-name">Virtual Studio</span>
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
            onNavigateHelp={() => goToSection('help')}
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
              onNavigate={goToSection}
              onShowAIAssistant={() => setShowAIAssistant(true)}
              onBrowseTemplates={() => goToSection('templates')}
              onSelectTemplate={(bundle) => {
                setSelectedTemplateForDetails(bundleToDetailsTemplate(bundle))
                goToSection('template-details')
              }}
            />
          )}
          {section === 'videos' && <Videos onCreate={handleOpenCreateVideoModal} onEdit={handleEditVideo} />}
          {section === 'avatars' && (
            <Avatars
              onCreate={handleOpenCreateVideoModal}
              onEdit={handleEditVideo} goToSection={goToSection}
              onCreateAvatar={() => goToSection('create-avatar')}
              onCreateLooks={openCreateAvatarLook}
            />
          )}
          {section === 'create-avatar' && (
            <CreateAvatar
              onBack={() => goToSection('avatars')}
              onOpenModal={(typeId) => setAvatarCreateTypeId(typeId)}
            />
          )}
          {section === 'create-avatar-look' && avatarLookContext && (
            <CreateAvatarLook
              context={avatarLookContext}
              onBack={closeCreateAvatarLook}
              onUseInVideo={(presenterSeed) => {
                clearAvatarLookContext()
                setAvatarLookContext(null)
                handleOpenCreateVideoModal({ presenterSeed })
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
                if (selectedTemplateForDetails) {
                  // Open CreateVideoModal at step 3 with the template pre-selected,
                  // so the user still fills in workspace / folder details before creating.
                  const bundleId = selectedTemplateForDetails.id || selectedTemplateForDetails.bundleId
                  handleOpenCreateVideoModal({
                    templateSeed: {
                      templateId: bundleId ? `bundle:${bundleId}` : null,
                      name: selectedTemplateForDetails.name || 'Untitled',
                      // Pass enough bundle shape so CreateVideoModal can resolve selectedTemplate
                      bundle: {
                        id: bundleId,
                        name: selectedTemplateForDetails.name,
                        scenes: selectedTemplateForDetails.bundleScenes || [],
                        coverScene: selectedTemplateForDetails.coverScene || null,
                        category: selectedTemplateForDetails.category || '',
                        description: selectedTemplateForDetails.description || '',
                      },
                    },
                  })
                }
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
          {section === 'help' && (
            <Help embedded onOpenBilling={() => goToSection('credits')} />
          )}
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
          presenterSeed={createVideoModalContext?.presenterSeed || null}
          templateSeed={createVideoModalContext?.templateSeed || null}
          onCreateVideo={handleCreateVideo}
        />
      )}
      {avatarCreateTypeId ? (
        <CreateAvatarModal
          isOpen={Boolean(avatarCreateTypeId)}
          typeOption={getAvatarTypeOption(avatarCreateTypeId)}
          onClose={() => setAvatarCreateTypeId(null)}
          onCreateLooks={(ctx) => {
            openCreateAvatarLook(ctx)
          }}
          onCompleted={() => {
            setAvatarCreateTypeId(null)
            goToSection('avatars')
          }}
        />
      ) : null}
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
        <NotificationsQuickModal
          onClose={() => {
            setShowNotificationsModal(false)
            refreshInboxUnread()
          }}
          onUnreadCountChange={setInboxUnreadCount}
        />
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
