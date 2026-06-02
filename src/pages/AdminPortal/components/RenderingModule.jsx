import React, { useState } from 'react';
import RenderPipelineMonitor from '../../../components/features/admin/RenderPipelineMonitor';
import { MdWarning, MdHealthAndSafety, MdQueue } from 'react-icons/md';
import '../AdminPortal.css';

const RenderingModule = () => {
  const [activeSubTab, setActiveSubTab] = useState('jobs');
  const [activeMetric, setActiveMetric] = useState('Total Queue Depth');

  const subTabs = [
    { id: 'jobs', label: 'Jobs', icon: null },
    { id: 'failures', label: 'Failures', icon: <MdWarning size={16} /> },
    { id: 'queue-health', label: 'Queue Health', icon: <MdHealthAndSafety size={16} /> },
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

  const renderMetricDetails = () => {
    switch (activeMetric) {
      case 'Total Queue Depth':
        return (
          <div className="metric-details-panel">
            <div className="metric-details-header">
              <h4>Queue Depth Breakdown</h4>
              <p>Current distribution of jobs waiting in the queue by task category.</p>
            </div>
            <div style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
              {[
                { label: 'Video Rendering', count: 48, percentage: 60, color: '#3b82f6' },
                { label: 'Audio Transcoding', count: 20, percentage: 25, color: '#a855f7' },
                { label: 'Thumbnail Extraction', count: 12, percentage: 15, color: '#10b981' }
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                    <span style={{ fontWeight: 600 }}>{item.label}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{item.count} jobs ({item.percentage}%)</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${item.percentage}%`, height: '100%', background: item.color, borderRadius: '4px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'Avg Wait Time':
        return (
          <div className="metric-details-panel">
            <div className="metric-details-header">
              <h4>Wait Time Latency Analysis</h4>
              <p>Average latency before a job gets picked up by a worker node, categorized by region.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
              {[
                { region: 'US-East (N. Virginia)', latency: '8.5 mins', load: 'High Load', loadColor: '#ef4444' },
                { region: 'EU-West (Ireland)', latency: '11.2 mins', load: 'Medium Load', loadColor: '#f59e0b' },
                { region: 'AP-South (Mumbai)', latency: '15.6 mins', load: 'Peak Overload', loadColor: '#ef4444' },
                { region: 'US-West (Oregon)', latency: '3.4 mins', load: 'Optimal Load', loadColor: '#10b981' }
              ].map((item) => (
                <div key={item.region} style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '14px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.region}</span>
                  <strong style={{ fontSize: '1.4rem', display: 'block', margin: '8px 0' }}>{item.latency}</strong>
                  <span style={{ fontSize: '0.85rem', color: item.loadColor, fontWeight: 600 }}>● {item.load}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'Throughput':
        return (
          <div className="metric-details-panel">
            <div className="metric-details-header">
              <h4>Throughput & Utilization Metrics</h4>
              <p>Platform execution throughput and CPU/GPU resources load efficiency.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '16px' }}>
              <div style={{ padding: '18px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '14px' }}>
                <h5 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 600 }}>Performance Statistics</h5>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {[
                    { label: 'Completed (Last Hour)', value: '156 jobs' },
                    { label: 'Active Renders', value: '42 jobs' },
                    { label: 'Total Today', value: '3,412 jobs' },
                    { label: 'Avg Render Time', value: '4.8 mins' }
                  ].map((stat) => (
                    <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
                      <strong style={{ color: 'var(--text-main)' }}>{stat.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: '18px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '14px' }}>
                <h5 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 600 }}>Hardware Node Load</h5>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {[
                    { node: 'GPU Cluster Alpha', utilization: 84 },
                    { node: 'GPU Cluster Beta', utilization: 68 },
                    { node: 'CPU Compute Nodes', utilization: 41 }
                  ].map((node) => (
                    <div key={node.node}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                        <span>{node.node}</span>
                        <strong>{node.utilization}%</strong>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${node.utilization}%`, height: '100%', background: '#10b981', borderRadius: '3px' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
              {[
                { error: 'GPU Out of Memory (OOM)', occurrences: 32, percentage: 58, description: 'Render asset resolution exceeds virtual frame buffer limits.' },
                { error: 'Storage Write Timeout', occurrences: 15, percentage: 28, description: 'Delay in flushing segments to S3 target buckets.' },
                { error: 'Unsupported Codec Profile', occurrences: 8, percentage: 14, description: 'Input container formats mismatch transcode pipeline settings.' }
              ].map((item) => (
                <div key={item.error} style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.02)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ color: '#ef4444', fontSize: '0.95rem' }}>{item.error}</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.occurrences} events ({item.percentage}%)</span>
                  </div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.description}</p>
                  <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${item.percentage}%`, height: '100%', background: '#ef4444', borderRadius: '3px' }}></div>
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
                      <MdQueue size={24} />
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
