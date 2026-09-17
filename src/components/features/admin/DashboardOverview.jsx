import { useEffect, useMemo, useState } from 'react'
import {
  Users, Building2, Coins, HardDrive, AlertTriangle, Bell,
  TrendingUp, TrendingDown, Activity, BarChart3, Gauge, Sparkles,
} from 'lucide-react'
import superadminService from '../../../services/superadminService'
import { defaultReportRange, formatAc, formatDate } from './superadmin/superadminUtils'
import AreaTrendChart from './charts/AreaTrendChart'
import RadialFanGauge from './charts/RadialFanGauge'
import RankedBarList from './charts/RankedBarList'
import '../../../pages/AdminPortal/styles/AdminBase.css'
import '../../../pages/AdminPortal/styles/AdminOverview.css'
import '../../../pages/AdminPortal/styles/SuperadminBase.css'

function usdFormat(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function shortDay(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
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
          superadminService.getUsageReport({ from: range.from, to: range.to, topLimit: 8 }),
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

  // ── Derived: usage trend, growth vs the prior half of the window, feature ranking ──
  const trend = useMemo(() => {
    const days = usageReport?.byDay
    if (!days?.length) return null

    const mid = Math.floor(days.length / 2)
    const firstHalf = days.slice(0, mid || 1)
    const secondHalf = days.slice(mid || 1)
    const firstSum = firstHalf.reduce((s, d) => s + (Number(d.totalUsageAc) || 0), 0)
    const secondSum = secondHalf.reduce((s, d) => s + (Number(d.totalUsageAc) || 0), 0)

    let growthPercent = null
    if (firstSum > 0) growthPercent = ((secondSum - firstSum) / firstSum) * 100
    else if (secondSum > 0) growthPercent = 100

    const avgDaily = usageReport.totalUsageAc / days.length

    return {
      areaData: days.map((d) => ({ label: d.date, value: Number(d.totalUsageAc) || 0, meta: d.transactionCount })),
      growthPercent,
      avgDaily,
      spanDays: days.length,
    }
  }, [usageReport])

  const rankedFeatures = useMemo(() => {
    const rows = usageReport?.byFeature
    if (!rows?.length) return []
    const top = rows.slice(0, 6).map((row) => ({
      key: row.feature,
      label: row.label || row.feature,
      value: Number(row.totalUsageAc) || 0,
      meta: row.transactionCount,
    }))
    if (rows.length > 6) {
      const rest = rows.slice(6)
      const otherValue = rest.reduce((s, r) => s + (Number(r.totalUsageAc) || 0), 0)
      const otherCount = rest.reduce((s, r) => s + (Number(r.transactionCount) || 0), 0)
      if (otherValue > 0) top.push({ key: 'other', label: 'Other', value: otherValue, meta: otherCount })
    }
    return top
  }, [usageReport])

  const stats = [
    {
      id: 'users',
      label: 'Platform users',
      value: userTotal != null ? new Intl.NumberFormat().format(userTotal) : '—',
      note: 'Registered accounts across the platform',
      icon: <Users size={20} />,
      hero: true,
    },
    {
      id: 'workspaces',
      label: 'Team workspaces',
      value: workspaceTotal != null ? new Intl.NumberFormat().format(workspaceTotal) : '—',
      note: 'Active team workspaces',
      icon: <Building2 size={20} />,
    },
    {
      id: 'usage',
      label: 'Usage (30 days)',
      value: usageReport ? formatAc(usageReport.totalUsageAc ?? 0) : '—',
      note: trend?.spanDays ? `Avg ${formatAc(Math.round(trend.avgDaily))} / day` : 'Credits consumed platform-wide',
      icon: <Coins size={20} />,
      trend: trend?.growthPercent,
    },
    {
      id: 'storage',
      label: 'Pending storage requests',
      value: pendingStorage != null ? String(pendingStorage) : '—',
      note: 'Awaiting superadmin review',
      icon: <HardDrive size={20} />,
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

      {error && (
        <div className="sa-alert sa-alert--error">
          <AlertTriangle size={13} style={{ display: 'inline', marginRight: 6 }} />
          {error}
        </div>
      )}

      {alerts && (alerts.unreadPlatformCount > 0 || alerts.heygenWallet) && (
        <div className="dash-status-strip">
          {alerts.unreadPlatformCount > 0 && (
            <span className="dash-status-chip">
              <Bell size={14} />
              {alerts.unreadPlatformCount} unread platform alert{alerts.unreadPlatformCount === 1 ? '' : 's'}
            </span>
          )}
          {alerts.heygenWallet && (
            <span className={`dash-status-chip${alerts.heygenWallet.isLow ? ' dash-status-chip--warn' : ''}`}>
              {alerts.heygenWallet.isLow && <AlertTriangle size={14} />}
              HeyGen wallet: {usdFormat(alerts.heygenWallet.remainingBalanceUsd)}
              <span className="dash-status-chip-note">threshold {usdFormat(alerts.heygenWallet.thresholdUsd)}</span>
            </span>
          )}
        </div>
      )}

      <div className="admin-dashboard-container">
        <div className="admin-stats-grid dash-stats-grid">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className={`admin-stat-card dash-stat-card${stat.hero ? ' dash-stat-card--hero' : ''}`}
            >
              <div className="admin-stat-top">
                <div className="admin-stat-icon dash-stat-icon">{stat.icon}</div>
                {stat.trend != null && (
                  <span className={`dash-stat-trend ${stat.trend >= 0 ? 'is-up' : 'is-down'}`}>
                    {stat.trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(Math.round(stat.trend))}%
                  </span>
                )}
              </div>
              <div className="admin-stat-info">
                <h3>{loading ? '…' : stat.value}</h3>
                <p>{stat.label}</p>
                <span className="dash-stat-note">{loading ? '' : stat.note}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="dash-charts-row">
          <section className="admin-card-section dash-chart-card">
            <div className="dash-card-header">
              <h2><Activity size={16} /> Usage trend</h2>
              <span className="dash-card-badge">Last {trend?.spanDays || 30} days</span>
            </div>
            {loading ? (
              <p className="dash-loading-text">Loading…</p>
            ) : trend?.areaData?.length ? (
              <AreaTrendChart
                data={trend.areaData}
                formatValue={(v) => formatAc(v)}
                formatLabel={(l) => shortDay(l)}
                metaLabel={(count) => `${new Intl.NumberFormat().format(count)} events`}
              />
            ) : (
              <p className="dash-loading-text">No usage recorded in the last 30 days.</p>
            )}
          </section>

          <section className="admin-card-section dash-gauge-card">
            <div className="dash-card-header">
              <h2><Gauge size={16} /> Usage growth</h2>
            </div>
            {loading ? (
              <p className="dash-loading-text">Loading…</p>
            ) : trend?.growthPercent != null ? (
              <>
                <RadialFanGauge
                  percent={Math.min(100, Math.abs(trend.growthPercent))}
                  label={`${trend.growthPercent >= 0 ? '+' : '−'}${Math.abs(Math.round(trend.growthPercent))}%`}
                  sublabel={trend.growthPercent >= 0 ? 'Trending up' : 'Trending down'}
                />
                <div className="dash-gauge-footer">
                  <div>
                    <span className="dash-gauge-footer-value">{formatAc(usageReport?.totalUsageAc ?? 0)}</span>
                    <span className="dash-gauge-footer-label">Total credits</span>
                  </div>
                  <div>
                    <span className="dash-gauge-footer-value">{formatAc(Math.round(trend.avgDaily || 0))}</span>
                    <span className="dash-gauge-footer-label">Daily average</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="dash-empty-inline">
                <Sparkles size={22} />
                <p>Not enough history yet to compute a growth trend.</p>
              </div>
            )}
          </section>
        </div>

        <div className="dash-charts-row">
          <section className="admin-card-section dash-ranked-card">
            <div className="dash-card-header">
              <h2><BarChart3 size={16} /> Top usage by feature</h2>
              <span className="dash-card-badge">30d</span>
            </div>
            {loading ? (
              <p className="dash-loading-text">Loading…</p>
            ) : rankedFeatures.length ? (
              <RankedBarList
                rows={rankedFeatures}
                formatValue={(v) => formatAc(v)}
                formatMeta={(count) => `${new Intl.NumberFormat().format(count)} ev`}
              />
            ) : (
              <p className="dash-loading-text">No usage in the last 30 days.</p>
            )}
          </section>

          <section className="admin-card-section dash-feed-card">
            <div className="dash-card-header">
              <h2><Bell size={16} /> Recent platform actions</h2>
            </div>
            {loading ? (
              <p className="dash-loading-text">Loading…</p>
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
                          <span className="sa-tx-type" style={{ color: isGrant ? 'var(--success-green)' : 'var(--delete-red)' }}>
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
              <p className="dash-loading-text">No recent platform grants or revokes.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview
