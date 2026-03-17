
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MdSettings, 
  MdPersonAdd, 
  MdVideoLibrary, 
  MdGroup, 
  MdStorage, 
  MdAdd, 
  MdMoreVert, 
  MdEdit, 
  MdImage, 
  MdArchive,
  MdHistory,
  MdCreditCard,
  MdBusiness
} from 'react-icons/md';
import './TeamWorkspace.css';

const TeamWorkspace = ({ onCreate }) => {
  const [activeTab, setActiveTab] = useState('projects');

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

  const activities = [
    { user: 'Sarah Chen', action: 'uploaded a new asset', target: 'Logo_Final.png', time: '10 mins ago' },
    { user: 'Mike Ross', action: 'commented on', target: 'Marketing Video', time: '45 mins ago' },
    { user: 'System', action: 'completed export of', target: 'Training_V2', time: '2 hours ago' }
  ];

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
            <motion.h1 layoutId="ws-title">Team Marketing Workspace</motion.h1>
            <p>Collaborative space for high-impact video marketing projects.</p>
          </div>
          <div className="workspace-header-actions">
            <button className="btn-settings-icon">
              <MdSettings size={22} />
            </button>
            <button className="btn-invite">
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

        {/* Tabs & Projects */}
        <section className="workspace-tabs-section">
          <div className="tabs-header">
            {['projects', 'members', 'assets', 'archived'].map((tab) => (
              <button 
                key={tab}
                className={`tab-trigger ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
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
            {members.slice(0, 4).map((member, i) => (
              <div key={i} className="member-item">
                <img src={member.avatar} alt={member.name} style={{ width: 40, height: 40, borderRadius: 12 }} />
                <div className="member-info-text">
                  <span className="member-name">{member.name}</span>
                  <span className="member-role">{member.role}</span>
                </div>
                {member.role === 'Owner' && <span className="role-tag">Owner</span>}
              </div>
            ))}
          </div>
          <button className="action-link" style={{ marginTop: '16px', justifyContent: 'center', width: '100%', border: '1px solid #f1f5f9' }}>
            View All Members
          </button>
        </div>

        <div className="sidebar-glass-card">
          <h2>Activity Feed</h2>
          <div className="activity-feed-list">
            {activities.map((activity, i) => (
              <div key={i} className="activity-item">
                <div className="activity-dot-line"></div>
                <div className="activity-dot"></div>
                <div className="activity-content-text">
                  <strong>{activity.user}</strong> {activity.action} <strong>{activity.target}</strong>
                  <div className="activity-time">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-glass-card">
          <h2>Quick Actions</h2>
          <div className="quick-actions-list">
            <div className="action-link">
              <MdEdit />
              <span>Rename Workspace</span>
            </div>
            <div className="action-link">
              <MdImage />
              <span>Change Logo</span>
            </div>
            <div className="action-link">
              <MdCreditCard />
              <span>Manage Billing</span>
            </div>
            <div className="action-link">
              <MdBusiness />
              <span>Workspace Settings</span>
            </div>
          </div>
        </div>
      </aside>
    </motion.div>
  );
};

export default TeamWorkspace;
