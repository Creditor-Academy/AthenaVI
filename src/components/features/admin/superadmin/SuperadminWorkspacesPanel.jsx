import { useState } from 'react'
import { Building2, Search } from 'lucide-react'
import superadminService, { SuperadminApiError } from '../../../../services/superadminService'
import { formatAc, isValidUuid } from './superadminUtils'
import '../../../../pages/AdminPortal/SuperadminPortal.css'

function SuperadminWorkspacesPanel() {
  const [workspaceIdInput, setWorkspaceIdInput] = useState('')
  const [workspaceId, setWorkspaceId] = useState('')
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [grantAmount, setGrantAmount] = useState('')
  const [grantReason, setGrantReason] = useState('')
  const [grantLoading, setGrantLoading] = useState(false)
  const [grantMessage, setGrantMessage] = useState('')
  const [grantError, setGrantError] = useState('')

  const loadWorkspace = async (id) => {
    const trimmed = id.trim()
    if (!isValidUuid(trimmed)) {
      setError('Enter a valid workspace UUID.')
      return
    }
    setLoading(true)
    setError('')
    setGrantMessage('')
    setGrantError('')
    setWorkspaceId(trimmed)
    try {
      const data = await superadminService.getWorkspaceCredits(trimmed)
      setSummary(data)
    } catch (err) {
      setSummary(null)
      setError(
        err instanceof SuperadminApiError && err.status === 404
          ? 'Workspace not found.'
          : err.message || 'Failed to load workspace'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleLookup = (e) => {
    e.preventDefault()
    loadWorkspace(workspaceIdInput)
  }

  const handleGrant = async (e) => {
    e.preventDefault()
    if (!workspaceId) return
    const amount = parseInt(grantAmount, 10)
    if (!amount || amount <= 0) return

    setGrantLoading(true)
    setGrantError('')
    setGrantMessage('')
    try {
      const result = await superadminService.grantWorkspaceCredits(workspaceId, {
        amount,
        reason: grantReason.trim() || undefined,
      })
      setGrantMessage(
        `Topped up ${formatAc(amount)}. Pool balance: ${formatAc(result.workspace?.workspaceCredits)}`
      )
      setGrantAmount('')
      setGrantReason('')
      const refreshed = await superadminService.getWorkspaceCredits(workspaceId)
      setSummary(refreshed)
    } catch (err) {
      setGrantError(err.message || 'Grant failed')
    } finally {
      setGrantLoading(false)
    }
  }

  return (
    <div className="sa-panel">
      <div className="sa-panel-header">
        <div>
          <h2 className="sa-panel-title">Workspace pools</h2>
          <p className="sa-panel-desc">
            Look up a TEAM workspace by ID to view its shared credit pool and top it up directly.
          </p>
        </div>
      </div>

      <form className="sa-lookup-row" onSubmit={handleLookup} style={{ marginBottom: 4 }}>
        <label className="sa-search-field sa-search-field--wide">
          <Search className="sa-search-field-icon" size={15} strokeWidth={2} aria-hidden />
          <input
            className="sa-input"
            type="text"
            placeholder="Workspace UUID…"
            value={workspaceIdInput}
            onChange={(e) => setWorkspaceIdInput(e.target.value)}
            aria-label="Workspace ID"
          />
        </label>
        <button type="submit" className="sa-btn sa-btn--primary" disabled={loading}>
          {loading ? 'Loading…' : 'Look up'}
        </button>
      </form>

      {error && <div className="sa-alert sa-alert--error">{error}</div>}

      {!summary && !loading && !error && (
        <div className="sa-empty">
          <Building2 className="sa-empty-icon" size={36} />
          Enter a workspace UUID to view its credit pool.
        </div>
      )}

      {loading && (
        <div className="sa-loading"><span className="sa-spinner" /> Loading workspace…</div>
      )}

      {summary && !loading && (
        <div className="sa-card sa-card--detail">
          <div className="sa-card-body sa-scroll">
            <div className="sa-detail-hero">
              <div>
                <h3 className="sa-detail-name">{summary.name}</h3>
                <p className="sa-detail-email">{summary.workspaceId}</p>
              </div>
              <div className="sa-stat-pill">
                <span className="sa-stat-pill-label">Pool balance</span>
                <span className="sa-stat-pill-value">{formatAc(summary.workspaceCredits)}</span>
              </div>
            </div>

            <div className="sa-workspace-meta">
              <div className="sa-meta-item">
                <span>Type</span>
                <strong>{summary.type || 'TEAM'}</strong>
              </div>
              <div className="sa-meta-item">
                <span>Members</span>
                <strong>{summary.memberCount ?? '—'}</strong>
              </div>
              <div className="sa-meta-item">
                <span>Owner</span>
                <strong>{summary.owner?.name || summary.owner?.email || '—'}</strong>
              </div>
              <div className="sa-meta-item">
                <span>Owner balance</span>
                <strong>{formatAc(summary.owner?.personalCredits)}</strong>
              </div>
            </div>

            {grantMessage && <div className="sa-alert sa-alert--success">{grantMessage}</div>}
            {grantError && <div className="sa-alert sa-alert--error">{grantError}</div>}

            <div className="sa-action-card sa-action-card--grant" style={{ maxWidth: 420 }}>
              <div className="sa-action-card-head">
                <span>Top up workspace pool</span>
              </div>
              <form className="sa-action-form" onSubmit={handleGrant}>
                <div className="sa-field">
                  <label htmlFor="ws-grant-amount">Amount (AC)</label>
                  <input
                    id="ws-grant-amount"
                    className="sa-input"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g. 5000"
                    value={grantAmount}
                    onChange={(e) => setGrantAmount(e.target.value)}
                    disabled={grantLoading}
                    required
                  />
                </div>
                <div className="sa-field">
                  <label htmlFor="ws-grant-reason">Reason (optional)</label>
                  <textarea
                    id="ws-grant-reason"
                    placeholder="Enterprise top-up, support credit…"
                    maxLength={500}
                    value={grantReason}
                    onChange={(e) => setGrantReason(e.target.value)}
                    disabled={grantLoading}
                  />
                </div>
                <button type="submit" className="sa-btn sa-btn--primary sa-btn--sm" disabled={grantLoading}>
                  {grantLoading ? 'Processing…' : 'Grant to pool'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperadminWorkspacesPanel
