
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MdSettings, 
  MdPersonAdd, 
  MdVideoLibrary, 
  MdGroup, 
  MdStorage, 
  MdAdd,
  MdBusiness
} from 'react-icons/md';
import WorkspaceCreateForm from '../components/workspace/WorkspaceCreateForm.jsx';
import WorkspaceSettings from '../components/workspace/WorkspaceSettings.jsx';
import WorkspaceSelector from '../components/workspace/WorkspaceSelector.jsx';
import InviteMembersModal from '../components/workspace/InviteMembersModal.jsx';
import workspaceService from '../services/workspaceService.js';
import './TeamWorkspace.css';

const TeamWorkspace = ({ onCreate }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);

  // Load workspaces on component mount
  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      const workspaceList = await workspaceService.listWorkspaces();
      setWorkspaces(workspaceList);
      
      // Set current workspace to first team workspace, or first workspace if no team workspaces
      const teamWorkspace = workspaceList.find(ws => ws.type === 'TEAM') || workspaceList[0];
      if (teamWorkspace) {
        setCurrentWorkspace(teamWorkspace);
        loadWorkspaceMembers(teamWorkspace.id);
      }
    } catch (err) {
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

  const stats = [
    { label: 'Active Projects', value: '18', trend: '+12%', icon: <MdVideoLibrary />, colorClass: 'blue-bg' },
    { label: 'Team Members', value: '12', subValue: '2 Admins, 10 Editors', icon: <MdGroup />, colorClass: 'purple-bg' },
    { label: 'Storage Usage', value: '64%', subValue: '128GB of 200GB', icon: <MdStorage />, colorClass: 'orange-bg', isStorage: true }
  ];

  const projects = [
    { id: 1, title: 'Quarterly Marketing Video', updated: '2 hours ago', thumbnail: 'https://images.unsplash.com/photo-1492619334764-22c52488814d?auto=format&fit=crop&q=80&w=400', members: ['A', 'B', 'C'] },
    { id: 2, title: 'Product Launch Teaser', updated: 'Yesterday', thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=400', members: ['D', 'E'] },
    { id: 3, title: 'Internal Training Series', updated: '3 days ago', thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400', members: ['A', 'F', 'G', 'H'] },
    { id: 4, title: 'Social Media Campaign', updated: '5 days ago', thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=400', members: ['B', 'I'] }
  ];

  const members = [
    { name: 'Alex Johnson', role: 'Owner', avatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=0D8ABC&color=fff' },
    { name: 'Sarah Chen', role: 'Admin', avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=6366F1&color=fff' },
    { name: 'Mike Ross', role: 'Editor', avatar: 'https://ui-avatars.com/api/?name=Mike+Ross&background=10B981&color=fff' },
    { name: 'Elena Gilbert', role: 'Editor', avatar: 'https://ui-avatars.com/api/?name=Elena+Gilbert&background=F59E0B&color=fff' }
  ];

  const handleCreateWorkspace = async (formData) => {
    try {
      setLoading(true);
      setError('');
      
      const newWorkspace = await workspaceService.createWorkspace(formData);
      setWorkspaces(prev => [...prev, newWorkspace]);
      setShowCreateForm(false);
      
      // Switch to the newly created workspace
      setCurrentWorkspace(newWorkspace);
      await loadWorkspaceMembers(newWorkspace.id);
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
      setCurrentWorkspace(updatedWorkspace);
      setWorkspaces(prev => prev.map(ws => 
        ws.id === updatedWorkspace.id ? updatedWorkspace : ws
      ));
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
      setWorkspaces(prev => prev.filter(ws => ws.id !== workspaceId));
      
      // Switch to another workspace or create new one
      const remainingWorkspaces = workspaces.filter(ws => ws.id !== workspaceId);
      if (remainingWorkspaces.length > 0) {
        const nextWorkspace = remainingWorkspaces[0];
        setCurrentWorkspace(nextWorkspace);
        await loadWorkspaceMembers(nextWorkspace.id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkspaceChange = async (workspace) => {
    try {
      setCurrentWorkspace(workspace);
      await loadWorkspaceMembers(workspace.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInviteMembers = async (inviteData) => {
    try {
      setLoading(true);
      setError('');
      
      const inviteResult = await workspaceService.inviteMember(currentWorkspace.id, inviteData);
      setShowInviteModal(false);
      
      // Reload members to get updated list
      await loadWorkspaceMembers(currentWorkspace.id);
      
      // TODO: Show success message with invite link
      console.log('Invitation sent:', inviteResult.inviteLink);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="team-workspace-container"
    >
      <div className="workspace-main-content">
        {/* Header */}
        <header className="workspace-header-container">
          <div className="workspace-identity">
            {/* Workspace Selector */}
            <WorkspaceSelector
              workspaces={workspaces}
              currentWorkspace={currentWorkspace}
              onWorkspaceChange={handleWorkspaceChange}
              onCreateWorkspace={() => setShowCreateForm(true)}
              loading={loading}
            />
            <p>
              Collaborative space for high-impact video marketing projects.
            </p>
          </div>
          <div className="workspace-header-actions">
            <button 
              className="btn-settings-icon"
              onClick={() => setShowSettings(true)}
            >
              <MdSettings size={22} />
            </button>
            <button 
              className="btn-invite"
              onClick={() => setShowInviteModal(true)}
            >
              <MdPersonAdd size={20} />
              Invite Members
            </button>
          </div>
        </header>

        {/* Stats */}
        <section className="stats-grid">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.02 }}
              className="stat-card-team"
            >
              <div className="stat-card-header">
                <div className={`stat-icon-bg ${stat.colorClass}`}>
                  {stat.icon}
                </div>
                {stat.trend && (
                  <span className="stat-trend-tag trend-up">{stat.trend}</span>
                )}
              </div>
              <div className="stat-info">
                <span className="stat-value-text">{stat.value}</span>
                <span className="stat-label-text">{stat.label}</span>
                {stat.isStorage && (
                  <div className="storage-bar-container">
                    <div className="storage-bar-progress" style={{ width: stat.value }}></div>
                  </div>
                )}
                {stat.subValue && !stat.isStorage && (
                  <span className="stat-label-text" style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                    {stat.subValue}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </section>

        {/* Projects Grid */}
        <section className="workspace-projects-section">
          <div className="section-header">
            <h2>Projects</h2>
            <p>Recent video projects and collaborations</p>
          </div>

          <div className="projects-grid-team">
            <motion.div 
              whileHover={{ scale: 0.98 }}
              className="create-project-card"
              onClick={onCreate}
            >
              <MdAdd size={40} />
              <span>Create New Project</span>
            </motion.div>

            {projects.map((project) => (
              <motion.div 
                key={project.id}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                whileHover={{ y: -5 }}
                className="project-card-team"
              >
                <div className="project-thumbnail" style={{ backgroundImage: `url(${project.thumbnail})` }}>
                  {/* Overlay or actions could go here */}
                </div>
                <div className="project-details-team">
                  <h3>{project.title}</h3>
                  <div className="project-meta-bottom">
                    <span className="time-stamp">{project.updated}</span>
                    <div className="member-avatars-group">
                      {project.members.map((m, idx) => (
                        <img 
                          key={idx}
                          src={`https://ui-avatars.com/api/?name=${m}&background=random&color=fff`} 
                          alt="member" 
                          className="member-avatar-mini"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* Right Sidebar */}
      <aside className="workspace-sidebar-right">
        <div className="sidebar-glass-card">
          <h2>Workspace Members</h2>
          <div className="members-list">
            {workspaceMembers.slice(0, 4).map((member, i) => (
              <div key={i} className="member-item">
                <img src={member.user?.avatar || member.avatar} alt={member.user?.name || member.name} />
                <div className="member-info-text">
                  <span className="member-name">{member.user?.name || member.name}</span>
                  <span className="member-role">{member.role}</span>
                </div>
                {member.role === 'OWNER' && <span className="role-tag">Owner</span>}
              </div>
            ))}
          </div>
          <button className="action-link view-all">
            View All Members
          </button>
        </div>

        <div className="sidebar-glass-card">
          <h2>Quick Actions</h2>
          <div className="quick-actions-list">
            <div className="action-link" onClick={() => setShowSettings(true)}>
              <MdSettings />
              <span>Workspace Settings</span>
            </div>
            <div className="action-link">
              <MdBusiness />
              <span>Manage Billing</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Invite Members Modal */}
      <InviteMembersModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        workspace={currentWorkspace}
        onInvite={handleInviteMembers}
        loading={loading}
        error={error}
      />

      {/* Workspace Create Form Modal */}
      <WorkspaceCreateForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateWorkspace}
        loading={loading}
        error={error}
      />

      {/* Workspace Settings Modal */}
      <WorkspaceSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        workspace={currentWorkspace}
        onUpdate={handleUpdateWorkspace}
        onDelete={handleDeleteWorkspace}
        loading={loading}
        error={error}
      />
    </motion.div>
  );
};

export default TeamWorkspace;
