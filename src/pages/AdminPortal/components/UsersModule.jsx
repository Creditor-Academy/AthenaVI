import React, { useState } from 'react';
import UsersList from '../../../components/features/admin/UsersList';
import CreditLedgerAudit from '../../../components/features/admin/CreditLedgerAudit';
import SecurityAudit from '../../../components/features/admin/SecurityAudit';
import { MdOutlineFolderShared, MdAttachMoney, MdHistory, MdPeople, MdSettings, MdAdminPanelSettings, MdEdit, MdDeleteForever } from 'react-icons/md';
import '../AdminPortal.css';

const UsersModule = () => {
  const [activeSubTab, setActiveSubTab] = useState('users');

  const subTabs = [
    { id: 'users', label: 'Users', icon: null },
    { id: 'workspaces', label: 'Workspaces', icon: <MdOutlineFolderShared size={16} /> },
    { id: 'credits', label: 'Credits', icon: <MdAttachMoney size={16} /> },
    { id: 'access-logs', label: 'Access Logs', icon: <MdHistory size={16} /> },
  ];

  const workspaceMetrics = [
    { label: 'Total Workspaces', value: '48', note: 'Across all organizations' },
    { label: 'Active Users', value: '342', note: 'Using workspaces this week' },
    { label: 'Storage Used', value: '2.4TB', note: 'Of 5TB total capacity' },
    { label: 'Total Projects', value: '1,832', note: 'Across all workspaces' },
  ];

  const workspaceList = [
    { id: 'WS-301', name: 'Forge Studio', type: 'Team', owner: 'Mina Patel', members: 72, projects: 156, storage: '450GB', status: 'Active', created: '2025-01-15' },
    { id: 'WS-315', name: 'Hydra Labs', type: 'Team', owner: 'Owen Reed', members: 48, projects: 89, storage: '320GB', status: 'Active', created: '2025-02-01' },
    { id: 'WS-328', name: 'Beacon Media', type: 'Private', owner: 'Sofia Kim', members: 1, projects: 45, storage: '180GB', status: 'Active', created: '2025-02-20' },
    { id: 'WS-339', name: 'Pulse CRM', type: 'Team', owner: 'Liam Grant', members: 34, projects: 67, storage: '290GB', status: 'Review', created: '2025-03-05' },
    { id: 'WS-350', name: 'Alpha Design', type: 'Team', owner: 'Emma Wilson', members: 25, projects: 112, storage: '410GB', status: 'Active', created: '2025-03-10' },
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
        {activeSubTab === 'users' && <UsersList />}
        
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
                <span className="billing-tag">{workspaceList.length} workspaces</span>
              </div>
              <div className="workspace-cards-grid">
                {workspaceList.map((workspace) => (
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
                          <span className="meta-value">{workspace.members}</span>
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
                          <button className="workspace-action-btn" title="Edit" onClick={() => alert(`Edit workspace: ${workspace.name}`)}>
                            <MdEdit size={16} />
                          </button>
                          <button className="workspace-action-btn" title="View Details" onClick={() => alert(`View details: ${workspace.name}`)}>
                            <MdAdminPanelSettings size={16} />
                          </button>
                          <button className="workspace-action-btn delete" title="Delete" onClick={() => alert(`Delete workspace: ${workspace.name}`)}>
                            <MdDeleteForever size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
        
        {activeSubTab === 'credits' && <CreditLedgerAudit />}
        
        {activeSubTab === 'access-logs' && <SecurityAudit />}
      </div>
    </div>
  );
};

export default UsersModule;
