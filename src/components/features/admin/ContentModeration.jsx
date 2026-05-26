import React, { useState } from 'react';
import { MdFlag, MdRemoveCircle, MdCheckCircle, MdVideoLibrary, MdPerson } from 'react-icons/md';

const ContentModeration = () => {
  const [videos, setVideos] = useState([
    { id: 'VID-401', title: 'Welcome Tutorial', author: 'Mina Patel', status: 'Approved', flagged: false },
    { id: 'VID-402', title: 'Product Launch', author: 'Liam Grant', status: 'Pending', flagged: false },
    { id: 'VID-403', title: 'Promo Reel', author: 'Sofia Kim', status: 'Under Review', flagged: true },
  ]);

  const [avatars, setAvatars] = useState([
    { id: 'AV-101', name: 'Nova', category: 'AI Instructor', status: 'Live' },
    { id: 'AV-102', name: 'Kora', category: 'Narrator', status: 'Draft' },
    { id: 'AV-103', name: 'Atlas', category: 'Support Guide', status: 'Live' },
  ]);

  const handleFlag = (videoId) => {
    setVideos((prev) => prev.map((video) => video.id === videoId ? { ...video, flagged: true, status: 'Under Review' } : video));
  };

  const handleRemove = (videoId) => {
    setVideos((prev) => prev.filter((video) => video.id !== videoId));
  };

  const handleDisableAvatar = (avatarId) => {
    setAvatars((prev) => prev.map((avatar) => avatar.id === avatarId ? { ...avatar, status: 'Disabled' } : avatar));
  };

  return (
    <section className="admin-card-section" style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h2>Content Moderation</h2>
          <p className="admin-placeholder-text">Review video content, flag inappropriate media, and manage the avatar library.</p>
        </div>
        <button className="btn-admin-action" style={{ background: '#f8fafc', color: '#0f172a' }}>
          <MdVideoLibrary /> Review new uploads
        </button>
      </div>

      <div className="billing-panel-grid">
        <div className="billing-panel">
          <div className="billing-panel-header">
            <h3>Video moderation queue</h3>
            <span className="billing-tag">Review pending content</span>
          </div>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Video</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Flagged</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video) => (
                  <tr key={video.id}>
                    <td>{video.title}</td>
                    <td>{video.author}</td>
                    <td>{video.status}</td>
                    <td>{video.flagged ? 'Yes' : 'No'}</td>
                    <td style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        className="btn-admin-action"
                        style={{ background: '#fde68a', color: '#92400e' }}
                        onClick={() => handleFlag(video.id)}
                      >
                        <MdFlag /> Flag
                      </button>
                      <button
                        className="btn-admin-action"
                        style={{ background: '#fca5a5', color: '#7f1d1d' }}
                        onClick={() => handleRemove(video.id)}
                      >
                        <MdRemoveCircle /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="billing-side-panel">
          <div className="billing-card">
            <h3>Avatar library</h3>
            <div style={{ display: 'grid', gap: '14px', marginTop: '16px' }}>
              {avatars.map((avatar) => (
                <div key={avatar.id} className="billing-account-row" style={{ justifyContent: 'space-between' }}>
                  <div>
                    <p className="billing-detail-label">{avatar.name}</p>
                    <p className="billing-detail-note">{avatar.category}</p>
                  </div>
                  <button
                    type="button"
                    className="btn-admin-action"
                    style={{ background: avatar.status === 'Disabled' ? '#f8fafc' : '#d1fae5', color: avatar.status === 'Disabled' ? '#0f172a' : '#166534' }}
                    onClick={() => handleDisableAvatar(avatar.id)}
                  >
                    {avatar.status === 'Disabled' ? 'Disabled' : 'Disable'}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="billing-card billing-overdue-card" style={{ background: '#eef2ff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MdPerson size={24} />
              <h3 style={{ margin: 0 }}>Moderation guidance</h3>
            </div>
            <p className="billing-alert-text" style={{ marginTop: '16px' }}>
              Remove or flag content that violates policy, and validate avatar metadata before publishing to production.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContentModeration;
