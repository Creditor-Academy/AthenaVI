import React, { useState } from 'react';
import { MdReceiptLong, MdSearch, MdFlag, MdDownload } from 'react-icons/md';

const CreditLedgerAudit = () => {
  const [selectedUser, setSelectedUser] = useState('All users');
  const [searchTerm, setSearchTerm] = useState('');

  const ledgerEntries = [
    { id: 'CL-2150', user: 'Alex Johnson', workspace: 'Astra Ventures', change: '+1,000', balance: '16,000', reason: 'Monthly allocation', timestamp: '2026-05-20 10:22' },
    { id: 'CL-2148', user: 'Michael Smith', workspace: 'Pulse CRM', change: '-2,000', balance: '0', reason: 'Render submission', timestamp: '2026-05-20 09:50' },
    { id: 'CL-2142', user: 'Sarah Chen', workspace: 'Forge Studio', change: '+500', balance: '3,000', reason: 'Manual grant', timestamp: '2026-05-19 18:14' },
    { id: 'CL-2137', user: 'Harvey Specter', workspace: 'Beacon Media', change: '-14,000', balance: '36,000', reason: 'Invoice deduction', timestamp: '2026-05-19 14:05' },
  ];

  const auditSummary = [
    { label: 'Ledger entries', value: '1,248' },
    { label: 'Anomalies flagged', value: '4' },
    { label: 'Users audited', value: '82' },
    { label: 'Export ready', value: 'CSV / Excel' },
  ];

  const filteredEntries = ledgerEntries.filter((entry) =>
    entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.workspace.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="admin-card-section" style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h2>Credit Ledger Audit</h2>
          <p className="admin-placeholder-text">Review credit transactions, spot anomalies, and export audit reports by user or workspace.</p>
        </div>
        <button className="btn-admin-action" style={{ background: '#eef2ff', color: '#4338ca' }}>
          <MdDownload /> Export report
        </button>
      </div>

      <div className="billing-summary-grid">
        {auditSummary.map((metric) => (
          <div key={metric.label} className="billing-summary-card">
            <span className="billing-metric-label">{metric.label}</span>
            <strong className="billing-metric-value">{metric.value}</strong>
          </div>
        ))}
      </div>

      <div className="billing-panel-grid">
        <div className="billing-panel" style={{ minHeight: '280px' }}>
          <div className="billing-panel-header">
            <h3>Immutable ledger</h3>
            <span className="billing-tag">Audit trail</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '6px 12px', borderRadius: '6px', flex: '1 1 240px' }}>
              <MdSearch style={{ color: '#64748b', marginRight: '8px' }} />
              <input
                type="text"
                placeholder="Search ledger entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }}
              />
            </div>
          </div>
          <div className="admin-table-container" style={{ maxHeight: '320px', overflowY: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Entry</th>
                  <th>User</th>
                  <th>Workspace</th>
                  <th>Change</th>
                  <th>Balance</th>
                  <th>Reason</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.id}</td>
                    <td>{entry.user}</td>
                    <td>{entry.workspace}</td>
                    <td>{entry.change}</td>
                    <td>{entry.balance}</td>
                    <td>{entry.reason}</td>
                    <td>{entry.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="billing-side-panel">
          <div className="billing-card">
            <h3>Anomaly review</h3>
            <div style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
              <div className="billing-account-row">
                <div>
                  <p className="billing-detail-label">Flagged deductions</p>
                  <p className="billing-detail-note">Review abnormal negative adjustments.</p>
                </div>
                <strong>4</strong>
              </div>
              <div className="billing-account-row">
                <div>
                  <p className="billing-detail-label">User credit reviews</p>
                  <p className="billing-detail-note">Identify suspicious balance changes.</p>
                </div>
                <strong>12</strong>
              </div>
            </div>
          </div>
          <div className="billing-card billing-overdue-card" style={{ background: '#f8fafc' }}>
            <h3>Audit best practice</h3>
            <p className="billing-alert-text" style={{ marginTop: '16px' }}>
              Keep credit ledger entries immutable and group exports by workspace and time period for compliance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreditLedgerAudit;
