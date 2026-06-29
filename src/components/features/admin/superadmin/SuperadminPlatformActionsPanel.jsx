import { useState, useEffect } from 'react'
import { Shield, ChevronLeft, ChevronRight } from 'lucide-react'
import superadminService from '../../../../services/superadminService'
import { defaultReportRange, formatAc, formatDate, txTypeLabel } from './superadminUtils'
import '../../../../pages/AdminPortal/SuperadminPortal.css'

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

  // Auto-load on mount
  useEffect(() => {
    runAuditReport()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="sa-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="sa-panel-header" style={{ flexShrink: 0 }}>
        <div>
          <h2 className="sa-panel-title">Platform actions</h2>
          <p className="sa-panel-desc">Platform grant and revoke audit trail.</p>
        </div>
      </div>

      <div className="sa-scroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <form className="sa-card" onSubmit={runAuditReport} style={{ flexShrink: 0 }}>
          <div className="sa-card-body">
            <div className="sa-toolbar" style={{ flexWrap: 'wrap', gap: 12, marginBottom: 16, alignItems: 'flex-end' }}>
              <div className="sa-field">
                <label htmlFor="audit-from">From</label>
                <input id="audit-from" className="sa-input" type="date" value={auditFrom} onChange={(e) => setAuditFrom(e.target.value)} />
              </div>
              <div className="sa-field">
                <label htmlFor="audit-to">To</label>
                <input id="audit-to" className="sa-input" type="date" value={auditTo} onChange={(e) => setAuditTo(e.target.value)} />
              </div>
              <div className="sa-field">
                <label htmlFor="audit-scope">Scope</label>
                <select id="audit-scope" className="sa-select" value={auditScope} onChange={(e) => setAuditScope(e.target.value)}>
                  <option value="">All</option>
                  <option value="user">User</option>
                  <option value="workspace">Workspace</option>
                </select>
              </div>
              <div className="sa-field">
                <label htmlFor="audit-type">Type</label>
                <select id="audit-type" className="sa-select" value={auditType} onChange={(e) => setAuditType(e.target.value)}>
                  <option value="">All</option>
                  <option value="platform_grant">Grant</option>
                  <option value="platform_revoke">Revoke</option>
                </select>
              </div>
              <div className="sa-field" style={{ alignSelf: 'flex-end' }}>
                <label aria-hidden style={{ visibility: 'hidden' }}>Run</label>
                <button type="submit" className="sa-btn sa-btn--primary" disabled={auditLoading}>
                  {auditLoading ? 'Loading…' : 'Load audit log'}
                </button>
              </div>
            </div>
            {auditError && <div className="sa-alert sa-alert--error">{auditError}</div>}
          </div>
        </form>

        {!audit && !auditLoading && !auditError && (
          <div className="sa-empty">
            <Shield className="sa-empty-icon" size={36} />
            Load platform grant and revoke actions for the selected period.
          </div>
        )}

        {auditLoading && <div className="sa-loading"><span className="sa-spinner" /> Loading audit log…</div>}

        {audit?.transactions?.length > 0 && !auditLoading && (
          <div className="sa-card" style={{ marginTop: 16 }}>
            <div className="sa-card-header">
              <h3>Platform actions <span className="sa-card-header-count">{audit.pagination?.total ?? audit.transactions.length}</span></h3>
            </div>
            <div className="sa-card-body sa-scroll" style={{ maxHeight: 420 }}>
              {audit.transactions.map((tx) => {
                const isGrant = tx.type === 'platform_grant'
                const target = tx.scope === 'workspace'
                  ? (tx.workspace?.name || 'Workspace')
                  : (tx.user?.email || tx.user?.name || 'User')
                return (
                  <div key={tx.id} className="sa-tx-row">
                    <div className="sa-tx-body">
                      <div className="sa-tx-top">
                        <span className="sa-tx-type" style={{ color: isGrant ? '#22c55e' : '#ef4444' }}>
                          {txTypeLabel(tx.type)}
                        </span>
                        <span className="sa-tx-ref">{target}</span>
                      </div>
                      <div className="sa-tx-bottom">
                        <span className="sa-tx-date">
                          {formatDate(tx.createdAt)}
                          {tx.actor ? ` · by ${tx.actor.name || tx.actor.email}` : ''}
                        </span>
                      </div>
                    </div>
                    <span className={`sa-tx-amount ${isGrant ? 'sa-amount--positive' : 'sa-amount--negative'}`}>
                      {isGrant ? '+' : ''}{formatAc(tx.amount)}
                    </span>
                  </div>
                )
              })}
            </div>
            {audit.pagination?.totalPages > 1 && (
              <div className="sa-pagination">
                <span>Page {audit.pagination.page} of {audit.pagination.totalPages}</span>
                <div className="sa-toolbar">
                  <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" disabled={auditPage <= 1}
                    onClick={() => runAuditReport(undefined, auditPage - 1)}><ChevronLeft size={14} /></button>
                  <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" disabled={auditPage >= audit.pagination.totalPages}
                    onClick={() => runAuditReport(undefined, auditPage + 1)}><ChevronRight size={14} /></button>
                </div>
              </div>
            )}
          </div>
        )}

        {audit?.transactions?.length === 0 && !auditLoading && (
          <div className="sa-empty">No platform actions in this period.</div>
        )}
      </div>
    </div>
  )
}

export default SuperadminPlatformActionsPanel
