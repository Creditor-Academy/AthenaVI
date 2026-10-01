import React, { Component } from 'react'
import DashboardOverview from '../../components/features/admin/DashboardOverview'
import SuperadminUsersPanel from '../../components/features/admin/superadmin/SuperadminUsersPanel'
import SuperadminWorkspacesPanel from '../../components/features/admin/superadmin/SuperadminWorkspacesPanel'
import SuperadminStorageRequestsPanel from '../../components/features/admin/superadmin/SuperadminStorageRequestsPanel'
import SuperadminReportsPanel from '../../components/features/admin/superadmin/SuperadminReportsPanel'
import SuperadminPlatformActionsPanel from '../../components/features/admin/superadmin/SuperadminPlatformActionsPanel'
import SuperadminHeygenPanel from '../../components/features/admin/superadmin/SuperadminHeygenPanel'
import SuperadminBroadcastPanel from '../../components/features/admin/superadmin/SuperadminBroadcastPanel'
import SuperadminEarlyAccessPanel from '../../components/features/admin/superadmin/SuperadminEarlyAccessPanel'
import SuperadminTemplatesPanel from '../../components/features/admin/superadmin/SuperadminTemplatesPanel'
import SuperadminGraphicsPanel from '../../components/features/admin/superadmin/SuperadminGraphicsPanel'
import './styles/AdminBase.css'
import './styles/SuperadminBase.css'

const VALID_TABS = new Set(['overview', 'users', 'workspaces', 'storage-requests', 'reports', 'platform-actions', 'heygen', 'broadcast', 'early-access', 'templates', 'graphics', 'ai-template'])

function normalizeTab(tab) {
  return VALID_TABS.has(tab) ? tab : 'overview'
}

class AdminPanelErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, errorInfo) {
    console.error('[AdminPanelErrorBoundary]:', error, errorInfo)
  }
  componentDidUpdate(prevProps) {
    if (prevProps.activeTab !== this.props.activeTab && this.state.hasError) {
      this.setState({ hasError: false, error: null })
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="sa-panel" style={{ padding: 40, textAlign: 'center' }}>
          <div className="sa-alert sa-alert--error" style={{ maxWidth: 600, margin: '0 auto 20px' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: 700 }}>Something went wrong loading this panel</h3>
            <p style={{ margin: '0 0 12px', fontSize: '0.85rem' }}>{this.state.error?.message || 'An unexpected error occurred while rendering.'}</p>
            <button
              type="button"
              className="sa-btn sa-btn--primary sa-btn--sm"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Retry
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const AdminPortal = ({
  activeTab: controlledActiveTab,
  onTabChange,
}) => {
  const activeTab = normalizeTab(controlledActiveTab)

  const flowTabs = activeTab === 'overview'

  return (
    <div className={`sa-portal${flowTabs ? ' sa-portal--flow' : ''}`}>
      <AdminPanelErrorBoundary activeTab={activeTab}>
        {activeTab === 'overview' && <DashboardOverview />}
        {activeTab === 'users' && <SuperadminUsersPanel />}
        {activeTab === 'workspaces' && <SuperadminWorkspacesPanel />}
        {activeTab === 'storage-requests' && <SuperadminStorageRequestsPanel />}
        {activeTab === 'reports' && <SuperadminReportsPanel />}
        {activeTab === 'platform-actions' && <SuperadminPlatformActionsPanel />}
        {activeTab === 'heygen' && <SuperadminHeygenPanel />}
        {activeTab === 'broadcast' && <SuperadminBroadcastPanel />}
        {activeTab === 'early-access' && <SuperadminEarlyAccessPanel />}
        {activeTab === 'templates' && <SuperadminTemplatesPanel />}
        {activeTab === 'graphics' && <SuperadminGraphicsPanel />}
      </AdminPanelErrorBoundary>
    </div>
  )
}

export default AdminPortal
