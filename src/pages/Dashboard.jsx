import { useState } from 'react'
import {
  MdHomeFilled,
  MdVideoLibrary,
  MdWorkspaces,
  MdGroup,
  MdVideoCameraBack,
  MdDelete,
  MdCollectionsBookmark,
  MdColorLens,
  MdPerson,
  MdRecordVoiceOver,
  MdPlayCircleFilled,
  MdAutoAwesome,
  MdTranslate,
  MdSlideshow,
  MdAccessTime,
  MdCheckCircle,
  MdGridView,
  MdViewList,
  MdTrendingUp,
  MdPlayArrow,
  MdMoreVert,
  MdAccountBalanceWallet,
  MdSearch,
  MdHelpOutline,
  MdNotificationsNone,
  MdAdd,
  MdSettings,
  MdCloudUpload,
  MdImage,
  MdAudiotrack,
  MdWallpaper,
  MdAdminPanelSettings
} from 'react-icons/md'
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
import VoiceCreatePanel from '../components/VoiceCreatePanel.jsx'
import AIVideoAssistant from '../components/AIVideoAssistant.jsx'
import ImportPowerPointModal from '../components/ImportPowerPointModal.jsx'
import TranslateVideoModal from '../components/TranslateVideoModal.jsx'
import './Dashboard.css'

function HomeSection({ onCreate, onShowAIAssistant }) {
  const stats = [
    { label: 'Total Videos', value: '24', trend: '+2', icon: <MdVideoLibrary />, color: 'blue' },
    { label: 'Draft Projects', value: '12', trend: null, icon: <MdCollectionsBookmark />, color: 'purple' },
    { label: 'Published Videos', value: '12', trend: null, icon: <MdCheckCircle />, color: 'green' }
  ]

  const recentProjects = [
    { id: 1, title: 'Introduction to Digital Marketing', scenes: 8, updated: '2 hours ago', thumb: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400' },
    { id: 2, title: 'UI/UX Design Fundamentals', scenes: 5, updated: 'Yesterday', thumb: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=400' }
  ]

  const templates = [
    { title: 'Educational Lecture', meta: '12 scenes • Academic style', thumb: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=300' },
    { title: 'Corporate Onboarding', meta: '8 scenes • Professional', thumb: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=300' },
    { title: 'Software Tutorial', meta: '15 scenes • Dynamic', thumb: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=300' },
    { title: 'Product Reveal', meta: '6 scenes • High Energy', thumb: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=300' }
  ]

  const media = [
    { name: 'instructor_profile_01.png', meta: 'Image • 2.4 MB', type: 'image', icon: <MdImage /> },
    { name: 'background_music_uplifting.mp3', meta: 'Audio • 4.1 MB', type: 'audio', icon: <MdAudiotrack /> },
    { name: 'modern_office_backdrop.jpg', meta: 'Image • 1.8 MB', type: 'bg', icon: <MdWallpaper /> }
  ]

  return (
    <div className="home-container">
      <div className="welcome-header">
        <div className="welcome-text">
          <h1>Welcome back, Alex!</h1>
          <p>Create and manage your instructor videos.</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">Browse Templates</button>
          <button className="btn-primary" onClick={onCreate}>Create New Video</button>
        </div>
      </div>

      <div className="stats-container">
        {stats.map((stat, i) => (
          <div key={i} className={`stat-card ${stat.color}`}>
            <div className="stat-card-left">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">
                <span className="stat-number">{stat.value}</span>
                {stat.trend && <span className="stat-trend">{stat.trend}</span>}
              </div>
            </div>
            <div className="stat-card-icon">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="main-grid">
        <div className="main-left">
          <div className="section-header">
            <h2>Recent Projects</h2>
            <div className="view-all">View all projects</div>
          </div>
          <div className="projects-grid">
            {recentProjects.map(project => (
              <div key={project.id} className="project-card">
                <div className="project-thumb-container">
                  <img src={project.thumb} alt={project.title} className="project-thumb" />
                  <div className="project-overlay">
                    <button className="btn-edit-premium" onClick={onCreate}>Open Editor</button>
                  </div>
                </div>
                <div className="project-content">
                  <div className="project-info">
                    <h3>{project.title}</h3>
                    <div className="project-meta">
                      <MdAccessTime size={14} /> {project.updated} • {project.scenes} scenes
                    </div>
                  </div>
                  <div className="project-actions">
                    <button className="btn-edit-premium" style={{ width: '100%' }} onClick={onCreate}>Edit Video</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="section-header" style={{ marginTop: '24px' }}>
            <h2>Recommended Templates</h2>
            <div className="view-all">Browse all</div>
          </div>
          <div className="templates-scroll">
            {templates.map((template, i) => (
              <div key={i} className="template-card">
                <img src={template.thumb} alt={template.title} className="template-thumb" />
                <div className="template-info">
                  <h4>{template.title}</h4>
                  <div className="template-meta">{template.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="main-right">
          <div className="sidebar-glass-panel">
            <div className="sidebar-section">
              <div className="section-header">
                <h2>Quick Actions</h2>
              </div>
              <div className="quick-actions-grid">
                <div className="action-btn" onClick={onCreate}>
                  <div className="action-icon blue"><MdAdd /></div>
                  <div className="action-label">New Video</div>
                </div>
                <div className="action-btn">
                  <div className="action-icon purple"><MdCloudUpload /></div>
                  <div className="action-label">Upload</div>
                </div>
                <div className="action-btn">
                  <div className="action-icon orange"><MdCollectionsBookmark /></div>
                  <div className="action-label">Templates</div>
                </div>
                <div className="action-btn">
                  <div className="action-icon green"><MdVideoLibrary /></div>
                  <div className="action-label">Library</div>
                </div>
              </div>
            </div>

            <div className="sidebar-section">
              <div className="section-header">
                <h2>Recent Media</h2>
              </div>
              <div className="media-preview-list">
                {media.map((item, i) => (
                  <div key={i} className="media-row">
                    <div className={`media-row-icon ${item.type}`}>{item.icon}</div>
                    <div className="media-row-details">
                      <p className="media-row-name">{item.name}</p>
                      <p className="media-row-meta">{item.meta}</p>
                    </div>
                    <button className="more-btn"><MdMoreVert /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Dashboard({ onLogout, onCreate }) {
  const [section, setSection] = useState('home')
  const [showVoicePanel, setShowVoicePanel] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showTranslateModal, setShowTranslateModal] = useState(false)
  const [selectedTemplateForDetails, setSelectedTemplateForDetails] = useState(null)

  const navItems = [
    { id: 'home', label: 'Dashboard', icon: <MdHomeFilled /> },
    { id: 'videos', label: 'My Videos', icon: <MdVideoLibrary /> },
    { id: 'avatars', label: 'Avatars', icon: <MdPerson /> },
    { id: 'templates', label: 'Templates', icon: <MdColorLens /> },
    { id: 'library', label: 'Media Library', icon: <MdCollectionsBookmark /> },
    { id: 'team-workspace', label: 'Team Workspace', icon: <MdGroup /> },
  ]

  const creationItems = [
    { id: 'create', label: 'Create Video', icon: <MdAdd /> },
  ]

  const systemItems = [
    { id: 'admin-portal', label: 'Admin Portal', icon: <MdAdminPanelSettings /> },
    { id: 'settings', label: 'Settings', icon: <MdSettings /> },
  ]

  return (
    <div className="dashboard-shell">
      <header className="topbar">
        <div className="top-left">
          <div className="brand">
            <div className="brand-logo">V</div>
            <span>Virtual Instructor</span>
          </div>
        </div>
        
        <div className="search-container">
          <MdSearch className="search-icon" />
          <input className="search-input" placeholder="Search videos, templates, or media..." />
        </div>

        <div className="top-right-actions">
          <button className="icon-btn"><MdHelpOutline /></button>
          <button className="icon-btn"><MdNotificationsNone /></button>
          <img src="https://ui-avatars.com/api/?name=Alex+Johnson&background=0D8ABC&color=fff" alt="Profile" className="profile-avatar" onClick={() => setSection('profile')} />
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-group">
            {navItems.map(item => (
              <div 
                key={item.id} 
                className={`nav-item ${section === item.id ? 'active' : ''}`}
                onClick={() => setSection(item.id)}
              >
                {item.icon} {item.label}
              </div>
            ))}
          </div>

          <div className="sidebar-group">
            <div className="sidebar-label">Creation</div>
            {creationItems.map(item => (
              <div 
                key={item.id} 
                className={`nav-item ${section === item.id ? 'active' : ''}`}
                onClick={() => {
                  if(item.id === 'create') onCreate()
                  else setSection(item.id)
                }}
              >
                {item.icon} {item.label}
              </div>
            ))}
          </div>

          <div className="sidebar-group">
            <div className="sidebar-label">System</div>
            {systemItems.map(item => (
              <div 
                key={item.id} 
                className={`nav-item ${section === item.id ? 'active' : ''}`}
                onClick={() => setSection(item.id)}
              >
                {item.icon} {item.label}
              </div>
            ))}
          </div>
        </aside>

        <main className={`content ${!['library', 'avatars', 'templates', 'template-details', 'team-workspace', 'admin-portal'].includes(section) ? 'with-padding' : ''}`}>
          {section === 'home' && (
            <HomeSection 
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
                setSection('template-details')
              }} 
            />
          )}
          {section === 'template-details' && (
            <TemplateDetails 
              template={selectedTemplateForDetails} 
              onBack={() => setSection('templates')}
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
          {section === 'credits' && <Credits onBack={() => setSection('home')} />}
          {section === 'profile' && <Profile onBack={() => setSection('home')} />}
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
          onCreate={(data) => {
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
