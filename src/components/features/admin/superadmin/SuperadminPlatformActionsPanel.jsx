import { useState, useEffect } from 'react'
import {
  Shield, ChevronLeft, ChevronRight,
  ArrowUpCircle, ArrowDownCircle,
  Filter, RotateCcw, Search, Activity,
} from 'lucide-react'
import superadminService from '../../../../services/superadminService'
import { defaultReportRange, formatAc, formatDate } from './superadminUtils'
import '../../../../pages/AdminPortal/styles/SuperadminBase.css'
import '../../../../pages/AdminPortal/styles/AdminPlatform.css'
import { SaSkeletonBlock, AdminStatStripSkeleton } from './skeletons/AdminSkeletons'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initials(name) {
  return (name || '?').split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('')
}

// ─── Type badge ───────────────────────────────────────────────────────────────

function TypeBadge({ type }) {
  const isGrant = type === 'platform_grant'
  return (
    <span className={`pa-type-badge ${isGrant ? 'pa-type-badge--grant' : 'pa-type-badge--revoke'}`}>
      {isGrant ? <ArrowUpCircle size={10} strokeWidth={2.5} /> : <ArrowDownCircle size={10} strokeWidth={2.5} />}
      {isGrant ? 'Grant' : 'Revoke'}
    </span>
  )
}

// ─── Audit table row ──────────────────────────────────────────────────────────

function TxRow({ tx }) {
  const isGrant = tx.type === 'platform_grant'
  const targetName = tx.workspace?.name || tx.user?.name || '—'
  const targetSub  = tx.workspace
    ? (tx.user?.email || tx.user?.name || null)
    : (tx.user?.email && tx.user?.name ? tx.user.email : null)
  const actorLabel = tx.actor?.name || tx.actor?.email || '—'
  const amount = Math.abs(Number(tx.amount) || 0)

  return (
    <tr className="pa-table-row">
      <td className="pa-td"><TypeBadge type={tx.type} /></td>
      <td className="pa-td">
        <div className="pa-target-cell">
          <div className="pa-avatar">{initials(targetName)}</div>
          <div className="pa-target-info">
            <span className="pa-target-name">{targetName}</span>
            {targetSub && <span className="pa-target-sub">{targetSub}</span>}
          </div>
        </div>
      </td>
      <td className="pa-td">
        <span className="pa-scope-chip">{tx.scope || '—'}</span>
      </td>
      <td className="pa-td pa-td--right">
        <span className={`pa-amount ${isGrant ? 'pa-amount--grant' : 'pa-amount--revoke'}`}>
          {isGrant ? '+' : '−'}{formatAc(amount)}
        </span>
      </td>
      <td className="pa-td">
        <span className="pa-actor">{actorLabel}</span>
      </td>
      <td className="pa-td">
        <span className="pa-date">{formatDate(tx.createdAt)}</span>
      </td>
    </tr>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function AuditSkeleton() {
  return (
    <div className="sa-card" style={{ marginTop: 16 }}>
      <div className="sa-card-header">
        <SaSkeletonBlock width={160} height={14} borderRadius={4} />
        <SaSkeletonBlock width={120} height={24} borderRadius={99} />
      </div>
      <div style={{ padding: '0 16px' }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
            <SaSkeletonBlock width={68} height={22} borderRadius={6} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
              <SaSkeletonBlock width={30} height={30} borderRadius={8} />
              <SaSkeletonBlock width="38%" height={13} borderRadius={4} />
            </div>
            <SaSkeletonBlock width={72} height={22} borderRadius={99} />
            <SaSkeletonBlock width={80} height={14} borderRadius={4} />
            <SaSkeletonBlock width={90} height={12} borderRadius={4} />
            <SaSkeletonBlock width={80} height={12} borderRadius={4} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

function SuperadminPlatformActionsPanel() {
  const initial = defaultReportRange()
  const [auditFrom, setAuditFrom] = useState(initial.from)
  const [auditTo,   setAuditTo]   = useState(initial.to)
  const [auditScope, setAuditScope] = useState('')
  const [auditType,  setAuditType]  = useState('')
  const [auditPage,  setAuditPage]  = useState(1)
  const [audit,  setAudit]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const runAudit = async (e, pageOverride) => {
    e?.preventDefault()
    const page = pageOverride ?? auditPage
    setError('')
    setLoading(true)
    try {
      const data = await superadminService.getPlatformActionsReport({
        page, limit: 20,
        from: auditFrom || undefined,
        to: auditTo || undefined,
        scope: auditScope || undefined,
        type: auditType || undefined,
      })
      setAudit(data)
      if (pageOverride != null) setAuditPage(page)
    } catch (err) {
      setAudit(null)
      setError(err.message || 'Failed to load audit log')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    const r = defaultReportRange()
    setAuditFrom(r.from); setAuditTo(r.to)
    setAuditScope(''); setAuditType(''); setAuditPage(1)
  }

  useEffect(() => { runAudit() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages  = audit?.pagination?.totalPages ?? 1
  const currentPage = audit?.pagination?.page ?? auditPage
  const totalCount  = audit?.pagination?.total ?? audit?.transactions?.length ?? 0
  const pageStart   = Math.max(1, Math.min(currentPage - 2, totalPages - 4))
  const pageNums    = Array.from({ length: Math.min(5, totalPages) }, (_, i) => pageStart + i)

  // Derived KPI counts from current page (best-effort)
  const grants  = audit?.transactions?.filter(t => t.type === 'platform_grant').length ?? 0
  const revokes = audit?.transactions?.filter(t => t.type === 'platform_revoke').length ?? 0

  return (
    <div className="sa-panel">

      {/* ── Header ── */}
      <div className="sa-panel-header">
        <div className="sa-panel-header-title-group">
          <h2 className="sa-panel-title">Platform Actions</h2>
          <p className="sa-panel-desc">Audit trail of all platform-level credit grants and revokes across users and workspaces.</p>
        </div>
      </div>

      {error && <div className="sa-alert sa-alert--error">{error}</div>}

      {loading && <AdminStatStripSkeleton count={4} />}

      {/* ── KPI strip (shown once data is loaded) ── */}
      {audit && !loading && (
        <div className="sa-kpi-grid">
          <div className="sa-kpi-card sa-kpi-card--blue">
            <div className="sa-kpi-card-grain" />
            <div className="sa-kpi-header"><span className="sa-kpi-label">Total Actions</span></div>
            <div className="sa-kpi-body">
              <span className="sa-kpi-value">{new Intl.NumberFormat().format(totalCount)}</span>
              <span className="sa-kpi-detail">in selected range</span>
            </div>
            <div className="sa-kpi-corner-icon"><Activity size={70} strokeWidth={1.5} /></div>
          </div>

          <div className="sa-kpi-card sa-kpi-card--emerald">
            <div className="sa-kpi-card-grain" />
            <div className="sa-kpi-header"><span className="sa-kpi-label">Grants (page)</span></div>
            <div className="sa-kpi-body">
              <span className="sa-kpi-value">{grants}</span>
              <span className="sa-kpi-detail">credit grant actions</span>
            </div>
            <div className="sa-kpi-corner-icon"><ArrowUpCircle size={70} strokeWidth={1.5} /></div>
          </div>

          <div className="sa-kpi-card sa-kpi-card--amber">
            <div className="sa-kpi-card-grain" />
            <div className="sa-kpi-header"><span className="sa-kpi-label">Revokes (page)</span></div>
            <div className="sa-kpi-body">
              <span className="sa-kpi-value">{revokes}</span>
              <span className="sa-kpi-detail">credit revoke actions</span>
            </div>
            <div className="sa-kpi-corner-icon"><ArrowDownCircle size={70} strokeWidth={1.5} /></div>
          </div>

          <div className="sa-kpi-card sa-kpi-card--purple">
            <div className="sa-kpi-card-grain" />
            <div className="sa-kpi-header"><span className="sa-kpi-label">Pages</span></div>
            <div className="sa-kpi-body">
              <span className="sa-kpi-value">{totalPages}</span>
              <span className="sa-kpi-detail">total result pages</span>
            </div>
            <div className="sa-kpi-corner-icon"><Shield size={70} strokeWidth={1.5} /></div>
          </div>
        </div>
      )}

      {/* ── Filter card ── */}
      <form className="pa-filter-card" onSubmit={runAudit}>
        <div className="pa-filter-header">
          <div className="pa-filter-header-text">
            <span className="pa-filter-heading"><Filter size={13} /> Audit Filters</span>
            <span className="pa-filter-sub">Narrow by date, scope, and action type</span>
          </div>
          <div className="pa-filter-actions">
            <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" onClick={reset}>
              <RotateCcw size={12} /> Reset
            </button>
            <button type="submit" className="sa-btn sa-btn--primary" disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <Search size={13} />{loading ? 'Loading…' : 'Search'}
            </button>
          </div>
        </div>

        <div className="pa-filter-body">
          <div className="pa-filter-group">
            <label htmlFor="audit-from" className="pa-filter-label">From</label>
            <input id="audit-from" className="sa-input" type="date" value={auditFrom} onChange={e => setAuditFrom(e.target.value)} />
          </div>
          <div className="pa-filter-sep" aria-hidden="true">→</div>
          <div className="pa-filter-group">
            <label htmlFor="audit-to" className="pa-filter-label">To</label>
            <input id="audit-to" className="sa-input" type="date" value={auditTo} onChange={e => setAuditTo(e.target.value)} />
          </div>
          <div className="pa-filter-divider" aria-hidden="true" />
          <div className="pa-filter-group">
            <label htmlFor="audit-scope" className="pa-filter-label">Scope</label>
            <select id="audit-scope" className="sa-select" value={auditScope} onChange={e => setAuditScope(e.target.value)}>
              <option value="">All</option>
              <option value="user">User</option>
              <option value="workspace">Workspace</option>
            </select>
          </div>
          <div className="pa-filter-group">
            <label htmlFor="audit-type" className="pa-filter-label">Type</label>
            <select id="audit-type" className="sa-select" value={auditType} onChange={e => setAuditType(e.target.value)}>
              <option value="">All</option>
              <option value="platform_grant">Grant</option>
              <option value="platform_revoke">Revoke</option>
            </select>
          </div>
        </div>
      </form>

      {/* ── Body scroll ── */}
      <div className="sa-scroll pa-body-scroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingBottom: 24 }}>

        {loading && <AuditSkeleton />}

        {!audit && !loading && !error && (
          <div className="sa-empty" style={{ marginTop: 48 }}>
            <Shield className="sa-empty-icon" size={44} />
            <p style={{ marginTop: 12 }}>Select a date range and press Search to load the audit log.</p>
          </div>
        )}

        {audit?.transactions?.length === 0 && !loading && (
          <div className="sa-empty" style={{ marginTop: 32 }}>
            <Shield className="sa-empty-icon" size={44} />
            <p style={{ marginTop: 12 }}>No platform actions found for this period.</p>
          </div>
        )}

        {audit?.transactions?.length > 0 && !loading && (
          <div className="sa-card" style={{ marginTop: 16 }}>
            <div className="sa-card-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Shield size={13} style={{ color: 'var(--primary)' }} /> Audit log
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="pa-type-badge pa-type-badge--grant"><ArrowUpCircle size={10} /> {grants}</span>
                <span className="pa-type-badge pa-type-badge--revoke"><ArrowDownCircle size={10} /> {revokes}</span>
                <span className="sa-card-header-count">{new Intl.NumberFormat().format(totalCount)} total</span>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="sa-table" style={{ tableLayout: 'auto' }}>
                <thead>
                  <tr>
                    <th style={{ top: 0, background: 'var(--bg-card)' }}>Type</th>
                    <th style={{ top: 0, background: 'var(--bg-card)' }}>Target</th>
                    <th style={{ top: 0, background: 'var(--bg-card)' }}>Scope</th>
                    <th style={{ top: 0, background: 'var(--bg-card)', textAlign: 'right' }}>Amount</th>
                    <th style={{ top: 0, background: 'var(--bg-card)' }}>Actor</th>
                    <th style={{ top: 0, background: 'var(--bg-card)' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.transactions.map(tx => <TxRow key={tx.id} tx={tx} />)}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="sa-pagination">
                <span>{((currentPage - 1) * 20) + 1}–{Math.min(currentPage * 20, totalCount)} of {new Intl.NumberFormat().format(totalCount)}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" disabled={auditPage <= 1} onClick={() => runAudit(undefined, auditPage - 1)}>
                    <ChevronLeft size={13} />
                  </button>
                  {pageNums.map(p => (
                    <button key={p} type="button" className={`sa-btn sa-btn--sm ${p === currentPage ? 'sa-btn--primary' : 'sa-btn--ghost'}`} onClick={() => runAudit(undefined, p)} style={{ minWidth: 30, padding: '0 6px' }}>
                      {p}
                    </button>
                  ))}
                  <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" disabled={auditPage >= totalPages} onClick={() => runAudit(undefined, auditPage + 1)}>
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
