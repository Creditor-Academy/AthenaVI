
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MdDashboard, 
  MdPeople, 
  MdAdminPanelSettings, 
  MdSecurity, 
  MdSettings, 
  MdVideoLibrary, 
  MdAttachMoney, 
  MdTrendingUp,
  MdFileDownload,
  MdNotificationImportant,
  MdSync,
  MdVpnKey,
  MdCheckCircle,
  MdCancel,
  MdWarning,
  MdWindow
} from 'react-icons/md';
import TemplateManager from '../../components/features/admin/admin/TemplateManager';
import './AdminPortal.css';

const AdminPortal = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [betaEngine, setBetaEngine] = useState(true);

  const stats = [
    { label: 'Total Users', value: '124,592', trend: '+12.5%', icon: <MdPeople />, colorClass: 'blue-bg' },
    { label: 'Active Subs', value: '42,105', trend: '+8.2%', icon: <MdVpnKey />, colorClass: 'purple-bg' },
    { label: 'Videos Rendered', value: '1.2M', trend: '+24.1%', icon: <MdVideoLibrary />, colorClass: 'orange-bg' },
    { label: 'Total Revenue', value: '$2.4M', trend: '+32.4%', icon: <MdAttachMoney />, colorClass: 'green-bg' }
  ];

  const users = [
    { id: 1, name: 'Alex Johnson', email: 'alex@example.com', plan: 'Enterprise', status: 'Active', joined: '2025-01-12' },
    { id: 2, name: 'Sarah Chen', email: 'sarah.c@tech.com', plan: 'Pro', status: 'Active', joined: '2025-02-01' },
    { id: 3, name: 'Michael Smith', email: 'mike.s@gmail.com', plan: 'Free', status: 'Suspended', joined: '2025-02-15' },
    { id: 4, name: 'Elena Gilbert', email: 'elena@mystic.com', plan: 'Pro', status: 'Active', joined: '2025-03-01' },
    { id: 5, name: 'Harvey Specter', email: 'harvey@pearson.com', plan: 'Enterprise', status: 'Active', joined: '2025-03-05' }
  ];

  const moderationQueue = [
    { user: 'John Doe', title: 'Marketing Video Final', time: '5m ago' },
    { user: 'Jane Smith', title: 'Tutorial Part 1', time: '12m ago' },
    { user: 'Robert Paulson', title: 'Untitled Project', time: '20m ago' }
  ];

  const systemLogs = [
    { type: 'success', msg: 'System backup completed successfully', time: '2 mins ago' },
    { type: 'error', msg: 'API Timeout in US-EAST-1 Region', time: '15 mins ago' },
    { type: 'info', msg: 'Beta rendering engine updated', time: '1 hour ago' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="admin-portal-container"
    >
      {/* Internal Dark Sidebar */}
      <aside className="admin-sidebar-internal">
        <div className="admin-brand">
          <h2>Admin Hub</h2>
        </div>
        <nav>
          <div className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <MdDashboard /> Dashboard
          </div>
          <div className="admin-nav-item">
            <MdPeople /> User Management
          </div>
          <div className="admin-nav-item">
            <MdSecurity /> Content Moderation
          </div>
          <div className="admin-nav-item">
            <MdAdminPanelSettings /> System Logs
          </div>
          <div className={`admin-nav-item ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => setActiveTab('templates')}>
            <MdWindow /> Template Management
          </div>
          <div className="admin-nav-item">
            <MdSettings /> Platform Settings
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main-wrapper">
        <header className="admin-top-header">
          <div>
            <h1>{activeTab === 'templates' ? 'Video Template Design' : 'Platform Overview'}</h1>
            <p style={{ color: '#64748b' }}>
              {activeTab === 'templates' 
                ? 'Create and manage global video generation templates.' 
                : 'Technical health and operational metrics.'}
            </p>
          </div>
          <div className="admin-actions">
            <button className="btn-admin-action btn-export">
              <MdFileDownload /> Export Report
            </button>
            <button className="btn-admin-action btn-alert">
              <MdNotificationImportant /> Global Alert
            </button>
          </div>
        </header>

        {activeTab === 'dashboard' ? (
          <>
            {/* High-Level Metrics */}
            <div className="admin-stats-grid">
              {stats.map((stat, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -4 }}
                  className="admin-stat-card"
                >
                  <div className="admin-stat-top">
                    <div className={`admin-stat-icon ${stat.colorClass}`}>
                      {stat.icon}
                    </div>
                    <span className="admin-stat-trend trend-pos">{stat.trend}</span>
                  </div>
                  <div className="admin-stat-info">
                    <h3>{stat.value}</h3>
                    <p>{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Dashboard Grid */}
            <div className="admin-dashboard-grid">
              <div className="admin-grid-left">
                {/* User Management Table */}
                <section className="admin-card-section">
                  <h2><MdPeople /> User Management</h2>
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Plan</th>
                          <th>Status</th>
                          <th>Joined</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user.id}>
                            <td>
                              <div style={{ fontWeight: 600 }}>{user.name}</div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{user.email}</div>
                            </td>
                            <td><span className="plan-tag">{user.plan}</span></td>
                            <td>
                              <span className={`status-badge ${user.status === 'Active' ? 'status-active' : 'status-suspended'}`}>
                                {user.status}
                              </span>
                            </td>
                            <td>{user.joined}</td>
                            <td><MdSync style={{ color: '#64748b', cursor: 'pointer' }} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              <div className="admin-grid-right">
                {/* Platform Controls */}
                <section className="admin-card-section" style={{ marginBottom: '24px' }}>
                  <h2><MdSettings /> Platform Controls</h2>
                  <div className="controls-list">
                    <div className="control-item">
                      <div className="control-label">
                        <span className="control-title">Maintenance Mode</span>
                        <span className="control-desc">Redirect all traffic to static page.</span>
                      </div>
                      <div 
                        className={`toggle-switch ${maintenanceMode ? 'on' : ''}`}
                        onClick={() => setMaintenanceMode(!maintenanceMode)}
                      >
                        <div className="toggle-knob"></div>
                      </div>
                    </div>
                    <div className="control-item">
                      <div className="control-label">
                        <span className="control-title">Beta Rendering Engine</span>
                        <span className="control-desc">Use experimental v2.5 engine.</span>
                      </div>
                      <div 
                        className={`toggle-switch ${betaEngine ? 'on' : ''}`}
                        onClick={() => setBetaEngine(!betaEngine)}
                      >
                        <div className="toggle-knob"></div>
                      </div>
                    </div>
                    <button className="btn-admin-action btn-export" style={{ justifyContent: 'center', width: '100%', marginTop: '12px' }}>
                      Flush System Caches
                    </button>
                  </div>
                </section>

                {/* Moderation Queue */}
                <section className="admin-card-section" style={{ marginBottom: '24px' }}>
                  <h2><MdSecurity /> Moderation Queue</h2>
                  <div className="mod-queue">
                    {moderationQueue.map((item, i) => (
                      <div key={i} className="mod-queue-item">
                        <div className="mod-thumb"></div>
                        <div className="mod-info">
                          <div className="mod-user">{item.user}</div>
                          <div className="mod-time">{item.time}</div>
                        </div>
                        <div className="mod-actions">
                          <button className="btn-mod-icon" style={{ backgroundColor: '#dcfce7', color: '#15803d' }}><MdCheckCircle /></button>
                          <button className="btn-mod-icon" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}><MdCancel /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* System Logs */}
                <section className="admin-card-section">
                  <h2><MdAdminPanelSettings /> System Logs</h2>
                  <div className="logs-feed">
                    {systemLogs.map((log, i) => (
                      <div key={i} className="log-item">
                        <div className={`log-type ${log.type}`}></div>
                        <div className="log-content">
                          <div className="log-msg">{log.msg}</div>
                          <div className="log-time">{log.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </>
        ) : activeTab === 'templates' ? (
          <TemplateManager />
        ) : null}
      </main>
    </motion.div>
  );
};

export default AdminPortal;
