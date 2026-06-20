import { useWorkspaceStorage } from '../../../../hooks/useStorageQuota.js';
import WorkspaceStorageDetails from './WorkspaceStorageDetails.jsx';
import './WorkspaceStorageSummary.css';

function WorkspaceStorageSummary({ workspaceId }) {
  const { storage, loading, error } = useWorkspaceStorage(workspaceId);

  if (!workspaceId) return null;

  return (
    <section className="workspace-storage-summary" aria-label="Workspace storage">
      <WorkspaceStorageDetails storage={storage} loading={loading} error={error} />
    </section>
  );
}

export default WorkspaceStorageSummary;
