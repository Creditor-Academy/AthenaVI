import { useState, useEffect, useMemo, useId } from 'react'
import {
  BarChart3, Users, Building2, Zap, TrendingUp, TrendingDown,
  Activity, Filter, RefreshCw, ChevronDown, ChevronUp, DollarSign, Layers,
} from 'lucide-react'
import superadminService from '../../../../services/superadminService'
import { defaultReportRange, formatAc, isValidUuid } from './superadminUtils'
import '../../../../pages/AdminPortal/styles/SuperadminBase.css'
import '../../../../pages/AdminPortal/styles/AdminReports.css'
import { SaSkeletonBlock } from './skeletons/AdminSkeletons'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shortDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// ─── Animated SVG area sparkline chart ───────────────────────────────────────

function AnimatedAreaChart({ data, formatValue, formatLabel, height = 210 }) {
  const id = useId()
  const gradId = `ag-${id}`
  const VW = 1000, VH = 300
  const PAD = { t: 20, r: 16, b: 32, l: 10 }

  const points = useMemo(() => {
    if (!data?.length) return []
    const vals = data.map(d => Number(d.value) || 0)
    const max = Math.max(...vals, 1)
    const min = 0
    const cW = VW - PAD.l - PAD.r
    const cH = VH - PAD.t - PAD.b
    return data.map((d, i) => ({
      x: PAD.l + (data.length === 1 ? cW / 2 : (i / (data.length - 1)) * cW),
      y: PAD.t + cH - ((Number(d.value) || 0) / (max - min)) * cH,
      label: d.label,
      value: d.value,
      meta: d.meta,
    }))
  }, [data])

  const [hoverIdx, setHoverIdx] = useState(null)

  if (!points.length) return <p className="sa-empty-text" style={{ padding: '24px 0', textAlign: 'center' }}>No daily data in range.</p>

  // Build smooth catmull-rom path
  function smooth(pts) {
    if (pts.length < 2) return `M ${pts[0]?.x} ${pts[0]?.y}`
    let d = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i]
      const p1 = pts[i]
      const p2 = pts[i + 1]
      const p3 = pts[i + 2] || p2
      const c1x = p1.x + (p2.x - p0.x) / 6
      const c1y = p1.y + (p2.y - p0.y) / 6
      const c2x = p2.x - (p3.x - p1.x) / 6
      const c2y = p2.y - (p3.y - p1.y) / 6
      d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
    }
    return d
  }

  const baseline = VH - PAD.b
  const linePath = smooth(points)
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`
  const hover = hoverIdx != null ? points[hoverIdx] : null
  const leftPct = hover ? (hover.x / VW) * 100 : 0

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const relX = ((e.clientX - rect.left) / rect.width) * VW
    let best = 0, bestDist = Infinity
    points.forEach((p, i) => { const d = Math.abs(p.x - relX); if (d < bestDist) { bestDist = d; best = i } })
    setHoverIdx(best)
  }

  return (
    <div className="rpt-chart-wrap" style={{ height }} onMouseMove={handleMove} onMouseLeave={() => setHoverIdx(null)}>
      <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none" className="rpt-chart-svg" aria-label="Daily usage trend">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.38" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f, i) => (
          <line key={i} x1={PAD.l} x2={VW - PAD.r} y1={PAD.t + (VH - PAD.t - PAD.b) * (1 - f)} y2={PAD.t + (VH - PAD.t - PAD.b) * (1 - f)} stroke="var(--border-color)" strokeWidth="1" opacity="0.6" vectorEffect="non-scaling-stroke" />
        ))}
        <path d={areaPath} fill={`url(#${gradId})`} className="rpt-area-path" />
        <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" className="rpt-line-path" />
        {hover && <line x1={hover.x} x2={hover.x} y1={PAD.t} y2={baseline} stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" vectorEffect="non-scaling-stroke" />}
        {hover && <circle cx={hover.x} cy={hover.y} r="10" fill="var(--bg-card)" />}
        {hover && <circle cx={hover.x} cy={hover.y} r="5" fill="var(--primary)" />}
      </svg>

      {hover && (
        <div className={`rpt-tooltip rpt-tooltip--${leftPct > 70 ? 'left' : leftPct < 15 ? 'right' : 'center'}`}
          style={{ left: `${leftPct}%`, top: `${(hover.y / VH) * 100}%` }}>
          <span className="rpt-tooltip-date">{formatLabel ? formatLabel(hover.label) : hover.label}</span>
          <span className="rpt-tooltip-val">{formatValue ? formatValue(hover.value) : hover.value}</span>
          {hover.meta != null && <span className="rpt-tooltip-meta">{new Intl.NumberFormat().format(hover.meta)} events</span>}
        </div>
      )}

      <div className="rpt-axis">
        <span>{formatLabel ? formatLabel(data[0].label) : data[0].label}</span>
        {data.length > 2 && <span>{formatLabel ? formatLabel(data[Math.floor((data.length - 1) / 2)].label) : ''}</span>}
        <span>{formatLabel ? formatLabel(data[data.length - 1].label) : data[data.length - 1].label}</span>
      </div>
    </div>
  )
}

// ─── Animated donut/ring chart for feature distribution ──────────────────────

const RING_COLORS = ['#2563eb', '#ea580c', '#0d9488', '#8b5cf6', '#ec4899', '#0284c7']

function AnimatedDonutChart({ rows }) {
  if (!rows?.length) return null
  const total = rows.reduce((s, r) => s + (Number(r.value) || 0), 0) || 1
  const R = 44, CX = 60, CY = 60, CIRC = 2 * Math.PI * R
  let offset = 0

  const slices = rows.map((r, i) => {
    const share = (Number(r.value) || 0) / total
    const dash = share * CIRC
    const seg = { dash, gap: CIRC - dash, offset, color: RING_COLORS[i % RING_COLORS.length], label: r.label, value: r.value, share }
    offset += dash
    return seg
  })

  return (
    <div className="rpt-donut-wrap">
      <svg viewBox="0 0 120 120" className="rpt-donut-svg" aria-label="Feature usage distribution">
        {slices.map((s, i) => (
          <circle key={i} cx={CX} cy={CY} r={R}
            fill="none"
            stroke={s.color}
            strokeWidth="14"
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={-s.offset + CIRC / 4}
            className="rpt-donut-seg"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <title>{s.label}: {formatAc(s.value)} ({Math.round(s.share * 100)}%)</title>
          </circle>
        ))}
        <circle cx={CX} cy={CY} r="30" fill="var(--bg-card)" />
        <text x={CX} y={CY - 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--text-main)">{rows.length}</text>
        <text x={CX} y={CY + 9} textAnchor="middle" fontSize="7" fill="var(--text-muted)">features</text>
      </svg>

      <ul className="rpt-donut-legend">
        {rows.map((r, i) => (
          <li key={r.key || r.label} className="rpt-legend-item">
            <span className="rpt-legend-dot" style={{ background: RING_COLORS[i % RING_COLORS.length] }} />
            <span className="rpt-legend-name" title={r.label}>{r.label}</span>
            <span className="rpt-legend-val">{formatAc(r.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Animated horizontal bar chart for users / workspaces ────────────────────

function AnimatedBarList({ rows, maxValue, showShare, totalAc, colors }) {
  if (!rows?.length) return null
  return (
    <ul className="rpt-barlist">
      {rows.map((r, i) => {
        const pct = Math.max(2, Math.round((Number(r.value || r.totalUsageAc) / (maxValue || 1)) * 100))
        const color = (colors || RING_COLORS)[i % (colors || RING_COLORS).length]
        const share = showShare && totalAc ? Math.round((Number(r.value || r.totalUsageAc) / totalAc) * 100) : null
        return (
          <li key={r.key || r.userId || r.workspaceId || i} className="rpt-barlist-row">
            <span className="rpt-barlist-rank" style={i < 3 ? { background: color, color: '#fff', borderColor: 'transparent' } : {}}>{i + 1}</span>
            <div className="rpt-barlist-main">
              <div className="rpt-barlist-nameline">
                <span className="rpt-barlist-name" title={r.label || r.name || r.email}>{r.label || r.name || r.email || '—'}</span>
                {share != null && <span className="rpt-share-chip">{share}%</span>}
              </div>
              <div className="rpt-barlist-track">
                <div className="rpt-barlist-fill" style={{ width: `${pct}%`, background: color, animationDelay: `${i * 0.06}s` }} />
              </div>
            </div>
            <div className="rpt-barlist-right">
              <span className="rpt-barlist-credits">{formatAc(r.value || r.totalUsageAc)}</span>
              <span className="rpt-barlist-events">{new Intl.NumberFormat().format(r.meta || r.transactionCount)} ev</span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

function FilterBar({ from, to, setFrom, setTo, userId, setUserId,
  workspaceId, setWorkspaceId, topLimit, setTopLimit, onSubmit, loading }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rpt-filter-bar">
      <form onSubmit={onSubmit}>

        {/* ── Header row: label left, buttons right ── */}
        <div className="rpt-filter-header">
          <div className="rpt-filter-header-text">
            <span className="rpt-filter-heading"><BarChart3 size={14} /> Report Parameters</span>
            <span className="rpt-filter-subtext">Select a date range and run the usage report</span>
          </div>
          <div className="rpt-filter-actions">
            <button type="submit" className="sa-btn sa-btn--primary rpt-run-btn" disabled={loading}>
              {loading
                ? <><RefreshCw size={14} className="rpt-spin" /> Running…</>
                : <><BarChart3 size={14} /> Run Report</>}
            </button>
            <button type="button"
              className={`sa-btn ${open ? 'sa-btn--ghost rpt-filters-btn--active' : 'sa-btn--ghost'} rpt-filters-btn`}
              onClick={() => setOpen(p => !p)}>
              <Filter size={13} />
              {open ? 'Hide filters' : 'Filters'}
              {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
        </div>

        {/* ── Date range inputs ── */}
        <div className="rpt-date-row">
          <div className="rpt-date-group">
            <label htmlFor="rpt-from" className="rpt-field-label">From</label>
            <input id="rpt-from" className="sa-input rpt-date-input" type="date"
              value={from} onChange={e => setFrom(e.target.value)} />
          </div>

          <div className="rpt-date-sep" aria-hidden="true">→</div>

          <div className="rpt-date-group">
            <label htmlFor="rpt-to" className="rpt-field-label">To</label>
            <input id="rpt-to" className="sa-input rpt-date-input" type="date"
              value={to} onChange={e => setTo(e.target.value)} />
          </div>
        </div>

        {/* ── Advanced filters (collapsed) ── */}
        {open && (
          <div className="rpt-advanced-row">
            <div className="rpt-adv-field">
              <label htmlFor="rpt-top" className="rpt-field-label">Top N</label>
              <input id="rpt-top" className="sa-input" type="number"
                min="1" max="25" value={topLimit}
                onChange={e => setTopLimit(Number(e.target.value) || 10)}
                style={{ width: 80 }} />
            </div>
            <div className="rpt-adv-field rpt-adv-field--flex">
              <label htmlFor="rpt-user" className="rpt-field-label">User ID (UUID)</label>
              <input id="rpt-user" className="sa-input" type="text"
                placeholder="Optional — filter to a single user"
                value={userId} onChange={e => setUserId(e.target.value)} />
            </div>
            <div className="rpt-adv-field rpt-adv-field--flex">
              <label htmlFor="rpt-ws" className="rpt-field-label">Workspace ID (UUID)</label>
              <input id="rpt-ws" className="sa-input" type="text"
                placeholder="Optional — filter to a single workspace"
                value={workspaceId} onChange={e => setWorkspaceId(e.target.value)} />
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function ReportsSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="sa-kpi-grid">
        {[0,1,2,3].map(i => (
          <div key={i} style={{ borderRadius: 16, padding: 18, background: 'color-mix(in srgb, var(--border-color) 50%, var(--bg-card))', minHeight: 108 }}>
            <SaSkeletonBlock width="55%" height={12} borderRadius={4} style={{ marginBottom: 14 }} />
            <SaSkeletonBlock width="70%" height={28} borderRadius={6} />
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
        <div className="sa-card" style={{ padding: 18, minHeight: 240 }}>
          <SaSkeletonBlock width={140} height={14} borderRadius={4} style={{ marginBottom: 18 }} />
          <SaSkeletonBlock width="100%" height={180} borderRadius={10} />
        </div>
        <div className="sa-card" style={{ padding: 18, minHeight: 240 }}>
          <SaSkeletonBlock width={110} height={14} borderRadius={4} style={{ marginBottom: 18 }} />
          <SaSkeletonBlock width={120} height={120} borderRadius={999} style={{ margin: '0 auto 16px' }} />
          {[0,1,2,3].map(i => <SaSkeletonBlock key={i} width="100%" height={12} borderRadius={4} style={{ marginBottom: 8 }} />)}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[0,1].map(i => (
          <div key={i} className="sa-card" style={{ padding: 18 }}>
            <SaSkeletonBlock width={100} height={14} borderRadius={4} style={{ marginBottom: 16 }} />
            {[0,1,2,3,4].map(j => <SaSkeletonBlock key={j} width="100%" height={36} borderRadius={8} style={{ marginBottom: 8 }} />)}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

function SuperadminReportsPanel() {
  const initial = defaultReportRange()
  const [from, setFrom] = useState(initial.from)
  const [to, setTo] = useState(initial.to)
  const [userId, setUserId] = useState('')
  const [workspaceId, setWorkspaceId] = useState('')
  const [topLimit, setTopLimit] = useState(10)
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
        from: from || undefined, to: to || undefined,
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

  useEffect(() => { runUsageReport() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Derived
  const trend = useMemo(() => {
    const days = report?.byDay
    if (!days?.length) return null
    const mid = Math.floor(days.length / 2)
    const fSum = days.slice(0, mid || 1).reduce((s, d) => s + (Number(d.totalUsageAc) || 0), 0)
    const sSum = days.slice(mid || 1).reduce((s, d) => s + (Number(d.totalUsageAc) || 0), 0)
    let growthPct = null
    if (fSum > 0) growthPct = ((sSum - fSum) / fSum) * 100
    else if (sSum > 0) growthPct = 100
    return {
      areaData: days.map(d => ({ label: d.date, value: Number(d.totalUsageAc) || 0, meta: d.transactionCount })),
      growthPct, avgDaily: Number(report.totalUsageAc) / days.length, spanDays: days.length,
    }
  }, [report])

  const rankedFeatures = useMemo(() => {
    const rows = report?.byFeature
    if (!rows?.length) return []
    const top = rows.slice(0, 6).map(r => ({ key: r.feature, label: r.label || r.feature, value: Number(r.totalUsageAc) || 0, meta: r.transactionCount }))
    if (rows.length > 6) {
      const rest = rows.slice(6)
      const ov = rest.reduce((s, r) => s + (Number(r.totalUsageAc) || 0), 0)
      const oc = rest.reduce((s, r) => s + (Number(r.transactionCount) || 0), 0)
      if (ov > 0) top.push({ key: 'other', label: 'Other', value: ov, meta: oc })
    }
    return top
  }, [report])

  const maxUserAc = report?.topUsers?.[0]?.totalUsageAc ?? 1
  const maxWsAc = report?.topWorkspaces?.[0]?.totalUsageAc ?? 1
  const totalAc = Number(report?.totalUsageAc) || 1

  return (
    <div className="sa-panel">

      {/* ── Standard management-page header ── */}
      <div className="sa-panel-header">
        <div className="sa-panel-header-title-group">
          <h2 className="sa-panel-title">Usage Reports</h2>
          <p className="sa-panel-desc">Credit usage analytics across features, users, and workspaces — with interactive charts and trend data.</p>
        </div>
      </div>

      {usageError && <div className="sa-alert sa-alert--error">{usageError}</div>}

      {/* ── Filter strip ── */}
      <FilterBar from={from} to={to} setFrom={setFrom} setTo={setTo}
        userId={userId} setUserId={setUserId}
        workspaceId={workspaceId} setWorkspaceId={setWorkspaceId}
        topLimit={topLimit} setTopLimit={setTopLimit}
        onSubmit={runUsageReport} loading={usageLoading} />

      {/* ── Scrollable body ── */}
      <div className="sa-scroll rpt-body-scroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingBottom: 24 }}>

        {usageLoading && <ReportsSkeleton />}

        {!report && !usageLoading && !usageError && (
          <div className="sa-empty" style={{ marginTop: 48 }}>
            <BarChart3 className="sa-empty-icon" size={48} />
            <p style={{ marginTop: 12 }}>Set a date range and run a report to see usage metrics.</p>
          </div>
        )}

        {report && !usageLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ── KPI Cards (management-page style) ── */}
            <div className="sa-kpi-grid">
              <div className="sa-kpi-card sa-kpi-card--blue">
                <div className="sa-kpi-card-grain" />
                <div className="sa-kpi-header"><span className="sa-kpi-label">Transactions</span></div>
                <div className="sa-kpi-body">
                  <span className="sa-kpi-value">{new Intl.NumberFormat().format(report.transactionCount ?? 0)}</span>
                  <span className="sa-kpi-detail">credit events in range</span>
                </div>
                <div className="sa-kpi-corner-icon"><Activity size={70} strokeWidth={1.5} /></div>
              </div>

              <div className="sa-kpi-card sa-kpi-card--emerald">
                <div className="sa-kpi-card-grain" />
                <div className="sa-kpi-header">
                  <span className="sa-kpi-label">Credits Used</span>
                  {trend?.growthPct != null && (
                    <span className="sa-kpi-detail" style={{ fontSize: '0.7rem' }}>
                      {trend.growthPct >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {trend.growthPct >= 0 ? '+' : ''}{Math.round(trend.growthPct)}%
                    </span>
                  )}
                </div>
                <div className="sa-kpi-body">
                  <span className="sa-kpi-value">{formatAc(report.totalUsageAc ?? 0)}</span>
                  <span className="sa-kpi-detail">{trend ? `avg ${formatAc(Math.round(trend.avgDaily))} / day` : 'across all features'}</span>
                </div>
                <div className="sa-kpi-corner-icon"><Zap size={70} strokeWidth={1.5} /></div>
              </div>

              <div className="sa-kpi-card sa-kpi-card--amber">
                <div className="sa-kpi-card-grain" />
                <div className="sa-kpi-header"><span className="sa-kpi-label">Est. HeyGen Cost</span></div>
                <div className="sa-kpi-body">
                  <span className="sa-kpi-value">${Number(report.estimatedHeygenUsd ?? 0).toFixed(2)}</span>
                  <span className="sa-kpi-detail">PAYG / Enterprise rate</span>
                </div>
                <div className="sa-kpi-corner-icon"><DollarSign size={70} strokeWidth={1.5} /></div>
              </div>

              <div className="sa-kpi-card sa-kpi-card--purple">
                <div className="sa-kpi-card-grain" />
                <div className="sa-kpi-header"><span className="sa-kpi-label">Features Used</span></div>
                <div className="sa-kpi-body">
                  <span className="sa-kpi-value">{report.byFeature?.length ?? '—'}</span>
                  <span className="sa-kpi-detail">distinct categories</span>
                </div>
                <div className="sa-kpi-corner-icon"><Layers size={70} strokeWidth={1.5} /></div>
              </div>
            </div>

            {/* ── Row 2: Area chart + Donut ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.65fr 1fr', gap: 16 }}>

              {/* Daily usage trend — area chart */}
              <div className="sa-card">
                <div className="sa-card-header">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Activity size={14} style={{ color: 'var(--primary)' }} /> Daily usage trend
                  </h3>
                  {trend && <span className="sa-card-header-count">{trend.spanDays} days</span>}
                </div>
                <div className="sa-card-body" style={{ padding: '12px 16px 16px' }}>
                  {trend?.areaData?.length
                    ? <AnimatedAreaChart data={trend.areaData} formatValue={v => formatAc(v)} formatLabel={l => shortDate(l)} height={210} />
                    : <p className="sa-empty-text">No daily data in range.</p>}
                </div>
              </div>

              {/* Feature distribution — donut */}
              <div className="sa-card">
                <div className="sa-card-header">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Zap size={14} style={{ color: 'var(--primary)' }} /> Usage by feature
                  </h3>
                  {report.byFeature?.length > 0 && <span className="sa-card-header-count">{report.byFeature.length}</span>}
                </div>
                <div className="sa-card-body" style={{ padding: '12px 16px 16px' }}>
                  {rankedFeatures.length
                    ? <AnimatedDonutChart rows={rankedFeatures} />
                    : <p className="sa-empty-text">No feature data.</p>}
                </div>
              </div>
            </div>

            {/* ── Row 3: Top users + Top workspaces — horizontal bar lists ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

              {report.topUsers?.length > 0 && (
                <div className="sa-card">
                  <div className="sa-card-header">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <Users size={14} style={{ color: 'var(--primary)' }} /> Top users
                    </h3>
                    <span className="sa-card-header-count">{report.topUsers.length} ranked</span>
                  </div>
                  <div className="sa-card-body" style={{ padding: '8px 0', overflowY: 'auto', maxHeight: 420 }}>
                    <AnimatedBarList
                      rows={report.topUsers.map((u, i) => ({ key: u.userId, label: u.name || u.email || u.userId, value: Number(u.totalUsageAc), meta: u.transactionCount }))}
                      maxValue={maxUserAc}
                    />
                  </div>
                </div>
              )}

              {report.topWorkspaces?.length > 0 && (
                <div className="sa-card">
                  <div className="sa-card-header">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <Building2 size={14} style={{ color: 'var(--primary)' }} /> Top workspaces
                    </h3>
                    <span className="sa-card-header-count">{report.topWorkspaces.length} ranked</span>
                  </div>
                  <div className="sa-card-body" style={{ padding: '8px 0', overflowY: 'auto', maxHeight: 420 }}>
                    <AnimatedBarList
                      rows={report.topWorkspaces.map((w, i) => ({ key: w.workspaceId, label: w.name || w.workspaceId, value: Number(w.totalUsageAc), meta: w.transactionCount }))}
                      maxValue={maxWsAc}
                      showShare
                      totalAc={totalAc}
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
