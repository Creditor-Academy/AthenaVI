import React, { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import { 
  MdPeople, 
  MdAdminPanelSettings, 
  MdSettings, 
  MdSync,
  MdAnalytics,
  MdVideoLibrary,
  MdCloud,
  MdEdit,
  MdDeleteForever
} from 'react-icons/md';
import AdminPortalSkeleton from '../page-skeleton/AdminPortalSkeleton';
import DashboardOverview from '../../components/features/admin/DashboardOverview';
import UsersModule from './components/UsersModule';
import RenderingModule from './components/RenderingModule';
import ContentModule from './components/ContentModule';
import PlatformModule from './components/PlatformModule';
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
    { id: 'users', label: 'Users', icon: <MdPeople /> },
    { id: 'rendering', label: 'Rendering', icon: <MdSync /> },
    { id: 'content', label: 'Content', icon: <MdVideoLibrary /> },
    { id: 'platform', label: 'Platform', icon: <MdCloud /> },
    { id: 'analytics', label: 'Analytics', icon: <MdAnalytics /> },
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
              {activeTab === 'users' && 'Manage users, workspaces, credits, and access logs.'}
              {activeTab === 'rendering' && 'Monitor render jobs, workers, and queue health.'}
              {activeTab === 'content' && 'Moderate videos, review reports, and manage avatars.'}
              {activeTab === 'platform' && 'Configure plans, integrations, infrastructure, and permissions.'}
              {activeTab === 'analytics' && 'View platform usage, render trends, and export reports.'}
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
            <div className="admin-dashboard-container">
              <DashboardOverview />
            </div>
          ) : activeTab === 'users' ? (
            <UsersModule />
          ) : activeTab === 'rendering' ? (
            <RenderingModule />
          ) : activeTab === 'content' ? (
            <ContentModule />
          ) : activeTab === 'platform' ? (
            <PlatformModule />
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
          ) : null}
        </main>
      </div>
    </Motion.div>
  );
};

export default AdminPortal;
