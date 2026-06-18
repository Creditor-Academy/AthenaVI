import { useMemo } from 'react';
import { MdArrowForward, MdStorage } from 'react-icons/md';
import useStorageQuota from '../../../hooks/useStorageQuota.js';
import { formatBytes } from '../../../utils/formatSize.js';

function getUsagePercent(usedBytes, limitBytes, percentUsed) {
  if (percentUsed != null && Number.isFinite(Number(percentUsed))) {
    return Math.min(100, Math.round(Number(percentUsed)));
  }
  const used = Number(usedBytes) || 0;
  const limit = Number(limitBytes) || 0;
  if (limit <= 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

function getUsageLevel(percent) {
  if (percent >= 90) return 'critical';
  if (percent >= 75) return 'warning';
  return 'normal';
}

function DashboardSidebarStorage({ onUpgrade }) {
  const { quota, loading, error } = useStorageQuota();
  const tierLabel = quota?.tier?.label;

  const usedBytes = quota?.usedBytes;
  const limitBytes = quota?.limitBytes;
  const percent = useMemo(
    () => getUsagePercent(usedBytes, limitBytes, quota?.percentUsed),
    [usedBytes, limitBytes, quota?.percentUsed]
  );
  const level = getUsageLevel(percent);

  return (
    <div
      className={`dashboard-sidebar-storage dashboard-sidebar-storage--${level} ${loading ? 'is-loading' : ''}`}
      aria-label="Storage usage"
    >
      <div className="dashboard-sidebar-storage__accent" aria-hidden />

      <div className="dashboard-sidebar-storage__header">
        <span className="dashboard-sidebar-storage__icon" aria-hidden>
          <MdStorage size={16} />
        </span>
        <div className="dashboard-sidebar-storage__heading">
          <span className="dashboard-sidebar-storage__eyebrow">Storage</span>
          {tierLabel ? (
            <span className="dashboard-sidebar-storage__tier">{tierLabel}</span>
          ) : null}
        </div>
        {!loading ? (
          <span className="dashboard-sidebar-storage__badge">{percent}%</span>
        ) : null}
      </div>

      <div className="dashboard-sidebar-storage__stats">
        {loading ? (
          <span className="dashboard-sidebar-storage__loading">Loading usage…</span>
        ) : (
          <>
            <strong>{formatBytes(usedBytes)}</strong>
            <span className="dashboard-sidebar-storage__sep">of</span>
            <span className="dashboard-sidebar-storage__total">{formatBytes(limitBytes)}</span>
          </>
        )}
      </div>

      <div className="dashboard-sidebar-storage__meter" aria-hidden>
        <span
          className="dashboard-sidebar-storage__meter-fill"
          style={{ width: loading ? '35%' : `${percent}%` }}
        />
      </div>

      {error ? <p className="dashboard-sidebar-storage__error">{error}</p> : null}

      <button type="button" className="dashboard-sidebar-storage__upgrade" onClick={onUpgrade}>
        <span>Get more storage</span>
        <MdArrowForward size={14} aria-hidden />
      </button>
      <p className="dashboard-sidebar-storage__hint">Contact your admin to upgrade</p>
    </div>
  );
}

export default DashboardSidebarStorage;
