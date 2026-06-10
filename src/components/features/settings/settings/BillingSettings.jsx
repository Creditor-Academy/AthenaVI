import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  MdOutlineBolt,
  MdTrendingUp,
  MdHistory,
  MdRefresh,
  MdSwapHoriz,
  MdAccountBalanceWallet,
} from 'react-icons/md'
import creditsService from '../../../../services/creditsService.js'
import workspaceService from '../../../../services/workspaceService.js'
import { readRole } from '../../../../pages/TeamWorkspace/workspaceUtils.js'
import {
  formatCreditAmount,
  formatCreditTransactionType,
  isTeamWorkspaceType,
  sumUsageCredits,
} from '../../../../utils/creditTransactions.js'

function BillingSettings() {
  const [workspaces, setWorkspaces] = useState([])
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('')
  const [personalCredits, setPersonalCredits] = useState(null)
  const [workspaceCredits, setWorkspaceCredits] = useState(null)
  const [workspaceType, setWorkspaceType] = useState('')
  const [history, setHistory] = useState([])
  const [historyPage, setHistoryPage] = useState(1)
  const [historyPagination, setHistoryPagination] = useState({ totalPages: 1, total: 0 })
  const [allocateAmount, setAllocateAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [actionMessage, setActionMessage] = useState('')

  const selectedWorkspace = useMemo(
    () => workspaces.find((ws) => String(ws.id) === String(selectedWorkspaceId)),
    [workspaces, selectedWorkspaceId]
  )

  const workspaceRole = useMemo(
    () => (selectedWorkspace ? readRole(selectedWorkspace) : 'MEMBER'),
    [selectedWorkspace]
  )

  const isTeamWorkspace = isTeamWorkspaceType(workspaceType || selectedWorkspace?.type)
  const canAllocate = isTeamWorkspace && workspaceRole === 'OWNER'
  const balancesReady = personalCredits != null

  const loadHistory = useCallback(async (workspaceId, page = 1, typeHint = '') => {
    setHistoryLoading(true)
    try {
      const workspace = workspaces.find((ws) => String(ws.id) === String(workspaceId))
      const resolvedType = typeHint || workspaceType || workspace?.type || ''
      let result

      if (!workspaceId || !isTeamWorkspaceType(resolvedType)) {
        result = await creditsService.getPersonalHistory({ page, limit: 10 })
      } else {
        const role = workspace ? readRole(workspace) : 'MEMBER'
        result =
          role === 'OWNER' || role === 'ADMIN'
            ? await creditsService.getWorkspaceHistory(workspaceId, { page, limit: 10 })
            : await creditsService.getMyWorkspaceHistory(workspaceId, { page, limit: 10 })
      }

      setHistory(result.transactions)
      setHistoryPagination(result.pagination)
      setHistoryPage(page)
    } finally {
      setHistoryLoading(false)
    }
  }, [workspaces, workspaceType])

  const loadWorkspaceContext = useCallback(async (workspaceId) => {
    if (!workspaceId) {
      const personal = await creditsService.getPersonalBalance()
      setPersonalCredits(personal.personalCredits)
      setWorkspaceCredits(null)
      setWorkspaceType('')
      await loadHistory(null, 1)
      return
    }

    const data = await creditsService.getWorkspaceBalance(workspaceId)
    setPersonalCredits(data.personalCredits)
    setWorkspaceCredits(data.workspaceCredits)
    setWorkspaceType(data.workspaceType)
    await loadHistory(workspaceId, 1, data.workspaceType)
  }, [loadHistory])

  const refreshAll = useCallback(async () => {
    setLoading(true)
    setError('')
    setActionMessage('')
    try {
      await loadWorkspaceContext(selectedWorkspaceId || null)
    } catch (err) {
      setError(err.message || 'Failed to load billing data')
    } finally {
      setLoading(false)
    }
  }, [loadWorkspaceContext, selectedWorkspaceId])

  useEffect(() => {
    let cancelled = false

    async function init() {
      setLoading(true)
      setError('')
      try {
        const [workspaceList, personal] = await Promise.all([
          workspaceService.listWorkspaces(),
          creditsService.getPersonalBalance(),
        ])
        if (cancelled) return

        setWorkspaces(workspaceList)
        setPersonalCredits(personal.personalCredits)

        const defaultWorkspace =
          workspaceList.find((ws) => String(ws.type || '').toUpperCase() === 'PRIVATE') ||
          workspaceList[0]
        const workspaceId = defaultWorkspace?.id || ''
        setSelectedWorkspaceId(workspaceId)

        if (workspaceId) {
          const data = await creditsService.getWorkspaceBalance(workspaceId)
          if (cancelled) return
          setWorkspaceCredits(data.workspaceCredits)
          setWorkspaceType(data.workspaceType)
          setPersonalCredits(data.personalCredits)
          await loadHistory(workspaceId, 1, data.workspaceType)
        } else {
          await loadHistory(null, 1)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load billing data')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [loadHistory])

  const handleWorkspaceChange = async (workspaceId) => {
    setSelectedWorkspaceId(workspaceId)
    setError('')
    setActionMessage('')
    try {
      await loadWorkspaceContext(workspaceId || null)
    } catch (err) {
      setError(err.message || 'Failed to load workspace credits')
    }
  }

  const handleAllocate = async (mode) => {
    const amount = Number(allocateAmount)
    if (!selectedWorkspaceId || !Number.isInteger(amount) || amount <= 0) {
      setError('Enter a positive whole number of credits.')
      return
    }

    setActionLoading(true)
    setError('')
    setActionMessage('')
    try {
      if (mode === 'allocate') {
        await creditsService.allocate(selectedWorkspaceId, amount)
        setActionMessage(`Allocated ${amount.toLocaleString()} credits to workspace.`)
      } else {
        await creditsService.deallocate(selectedWorkspaceId, amount)
        setActionMessage(`Returned ${amount.toLocaleString()} credits to your personal balance.`)
      }
      setAllocateAmount('')
      await loadWorkspaceContext(selectedWorkspaceId)
    } catch (err) {
      setError(err.message || 'Credit transfer failed')
    } finally {
      setActionLoading(false)
    }
  }

  const monthlyUsage = useMemo(() => sumUsageCredits(history), [history])

  const formatDate = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="settings-section">
      <header className="settings-section-header billing-header-row">
        <div>
          <h3>Billing</h3>
          <p>View balances, transfer credits to team workspaces, and review usage history.</p>
        </div>
        <button type="button" className="billing-refresh-btn" onClick={refreshAll} disabled={loading || actionLoading}>
          <MdRefresh size={16} />
          Refresh
        </button>
      </header>

      {error && <div className="billing-alert billing-alert-error">{error}</div>}
      {actionMessage && <div className="billing-alert billing-alert-success">{actionMessage}</div>}

      <div className="settings-flow">
        {workspaces.length > 1 && (
          <div className="billing-workspace-picker">
            <label htmlFor="billing-workspace-select">Workspace context</label>
            <select
              id="billing-workspace-select"
              value={selectedWorkspaceId}
              onChange={(event) => handleWorkspaceChange(event.target.value)}
            >
              {workspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name || 'Workspace'} ({String(workspace.type || 'workspace').toLowerCase()})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={`billing-stats-grid ${isTeamWorkspace ? 'billing-stats-grid--team' : 'billing-stats-grid--personal'}`}>
          <article className="billing-stat">
            <span className="billing-stat-icon"><MdAccountBalanceWallet /></span>
            <div>
              <h4>{!balancesReady ? '—' : Number(personalCredits).toLocaleString()}</h4>
              <p>Personal credits</p>
              <span className="billing-stat-hint">Voices, avatars, and private workspace usage</span>
            </div>
          </article>

          {isTeamWorkspace && (
            <article className="billing-stat">
              <span className="billing-stat-icon"><MdOutlineBolt /></span>
              <div>
                <h4>{!balancesReady ? '—' : Number(workspaceCredits ?? 0).toLocaleString()}</h4>
                <p>Workspace credits</p>
                <span className="billing-stat-hint">
                  {selectedWorkspace?.name || 'This workspace'} — videos and exports
                </span>
              </div>
            </article>
          )}

          <article className="billing-stat">
            <span className="billing-stat-icon"><MdTrendingUp /></span>
            <div>
              <h4>{historyLoading ? '—' : monthlyUsage.toLocaleString()}</h4>
              <p>Recent usage</p>
              <span className="billing-stat-hint">Usage charges in the history below</span>
            </div>
          </article>
        </div>

        {canAllocate && (
          <div className="billing-allocate-card">
            <div className="billing-allocate-header">
              <MdSwapHoriz size={20} />
              <div>
                <h4>Transfer credits</h4>
                <p>Move credits between your personal balance and this team workspace.</p>
              </div>
            </div>
            <div className="billing-allocate-form">
              <input
                type="number"
                min="1"
                step="1"
                placeholder="Amount (AC)"
                value={allocateAmount}
                onChange={(event) => setAllocateAmount(event.target.value)}
              />
              <button
                type="button"
                className="btn-premium btn-premium-primary"
                disabled={actionLoading}
                onClick={() => handleAllocate('allocate')}
              >
                Allocate to workspace
              </button>
              <button
                type="button"
                className="btn-premium btn-premium-ghost"
                disabled={actionLoading}
                onClick={() => handleAllocate('deallocate')}
              >
                Return to personal
              </button>
            </div>
          </div>
        )}

        <div className="billing-invoices">
          <div className="billing-invoices-header">
            <h4>
              <MdHistory size={18} style={{ verticalAlign: 'text-bottom', marginRight: 6 }} />
              Credit history
            </h4>
          </div>

          {historyLoading ? (
            <p className="billing-empty-text">Loading history…</p>
          ) : history.length === 0 ? (
            <p className="billing-empty-text">No credit transactions yet.</p>
          ) : (
            <div className="billing-history-table-wrap">
              <table className="billing-history-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Reference</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((tx) => (
                    <tr key={tx.id}>
                      <td>{formatCreditTransactionType(tx.type)}</td>
                      <td>{tx.reference || '—'}</td>
                      <td>{formatDate(tx.createdAt)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {formatCreditAmount(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {historyPagination.totalPages > 1 && (
            <div className="billing-history-pagination">
              <button
                type="button"
                className="btn-premium btn-premium-ghost"
                disabled={historyPage <= 1 || historyLoading}
                onClick={() => loadHistory(selectedWorkspaceId || null, historyPage - 1, workspaceType)}
              >
                Previous
              </button>
              <span>
                Page {historyPage} of {historyPagination.totalPages}
              </span>
              <button
                type="button"
                className="btn-premium btn-premium-ghost"
                disabled={historyPage >= historyPagination.totalPages || historyLoading}
                onClick={() => loadHistory(selectedWorkspaceId || null, historyPage + 1, workspaceType)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BillingSettings
