import { useState } from 'react'
import { BarChart3, Shield } from 'lucide-react'
import superadminService from '../../../../services/superadminService'
import { defaultReportRange, formatAc, formatDate, isValidUuid, txTypeLabel } from './superadminUtils'
import '../../../../pages/AdminPortal/SuperadminPortal.css'

function SuperadminReportsPanel() {
  const initial = defaultReportRange()
  const [reportTab, setReportTab] = useState('usage')

  // Usage report state
  const [from, setFrom] = useState(initial.from)
  const [to, setTo] = useState(initial.to)
  const [userId, setUserId] = useState('')
  const [workspaceId, setWorkspaceId] = useState('')
  const [topLimit, setTopLimit] = useState(10)
  const [report, setReport] = useState(null)
  const [usageLoading, setUsageLoading] = useState(false)
  const [usageError, setUsageError] = useState('')

  // Platform actions state
  const [auditFrom, setAuditFrom] = useState(initial.from)
  const [auditTo, setAuditTo] = useState(initial.to)
  const [auditScope, setAuditScope] = useState('')
  const [auditType, setAuditType] = useState('')
  const [auditPage, setAuditPage] = useState(1)
  const [audit, setAudit] = useState(null)
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditError, setAuditError] = useState('')

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

  return (
    <div className="sa-panel">
      <div className="sa-panel-header">
        <div>
          <h2 className="sa-panel-title">Reports &amp; audit</h2>
          <p className="sa-panel-desc">Credit usage analytics and platform grant/revoke audit trail.</p>
        </div>
      </div>

      <div className="sa-tab-bar" role="tablist">
        <button type="button" role="tab" aria-selected={reportTab === 'usage'}
          className={`sa-tab ${reportTab === 'usage' ? 'sa-tab--active' : ''}`}
          onClick={() => setReportTab('usage')}>
          <BarChart3 size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
          Usage report
        </button>
        <button type="button" role="tab" aria-selected={reportTab === 'audit'}
          className={`sa-tab ${reportTab === 'audit' ? 'sa-tab--active' : ''}`}
          onClick={() => setReportTab('audit')}>
          <Shield size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
          Platform actions
        </button>
      </div>

      {reportTab === 'usage' && (
        <>
          <form className="sa-card" onSubmit={runUsageReport}>
            <div className="sa-card-body">
              <div className="sa-toolbar" style={{ flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                <div className="sa-field">
                  <label htmlFor="report-from">From</label>
                  <input id="report-from" className="sa-input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                </div>
                <div className="sa-field">
                  <label htmlFor="report-to">To</label>
                  <input id="report-to" className="sa-input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                </div>
                <div className="sa-field">
                  <label htmlFor="report-top">Top N</label>
                  <input id="report-top" className="sa-input" type="number" min="1" max="25" value={topLimit} onChange={(e) => setTopLimit(Number(e.target.value) || 10)} />
                </div>
                <div className="sa-field">
                  <label htmlFor="report-user">User ID (optional)</label>
                  <input id="report-user" className="sa-input sa-input--wide" type="text" placeholder="UUID" value={userId} onChange={(e) => setUserId(e.target.value)} />
                </div>
                <div className="sa-field">
                  <label htmlFor="report-ws">Workspace ID (optional)</label>
                  <input id="report-ws" className="sa-input sa-input--wide" type="text" placeholder="UUID" value={workspaceId} onChange={(e) => setWorkspaceId(e.target.value)} />
                </div>
                <div className="sa-field" style={{ alignSelf: 'flex-end' }}>
                  <label aria-hidden style={{ visibility: 'hidden' }}>Run</label>
                  <button type="submit" className="sa-btn sa-btn--primary" disabled={usageLoading}>
                    {usageLoading ? 'Loading…' : 'Run report'}
                  </button>
                </div>
              </div>
              {usageError && <div className="sa-alert sa-alert--error">{usageError}</div>}
            </div>
          </form>

          {!report && !usageLoading && !usageError && (
            <div className="sa-empty">
              <BarChart3 className="sa-empty-icon" size={36} />
              Set a date range and run a report to see usage metrics.
            </div>
          )}

          {usageLoading && <div className="sa-loading"><span className="sa-spinner" /> Generating report…</div>}

          {report && !usageLoading && (
            <>
              <div className="sa-metrics">
                <div className="sa-metric-card">
                  <div className="sa-metric-card-label">Transactions</div>
                  <div className="sa-metric-card-value">{new Intl.NumberFormat().format(report.transactionCount ?? 0)}</div>
                </div>
                <div className="sa-metric-card">
                  <div className="sa-metric-card-label">Total usage</div>
                  <div className="sa-metric-card-value">{formatAc(report.totalUsageAc ?? 0)}</div>
                </div>
                <div className="sa-metric-card">
                  <div className="sa-metric-card-label">Est. HeyGen cost</div>
                  <div className="sa-metric-card-value">${Number(report.estimatedHeygenUsd ?? 0).toFixed(2)}</div>
                </div>
              </div>

              {report.byFeature?.length > 0 && (
                <div className="sa-card" style={{ marginTop: 12 }}>
                  <div className="sa-card-header"><h3>Usage by feature</h3></div>
                  <div className="sa-card-body sa-scroll" style={{ maxHeight: 280 }}>
                    {report.byFeature.map((row) => (
                      <div key={row.feature} className="sa-tx-row">
                        <div className="sa-tx-body">
                          <div className="sa-tx-top"><span className="sa-tx-type">{row.label || row.feature}</span></div>
                          <div className="sa-tx-bottom"><span className="sa-tx-date">{row.transactionCount} events</span></div>
                        </div>
                        <span className="sa-tx-amount sa-amount--negative">{formatAc(row.totalUsageAc)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                {report.topUsers?.length > 0 && (
                  <div className="sa-card">
                    <div className="sa-card-header"><h3>Top users</h3></div>
                    <div className="sa-card-body">
                      {report.topUsers.map((u) => (
                        <div key={u.userId} className="sa-tx-row">
                          <div className="sa-tx-body">
                            <div className="sa-tx-top"><span className="sa-tx-type">{u.name || u.email || u.userId}</span></div>
                          </div>
                          <span className="sa-tx-amount sa-amount--negative">{formatAc(u.totalUsageAc)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {report.topWorkspaces?.length > 0 && (
                  <div className="sa-card">
                    <div className="sa-card-header"><h3>Top workspaces</h3></div>
                    <div className="sa-card-body">
                      {report.topWorkspaces.map((w) => (
                        <div key={w.workspaceId} className="sa-tx-row">
                          <div className="sa-tx-body">
                            <div className="sa-tx-top"><span className="sa-tx-type">{w.name || w.workspaceId}</span></div>
                          </div>
                          <span className="sa-tx-amount sa-amount--negative">{formatAc(w.totalUsageAc)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {report.byDay?.length > 0 && (
                <div className="sa-card" style={{ marginTop: 12 }}>
                  <div className="sa-card-header"><h3>Daily usage</h3></div>
                  <div className="sa-card-body sa-scroll" style={{ maxHeight: 240 }}>
                    {report.byDay.map((day) => (
                      <div key={day.date} className="sa-tx-row">
                        <div className="sa-tx-body">
                          <div className="sa-tx-top"><span className="sa-tx-type">{day.date}</span></div>
                          <div className="sa-tx-bottom"><span className="sa-tx-date">{day.transactionCount} events</span></div>
                        </div>
                        <span className="sa-tx-amount sa-amount--negative">{formatAc(day.totalUsageAc)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {reportTab === 'audit' && (
        <>
          <form className="sa-card" onSubmit={runAuditReport}>
            <div className="sa-card-body">
              <div className="sa-toolbar" style={{ flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
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
            <div className="sa-card">
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
                      onClick={() => runAuditReport(undefined, auditPage - 1)}>Prev</button>
                    <button type="button" className="sa-btn sa-btn--sm sa-btn--ghost" disabled={auditPage >= audit.pagination.totalPages}
                      onClick={() => runAuditReport(undefined, auditPage + 1)}>Next</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {audit?.transactions?.length === 0 && !auditLoading && (
            <div className="sa-empty">No platform actions in this period.</div>
          )}
        </>
      )}
    </div>
  )
}

export default SuperadminReportsPanel
