import { useState, useEffect, useCallback } from 'react'
import {
  MdOutlineBolt,
  MdHistory,
  MdPeople,
  MdRefresh,
  MdChevronLeft,
  MdChevronRight,
  MdArrowDownward,
  MdArrowUpward,
  MdOutlineSwapVert,
  MdAccessTime,
} from 'react-icons/md'
import creditsService from '../../../../services/creditsService.js'

// ---------------------------------------------------------------------------
// usageDetail helpers
// ---------------------------------------------------------------------------

/** Human-readable title from usageDetail.label or fallback from type */
function resolveTitle(tx) {
  const d = tx.usageDetail
  if (d?.label) return d.label
  return TYPE_LABELS[tx.type] || tx.type || '—'
}

/** Subtitle: combine contextual fields depending on feature */
function resolveSubtitle(tx) {
  const d = tx.usageDetail
  if (!d) return null

  const feature = d.feature || tx.feature

  if (feature === 'heygen_video') {
    const parts = [d.projectName, d.videoTitle || d.sceneId].filter(Boolean)
    return parts.join(' · ') || null
  }
  if (feature === 'remotion_export') {
    const parts = [d.projectName, 'export'].filter(Boolean)
    return parts.join(' · ') || null
  }
  if (feature === 'voice_clone') return d.voiceName || null
  if (feature === 'voice_design') return d.promptPreview || null
  if (feature === 'avatar_create') return d.avatarName || null
  if (feature === 'voice_preview') return d.previewText || null

  // fallback for allocation / refund etc.
  return d.workspaceName || null
}

/** Duration display when durationSeconds is present */
function resolveDuration(tx) {
  const d = tx.usageDetail
  if (!d?.durationSeconds) return null
  const s = Math.round(d.durationSeconds)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------
const TYPE_LABELS = {
  usage: 'Usage',
  platform_grant: 'Grant',
  platform_revoke: 'Revoke',
  allocation: 'Allocated',
  deallocation: 'Returned',
  refund: 'Refund',
}

const TYPE_COLORS = {
  usage: { bg: 'rgba(239,68,68,0.08)', color: '#dc2626' },
  platform_grant: { bg: 'rgba(16,185,129,0.08)', color: '#059669' },
  platform_revoke: { bg: 'rgba(239,68,68,0.08)', color: '#dc2626' },
  allocation: { bg: 'rgba(59,130,246,0.08)', color: '#2563eb' },
  deallocation: { bg: 'rgba(245,158,11,0.08)', color: '#d97706' },
  refund: { bg: 'rgba(16,185,129,0.08)', color: '#059669' },
}

function formatDate(raw) {
  if (!raw) return '—'
  const d = new Date(raw)
  if (isNaN(d)) return raw
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) + ', ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function CreditBadge({ type }) {
  const style = TYPE_COLORS[type] || { bg: 'rgba(100,116,139,0.08)', color: '#64748b' }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 9px',
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 600,
        background: style.bg,
        color: style.color,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
      }}
    >
      {TYPE_LABELS[type] || type}
    </span>
  )
}

function AmountCell({ amount, type }) {
  const isDebit = type === 'usage' || type === 'platform_revoke' || type === 'deallocation'
  const sign = isDebit ? '-' : '+'
  const color = isDebit ? '#dc2626' : '#059669'
  return (
    <span style={{ fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>
      {sign}{Math.abs(Number(amount ?? 0)).toLocaleString()}
    </span>
  )
}

/** Inline title + duration chip on one line */
function DescCell({ tx }) {
  const title = resolveTitle(tx)
  const duration = resolveDuration(tx)
  return (
    <div className="wcd-desc-cell">
      <span className="wcd-desc-title">
        {title}
        {duration && (
          <span className="wcd-duration-chip">
            <MdAccessTime size={11} />
            {duration}
          </span>
        )}
      </span>
    </div>
  )
}

function Pagination({ page, totalPages, onPrev, onNext }) {
  if (totalPages <= 1) return null
  return (
    <div className="wcd-pagination">
      <button className="wcd-page-btn" onClick={onPrev} disabled={page <= 1} aria-label="Previous page">
        <MdChevronLeft size={18} />
      </button>
      <span className="wcd-page-info">{page} / {totalPages}</span>
      <button className="wcd-page-btn" onClick={onNext} disabled={page >= totalPages} aria-label="Next page">
        <MdChevronRight size={18} />
      </button>
    </div>
  )
}

function EmptyState({ label }) {
  return (
    <div className="wcd-empty">
      <MdOutlineSwapVert size={36} />
      <p>{label || 'No transactions yet'}</p>
    </div>
  )
}

function LoadingRows({ cols = 4 }) {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <tr key={i} className="wcd-skeleton-row">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j}><span className="wcd-skeleton" /></td>
          ))}
        </tr>
      ))}
    </>
  )
}

/** Shared transaction table used by history + my-usage panels */
function TxTable({ transactions, loading, emptyLabel }) {
  return (
    <div className="wcd-table-wrap">
      <table className="wcd-table">
        <thead>
          <tr>
            <th>Activity</th>
            <th>Type</th>
            <th>Date</th>
            <th className="wcd-right">Amount (AC)</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <LoadingRows cols={4} />
          ) : transactions.length === 0 ? (
            <tr><td colSpan={4}><EmptyState label={emptyLabel} /></td></tr>
          ) : (
            transactions.map((tx, i) => (
              <tr key={tx.id || i}>
                <td><DescCell tx={tx} /></td>
                <td><CreditBadge type={tx.type} /></td>
                <td className="wcd-muted">{formatDate(tx.createdAt)}</td>
                <td className="wcd-right"><AmountCell amount={tx.amount ?? tx.usageDetail?.credits} type={tx.type} /></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-panels
// ---------------------------------------------------------------------------

/** Workspace-wide history — OWNER / ADMIN only */
function WorkspaceHistoryPanel({ workspaceId }) {
  const [data, setData] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async (p) => {
    setLoading(true)
    setError(null)
    try {
      const result = await creditsService.getWorkspaceHistory(workspaceId, { page: p, limit: 10 })
      setData(result)
    } catch (err) {
      setError(err.message || 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }, [workspaceId])

  useEffect(() => { load(page) }, [load, page])

  const transactions = data?.transactions || []
  const totalPages = data?.pagination?.totalPages || 1

  return (
    <div className="wcd-panel">
      <div className="wcd-panel-header">
        <span className="wcd-panel-title"><MdHistory size={18} />Workspace History</span>
        <button className="wcd-refresh-btn" onClick={() => load(page)} disabled={loading} aria-label="Refresh">
          <MdRefresh size={16} className={loading ? 'wcd-spin' : ''} />Refresh
        </button>
      </div>
      {error && <div className="wcd-error">{error}</div>}
      <TxTable transactions={transactions} loading={loading} />
      <Pagination page={page} totalPages={totalPages}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
      />
    </div>
  )
}

/** Current user's usage in this workspace — any member */
function MyUsagePanel({ workspaceId }) {
  const [data, setData] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async (p) => {
    setLoading(true)
    setError(null)
    try {
      const result = await creditsService.getMyWorkspaceHistory(workspaceId, { page: p, limit: 10 })
      setData(result)
    } catch (err) {
      setError(err.message || 'Failed to load usage')
    } finally {
      setLoading(false)
    }
  }, [workspaceId])

  useEffect(() => { load(page) }, [load, page])

  const transactions = data?.transactions || []
  const totalPages = data?.pagination?.totalPages || 1

  return (
    <div className="wcd-panel">
      <div className="wcd-panel-header">
        <span className="wcd-panel-title"><MdOutlineBolt size={18} />My Usage</span>
        <button className="wcd-refresh-btn" onClick={() => load(page)} disabled={loading} aria-label="Refresh">
          <MdRefresh size={16} className={loading ? 'wcd-spin' : ''} />Refresh
        </button>
      </div>
      {error && <div className="wcd-error">{error}</div>}
      <TxTable
        transactions={transactions}
        loading={loading}
        emptyLabel="You haven't used any credits in this workspace yet"
      />
      <Pagination page={page} totalPages={totalPages}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
      />
    </div>
  )
}

/** Usage grouped by member — OWNER / ADMIN only */
function UsageByMemberPanel({ workspaceId }) {
  const [data, setData] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async (p) => {
    setLoading(true)
    setError(null)
    try {
      const result = await creditsService.getUsageByMember(workspaceId, { page: p, limit: 10 })
      setData(result)
    } catch (err) {
      setError(err.message || 'Failed to load member usage')
    } finally {
      setLoading(false)
    }
  }, [workspaceId])

  useEffect(() => { load(page) }, [load, page])

  // API returns { members: [...], pagination: {...} }
  const rows = data?.members || data?.transactions || data?.items || []
  const totalPages = data?.pagination?.totalPages || 1

  return (
    <div className="wcd-panel">
      <div className="wcd-panel-header">
        <span className="wcd-panel-title"><MdPeople size={18} />Usage by Member</span>
        <button className="wcd-refresh-btn" onClick={() => load(page)} disabled={loading} aria-label="Refresh">
          <MdRefresh size={16} className={loading ? 'wcd-spin' : ''} />Refresh
        </button>
      </div>

      {error && <div className="wcd-error">{error}</div>}

      <div className="wcd-table-wrap">
        <table className="wcd-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Email</th>
              <th className="wcd-right">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <MdArrowDownward size={13} style={{ color: '#dc2626' }} /> Used (AC)
                </span>
              </th>
              <th className="wcd-right">Transactions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <LoadingRows cols={4} />
            ) : rows.length === 0 ? (
              <tr><td colSpan={4}><EmptyState label="No member usage recorded yet" /></td></tr>
            ) : (
              rows.map((row, i) => {
                const member = row.user || row
                const name = member.name || row.name || row.userName || 'Unknown'
                const email = member.email || row.email || '—'
                const used = Number(row.totalUsageAc ?? row.totalUsed ?? row.used ?? 0)
                const count = Number(row.transactionCount ?? row.count ?? 0)
                return (
                  <tr key={row.userId || row.id || i}>
                    <td>
                      <div className="wcd-member-cell">
                        <span className="wcd-avatar" style={{ background: avatarColor(name) }} aria-hidden>
                          {name.charAt(0).toUpperCase()}
                        </span>
                        <span className="wcd-member-name">{name}</span>
                      </div>
                    </td>
                    <td className="wcd-muted">{email}</td>
                    <td className="wcd-right">
                      <span style={{ fontWeight: 700, color: '#dc2626', fontVariantNumeric: 'tabular-nums' }}>
                        {used.toLocaleString()}
                      </span>
                    </td>
                    <td className="wcd-right">
                      <span style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                        {count.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
      />
    </div>
  )
}

/** Estimate panel — any member */
function EstimatePanel({ workspaceId }) {
  const [feature, setFeature] = useState('heygen_video')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // heygen_video params
  const [avatarEngine, setAvatarEngine] = useState('normal')
  const [script, setScript] = useState('')

  // remotion_export params
  const [duration, setDuration] = useState('')
  const [fps, setFps] = useState('')

  const handleEstimate = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const params = { feature }
      if (feature === 'heygen_video') {
        params.avatarEngine = avatarEngine
        if (script.trim()) params.script = script.trim()
      } else {
        if (duration) params.durationInFrames = Number(duration)
        if (fps) params.fps = Number(fps)
      }
      const res = await creditsService.getWorkspaceEstimate(workspaceId, params)
      setResult(res)
    } catch (err) {
      setError(err.message || 'Failed to get estimate')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="wcd-panel">
      <div className="wcd-panel-header">
        <span className="wcd-panel-title">
          <MdCalculate size={18} />
          Estimate Credits
        </span>
      </div>

      <div className="wcd-estimate-body">
        <div className="wcd-estimate-row">
          <label className="wcd-label">Feature</label>
          <div className="wcd-seg">
            <button
              className={`wcd-seg-btn ${feature === 'heygen_video' ? 'active' : ''}`}
              onClick={() => { setFeature('heygen_video'); setResult(null) }}
              type="button"
            >
              HeyGen Video
            </button>
            <button
              className={`wcd-seg-btn ${feature === 'remotion_export' ? 'active' : ''}`}
              onClick={() => { setFeature('remotion_export'); setResult(null) }}
              type="button"
            >
              Remotion Export
            </button>
          </div>
        </div>

        {feature === 'heygen_video' && (
          <>
            <div className="wcd-estimate-row">
              <label className="wcd-label">Avatar engine</label>
              <select
                className="wcd-select"
                value={avatarEngine}
                onChange={(e) => setAvatarEngine(e.target.value)}
              >
                <option value="normal">Normal</option>
                <option value="expressive">Expressive</option>
              </select>
            </div>
            <div className="wcd-estimate-row">
              <label className="wcd-label">Script (optional)</label>
              <textarea
                className="wcd-textarea"
                placeholder="Enter script to estimate by word count…"
                value={script}
                onChange={(e) => setScript(e.target.value)}
                rows={3}
              />
            </div>
          </>
        )}

        {feature === 'remotion_export' && (
          <>
            <div className="wcd-estimate-row">
              <label className="wcd-label">Duration (frames)</label>
              <input
                type="number"
                className="wcd-input"
                placeholder="e.g. 900"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="1"
              />
            </div>
            <div className="wcd-estimate-row">
              <label className="wcd-label">FPS</label>
              <input
                type="number"
                className="wcd-input"
                placeholder="e.g. 30"
                value={fps}
                onChange={(e) => setFps(e.target.value)}
                min="1"
              />
            </div>
          </>
        )}

        {error && <div className="wcd-error">{error}</div>}

        {result && (
          <div className="wcd-estimate-result">
            <span className="wcd-estimate-label">Estimated cost</span>
            <span className="wcd-estimate-value">
              {Number(result.estimatedCredits ?? 0).toLocaleString()}
              <span className="wcd-estimate-unit"> AC</span>
            </span>
            {result.breakdown && (
              <div className="wcd-estimate-breakdown">
                {Object.entries(result.breakdown).map(([k, v]) => (
                  <div key={k} className="wcd-breakdown-row">
                    <span>{k.replace(/_/g, ' ')}</span>
                    <span>{typeof v === 'number' ? v.toLocaleString() : String(v)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          className="wcd-estimate-btn"
          onClick={handleEstimate}
          disabled={loading}
          type="button"
        >
          {loading ? 'Calculating…' : 'Calculate Estimate'}
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Avatar colour helper (deterministic from name string)
// ---------------------------------------------------------------------------
const AVATAR_PALETTE = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f59e0b', '#10b981', '#3b82f6', '#14b8a6',
]
function avatarColor(name = '') {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length]
}

// ---------------------------------------------------------------------------
// TABS config
// ---------------------------------------------------------------------------
const TABS_ADMIN = [
  { id: 'my-usage',   label: 'My Usage',          icon: <MdOutlineBolt size={16} /> },
  { id: 'history',    label: 'Workspace History',  icon: <MdHistory size={16} /> },
  { id: 'by-member',  label: 'By Member',          icon: <MdPeople size={16} /> },
]

const TABS_MEMBER = [
  { id: 'my-usage',   label: 'My Usage',  icon: <MdOutlineBolt size={16} /> },
]

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
/**
 * WorkspaceCreditsDashboard
 *
 * Props:
 *   workspaceId  — string/number
 *   userRole     — 'OWNER' | 'ADMIN' | 'MEMBER'
 *   workspaceCredits — number (balance shown in header)
 */
function WorkspaceCreditsDashboard({ workspaceId, userRole = 'MEMBER', workspaceCredits }) {
  const role = String(userRole).toUpperCase()
  const isAdminOrOwner = role === 'OWNER' || role === 'ADMIN'
  const tabs = isAdminOrOwner ? TABS_ADMIN : TABS_MEMBER

  const [activeTab, setActiveTab] = useState(tabs[0].id)

  // If role changes, reset to first valid tab
  useEffect(() => {
    if (!tabs.find((t) => t.id === activeTab)) {
      setActiveTab(tabs[0].id)
    }
  }, [tabs, activeTab])

  return (
    <>
      <style>{CSS}</style>
      <div className="wcd-root">
        {/* Tab bar + balance pill in one row */}
        <div className="wcd-tabs-row">
          <div className="wcd-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`wcd-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Balance pill on the right */}
          <div className="wcd-balance-item">
            <MdOutlineBolt className="wcd-balance-icon" size={14} />
            <span className="wcd-balance-label">Workspace Credits</span>
            <span className="wcd-balance-value">
              {workspaceCredits != null ? Number(workspaceCredits).toLocaleString() : '—'}
            </span>
          </div>
        </div>

        {/* Panels */}
        <div className="wcd-content">
          {activeTab === 'my-usage' && <MyUsagePanel workspaceId={workspaceId} />}
          {activeTab === 'history' && isAdminOrOwner && <WorkspaceHistoryPanel workspaceId={workspaceId} />}
          {activeTab === 'by-member' && isAdminOrOwner && <UsageByMemberPanel workspaceId={workspaceId} />}
        </div>
      </div>
    </>
  )
}

export default WorkspaceCreditsDashboard

// ---------------------------------------------------------------------------
// Scoped CSS (injected via <style> to avoid a new CSS file)
// ---------------------------------------------------------------------------
const CSS = `
/* ---- root ---- */
.wcd-root {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-bottom: 32px;
}

/* ---- tabs row wrapper ---- */
.wcd-tabs-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

/* ---- inner tab bar (pill style — distinct from outer underline tabs) ---- */
.wcd-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px;
  background: var(--bg-surface, #f1f5f9);
  border-radius: 10px;
  border: 1px solid var(--border-color);
  width: fit-content;
}

.wcd-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 7px;
  transition: background 0.15s, color 0.15s, box-shadow 0.15s;
  white-space: nowrap;
}

.wcd-tab:hover { color: var(--text-main); background: color-mix(in srgb, var(--bg-card) 60%, transparent); }
.wcd-tab.active {
  background: var(--bg-card);
  color: var(--primary);
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

/* ---- balance pill (right side of tabs row) ---- */
.wcd-balance-strip { display: none; }

.wcd-balance-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, #f59e0b 35%, var(--border-color));
  background: var(--bg-card);
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  margin-left: auto;
  flex-shrink: 0;
}

.wcd-balance-icon { color: #f59e0b; flex-shrink: 0; }
.wcd-balance-label { font-size: 12px; color: var(--text-muted); font-weight: 500; }
.wcd-balance-value { font-size: 13px; font-weight: 700; color: var(--text-main); font-variant-numeric: tabular-nums; }

/* ---- panel ---- */
.wcd-panel {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
}

.wcd-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-surface, var(--bg-card));
}

.wcd-panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-main);
}

.wcd-refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}
.wcd-refresh-btn:hover:not(:disabled) {
  background: var(--bg-surface);
  border-color: var(--primary);
  color: var(--text-main);
}
.wcd-refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ---- table ---- */
.wcd-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }

.wcd-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 480px;
}

.wcd-table thead { background: color-mix(in srgb, var(--bg-surface, #f8fafc) 70%, transparent); }
.wcd-table th {
  padding: 11px 20px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;
}

.wcd-table td {
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-color);
  font-size: 14px;
  color: var(--text-main);
  vertical-align: middle;
}

.wcd-table tbody tr:last-child td { border-bottom: none; }
.wcd-table tbody tr { transition: background 0.15s; }
.wcd-table tbody tr:hover { background: color-mix(in srgb, var(--primary, #3b82f6) 4%, transparent); }

.wcd-right { text-align: right !important; }
.wcd-muted { color: var(--text-muted) !important; font-size: 13px !important; }

/* Activity cell — two-line title + subtitle */
.wcd-desc-cell {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.wcd-desc-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.wcd-desc-sub {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.wcd-duration-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 1px 6px;
  flex-shrink: 0;
}

/* ---- member cell ---- */
.wcd-member-cell {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.wcd-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.wcd-member-name { font-weight: 500; }

/* ---- pagination ---- */
.wcd-pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid var(--border-color);
}

.wcd-page-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}
.wcd-page-btn:hover:not(:disabled) { background: var(--bg-surface); color: var(--primary); border-color: var(--primary); }
.wcd-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.wcd-page-info { font-size: 13px; color: var(--text-muted); font-weight: 500; min-width: 48px; text-align: center; }

/* ---- empty & error ---- */
.wcd-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 48px 24px;
  color: var(--text-muted);
  opacity: 0.55;
  font-size: 14px;
  font-weight: 500;
}

.wcd-error {
  margin: 12px 20px 0;
  padding: 10px 14px;
  background: rgba(239,68,68,0.07);
  border: 1px solid rgba(239,68,68,0.2);
  border-radius: 8px;
  color: #dc2626;
  font-size: 13px;
  font-weight: 500;
}

/* ---- estimate panel ---- */
.wcd-estimate-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 24px;
}

.wcd-estimate-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.wcd-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
}

.wcd-seg {
  display: inline-flex;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  width: fit-content;
}

.wcd-seg-btn {
  padding: 7px 16px;
  border: none;
  background: var(--bg-card);
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  font-family: inherit;
}
.wcd-seg-btn:not(:last-child) { border-right: 1px solid var(--border-color); }
.wcd-seg-btn.active { background: var(--primary, #3b82f6); color: #fff; font-weight: 600; }
.wcd-seg-btn:not(.active):hover { background: var(--bg-surface); color: var(--text-main); }

.wcd-select, .wcd-input {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-surface);
  color: var(--text-main);
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
  max-width: 280px;
}
.wcd-select:focus, .wcd-input:focus {
  border-color: var(--primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}

.wcd-textarea {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-surface);
  color: var(--text-main);
  font-size: 14px;
  font-family: inherit;
  outline: none;
  resize: vertical;
  transition: border-color 0.2s;
}
.wcd-textarea:focus {
  border-color: var(--primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}

.wcd-estimate-btn {
  align-self: flex-start;
  padding: 9px 20px;
  border: none;
  border-radius: 8px;
  background: var(--primary, #3b82f6);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s, transform 0.15s;
}
.wcd-estimate-btn:hover:not(:disabled) { background: var(--primary-hover, #2563eb); transform: translateY(-1px); }
.wcd-estimate-btn:disabled { opacity: 0.55; cursor: not-allowed; }

.wcd-estimate-result {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: color-mix(in srgb, var(--primary, #3b82f6) 6%, transparent);
  border: 1px solid color-mix(in srgb, var(--primary, #3b82f6) 30%, transparent);
  border-radius: 10px;
}

.wcd-estimate-label { font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.wcd-estimate-value { font-size: 28px; font-weight: 700; color: var(--text-main); font-variant-numeric: tabular-nums; line-height: 1.2; }
.wcd-estimate-unit { font-size: 16px; font-weight: 500; color: var(--text-muted); }

.wcd-estimate-breakdown {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
  padding-top: 10px;
  border-top: 1px solid var(--border-color);
}

.wcd-breakdown-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--text-muted);
  text-transform: capitalize;
}

/* ---- skeleton loader ---- */
@keyframes wcd-shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
.wcd-skeleton-row td { padding: 12px 20px; }
.wcd-skeleton {
  display: block;
  height: 14px;
  border-radius: 6px;
  background: linear-gradient(90deg, var(--border-color) 25%, color-mix(in srgb, var(--border-color) 60%, transparent) 50%, var(--border-color) 75%);
  background-size: 400px 100%;
  animation: wcd-shimmer 1.4s ease-in-out infinite;
}

/* ---- spin ---- */
@keyframes wcd-spin { to { transform: rotate(360deg); } }
.wcd-spin { animation: wcd-spin 0.7s linear infinite; }
`
