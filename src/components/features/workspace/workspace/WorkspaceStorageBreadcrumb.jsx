import { useEffect, useMemo, useRef, useState } from 'react';
import { MdKeyboardArrowDown, MdStorage } from 'react-icons/md';
import { useWorkspaceStorage } from '../../../../hooks/useStorageQuota.js';
import { formatBytes } from '../../../../utils/formatSize.js';
import WorkspaceStorageDetails from './WorkspaceStorageDetails.jsx';
import './WorkspaceStorageBreadcrumb.css';

function getUsagePercent(usedBytes, limitBytes) {
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

function WorkspaceStorageBreadcrumb({ workspaceId }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const { storage, loading, error } = useWorkspaceStorage(workspaceId);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const usedBytes = storage?.quota?.usedBytes;
  const limitBytes = storage?.quota?.limitBytes;
  const percent = useMemo(
    () => getUsagePercent(usedBytes, limitBytes),
    [usedBytes, limitBytes]
  );
  const level = getUsageLevel(percent);

  if (!workspaceId) return null;

  return (
    <div className="workspace-storage-breadcrumb" ref={rootRef}>
      <button
        type="button"
        className={`workspace-storage-breadcrumb__btn workspace-storage-breadcrumb__btn--${level} ${open ? 'is-open' : ''} ${loading ? 'is-loading' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Workspace storage: ${loading ? 'loading' : `${percent}% used`}`}
      >
        <span className="workspace-storage-breadcrumb__icon-wrap" aria-hidden>
          <MdStorage size={17} />
        </span>

        <span className="workspace-storage-breadcrumb__content">
          <span className="workspace-storage-breadcrumb__eyebrow">Storage</span>
          <span className="workspace-storage-breadcrumb__stats">
            {loading ? (
              <span className="workspace-storage-breadcrumb__loading-text">Loading usage…</span>
            ) : (
              <>
                <strong>{formatBytes(usedBytes)}</strong>
                <span className="workspace-storage-breadcrumb__sep">of</span>
                <span className="workspace-storage-breadcrumb__total">{formatBytes(limitBytes)}</span>
              </>
            )}
          </span>
          <span className="workspace-storage-breadcrumb__meter" aria-hidden>
            <span
              className="workspace-storage-breadcrumb__meter-fill"
              style={{ width: loading ? '35%' : `${percent}%` }}
            />
          </span>
        </span>

        {!loading ? (
          <span className="workspace-storage-breadcrumb__badge">{percent}%</span>
        ) : null}

        <MdKeyboardArrowDown
          size={18}
          aria-hidden
          className={`workspace-storage-breadcrumb__arrow ${open ? 'open' : ''}`}
        />
      </button>

      {open ? (
        <div className="workspace-storage-breadcrumb__panel fade-in-fast" role="region" aria-label="Workspace storage">
          <div className="workspace-storage-breadcrumb__panel-accent" aria-hidden />
          <WorkspaceStorageDetails
            storage={storage}
            loading={loading}
            error={error}
            variant="panel"
          />
        </div>
      ) : null}
    </div>
  );
}

export default WorkspaceStorageBreadcrumb;
