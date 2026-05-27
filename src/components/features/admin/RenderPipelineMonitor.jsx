import React, { useState } from 'react';
import { MdErrorOutline, MdCheckCircle, MdHourglassTop, MdRefresh, MdStorage, MdPlayArrow, MdWarning, MdMoreVert, MdCached } from 'react-icons/md';

const RenderPipelineMonitor = () => {
  const [jobs, setJobs] = useState([
    { id: 'JOB-1124', type: 'Video Render', status: 'QUEUED', submitted: '2m ago', worker: '–', error: '', progress: 0 },
    { id: 'JOB-1121', type: 'Voice Render', status: 'PROCESSING', submitted: '5m ago', worker: 'worker-09', error: '', progress: 65 },
    { id: 'JOB-1118', type: 'Transcode', status: 'FAILED', submitted: '18m ago', worker: 'worker-03', error: 'Timeout writing segment 7', progress: 0 },
    { id: 'JOB-1115', type: 'Thumbnail', status: 'DONE', submitted: '28m ago', worker: 'worker-02', error: '', progress: 100 },
    { id: 'JOB-1110', type: 'Video Render', status: 'QUEUED', submitted: '32m ago', worker: '–', error: '', progress: 0 },
    { id: 'JOB-1105', type: 'Transcode', status: 'DONE', submitted: '45m ago', worker: 'worker-01', error: '', progress: 100 },
  ]);

  const workerPools = [
    { name: 'worker-01', status: 'Idle', queue: 0 },
    { name: 'worker-02', status: 'Online', queue: 1 },
    { name: 'worker-03', status: 'Offline', queue: 0 },
    { name: 'worker-09', status: 'Busy', queue: 3 },
    { name: 'worker-10', status: 'Idle', queue: 0 },
  ];

  const handleRequeue = (jobId) => {
    setJobs((prevJobs) => prevJobs.map((job) => job.id === jobId ? { ...job, status: 'QUEUED', worker: '–', error: '', progress: 0 } : job));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'QUEUED': return { bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.18)', text: '#3b82f6' };
      case 'PROCESSING': return { bg: 'rgba(234, 179, 8, 0.12)', border: 'rgba(234, 179, 8, 0.18)', text: '#b45309' };
      case 'DONE': return { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.18)', text: '#10b981' };
      case 'FAILED': return { bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.18)', text: '#ef4444' };
      default: return { bg: 'rgba(107, 114, 128, 0.12)', border: 'rgba(107, 114, 128, 0.18)', text: '#6b7280' };
    }
  };

  const getWorkerStatusColor = (status) => {
    switch (status) {
      case 'Online': return { bg: 'rgba(16, 185, 129, 0.12)', text: '#10b981' };
      case 'Busy': return { bg: 'rgba(234, 179, 8, 0.12)', text: '#b45309' };
      case 'Offline': return { bg: 'rgba(239, 68, 68, 0.12)', text: '#ef4444' };
      case 'Idle': return { bg: 'rgba(107, 114, 128, 0.12)', text: '#6b7280' };
      default: return { bg: 'rgba(107, 114, 128, 0.12)', text: '#6b7280' };
    }
  };

  const columns = [
    { id: 'QUEUED', label: 'Queued', icon: MdHourglassTop, color: '#3b82f6' },
    { id: 'PROCESSING', label: 'Processing', icon: MdPlayArrow, color: '#b45309' },
    { id: 'DONE', label: 'Completed', icon: MdCheckCircle, color: '#10b981' },
    { id: 'FAILED', label: 'Failed', icon: MdErrorOutline, color: '#ef4444' },
  ];

  return (
    <section className="admin-card-section" style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2>Render Pipeline Monitoring</h2>
          <p className="admin-placeholder-text">Monitor job state, failed renders, and worker pool status for the platform render pipeline.</p>
        </div>
        <button className="btn-admin-action" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.18)' }}>
          <MdRefresh /> Refresh queue
        </button>
      </div>

      {/* Worker Pool Status */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '1.05rem', fontWeight: 700 }}>Worker Pool Status</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {workerPools.map((worker) => {
            const statusColor = getWorkerStatusColor(worker.status);
            return (
              <div key={worker.name} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: statusColor.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MdStorage size={24} style={{ color: statusColor.text }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{worker.name}</span>
                    <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '12px', background: statusColor.bg, color: statusColor.text, fontWeight: 500 }}>{worker.status}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Queue: {worker.queue}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Job Queue Table */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '1.05rem', fontWeight: 700 }}>Job Queue</h3>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(59, 130, 246, 0.05)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Job ID</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Type</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Submitted</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Worker</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Progress</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => {
                const statusColor = getStatusColor(job.status);
                const StatusIcon = columns.find(c => c.id === job.status)?.icon || MdHourglassTop;
                return (
                  <tr key={job.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '14px 16px', fontSize: '0.9rem', fontWeight: 500 }}>{job.id}</td>
                    <td style={{ padding: '14px 16px', fontSize: '0.9rem' }}>{job.type}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', background: statusColor.bg, color: statusColor.text, fontSize: '0.85rem', fontWeight: 500 }}>
                        <StatusIcon size={16} />
                        {job.status}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{job.submitted}</td>
                    <td style={{ padding: '14px 16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{job.worker}</td>
                    <td style={{ padding: '14px 16px', width: '150px' }}>
                      {job.status === 'PROCESSING' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '6px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${job.progress}%`, height: '100%', background: statusColor.text, borderRadius: '3px', transition: 'width 0.3s' }}></div>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', minWidth: '35px' }}>{job.progress}%</span>
                        </div>
                      ) : job.status === 'DONE' ? (
                        <span style={{ fontSize: '0.85rem', color: '#10b981' }}>Complete</span>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>–</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {job.status === 'FAILED' && (
                        <button
                          onClick={() => handleRequeue(job.id)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseOver={(e) => e.target.style.background = 'rgba(59, 130, 246, 0.15)'}
                          onMouseOut={(e) => e.target.style.background = 'rgba(59, 130, 246, 0.1)'}
                        >
                          <MdCached size={16} />
                          Requeue
                        </button>
                      )}
                      {job.error && (
                        <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MdWarning size={14} />
                          {job.error}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default RenderPipelineMonitor;
