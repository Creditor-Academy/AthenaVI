import SuperadminUsersPanel from '../../components/features/admin/superadmin/SuperadminUsersPanel'
import SuperadminWorkspacesPanel from '../../components/features/admin/superadmin/SuperadminWorkspacesPanel'
import SuperadminReportsPanel from '../../components/features/admin/superadmin/SuperadminReportsPanel'
import './SuperadminPortal.css'

const VALID_TABS = new Set(['users', 'workspaces', 'reports'])

function normalizeTab(tab) {
  return VALID_TABS.has(tab) ? tab : 'users'
}

const AdminPortal = ({
  activeTab: controlledActiveTab,
  onTabChange,
}) => {
  const activeTab = normalizeTab(controlledActiveTab)

  return (
    <div className="sa-portal">
      {activeTab === 'users' && <SuperadminUsersPanel />}
      {activeTab === 'workspaces' && <SuperadminWorkspacesPanel />}
      {activeTab === 'reports' && <SuperadminReportsPanel />}
    </div>
  )
}

export default AdminPortal
