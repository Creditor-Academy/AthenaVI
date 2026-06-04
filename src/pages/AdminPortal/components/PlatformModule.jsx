import React, { useState } from 'react';
import PlatformConfig from '../../../components/features/admin/PlatformConfig';
import { MdCreditCard, MdExtension, MdLock } from 'react-icons/md';
import '../AdminPortal.css';

const PlatformModule = () => {
  const [activeSubTab, setActiveSubTab] = useState('plans');

  const subTabs = [
    { id: 'plans', label: 'Plans', icon: null },
    { id: 'integrations', label: 'Integrations', icon: <MdExtension size={16} /> },

    { id: 'permissions', label: 'Permissions', icon: <MdLock size={16} /> },
  ];

  const integrations = [
    { id: 'INT-001', name: 'Stripe Payments', status: 'Connected', lastSync: '2026-05-20 14:32', type: 'Payment' },
    { id: 'INT-002', name: 'AWS S3', status: 'Connected', lastSync: '2026-05-20 13:15', type: 'Storage' },
    { id: 'INT-003', name: 'SendGrid', status: 'Connected', lastSync: '2026-05-20 11:45', type: 'Email' },
    { id: 'INT-004', name: 'Slack', status: 'Disconnected', lastSync: '2026-05-18 09:20', type: 'Communication' },
  ];



  const permissions = [
    { id: 'PERM-001', role: 'Super Admin', users: 3, permissions: ['Full Access', 'User Management', 'System Config'] },
    { id: 'PERM-002', role: 'Workspace Admin', users: 12, permissions: ['Workspace Management', 'Team Access', 'Billing'] },
    { id: 'PERM-003', role: 'Editor', users: 45, permissions: ['Content Edit', 'Project Access'] },
    { id: 'PERM-004', role: 'Viewer', users: 128, permissions: ['Read Only'] },
  ];

  return (
    <div>
      <div className="admin-sub-tab-switch" role="tablist" aria-label="Platform sections">
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
        {activeSubTab === 'plans' && <PlatformConfig />}
        
        {activeSubTab === 'integrations' && (
          <section className="admin-card-section" style={{ marginTop: '24px' }}>
            <div className="billing-hero">
              <div>
                <h2>Integrations</h2>
                <p className="admin-placeholder-text">Manage third-party service integrations and API connections.</p>
              </div>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Integration</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Last Sync</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {integrations.map((integration) => (
                    <tr key={integration.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{integration.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{integration.id}</div>
                      </td>
                      <td>{integration.type}</td>
                      <td>
                        <span className={`status-badge ${integration.status === 'Connected' ? 'status-active' : 'status-suspended'}`}>
                          {integration.status}
                        </span>
                      </td>
                      <td>{integration.lastSync}</td>
                      <td>
                        <button className="user-action-btn" onClick={() => alert(`Configure: ${integration.name}`)}>
                          Configure
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        

        
        {activeSubTab === 'permissions' && (
          <section className="admin-card-section" style={{ marginTop: '24px' }}>
            <div className="billing-hero">
              <div>
                <h2>Permissions</h2>
                <p className="admin-placeholder-text">Manage role-based access control and permission policies.</p>
              </div>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Users</th>
                    <th>Permissions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((perm) => (
                    <tr key={perm.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{perm.role}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{perm.id}</div>
                      </td>
                      <td>{perm.users}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {perm.permissions.map((p, i) => (
                            <span key={i} className="plan-tag" style={{ fontSize: '0.7rem' }}>{p}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <button className="user-action-btn" onClick={() => alert(`Edit role: ${perm.role}`)}>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default PlatformModule;
