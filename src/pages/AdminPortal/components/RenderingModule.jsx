import React, { useState } from 'react';
import RenderPipelineMonitor from '../../../components/features/admin/RenderPipelineMonitor';
import { MdWork, MdWarning, MdHealthAndSafety, MdQueue } from 'react-icons/md';
import '../AdminPortal.css';

const RenderingModule = () => {
  const [activeSubTab, setActiveSubTab] = useState('jobs');

  const subTabs = [
    { id: 'jobs', label: 'Jobs', icon: null },
    { id: 'workers', label: 'Workers', icon: <MdWork size={16} /> },
    { id: 'failures', label: 'Failures', icon: <MdWarning size={16} /> },
    { id: 'queue-health', label: 'Queue Health', icon: <MdHealthAndSafety size={16} /> },
  ];

  const workerPools = [
    { id: 'GPU-01', name: 'High-Performance GPU', status: 'Active', activeWorkers: 12, totalWorkers: 16, queueDepth: 23, avgRenderTime: '4.2m' },
    { id: 'GPU-02', name: 'Standard GPU Pool', status: 'Active', activeWorkers: 8, totalWorkers: 12, queueDepth: 45, avgRenderTime: '8.5m' },
    { id: 'CPU-01', name: 'CPU Rendering Pool', status: 'Active', activeWorkers: 24, totalWorkers: 32, queueDepth: 12, avgRenderTime: '15.3m' },
    { id: 'GPU-03', name: 'Premium GPU Pool', status: 'Maintenance', activeWorkers: 0, totalWorkers: 8, queueDepth: 0, avgRenderTime: '3.1m' },
  ];

  const failedJobs = [
    { id: 'JOB-4521', userId: 'USR-8472', type: 'Video Render', error: 'GPU memory exceeded', timestamp: '2026-05-20 14:32', retryCount: 2 },
    { id: 'JOB-4523', userId: 'USR-9153', type: 'Image Generation', error: 'Timeout after 300s', timestamp: '2026-05-20 13:15', retryCount: 1 },
    { id: 'JOB-4528', userId: 'USR-3321', type: 'Video Render', error: 'Invalid input format', timestamp: '2026-05-20 11:45', retryCount: 0 },
  ];

  const queueMetrics = [
    { label: 'Total Queue Depth', value: '80', note: 'Jobs waiting' },
    { label: 'Avg Wait Time', value: '12.4m', note: 'Before processing' },
    { label: 'Throughput', value: '156/hr', note: 'Jobs completed' },
    { label: 'Error Rate', value: '2.3%', note: 'Last 24 hours' },
  ];

  return (
    <div>
      <div className="admin-sub-tab-switch" role="tablist" aria-label="Rendering sections">
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
        {activeSubTab === 'jobs' && <RenderPipelineMonitor />}
        
        {activeSubTab === 'workers' && (
          <section className="admin-card-section" style={{ marginTop: '24px' }}>
            <div className="billing-hero">
              <div>
                <h2>Worker Pools</h2>
                <p className="admin-placeholder-text">Monitor worker pool status, capacity, and performance metrics.</p>
              </div>
            </div>

            <div className="worker-pool-grid">
              {workerPools.map((pool) => (
                <div key={pool.id} className="worker-pool-card">
                  <div className="worker-pool-header">
                    <span className="worker-pool-name">{pool.name}</span>
                    <span className={`worker-pool-status ${pool.status === 'Active' ? 'status-active' : 'status-suspended'}`}>
                      {pool.status}
                    </span>
                  </div>
                  <div className="worker-pool-metrics">
                    <div className="worker-metric">
                      <span className="meta-label">Active</span>
                      <strong>{pool.activeWorkers}/{pool.totalWorkers}</strong>
                    </div>
                    <div className="worker-metric">
                      <span className="meta-label">Queue</span>
                      <strong>{pool.queueDepth}</strong>
                    </div>
                    <div className="worker-metric">
                      <span className="meta-label">Avg Time</span>
                      <strong>{pool.avgRenderTime}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {activeSubTab === 'failures' && (
          <section className="admin-card-section" style={{ marginTop: '24px' }}>
            <div className="billing-hero">
              <div>
                <h2>Failed Jobs</h2>
                <p className="admin-placeholder-text">Review and manage failed render jobs with error details.</p>
              </div>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Job ID</th>
                    <th>User ID</th>
                    <th>Type</th>
                    <th>Error</th>
                    <th>Timestamp</th>
                    <th>Retries</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {failedJobs.map((job) => (
                    <tr key={job.id}>
                      <td>{job.id}</td>
                      <td>{job.userId}</td>
                      <td>{job.type}</td>
                      <td style={{ color: '#ef4444' }}>{job.error}</td>
                      <td>{job.timestamp}</td>
                      <td>{job.retryCount}</td>
                      <td>
                        <button className="user-action-btn" onClick={() => alert(`Retry job: ${job.id}`)}>
                          Retry
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        
        {activeSubTab === 'queue-health' && (
          <section className="admin-card-section" style={{ marginTop: '24px' }}>
            <div className="billing-hero">
              <div>
                <h2>Queue Health</h2>
                <p className="admin-placeholder-text">Monitor queue performance and system health metrics.</p>
              </div>
            </div>

            <div className="workspace-metrics-grid">
              {queueMetrics.map((metric) => (
                <div key={metric.label} className="workspace-metric-card">
                  <div className="metric-icon">
                    <MdQueue size={24} />
                  </div>
                  <div className="metric-content">
                    <span className="metric-label">{metric.label}</span>
                    <strong className="metric-value">{metric.value}</strong>
                    <p className="metric-note">{metric.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default RenderingModule;
