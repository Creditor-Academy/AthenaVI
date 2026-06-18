import { formatBytes } from '../../../utils/formatSize.js';

function StorageUsageBar({
  usedBytes = 0,
  limitBytes = 0,
  percentUsed,
  loading = false,
  compact = false,
  label = 'Storage used',
  className = '',
}) {
  const used = Number(usedBytes) || 0;
  const limit = Number(limitBytes) || 0;
  const pct =
    percentUsed != null && Number.isFinite(Number(percentUsed))
      ? Math.min(100, Math.round(Number(percentUsed)))
      : limit > 0
        ? Math.min(100, Math.round((used / limit) * 100))
        : 0;

  return (
    <div className={`storage-usage-bar ${compact ? 'storage-usage-bar--compact' : ''} ${className}`.trim()} aria-label={label}>
      <div className="storage-usage-bar__labels">
        <span>{label}</span>
        <span>{loading ? '…' : `${pct}%`}</span>
      </div>
      <div className="storage-usage-bar__track">
        <div
          className="storage-usage-bar__fill"
          style={{ width: loading ? '0%' : `${pct}%` }}
        />
      </div>
      {!compact && (
        <div className="storage-usage-bar__detail">
          {loading ? 'Loading…' : `${formatBytes(used)} of ${formatBytes(limit)} used`}
        </div>
      )}
    </div>
  );
}

export default StorageUsageBar;
