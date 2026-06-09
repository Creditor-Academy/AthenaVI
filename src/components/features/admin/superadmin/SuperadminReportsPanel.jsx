import { useState } from 'react'
import { BarChart3 } from 'lucide-react'
import superadminService from '../../../../services/superadminService'
import { defaultReportRange, formatAc, isValidUuid } from './superadminUtils'
import '../../../../pages/AdminPortal/SuperadminPortal.css'

function SuperadminReportsPanel() {
  const initial = defaultReportRange()
  const [from, setFrom] = useState(initial.from)
  const [to, setTo] = useState(initial.to)
  const [userId, setUserId] = useState('')
  const [workspaceId, setWorkspaceId] = useState('')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const runReport = async (e) => {
    e?.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (userId.trim() && !isValidUuid(userId.trim())) {
        throw new Error('User ID must be a valid UUID when provided.')
      }
      if (workspaceId.trim() && !isValidUuid(workspaceId.trim())) {
        throw new Error('Workspace ID must be a valid UUID when provided.')
      }
      const data = await superadminService.getUsageReport({
        from: from || undefined,
        to: to || undefined,
        userId: userId.trim() || undefined,
        workspaceId: workspaceId.trim() || undefined,
      })
      setReport(data.report || data)
    } catch (err) {
      setReport(null)
      setError(err.message || 'Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="sa-panel">
      <div className="sa-panel-header">
        <div>
          <h2 className="sa-panel-title">Usage reports</h2>
          <p className="sa-panel-desc">
            Aggregate credit usage across the platform — renders, HeyGen, and other consumption.
          </p>
        </div>
      </div>

      <form className="sa-card" onSubmit={runReport}>
        <div className="sa-card-body sa-scroll">
          <div className="sa-toolbar" style={{ flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div className="sa-field">
              <label htmlFor="report-from">From</label>
              <input
                id="report-from"
                className="sa-input"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div className="sa-field">
              <label htmlFor="report-to">To</label>
              <input
                id="report-to"
                className="sa-input"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div className="sa-field">
              <label htmlFor="report-user">User ID (optional)</label>
              <input
                id="report-user"
                className="sa-input sa-input--wide"
                type="text"
                placeholder="Filter by user UUID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
            <div className="sa-field">
              <label htmlFor="report-ws">Workspace ID (optional)</label>
              <input
                id="report-ws"
                className="sa-input sa-input--wide"
                type="text"
                placeholder="Filter by workspace UUID"
                value={workspaceId}
                onChange={(e) => setWorkspaceId(e.target.value)}
              />
            </div>
            <div className="sa-field" style={{ alignSelf: 'flex-end' }}>
              <label aria-hidden style={{ visibility: 'hidden' }}>Run</label>
              <button type="submit" className="sa-btn sa-btn--primary" disabled={loading}>
                {loading ? 'Loading…' : 'Run report'}
              </button>
            </div>
          </div>

          {error && <div className="sa-alert sa-alert--error">{error}</div>}
        </div>
      </form>

      {!report && !loading && !error && (
        <div className="sa-empty">
          <BarChart3 className="sa-empty-icon" size={36} />
          Set a date range and run a report to see usage metrics.
        </div>
      )}

      {loading && (
        <div className="sa-loading"><span className="sa-spinner" /> Generating report…</div>
      )}

      {report && !loading && (
        <div className="sa-metrics">
          <div className="sa-metric-card">
            <div className="sa-metric-card-label">Transactions</div>
            <div className="sa-metric-card-value">
              {new Intl.NumberFormat().format(report.transactionCount ?? 0)}
            </div>
            <div className="sa-metric-card-note">Usage events in range</div>
          </div>
          <div className="sa-metric-card">
            <div className="sa-metric-card-label">Total usage</div>
            <div className="sa-metric-card-value">{formatAc(report.totalUsageAc ?? 0)}</div>
            <div className="sa-metric-card-note">Credits consumed</div>
          </div>
          <div className="sa-metric-card">
            <div className="sa-metric-card-label">Est. HeyGen cost</div>
            <div className="sa-metric-card-value">
              ${Number(report.estimatedHeygenUsd ?? 0).toFixed(2)}
            </div>
            <div className="sa-metric-card-note">USD estimate for period</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperadminReportsPanel
