import { useMemo } from 'react';
import { MdStorage } from 'react-icons/md';
import StorageUsageBar from '../../../ui/StorageUsageBar/StorageUsageBar.jsx';
import { formatBytes } from '../../../../utils/formatSize.js';
import '../../../ui/StorageUsageBar/StorageUsageBar.css';
import './WorkspaceStorageSummary.css';

function WorkspaceStorageDetails({ storage, loading, error, variant = 'default' }) {
  const footprintRows = useMemo(() => {
    const fp = storage?.footprint;
    if (!fp) return [];
    return [
      { label: 'Assets', bytes: fp.assetBytes },
      { label: 'Avatar videos', bytes: fp.heygenBytes },
      { label: 'Renders', bytes: fp.renderBytes },
      { label: 'Total footprint', bytes: fp.totalBytes, emphasis: true },
    ];
  }, [storage]);

  const rootClass = variant === 'panel'
    ? 'workspace-storage-details workspace-storage-details--panel'
    : 'workspace-storage-details';

  return (
    <div className={rootClass}>
      <header className="workspace-storage-summary__header">
        <span className="workspace-storage-details__header-icon" aria-hidden>
          <MdStorage size={18} />
        </span>
        <div>
          <h4>Storage overview</h4>
          <p>
            {storage?.owner?.name
              ? `Counts against ${storage.owner.name}'s account quota`
              : 'Workspace storage footprint and owner quota'}
          </p>
        </div>
      </header>

      {error ? <p className="workspace-storage-summary__error">{error}</p> : null}

      <StorageUsageBar
        loading={loading}
        usedBytes={storage?.quota?.usedBytes}
        limitBytes={storage?.quota?.limitBytes}
        label="Owner quota"
      />

      {footprintRows.length > 0 ? (
        <div className="workspace-storage-summary__footprint">
          <h5>Workspace footprint</h5>
          <ul>
            {footprintRows.map((row) => (
              <li key={row.label} className={row.emphasis ? 'is-total' : ''}>
                <span>{row.label}</span>
                <span>{loading ? '…' : formatBytes(row.bytes)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default WorkspaceStorageDetails;
