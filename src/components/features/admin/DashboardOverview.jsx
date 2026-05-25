import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MdPeople, 
  MdAdminPanelSettings, 
  MdSecurity, 
  MdSettings, 
  MdVideoLibrary, 
  MdAttachMoney, 
  MdVpnKey,
  MdCheckCircle,
  MdCancel
} from 'react-icons/md';

const DashboardOverview = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [betaEngine, setBetaEngine] = useState(true);

  const stats = [
    { label: 'Total Users', value: '124,592', trend: '+12.5%', icon: <MdPeople />, colorClass: 'blue-bg' },
    { label: 'Active Subs', value: '42,105', trend: '+8.2%', icon: <MdVpnKey />, colorClass: 'purple-bg' },
    { label: 'Videos Rendered', value: '1.2M', trend: '+24.1%', icon: <MdVideoLibrary />, colorClass: 'orange-bg' },
    { label: 'Total Revenue', value: '$2.4M', trend: '+32.4%', icon: <MdAttachMoney />, colorClass: 'green-bg' }
  ];

  const systemLogs = [
    { type: 'success', msg: 'System backup completed successfully', time: '2 mins ago' },
    { type: 'error', msg: 'API Timeout in US-EAST-1 Region', time: '15 mins ago' },
    { type: 'info', msg: 'Beta rendering engine updated', time: '1 hour ago' }
  ];

  const moderationQueue = [
    { user: 'John Doe', title: 'Marketing Video Final', time: '5m ago' },
    { user: 'Jane Smith', title: 'Tutorial Part 1', time: '12m ago' },
    { user: 'Robert Paulson', title: 'Untitled Project', time: '20m ago' }
  ];

  return (
    <>
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

      <div className="admin-dashboard-grid" style={{ marginTop: '24px' }}>
        <div className="admin-grid-left">
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
        </div>
      </div>
    </>
  );
};

export default DashboardOverview;
