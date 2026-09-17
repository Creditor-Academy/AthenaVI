import { useEffect, useMemo, useState } from 'react'
import {
  Users, Building2, Coins, HardDrive, AlertTriangle, Bell, Wallet, X,
  TrendingUp, TrendingDown, Activity, BarChart3, Gauge, Sparkles, ShieldCheck,
} from 'lucide-react'
import superadminService from '../../../services/superadminService'
import { defaultReportRange, formatAc, formatDate } from './superadmin/superadminUtils'
import AreaTrendChart from './charts/AreaTrendChart'
import RadialFanGauge from './charts/RadialFanGauge'
import RankedBarList from './charts/RankedBarList'
import { AdminOverviewSkeleton } from './superadmin/skeletons/AdminSkeletons'
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

const VISIBLE_FEED_COUNT = 5

function ActionRow({ tx }) {
  const isGrant = tx.type === 'platform_grant'
  const target = tx.scope === 'workspace'
    ? (tx.workspace?.name || 'Workspace')
    : (tx.user?.email || 'User')
  return (
    <div className="sa-tx-row">
      <div className="sa-tx-body">
        <div className="sa-tx-top">
          <span className="sa-tx-ref" style={{ color: 'var(--text-main)', fontWeight: 600 }}>{target}</span>
          <span className="sa-tx-type" style={{ color: isGrant ? 'var(--success-green)' : 'var(--delete-red)', fontSize: '0.75rem', fontWeight: 700 }}>
            {isGrant ? 'Grant' : 'Revoke'}
          </span>
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
}

function ActionsModal({ loading, actions, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="dash-modal-overlay" onClick={onClose}>
      <div className="dash-modal-content" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Recent platform actions">
        <div className="dash-modal-header">
          <h3>Recent platform actions</h3>
          <button type="button" className="dash-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="dash-modal-body">
          {loading ? (
            <p className="dash-loading-text" style={{ padding: '24px 20px', textAlign: 'center' }}>Loading…</p>
          ) : actions.length ? (
            <div className="dash-feed-list">
              {actions.map((tx) => <ActionRow key={tx.id} tx={tx} />)}
            </div>
          ) : (
            <p className="dash-loading-text" style={{ padding: '24px 20px', textAlign: 'center' }}>No platform actions found.</p>
          )}
        </div>
      </div>
    </div>
  )
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
  const [feedTotal, setFeedTotal] = useState(0)
  const [feedModalOpen, setFeedModalOpen] = useState(false)
  const [feedModalActions, setFeedModalActions] = useState(null)
  const [feedModalLoading, setFeedModalLoading] = useState(false)

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
        const actions = actionsData.transactions || []
        setRecentActions(actions)
        setFeedTotal(actionsData.pagination?.total ?? actions.length)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load dashboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const openFeedModal = async () => {
    setFeedModalOpen(true)
    if (feedModalActions) return
    setFeedModalLoading(true)
    try {
      const data = await superadminService.getPlatformActionsReport({
        page: 1,
        limit: Math.min(Math.max(feedTotal, VISIBLE_FEED_COUNT), 50),
      })
      setFeedModalActions(data.transactions || [])
    } catch {
      setFeedModalActions([])
    } finally {
      setFeedModalLoading(false)
    }
  }

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

  if (loading && !usageReport) {
    return <AdminOverviewSkeleton />
  }

  return (
    <div className="sa-panel sa-panel--flow">
      {/* ── Welcome Hero Banner (Matching User Dashboard Home Hero Style) ── */}
      <div className="admin-welcome-banner hero-redesign">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Platform Dashboard</h1>
            <p>Live platform health — alerts, credit usage, and admin activity from the superadmin API.</p>
            <div className="hero-chips">
              <span className="hero-chip">
                <Activity size={15} /> Real-time Telemetry
              </span>
              <span className="hero-chip">
                <ShieldCheck size={15} /> Superadmin Mode Active
              </span>
            </div>
          </div>

          {/* Right-side quick alert & wallet status glass cards */}
          <div className="admin-hero-cards">
            {alerts && alerts.unreadPlatformCount > 0 && (
              <div className="admin-hero-glass-card">
                <div className="admin-hero-glass-icon admin-hero-glass-icon--alert">
                  <Bell size={18} />
                </div>
                <div className="admin-hero-glass-info">
                  <span className="admin-hero-glass-label">Alerts</span>
                  <strong className="admin-hero-glass-val">
                    {alerts.unreadPlatformCount} unread platform alert{alerts.unreadPlatformCount === 1 ? '' : 's'}
                  </strong>
                </div>
              </div>
            )}

            {alerts && alerts.heygenWallet && (
              <div className={`admin-hero-glass-card${alerts.heygenWallet.isLow ? ' admin-hero-glass-card--warn' : ''}`}>
                <div className="admin-hero-glass-icon admin-hero-glass-icon--wallet">
                  {alerts.heygenWallet.isLow ? <AlertTriangle size={18} /> : <Wallet size={18} />}
                </div>
                <div className="admin-hero-glass-info">
                  <span className="admin-hero-glass-label">HeyGen Wallet</span>
                  <strong className="admin-hero-glass-val">
                    {usdFormat(alerts.heygenWallet.remainingBalanceUsd)}
                  </strong>
                  <span className="admin-hero-glass-sub">
                    threshold {usdFormat(alerts.heygenWallet.thresholdUsd)}
                  </span>
                </div>
              </div>
            )}

            {(!alerts || (alerts.unreadPlatformCount === 0 && !alerts.heygenWallet)) && (
              <div className="admin-hero-glass-card">
                <div className="admin-hero-glass-icon" style={{ background: 'rgba(16, 185, 129, 0.25)', color: '#34d399' }}>
                  <ShieldCheck size={18} />
                </div>
                <div className="admin-hero-glass-info">
                  <span className="admin-hero-glass-label">System Health</span>
                  <strong className="admin-hero-glass-val">All Systems Nominal</strong>
                  <span className="admin-hero-glass-sub">Zero critical incidents</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Glowing Circular Decorative Overlays */}
        <div className="hero-decoration hero-circle-1" aria-hidden="true" />
        <div className="hero-decoration hero-circle-2" aria-hidden="true" />
        <div className="hero-decoration hero-circle-3" aria-hidden="true" />
      </div>

      {error && (
        <div className="sa-alert sa-alert--error">
          <AlertTriangle size={13} style={{ display: 'inline', marginRight: 6 }} />
          {error}
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
              {feedTotal > VISIBLE_FEED_COUNT && (
                <button type="button" className="dash-more-btn" onClick={openFeedModal}>
                  +{feedTotal - VISIBLE_FEED_COUNT} more
                </button>
              )}
            </div>
            {loading ? (
              <p className="dash-loading-text">Loading…</p>
            ) : recentActions.length ? (
              <div className="dash-feed-list">
                {recentActions.slice(0, VISIBLE_FEED_COUNT).map((tx) => (
                  <ActionRow key={tx.id} tx={tx} />
                ))}
              </div>
            ) : (
              <p className="dash-loading-text">No recent platform grants or revokes.</p>
            )}
          </section>
        </div>
      </div>

      {feedModalOpen && (
        <ActionsModal
          loading={feedModalLoading}
          actions={feedModalActions || []}
          onClose={() => setFeedModalOpen(false)}
        />
      )}
    </div>
  )
}

export default DashboardOverview
