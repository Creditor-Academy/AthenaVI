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
import Trash from './Trash.jsx'
import Avatars from './Avatars.jsx'

const styles = `
.dashboard-shell {
  height: 100vh;
  display: grid;
  grid-template-rows: 64px 1fr;
  background: #ffffff;
  color: #0f172a;
  font-family: 'Arial', sans-serif;
  overflow: hidden;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 32px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 3;
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 4px 12px rgba(0, 0, 0, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.top-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.brand {
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #1e293b;
  font-size: 24px;
  background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search {
  width: 100%;
  max-width: 400px;
  height: 44px;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 0 16px 0 48px;
  font-size: 15px;
  background: #ffffff;
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.05),
    inset 0 1px 2px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
  position: relative;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: 16px center;
  background-size: 20px;
}

.search::placeholder {
  color: #94a3b8;
  font-weight: 500;
}

.search:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 
    0 0 0 3px rgba(59, 130, 246, 0.1),
    0 4px 12px rgba(59, 130, 246, 0.15);
  transform: translateY(-1px);
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.create-btn {
  border: none;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%);
  color: #ffffff;
  font-weight: 600;
  font-size: 15px;
  padding: 12px 24px;
  border-radius: 16px;
  cursor: pointer;
  box-shadow: 
    0 4px 12px rgba(59, 130, 246, 0.25),
    0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.02em;
}

.create-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s ease;
}

.create-btn:hover::before {
  left: 100%;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 20px rgba(59, 130, 246, 0.35),
    0 4px 8px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%);
}

.create-btn:active {
  transform: translateY(0);
  box-shadow: 
    0 2px 8px rgba(59, 130, 246, 0.3),
    0 1px 3px rgba(0, 0, 0, 0.1);
}

.avatar-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 3px solid #ffffff;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%);
  color: #ffffff;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 
    0 4px 12px rgba(59, 130, 246, 0.3),
    0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.avatar-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.avatar-btn:hover::before {
  opacity: 1;
}

.avatar-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 
    0 8px 20px rgba(59, 130, 246, 0.4),
    0 4px 8px rgba(0, 0, 0, 0.15);
  border-color: #f1f5f9;
}

.avatar-btn:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 
    0 2px 8px rgba(59, 130, 246, 0.3),
    0 1px 3px rgba(0, 0, 0, 0.1);
}

.profile-menu {
  position: absolute;
  right: 0;
  top: 56px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.12),
    0 4px 12px rgba(0, 0, 0, 0.08);
  min-width: 200px;
  overflow: hidden;
  display: grid;
  backdrop-filter: blur(10px);
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.profile-menu button {
  padding: 14px 18px;
  text-align: left;
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  transition: all 0.15s ease;
  position: relative;
}

.profile-menu button::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  transform: scaleY(0);
  transition: transform 0.15s ease;
}

.profile-menu button:hover {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  color: #1e293b;
  padding-left: 22px;
}

.profile-menu button:hover::before {
  transform: scaleY(1);
}

.profile-menu button:first-child {
  border-bottom: 1px solid #f1f5f9;
}

.layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  height: calc(100vh - 64px);
  overflow: hidden;
}

.sidebar {
  border-right: 1px solid #e5e7eb;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  height: 100%;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.05);
}

.sidebar::-webkit-scrollbar {
  width: 12px;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #94a3b8;
  border-radius: 6px;
  border: 2px solid transparent;
  background-clip: content-box;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

.sidebar::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 6px;
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #64748b;
  font-weight: 800;
  padding: 0 12px;
  margin-bottom: 8px;
}

.nav-item {
  padding: 14px 16px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  font-size: 14px;
}

.nav-item svg {
  font-size: 20px;
  opacity: 0.8;
}

.nav-item.active {
  background: linear-gradient(135deg, #2d6cf6 0%, #5cc6ff 100%);
  color: #ffffff;
  box-shadow: 0 8px 20px rgba(45, 108, 246, 0.3);
  border: 1px solid rgba(45, 108, 246, 0.2);
  transform: translateX(2px);
}

.nav-item:hover:not(.active) {
  background: #ffffff;
  border-color: #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateX(2px);
}

.nav-item:hover:not(.active) svg {
  opacity: 1;
  color: #2d6cf6;
}

.content {
  padding: 28px;
  background: #ffffff;
  overflow-y: auto;
  height: 100%;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.content::-webkit-scrollbar {
  width: 12px;
}

.content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 6px;
  border: 2px solid transparent;
  background-clip: content-box;
}

.content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.content::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 6px;
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
  border-radius: 20px;
  padding: 32px 36px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.15);
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  pointer-events: none;
}

.hero h1 {
  margin: 0;
  font-size: 36px;
  color: #ffffff;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.hero p {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  font-weight: 500;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
  margin-bottom: 36px;
}

.qa-card {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.qa-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(45, 108, 246, 0.1), transparent);
  transition: left 0.6s ease;
}

.qa-card:hover::before {
  left: 100%;
}

.qa-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12);
  border-color: #2d6cf6;
}

.qa-card svg {
  color: #2d6cf6;
  font-size: 24px;
  flex-shrink: 0;
}

.qa-meta {
  font-weight: 600;
  color: #64748b;
  font-size: 14px;
  margin-top: 4px;
}

.recents {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.recents-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 800;
  font-size: 22px;
  color: #1e293b;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
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
  border-radius: 16px;
  padding: 24px;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  min-height: 160px;
  display: grid;
  align-content: space-between;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2d6cf6, #5cc6ff);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.card:hover::before {
  transform: scaleX(1);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e1;
}

.card-title {
  font-weight: 700;
  margin: 0 0 8px;
  font-size: 18px;
  color: #1e293b;
}

.card-meta {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 20px;
  padding: 8px 14px;
  font-weight: 600;
  font-size: 13px;
  border: 1px solid;
  transition: all 0.2s ease;
}

.chip.draft {
  background: linear-gradient(135deg, #fff3e0, #ffe0b2);
  color: #ff9800;
  border-color: #ffcc80;
}

.chip.published {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  color: #4caf50;
  border-color: #a5d6a7;
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
              <div
                className={`nav-item ${section === 'trash' ? 'active' : ''}`}
                role="button"
                onClick={() => setSection('trash')}
              >
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
              <div
                className={`nav-item ${section === 'avatars' ? 'active' : ''}`}
                role="button"
                onClick={() => setSection('avatars')}
              >
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

            {section === 'avatars' && (
              <Avatars />
            )}

            {section === 'trash' && (
              <Trash />
            )}
          </main>
        </div>
      </div>
    </>
  )
}

export default Dashboard

