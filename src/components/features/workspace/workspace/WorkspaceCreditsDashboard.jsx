import { useState, useEffect, useCallback } from 'react'
import {
  MdOutlineBolt,
  MdHistory,
  MdPeople,
  MdRefresh,
  MdChevronLeft,
  MdChevronRight,
  MdOutlineSwapVert,
  MdAccessTime,
} from 'react-icons/md'
import creditsService from '../../../../services/creditsService.js'

// ---------------------------------------------------------------------------
// Constants
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
  usage:           { bg: 'rgba(239,68,68,0.08)',   color: '#dc2626' },
  platform_grant:  { bg: 'rgba(16,185,129,0.08)',  color: '#059669' },
  platform_revoke: { bg: 'rgba(239,68,68,0.08)',   color: '#dc2626' },
  allocation:      { bg: 'rgba(59,130,246,0.08)',   color: '#2563eb' },
  deallocation:    { bg: 'rgba(245,158,11,0.08)',   color: '#d97706' },
  refund:          { bg: 'rgba(16,185,129,0.08)',   color: '#059669' },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatDate(raw) {
  if (!raw) return '—'
  const d = new Date(raw)
  if (isNaN(d)) return raw
  return (
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ', ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  )
}

/** Deterministic avatar background colour from a name string */
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
// Small reusable atoms
// ---------------------------------------------------------------------------
function TypeBadge({ type }) {
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
      {sign}{Math.abs(Number(amount ?? 0)).toLocaleString()} AC
    </span>
  )
}

/** Returns true if a string looks like a raw internal ID rather than a human name */
function isRawId(str) {
  if (!str) return false
  // raw IDs typically have underscores + long numeric/hash segments, no spaces
  return /^[a-zA-Z0-9_-]{10,}$/.test(str) && !str.includes(' ')
}

/**
 * Clean label for display:
 * - If usageDetail has a sceneName (real human name) → keep the full label as-is
 * - If the label was built from a raw sceneId (no spaces, looks like an ID) → use
 *   a simpler fallback so we don't show "Avatar video scene "scene_178126…""
 * - The `where` subtitle already shows Scene ID + Project so no info is lost
 */
function resolveActivityLabel(tx) {
  const d = tx.usageDetail
  if (!d) return TYPE_LABELS[tx.type] || tx.type || '—'

  // For heygen_video: always just "Avatar video in <project>" — scene is in the subtitle
  if (d.feature === 'heygen_video') {
    const base = 'Avatar video'
    return d.projectName ? `${base} in "${d.projectName}"` : base
  }

  return d.label || TYPE_LABELS[tx.type] || tx.type || '—'
}

/**
 * Activity cell — primary label on top, optional muted "where" subtitle below,
 * and an optional duration chip inline with the label.
 */
function ActivityCell({ tx }) {
  const d        = tx.usageDetail
  const label    = resolveActivityLabel(tx)
  // strip the "Workspace: X" segment — user is already inside the workspace
  const rawWhere = d?.where || null
  const where = rawWhere
    ? rawWhere.split(' · ').filter((s) => !s.startsWith('Workspace:')).join(' · ') || null
    : null
  const secs     = d?.durationSeconds ? Math.round(d.durationSeconds) : null
  const duration = secs
    ? secs < 60
      ? `${secs}s`
      : `${Math.floor(secs / 60)}m ${secs % 60}s`
    : null

  return (
    <div className="wcd-activity-cell">
      <span className="wcd-activity-label">
        {label}
        {duration && (
          <span className="wcd-duration-chip">
            <MdAccessTime size={11} />
            {duration}
          </span>
        )}
      </span>
      {where && <span className="wcd-activity-sub">{where}</span>}
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

function SkeletonRows({ cols = 4 }) {
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

function PanelHeader({ title, icon, onRefresh, loading }) {
  return (
    <div className="wcd-panel-header">
      <span className="wcd-panel-title">{icon}{title}</span>
      <button className="wcd-refresh-btn" onClick={onRefresh} disabled={loading} aria-label="Refresh">
        <MdRefresh size={16} className={loading ? 'wcd-spin' : ''} />
        Refresh
      </button>
    </div>
  )
}

function LoadingState({ cols = 4 }) {
  return (
    <div className="wcd-table-wrap">
      <table className="wcd-table">
        <tbody>
          {[1, 2, 3, 4, 5].map((i) => (
            <tr key={i} className="wcd-skeleton-row">
              {Array.from({ length: cols }).map((_, j) => (
                <td key={j}>
                  <span
                    className="wcd-skeleton"
                    style={{ width: j === 0 ? '60%' : j === cols - 1 ? '30%' : '45%' }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Transaction table — shared by My Usage and Workspace History
// ---------------------------------------------------------------------------
function TxTable({ transactions, loading, emptyLabel }) {
  if (loading) return <LoadingState cols={4} />
  return (
    <div className="wcd-table-wrap">
      <table className="wcd-table">
        <thead>
          <tr>
            <th>Activity</th>
            <th>Type</th>
            <th>Date</th>
            <th className="wcd-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr><td colSpan={4}><EmptyState label={emptyLabel} /></td></tr>
          ) : (
            transactions.map((tx, i) => (
              <tr key={tx.id || i}>
                <td><ActivityCell tx={tx} /></td>
                <td><TypeBadge type={tx.type} /></td>
                <td className="wcd-muted">{formatDate(tx.createdAt)}</td>
                <td className="wcd-right">
                  <AmountCell amount={tx.amount} type={tx.type} />
                </td>
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

/** My Usage — current user's transactions in this workspace (any member) */
function MyUsagePanel({ workspaceId }) {
  const [data, setData]       = useState(null)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

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
  const totalPages   = data?.pagination?.totalPages || 1

  return (
    <div className="wcd-panel">
      <PanelHeader
        title="My Usage"
        icon={<MdOutlineBolt size={18} />}
        onRefresh={() => load(page)}
        loading={loading}
      />
      {error && <div className="wcd-error">{error}</div>}
      <TxTable
        transactions={transactions}
        loading={loading}
        emptyLabel="You haven't used any credits in this workspace yet"
      />
      <Pagination
        page={page}
        totalPages={totalPages}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
      />
    </div>
  )
}

/** Workspace History — all transactions (OWNER / ADMIN only) */
function WorkspaceHistoryPanel({ workspaceId }) {
  const [data, setData]       = useState(null)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

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
  const totalPages   = data?.pagination?.totalPages || 1

  return (
    <div className="wcd-panel">
      <PanelHeader
        title="Workspace History"
        icon={<MdHistory size={18} />}
        onRefresh={() => load(page)}
        loading={loading}
      />
      {error && <div className="wcd-error">{error}</div>}
      <TxTable transactions={transactions} loading={loading} />
      <Pagination
        page={page}
        totalPages={totalPages}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
      />
    </div>
  )
}

/** Usage by Member — aggregated per user (OWNER / ADMIN only, TEAM workspaces) */
function UsageByMemberPanel({ workspaceId }) {
  const [data, setData]       = useState(null)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

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

  const members    = data?.members || []
  const totalPages = data?.pagination?.totalPages || 1

  return (
    <div className="wcd-panel">
      <PanelHeader
        title="Usage by Member"
        icon={<MdPeople size={18} />}
        onRefresh={() => load(page)}
        loading={loading}
      />
      {error && <div className="wcd-error">{error}</div>}

      {loading ? <LoadingState cols={4} /> : (
      <div className="wcd-table-wrap">
        <table className="wcd-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Email</th>
              <th className="wcd-right">Credits Used</th>
              <th className="wcd-right">Transactions</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr><td colSpan={4}><EmptyState label="No member usage recorded yet" /></td></tr>
            ) : (
              members.map((row, i) => {
                const name  = row.user?.name  || 'Unknown'
                const email = row.user?.email || '—'
                return (
                  <tr key={row.userId || i}>
                    <td>
                      <div className="wcd-member-cell">
                        <span
                          className="wcd-avatar"
                          style={{ background: avatarColor(name) }}
                          aria-hidden
                        >
                          {name.charAt(0).toUpperCase()}
                        </span>
                        <span className="wcd-member-name">{name}</span>
                      </div>
                    </td>
                    <td className="wcd-muted">{email}</td>
                    <td className="wcd-right">
                      <span style={{ fontWeight: 700, color: '#dc2626', fontVariantNumeric: 'tabular-nums' }}>
                        {Number(row.totalUsageAc || 0).toLocaleString()} AC
                      </span>
                    </td>
                    <td className="wcd-right">
                      <span style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                        {Number(row.transactionCount || 0).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab config
// ---------------------------------------------------------------------------
const TABS_ADMIN = [
  { id: 'my-usage',  label: 'My Usage',          icon: <MdOutlineBolt size={16} /> },
  { id: 'history',   label: 'Workspace History',  icon: <MdHistory size={16} /> },
  { id: 'by-member', label: 'By Member',          icon: <MdPeople size={16} /> },
]

const TABS_MEMBER = [
  { id: 'my-usage',  label: 'My Usage',  icon: <MdOutlineBolt size={16} /> },
]

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
/**
 * WorkspaceCreditsDashboard
 *
 * Props:
 *   workspaceId      — string | number
 *   userRole         — 'OWNER' | 'ADMIN' | 'MEMBER'
 *   workspaceCredits — number (balance shown in header pill)
 */
function WorkspaceCreditsDashboard({ workspaceId, userRole = 'MEMBER', workspaceCredits }) {
  const role           = String(userRole).toUpperCase()
  const isAdminOrOwner = role === 'OWNER' || role === 'ADMIN'
  const tabs           = isAdminOrOwner ? TABS_ADMIN : TABS_MEMBER

  const [activeTab, setActiveTab] = useState(tabs[0].id)

  // reset to first valid tab if role changes
  useEffect(() => {
    if (!tabs.find((t) => t.id === activeTab)) {
      setActiveTab(tabs[0].id)
    }
  }, [tabs, activeTab])

  return (
    <>
      <style>{CSS}</style>
      <div className="wcd-root">
        {/* Tab bar + balance pill */}
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

          <div className="wcd-balance-pill">
            <MdOutlineBolt size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <span className="wcd-balance-label">Workspace Credits</span>
            <span className="wcd-balance-value">
              {workspaceCredits != null ? Number(workspaceCredits).toLocaleString() : '—'}
            </span>
          </div>
        </div>

        {/* Active panel */}
        <div className="wcd-content">
          {activeTab === 'my-usage'  && <MyUsagePanel workspaceId={workspaceId} />}
          {activeTab === 'history'   && isAdminOrOwner && <WorkspaceHistoryPanel workspaceId={workspaceId} />}
          {activeTab === 'by-member' && isAdminOrOwner && <UsageByMemberPanel workspaceId={workspaceId} />}
        </div>
      </div>
    </>
  )
}

export default WorkspaceCreditsDashboard

// ---------------------------------------------------------------------------
// Scoped CSS
// ---------------------------------------------------------------------------
const CSS = `
.wcd-root {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-bottom: 32px;
}

/* tabs row */
.wcd-tabs-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

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

/* balance pill */
.wcd-balance-pill {
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
.wcd-balance-label { font-size: 12px; color: var(--text-muted); font-weight: 500; }
.wcd-balance-value { font-size: 13px; font-weight: 700; color: var(--text-main); font-variant-numeric: tabular-nums; }

/* loading state — centered in the data area */
.wcd-skeleton-row td { padding: 14px 20px; }
.wcd-skeleton {
  display: block;
  height: 14px;
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    var(--border-color) 25%,
    color-mix(in srgb, var(--border-color) 60%, transparent) 50%,
    var(--border-color) 75%
  );
  background-size: 400px 100%;
  animation: wcd-shimmer 1.4s ease-in-out infinite;
}

@keyframes wcd-shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
}

/* panel card */
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

/* table */
.wcd-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }

.wcd-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 480px;
}

.wcd-table thead {
  background: color-mix(in srgb, var(--bg-surface, #f8fafc) 70%, transparent);
}
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
.wcd-table tbody tr:hover {
  background: color-mix(in srgb, var(--primary, #3b82f6) 4%, transparent);
}

.wcd-right { text-align: right !important; }
.wcd-muted  { color: var(--text-muted) !important; font-size: 13px !important; }

/* activity cell */
.wcd-activity-cell {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.wcd-activity-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
  color: var(--text-main);
  white-space: normal;
  word-break: break-word;
}
.wcd-activity-sub {
  font-size: 12px;
  color: var(--text-muted);
  white-space: normal;
  word-break: break-word;
}

/* duration chip */
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

/* member cell */
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

/* pagination */
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
.wcd-page-btn:hover:not(:disabled) {
  background: var(--bg-surface);
  color: var(--primary);
  border-color: var(--primary);
}
.wcd-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.wcd-page-info {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
  min-width: 48px;
  text-align: center;
}

/* empty & error */
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

/* spin */
@keyframes wcd-spin { to { transform: rotate(360deg); } }
.wcd-spin { animation: wcd-spin 0.7s linear infinite; }
`
