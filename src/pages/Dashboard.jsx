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
} from 'react-icons/md'
import Videos from './Videos.jsx'
import Trash from './Trash.jsx'
import Avatars from './Avatars.jsx'
import Voices from './Voices.jsx'
import Library from './Library.jsx'
import SharedWithMe from './SharedWithMe.jsx'
import Workspace from './Workspace.jsx'
import Profile from './Profile.jsx'
import BrandKits from './BrandKits.jsx'
import VoiceCreatePanel from '../components/VoiceCreatePanel.jsx'

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
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  font-weight: 700;
  font-size: 15px;
  padding: 11px 22px;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 
    0 2px 8px rgba(59, 130, 246, 0.3),
    0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.01em;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
}

.create-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
  transition: left 0.5s ease;
}

.create-btn:hover::before {
  left: 100%;
}

.create-btn:hover {
  transform: translateY(-1px);
  box-shadow: 
    0 4px 16px rgba(59, 130, 246, 0.4),
    0 2px 6px rgba(0, 0, 0, 0.12);
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.create-btn:active {
  transform: translateY(0);
  box-shadow: 
    0 2px 6px rgba(59, 130, 246, 0.3),
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
  border: none;
  border-radius: 0;
  padding: 0;
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 40px;
  position: relative;
}

.hero h1 {
  margin: 0;
  font-size: 32px;
  color: #0f172a;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.hero p {
  margin: 0;
  color: #64748b;
  font-size: 15px;
  font-weight: 400;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 48px;
}

.qa-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.qa-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.qa-card-icon {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  background: #f1f5f9;
  color: #475569;
}

.qa-card-icon.primary {
  background: #f1f5f9;
  color: #475569;
}

.qa-card-icon.purple {
  background: #f1f5f9;
  color: #475569;
}

.qa-card-icon.orange {
  background: #f1f5f9;
  color: #475569;
}

.qa-card-title {
  font-weight: 600;
  color: #0f172a;
  font-size: 14px;
  margin: 0;
  line-height: 1.4;
}

.qa-meta {
  font-weight: 400;
  color: #64748b;
  font-size: 12px;
  margin: 0;
  line-height: 1.4;
}

.recents-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.recents-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.recents-tabs {
  display: flex;
  align-items: center;
  gap: 0;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0;
}

.recents-tab {
  padding: 10px 20px;
  border: none;
  background: transparent;
  font-weight: 500;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
}

.recents-tab.active {
  color: #0f172a;
  border-bottom-color: #0f172a;
  font-weight: 600;
}

.recents-tab:hover:not(.active) {
  color: #334155;
}

.recents-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-toggle {
  display: flex;
  align-items: center;
  gap: 0;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 2px;
}

.view-toggle-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-size: 18px;
}

.view-toggle-btn.active {
  background: #ffffff;
  color: #3b82f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.recent-videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.recent-videos-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recent-video-card {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #ffffff;
  overflow: hidden;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
}

.recent-video-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.recent-video-card.list-view {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 16px;
}

.recent-video-thumb {
  width: 100%;
  height: 140px;
  background: #f8fafc;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.recent-video-card.list-view .recent-video-thumb {
  width: 200px;
  height: 112px;
  border-radius: 6px;
}

.recent-video-thumb-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recent-video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 60%);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 10px;
}

.recent-video-badge {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 10px;
  font-weight: 600;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 4px;
  letter-spacing: 0.02em;
}

.recent-video-badge.draft {
  background: rgba(255, 255, 255, 0.9);
  color: #64748b;
}

.recent-video-duration {
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  padding: 3px 7px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 3px;
  font-family: 'Courier New', monospace;
}

.recent-video-menu-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  color: #334155;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  font-size: 18px;
}

.recent-video-menu-btn:hover {
  background: #ffffff;
  transform: scale(1.08);
}

.recent-video-info {
  padding: 14px;
  flex: 1;
}

.recent-video-card.list-view .recent-video-info {
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
}

.recent-video-title {
  font-size: 13px;
  font-weight: 500;
  color: #0f172a;
  margin: 0 0 4px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recent-video-card.list-view .recent-video-title {
  font-size: 14px;
  margin-bottom: 4px;
  -webkit-line-clamp: 1;
}

.recent-video-meta {
  font-size: 11px;
  color: #64748b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 400;
}

.recent-video-card.list-view .recent-video-meta {
  font-size: 12px;
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

const defaultThumbnailUrl = 'https://media.istockphoto.com/id/1475888355/video/timelapse-of-the-creation-of-an-online-avatar-start-to-finish.jpg?s=640x640&k=20&c=pFzBOkU7LjC1DF0DeNCAUhS8MCiNwSDwkqI9v9C7IgQ='

function HomeSection({ onCreate }) {
  const [activeTab, setActiveTab] = useState('recents')
  const [viewMode, setViewMode] = useState('grid')

  const recentVideos = [
    {
      id: 1,
      title: 'pre-authorization vid1',
      status: 'draft',
      avatar: 'Vera',
      description: 'One stay, Three Confusing Lines',
      duration: null,
      updated: '2 hours ago',
      thumbnail: null
    },
    {
      id: 2,
      title: 'Copy of Untitled',
      status: 'draft',
      avatar: null,
      description: 'Learning Management System',
      duration: null,
      updated: '1 day ago',
      thumbnail: null
    },
    {
      id: 3,
      title: 'Learning I8',
      status: 'published',
      avatar: null,
      description: null,
      duration: '00:42',
      updated: '3 days ago',
      thumbnail: null
    },
    {
      id: 4,
      title: 'Public vs Private — Two Ways to Operate',
      status: 'published',
      avatar: null,
      description: null,
      duration: '01:48',
      updated: '1 week ago',
      thumbnail: null
    },
    {
      id: 5,
      title: 'Introduction',
      status: 'published',
      avatar: 'CREDITOR ACADEMY',
      description: null,
      duration: '01:14',
      updated: '2 weeks ago',
      thumbnail: null
    },
  ]

  const trendingVideos = [
    {
      id: 6,
      title: 'Product Launch 2024',
      status: 'published',
      avatar: null,
      description: null,
      duration: '02:15',
      updated: '3 days ago',
      views: '1.2K',
      thumbnail: null
    },
    {
      id: 7,
      title: 'Team Training Series',
      status: 'published',
      avatar: null,
      description: null,
      duration: '05:30',
      updated: '1 week ago',
      views: '856',
      thumbnail: null
    },
  ]

  const displayVideos = activeTab === 'recents' ? recentVideos : trendingVideos

  return (
    <>
      <div className="hero">
        <h1>Home</h1>
        <p>Welcome back. Pick an action to get started.</p>
      </div>

      <div className="quick-actions">
        <div className="qa-card" onClick={() => onCreate && onCreate()}>
          <div className="qa-card-icon primary">
            <MdPlayCircleFilled />
          </div>
          <div>
            <h3 className="qa-card-title">Create a video</h3>
            <p className="qa-meta">From template or blank</p>
          </div>
        </div>
        <div className="qa-card">
          <div className="qa-card-icon purple">
            <MdAutoAwesome />
          </div>
          <div>
            <h3 className="qa-card-title">Create with AI</h3>
            <p className="qa-meta">From any source</p>
          </div>
        </div>
        <div className="qa-card">
          <div className="qa-card-icon primary">
            <MdTranslate />
          </div>
          <div>
            <h3 className="qa-card-title">Translate any video</h3>
            <p className="qa-meta">Dub into any language</p>
          </div>
        </div>
        <div className="qa-card">
          <div className="qa-card-icon orange">
            <MdSlideshow />
          </div>
          <div>
            <h3 className="qa-card-title">Import PowerPoint</h3>
            <p className="qa-meta">Convert slides to scenes</p>
          </div>
        </div>
      </div>

      <div className="recents-section">
        <div className="recents-header">
          <div className="recents-tabs">
            <button
              className={`recents-tab ${activeTab === 'recents' ? 'active' : ''}`}
              onClick={() => setActiveTab('recents')}
            >
              My recents
            </button>
            <button
              className={`recents-tab ${activeTab === 'trending' ? 'active' : ''}`}
              onClick={() => setActiveTab('trending')}
            >
              Trending
            </button>
          </div>
          <div className="recents-controls">
            <div className="view-toggle">
              <button
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <MdGridView />
              </button>
              <button
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <MdViewList />
              </button>
            </div>
          </div>
        </div>

        <div className={viewMode === 'grid' ? 'recent-videos-grid' : 'recent-videos-list'}>
          {displayVideos.map((video) => (
            <div
              key={video.id}
              className={`recent-video-card ${viewMode === 'list' ? 'list-view' : ''}`}
            >
              <div className="recent-video-thumb">
                <img 
                  src={video.thumbnail || defaultThumbnailUrl} 
                  alt={video.title} 
                  className="recent-video-thumb-image" 
                />
                <div className="recent-video-overlay">
                  {video.status === 'draft' && (
                    <div className={`recent-video-badge draft`}>
                      <MdAccessTime size={14} />
                      DRAFT
                      {video.description && (
                        <>
                          <span style={{ margin: '0 4px' }}>•</span>
                          {video.description}
                        </>
                      )}
                    </div>
                  )}
                  {video.avatar && (
                    <div className="recent-video-badge" style={{ fontSize: '10px' }}>
                      {video.avatar}
                    </div>
                  )}
                </div>
                {video.duration && (
                  <div className="recent-video-duration">
                    <MdPlayArrow size={12} />
                    {video.duration}
                  </div>
                )}
                <button className="recent-video-menu-btn">
                  <MdMoreVert />
                </button>
              </div>
              <div className="recent-video-info">
                <h4 className="recent-video-title">{video.title}</h4>
                <p className="recent-video-meta">
                  {video.updated}
                  {activeTab === 'trending' && video.views && (
                    <>
                      <span>•</span>
                      {video.views} views
                    </>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function Dashboard({ onLogout, onCreate }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [section, setSection] = useState('home')
  const [showVoicePanel, setShowVoicePanel] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState(null)

  const handleViewProfile = () => {
    setSection('profile')
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
            <button className="create-btn" type="button" onClick={onCreate}>
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

        {section === 'profile' ? (
          <Profile onBack={() => setSection('home')} />
        ) : (
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
                <div
                  className={`nav-item ${section === 'workspace' ? 'active' : ''}`}
                  role="button"
                  onClick={() => setSection('workspace')}
                >
                <MdWorkspaces /> Workspace
              </div>
              <div
                className={`nav-item ${section === 'shared' ? 'active' : ''}`}
                role="button"
                onClick={() => setSection('shared')}
              >
                <MdGroup /> Shared with me
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
                <div
                  className={`nav-item ${section === 'library' ? 'active' : ''}`}
                  role="button"
                  onClick={() => setSection('library')}
                >
                <MdCollectionsBookmark /> Library
              </div>
                <div
                  className={`nav-item ${section === 'brandkits' ? 'active' : ''}`}
                  role="button"
                  onClick={() => setSection('brandkits')}
                >
                <MdColorLens /> Brand Kits
              </div>
              <div
                className={`nav-item ${section === 'avatars' ? 'active' : ''}`}
                role="button"
                onClick={() => setSection('avatars')}
              >
                <MdPerson /> Avatars
              </div>
                <div
                  className={`nav-item ${section === 'voices' ? 'active' : ''}`}
                  role="button"
                  onClick={() => setSection('voices')}
                >
                <MdRecordVoiceOver /> Voices
              </div>
            </div>
          </aside>
          <main className="content">
            {section === 'home' && (
                <HomeSection onCreate={onCreate} />
            )}

            {section === 'videos' && (
              <Videos onCreate={onCreate} />
            )}

            {section === 'avatars' && (
              <Avatars />
            )}

            {section === 'trash' && (
              <Trash />
            )}

              {section === 'voices' && (
                <Voices
                  onCreateVoice={() => {
                    setSelectedVoice(null)
                    setShowVoicePanel(true)
                  }}
                  onVoiceClick={(voice) => {
                    setSelectedVoice(voice)
                    setShowVoicePanel(true)
                  }}
                />
              )}

              {section === 'library' && (
                <Library />
              )}

              {section === 'shared' && (
                <SharedWithMe />
              )}

              {section === 'workspace' && (
                <Workspace onCreate={onCreate} />
              )}

              {section === 'brandkits' && (
                <BrandKits />
              )}
          </main>
        </div>
        )}
      </div>
      {showVoicePanel && (
        <VoiceCreatePanel
          voice={selectedVoice}
          onClose={() => {
            setShowVoicePanel(false)
            setSelectedVoice(null)
          }}
          onNext={() => {
            // Handle completion
            setShowVoicePanel(false)
            setSelectedVoice(null)
          }}
        />
      )}
    </>
  )
}

export default Dashboard

