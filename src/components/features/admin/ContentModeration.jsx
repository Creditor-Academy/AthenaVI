import React, { useState } from 'react';
import {
  MdFlag, MdRemoveCircle, MdCheckCircle, MdVideoLibrary, MdPerson,
  MdPlayArrow, MdInfo, MdAdd, MdBlock, MdCheck, MdDelete, MdClose
} from 'react-icons/md';

const STATUS_TAGS = {
  Approved:      { color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  Pending:       { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  'Under Review': { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

const CATEGORIES = ['AI Instructor', 'Narrator', 'Support Guide', 'Presenter', 'Virtual Host'];
const EMOJI_PRESETS = ['🧑‍💼', '👩‍💼', '👨‍💼', '🤖', '👩‍💻', '🧑‍💻', '🧑‍🚀', '👩‍🎨', '🎭', '🎤', '🌟', '😊'];

const ContentModeration = ({ activeTab = 'videos' }) => {
  const [videos, setVideos] = useState([
    { id: 'VID-401', title: 'Welcome Tutorial', author: 'Mina Patel', uploaded: '2026-05-20 14:32', status: 'Approved', flagged: false },
    { id: 'VID-402', title: 'Product Launch', author: 'Liam Grant', uploaded: '2026-05-20 13:15', status: 'Pending', flagged: false },
    { id: 'VID-403', title: 'Promo Reel', author: 'Sofia Kim', uploaded: '2026-05-20 11:45', status: 'Under Review', flagged: true },
    { id: 'VID-404', title: 'Feature Explainer', author: 'David Cole', uploaded: '2026-05-19 09:20', status: 'Pending', flagged: false },
  ]);

  const [avatars, setAvatars] = useState([
    { id: 'AV-101', name: 'Nova', category: 'AI Instructor', status: 'Live', image: '🧑‍💼' },
    { id: 'AV-102', name: 'Kora', category: 'Narrator', status: 'Draft', image: '👩‍💼' },
    { id: 'AV-103', name: 'Atlas', category: 'Support Guide', status: 'Live', image: '👨‍💼' },
    { id: 'AV-104', name: 'Vesper', category: 'Presenter', status: 'Disabled', image: '🤖' },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [avatarForm, setAvatarForm] = useState({
    name: '',
    category: 'Presenter',
    status: 'Live',
    image: '🧑‍💼'
  });

  const handleFlag = (videoId) => {
    setVideos((prev) => prev.map((v) => v.id === videoId ? { ...v, flagged: true, status: 'Under Review' } : v));
  };

  const handleApprove = (videoId) => {
    setVideos((prev) => prev.map((v) => v.id === videoId ? { ...v, flagged: false, status: 'Approved' } : v));
  };

  const handleRemove = (videoId) => {
    setVideos((prev) => prev.filter((v) => v.id !== videoId));
  };

  const handleToggleAvatar = (avatarId) => {
    setAvatars((prev) => prev.map((av) => {
      if (av.id === avatarId) {
        const nextStatus = av.status === 'Disabled' ? 'Live' : 'Disabled';
        return { ...av, status: nextStatus };
      }
      return av;
    }));
  };

  const handleRemoveAvatar = (avatarId) => {
    setAvatars((prev) => prev.filter((av) => av.id !== avatarId));
  };

  const handleAddAvatarSubmit = (e) => {
    e.preventDefault();
    if (!avatarForm.name.trim()) return;

    const newAv = {
      id: `AV-${105 + avatars.length}`,
      ...avatarForm
    };

    setAvatars(prev => [...prev, newAv]);
    setAvatarForm({ name: '', category: 'Presenter', status: 'Live', image: '🧑‍💼' });
    setShowAddModal(false);
  };

  /* ────────────────────────────────────────────────────────── */
  /* VIDEOS TAB                                                 */
  /* ────────────────────────────────────────────────────────── */
  if (activeTab === 'videos') {
    return (
      <section className="admin-card-section" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ margin: '0 0 4px' }}>Video Moderation</h2>
            <p className="admin-placeholder-text">Review and flag content uploaded by platform users.</p>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Video</th>
                <th>Uploaded By</th>
                <th>Date</th>
                <th>Status</th>
                <th>Flagged</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No videos in moderation queue.
                  </td>
                </tr>
              ) : videos.map((video) => {
                const tag = STATUS_TAGS[video.status] || STATUS_TAGS.Pending;
                return (
                  <tr key={video.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '46px', height: '30px', borderRadius: '6px',
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
                          border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--text-muted)'
                        }}>
                          <MdPlayArrow size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.88rem' }}>{video.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{video.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.88rem' }}>{video.author}</td>
                    <td style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{video.uploaded}</td>
                    <td>
                      <span style={{
                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600,
                        background: tag.bg, color: tag.color
                      }}>
                        {video.status}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '0.82rem', fontWeight: 600,
                        color: video.flagged ? '#ef4444' : 'var(--text-muted)'
                      }}>
                        {video.flagged ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {video.status !== 'Approved' && (
                          <button
                            onClick={() => handleApprove(video.id)}
                            style={{
                              padding: '5px 12px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.3)',
                              background: 'rgba(16,185,129,0.08)', color: '#10b981', fontSize: '0.82rem', fontWeight: 600,
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                            }}
                          >
                            <MdCheck size={14} /> Approve
                          </button>
                        )}
                        {!video.flagged && (
                          <button
                            onClick={() => handleFlag(video.id)}
                            style={{
                              padding: '5px 12px', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.3)',
                              background: 'rgba(245,158,11,0.08)', color: '#f59e0b', fontSize: '0.82rem', fontWeight: 600,
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                            }}
                          >
                            <MdFlag size={14} /> Flag
                          </button>
                        )}
                        <button
                          onClick={() => handleRemove(video.id)}
                          style={{
                            padding: '5px 12px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)',
                            background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: '0.82rem', fontWeight: 600,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                          }}
                        >
                          <MdRemoveCircle size={14} /> Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  /* ────────────────────────────────────────────────────────── */
  /* AVATARS TAB                                                */
  /* ────────────────────────────────────────────────────────── */
  return (
    <section className="admin-card-section" style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px' }}>AI Avatar Library</h2>
          <p className="admin-placeholder-text">Manage presenters, narrator templates, and system voice guides.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: '8px 16px', borderRadius: '10px', border: 'none', background: 'var(--primary)',
            color: '#fff', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', display: 'flex',
            alignItems: 'center', gap: '6px'
          }}
        >
          <MdAdd size={18} /> Add Avatar
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
        {avatars.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No avatars in library. Click "Add Avatar" to create one.
          </div>
        ) : avatars.map((avatar) => {
          const isDisabled = avatar.status === 'Disabled';
          return (
            <div
              key={avatar.id}
              style={{
                background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)',
                borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column',
                gap: '12px', opacity: isDisabled ? 0.6 : 1, transition: 'all 0.2s', position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem'
                }}>
                  {avatar.image}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem' }}>{avatar.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{avatar.category}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
                <span style={{
                  fontSize: '0.78rem', fontWeight: 600,
                  color: avatar.status === 'Disabled' ? '#ef4444' : avatar.status === 'Draft' ? '#f59e0b' : '#10b981'
                }}>
                  ● {avatar.status}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => handleToggleAvatar(avatar.id)}
                    style={{
                      padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
                      border: `1px solid ${isDisabled ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      background: isDisabled ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                      color: isDisabled ? '#10b981' : '#ef4444', cursor: 'pointer'
                    }}
                  >
                    {isDisabled ? 'Enable' : 'Disable'}
                  </button>
                  <button
                    onClick={() => handleRemoveAvatar(avatar.id)}
                    title="Remove Avatar"
                    style={{
                      padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem',
                      border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)',
                      color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center'
                    }}
                  >
                    <MdDelete size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Avatar Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}
          onClick={() => setShowAddModal(false)}
        >
          <form
            onSubmit={handleAddAvatarSubmit}
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)', borderRadius: '20px', padding: '32px',
              width: '420px', border: '1px solid var(--border-color)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.4)', display: 'grid', gap: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Add New Avatar</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
              >
                <MdClose size={20} />
              </button>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>Name</label>
              <input
                type="text"
                required
                value={avatarForm.name}
                onChange={e => setAvatarForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Liam"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>Category</label>
              <select
                value={avatarForm.category}
                onChange={e => setAvatarForm(p => ({ ...p, category: e.target.value }))}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none'
                }}
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>Initial Status</label>
              <select
                value={avatarForm.status}
                onChange={e => setAvatarForm(p => ({ ...p, status: e.target.value }))}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none'
                }}
              >
                <option value="Live">Live</option>
                <option value="Draft">Draft</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>Avatar Image (Preset)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                {EMOJI_PRESETS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatarForm(p => ({ ...p, image: emoji }))}
                    style={{
                      height: '42px', fontSize: '1.4rem', border: `2px solid ${avatarForm.image === emoji ? 'var(--primary)' : 'var(--border-color)'}`,
                      borderRadius: '10px', background: avatarForm.image === emoji ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-surface)',
                      cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: 'var(--primary)',
                color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', marginTop: '8px'
              }}
            >
              Create Avatar
            </button>
          </form>
        </div>
      )}
    </section>
  );
};

export default ContentModeration;
