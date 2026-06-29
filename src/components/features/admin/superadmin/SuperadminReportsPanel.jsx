import { useState, useEffect } from 'react'
import { BarChart3 } from 'lucide-react'
import superadminService from '../../../../services/superadminService'
import { defaultReportRange, formatAc, formatDate, isValidUuid } from './superadminUtils'
import '../../../../pages/AdminPortal/SuperadminPortal.css'

function SuperadminReportsPanel() {
  const initial = defaultReportRange()

  // Usage report state
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

  // Auto-load on mount
  useEffect(() => {
    runUsageReport()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="sa-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="sa-panel-header" style={{ flexShrink: 0 }}>
        <div>
          <h2 className="sa-panel-title">Usage reports</h2>
          <p className="sa-panel-desc">Credit usage analytics and metrics.</p>
        </div>
      </div>

      <div className="sa-scroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <form className="sa-card" onSubmit={runUsageReport} style={{ flexShrink: 0 }}>
          <div className="sa-card-body">
            <div className="sa-toolbar" style={{ flexWrap: 'wrap', gap: 12, marginBottom: 16, alignItems: 'flex-end' }}>
              <div className="sa-field">
                <label htmlFor="report-from">From</label>
                <input id="report-from" className="sa-input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div className="sa-field">
                <label htmlFor="report-to">To</label>
                <input id="report-to" className="sa-input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
              <div className="sa-field" style={{ alignSelf: 'flex-end' }}>
                <label aria-hidden style={{ visibility: 'hidden' }}>Run</label>
                <button type="submit" className="sa-btn sa-btn--primary" disabled={usageLoading}>
                  {usageLoading ? 'Loading…' : 'Run report'}
                </button>
              </div>
              <button 
                type="button" 
                className="sa-btn sa-btn--ghost" 
                onClick={() => setShowAdvanced(!showAdvanced)}
                style={{ fontSize: '0.8rem', padding: '0 12px', height: 32 }}
              >
                {showAdvanced ? 'Hide advanced' : 'Advanced options'}
              </button>
            </div>
            
            {showAdvanced && (
              <div className="sa-toolbar" style={{ flexWrap: 'wrap', gap: 12, marginBottom: 16, paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
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
              </div>
            )}
            
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
            <div className="sa-metrics" style={{ marginTop: 16 }}>
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
              <div className="sa-card" style={{ marginTop: 16 }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
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
              <div className="sa-card" style={{ marginTop: 16 }}>
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
      </div>
    </div>
  )
}

export default SuperadminReportsPanel
