import React, { useState } from 'react';
import ContentModeration from '../../../components/features/admin/ContentModeration';
import { MdVideoLibrary, MdReport } from 'react-icons/md';
import '../AdminPortal.css';

const ContentModule = () => {
  const [activeSubTab, setActiveSubTab] = useState('videos');

  const subTabs = [
    { id: 'videos', label: 'Videos', icon: null },
    { id: 'reports', label: 'Reports', icon: <MdReport size={16} /> },
  ];

  const moderationQueue = [
    { id: 'MOD-001', userId: 'USR-8472', type: 'Video', thumbnail: '🎬', uploadedAt: '2026-05-20 14:32', flagReason: 'Potential policy violation', status: 'Pending' },
    { id: 'MOD-002', userId: 'USR-9153', type: 'Video', thumbnail: '🎥', uploadedAt: '2026-05-20 13:15', flagReason: 'Copyright claim', status: 'Pending' },
    { id: 'MOD-003', userId: 'USR-3321', type: 'Video', thumbnail: '🎞️', uploadedAt: '2026-05-20 11:45', flagReason: 'User report', status: 'Pending' },
  ];

  return (
    <div>
      <div className="admin-sub-tab-switch" role="tablist" aria-label="Content sections">
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
        {activeSubTab === 'videos' && <ContentModeration />}

        {activeSubTab === 'reports' && (
          <section className="admin-card-section" style={{ marginTop: '24px' }}>
            <div className="billing-hero">
              <div>
                <h2>Moderation Queue</h2>
                <p className="admin-placeholder-text">Review flagged content and take moderation actions.</p>
              </div>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User ID</th>
                    <th>Type</th>
                    <th>Uploaded</th>
                    <th>Flag Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {moderationQueue.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.userId}</td>
                      <td>{item.type}</td>
                      <td>{item.uploadedAt}</td>
                      <td style={{ color: '#f59e0b' }}>{item.flagReason}</td>
                      <td>
                        <span className={`status-badge ${item.status === 'Pending' ? 'status-processing' : 'status-active'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <div className="table-action-group">
                          <button className="user-action-btn" onClick={() => alert(`Approve: ${item.id}`)}>
                            Approve
                          </button>
                          <button className="user-action-btn" style={{ color: '#ef4444' }} onClick={() => alert(`Reject: ${item.id}`)}>
                            Reject
                          </button>
                        </div>
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

export default ContentModule;
