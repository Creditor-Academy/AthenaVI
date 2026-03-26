import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MdSettings, 
  MdPersonAdd, 
  MdVideoLibrary, 
  MdGroup, 
  MdStorage, 
  MdAdd,
  MdBusiness,
  MdMail,
  MdNotifications,
  MdTrendingUp,
  MdMoreVert,
  MdSearch,
  MdFilterList,
  MdArrowDropDown,
  MdCheck,
  MdClose,
  MdPeople
} from 'react-icons/md';
import WorkspaceCreateForm from '../components/workspace/WorkspaceCreateForm.jsx';
import WorkspaceSettings from '../components/workspace/WorkspaceSettings.jsx';
import WorkspaceSidebar from '../components/workspace/WorkspaceSidebar.jsx';
import InviteMembersModal from '../components/workspace/InviteMembersModal.jsx';
import workspaceService from '../services/workspaceService.js';

const TeamWorkspace = ({ onCreate }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showWorkspaceSidebar, setShowWorkspaceSidebar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [projects, setProjects] = useState([]);

  // Load workspaces on component mount
  useEffect(() => {
    loadWorkspaces();
    loadInvitations();
    loadProjects();
  }, []);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      console.log('Loading workspaces...');
      const workspaceList = await workspaceService.listWorkspaces();
      console.log('Received workspace list:', workspaceList);
      setWorkspaces(workspaceList);
      
      // Set current workspace to first team workspace, or first workspace if no team workspaces
      const teamWorkspace = workspaceList.find(ws => ws.type === 'TEAM') || workspaceList[0];
      console.log('Selected current workspace:', teamWorkspace);
      if (teamWorkspace) {
        setCurrentWorkspace(teamWorkspace);
        loadWorkspaceMembers(teamWorkspace.id);
      }
    } catch (err) {
      console.error('Failed to load workspaces:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkspaceMembers = async (workspaceId) => {
    try {
      const memberList = await workspaceService.listWorkspaceMembers(workspaceId);
      setWorkspaceMembers(memberList);
    } catch (err) {
      console.error('Failed to load workspace members:', err);
      // Don't show error for members loading failure
    }
  };

  const loadInvitations = async () => {
    try {
      // Fetch real invitations from API service
      console.log('Loading invitations...');
      const invitations = await workspaceService.getInvitations();
      console.log('Loaded invitations:', invitations);
      setInvitations(invitations);
    } catch (err) {
      console.error('Failed to load invitations:', err);
      // Set empty array on error
      setInvitations([]);
    }
  };

  const loadProjects = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockProjects = [
        {
          id: '1',
          title: 'Product Launch Video',
          thumbnail: 'https://picsum.photos/seed/project1/400/300.jpg',
          members: ['Alice', 'Bob', 'Charlie'],
          updated: '2 hours ago'
        },
        {
          id: '2',
          title: 'Brand Campaign',
          thumbnail: 'https://picsum.photos/seed/project2/400/300.jpg',
          members: ['David', 'Eve'],
          updated: '1 day ago'
        }
      ];
      setProjects(mockProjects);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  const handleCreateWorkspace = async (formData) => {
    try {
      setLoading(true);
      setError('');
      
      const newWorkspace = await workspaceService.createWorkspace(formData);
      setWorkspaces([...workspaces, newWorkspace]);
      setCurrentWorkspace(newWorkspace);
      setShowCreateForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWorkspace = async (formData) => {
    try {
      setLoading(true);
      setError('');
      
      const updatedWorkspace = await workspaceService.updateWorkspace(currentWorkspace.id, formData);
      setWorkspaces(workspaces.map(w => w.id === updatedWorkspace.id ? updatedWorkspace : w));
      setCurrentWorkspace(updatedWorkspace);
      setShowSettings(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkspace = async (workspaceId) => {
    try {
      setLoading(true);
      await workspaceService.deleteWorkspace(workspaceId);
      
      // Remove from workspaces list
      setWorkspaces(workspaces.filter(w => w.id !== workspaceId));
      
      // Set new current workspace
      const remainingWorkspaces = workspaces.filter(w => w.id !== workspaceId);
      if (remainingWorkspaces.length > 0) {
        const newCurrent = remainingWorkspaces.find(ws => ws.type === 'TEAM') || remainingWorkspaces[0];
        setCurrentWorkspace(newCurrent);
        loadWorkspaceMembers(newCurrent.id);
      } else {
        setCurrentWorkspace(null);
      }
      
      setShowSettings(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMembers = async (inviteData) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('📧 Inviting member to workspace:');
      console.log('🏢 Workspace ID:', currentWorkspace?.id);
      console.log('📛 Workspace Name:', currentWorkspace?.name);
      console.log('👤 Invitee Email:', inviteData.email);
      console.log('👥 Role:', inviteData.role);
      
      if (!currentWorkspace?.id) {
        throw new Error('No workspace selected - please select a workspace first');
      }
      
      const inviteResult = await workspaceService.inviteMember(currentWorkspace.id, inviteData);
      console.log('✅ Invitation sent from workspace:', currentWorkspace.name);
      
      // Don't add to members list - they need to accept first
      setShowInviteModal(false);
      
      // Show success message
      alert(`Invitation sent to ${inviteData.email} successfully!`);
    } catch (err) {
      console.error('❌ Failed to send invitation:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      console.log('Accepting invitation:', invitationId);
      // API call to accept invitation
      const workspace = await workspaceService.acceptInvitation(invitationId);
      console.log('Successfully accepted invitation, workspace:', workspace);
      
      // Remove from invitations list
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
      
      // Refresh workspaces to get the new workspace
      await loadWorkspaces();
      
      // Switch to the new workspace if provided
      if (workspace) {
        setCurrentWorkspace(workspace);
        await loadWorkspaceMembers(workspace.id);
      }
    } catch (err) {
      console.error('Failed to accept invitation:', err);
      setError(err.message);
    }
  };

  const handleDeclineInvitation = async (invitationId) => {
    try {
      // API call to decline invitation
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
    } catch (err) {
      setError(err.message);
    }
  };

  const styles = `
    .team-workspace-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      display: flex;
      flex-direction: column;
    }

    /* Header Section */
    .workspace-header {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(226, 232, 240, 0.8);
      padding: 20px 32px;
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .header-title {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .header-title h1 {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .header-subtitle {
      font-size: 14px;
      color: #64748b;
      margin: 0;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      color: #475569;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .header-btn:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
      transform: translateY(-1px);
    }

    .header-btn.primary {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      border: none;
    }

    .header-btn.primary:hover {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    }

    /* Workspace Selector Trigger */
    .workspace-selector-trigger {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      min-width: 300px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);
      position: relative;
    }

    .workspace-selector-trigger:hover {
      border-color: #cbd5e1;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.08);
      transform: translateY(-1px);
    }

    .workspace-selector-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .workspace-selector-icon.private {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      color: #64748b;
      border: 1px solid #e2e8f0;
    }

    .workspace-selector-icon.team {
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      color: #2563eb;
      border: 1px solid #93c5fd;
    }

    .workspace-selector-info {
      flex: 1;
      min-width: 0;
    }

    .workspace-selector-name {
      font-size: 15px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 2px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .workspace-selector-type {
      font-size: 12px;
      color: #64748b;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .workspace-selector-arrow {
      color: #9ca3af;
      transition: transform 0.2s ease;
    }

    .workspace-role-badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 500;
      margin-left: 6px;
    }

    .workspace-role-badge.owner {
      background: #fef3c7;
      color: #92400e;
    }

    .workspace-role-badge.admin {
      background: #e0e7ff;
      color: #3730a3;
    }

    .workspace-role-badge.member {
      background: #f3f4f6;
      color: #374151;
    }

    /* Notification Button */
    .notification-btn {
      position: relative;
    }

    .notification-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #ef4444;
      color: white;
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
      line-height: 1;
    }

    /* Notifications Panel */
    .notifications-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 9999;
      display: flex;
      justify-content: flex-end;
    }

    .notifications-panel {
      width: 400px;
      height: 100vh;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border-left: 1px solid rgba(226, 232, 240, 0.8);
      box-shadow: -20px 0 40px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .notifications-header {
      padding: 24px 32px;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(226, 232, 240, 0.8);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .notifications-title {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .notifications-close {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background: rgba(255, 255, 255, 0.8);
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      border: 1px solid rgba(226, 232, 240, 0.8);
    }

    .notifications-close:hover {
      background: #f1f5f9;
      color: #475569;
      transform: scale(1.05);
    }

    .notifications-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px 32px;
    }

    .notifications-empty {
      text-align: center;
      padding: 60px 20px;
      color: #64748b;
    }

    .notifications-empty svg {
      font-size: 48px;
      color: #cbd5e1;
      margin-bottom: 16px;
    }

    .notifications-empty h3 {
      font-size: 18px;
      font-weight: 600;
      color: #475569;
      margin: 0 0 8px 0;
    }

    .notifications-empty p {
      font-size: 14px;
      color: #64748b;
      margin: 0;
    }

    .invitations-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .invitation-card {
      background: white;
      border: 1px solid #f1f5f9;
      border-radius: 16px;
      padding: 20px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .invitation-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .invitation-card:hover {
      border-color: #3b82f6;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
    }

    .invitation-card:hover::before {
      opacity: 1;
    }

    .invitation-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 16px;
    }

    .invitation-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      color: #2563eb;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    }

    .invitation-details {
      flex: 1;
      min-width: 0;
    }

    .invitation-workspace {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 4px 0;
      line-height: 1.3;
    }

    .invitation-meta {
      font-size: 13px;
      color: #64748b;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .invitation-role {
      padding: 2px 8px;
      background: #dbeafe;
      color: #2563eb;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .invitation-actions {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }

    .invitation-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 16px;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .invitation-btn.accept {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }

    .invitation-btn.accept:hover {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      transform: translateY(-1px);
    }

    .invitation-btn.decline {
      background: #f8fafc;
      color: #64748b;
      border: 1px solid #e2e8f0;
    }

    .invitation-btn.decline:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }

    .notifications-footer {
      padding: 20px 32px;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(20px);
      border-top: 1px solid rgba(226, 232, 240, 0.8);
      text-align: center;
    }

    .footer-text {
      font-size: 12px;
      color: #64748b;
    }

    /* Main Layout */
    .workspace-main {
      display: flex;
      flex: 1;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
      padding: 32px;
      gap: 32px;
    }

    .workspace-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    /* Cards */
    .glass-card {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.8);
      border-radius: 24px;
      padding: 32px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    .card-title {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .card-title svg {
      color: #2563eb;
    }

    /* Invitations Section */
    .invitations-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .invitation-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px;
      background: white;
      border: 1px solid #f1f5f9;
      border-radius: 16px;
      transition: all 0.2s ease;
    }

    .invitation-item:hover {
      border-color: #e2e8f0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .invitation-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .invitation-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #2563eb;
    }

    .invitation-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .invitation-workspace {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    .invitation-meta {
      font-size: 14px;
      color: #64748b;
    }

    .invitation-actions {
      display: flex;
      gap: 8px;
    }

    .invitation-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .invitation-btn.accept {
      background: #10b981;
      color: white;
    }

    .invitation-btn.accept:hover {
      background: #059669;
    }

    .invitation-btn.decline {
      background: #f1f5f9;
      color: #64748b;
    }

    .invitation-btn.decline:hover {
      background: #e2e8f0;
    }

    /* Projects Grid */
    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }

    .project-card {
      background: white;
      border: 1px solid #f1f5f9;
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .project-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
    }

    .project-thumbnail {
      width: 100%;
      height: 160px;
      background-size: cover;
      background-position: center;
      background-color: #f8fafc;
    }

    .project-details {
      padding: 20px;
    }

    .project-title {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 12px 0;
    }

    .project-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      color: #64748b;
    }

    .project-members {
      display: flex;
      align-items: center;
      gap: -8px;
    }

    .member-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid white;
      margin-left: -8px;
    }

    .member-avatar:first-child {
      margin-left: 0;
    }

    /* Sidebar */
    .workspace-sidebar {
      width: 320px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .sidebar-card {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.8);
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
    }

    .sidebar-title {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 16px 0;
    }

    .members-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .member-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: white;
      border-radius: 12px;
      border: 1px solid #f1f5f9;
    }

    .member-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    .member-info {
      flex: 1;
    }

    .member-name {
      font-size: 14px;
      font-weight: 500;
      color: #1e293b;
      margin: 0;
    }

    .member-role {
      font-size: 12px;
      color: #64748b;
      margin: 0;
    }

    .role-badge {
      padding: 4px 8px;
      background: #f1f5f9;
      color: #64748b;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .role-badge.owner {
      background: #fef3c7;
      color: #92400e;
    }

    .quick-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .action-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: white;
      border: 1px solid #f1f5f9;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .action-item:hover {
      background: #f8fafc;
      border-color: #e2e8f0;
    }

    .action-item svg {
      color: #2563eb;
    }

    .action-text {
      font-size: 14px;
      font-weight: 500;
      color: #475569;
    }

    /* Empty States */
    .empty-state {
      text-align: center;
      padding: 40px;
      color: #64748b;
    }

    .empty-state svg {
      font-size: 48px;
      color: #cbd5e1;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      font-size: 18px;
      font-weight: 600;
      color: #475569;
      margin: 0 0 8px 0;
    }

    .empty-state p {
      font-size: 14px;
      color: #64748b;
      margin: 0;
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .workspace-main {
        flex-direction: column;
      }

      .workspace-sidebar {
        width: 100%;
        flex-direction: row;
        overflow-x: auto;
      }

      .sidebar-card {
        min-width: 300px;
      }
    }

    @media (max-width: 768px) {
      .workspace-header {
        padding: 16px 20px;
      }

      .header-content {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }

      .workspace-main {
        padding: 20px;
        gap: 24px;
      }

      .projects-grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  return (
    <motion.div 
      className="team-workspace-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <style>{styles}</style>

      {/* Header */}
      <header className="workspace-header">
        <div className="header-content">
          <div className="header-left">
            <button 
              className="workspace-selector-trigger"
              onClick={() => setShowWorkspaceSidebar(true)}
            >
              <div className={`workspace-selector-icon ${currentWorkspace?.type?.toLowerCase() || 'private'}`}>
                {currentWorkspace?.type === 'TEAM' ? <MdGroup /> : <MdBusiness />}
              </div>
              <div className="workspace-selector-info">
                <h3 className="workspace-selector-name">
                  {currentWorkspace?.name || 'Select Workspace'}
                </h3>
                <p className="workspace-selector-type">
                  {currentWorkspace?.type === 'TEAM' ? <MdGroup /> : <MdBusiness />}
                  {currentWorkspace?.type === 'TEAM' ? 'Team Workspace' : 'Private Workspace'}
                  {currentWorkspace?.userRole && (
                    <span className={`workspace-role-badge ${currentWorkspace.userRole.toLowerCase()}`}>
                      {currentWorkspace.userRole}
                    </span>
                  )}
                </p>
              </div>
              <MdArrowDropDown className="workspace-selector-arrow" size={20} />
            </button>
          </div>
          <div className="header-actions">
            <button 
              className="header-btn notification-btn"
              onClick={() => setShowNotifications(true)}
            >
              <MdNotifications size={18} />
              {invitations.length > 0 && (
                <span className="notification-badge">{invitations.length}</span>
              )}
            </button>
            <button className="header-btn" onClick={() => setShowInviteModal(true)}>
              <MdPersonAdd size={18} />
              Invite Members
            </button>
            <button className="header-btn" onClick={() => setShowSettings(true)}>
              <MdSettings size={18} />
              Settings
            </button>
            <button className="header-btn primary" onClick={onCreate}>
              <MdAdd size={18} />
              New Project
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="workspace-main">
        <main className="workspace-content">
          {/* Invitations Section */}
          {invitations.length > 0 && (
            <section className="glass-card">
              <div className="card-header">
                <h2 className="card-title">
                  <MdMail size={20} />
                  Pending Invitations
                </h2>
                <span style={{ color: '#64748b', fontSize: '14px' }}>
                  {invitations.length} invitations
                </span>
              </div>
              <div className="invitations-list">
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="invitation-item">
                    <div className="invitation-info">
                      <div className="invitation-icon">
                        <MdMail size={24} />
                      </div>
                      <div className="invitation-details">
                        <div className="invitation-workspace">{invitation.workspaceName}</div>
                        <div className="invitation-meta">
                          Invited by {invitation.invitedBy} • {invitation.role} role
                        </div>
                      </div>
                    </div>
                    <div className="invitation-actions">
                      <button 
                        className="invitation-btn accept"
                        onClick={() => handleAcceptInvitation(invitation.id)}
                      >
                        Accept
                      </button>
                      <button 
                        className="invitation-btn decline"
                        onClick={() => handleDeclineInvitation(invitation.id)}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects Section */}
          <section className="glass-card">
            <div className="card-header">
              <h2 className="card-title">
                <MdVideoLibrary size={20} />
                Recent Projects
              </h2>
              <button className="header-btn" onClick={onCreate}>
                <MdAdd size={16} />
                Create New
              </button>
            </div>
            {projects.length > 0 ? (
              <div className="projects-grid">
                {projects.map((project) => (
                  <motion.div 
                    key={project.id}
                    className="project-card"
                    whileHover={{ y: -4 }}
                    onClick={() => console.log('Open project:', project.id)}
                  >
                    <div 
                      className="project-thumbnail" 
                      style={{ backgroundImage: `url(${project.thumbnail})` }}
                    />
                    <div className="project-details">
                      <h3 className="project-title">{project.title}</h3>
                      <div className="project-meta">
                        <span>{project.updated}</span>
                        <div className="project-members">
                          {project.members.map((member, idx) => (
                            <img 
                              key={idx}
                              src={`https://ui-avatars.com/api/?name=${member}&background=2563eb&color=fff&size=24`}
                              alt={member}
                              className="member-avatar"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <MdVideoLibrary size={48} />
                <h3>No projects yet</h3>
                <p>Create your first video project to get started</p>
              </div>
            )}
          </section>
        </main>

        {/* Sidebar */}
        <aside className="workspace-sidebar">
          {/* Members Card */}
          <div className="sidebar-card">
            <h3 className="sidebar-title">Workspace Members</h3>
            {workspaceMembers.length > 0 ? (
              <div className="members-list">
                {workspaceMembers.slice(0, 5).map((member, idx) => (
                  <div key={idx} className="member-item">
                    <img 
                      src={member.user?.avatar || `https://ui-avatars.com/api/?name=${member.user?.name || member.name}&background=2563eb&color=fff&size=40`}
                      alt={member.user?.name || member.name}
                      className="member-avatar"
                    />
                    <div className="member-info">
                      <div className="member-name">{member.user?.name || member.name}</div>
                      <div className="member-role">{member.role}</div>
                    </div>
                    {member.role === 'OWNER' && (
                      <span className="role-badge owner">Owner</span>
                    )}
                  </div>
                ))}
                {workspaceMembers.length > 5 && (
                  <button className="action-item">
                    <span className="action-text">View all {workspaceMembers.length} members</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <p>No members yet</p>
              </div>
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="sidebar-card">
            <h3 className="sidebar-title">Quick Actions</h3>
            <div className="quick-actions">
              <div className="action-item" onClick={() => setShowInviteModal(true)}>
                <MdPersonAdd size={18} />
                <span className="action-text">Invite Members</span>
              </div>
              <div className="action-item" onClick={() => setShowSettings(true)}>
                <MdSettings size={18} />
                <span className="action-text">Workspace Settings</span>
              </div>
              <div className="action-item">
                <MdTrendingUp size={18} />
                <span className="action-text">View Analytics</span>
              </div>
              <div className="action-item">
                <MdStorage size={18} />
                <span className="action-text">Manage Storage</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Modals */}
      <WorkspaceSidebar
        isOpen={showWorkspaceSidebar}
        onClose={() => setShowWorkspaceSidebar(false)}
        workspaces={workspaces}
        currentWorkspace={currentWorkspace}
        onWorkspaceChange={setCurrentWorkspace}
        onCreateWorkspace={() => setShowCreateForm(true)}
        loading={loading}
      />

      {/* Notifications Panel */}
      {showNotifications && (
        <motion.div 
          className="notifications-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setShowNotifications(false)}
        >
          <motion.div 
            className="notifications-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="notifications-header">
              <h2 className="notifications-title">
                <MdMail size={20} />
                Workspace Invitations
              </h2>
              <button className="notifications-close" onClick={() => setShowNotifications(false)}>
                <MdClose size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="notifications-content">
              {invitations.length > 0 ? (
                <div className="invitations-list">
                  {invitations.map((invitation) => (
                    <div key={invitation.id} className="invitation-card">
                      <div className="invitation-header">
                        <div className="invitation-icon">
                          <MdMail />
                        </div>
                        <div className="invitation-details">
                          <h4 className="invitation-workspace">{invitation.workspaceName}</h4>
                          <div className="invitation-meta">
                            <span>Invited by {invitation.invitedBy}</span>
                            <span className="invitation-role">{invitation.role}</span>
                          </div>
                        </div>
                      </div>
                      <div className="invitation-actions">
                        <button 
                          className="invitation-btn accept"
                          onClick={() => handleAcceptInvitation(invitation.id)}
                        >
                          <MdCheck size={16} />
                          Accept
                        </button>
                        <button 
                          className="invitation-btn decline"
                          onClick={() => handleDeclineInvitation(invitation.id)}
                        >
                          <MdClose size={16} />
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="notifications-empty">
                  <MdMail size={48} />
                  <h3>No Pending Invitations</h3>
                  <p>You don't have any workspace invitations at the moment.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="notifications-footer">
              <p className="footer-text">
                {invitations.length} {invitations.length === 1 ? 'invitation' : 'invitations'} pending
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}

      <InviteMembersModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        workspace={currentWorkspace}
        onInvite={handleInviteMembers}
        loading={loading}
        error={error}
      />

      <WorkspaceCreateForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateWorkspace}
        loading={loading}
        error={error}
      />

      <WorkspaceSettings
        workspace={currentWorkspace}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onUpdate={handleUpdateWorkspace}
        onDelete={handleDeleteWorkspace}
        loading={loading}
        error={error}
      />
    </motion.div>
  );
};

export default TeamWorkspace;
