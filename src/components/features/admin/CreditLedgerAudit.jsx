import React, { useState } from 'react';
import { MdReceiptLong, MdSearch, MdDownload, MdFilterList } from 'react-icons/md';

const CreditLedgerAudit = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterWorkspace, setFilterWorkspace] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const ledgerEntries = [
    { id: 'TXN-001', userId: 'USR-8472', workspaceId: 'WS-102', amount: 1000, type: 'ALLOCATION', referenceId: 'SUB-2026-05', balanceAfter: 16000, timestamp: '2026-05-20T10:22:00Z' },
    { id: 'TXN-002', userId: 'USR-9153', workspaceId: 'WS-205', amount: -2000, type: 'DEDUCTION', referenceId: 'RENDER-4521', balanceAfter: 0, timestamp: '2026-05-20T09:50:00Z' },
    { id: 'TXN-003', userId: 'USR-3321', workspaceId: 'WS-089', amount: 500, type: 'MANUAL_GRANT', referenceId: 'ADMIN-001', balanceAfter: 3000, timestamp: '2026-05-19T18:14:00Z' },
    { id: 'TXN-004', userId: 'USR-4456', workspaceId: 'WS-312', amount: -14000, type: 'DEDUCTION', referenceId: 'INV-2026-042', balanceAfter: 36000, timestamp: '2026-05-19T14:05:00Z', flagged: true },
  ];

  const summary = [
    { label: 'Total transactions', value: '1,248' },
    { label: 'Flagged anomalies', value: '4' },
    { label: 'Net credits issued', value: '845,000' },
    { label: 'Net credits consumed', value: '612,000' },
  ];

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'ALLOCATION': return { bg: 'rgba(16, 185, 129, 0.12)', text: '#10b981' };
      case 'MANUAL_GRANT': return { bg: 'rgba(59, 130, 246, 0.12)', text: '#3b82f6' };
      case 'DEDUCTION': return { bg: 'rgba(239, 68, 68, 0.12)', text: '#ef4444' };
      case 'REFUND': return { bg: 'rgba(16, 185, 129, 0.12)', text: '#10b981' };
      default: return { bg: 'rgba(107, 114, 128, 0.12)', text: '#6b7280' };
    }
  };

  const formatAmount = (amount) => {
    return amount >= 0 ? `+${amount.toLocaleString()}` : amount.toLocaleString();
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredEntries = ledgerEntries.filter((entry) => {
    const matchesSearch = 
      entry.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.workspaceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.referenceId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = !filterUser || entry.userId === filterUser;
    const matchesWorkspace = !filterWorkspace || entry.workspaceId === filterWorkspace;
    
    let matchesDate = true;
    if (dateRange.start) {
      matchesDate = matchesDate && new Date(entry.timestamp) >= new Date(dateRange.start);
    }
    if (dateRange.end) {
      matchesDate = matchesDate && new Date(entry.timestamp) <= new Date(dateRange.end);
    }

    return matchesSearch && matchesUser && matchesWorkspace && matchesDate;
  });

  return (
    <section className="admin-card-section" style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h2>Credit Ledger Audit</h2>
          <p className="admin-placeholder-text">View immutable credit transactions, audit user history, and generate usage reports.</p>
        </div>
        <button className="btn-admin-action" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.18)' }}>
          <MdDownload /> Export CSV
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {summary.map((metric) => (
          <div key={metric.label} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{metric.label}</span>
            <strong style={{ fontSize: '1.4rem', display: 'block', marginTop: '4px' }}>{metric.value}</strong>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Immutable Ledger</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <MdFilterList size={20} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Filters</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--input-bg)', padding: '8px 12px', borderRadius: '8px', flex: '1 1 200px', border: '1px solid var(--border-color)' }}>
            <MdSearch style={{ color: 'var(--text-muted)', marginRight: '8px' }} />
            <input
              type="text"
              placeholder="Search by ID, User, Workspace, Reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', color: 'var(--text-color)' }}
            />
          </div>
          <input
            type="text"
            placeholder="Filter by User ID"
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', fontSize: '0.9rem', flex: '1 1 150px', color: 'var(--text-color)' }}
          />
          <input
            type="text"
            placeholder="Filter by Workspace ID"
            value={filterWorkspace}
            onChange={(e) => setFilterWorkspace(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', fontSize: '0.9rem', flex: '1 1 150px', color: 'var(--text-color)' }}
          />
          <input
            type="date"
            placeholder="From"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', fontSize: '0.9rem', color: 'var(--text-color)' }}
          />
          <input
            type="date"
            placeholder="To"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', fontSize: '0.9rem', color: 'var(--text-color)' }}
          />
        </div>

        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'rgba(59, 130, 246, 0.05)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Transaction ID</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>User ID</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Workspace ID</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Type</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Amount</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Balance After</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Reference</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => {
                const typeColor = getTransactionTypeColor(entry.type);
                return (
                  <tr key={entry.id} style={{ borderBottom: '1px solid var(--border-color)', background: entry.flagged ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.85rem' }}>{entry.id}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.85rem' }}>{entry.userId}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.85rem' }}>{entry.workspaceId}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '12px', background: typeColor.bg, color: typeColor.text, fontSize: '0.8rem', fontWeight: 500 }}>
                        {entry.type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 500, color: entry.amount >= 0 ? '#10b981' : '#ef4444' }}>
                      {formatAmount(entry.amount)}
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.85rem' }}>{entry.balanceAfter.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.85rem' }}>{entry.referenceId}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formatDate(entry.timestamp)}</td>
                  </tr>
                );
              })}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No transactions found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default CreditLedgerAudit;
