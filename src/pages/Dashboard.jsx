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
} from 'react-icons/md'
import Videos from './Videos.jsx'

const styles = `
.dashboard-shell {
  min-height: 100vh;
  display: grid;
  grid-template-rows: 64px 1fr;
  background: #ffffff;
  color: #0f172a;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f8fbff 0%, #eef3ff 100%);
  position: sticky;
  top: 0;
  z-index: 3;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
}

.top-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.brand {
  font-weight: 800;
  letter-spacing: 0.02em;
  color: #0f3f9e;
  font-size: 20px;
}

.search {
  width: 100%;
  max-width: 360px;
  height: 38px;
  border: 1px solid #e1e5ee;
  border-radius: 12px;
  padding: 0 14px;
  font-size: 14px;
  background: #ffffff;
  box-shadow:
    inset 0 1px 2px rgba(0, 0, 0, 0.04),
    0 6px 18px rgba(15, 23, 42, 0.06);
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.create-btn {
  border: none;
  background: linear-gradient(135deg, #2d6cf6 0%, #5cc6ff 100%);
  color: #ffffff;
  font-weight: 700;
  padding: 10px 18px;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 10px 22px rgba(45, 108, 246, 0.25);
  transition: transform 0.15s ease, box-shadow 0.2s ease;
}

.create-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 26px rgba(45, 108, 246, 0.32);
}

.avatar-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #2d6cf6, #5cc6ff);
  color: #ffffff;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(45, 108, 246, 0.28);
}

.profile-menu {
  position: absolute;
  right: 0;
  top: 48px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.16);
  min-width: 180px;
  overflow: hidden;
  display: grid;
}

.profile-menu button {
  padding: 12px 14px;
  text-align: left;
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 600;
  color: #0f172a;
}

.profile-menu button:hover {
  background: #f3f4f6;
}

.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: calc(100vh - 64px);
}

.sidebar {
  border-right: 1px solid #e5e7eb;
  background: #f8fafc;
  padding: 20px 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  max-height: calc(100vh - 64px);
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.sidebar::-webkit-scrollbar {
  width: 8px;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 8px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-title {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9ca3af;
  font-weight: 700;
  padding: 0 10px;
}

.nav-item {
  padding: 12px 14px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-item svg {
  font-size: 18px;
}

.nav-item.active {
  background: linear-gradient(135deg, #2d6cf6 0%, #5cc6ff 100%);
  color: #ffffff;
  box-shadow: 0 10px 22px rgba(45, 108, 246, 0.25);
}

.content {
  padding: 28px;
  background: #ffffff;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.section-title {
  margin: 0;
  font-size: 24px;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  font-weight: 600;
  color: #0f172a;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pill:hover {
  border-color: #cbd5e1;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.05);
}

.pill.active {
  border-color: #2d6cf6;
  background: linear-gradient(135deg, #e0ecff, #f6f9ff);
  color: #0f3f9e;
  box-shadow: 0 8px 20px rgba(45, 108, 246, 0.12);
}

.hero {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 18px 20px;
  background: linear-gradient(135deg, #eef3ff 0%, #f8fbff 100%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  margin-bottom: 22px;
}

.hero h1 {
  margin: 0;
  font-size: 30px;
}

.hero p {
  margin: 0;
  color: #475467;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 28px;
}

.qa-card {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #f8fbff 0%, #eef3ff 100%);
  font-weight: 700;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.05);
  justify-content: space-between;
  cursor: pointer;
}

.qa-card svg {
  color: #2d6cf6;
  font-size: 20px;
}

.qa-meta {
  font-weight: 600;
  color: #475467;
  font-size: 13px;
}

.recents {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.recents-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  font-size: 18px;
  color: #0f172a;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.video-card {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
  overflow: hidden;
  display: grid;
  grid-template-rows: 150px auto;
  position: relative;
}

.thumb {
  position: relative;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.thumb .badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 8px;
  padding: 6px 10px;
  font-weight: 700;
  font-size: 12px;
}

.video-body {
  padding: 12px 14px;
  display: grid;
  gap: 6px;
}

.video-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.ghost-btn {
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #0f172a;
  font-weight: 700;
  border-radius: 10px;
  padding: 6px 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.ghost-btn:hover {
  border-color: #cbd5e1;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.05);
}

.video-title {
  margin: 0;
  font-weight: 800;
  font-size: 16px;
  color: #0f172a;
}

.video-meta {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
}

.video-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
}

.label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #eef2ff;
  color: #334155;
  font-weight: 700;
  font-size: 12px;
}

.label.primary {
  background: #e0f2fe;
  color: #075985;
}

.label.accent {
  background: #f5f3ff;
  color: #5b21b6;
}

.dot-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  border: none;
  background: rgba(15, 23, 42, 0.82);
  color: #ffffff;
  border-radius: 10px;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.2);
  transition: all 0.15s ease;
  z-index: 4;
}

.dot-btn:hover {
  background: rgba(15, 23, 42, 0.92);
}

.card-menu {
  position: absolute;
  top: 46px;
  right: 10px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.12);
  display: grid;
  min-width: 160px;
  overflow: hidden;
  z-index: 10;
}

.card-menu button {
  border: none;
  background: transparent;
  padding: 10px 12px;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #0f172a;
  cursor: pointer;
  transition: background 0.15s ease;
}

.card-menu button:hover {
  background: #f5f7fb;
}

.card {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 14px 16px;
  background: #ffffff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.03);
  min-height: 140px;
  display: grid;
  align-content: space-between;
}

.card-title {
  font-weight: 700;
  margin: 0 0 6px;
}

.card-meta {
  color: #6b7280;
  font-size: 13px;
  margin: 0;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 6px 10px;
  background: #eef2ff;
  color: #334155;
  font-weight: 700;
  font-size: 12px;
}

.chip.draft {
  background: #fff7ed;
  color: #9a3412;
}

.chip.published {
  background: #ecfdf3;
  color: #166534;
}

/* Create page */
.creator-wrap {
  display: grid;
  grid-template-columns: 240px 1fr 280px;
  gap: 16px;
  align-items: start;
}

.creator-left {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  display: grid;
  gap: 10px;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
}

.scene-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 8px;
  background: #ffffff;
  display: grid;
  gap: 6px;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.05);
}

.scene-thumb {
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  height: 90px;
}

.creator-main {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.06);
  display: grid;
  gap: 12px;
}

.canvas {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  min-height: 360px;
  background: #ffffff;
  display: grid;
  place-items: center;
  padding: 16px;
}

.canvas img {
  max-height: 280px;
}

.timeline {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px;
  background: #f8fafc;
  min-height: 120px;
}

.creator-right {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  display: grid;
  gap: 12px;
}

.panel {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px;
  background: #ffffff;
  display: grid;
  gap: 6px;
}
`

function Dashboard({ onLogout, onCreate }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [section, setSection] = useState('home')

  const handleViewProfile = () => {
    alert('Profile page coming soon.')
    setMenuOpen(false)
  }

  const handleLogout = () => {
    setMenuOpen(false)
    if (onLogout) onLogout()
  }

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard-shell">
        <header className="topbar">
          <div className="top-left">
            <div className="brand">AthenaVI</div>
          </div>
          <div className="top-actions">
            <input className="search" placeholder="Search" />
            <button className="create-btn" type="button">
              Create
            </button>
            <button className="avatar-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="Profile menu">
              P
            </button>
            {menuOpen && (
              <div className="profile-menu">
                <button type="button" onClick={handleViewProfile}>
                  View profile
                </button>
                <button type="button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="layout">
          <aside className="sidebar">
            <div className="sidebar-section">
              <div className="sidebar-title">Navigation</div>
              <div
                className={`nav-item ${section === 'home' ? 'active' : ''}`}
                role="button"
                onClick={() => setSection('home')}
              >
                <MdHomeFilled /> Home
              </div>
              <div
                className={`nav-item ${section === 'videos' ? 'active' : ''}`}
                role="button"
                onClick={() => setSection('videos')}
              >
                <MdVideoLibrary /> Videos
              </div>
              <div className="nav-item">
                <MdWorkspaces /> Workspace
              </div>
              <div className="nav-item">
                <MdGroup /> Shared with me
              </div>
              <div className="nav-item">
                <MdVideoCameraBack /> My videos
              </div>
              <div className="nav-item">
                <MdDelete /> Trash
              </div>
            </div>
            <div className="sidebar-section">
              <div className="sidebar-title">Assets</div>
              <div className="nav-item">
                <MdCollectionsBookmark /> Library
              </div>
              <div className="nav-item">
                <MdColorLens /> Brand Kits
              </div>
              <div className="nav-item">
                <MdPerson /> Avatars
              </div>
              <div className="nav-item">
                <MdRecordVoiceOver /> Voices
              </div>
            </div>
          </aside>
          <main className="content">
            {section === 'home' && (
              <>
                <div className="hero">
                  <h1>Home</h1>
                  <p>Welcome back. Pick an action to get started.</p>
                </div>

                <div className="quick-actions">
                  <div className="qa-card" onClick={() => onCreate && onCreate()}>
                    <div>
                      <div><MdPlayCircleFilled /> Create a video</div>
                      <div className="qa-meta">Start from a blank canvas</div>
                    </div>
                    <span>▶</span>
                  </div>
                  <div className="qa-card">
                    <div>
                      <div><MdAutoAwesome /> Create with AI</div>
                      <div className="qa-meta">Generate scripts & scenes</div>
                    </div>
                    <span>✨</span>
                  </div>
                  <div className="qa-card">
                    <div>
                      <div><MdTranslate /> Translate any video</div>
                      <div className="qa-meta">Auto-dub in new languages</div>
                    </div>
                    <span>🌐</span>
                  </div>
                  <div className="qa-card">
                    <div>
                      <div><MdSlideshow /> Import PowerPoint</div>
                      <div className="qa-meta">Turn slides into a video</div>
                    </div>
                    <span>📥</span>
                  </div>
                </div>

                <div className="recents">
                  <div className="recents-title">My recents</div>
                  <div className="cards">
                    <div className="card">
                      <div>
                        <p className="card-title">Project Alpha</p>
                        <p className="card-meta">Updated 2h ago</p>
                      </div>
                      <div className="chip draft">
                        <MdAccessTime /> Draft
                      </div>
                    </div>
                    <div className="card">
                      <div>
                        <p className="card-title">Client Intro</p>
                        <p className="card-meta">Updated yesterday</p>
                      </div>
                      <div className="chip published">
                        <MdCheckCircle /> Published
                      </div>
                    </div>
                    <div className="card">
                      <div>
                        <p className="card-title">Team Update</p>
                        <p className="card-meta">Updated 3d ago</p>
                      </div>
                      <div className="chip draft">
                        <MdAccessTime /> Draft
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {section === 'videos' && (
              <Videos />
            )}
          </main>
        </div>
      </div>
    </>
  )
}

export default Dashboard

