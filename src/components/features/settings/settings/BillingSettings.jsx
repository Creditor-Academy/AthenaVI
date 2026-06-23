import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  MdTrendingUp,
  MdHistory,
  MdRefresh,
  MdSwapHoriz,
  MdAccountBalanceWallet,
  MdStorage,
  MdCheckCircle,
  MdError,
  MdReceiptLong,
  MdPerson,
  MdGroups,
  MdAccessTime,
  MdOutlineAdd,
  MdPendingActions,
} from 'react-icons/md'
import creditsService from '../../../../services/creditsService.js'
import storageService from '../../../../services/storageService.js'
import workspaceService from '../../../../services/workspaceService.js'
import { readRole } from '../../../../pages/TeamWorkspace/workspaceUtils.js'
import {
  formatCreditAmount,
  formatCreditTransactionType,
  formatCreditTransactionTitle,
  formatCreditTransactionSubtitle,
  formatCreditTransactionDuration,
  isTeamWorkspaceType,
  isPrivateWorkspaceType,
  sumUsageCredits,
} from '../../../../utils/creditTransactions.js'
import { formatBytes } from '../../../../utils/formatSize.js'
import { formatStorageTransactionType, formatStorageUpgradeStatus, formatStorageUpgradeUrgency, getStorageUpgradeStatusVariant } from '../../../../utils/storageQuota.js'
import StorageUsageBar from '../../../ui/StorageUsageBar/StorageUsageBar.jsx'
import '../../../ui/StorageUsageBar/StorageUsageBar.css'
import LoadingDots from '../../../ui/LoadingDots/LoadingDots.jsx'
import StorageRequestModal from './StorageRequestModal.jsx'
import './BillingSettings.css'
import './StorageRequestModal.css'

function getCreditTxBadgeVariant(type) {
  const key = String(type || '').toLowerCase()
  if (key === 'usage') return 'usage'
  if (['purchase', 'platform_grant', 'refund'].includes(key)) return 'credit'
  if (['allocation', 'deallocation', 'platform_revoke'].includes(key)) return 'transfer'
  return 'neutral'
}

function getWorkspaceTypeLabel(type) {
  const value = String(type || '').toUpperCase()
  if (value === 'TEAM' || value === 'WORKSPACE') return 'Team'
  if (value === 'PRIVATE' || value === 'PERSONAL') return 'Personal'
  return String(type || 'workspace').toLowerCase()
}

function CreditActivityCell({ tx, workspaceNameById }) {
  const contextOptions = { workspaceNameById }
  const title = formatCreditTransactionTitle(tx, contextOptions)
  const subtitle = formatCreditTransactionSubtitle(tx, contextOptions)
  const duration = formatCreditTransactionDuration(tx)

  return (
    <div className="billing-activity-cell">
      <span className="billing-activity-title">
        {title}
        {duration && (
          <span className="billing-duration-chip">
            <MdAccessTime size={11} aria-hidden />
            {duration}
          </span>
        )}
      </span>
      {subtitle && <span className="billing-activity-sub">{subtitle}</span>}
    </div>
  )
}

function getCreditAmountClass(amount) {
  const value = Number(amount || 0)
  if (value > 0) return 'billing-amount--positive'
  if (value < 0) return 'billing-amount--negative'
  return 'billing-amount--neutral'
}

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
  const [workspaceSwitching, setWorkspaceSwitching] = useState(false)
  const [error, setError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [historyTab, setHistoryTab] = useState('credits')
  const [showStorageRequestModal, setShowStorageRequestModal] = useState(false)

  const [personalStorage, setPersonalStorage] = useState(null)
  const [workspaceStorage, setWorkspaceStorage] = useState(null)
  const [storageHistory, setStorageHistory] = useState([])
  const [storageHistoryPage, setStorageHistoryPage] = useState(1)
  const [storageHistoryPagination, setStorageHistoryPagination] = useState({ totalPages: 1, total: 0 })
  const [storageHistoryLoading, setStorageHistoryLoading] = useState(false)
  const [upgradeRequests, setUpgradeRequests] = useState([])
  const [upgradeRequestsPage, setUpgradeRequestsPage] = useState(1)
  const [upgradeRequestsPagination, setUpgradeRequestsPagination] = useState({ totalPages: 1, total: 0 })
  const [upgradeRequestsLoading, setUpgradeRequestsLoading] = useState(false)

  const activeUpgradeRequest = personalStorage?.activeUpgradeRequest ?? null
  const hasPendingUpgradeRequest = String(activeUpgradeRequest?.status || '').toLowerCase() === 'pending'

  const workspacesRef = useRef(workspaces)
  useEffect(() => {
    workspacesRef.current = workspaces
  }, [workspaces])

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

  const workspaceNameById = useMemo(
    () =>
      Object.fromEntries(
        workspaces.map((ws) => [String(ws.id), ws.name || 'Workspace'])
      ),
    [workspaces]
  )

  const sortedWorkspaces = useMemo(
    () =>
      [...workspaces].sort((a, b) => {
        const aPersonal = isPrivateWorkspaceType(a.type) ? 0 : 1
        const bPersonal = isPrivateWorkspaceType(b.type) ? 0 : 1
        return aPersonal - bPersonal || String(a.name || '').localeCompare(String(b.name || ''))
      }),
    [workspaces]
  )

  const creditsBoxLoading = loading || workspaceSwitching || !balancesReady
  const usageBoxLoading = loading || workspaceSwitching || historyLoading

  const primaryCreditValue = useMemo(() => {
    if (!balancesReady) return null
    if (isTeamWorkspace) return Number(workspaceCredits ?? 0)
    return Number(personalCredits)
  }, [balancesReady, isTeamWorkspace, workspaceCredits, personalCredits])

  const loadStorageHistory = useCallback(async (page = 1) => {
    setStorageHistoryLoading(true)
    try {
      const result = await storageService.getPersonalHistory({ page, limit: 10 })
      setStorageHistory(result.transactions)
      setStorageHistoryPagination(result.pagination)
      setStorageHistoryPage(page)
    } finally {
      setStorageHistoryLoading(false)
    }
  }, [])

  const loadUpgradeRequests = useCallback(async (page = 1) => {
    setUpgradeRequestsLoading(true)
    try {
      const result = await storageService.getUpgradeRequests({ page, limit: 10 })
      setUpgradeRequests(result.requests)
      setUpgradeRequestsPagination(result.pagination)
      setUpgradeRequestsPage(page)
    } catch {
      setUpgradeRequests([])
      setUpgradeRequestsPagination({ totalPages: 1, total: 0 })
      setUpgradeRequestsPage(1)
    } finally {
      setUpgradeRequestsLoading(false)
    }
  }, [])

  const loadStorageContext = useCallback(async (workspaceId) => {
    const [personal, historyResult, requestsResult] = await Promise.all([
      storageService.getPersonalQuota(),
      storageService.getPersonalHistory({ page: 1, limit: 10 }),
      storageService.getUpgradeRequests({ page: 1, limit: 10 }).catch(() => ({
        requests: [],
        pagination: { totalPages: 1, total: 0, page: 1, limit: 10 },
      })),
    ])
    setPersonalStorage(personal)
    setStorageHistory(historyResult.transactions)
    setStorageHistoryPagination(historyResult.pagination)
    setStorageHistoryPage(1)
    setUpgradeRequests(requestsResult.requests)
    setUpgradeRequestsPagination(requestsResult.pagination)
    setUpgradeRequestsPage(1)

    if (workspaceId) {
      try {
        const wsStorage = await storageService.getWorkspaceStorage(workspaceId)
        setWorkspaceStorage(wsStorage)
      } catch {
        setWorkspaceStorage(null)
      }
    } else {
      setWorkspaceStorage(null)
    }
  }, [])

  const loadHistory = useCallback(async (workspaceId, page = 1, typeHint = '') => {
    setHistoryLoading(true)
    try {
      const workspace = workspacesRef.current.find((ws) => String(ws.id) === String(workspaceId))
      const resolvedType = typeHint || workspace?.type || ''
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
  }, [])

  const loadWorkspaceContext = useCallback(async (workspaceId) => {
    if (!workspaceId) {
      const personal = await creditsService.getPersonalBalance()
      setPersonalCredits(personal.personalCredits)
      setWorkspaceCredits(null)
      setWorkspaceType('')
      await Promise.all([loadHistory(null, 1), loadStorageContext(null)])
      return
    }

    const data = await creditsService.getWorkspaceBalance(workspaceId)
    setPersonalCredits(data.personalCredits)
    setWorkspaceCredits(data.workspaceCredits)
    setWorkspaceType(data.workspaceType)
    await Promise.all([
      loadHistory(workspaceId, 1, data.workspaceType),
      loadStorageContext(workspaceId),
    ])
  }, [loadHistory, loadStorageContext])

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
        const [workspaceList, personal, storage] = await Promise.all([
          workspaceService.listWorkspaces(),
          creditsService.getPersonalBalance(),
          storageService.getPersonalQuota(),
        ])
        if (cancelled) return

        workspacesRef.current = workspaceList
        setWorkspaces(workspaceList)
        setPersonalCredits(personal.personalCredits)
        setPersonalStorage(storage)

        const defaultWorkspace =
          workspaceList.find((ws) => isPrivateWorkspaceType(ws.type)) ||
          workspaceList[0]
        const workspaceId = defaultWorkspace?.id || ''
        setSelectedWorkspaceId(workspaceId)

        if (workspaceId) {
          const data = await creditsService.getWorkspaceBalance(workspaceId)
          if (cancelled) return
          setWorkspaceCredits(data.workspaceCredits)
          setWorkspaceType(data.workspaceType)
          setPersonalCredits(data.personalCredits)
          await Promise.all([
            loadHistory(workspaceId, 1, data.workspaceType),
            loadStorageContext(workspaceId),
          ])
        } else {
          await Promise.all([loadHistory(null, 1), loadStorageContext(null)])
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
    // Mount-only init — workspace switching is handled by handleWorkspaceChange.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleWorkspaceChange = async (workspaceId) => {
    if (String(workspaceId) === String(selectedWorkspaceId)) return
    setSelectedWorkspaceId(workspaceId)
    setError('')
    setActionMessage('')
    setWorkspaceSwitching(true)
    try {
      await loadWorkspaceContext(workspaceId || null)
    } catch (err) {
      setError(err.message || 'Failed to load workspace credits')
    } finally {
      setWorkspaceSwitching(false)
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
        setActionMessage(
          `Allocated ${amount.toLocaleString()} credits to ${selectedWorkspace?.name || 'workspace'}.`
        )
      } else {
        await creditsService.deallocate(selectedWorkspaceId, amount)
        setActionMessage(
          `Returned ${amount.toLocaleString()} credits from ${selectedWorkspace?.name || 'workspace'} to your personal balance.`
        )
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

  const renderCreditHistory = () => {
    if (historyLoading) {
      return <p className="billing-loading-row">Loading credit history…</p>
    }

    if (history.length === 0) {
      return (
        <div className="billing-empty-state">
          <span className="billing-empty-state-icon" aria-hidden><MdReceiptLong /></span>
          <p>No credit transactions yet.</p>
        </div>
      )
    }

    return (
      <>
        <div className="billing-history-table-wrap">
          <table className="billing-history-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Activity</th>
                <th>Date</th>
                <th className="col-amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              {history.map((tx) => (
                <tr key={tx.id}>
                  <td>
                    <span className={`billing-tx-badge billing-tx-badge--${getCreditTxBadgeVariant(tx.type)}`}>
                      {formatCreditTransactionType(tx.type)}
                    </span>
                  </td>
                  <td className="billing-activity-col">
                    <CreditActivityCell tx={tx} workspaceNameById={workspaceNameById} />
                  </td>
                  <td className="billing-date-cell">{formatDate(tx.createdAt)}</td>
                  <td className={`col-amount ${getCreditAmountClass(tx.amount)}`}>
                    {formatCreditAmount(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
            <span>Page {historyPage} of {historyPagination.totalPages}</span>
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
      </>
    )
  }

  const renderUpgradeRequests = () => {
    if (upgradeRequestsLoading) {
      return <p className="billing-loading-row">Loading upgrade requests…</p>
    }

    if (upgradeRequests.length === 0) {
      return (
        <div className="billing-empty-state">
          <span className="billing-empty-state-icon" aria-hidden><MdPendingActions /></span>
          <p>No storage upgrade requests yet.</p>
        </div>
      )
    }

    return (
      <>
        <div className="billing-history-table-wrap">
          <table className="billing-history-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Requested</th>
                <th>Submitted</th>
                <th>Workspace</th>
              </tr>
            </thead>
            <tbody>
              {upgradeRequests.map((req) => (
                <tr key={req.requestId}>
                  <td>
                    <span
                      className={`billing-tx-badge billing-tx-badge--${getStorageUpgradeStatusVariant(req.status)}`}
                    >
                      {formatStorageUpgradeStatus(req.status)}
                    </span>
                    {req.reviewNote && (
                      <span className="billing-upgrade-review-note">{req.reviewNote}</span>
                    )}
                  </td>
                  <td>
                    <span className="billing-upgrade-amount">
                      +{req.requestedAdditionalGb ?? '—'} GB
                    </span>
                    <span className="billing-upgrade-urgency">
                      {formatStorageUpgradeUrgency(req.urgency)}
                    </span>
                  </td>
                  <td className="billing-date-cell">
                    {formatDate(req.submittedAt)}
                    {req.reviewedAt && (
                      <span className="billing-upgrade-reviewed">
                        Reviewed {formatDate(req.reviewedAt)}
                      </span>
                    )}
                  </td>
                  <td>{req.workspaceName || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {upgradeRequestsPagination.totalPages > 1 && (
          <div className="billing-history-pagination">
            <button
              type="button"
              className="btn-premium btn-premium-ghost"
              disabled={upgradeRequestsPage <= 1 || upgradeRequestsLoading}
              onClick={() => loadUpgradeRequests(upgradeRequestsPage - 1)}
            >
              Previous
            </button>
            <span>Page {upgradeRequestsPage} of {upgradeRequestsPagination.totalPages}</span>
            <button
              type="button"
              className="btn-premium btn-premium-ghost"
              disabled={
                upgradeRequestsPage >= upgradeRequestsPagination.totalPages || upgradeRequestsLoading
              }
              onClick={() => loadUpgradeRequests(upgradeRequestsPage + 1)}
            >
              Next
            </button>
          </div>
        )}
      </>
    )
  }

  const renderStorageHistory = () => {
    if (storageHistoryLoading) {
      return <p className="billing-loading-row">Loading storage history…</p>
    }

    if (storageHistory.length === 0) {
      return (
        <div className="billing-empty-state">
          <span className="billing-empty-state-icon" aria-hidden><MdStorage /></span>
          <p>No storage transactions yet.</p>
        </div>
      )
    }

    return (
      <>
        <div className="billing-history-table-wrap">
          <table className="billing-history-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Tier</th>
                <th>Date</th>
                <th className="col-amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              {storageHistory.map((tx) => (
                <tr key={tx.id}>
                  <td>
                    <span className="billing-tx-badge billing-tx-badge--neutral">
                      {formatStorageTransactionType(tx.type)}
                    </span>
                  </td>
                  <td>{tx.tierId || '—'}</td>
                  <td className="billing-date-cell">{formatDate(tx.createdAt)}</td>
                  <td className="col-amount billing-amount--neutral">
                    {formatBytes(tx.amountBytes)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {storageHistoryPagination.totalPages > 1 && (
          <div className="billing-history-pagination">
            <button
              type="button"
              className="btn-premium btn-premium-ghost"
              disabled={storageHistoryPage <= 1 || storageHistoryLoading}
              onClick={() => loadStorageHistory(storageHistoryPage - 1)}
            >
              Previous
            </button>
            <span>Page {storageHistoryPage} of {storageHistoryPagination.totalPages}</span>
            <button
              type="button"
              className="btn-premium btn-premium-ghost"
              disabled={storageHistoryPage >= storageHistoryPagination.totalPages || storageHistoryLoading}
              onClick={() => loadStorageHistory(storageHistoryPage + 1)}
            >
              Next
            </button>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="settings-section">
      <header className="settings-section-header billing-header-row">
        <div>
          <h3>Billing &amp; Usage</h3>
          <p>Balances, storage, and activity for your account.</p>
        </div>
      </header>

      {error && (
        <div className="billing-alert billing-alert-error">
          <MdError size={18} aria-hidden />
          <span>{error}</span>
        </div>
      )}
      {actionMessage && (
        <div className="billing-alert billing-alert-success">
          <MdCheckCircle size={18} aria-hidden />
          <span>{actionMessage}</span>
        </div>
      )}

      <div className="settings-flow">
        <div className="billing-toolbar">
          <div className="billing-toolbar-context">
            {workspaces.length > 1 ? (
              <>
                <span className="billing-toolbar-label">Workspace</span>
                <div className="billing-workspace-chips" role="radiogroup" aria-label="Workspace context">
                  {sortedWorkspaces.map((workspace) => {
                    const isActive = String(workspace.id) === String(selectedWorkspaceId)
                    const isTeam = isTeamWorkspaceType(workspace.type)
                    const busy = actionLoading || workspaceSwitching

                    return (
                      <button
                        key={workspace.id}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        className={`billing-workspace-chip ${isActive ? 'active' : ''}`}
                        onClick={() => handleWorkspaceChange(workspace.id)}
                        disabled={busy}
                      >
                        <span className={`billing-workspace-chip-icon ${isTeam ? 'team' : 'personal'}`} aria-hidden>
                          {isTeam ? <MdGroups size={16} /> : <MdPerson size={16} />}
                        </span>
                        <span className="billing-workspace-chip-text">
                          <span className="billing-workspace-chip-name">
                            {workspace.name || 'Workspace'}
                          </span>
                          <span className="billing-workspace-chip-type">
                            {getWorkspaceTypeLabel(workspace.type)}
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </>
            ) : (
              <>
                <span className="billing-toolbar-label">Workspace</span>
                <span className="billing-workspace-single">
                  {selectedWorkspace?.name || 'Personal workspace'}
                </span>
              </>
            )}
          </div>
          <div className="billing-toolbar-actions">
            <button
              type="button"
              className="billing-refresh-btn"
              onClick={refreshAll}
              disabled={loading || actionLoading || workspaceSwitching}
            >
              <MdRefresh size={16} />
              Refresh
            </button>
          </div>
        </div>

        <div className="billing-summary-strip">
          <div className="billing-summary-hero">
            <span className="billing-summary-hero-label">
              {isTeamWorkspace ? 'Workspace credits' : 'Personal credits'}
            </span>
            <p className="billing-summary-hero-value">
              {creditsBoxLoading ? (
                <LoadingDots size="lg" className="billing-credit-loading" />
              ) : (
                primaryCreditValue.toLocaleString()
              )}
            </p>
            <p className="billing-summary-hero-sub">
              {isTeamWorkspace
                ? `${selectedWorkspace?.name || 'This workspace'} — videos and exports`
                : 'For voices, avatars, and exports'}
            </p>
          </div>

          <article className="billing-metric-card">
            <div className="billing-metric-card-top">
              <span className="billing-metric-card-label">Recent usage</span>
              <span className="billing-metric-card-icon" aria-hidden><MdTrendingUp /></span>
            </div>
            <p className="billing-metric-card-value">
              {usageBoxLoading ? (
                <LoadingDots size="md" className="billing-credit-loading" />
              ) : (
                monthlyUsage.toLocaleString()
              )}
            </p>
            <p className="billing-metric-card-hint">Credits used in loaded history</p>
          </article>
        </div>

        <div className="billing-panel">
          <div className="billing-panel-header">
            <span className="billing-panel-header-icon" aria-hidden><MdStorage /></span>
            <div>
              <h4>Storage quota</h4>
              {personalStorage?.tier?.label && (
                <span className="billing-plan-badge">{personalStorage.tier.label} plan</span>
              )}
            </div>
          </div>
          <div className="billing-panel-body">
            <StorageUsageBar
              loading={loading && !personalStorage}
              usedBytes={personalStorage?.usedBytes}
              limitBytes={personalStorage?.limitBytes}
              percentUsed={personalStorage?.percentUsed}
              label="Personal quota"
            />
            {workspaceStorage?.footprint ? (
              <p className="billing-footprint-note">
                <strong>{selectedWorkspace?.name || 'Workspace'} footprint:</strong>{' '}
                {formatBytes(workspaceStorage.footprint.totalBytes)}
                {workspaceStorage.owner?.name
                  ? ` · counts against ${workspaceStorage.owner.name}'s quota`
                  : ''}
              </p>
            ) : null}
            {hasPendingUpgradeRequest && activeUpgradeRequest && (
              <div className="billing-upgrade-active" role="status">
                <MdPendingActions size={18} aria-hidden />
                <div>
                  <strong>Upgrade request pending</strong>
                  <p>
                    You requested <strong>+{activeUpgradeRequest.requestedAdditionalGb} GB</strong>
                    {activeUpgradeRequest.submittedAt
                      ? ` on ${formatDate(activeUpgradeRequest.submittedAt)}`
                      : ''}
                    . An administrator will review it — you&apos;ll be contacted by email.
                  </p>
                </div>
              </div>
            )}
            <div className="billing-storage-actions">
              <button
                type="button"
                className="billing-storage-request-btn"
                onClick={() => setShowStorageRequestModal(true)}
                disabled={loading || workspaceSwitching || hasPendingUpgradeRequest}
                title={
                  hasPendingUpgradeRequest
                    ? 'You already have a pending storage upgrade request'
                    : undefined
                }
              >
                <MdOutlineAdd size={16} aria-hidden />
                Request more storage
              </button>
            </div>
          </div>
        </div>

        <StorageRequestModal
          isOpen={showStorageRequestModal}
          onClose={() => setShowStorageRequestModal(false)}
          personalStorage={personalStorage}
          selectedWorkspace={selectedWorkspace}
          workspaceStorage={workspaceStorage}
          activeUpgradeRequest={activeUpgradeRequest}
          onSubmitted={async () => {
            const personal = await storageService.getPersonalQuota()
            setPersonalStorage(personal)
            await loadUpgradeRequests(1)
            setHistoryTab('requests')
          }}
        />

        {canAllocate && (
          <div className="billing-panel">
            <div className="billing-panel-header">
              <span className="billing-panel-header-icon" aria-hidden><MdSwapHoriz /></span>
              <div>
                <h4>Transfer credits</h4>
              </div>
            </div>
            <div className="billing-panel-body">
              <div className="billing-transfer-form">
                <div className="billing-transfer-field">
                  <label htmlFor="billing-allocate-amount">Amount (AC)</label>
                  <input
                    id="billing-allocate-amount"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g. 500"
                    value={allocateAmount}
                    onChange={(event) => setAllocateAmount(event.target.value)}
                  />
                </div>
                <div className="billing-transfer-actions">
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
            </div>
          </div>
        )}

        <div className="billing-panel billing-history-panel">
          <div className="billing-panel-header">
            <span className="billing-panel-header-icon" aria-hidden><MdHistory /></span>
            <div>
              <h4>Transaction history</h4>
            </div>
          </div>

          <div className="billing-history-tabs" role="tablist" aria-label="Transaction history">
            <button
              type="button"
              role="tab"
              aria-selected={historyTab === 'credits'}
              className={`billing-history-tab ${historyTab === 'credits' ? 'active' : ''}`}
              onClick={() => setHistoryTab('credits')}
            >
              <MdAccountBalanceWallet size={16} aria-hidden />
              Credit history
              <span className="billing-history-tab-count">{historyPagination.total || history.length}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={historyTab === 'storage'}
              className={`billing-history-tab ${historyTab === 'storage' ? 'active' : ''}`}
              onClick={() => setHistoryTab('storage')}
            >
              <MdStorage size={16} aria-hidden />
              Storage ledger
              <span className="billing-history-tab-count">
                {storageHistoryPagination.total || storageHistory.length}
              </span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={historyTab === 'requests'}
              className={`billing-history-tab ${historyTab === 'requests' ? 'active' : ''}`}
              onClick={() => setHistoryTab('requests')}
            >
              <MdPendingActions size={16} aria-hidden />
              Upgrade requests
              <span className="billing-history-tab-count">
                {upgradeRequestsPagination.total || upgradeRequests.length}
              </span>
            </button>
          </div>

          <div role="tabpanel">
            {historyTab === 'credits' && renderCreditHistory()}
            {historyTab === 'storage' && renderStorageHistory()}
            {historyTab === 'requests' && renderUpgradeRequests()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BillingSettings
