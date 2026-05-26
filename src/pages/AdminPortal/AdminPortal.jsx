import React, { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import { 
  MdPeople, 
  MdAdminPanelSettings, 
  MdSecurity, 
  MdSettings, 
  MdOutlineFolderShared,
  MdSync,
  MdAnalytics,
  MdAttachMoney
} from 'react-icons/md';
import AdminPortalSkeleton from '../page-skeleton/AdminPortalSkeleton';
import DashboardOverview from '../../components/features/admin/DashboardOverview';
import UsersList from '../../components/features/admin/UsersList';
import RenderPipelineMonitor from '../../components/features/admin/RenderPipelineMonitor';
import CreditLedgerAudit from '../../components/features/admin/CreditLedgerAudit';
import PlatformConfig from '../../components/features/admin/PlatformConfig';
import SecurityAudit from '../../components/features/admin/SecurityAudit';
import './AdminPortal.css';

const AdminPortal = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('adminPortalTab') || 'dashboard';
  });
  const [loading, setLoading] = useState(true);

  // Simulate network request for data fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // 1.5 seconds loading state

    return () => clearTimeout(timer);
  }, [activeTab]); // Trigger loading state whenever tab changes

  const adminTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <MdAdminPanelSettings /> },
    { id: 'users', label: 'User Management', icon: <MdPeople /> },
    { id: 'workspaces', label: 'Workspaces', icon: <MdOutlineFolderShared /> },
    { id: 'pipeline', label: 'Render Pipeline', icon: <MdSync /> },
    { id: 'credits', label: 'Credit Ledger', icon: <MdAttachMoney /> },
    { id: 'config', label: 'Platform Config', icon: <MdSettings /> },
    { id: 'analytics', label: 'Analytics', icon: <MdAnalytics /> },
    { id: 'security', label: 'Security & Audit', icon: <MdSecurity /> },
  ];

  const handleTabChange = (tabId) => {
    setLoading(true);
    setActiveTab(tabId);
    localStorage.setItem('adminPortalTab', tabId);
  };

  const billingMetrics = [
    { label: 'Monthly Recurring Revenue', value: '$185.2K', note: '+8.4% MoM' },
    { label: 'Total Invoiced This Quarter', value: '$1.24M', note: 'Stable growth +12%' },
    { label: 'Avg. Revenue per Account', value: '$14.8K', note: '+6.1% YoY' },
    { label: 'Payment Success Rate', value: '98.3%', note: '7-day rolling average' },
  ];

  const revenueBreakdown = [
    { label: 'Enterprise revenue', amount: '$965K', detail: '42% of total ARR' },
    { label: 'SMB revenue', amount: '$482K', detail: '31% of total ARR' },
    { label: 'Recurring bookings', amount: '$113K', detail: '90% retention-ready' },
  ];

  const recentInvoices = [
    { id: 'INV-1023', customer: 'Nimbus Media', amount: '$12,400', status: 'Paid', due: 'May 10' },
    { id: 'INV-1027', customer: 'Vertex Labs', amount: '$24,800', status: 'Pending', due: 'May 20' },
    { id: 'INV-1031', customer: 'Aurora Labs', amount: '$8,650', status: 'Overdue', due: 'May 02' },
    { id: 'INV-1035', customer: 'Echo Commerce', amount: '$18,100', status: 'Paid', due: 'May 14' },
  ];

  const topAccounts = [
    { name: 'Astra Ventures', arr: '$95.8K', status: 'Stable' },
    { name: 'Helix Finance', arr: '$78.4K', status: 'Growing' },
    { name: 'Nova Health', arr: '$65.2K', status: 'Renewal due' },
  ];

  const workspaceMetrics = [
    { label: 'Active Workspaces', value: '48', note: '41 active this week' },
    { label: 'Pending Invites', value: '92', note: '35 awaiting approval' },
    { label: 'Storage Utilization', value: '73%', note: '2.4TB of 3.3TB used' },
    { label: 'Sync Health', value: '99.1%', note: 'Last 24-hour uptime' },
  ];

  const workspaceProducts = [
    { label: 'Collaboration sessions', value: '1,832', detail: 'Live across 31 workspaces' },
    { label: 'Shared assets', value: '68.4K', detail: 'Includes templates and media' },
    { label: 'Workspace owners', value: '26', detail: 'Executive-level admin access' },
  ];

  const workspaceList = [
    { id: 'WS-301', name: 'Forge Studio', owner: 'Mina Patel', seats: '72', status: 'Active' },
    { id: 'WS-315', name: 'Hydra Labs', owner: 'Owen Reed', seats: '48', status: 'Review' },
    { id: 'WS-328', name: 'Beacon Media', owner: 'Sofia Kim', seats: '103', status: 'Active' },
    { id: 'WS-339', name: 'Pulse CRM', owner: 'Liam Grant', seats: '34', status: 'At risk' },
  ];

  const workspaceTeams = [
    { name: 'Growth Ops', activity: 'High', owners: '3' },
    { name: 'Customer Success', activity: 'Medium', owners: '2' },
    { name: 'Product Design', activity: 'High', owners: '4' },
  ];

  if (loading) {
    return <AdminPortalSkeleton />;
  }

  return (
    <Motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="admin-page"
    >
      <div className="admin-shell">
        <header className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Admin Portal</h1>
            <p className="admin-page-subtitle">
              {activeTab === 'dashboard' && 'Technical health and operational metrics.'}
              {activeTab === 'users' && 'Manage users, grant credits, and oversee accounts.'}
              {activeTab === 'workspaces' && 'Oversee team workspaces and collaboration tools.'}
              {activeTab === 'pipeline' && 'Monitor render jobs, worker pools, and failed pipelines.'}
              {activeTab === 'credits' && 'Audit the credit ledger and review user credit history.'}
              {activeTab === 'config' && 'Configure plans, priority queues, and platform integrations.'}
              {activeTab === 'analytics' && 'View platform usage, render trends, and export reports.'}
              {activeTab === 'security' && 'Track audit logs, login history, and GDPR requests.'}
            </p>
          </div>
        </header>

        <div className="admin-tab-switch" role="tablist" aria-label="Admin sections">
          {adminTabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`admin-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
              >
                <span className="admin-tab-icon" aria-hidden>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        <main className="admin-main">
          {activeTab === 'dashboard' ? (
            <DashboardOverview />
          ) : activeTab === 'users' ? (
            <UsersList />
          ) : activeTab === 'pipeline' ? (
            <RenderPipelineMonitor />
          ) : activeTab === 'credits' ? (
            <CreditLedgerAudit />
          ) : activeTab === 'config' ? (
            <PlatformConfig />
          ) : activeTab === 'analytics' ? (
            <section className="admin-card-section billing-page" style={{ marginTop: '24px' }}>
              <div className="billing-hero">
                <div>
                  <h2>Analytics & Reporting</h2>
                  <p className="admin-placeholder-text">Live mock metrics for platform usage, render trends, and export-ready reports.</p>
                </div>
              </div>

              <div className="billing-summary-grid">
                {billingMetrics.map((metric) => (
                  <div key={metric.label} className="billing-summary-card">
                    <span className="billing-metric-label">{metric.label}</span>
                    <strong className="billing-metric-value">{metric.value}</strong>
                    <p className="billing-metric-note">{metric.note}</p>
                  </div>
                ))}
              </div>

              <div className="billing-panel-grid">
                <div className="billing-panel">
                  <div className="billing-panel-header">
                    <h3>Revenue breakdown</h3>
                    <span className="billing-tag">Growth focus</span>
                  </div>
                  <div className="billing-panel-list">
                    {revenueBreakdown.map((item) => (
                      <div key={item.label} className="billing-detail-row">
                        <div>
                          <p className="billing-detail-label">{item.label}</p>
                          <p className="billing-detail-note">{item.detail}</p>
                        </div>
                        <strong>{item.amount}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="billing-side-panel">
                  <div className="billing-card">
                    <h3>Top accounts</h3>
                    <div className="billing-account-list">
                      {topAccounts.map((account) => (
                        <div key={account.name} className="billing-account-row">
                          <div>
                            <p className="billing-detail-label">{account.name}</p>
                            <p className="billing-detail-note">{account.status}</p>
                          </div>
                          <strong>{account.arr}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="billing-card billing-overdue-card">
                    <h3>Priority alerts</h3>
                    <p className="billing-alert-text">3 overdue invoices need follow-up, including an enterprise renewal at risk.</p>
                    <div className="billing-alert-tag">Accounts receivable: $42.7K</div>
                  </div>
                </div>
              </div>

              <div className="billing-table-panel">
                <h3>Recent invoice activity</h3>
                <div className="admin-table-container">
                  <table className="admin-table billing-table">
                    <thead>
                      <tr>
                        <th>Invoice</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Due date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentInvoices.map((invoice) => (
                        <tr key={invoice.id}>
                          <td>{invoice.id}</td>
                          <td>{invoice.customer}</td>
                          <td>{invoice.amount}</td>
                          <td><span className={`status-badge billing-status-${invoice.status.toLowerCase()}`}>{invoice.status}</span></td>
                          <td>{invoice.due}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          ) : activeTab === 'workspaces' ? (
            <section className="admin-card-section workspace-page" style={{ marginTop: '24px' }}>
              <div className="billing-hero">
                <div>
                  <h2>Workspaces & Collaboration</h2>
                  <p className="admin-placeholder-text">Track workspace health, team activity, storage usage, and workspace risk in one place.</p>
                </div>
              </div>

              <div className="billing-summary-grid">
                {workspaceMetrics.map((metric) => (
                  <div key={metric.label} className="billing-summary-card">
                    <span className="billing-metric-label">{metric.label}</span>
                    <strong className="billing-metric-value">{metric.value}</strong>
                    <p className="billing-metric-note">{metric.note}</p>
                  </div>
                ))}
              </div>

              <div className="billing-panel-grid">
                <div className="billing-panel">
                  <div className="billing-panel-header">
                    <h3>Workspace health</h3>
                    <span className="billing-tag">Operational pulse</span>
                  </div>
                  <div className="billing-panel-list">
                    {workspaceProducts.map((item) => (
                      <div key={item.label} className="billing-detail-row">
                        <div>
                          <p className="billing-detail-label">{item.label}</p>
                          <p className="billing-detail-note">{item.detail}</p>
                        </div>
                        <strong>{item.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="billing-side-panel">
                  <div className="billing-card">
                    <h3>Active teams</h3>
                    <div className="billing-account-list">
                      {workspaceTeams.map((team) => (
                        <div key={team.name} className="billing-account-row">
                          <div>
                            <p className="billing-detail-label">{team.name}</p>
                            <p className="billing-detail-note">Activity: {team.activity}</p>
                          </div>
                          <strong>{team.owners} owners</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="billing-card billing-overdue-card">
                    <h3>Workspace risk alerts</h3>
                    <p className="billing-alert-text">2 workspaces require admin review due to low engagement and pending security checks.</p>
                    <div className="billing-alert-tag">Review queue: 2 workspaces</div>
                  </div>
                </div>
              </div>

              <div className="billing-table-panel">
                <h3>Workspaces in production</h3>
                <div className="admin-table-container">
                  <table className="admin-table workspace-table">
                    <thead>
                      <tr>
                        <th>Workspace</th>
                        <th>Owner</th>
                        <th>Seats</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workspaceList.map((workspace) => (
                        <tr key={workspace.id}>
                          <td>{workspace.name}</td>
                          <td>{workspace.owner}</td>
                          <td>{workspace.seats}</td>
                          <td><span className={`status-badge billing-status-${workspace.status.toLowerCase().replace(/ /g, '-')}`}>{workspace.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          ) : activeTab === 'security' ? (
            <SecurityAudit />
          ) : (
            <section className="admin-card-section" style={{ marginTop: '24px' }}>
              <h2>{adminTabs.find((tab) => tab.id === activeTab)?.label}</h2>
              <p className="admin-placeholder-text">This section will be available in a future update. We are currently using mock data for UI design.</p>
            </section>
          )}
        </main>
      </div>
    </Motion.div>
  );
};

export default AdminPortal;
