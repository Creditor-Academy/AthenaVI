import { useState, useEffect } from 'react'
import {
  Shield, ChevronLeft, ChevronRight,
  ArrowUpCircle, ArrowDownCircle,
  Filter, RotateCcw,
} from 'lucide-react'
import superadminService from '../../../../services/superadminService'
import { defaultReportRange, formatAc, formatDate } from './superadminUtils'
import '../../../../pages/AdminPortal/SuperadminPortal.css'

// ── Small helpers ─────────────────────────────────────────────────────────────

function GrantBadge({ type }) {
  const isGrant = type === 'platform_grant'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px',
      borderRadius: 99,
      fontSize: '0.6875rem', fontWeight: 700,
      letterSpacing: '0.02em',
      background: isGrant
        ? 'color-mix(in srgb, #22c55e 13%, var(--bg-card))'
        : 'color-mix(in srgb, #ef4444 13%, var(--bg-card))',
      color: isGrant ? '#4ade80' : '#f87171',
      border: `1px solid ${isGrant
        ? 'color-mix(in srgb, #22c55e 28%, var(--border-color))'
        : 'color-mix(in srgb, #ef4444 25%, var(--border-color))'}`,
      whiteSpace: 'nowrap',
    }}>
      {isGrant
        ? <ArrowUpCircle size={10} strokeWidth={2.5} />
        : <ArrowDownCircle size={10} strokeWidth={2.5} />}
      {isGrant ? 'Grant' : 'Revoke'}
    </span>
  )
}

function Avatar({ name, isGrant }) {
  const letters = (name || '?')
    .split(' ').slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('')
  return (
    <div style={{
      width: 30, height: 30, borderRadius: 8, flexShrink: 0,
      background: isGrant
        ? 'color-mix(in srgb, #22c55e 12%, var(--bg-card))'
        : 'color-mix(in srgb, #ef4444 12%, var(--bg-card))',
      border: `1px solid ${isGrant
        ? 'color-mix(in srgb, #22c55e 25%, var(--border-color))'
        : 'color-mix(in srgb, #ef4444 22%, var(--border-color))'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.6875rem', fontWeight: 700,
      color: isGrant ? '#4ade80' : '#f87171',
    }}>
      {letters}
    </div>
  )
}

// ── Table row ─────────────────────────────────────────────────────────────────

function TxRow({ tx }) {
  const isGrant = tx.type === 'platform_grant'
  const targetName = tx.workspace?.name || tx.user?.name || '—'
  const targetSub  = tx.workspace
    ? (tx.user?.email || tx.user?.name || null)
    : (tx.user?.email && tx.user?.name ? tx.user.email : null)
  const actorLabel = tx.actor?.name || tx.actor?.email || '—'
  const amount = Math.abs(Number(tx.amount) || 0)

  return (
    <tr
      style={{ transition: 'background 0.1s' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in srgb, var(--primary) 4%, transparent)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      {/* Type */}
      <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
        <GrantBadge type={tx.type} />
      </td>

      {/* Target */}
      <td style={{ padding: '11px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Avatar name={targetName} isGrant={isGrant} />
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: '0.8125rem', fontWeight: 650,
              color: 'var(--text-main)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              maxWidth: 200,
            }}>
              {targetName}
            </div>
            {targetSub && (
              <div style={{
                fontSize: '0.6875rem', color: 'var(--text-muted)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                maxWidth: 200, marginTop: 1,
              }}>
                {targetSub}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Scope */}
      <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
        <span style={{
          fontSize: '0.75rem', color: 'var(--text-muted)',
          fontWeight: 500, textTransform: 'capitalize',
        }}>
          {tx.scope || '—'}
        </span>
      </td>

      {/* Amount */}
      <td style={{ padding: '11px 14px', whiteSpace: 'nowrap', textAlign: 'right' }}>
        <span style={{
          fontSize: '0.875rem', fontWeight: 700,
          letterSpacing: '-0.01em',
          color: isGrant ? '#4ade80' : '#f87171',
        }}>
          {isGrant ? '+' : '−'}{formatAc(amount)}
        </span>
      </td>

      {/* Actor */}
      <td style={{ padding: '11px 14px' }}>
        <span style={{
          fontSize: '0.8125rem', color: 'var(--text-muted)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          display: 'block', maxWidth: 180,
        }}>
          {actorLabel}
        </span>
      </td>

      {/* Date */}
      <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {formatDate(tx.createdAt)}
        </span>
      </td>
    </tr>
  )
}

// ── Summary pills ─────────────────────────────────────────────────────────────

function SummaryPills({ audit }) {
  if (!audit?.transactions?.length) return null
  const total   = audit.pagination?.total ?? audit.transactions.length
  const grants  = audit.transactions.filter((t) => t.type === 'platform_grant').length
  const revokes = audit.transactions.filter((t) => t.type === 'platform_revoke').length

  const pills = [
    { label: 'Total',   value: new Intl.NumberFormat().format(total),   color: 'var(--primary)' },
    { label: 'Grants',  value: grants,  color: '#4ade80' },
    { label: 'Revokes', value: revokes, color: '#f87171' },
  ]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {pills.map(({ label, value, color }) => (
        <div key={label} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '5px 12px', borderRadius: 99,
          border: `1px solid color-mix(in srgb, ${color} 25%, var(--border-color))`,
          background: `color-mix(in srgb, ${color} 8%, var(--bg-card))`,
          fontSize: '0.8125rem',
        }}>
          <span style={{ color, fontWeight: 700 }}>{value}</span>
          <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
        </div>
      ))}
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────

function SuperadminPlatformActionsPanel() {
  const initial = defaultReportRange()
  const [auditFrom, setAuditFrom] = useState(initial.from)
  const [auditTo, setAuditTo] = useState(initial.to)
  const [auditScope, setAuditScope] = useState('')
  const [auditType, setAuditType] = useState('')
  const [auditPage, setAuditPage] = useState(1)
  const [audit, setAudit] = useState(null)
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditError, setAuditError] = useState('')

  const runAuditReport = async (e, pageOverride) => {
    e?.preventDefault()
    const page = pageOverride ?? auditPage
    setAuditError('')
    setAuditLoading(true)
    try {
      const data = await superadminService.getPlatformActionsReport({
        page,
        limit: 20,
        from: auditFrom || undefined,
        to: auditTo || undefined,
        scope: auditScope || undefined,
        type: auditType || undefined,
      })
      setAudit(data)
      if (pageOverride != null) setAuditPage(page)
    } catch (err) {
      setAudit(null)
      setAuditError(err.message || 'Failed to load audit log')
    } finally {
      setAuditLoading(false)
    }
  }

  const resetFilters = () => {
    const r = defaultReportRange()
    setAuditFrom(r.from)
    setAuditTo(r.to)
    setAuditScope('')
    setAuditType('')
    setAuditPage(1)
  }

  useEffect(() => {
    runAuditReport()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totalPages  = audit?.pagination?.totalPages ?? 1
  const currentPage = audit?.pagination?.page ?? auditPage
  const totalCount  = audit?.pagination?.total ?? audit?.transactions?.length ?? 0

  // Page window: up to 5 pills centred on currentPage
  const pageStart = Math.max(1, Math.min(currentPage - 2, totalPages - 4))
  const pageNums  = Array.from(
    { length: Math.min(5, totalPages) },
    (_, i) => pageStart + i
  )

  return (
    <div className="sa-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>

      {/* ── Header ── */}
      <div className="sa-panel-header" style={{ flexShrink: 0 }}>
        <div>
          <h2 className="sa-panel-title">Platform actions</h2>
          <p className="sa-panel-desc">Audit trail of platform credit grants and revokes.</p>
        </div>
      </div>

      <div className="sa-scroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>

        {/* ── Filter card ── */}
        <form className="sa-card" onSubmit={runAuditReport}>
          <div className="sa-card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              Filters
            </h3>
            <button
              type="button"
              className="sa-btn sa-btn--sm sa-btn--ghost"
              onClick={resetFilters}
              title="Reset to default range"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          <div className="sa-card-body">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
              <div className="sa-field">
                <label htmlFor="audit-from">From</label>
                <input
                  id="audit-from" className="sa-input" type="date"
                  value={auditFrom} onChange={(e) => setAuditFrom(e.target.value)}
                />
              </div>
              <div className="sa-field">
                <label htmlFor="audit-to">To</label>
                <input
                  id="audit-to" className="sa-input" type="date"
                  value={auditTo} onChange={(e) => setAuditTo(e.target.value)}
                />
              </div>
              <div className="sa-field">
                <label htmlFor="audit-scope">Scope</label>
                <select
                  id="audit-scope" className="sa-select"
                  value={auditScope} onChange={(e) => setAuditScope(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="user">User</option>
                  <option value="workspace">Workspace</option>
                </select>
              </div>
              <div className="sa-field">
                <label htmlFor="audit-type">Type</label>
                <select
                  id="audit-type" className="sa-select"
                  value={auditType} onChange={(e) => setAuditType(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="platform_grant">Grant</option>
                  <option value="platform_revoke">Revoke</option>
                </select>
              </div>
              <button
                type="submit"
                className="sa-btn sa-btn--primary"
                disabled={auditLoading}
                style={{ alignSelf: 'flex-end' }}
              >
                {auditLoading ? 'Loading…' : 'Search'}
              </button>
            </div>

            {auditError && (
              <div className="sa-alert sa-alert--error" style={{ marginTop: 12, marginBottom: 0 }}>
                {auditError}
              </div>
            )}
          </div>
        </form>

        {/* ── Empty / loading ── */}
        {!audit && !auditLoading && !auditError && (
          <div className="sa-empty" style={{ marginTop: 32 }}>
            <Shield className="sa-empty-icon" size={38} />
            <p style={{ marginTop: 10, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Select a date range and press Search to load the audit log.
            </p>
          </div>
        )}

        {auditLoading && (
          <div className="sa-loading" style={{ marginTop: 32 }}>
            <span className="sa-spinner" /> Loading…
          </div>
        )}

        {audit?.transactions?.length === 0 && !auditLoading && (
          <div className="sa-empty" style={{ marginTop: 32 }}>
            <Shield className="sa-empty-icon" size={38} />
            <p style={{ marginTop: 10, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No platform actions found for this period.
            </p>
          </div>
        )}

        {/* ── Results ── */}
        {audit?.transactions?.length > 0 && !auditLoading && (
          <div className="sa-card" style={{ marginTop: 16 }}>

            {/* Card header with summary pills */}
            <div className="sa-card-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Shield size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                Audit log
              </h3>
              <SummaryPills audit={audit} />
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table className="sa-table" style={{ tableLayout: 'auto' }}>
                <thead>
                  <tr>
                    {/* Override the global sticky top:49px and semi-transparent bg that causes bleed-through */}
                    <th style={{ top: 0, background: 'var(--bg-card)' }}>Type</th>
                    <th style={{ top: 0, background: 'var(--bg-card)' }}>Target</th>
                    <th style={{ top: 0, background: 'var(--bg-card)' }}>Scope</th>
                    <th style={{ top: 0, background: 'var(--bg-card)', textAlign: 'right' }}>Amount</th>
                    <th style={{ top: 0, background: 'var(--bg-card)' }}>Actor</th>
                    <th style={{ top: 0, background: 'var(--bg-card)' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.transactions.map((tx) => (
                    <TxRow key={tx.id} tx={tx} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="sa-pagination">
                <span>
                  {((currentPage - 1) * 20) + 1}–{Math.min(currentPage * 20, totalCount)} of {new Intl.NumberFormat().format(totalCount)}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button
                    type="button"
                    className="sa-btn sa-btn--sm sa-btn--ghost"
                    disabled={auditPage <= 1}
                    onClick={() => runAuditReport(undefined, auditPage - 1)}
                  >
                    <ChevronLeft size={13} />
                  </button>

                  {pageNums.map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`sa-btn sa-btn--sm ${p === currentPage ? 'sa-btn--primary' : 'sa-btn--ghost'}`}
                      onClick={() => runAuditReport(undefined, p)}
                      style={{ minWidth: 30, padding: '0 6px' }}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    type="button"
                    className="sa-btn sa-btn--sm sa-btn--ghost"
                    disabled={auditPage >= totalPages}
                    onClick={() => runAuditReport(undefined, auditPage + 1)}
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default SuperadminPlatformActionsPanel
