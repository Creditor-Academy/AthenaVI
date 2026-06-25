import { useEffect, useState } from 'react'
import {
  MdPeople, MdBusiness, MdAttachMoney, MdStorage, MdWarning, MdNotifications,
} from 'react-icons/md'
import superadminService from '../../../services/superadminService'
import { defaultReportRange, formatAc, formatDate } from './superadmin/superadminUtils'
import '../../../pages/AdminPortal/AdminPortal.css'
import '../../../pages/AdminPortal/SuperadminPortal.css'

function usdFormat(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

const DashboardOverview = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [alerts, setAlerts] = useState(null)
  const [userTotal, setUserTotal] = useState(null)
  const [workspaceTotal, setWorkspaceTotal] = useState(null)
  const [pendingStorage, setPendingStorage] = useState(null)
  const [usageReport, setUsageReport] = useState(null)
  const [recentActions, setRecentActions] = useState([])

  useEffect(() => {
    let cancelled = false
    const range = defaultReportRange()

    async function load() {
      setLoading(true)
      setError('')
      try {
        const [alertsData, usersData, workspacesData, storageData, usageData, actionsData] = await Promise.all([
          superadminService.getAlertsSummary(),
          superadminService.listUsers({ page: 1, limit: 1 }),
          superadminService.listWorkspaces({ page: 1, limit: 1 }),
          superadminService.listStorageRequests({ page: 1, limit: 1, status: 'pending' }),
          superadminService.getUsageReport({ from: range.from, to: range.to, topLimit: 5 }),
          superadminService.getPlatformActionsReport({ page: 1, limit: 8 }),
        ])

        if (cancelled) return
        setAlerts(alertsData)
        setUserTotal(usersData.pagination?.total ?? 0)
        setWorkspaceTotal(workspacesData.pagination?.total ?? 0)
        setPendingStorage(storageData.pagination?.total ?? 0)
        setUsageReport(usageData.report || usageData)
        setRecentActions(actionsData.transactions || [])
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load dashboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const stats = [
    {
      label: 'Platform users',
      value: userTotal != null ? new Intl.NumberFormat().format(userTotal) : '—',
      icon: <MdPeople />,
      colorClass: 'blue-bg',
    },
    {
      label: 'TEAM workspaces',
      value: workspaceTotal != null ? new Intl.NumberFormat().format(workspaceTotal) : '—',
      icon: <MdBusiness />,
      colorClass: 'purple-bg',
    },
    {
      label: 'Usage (30 days)',
      value: usageReport ? formatAc(usageReport.totalUsageAc ?? 0) : '—',
      icon: <MdAttachMoney />,
      colorClass: 'green-bg',
    },
    {
      label: 'Pending storage requests',
      value: pendingStorage != null ? String(pendingStorage) : '—',
      icon: <MdStorage />,
      colorClass: 'orange-bg',
    },
  ]

  return (
    <div className="sa-panel sa-scroll" style={{ overflowY: 'auto' }}>
      <div className="sa-panel-header">
        <div>
          <h2 className="sa-panel-title">Platform dashboard</h2>
          <p className="sa-panel-desc">
            Live platform health — alerts, credit usage, and admin activity from the superadmin API.
          </p>
        </div>
      </div>

      {error && <div className="sa-alert sa-alert--error">{error}</div>}

      {/* Alert strip */}
      {alerts && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <div className="sa-metric-card">
            <div className="sa-metric-card-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MdNotifications size={14} /> Unread platform alerts
            </div>
            <div className="sa-metric-card-value">{alerts.unreadPlatformCount ?? 0}</div>
          </div>
          {alerts.heygenWallet && (
            <div className="sa-metric-card" style={{
              borderColor: alerts.heygenWallet.isLow ? 'color-mix(in srgb, #ef4444 40%, var(--border-color))' : undefined,
            }}>
              <div className="sa-metric-card-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {alerts.heygenWallet.isLow && <MdWarning size={14} style={{ color: '#ef4444' }} />}
                HeyGen wallet (USD)
              </div>
              <div className="sa-metric-card-value" style={{ color: alerts.heygenWallet.isLow ? '#ef4444' : undefined }}>
                {usdFormat(alerts.heygenWallet.remainingBalanceUsd)}
              </div>
              <div className="sa-metric-card-note">
                Threshold {usdFormat(alerts.heygenWallet.thresholdUsd)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stat cards */}
      <div className="admin-stats-grid" style={{ marginTop: 16 }}>
        {stats.map((stat, i) => (
          <div key={i} className="admin-stat-card">
            <div className="admin-stat-top">
              <div className={`admin-stat-icon ${stat.colorClass}`}>{stat.icon}</div>
            </div>
            <div className="admin-stat-info">
              <h3>{loading ? '…' : stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
        {/* Top features */}
        <section className="admin-card-section">
          <h2 style={{ margin: '0 0 14px', fontSize: '0.95rem' }}>Top usage by feature (30d)</h2>
          {loading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading…</p>
          ) : usageReport?.byFeature?.length ? (
            <div className="sa-tx-feed">
              {usageReport.byFeature.slice(0, 6).map((row) => (
                <div key={row.feature} className="sa-tx-row">
                  <div className="sa-tx-body">
                    <div className="sa-tx-top"><span className="sa-tx-type">{row.label || row.feature}</span></div>
                  </div>
                  <span className="sa-tx-amount sa-amount--negative">{formatAc(row.totalUsageAc)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No usage in the last 30 days.</p>
          )}
        </section>

        {/* Recent platform actions */}
        <section className="admin-card-section">
          <h2 style={{ margin: '0 0 14px', fontSize: '0.95rem' }}>Recent platform actions</h2>
          {loading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading…</p>
          ) : recentActions.length ? (
            <div className="sa-tx-feed">
              {recentActions.map((tx) => {
                const isGrant = tx.type === 'platform_grant'
                const target = tx.scope === 'workspace'
                  ? (tx.workspace?.name || 'Workspace')
                  : (tx.user?.email || 'User')
                return (
                  <div key={tx.id} className="sa-tx-row">
                    <div className="sa-tx-body">
                      <div className="sa-tx-top">
                        <span className="sa-tx-type" style={{ color: isGrant ? '#22c55e' : '#ef4444' }}>
                          {isGrant ? 'Grant' : 'Revoke'}
                        </span>
                        <span className="sa-tx-ref">{target}</span>
                      </div>
                      <div className="sa-tx-bottom">
                        <span className="sa-tx-date">{formatDate(tx.createdAt)}</span>
                      </div>
                    </div>
                    <span className={`sa-tx-amount ${isGrant ? 'sa-amount--positive' : 'sa-amount--negative'}`}>
                      {isGrant ? '+' : ''}{formatAc(tx.amount)}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No recent platform grants or revokes.</p>
          )}
        </section>
      </div>
    </div>
  )
}

export default DashboardOverview
