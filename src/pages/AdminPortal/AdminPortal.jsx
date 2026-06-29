import DashboardOverview from '../../components/features/admin/DashboardOverview'
import SuperadminUsersPanel from '../../components/features/admin/superadmin/SuperadminUsersPanel'
import SuperadminWorkspacesPanel from '../../components/features/admin/superadmin/SuperadminWorkspacesPanel'
import SuperadminStorageRequestsPanel from '../../components/features/admin/superadmin/SuperadminStorageRequestsPanel'
import SuperadminReportsPanel from '../../components/features/admin/superadmin/SuperadminReportsPanel'
import SuperadminPlatformActionsPanel from '../../components/features/admin/superadmin/SuperadminPlatformActionsPanel'
import SuperadminHeygenPanel from '../../components/features/admin/superadmin/SuperadminHeygenPanel'
import './SuperadminPortal.css'

const VALID_TABS = new Set(['overview', 'users', 'workspaces', 'storage-requests', 'reports', 'platform-actions', 'heygen'])

function normalizeTab(tab) {
  return VALID_TABS.has(tab) ? tab : 'overview'
}

const AdminPortal = ({
  activeTab: controlledActiveTab,
  onTabChange,
}) => {
  const activeTab = normalizeTab(controlledActiveTab)

  return (
    <div className="sa-portal">
      {activeTab === 'overview' && <DashboardOverview />}
      {activeTab === 'users' && <SuperadminUsersPanel />}
      {activeTab === 'workspaces' && <SuperadminWorkspacesPanel />}
      {activeTab === 'storage-requests' && <SuperadminStorageRequestsPanel />}
      {activeTab === 'reports' && <SuperadminReportsPanel />}
      {activeTab === 'platform-actions' && <SuperadminPlatformActionsPanel />}
      {activeTab === 'heygen' && <SuperadminHeygenPanel />}
    </div>
  )
}

export default AdminPortal
