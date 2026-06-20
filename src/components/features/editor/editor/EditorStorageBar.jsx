import { MdStorage } from 'react-icons/md';
import useStorageQuota from '../../../../hooks/useStorageQuota.js';

function EditorStorageBar({ workspaceId }) {
  const { quota, loading, error } = useStorageQuota();

  if (!workspaceId) return null;

  const pct = loading
    ? null
    : Math.min(100, Math.round(Number(quota?.percentUsed ?? 0)));
  const tooltip =
    error ||
    (loading
      ? 'Loading storage…'
      : `${pct ?? 0}% of your storage quota used`);

  return (
    <div
      className="editor-storage-pill"
      title={tooltip}
      aria-label={tooltip}
    >
      <MdStorage size={15} aria-hidden />
      <span className="editor-storage-pill__value">{loading ? '…' : `${pct ?? 0}%`}</span>
      <span className="editor-storage-pill__label">Storage</span>
    </div>
  );
}

export default EditorStorageBar;
