import React, { useState } from 'react';
import { MdStorage, MdKey, MdTune, MdOutlineQueue } from 'react-icons/md';

const PlatformConfig = () => {
  const [settings, setSettings] = useState({
    freeCredits: 1000,
    plusCredits: 5000,
    proPlusCredits: 20000,
    priorityQueue: 'Standard',
    ttsEndpoint: 'https://api.example.com/tts',
    sttEndpoint: 'https://api.example.com/stt',
    llmEndpoint: 'https://api.example.com/llm',
    cdnEnabled: true,
    storageRegion: 'us-east-1',
  });

  return (
    <section className="admin-card-section" style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h2>Platform Configuration</h2>
          <p className="admin-placeholder-text">Manage plan tiers, API endpoints, priority queues, and CDN/storage settings.</p>
        </div>
        <button className="btn-admin-action" style={{ background: '#d1fae5', color: '#166534' }}>
          <MdTune /> Save settings
        </button>
      </div>

      <div className="billing-panel-grid">
        <div className="billing-panel">
          <div className="billing-panel-header">
            <h3>Plan configuration</h3>
            <span className="billing-tag">Credit allocation</span>
          </div>
          <div style={{ display: 'grid', gap: '14px', marginTop: '16px' }}>
            {[
              { label: 'FREE credits', value: settings.freeCredits },
              { label: 'PLUS credits', value: settings.plusCredits },
              { label: 'PRO_PLUS credits', value: settings.proPlusCredits },
              { label: 'Render priority queue', value: settings.priorityQueue },
            ].map((item) => (
              <div key={item.label} className="billing-account-row" style={{ justifyContent: 'space-between' }}>
                <div>
                  <p className="billing-detail-label">{item.label}</p>
                  <p className="billing-detail-note">Editable in platform settings.</p>
                </div>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="billing-side-panel">
          <div className="billing-card">
            <h3>API & endpoint settings</h3>
            <div style={{ display: 'grid', gap: '14px', marginTop: '16px' }}>
              {[
                { label: 'TTS endpoint', value: settings.ttsEndpoint },
                { label: 'STT endpoint', value: settings.sttEndpoint },
                { label: 'LLM endpoint', value: settings.llmEndpoint },
              ].map((item) => (
                <div key={item.label} className="billing-account-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <p className="billing-detail-label">{item.label}</p>
                  <p className="billing-detail-note">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="billing-card billing-overdue-card" style={{ background: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MdStorage size={24} />
              <h3 style={{ margin: 0 }}>CDN & storage</h3>
            </div>
            <div style={{ marginTop: '16px' }}>
              <p className="billing-detail-label">CDN enabled</p>
              <p className="billing-detail-note">{settings.cdnEnabled ? 'Yes' : 'No'}</p>
              <p className="billing-detail-label" style={{ marginTop: '12px' }}>Storage region</p>
              <p className="billing-detail-note">{settings.storageRegion}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="billing-table-panel">
        <h3>Role-based access matrix</h3>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Can manage users</th>
                <th>Can configure platform</th>
                <th>Can audit credits</th>
              </tr>
            </thead>
            <tbody>
              {[
                { role: 'Super Admin', manage: 'Yes', config: 'Yes', audit: 'Yes' },
                { role: 'Workspace Admin', manage: 'Yes', config: 'No', audit: 'No' },
                { role: 'Moderator', manage: 'No', config: 'No', audit: 'Yes' },
              ].map((item) => (
                <tr key={item.role}>
                  <td>{item.role}</td>
                  <td>{item.manage}</td>
                  <td>{item.config}</td>
                  <td>{item.audit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default PlatformConfig;
