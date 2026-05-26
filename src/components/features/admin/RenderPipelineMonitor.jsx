import React, { useState } from 'react';
import { MdErrorOutline, MdCheckCircle, MdHourglassTop, MdRefresh, MdStorage } from 'react-icons/md';

const RenderPipelineMonitor = () => {
  const [jobs, setJobs] = useState([
    { id: 'JOB-1124', type: 'Video Render', status: 'QUEUED', submitted: '2m ago', worker: '–', error: '' },
    { id: 'JOB-1121', type: 'Voice Render', status: 'PROCESSING', submitted: '5m ago', worker: 'worker-09', error: '' },
    { id: 'JOB-1118', type: 'Transcode', status: 'FAILED', submitted: '18m ago', worker: 'worker-03', error: 'Timeout writing segment 7' },
    { id: 'JOB-1115', type: 'Thumbnail', status: 'DONE', submitted: '28m ago', worker: 'worker-02', error: '' },
  ]);

  const summary = [
    { label: 'Queued Jobs', value: jobs.filter((job) => job.status === 'QUEUED').length },
    { label: 'Processing', value: jobs.filter((job) => job.status === 'PROCESSING').length },
    { label: 'Failed', value: jobs.filter((job) => job.status === 'FAILED').length },
    { label: 'Completed', value: jobs.filter((job) => job.status === 'DONE').length },
  ];

  const workerPools = [
    { name: 'worker-01', status: 'Idle', queue: 0 },
    { name: 'worker-02', status: 'Online', queue: 1 },
    { name: 'worker-03', status: 'Error', queue: 2 },
    { name: 'worker-09', status: 'Busy', queue: 3 },
  ];

  const handleRequeue = (jobId) => {
    setJobs((prevJobs) => prevJobs.map((job) => job.id === jobId ? { ...job, status: 'QUEUED', worker: '–', error: '' } : job));
  };

  return (
    <section className="admin-card-section" style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2>Render Pipeline Monitoring</h2>
          <p className="admin-placeholder-text">Monitor job state, failed renders, and worker pool status for the platform render pipeline.</p>
        </div>
        <button className="btn-admin-action" style={{ background: '#e0f2fe', color: '#0369a1' }}>
          <MdRefresh /> Refresh queue
        </button>
      </div>

      <div className="billing-summary-grid">
        {summary.map((item) => (
          <div key={item.label} className="billing-summary-card">
            <span className="billing-metric-label">{item.label}</span>
            <strong className="billing-metric-value">{item.value}</strong>
          </div>
        ))}
      </div>

      <div className="billing-panel-grid">
        <div className="billing-panel">
          <div className="billing-panel-header">
            <h3>Render jobs</h3>
            <span className="billing-tag">Pipeline queue</span>
          </div>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Worker</th>
                  <th>Error</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td>{job.id}</td>
                    <td>{job.type}</td>
                    <td>
                      <span className={`status-badge status-${job.status.toLowerCase()}`}>
                        {job.status}
                      </span>
                    </td>
                    <td>{job.submitted}</td>
                    <td>{job.worker}</td>
                    <td>{job.error || '—'}</td>
                    <td>
                      {job.status === 'FAILED' && (
                        <button
                          type="button"
                          className="btn-admin-action"
                          style={{ background: '#fde68a', color: '#92400e', borderRadius: '10px', padding: '8px 12px' }}
                          onClick={() => handleRequeue(job.id)}
                        >
                          Requeue
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="billing-side-panel">
          <div className="billing-card">
            <h3>Worker pool status</h3>
            <div style={{ display: 'grid', gap: '14px', marginTop: '16px' }}>
              {workerPools.map((worker) => (
                <div key={worker.name} className="billing-account-row" style={{ justifyContent: 'space-between' }}>
                  <div>
                    <p className="billing-detail-label">{worker.name}</p>
                    <p className="billing-detail-note">Status: {worker.status}</p>
                  </div>
                  <span className="billing-tag">Queue {worker.queue}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="billing-card billing-overdue-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MdStorage size={24} />
              <h3 style={{ margin: 0 }}>Queue health</h3>
            </div>
            <p className="billing-alert-text" style={{ marginTop: '16px' }}>
              1 worker reporting errors and 1 job queued for retry. This view is designed for quick render pipeline triage.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RenderPipelineMonitor;
