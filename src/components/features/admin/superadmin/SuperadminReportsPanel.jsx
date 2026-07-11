import { useState, useEffect } from 'react'
import { BarChart3, Users, Building2, Calendar, Zap, TrendingUp, Activity } from 'lucide-react'
import superadminService from '../../../../services/superadminService'
import { defaultReportRange, formatAc, isValidUuid } from './superadminUtils'
import '../../../../pages/AdminPortal/SuperadminPortal.css'

// ── Helpers ──────────────────────────────────────────────────────────────────

function pct(value, max) {
  if (!max || max === 0) return 0
  return Math.min(100, Math.round((Number(value) / Number(max)) * 100))
}

function shortDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function initials(label) {
  return String(label)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || '?'
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SummaryCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="sa-metric-card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: 12, right: 12,
        width: 36, height: 36, borderRadius: 10,
        background: `color-mix(in srgb, ${color} 14%, var(--bg-card))`,
        border: `1px solid color-mix(in srgb, ${color} 28%, var(--border-color))`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color,
      }}>
        <Icon size={16} />
      </div>
      <div className="sa-metric-card-label" style={{ paddingRight: 48 }}>{label}</div>
      <div className="sa-metric-card-value" style={{ color }}>{value}</div>
      {sub && <div className="sa-metric-card-note">{sub}</div>}
    </div>
  )
}

// ── Layout 1: Feature chart — horizontal bar chart, label left, filled bar, value right ──
function FeatureBarChart({ rows, maxValue }) {
  if (!rows?.length) return null
  return (
    <div style={{ padding: '8px 0' }}>
      {rows.map((row, i) => {
        const w = pct(row.totalUsageAc, maxValue)
        const opacity = Math.max(0.45, 1 - i * 0.07)
        return (
          <div key={row.feature} style={{ padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Feature name */}
            <span style={{
              width: 110, flexShrink: 0,
              fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {row.label || row.feature}
            </span>
            {/* Bar track */}
            <div style={{
              flex: 1, height: 20, borderRadius: 4,
              background: 'color-mix(in srgb, #a78bfa 8%, var(--border-color))',
              overflow: 'hidden', position: 'relative',
            }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: `${w}%`,
                borderRadius: 4,
                background: `linear-gradient(90deg, #a78bfa, color-mix(in srgb, #a78bfa 65%, #6366f1))`,
                opacity,
                transition: 'width 0.5s cubic-bezier(.4,0,.2,1)',
              }} />
              {/* Inline count label inside bar */}
              {w > 18 && (
                <span style={{
                  position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                  fontSize: '0.625rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)',
                  pointerEvents: 'none',
                }}>
                  {new Intl.NumberFormat().format(row.transactionCount)} ev
                </span>
              )}
            </div>
            {/* Value */}
            <span style={{
              width: 80, flexShrink: 0, textAlign: 'right',
              fontSize: '0.8125rem', fontWeight: 700, color: '#a78bfa',
              letterSpacing: '-0.02em',
            }}>
              {formatAc(row.totalUsageAc)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── Layout 2: Daily usage — column sparkbar chart + striped table ──
function DailyChart({ days }) {
  if (!days?.length) return null
  const maxVal = Math.max(...days.map((d) => d.totalUsageAc), 1)

  return (
    <div>
      {/* Sparkbar chart */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 72 }}>
          {days.map((day) => {
            const h = Math.max(4, pct(day.totalUsageAc, maxVal))
            return (
              <div
                key={day.date}
                title={`${shortDate(day.date)}: ${formatAc(day.totalUsageAc)} · ${day.transactionCount} events`}
                style={{
                  flex: 1, height: `${h}%`, minWidth: 0,
                  borderRadius: '3px 3px 0 0',
                  background: 'linear-gradient(180deg, #34d399 0%, color-mix(in srgb, #34d399 45%, transparent) 100%)',
                  opacity: 0.75,
                  cursor: 'default',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.75' }}
              />
            )
          })}
        </div>
        {/* x-axis labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, paddingBottom: 10, borderBottom: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{shortDate(days[0]?.date)}</span>
          <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{shortDate(days[days.length - 1]?.date)}</span>
        </div>
      </div>

      {/* Striped day table */}
      <div style={{ maxHeight: 220, overflowY: 'auto' }}>
        {[...days].reverse().map((day, i) => (
          <div key={day.date} style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto auto',
            alignItems: 'center',
            gap: 12,
            padding: '7px 16px',
            background: i % 2 === 0 ? 'transparent' : 'color-mix(in srgb, var(--text-muted) 3%, transparent)',
            fontSize: '0.8125rem',
          }}>
            <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{shortDate(day.date)}</span>
            <span style={{
              fontSize: '0.6875rem', color: 'var(--text-muted)',
              background: 'color-mix(in srgb, var(--text-muted) 10%, transparent)',
              borderRadius: 4, padding: '2px 6px',
            }}>
              {new Intl.NumberFormat().format(day.transactionCount)} ev
            </span>
            <span style={{ color: '#34d399', fontWeight: 600, minWidth: 72, textAlign: 'right' }}>
              {formatAc(day.totalUsageAc)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Layout 3: Top users — card grid, big avatar + credit number ──
const RANK_MEDAL = ['🥇', '🥈', '🥉']

function UserGrid({ users, maxValue }) {
  if (!users?.length) return null
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
      gap: 10,
      padding: 14,
    }}>
      {users.map((u, i) => {
        const label = u.name || u.email || u.userId
        const ini = initials(label)
        const w = pct(u.totalUsageAc, maxValue)
        return (
          <div key={u.userId} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '14px 10px 12px',
            borderRadius: 10,
            border: '1px solid var(--border-color)',
            background: i < 3
              ? 'color-mix(in srgb, var(--primary) 5%, var(--bg-card))'
              : 'var(--bg-card)',
            position: 'relative',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--primary) 40%, var(--border-color))'
              e.currentTarget.style.boxShadow = '0 2px 12px color-mix(in srgb, var(--primary) 10%, transparent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {/* Medal for top 3 */}
            {i < 3 && (
              <span style={{ position: 'absolute', top: 6, right: 8, fontSize: '0.8rem' }}>
                {RANK_MEDAL[i]}
              </span>
            )}
            {/* Avatar */}
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 60%, #6366f1))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.875rem', fontWeight: 700, color: '#fff',
              marginBottom: 8, flexShrink: 0,
            }}>
              {ini}
            </div>
            {/* Name */}
            <span style={{
              fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)',
              textAlign: 'center', lineHeight: 1.3,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              maxWidth: '100%',
            }}>
              {label}
            </span>
            {/* Credit value */}
            <span style={{
              fontSize: '1rem', fontWeight: 800, color: 'var(--primary)',
              letterSpacing: '-0.03em', marginTop: 4,
            }}>
              {formatAc(u.totalUsageAc)}
            </span>
            {/* Events pill */}
            <span style={{
              marginTop: 4,
              fontSize: '0.625rem', color: 'var(--text-muted)',
              background: 'color-mix(in srgb, var(--text-muted) 10%, transparent)',
              borderRadius: 4, padding: '2px 6px',
            }}>
              {new Intl.NumberFormat().format(u.transactionCount)} events
            </span>
            {/* Mini bar at bottom */}
            <div style={{
              marginTop: 8, width: '100%', height: 3, borderRadius: 99,
              background: 'color-mix(in srgb, var(--primary) 12%, var(--border-color))',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: `${w}%`, borderRadius: 99,
                background: 'var(--primary)',
                transition: 'width 0.5s cubic-bezier(.4,0,.2,1)',
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Layout 4: Top workspaces — compact numbered list with share percentage pill ──
function WorkspaceList({ workspaces, maxValue, total }) {
  if (!workspaces?.length) return null
  const totalAc = total || workspaces.reduce((s, w) => s + Number(w.totalUsageAc), 0) || 1

  return (
    <div>
      {workspaces.map((w, i) => {
        const share = Math.round((Number(w.totalUsageAc) / totalAc) * 100)
        const rs = i === 0
          ? { color: '#f59e0b', bg: 'color-mix(in srgb, #f59e0b 15%, var(--bg-card))' }
          : i === 1
            ? { color: '#94a3b8', bg: 'color-mix(in srgb, #94a3b8 12%, var(--bg-card))' }
            : i === 2
              ? { color: '#cd7c46', bg: 'color-mix(in srgb, #cd7c46 12%, var(--bg-card))' }
              : { color: 'var(--text-muted)', bg: 'color-mix(in srgb, var(--text-muted) 7%, var(--bg-card))' }

        return (
          <div key={w.workspaceId} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 16px',
            borderBottom: '1px solid var(--border-color)',
          }}>
            {/* Rank number */}
            <span style={{
              width: 26, height: 26, borderRadius: 8, flexShrink: 0,
              background: rs.bg, color: rs.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.6875rem', fontWeight: 800,
              border: `1px solid color-mix(in srgb, ${rs.color} 25%, transparent)`,
            }}>
              {i + 1}
            </span>

            {/* Name + events */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{
                display: 'block',
                fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {w.name || w.workspaceId}
              </span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                {new Intl.NumberFormat().format(w.transactionCount)} events
              </span>
            </div>

            {/* Share % badge */}
            <span style={{
              flexShrink: 0,
              fontSize: '0.6875rem', fontWeight: 700,
              color: '#f59e0b',
              background: 'color-mix(in srgb, #f59e0b 12%, var(--bg-card))',
              border: '1px solid color-mix(in srgb, #f59e0b 22%, transparent)',
              borderRadius: 6, padding: '2px 7px',
            }}>
              {share}%
            </span>

            {/* Credit value */}
            <span style={{
              flexShrink: 0, minWidth: 78, textAlign: 'right',
              fontSize: '0.875rem', fontWeight: 700,
              color: '#f59e0b', letterSpacing: '-0.02em',
            }}>
              {formatAc(w.totalUsageAc)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────

function SuperadminReportsPanel() {
  const initial = defaultReportRange()
  const [from, setFrom] = useState(initial.from)
  const [to, setTo] = useState(initial.to)
  const [userId, setUserId] = useState('')
  const [workspaceId, setWorkspaceId] = useState('')
  const [topLimit, setTopLimit] = useState(10)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [report, setReport] = useState(null)
  const [usageLoading, setUsageLoading] = useState(false)
  const [usageError, setUsageError] = useState('')

  const runUsageReport = async (e) => {
    e?.preventDefault()
    setUsageError('')
    setUsageLoading(true)
    try {
      if (userId.trim() && !isValidUuid(userId.trim())) throw new Error('User ID must be a valid UUID.')
      if (workspaceId.trim() && !isValidUuid(workspaceId.trim())) throw new Error('Workspace ID must be a valid UUID.')
      const data = await superadminService.getUsageReport({
        from: from || undefined,
        to: to || undefined,
        userId: userId.trim() || undefined,
        workspaceId: workspaceId.trim() || undefined,
        topLimit,
      })
      setReport(data.report || data)
    } catch (err) {
      setReport(null)
      setUsageError(err.message || 'Failed to load report')
    } finally {
      setUsageLoading(false)
    }
  }

  useEffect(() => {
    runUsageReport()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const maxFeatureAc = report?.byFeature?.[0]?.totalUsageAc ?? 1
  const maxUserAc = report?.topUsers?.[0]?.totalUsageAc ?? 1
  const maxWsAc = report?.topWorkspaces?.[0]?.totalUsageAc ?? 1

  return (
    <div className="sa-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>

      {/* Header */}
      <div className="sa-panel-header" style={{ flexShrink: 0 }}>
        <div>
          <h2 className="sa-panel-title">Usage reports</h2>
          <p className="sa-panel-desc">Credit usage analytics across features, users, and workspaces.</p>
        </div>
      </div>

      <div className="sa-scroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>

        {/* Filter form */}
        <form className="sa-card" onSubmit={runUsageReport} style={{ flexShrink: 0 }}>
          <div className="sa-card-body">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
              <div className="sa-field">
                <label htmlFor="report-from">From</label>
                <input id="report-from" className="sa-input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div className="sa-field">
                <label htmlFor="report-to">To</label>
                <input id="report-to" className="sa-input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
              <button type="submit" className="sa-btn sa-btn--primary" disabled={usageLoading} style={{ alignSelf: 'flex-end' }}>
                {usageLoading ? 'Loading…' : 'Run report'}
              </button>
              <button
                type="button"
                className="sa-btn sa-btn--ghost"
                onClick={() => setShowAdvanced(!showAdvanced)}
                style={{ alignSelf: 'flex-end', fontSize: '0.8rem' }}
              >
                {showAdvanced ? 'Hide filters' : 'More filters'}
              </button>
            </div>

            {showAdvanced && (
              <div style={{
                display: 'flex', gap: 12, flexWrap: 'wrap',
                marginTop: 14, paddingTop: 14,
                borderTop: '1px solid var(--border-color)',
              }}>
                <div className="sa-field">
                  <label htmlFor="report-top">Top N</label>
                  <input
                    id="report-top" className="sa-input" type="number"
                    min="1" max="25" value={topLimit}
                    onChange={(e) => setTopLimit(Number(e.target.value) || 10)}
                    style={{ width: 80 }}
                  />
                </div>
                <div className="sa-field">
                  <label htmlFor="report-user">User ID</label>
                  <input id="report-user" className="sa-input sa-input--wide" type="text" placeholder="UUID (optional)" value={userId} onChange={(e) => setUserId(e.target.value)} />
                </div>
                <div className="sa-field">
                  <label htmlFor="report-ws">Workspace ID</label>
                  <input id="report-ws" className="sa-input sa-input--wide" type="text" placeholder="UUID (optional)" value={workspaceId} onChange={(e) => setWorkspaceId(e.target.value)} />
                </div>
              </div>
            )}

            {usageError && <div className="sa-alert sa-alert--error" style={{ marginTop: 12, marginBottom: 0 }}>{usageError}</div>}
          </div>
        </form>

        {/* Empty state */}
        {!report && !usageLoading && !usageError && (
          <div className="sa-empty" style={{ marginTop: 24 }}>
            <BarChart3 className="sa-empty-icon" size={40} />
            <p style={{ marginTop: 8 }}>Set a date range and run a report to see usage metrics.</p>
          </div>
        )}

        {/* Loading */}
        {usageLoading && (
          <div className="sa-loading" style={{ marginTop: 24 }}>
            <span className="sa-spinner" /> Generating report…
          </div>
        )}

        {/* Report results */}
        {report && !usageLoading && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Summary row */}
            <div className="sa-metrics">
              <SummaryCard
                icon={Activity}
                label="Total transactions"
                value={new Intl.NumberFormat().format(report.transactionCount ?? 0)}
                sub="credit events in range"
                color="var(--primary)"
              />
              <SummaryCard
                icon={Zap}
                label="Total credits used"
                value={formatAc(report.totalUsageAc ?? 0)}
                sub="across all features"
                color="#a78bfa"
              />
              <SummaryCard
                icon={TrendingUp}
                label="Est. HeyGen cost"
                value={`$${Number(report.estimatedHeygenUsd ?? 0).toFixed(2)}`}
                sub="PAYG / Enterprise rate"
                color="#34d399"
              />
            </div>

            {/* Bottom two-col layout: feature + daily chart side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

              {/* Usage by feature — horizontal bar chart */}
              {report.byFeature?.length > 0 && (
                <div className="sa-card" style={{ minHeight: 0 }}>
                  <div className="sa-card-header">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <Zap size={14} style={{ color: '#a78bfa', flexShrink: 0 }} />
                      Usage by feature
                    </h3>
                    <span className="sa-card-header-count">{report.byFeature.length}</span>
                  </div>
                  <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                    <FeatureBarChart rows={report.byFeature} maxValue={maxFeatureAc} />
                  </div>
                </div>
              )}

              {/* Daily usage — sparkbar + striped table */}
              {report.byDay?.length > 0 && (
                <div className="sa-card" style={{ minHeight: 0 }}>
                  <div className="sa-card-header">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <Calendar size={14} style={{ color: '#34d399', flexShrink: 0 }} />
                      Daily usage
                    </h3>
                    <span className="sa-card-header-count">{report.byDay.length} days</span>
                  </div>
                  <DailyChart days={report.byDay} />
                </div>
              )}
            </div>

            {/* Top users + top workspaces */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

              {/* Top users — avatar card grid */}
              {report.topUsers?.length > 0 && (
                <div className="sa-card" style={{ minHeight: 0 }}>
                  <div className="sa-card-header" style={{ borderBottom: '2px solid color-mix(in srgb, var(--primary) 25%, transparent)' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{
                        width: 26, height: 26, borderRadius: 8,
                        background: 'color-mix(in srgb, var(--primary) 14%, var(--bg-card))',
                        border: '1px solid color-mix(in srgb, var(--primary) 25%, var(--border-color))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Users size={13} style={{ color: 'var(--primary)' }} />
                      </span>
                      Top users
                    </h3>
                    <span className="sa-card-header-count">{report.topUsers.length}</span>
                  </div>
                  <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                    <UserGrid users={report.topUsers} maxValue={maxUserAc} />
                  </div>
                </div>
              )}

              {/* Top workspaces — ranked list with share % badge */}
              {report.topWorkspaces?.length > 0 && (
                <div className="sa-card" style={{ minHeight: 0 }}>
                  <div className="sa-card-header" style={{ borderBottom: '2px solid color-mix(in srgb, #f59e0b 25%, transparent)' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{
                        width: 26, height: 26, borderRadius: 8,
                        background: 'color-mix(in srgb, #f59e0b 14%, var(--bg-card))',
                        border: '1px solid color-mix(in srgb, #f59e0b 25%, var(--border-color))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Building2 size={13} style={{ color: '#f59e0b' }} />
                      </span>
                      Top workspaces
                    </h3>
                    <span className="sa-card-header-count">{report.topWorkspaces.length}</span>
                  </div>
                  <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                    <WorkspaceList
                      workspaces={report.topWorkspaces}
                      maxValue={maxWsAc}
                      total={report.totalUsageAc}
                    />
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

export default SuperadminReportsPanel
