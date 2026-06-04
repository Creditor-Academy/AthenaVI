import React from 'react';
import { MdHistory, MdSecurity, MdDownload, MdGppGood } from 'react-icons/md';

const SecurityAudit = () => {
  const auditLogs = [
    { id: 'AL-911', actor: 'Super Admin', action: 'Updated credit policy', target: 'Credit Ledger', time: '2026-05-20 16:42', ip: '192.168.1.14' },
    { id: 'AL-908', actor: 'System', action: 'Login attempt failed', target: 'jane.doe@example.com', time: '2026-05-20 15:10', ip: '203.0.113.27' },
    { id: 'AL-905', actor: 'Super Admin', action: 'Deleted user account', target: 'Harvey Specter', time: '2026-05-20 14:08', ip: '192.168.1.18' },
  ];

  const loginHistory = [
    { user: 'Alex Johnson', ip: '198.51.100.12', time: '2026-05-20 08:23', device: 'Chrome on Windows' },
    { user: 'Sarah Chen', ip: '203.0.113.41', time: '2026-05-20 07:50', device: 'Safari on iOS' },
    { user: 'Mina Patel', ip: '198.51.100.45', time: '2026-05-19 22:11', device: 'Firefox on macOS' },
  ];

  const gdprRequests = [
    { id: 'GDPR-01', user: 'Michael Smith', type: 'Data export', status: 'Completed' },
    { id: 'GDPR-02', user: 'Jane Doe', type: 'Account deletion', status: 'Pending' },
  ];

  return (
    <section className="admin-card-section" style={{ marginTop: '24px' }}>
<div className="admin-toolbar-actions" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div>
            <h2>Security & Audit</h2>
            <p className="admin-placeholder-text">Track admin actions, review login history, and manage GDPR requests for compliance.</p>
          </div>
          <button className="btn-admin-action btn-export">
          <MdDownload /> Export audit log
        </button>
      </div>

      <div className="admin-stats-grid">
        {[
          { label: 'Admin actions', value: '178' },
          { label: 'Login events', value: '1,092' },
          { label: 'GDPR requests', value: '6' },
          { label: 'Policy exceptions', value: '2' },
        ].map((metric) => (
          <div key={metric.label} className="admin-stat-card" style={{ padding: '22px' }}>
            <span className="billing-metric-label">{metric.label}</span>
            <strong className="billing-metric-value" style={{ fontSize: '2rem', marginTop: '12px', display: 'block' }}>{metric.value}</strong>
          </div>
        ))}
      </div>

      <div className="security-audit-grid">
        <div className="billing-panel">
          <div className="billing-panel-header">
            <h3>Audit trail</h3>
            <span className="billing-tag">Admin actions</span>
          </div>
          <div className="admin-table-container" style={{ maxHeight: '320px', overflowY: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Actor</th>
                  <th>Target</th>
                  <th>Time</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.action}</td>
                    <td>{entry.actor}</td>
                    <td>{entry.target}</td>
                    <td>{entry.time}</td>
                    <td>{entry.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="security-side-grid">
          <div className="billing-card">
            <h3>Login history</h3>
            <div style={{ display: 'grid', gap: '14px', marginTop: '16px' }}>
              {loginHistory.map((entry) => (
                <div key={`${entry.user}-${entry.time}`} className="billing-account-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
                    <div>
                      <p className="billing-detail-label">{entry.user}</p>
                      <p className="billing-detail-note">{entry.device}</p>
                    </div>
                    <strong>{entry.time}</strong>
                  </div>
                  <p className="billing-detail-note">IP: {entry.ip}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="billing-card billing-overdue-card">
            <h3>GDPR requests</h3>
            <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
              {gdprRequests.map((request) => (
                <div key={request.id} className="billing-account-row" style={{ justifyContent: 'space-between' }}>
                  <div>
                    <p className="billing-detail-label">{request.user}</p>
                    <p className="billing-detail-note">{request.type}</p>
                  </div>
                  <strong>{request.status}</strong>
                </div>
              ))}
            </div>
            <button className="btn-admin-action btn-export" style={{ marginTop: '18px' }}>
              <MdGppGood /> Process request
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecurityAudit;
