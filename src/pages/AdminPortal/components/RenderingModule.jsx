import React from 'react';
import RenderPipelineMonitor from '../../../components/features/admin/RenderPipelineMonitor';

const RenderingModule = () => {
  const subTabs = [
    { id: 'jobs', label: 'Jobs', icon: null },
    { id: 'failures', label: 'Failures', icon: null },
    { id: 'queue-health', label: 'Queue Health', icon: null },
  ];

  const [activeSubTab, setActiveSubTab] = React.useState('jobs');

  // Mock data for demonstration purposes
  const failedJobs = [
    { id: 'JOB-001', userId: 'USR-12', type: 'Render', error: 'GPU OOM', timestamp: '2026-05-30 14:22', retryCount: 1 },
    { id: 'JOB-045', userId: 'USR-34', type: 'Encode', error: 'Codec Not Supported', timestamp: '2026-05-29 09:15', retryCount: 0 },
  ];

  const queueMetrics = [
    { label: 'Pending Jobs', value: '128', note: 'Waiting in queue' },
    { label: 'Active Workers', value: '12', note: 'Processing jobs' },
    { label: 'Avg Wait Time', value: '3.4 min', note: 'Recent average' },
  ];

  const [activeMetric, setActiveMetric] = React.useState('Pending Jobs');

  const renderMetricDetails = () => {
    switch (activeMetric) {
      case 'Pending Jobs':
        return (
          <div className="metric-details-panel">
            <div className="metric-details-header">
              <h4>Pending Jobs Overview</h4>
              <p>Jobs waiting to be processed in the rendering queue.</p>
            </div>
            <div style={{ display: 'grid', gap: '10px' }}>
              {[{ label: 'Completed (Last Hour)', value: '156 jobs' },
                { label: 'Active Renders', value: '42 jobs' },
                { label: 'Total Today', value: '3,412 jobs' },
                { label: 'Avg Render Time', value: '4.8 mins' }]
                .map((stat) => (
                  <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
                    <strong style={{ color: 'var(--text-main)' }}>{stat.value}</strong>
                  </div>
                ))}
            </div>
          </div>
        );
      case 'Active Workers':
        return (
          <div className="metric-details-panel">
            <div className="metric-details-header">
              <h4>Hardware Node Load</h4>
            </div>
            <div style={{ display: 'grid', gap: '12px' }}>
              {[{ node: 'GPU Cluster Alpha', utilization: 84 },
                { node: 'GPU Cluster Beta', utilization: 68 },
                { node: 'CPU Compute Nodes', utilization: 41 }]
                .map((node) => (
                  <div key={node.node}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                      <span>{node.node}</span>
                      <strong>{node.utilization}%</strong>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${node.utilization}%`, height: '100%', background: '#10b981', borderRadius: '3px' }} />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        );
      case 'Error Rate':
        return (
          <div className="metric-details-panel">
            <div className="metric-details-header">
              <h4>Failure Analysis</h4>
              <p>Top execution failure exceptions captured by system alert monitors over the past 24 hours.</p>
            </div>
            <div style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
              {[{ error: 'GPU Out of Memory (OOM)', occurrences: 32, percentage: 58, description: 'Render asset resolution exceeds virtual frame buffer limits.' },
                { error: 'Storage Write Timeout', occurrences: 15, percentage: 28, description: 'Delay in flushing segments to S3 target buckets.' },
                { error: 'Unsupported Codec Profile', occurrences: 8, percentage: 14, description: 'Input container formats mismatch transcode pipeline settings.' }]
                .map((item) => (
                  <div key={item.error} style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.02)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ color: '#ef4444', fontSize: '0.95rem' }}>{item.error}</strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.occurrences} events ({item.percentage}%)</span>
                    </div>
                    <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.description}</p>
                    <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${item.percentage}%`, height: '100%', background: '#ef4444', borderRadius: '3px' }} />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

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
              {queueMetrics.map((metric) => {
                const isActive = activeMetric === metric.label;
                return (
                  <div
                    key={metric.label}
                    className={`workspace-metric-card clickable ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveMetric(metric.label)}
                  >
                    <div className="metric-icon">
                      {/* Placeholder for icon */}
                    </div>
                    <div className="metric-content">
                      <span className="metric-label">{metric.label}</span>
                      <strong className="metric-value">{metric.value}</strong>
                      <p className="metric-note">{metric.note}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {renderMetricDetails()}
          </section>
        )}
      </div>
    </div>
  );
};

export default RenderingModule;

