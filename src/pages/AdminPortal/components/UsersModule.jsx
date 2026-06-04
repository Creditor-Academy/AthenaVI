import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import UsersList from '../../../components/features/admin/UsersList';
import CreditLedgerAudit from '../../../components/features/admin/CreditLedgerAudit';
import { 
  MdOutlineFolderShared, 
  MdAttachMoney, 
  MdPeople, 
  MdSettings, 
  MdAdminPanelSettings, 
  MdEdit, 
  MdDeleteForever, 
  MdClose, 
  MdRemoveCircleOutline, 
  MdAdd 
} from 'react-icons/md';
import '../AdminPortal.css';
import '../../../components/features/admin/UserProfileModal.css';

const DeleteConfirmationModal = ({ workspaceName, onConfirm, onCancel }) => {
  return (
    <AnimatePresence>
      <div className="user-profile-modal modal-overlay" onClick={onCancel} style={{ zIndex: 1300 }}>
        <Motion.div
          className="modal-content"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            margin: 'auto',
            height: 'auto',
            borderRadius: '24px',
            padding: '28px',
            border: '1px solid rgba(248, 113, 113, 0.25)',
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(22, 28, 44, 0.98) 100%)',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6), 0 0 40px rgba(239, 68, 68, 0.05)',
            width: '90%',
            maxWidth: '440px',
            textAlign: 'center'
          }}
        >
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', display: 'grid', placeItems: 'center', margin: '0 auto 18px' }}>
            <MdDeleteForever size={32} />
          </div>
          <h3 style={{ margin: '0 0 10px', fontSize: '1.35rem', fontWeight: 700, color: '#f87171' }}>Delete Workspace</h3>
          <p style={{ margin: '0 0 24px', fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Are you sure you want to permanently delete <strong>{workspaceName}</strong>? This action will revoke access for all members and cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button 
              className="btn-secondary" 
              onClick={onCancel}
              style={{ padding: '10px 20px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid rgba(255, 255, 255, 0.15)' }}
            >
              Cancel
            </button>
            <button 
              className="btn-action-danger" 
              onClick={onConfirm}
              style={{ margin: 0, padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: '#ef4444', color: 'white', fontWeight: 600 }}
            >
              Delete Workspace
            </button>
          </div>
        </Motion.div>
      </div>
    </AnimatePresence>
  );
};

const WorkspaceDetailModal = ({ 
  workspace, 
  members, 
  allUsers, 
  onClose, 
  onRemoveMember, 
  onUpdateRole, 
  onAddMember, 
  onDeleteWorkspace 
}) => {
  const [newMemberId, setNewMemberId] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Member');
  const availableRoles = ['Owner', 'Admin', 'Editor', 'Viewer', 'Member', 'Workspace Admin'];

  const nonMembers = allUsers.filter(u => !members.some(m => m.id === u.id));

  const handleAdd = () => {
    if (!newMemberId) return;
    onAddMember(workspace.name, Number(newMemberId), newMemberRole);
    setNewMemberId('');
    setNewMemberRole('Member');
  };

  return (
    <AnimatePresence>
      <div className="user-profile-modal modal-overlay" onClick={onClose}>
        <Motion.div
          className="modal-content slide-panel"
          initial={{ opacity: 0, x: 460 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 460 }}
          transition={{ type: 'tween', duration: 0.24 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close" onClick={onClose}><MdClose /></button>
          
          <div className="modal-header">
            <div className="modal-header-top">
              <div className="user-avatar-large" style={{ display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}>
                <MdOutlineFolderShared size={36} color="white" />
              </div>
              <div className="user-info">
                <h2 style={{ margin: 0 }}>{workspace.name}</h2>
                <div className="user-info-row">
                  <p className="modal-subtitle">ID: {workspace.id} • Created: {workspace.created}</p>
                  <span className="status-badge status-active">{workspace.status}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-tabs">
            <button className="active">Members ({members.length})</button>
            <button 
              onClick={() => onDeleteWorkspace(workspace.id, workspace.name)} 
              style={{ color: '#f87171', background: 'rgba(248, 113, 113, 0.08)', borderRadius: '8px', padding: '6px 12px', border: '1px solid rgba(248, 113, 113, 0.2)', marginLeft: 'auto' }}
            >
              Delete Workspace
            </button>
          </div>

          <div className="modal-body" style={{ overflowY: 'auto', padding: '20px' }}>
            <div className="modal-section">
              <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 600 }}>Active Members</h3>
              <div className="ws-list-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {members.length === 0 ? (
                  <div className="ws-empty-state" style={{ padding: '32px 16px', textAlign: 'center', border: '1.5px dashed rgba(255, 255, 255, 0.1)', borderRadius: '12px' }}>
                    <MdPeople size={40} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>No members in this workspace yet.</p>
                  </div>
                ) : (
                  members.map(member => {
                    const wsInfo = (member.workspaces || []).find(ws => ws.name === workspace.name) || { role: 'Member' };
                    return (
                      <div key={member.id} className="ws-list-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                        <div className="ws-list-item-icon" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', display: 'grid', placeItems: 'center', fontWeight: 'bold', fontSize: '0.9rem', flexShrink: 0 }}>
                          {member.name.charAt(0)}
                        </div>
                        <div className="ws-list-item-info" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <span className="ws-list-item-name" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.name}</span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{member.email}</span>
                          </div>
                          <select
                            className="ws-role-select"
                            value={wsInfo.role}
                            onChange={(e) => onUpdateRole(workspace.name, member.id, e.target.value)}
                            style={{ padding: '6px 10px', borderRadius: '8px', fontSize: '0.8rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', color: '#a5b4fc', cursor: 'pointer' }}
                          >
                            {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                        <button
                          className="ws-remove-btn"
                          title={`Remove ${member.name} from ${workspace.name}`}
                          onClick={() => onRemoveMember(workspace.name, member.id)}
                          style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(248, 113, 113, 0.15)', background: 'rgba(248, 113, 113, 0.05)', color: '#f87171', display: 'grid', placeItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                          <MdRemoveCircleOutline size={18} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add Member Form */}
              <div className="ws-add-form" style={{ marginTop: '28px', padding: '16px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', fontWeight: 600 }}>Assign Member</h4>
                <div className="ws-add-controls" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <select
                    className="modal-input ws-add-select"
                    value={newMemberId}
                    onChange={(e) => setNewMemberId(e.target.value)}
                    style={{ flex: 2, minWidth: '150px' }}
                  >
                    <option value="" disabled>Select a user...</option>
                    {nonMembers.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                  <select
                    className="modal-input ws-add-role"
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    style={{ flex: 1, minWidth: '100px' }}
                  >
                    {availableRoles.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <button 
                    className="btn-primary ws-add-btn" 
                    onClick={handleAdd} 
                    disabled={!newMemberId}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', opacity: !newMemberId ? 0.5 : 1 }}
                  >
                    <MdAdd size={18} /> Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Motion.div>
      </div>
    </AnimatePresence>
  );
};

const UsersModule = () => {
  const [activeSubTab, setActiveSubTab] = useState('users');
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);

  // Shared users state
  const [users, setUsers] = useState([
    { 
      id: 1, 
      name: 'Alex Johnson', 
      email: 'alex@example.com', 
      plan: 'Enterprise', 
      role: 'Super Admin', 
      workspace: 'Global', 
      workspaces: [
        { name: 'Global', role: 'Super Admin' },
        { name: 'Forge Studio', role: 'Admin' }
      ], 
      status: 'Active', 
      joined: '2025-01-12', 
      credits: 15000 
    },
    { 
      id: 2, 
      name: 'Sarah Chen', 
      email: 'sarah.c@tech.com', 
      plan: 'Pro', 
      role: 'Workspace Admin', 
      workspace: 'Forge Studio', 
      workspaces: [
        { name: 'Forge Studio', role: 'Workspace Admin' }
      ], 
      status: 'Active', 
      joined: '2025-02-01', 
      credits: 2500 
    },
    { 
      id: 3, 
      name: 'Michael Smith', 
      email: 'mike.s@gmail.com', 
      plan: 'Free', 
      role: 'Member', 
      workspace: 'Pulse CRM', 
      workspaces: [
        { name: 'Pulse CRM', role: 'Member' },
        { name: 'Beacon Media', role: 'Viewer' }
      ], 
      status: 'Suspended', 
      joined: '2025-02-15', 
      credits: 0 
    },
    { 
      id: 4, 
      name: 'Elena Gilbert', 
      email: 'elena@mystic.com', 
      plan: 'Pro', 
      role: 'Editor', 
      workspace: 'Beacon Media', 
      workspaces: [
        { name: 'Beacon Media', role: 'Editor' }
      ], 
      status: 'Active', 
      joined: '2025-03-01', 
      credits: 1200 
    },
    { 
      id: 5, 
      name: 'Harvey Specter', 
      email: 'harvey@pearson.com', 
      plan: 'Enterprise', 
      role: 'Workspace Admin', 
      workspace: 'Astra Ventures', 
      workspaces: [
        { name: 'Astra Ventures', role: 'Workspace Admin' },
        { name: 'Global', role: 'Member' }
      ], 
      status: 'Active', 
      joined: '2025-03-05', 
      credits: 50000 
    },
    { 
      id: 6, 
      name: 'Mina Patel', 
      email: 'mina@forge.com', 
      plan: 'Pro', 
      role: 'Owner', 
      workspace: 'Forge Studio', 
      workspaces: [
        { name: 'Forge Studio', role: 'Owner' }
      ], 
      status: 'Active', 
      joined: '2025-01-15', 
      credits: 10000 
    },
    { 
      id: 7, 
      name: 'Owen Reed', 
      email: 'owen@hydra.com', 
      plan: 'Pro', 
      role: 'Owner', 
      workspace: 'Hydra Labs', 
      workspaces: [
        { name: 'Hydra Labs', role: 'Owner' }
      ], 
      status: 'Active', 
      joined: '2025-02-01', 
      credits: 8000 
    },
    { 
      id: 8, 
      name: 'Sofia Kim', 
      email: 'sofia@beacon.com', 
      plan: 'Pro', 
      role: 'Owner', 
      workspace: 'Beacon Media', 
      workspaces: [
        { name: 'Beacon Media', role: 'Owner' }
      ], 
      status: 'Active', 
      joined: '2025-02-20', 
      credits: 15000 
    },
    { 
      id: 9, 
      name: 'Liam Grant', 
      email: 'liam@pulse.com', 
      plan: 'Free', 
      role: 'Owner', 
      workspace: 'Pulse CRM', 
      workspaces: [
        { name: 'Pulse CRM', role: 'Owner' }
      ], 
      status: 'Active', 
      joined: '2025-03-05', 
      credits: 500 
    },
    { 
      id: 10, 
      name: 'Emma Wilson', 
      email: 'emma@alpha.com', 
      plan: 'Pro', 
      role: 'Owner', 
      workspace: 'Alpha Design', 
      workspaces: [
        { name: 'Alpha Design', role: 'Owner' }
      ], 
      status: 'Active', 
      joined: '2025-03-10', 
      credits: 12000 
    }
  ]);

  // Shared workspaces list state
  const [workspaces, setWorkspaces] = useState([
    { id: 'WS-301', name: 'Forge Studio', type: 'Team', owner: 'Mina Patel', projects: 156, storage: '450GB', status: 'Active', created: '2025-01-15' },
    { id: 'WS-315', name: 'Hydra Labs', type: 'Team', owner: 'Owen Reed', projects: 89, storage: '320GB', status: 'Active', created: '2025-02-01' },
    { id: 'WS-328', name: 'Beacon Media', type: 'Private', owner: 'Sofia Kim', projects: 45, storage: '180GB', status: 'Active', created: '2025-02-20' },
    { id: 'WS-339', name: 'Pulse CRM', type: 'Team', owner: 'Liam Grant', projects: 67, storage: '290GB', status: 'Review', created: '2025-03-05' },
    { id: 'WS-350', name: 'Alpha Design', type: 'Team', owner: 'Emma Wilson', projects: 112, storage: '410GB', status: 'Active', created: '2025-03-10' },
    { id: 'WS-360', name: 'Astra Ventures', type: 'Team', owner: 'Harvey Specter', projects: 28, storage: '120GB', status: 'Active', created: '2025-03-12' },
  ]);

  // Workspace handlers
  const handleRequestDeleteWorkspace = (workspaceId, workspaceName) => {
    setDeleteConfirmTarget({ id: workspaceId, name: workspaceName });
  };

  const handleConfirmDeleteWorkspace = () => {
    if (!deleteConfirmTarget) return;
    const { id, name } = deleteConfirmTarget;

    setWorkspaces(prev => prev.filter(w => w.id !== id));
    
    // Revoke workspace from all users
    setUsers(prevUsers => prevUsers.map(user => ({
      ...user,
      workspaces: (user.workspaces || []).filter(ws => ws.name !== name)
    })));

    setDeleteConfirmTarget(null);
    if (selectedWorkspace && selectedWorkspace.id === id) {
      setSelectedWorkspace(null);
    }
  };

  const handleRemoveMemberFromWorkspace = (workspaceName, userId) => {
    setUsers(prevUsers => prevUsers.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          workspaces: (user.workspaces || []).filter(ws => ws.name !== workspaceName)
        };
      }
      return user;
    }));
  };

  const handleUpdateMemberRoleInWorkspace = (workspaceName, userId, newRole) => {
    setUsers(prevUsers => prevUsers.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          workspaces: (user.workspaces || []).map(ws => 
            ws.name === workspaceName ? { ...ws, role: newRole } : ws
          )
        };
      }
      return user;
    }));
  };

  const handleAddMemberToWorkspace = (workspaceName, userId, role) => {
    setUsers(prevUsers => prevUsers.map(user => {
      if (user.id === userId) {
        const currentWorkspaces = user.workspaces || [];
        if (currentWorkspaces.some(ws => ws.name === workspaceName)) return user;
        return {
          ...user,
          workspaces: [...currentWorkspaces, { name: workspaceName, role }]
        };
      }
      return user;
    }));
  };

  const getWorkspaceMembers = (workspaceName) => {
    return users.filter(user => (user.workspaces || []).some(ws => ws.name === workspaceName));
  };

  // Metrics calculations
  const activeUsersCount = users.filter(u => (u.workspaces || []).length > 0).length;
  const totalProjects = workspaces.reduce((sum, w) => sum + (w.projects || 0), 0);

  const subTabs = [
    { id: 'users', label: 'Users', icon: null },
    { id: 'workspaces', label: 'Workspaces', icon: <MdOutlineFolderShared size={16} /> },
    { id: 'credits', label: 'Credits', icon: <MdAttachMoney size={16} /> },
  ];

  const workspaceMetrics = [
    { label: 'Total Workspaces', value: workspaces.length.toString(), note: 'Across all organizations' },
    { label: 'Active Users', value: activeUsersCount.toString(), note: 'Using workspaces this week' },
    { label: 'Storage Used', value: '2.4TB', note: 'Of 5TB total capacity' },
    { label: 'Total Projects', value: totalProjects.toLocaleString(), note: 'Across all workspaces' },
  ];

  return (
    <div>
      <div className="admin-sub-tab-switch" role="tablist" aria-label="Users sections">
        {subTabs.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`admin-sub-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveSubTab(tab.id)}
            >
              {tab.icon && <span className="admin-sub-tab-icon">{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="admin-sub-tab-content">
        {activeSubTab === 'users' && (
          <UsersList users={users} setUsers={setUsers} />
        )}
        
        {activeSubTab === 'workspaces' && (
          <section className="admin-card-section workspace-page" style={{ marginTop: '24px' }}>
            <div className="billing-hero">
              <div>
                <h2>Workspace Management</h2>
                <p className="admin-placeholder-text">Manage workspaces, monitor storage usage, and oversee team collaboration.</p>
              </div>
            </div>

            <div className="workspace-metrics-grid">
              {workspaceMetrics.map((metric) => (
                <div key={metric.label} className="workspace-metric-card">
                  <div className="metric-icon">
                    {metric.label === 'Total Workspaces' && <MdOutlineFolderShared size={24} />}
                    {metric.label === 'Active Users' && <MdPeople size={24} />}
                    {metric.label === 'Storage Used' && <MdSettings size={24} />}
                    {metric.label === 'Total Projects' && <MdAdminPanelSettings size={24} />}
                  </div>
                  <div className="metric-content">
                    <span className="metric-label">{metric.label}</span>
                    <strong className="metric-value">{metric.value}</strong>
                    <p className="metric-note">{metric.note}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="workspace-grid-section">
              <div className="billing-panel-header">
                <h3>All Workspaces</h3>
                <span className="billing-tag">{workspaces.length} workspaces</span>
              </div>
              <div className="workspace-cards-grid">
                {workspaces.map((workspace) => {
                  const members = getWorkspaceMembers(workspace.name);
                  return (
                    <div key={workspace.id} className="workspace-card">
                      <div className="workspace-card-header">
                        <div className="workspace-card-icon">
                          {workspace.type === 'Team' ? <MdOutlineFolderShared size={28} /> : <MdSettings size={28} />}
                        </div>
                        <div className="workspace-card-type">
                          <span className={`plan-tag ${workspace.type === 'Private' ? 'plan-private' : 'plan-team'}`}>
                            {workspace.type}
                          </span>
                        </div>
                      </div>
                      <div className="workspace-card-body">
                        <h4 className="workspace-card-name">{workspace.name}</h4>
                        <p className="workspace-card-id">{workspace.id}</p>
                        <div className="workspace-card-meta">
                          <div className="workspace-meta-item">
                            <span className="meta-label">Owner</span>
                            <span className="meta-value">{workspace.owner}</span>
                          </div>
                          <div className="workspace-meta-item">
                            <span className="meta-label">Members</span>
                            <span className="meta-value">{members.length}</span>
                          </div>
                          <div className="workspace-meta-item">
                            <span className="meta-label">Projects</span>
                            <span className="meta-value">{workspace.projects}</span>
                          </div>
                          <div className="workspace-meta-item">
                            <span className="meta-label">Storage</span>
                            <span className="meta-value">{workspace.storage}</span>
                          </div>
                        </div>
                        <div className="workspace-card-footer">
                          <div className="workspace-status">
                            <span className={`status-badge billing-status-${workspace.status.toLowerCase().replace(/ /g, '-')}`}>
                              {workspace.status}
                            </span>
                          </div>
                          <div className="workspace-actions">
                            <button 
                              className="workspace-action-btn" 
                              title="Edit Members" 
                              onClick={() => setSelectedWorkspace(workspace)}
                            >
                              <MdEdit size={16} />
                            </button>
                            <button 
                              className="workspace-action-btn" 
                              title="View Details" 
                              onClick={() => setSelectedWorkspace(workspace)}
                            >
                              <MdAdminPanelSettings size={16} />
                            </button>
                            <button 
                              className="workspace-action-btn delete" 
                              title="Delete Workspace" 
                              onClick={() => handleRequestDeleteWorkspace(workspace.id, workspace.name)}
                            >
                              <MdDeleteForever size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
        
        {activeSubTab === 'credits' && <CreditLedgerAudit />}
      </div>

      {selectedWorkspace && (
        <WorkspaceDetailModal
          workspace={selectedWorkspace}
          members={getWorkspaceMembers(selectedWorkspace.name)}
          allUsers={users}
          onClose={() => setSelectedWorkspace(null)}
          onRemoveMember={handleRemoveMemberFromWorkspace}
          onUpdateRole={handleUpdateMemberRoleInWorkspace}
          onAddMember={handleAddMemberToWorkspace}
          onDeleteWorkspace={handleRequestDeleteWorkspace}
        />
      )}

      {deleteConfirmTarget && (
        <DeleteConfirmationModal
          workspaceName={deleteConfirmTarget.name}
          onConfirm={handleConfirmDeleteWorkspace}
          onCancel={() => setDeleteConfirmTarget(null)}
        />
      )}
    </div>
  );
};

export default UsersModule;
